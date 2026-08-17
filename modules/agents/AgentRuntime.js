const RUN_LIMIT = 120;
const APPROVAL_LIMIT = 80;

export class AgentRuntime {
  constructor({ state, save, applyAction, webSearch, onChange, now = () => new Date() }) {
    this.state = state;
    this.save = save;
    this.applyAction = applyAction;
    this.webSearch = webSearch;
    this.onChange = onChange || (() => {});
    this.now = now;
    this.timer = null;
    this.processing = false;
  }

  start() {
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 60_000);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  }

  async tick() {
    for (const agent of this.state.agents || []) {
      if (agent.status !== 'active' || agent.id === 'agent-jarvis') continue;
      if (this.isDue(agent)) this.enqueue(agent.id, 'schedule');
    }
    await this.drain();
  }

  isDue(agent) {
    if (agent.cadence === 'on_demand') return false;
    if (!agent.lastRunAt) return true;
    const elapsed = this.now().getTime() - new Date(agent.lastRunAt).getTime();
    const thresholds = { continuous: 30 * 60_000, daily: 20 * 60 * 60_000, twice_weekly: 3 * 24 * 60 * 60_000, weekly: 6 * 24 * 60 * 60_000 };
    return elapsed >= (thresholds[agent.cadence] || Infinity);
  }

  enqueue(agentId, trigger = 'manual', input = '') {
    const agent = this.agent(agentId);
    if (!agent) throw new Error('Agente nao encontrado.');
    const existing = (this.state.agentRuns || []).find(run => run.agentId === agentId && ['queued','running'].includes(run.status));
    if (existing) return existing;
    const run = {
      id: crypto.randomUUID(), agentId, agentName: agent.name, trigger, input,
      status: 'queued', queuedAt: this.now().toISOString(), startedAt: null,
      finishedAt: null, summary: '', details: [], actions: [], error: ''
    };
    this.state.agentRuns.unshift(run);
    this.trimAndSave();
    this.onChange();
    queueMicrotask(() => this.drain());
    return run;
  }

  async orchestrate(input = '') {
    const runs = [];
    for (const agent of this.state.agents || []) {
      if (agent.status === 'active' && agent.id !== 'agent-jarvis') runs.push(this.enqueue(agent.id, 'jarvis', input));
    }
    runs.push(this.enqueue('agent-jarvis', 'orchestration', input));
    await this.drain();
    return runs;
  }

  async drain() {
    if (this.processing) return;
    this.processing = true;
    try {
      let run = (this.state.agentRuns || []).slice().reverse().find(item => item.status === 'queued');
      while (run) {
        await this.execute(run);
        run = (this.state.agentRuns || []).slice().reverse().find(item => item.status === 'queued');
      }
    } finally {
      this.processing = false;
      this.onChange();
    }
  }

  async execute(run) {
    const agent = this.agent(run.agentId);
    if (!agent || agent.status !== 'active') {
      run.status = 'cancelled';
      run.error = agent ? 'Agente pausado antes da execucao.' : 'Agente removido.';
      run.finishedAt = this.now().toISOString();
      this.trimAndSave();
      return;
    }
    run.status = 'running';
    run.startedAt = this.now().toISOString();
    this.trimAndSave();
    this.onChange();
    try {
      const plan = await this.skill(agent, run);
      run.summary = plan.summary || 'Execucao concluida.';
      run.details = plan.details || [];
      const outcomes = [];
      for (const action of plan.actions || []) outcomes.push(await this.dispatch(agent, run, action));
      run.actions = outcomes;
      const pending = outcomes.some(outcome => outcome.status === 'awaiting_approval');
      run.status = pending ? 'awaiting_approval' : 'completed';
      run.finishedAt = pending ? null : this.now().toISOString();
      agent.lastRunAt = this.now().toISOString();
      agent.lastRunStatus = run.status;
      agent.lastRunSummary = run.summary;
    } catch (error) {
      run.status = 'failed';
      run.error = error?.message || String(error);
      run.finishedAt = this.now().toISOString();
      agent.lastRunAt = this.now().toISOString();
      agent.lastRunStatus = 'failed';
    }
    this.trimAndSave();
    this.onChange();
  }

  async dispatch(agent, run, action) {
    const sensitive = action.risk === 'high' || ['external_message','delete','transaction'].includes(action.type);
    const requiresApproval = agent.autonomy === 'supervised' || sensitive;
    if (requiresApproval) {
      const approval = {
        id: crypto.randomUUID(), runId: run.id, agentId: agent.id, agentName: agent.name,
        status: 'pending', title: action.label || action.type, description: action.description || '',
        action, createdAt: this.now().toISOString(), resolvedAt: null
      };
      this.state.agentApprovals.unshift(approval);
      return { action: action.type, status: 'awaiting_approval', approvalId: approval.id, label: approval.title };
    }
    const result = await this.applyAction(action, agent, run);
    return { action: action.type, status: result?.success === false ? 'failed' : 'completed', label: action.label || action.type, result };
  }

  async resolveApproval(id, decision) {
    const approval = (this.state.agentApprovals || []).find(item => item.id === id);
    if (!approval || approval.status !== 'pending') return { success: false, error: 'Aprovacao indisponivel.' };
    const run = (this.state.agentRuns || []).find(item => item.id === approval.runId);
    const agent = this.agent(approval.agentId);
    if (!agent) {
      approval.status = 'rejected'; approval.resolvedAt = this.now().toISOString();
      approval.result = { success: false, error: 'O agente foi removido antes da aprovacao.' };
      if (run) { run.status = 'cancelled'; run.finishedAt = this.now().toISOString(); }
      this.trimAndSave(); this.onChange();
      return { success: false, error: approval.result.error };
    }
    approval.status = decision === 'approve' ? 'approved' : 'rejected';
    approval.resolvedAt = this.now().toISOString();
    if (decision === 'approve') {
      const result = await this.applyAction(approval.action, agent, run);
      approval.result = result;
    }
    if (run) {
      const pending = (this.state.agentApprovals || []).some(item => item.runId === run.id && item.status === 'pending');
      if (!pending) {
        run.status = 'completed';
        run.finishedAt = this.now().toISOString();
      }
    }
    this.trimAndSave();
    this.onChange();
    return { success: true, approval };
  }

  async skill(agent, run) {
    if (agent.id === 'agent-atlas') return this.atlas(agent);
    if (agent.id === 'agent-scout') return this.scout(agent);
    if (agent.id === 'agent-closer') return this.closer(agent);
    if (agent.id === 'agent-ledger') return this.ledger(agent);
    if (agent.id === 'agent-jarvis') return this.jarvis(agent, run);
    return { summary: `${agent.name} revisou o workspace.`, details: ['Nenhuma habilidade especializada foi conectada ainda.'], actions: [] };
  }

  atlas() {
    const active = (this.state.projects || []).filter(project => !['Pausado','Lancado','Lançado'].includes(project.status));
    const actions = [];
    const details = [];
    for (const project of active) {
      const open = (this.state.tasks || []).filter(task => task.kind !== 'event' && task.col !== 'done' && task.project === project.name);
      const overdue = open.filter(task => task.due && task.due < this.date() && task.col !== 'done');
      details.push(`${project.name}: ${open.length} tarefa(s) aberta(s), ${overdue.length} atrasada(s), ${Number(project.progress || 0)}% concluido.`);
      if (!open.length) actions.push({ type: 'create_task', label: `Criar proxima acao para ${project.name}`, description: 'Projeto ativo sem tarefa aberta.', payload: { title: `Definir proxima acao - ${project.name}`, project: project.name, priority: project.priority || 'Media', col: 'today' } });
    }
    return { summary: `Atlas revisou ${active.length} projeto(s) e encontrou ${actions.length} projeto(s) sem proxima acao.`, details, actions };
  }

  async scout() {
    const projects = (this.state.projects || []).filter(project => !['Pausado'].includes(project.status)).slice(0, 4);
    const names = projects.map(project => project.name).join(', ');
    if (!names) return { summary: 'Scout nao encontrou projetos ativos para pesquisar.', details: [], actions: [] };
    const query = `tendencias, concorrentes e oportunidades de mercado no Brasil relacionadas a ${names}`;
    const result = await this.webSearch({ query, max_results: 6, search_depth: 'advanced' });
    if (!result?.success) throw new Error(result?.error || 'Pesquisa web indisponivel.');
    const sources = (result.results || []).slice(0, 6);
    const content = [`# Radar de mercado`, '', `Pesquisa: ${query}`, '', result.answer || 'Principais sinais encontrados:', '', ...sources.map(item => `- **${item.title}** - ${item.snippet || ''}\n  ${item.url}`)].join('\n');
    return {
      summary: `Scout pesquisou ${sources.length} fonte(s) para os projetos ativos.`,
      details: sources.slice(0, 4).map(item => item.title),
      actions: [{ type: 'create_note', label: 'Salvar radar de mercado', description: 'Nota com fontes verificaveis da pesquisa.', payload: { name: `Radar de mercado - ${this.date()}`, content } }]
    };
  }

  closer() {
    const contacts = (this.state.contacts || []).filter(contact => contact.status && !/fechado|perdido/i.test(contact.status));
    const actions = [];
    const details = [];
    for (const contact of contacts.slice(0, 8)) {
      const next = contact.nextStep || 'Definir proximo contato';
      const exists = (this.state.tasks || []).some(task => task.col !== 'done' && (task.title || '').toLowerCase().includes((contact.name || '').toLowerCase()));
      details.push(`${contact.name}: ${next}${exists ? ' (ja acompanhado)' : ''}.`);
      if (!exists) actions.push({ type: 'create_task', label: `Criar follow-up de ${contact.name}`, description: next, payload: { title: `${next} - ${contact.name}`, project: '', priority: 'Alta', col: 'today' } });
    }
    return { summary: `Closer revisou ${contacts.length} contato(s) e preparou ${actions.length} follow-up(s).`, details, actions };
  }

  ledger() {
    const month = this.date().slice(0, 7);
    const transactions = (this.state.transactions || []).filter(item => String(item.date || '').startsWith(month));
    const income = transactions.filter(item => item.type === 'Receita').reduce((sum, item) => sum + Number(item.value || 0), 0);
    const expense = transactions.filter(item => item.type === 'Despesa').reduce((sum, item) => sum + Number(item.value || 0), 0);
    const balance = income - expense;
    const currency = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const content = `# Fechamento financeiro - ${month}\n\n- Receitas: **${currency(income)}**\n- Despesas: **${currency(expense)}**\n- Saldo: **${currency(balance)}**\n- Lancamentos analisados: **${transactions.length}**\n\n> Preparado pelo Ledger. Revise antes de usar para decisoes financeiras.`;
    return {
      summary: `Ledger analisou ${transactions.length} lancamento(s). Saldo do mes: ${currency(balance)}.`,
      details: [`Receitas: ${currency(income)}`, `Despesas: ${currency(expense)}`, `Saldo: ${currency(balance)}`],
      actions: [{ type: 'create_note', label: `Salvar fechamento de ${month}`, description: 'O Ledger e supervisionado; a nota so sera criada apos sua aprovacao.', payload: { name: `Fechamento financeiro - ${month}`, content } }]
    };
  }

  jarvis() {
    const latest = (this.state.agentRuns || []).filter(run => run.agentId !== 'agent-jarvis' && ['completed','awaiting_approval','failed'].includes(run.status)).slice(0, 6);
    const pending = (this.state.agentApprovals || []).filter(item => item.status === 'pending');
    const overdue = (this.state.tasks || []).filter(task => task.kind !== 'event' && task.col !== 'done' && task.due && task.due < this.date());
    return {
      summary: `Jarvis coordenou a equipe: ${latest.length} relatorio(s), ${pending.length} aprovacao(oes) e ${overdue.length} tarefa(s) atrasada(s).`,
      details: latest.map(run => `${run.agentName}: ${run.summary || run.error}`), actions: []
    };
  }

  agent(id) { return (this.state.agents || []).find(agent => agent.id === id); }
  date() { return this.now().toISOString().slice(0, 10); }
  trimAndSave() {
    this.state.agentRuns = (this.state.agentRuns || []).slice(0, RUN_LIMIT);
    this.state.agentApprovals = (this.state.agentApprovals || []).slice(0, APPROVAL_LIMIT);
    this.save({ agents: this.state.agents, agentRuns: this.state.agentRuns, agentApprovals: this.state.agentApprovals });
  }
}
