const TYPE_KEYWORDS = [
  ['roadmap', ['roadmap', 'cronograma', 'marcos']],
  ['architecture', ['arquitetura', 'backend', 'frontend', 'cloud', 'api', 'banco', 'saas', 'aplicativo']],
  ['flowchart', ['fluxo', 'processo', 'pipeline', 'ci/cd', 'jornada', 'decisão', 'decisao']],
  ['mindmap', ['mapa mental', 'estudo', 'brainstorm', 'ideia']],
  ['grid', ['checklist', 'organograma', 'estrutura de projeto', 'uml', 'erd']]
];

export class CommandManager {
  constructor(bus) {
    this.bus = bus;
    this.clipboard = [];
    bus.handle('command:execute', command => this.execute(command));
    bus.handle('ai:generate', input => this.generate(input));
  }

  execute(command = {}) {
    const before = this.bus.request('document:get');
    const action = command.action;
    let result;
    if (action === 'generate') result = this.generate(command.input || command.context || 'Novo diagrama');
    else if (action === 'addNode') result = this.addNode(command.node);
    else if (action === 'updateNode') result = this.bus.request('nodes:update', { id: command.id, patch: command.patch });
    else if (action === 'moveNode') result = this.bus.request('nodes:update', { id: command.id, patch: { x: command.x, y: command.y } });
    else if (action === 'delete') result = this.bus.request('nodes:remove', command.ids || this.bus.request('selection:get'));
    else if (action === 'connect') result = this.bus.request('edges:add', command.edge);
    else if (action === 'group') result = this.bus.request('nodes:group', command.ids || this.bus.request('selection:get'));
    else if (action === 'ungroup') result = this.bus.request('nodes:ungroup', command.ids || this.bus.request('selection:get'));
    else if (action === 'copy') result = this.copy(command.ids || this.bus.request('selection:get'));
    else if (action === 'paste') result = this.paste();
    else if (action === 'duplicate') { this.copy(command.ids || this.bus.request('selection:get')); result = this.paste(); }
    else if (action === 'autoLayout') result = this.autoLayout(command.layout);
    else if (action === 'align') result = this.align(command.axis || 'y');
    else if (action === 'undo') return this.bus.request('history:undo');
    else if (action === 'redo') return this.bus.request('history:redo');
    else if (action === 'clear') result = this.replaceDocument({ title: 'Canvas sem título', type: 'blank', nodes: [], connections: [] });
    else throw new Error(`Comando não suportado: ${action}`);

    const after = this.bus.request('document:get');
    if (!['copy'].includes(action)) this.bus.request('history:push', { before, after, label: command.label || action, at: Date.now() });
    this.bus.emit('command:committed', { command, result });
    return result;
  }

  generate(input) {
    const structure = typeof input === 'object' ? input : this.parseInput(input);
    if (structure.incremental) return this.applyIncrement(structure);
    return this.replaceDocument(structure);
  }

  parseInput(input) {
    const source = String(input || '').trim();
    if (source.startsWith('{')) return JSON.parse(source);
    const text = source.toLowerCase();
    if (/^(adicione|adicionar|inclua|incluir|acrescente)/.test(text) && this.bus.request('nodes:list').length) {
      return { incremental: true, title: source.replace(/^(adicione|adicionar|inclua|incluir|acrescente)\s+/i, '') };
    }
    const type = TYPE_KEYWORDS.find(([, words]) => words.some(word => text.includes(word)))?.[0] || 'mindmap';
    return this.template(type, source);
  }

  template(type, subject) {
    const title = subject.replace(/^(crie|gere|faça|monte|desenhe)\s+(um|uma)?\s*/i, '').slice(0, 80) || 'Nova estrutura';
    const presets = {
      architecture: ['Experiência', 'Frontend', 'API Gateway', 'Serviços', 'Dados', 'Observabilidade'],
      flowchart: ['Entrada', 'Analisar contexto', 'Tomar decisão', 'Executar ação', 'Validar resultado', 'Concluir'],
      roadmap: ['Descoberta', 'MVP', 'Validação', 'Crescimento', 'Escala'],
      grid: ['Objetivo', 'Responsáveis', 'Entregáveis', 'Dependências', 'Riscos', 'Próximos passos'],
      mindmap: ['Problema', 'Usuários', 'Solução', 'Recursos', 'Métricas', 'Próximas ações']
    };
    const labels = presets[type] || presets.mindmap;
    const root = { id: 'root', type: 'title', title, accent: '#2563eb' };
    const nodes = [root, ...labels.map((label, index) => ({ id: `n${index + 1}`, type: this.nodeType(type, label), title: label, content: this.contentFor(label), accent: this.accent(index) }))];
    const connections = labels.map((_, index) => ({ id: `e${index + 1}`, from: type === 'roadmap' && index ? `n${index}` : 'root', to: `n${index + 1}`, label: type === 'roadmap' ? `${index + 1}` : '' }));
    return { type, title, nodes, connections };
  }

  nodeType(type, label) {
    if (type === 'architecture') {
      if (/api/i.test(label)) return 'api';
      if (/dados/i.test(label)) return 'database';
      if (/serviço/i.test(label)) return 'server';
    }
    if (type === 'flowchart' && /decisão/i.test(label)) return 'decision';
    if (type === 'roadmap') return 'milestone';
    return 'box';
  }

  contentFor(label) {
    const detail = {
      Problema: 'Definir a dor central e seu impacto.', Usuários: 'Mapear perfis, necessidades e contexto.',
      Solução: 'Estruturar a proposta de valor principal.', Recursos: 'Priorizar capacidades essenciais.',
      Métricas: 'Definir sinais claros de sucesso.', 'Próximas ações': 'Converter decisões em execução.'
    };
    return detail[label] || 'Detalhes editáveis deste bloco.';
  }

  replaceDocument(structure) {
    const nodes = Array.isArray(structure.nodes) ? structure.nodes : [];
    const edges = Array.isArray(structure.connections) ? structure.connections : (structure.edges || []);
    const laidOut = this.bus.request('layout:calculate', { nodes, edges, type: structure.type || 'flowchart' });
    this.bus.request('nodes:replace', laidOut);
    this.bus.request('edges:replace', edges);
    this.bus.emit('document:meta', { title: structure.title || 'Canvas sem título', type: structure.type || 'custom' });
    this.bus.emit('viewport:fit');
    return { nodes: laidOut, edges };
  }

  applyIncrement(structure) {
    const selected = this.bus.request('selection:get')[0];
    const nodes = this.bus.request('nodes:list');
    const anchor = this.bus.request('nodes:get', selected) || nodes[nodes.length - 1];
    const node = this.addNode({ type: 'box', title: structure.title || 'Novo bloco', content: 'Adicionado pelo Jarvis.', x: (anchor?.x || 0) + 300, y: anchor?.y || 0, accent: '#2563eb' });
    if (anchor) this.bus.request('edges:add', { from: anchor.id, to: node.id });
    this.bus.request('selection:set', [node.id]);
    this.bus.emit('viewport:focus', node.id);
    return node;
  }

  addNode(node = {}) {
    const viewport = this.bus.request('viewport:center');
    return this.bus.request('nodes:add', { x: viewport.x, y: viewport.y, ...node });
  }

  autoLayout(layout = 'flowchart') {
    const nodes = this.bus.request('layout:calculate', { nodes: this.bus.request('nodes:list'), edges: this.bus.request('edges:list'), type: layout });
    this.bus.request('nodes:replace', nodes);
    this.bus.emit('viewport:fit');
    return nodes;
  }

  align(axis) {
    const ids = this.bus.request('selection:get');
    const nodes = ids.map(id => this.bus.request('nodes:get', id)).filter(Boolean);
    if (nodes.length < 2) return;
    const average = nodes.reduce((sum, node) => sum + node[axis], 0) / nodes.length;
    nodes.forEach(node => this.bus.request('nodes:update', { id: node.id, patch: { [axis]: average } }));
  }

  copy(ids) {
    this.clipboard = ids.map(id => this.bus.request('nodes:get', id)).filter(Boolean).map(node => ({ ...node }));
    return this.clipboard.length;
  }

  paste() {
    const pasted = this.clipboard.map(node => this.bus.request('nodes:add', { ...node, id: undefined, x: node.x + 32, y: node.y + 32, title: `${node.title} cópia` }));
    this.bus.request('selection:set', pasted.map(node => node.id));
    return pasted;
  }

  accent(index) { return ['#2563eb', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][index % 6]; }
}
