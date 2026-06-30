/* ====================================================
   MOTION HUB — script.js
   ==================================================== */

/* ===== STATE ===== */
const S = {
  section: 'dashboard',
  projects: [],
  tasks: [],
  ideas: [],
  contacts: [],
  transactions: [],
  docs: [],
  habits: [],
  goals: [],
  reviews: [],
  notes: [],
  profiles: {},
  modalSave: null,
  confirmOk: null,
  projectFilter: 'all',
  promptFilter: 'all',
  finFilter: 'all'
};
let _krCounter = 0;
let _selectedMood = 3;
let projectRhythmInterval = null;
let projectRhythmAlertOpen = false;

/* ===== LOCAL STORAGE ===== */
const STORAGE_KEY = 'motion_hub_data_v1';
const PROJECT_RHYTHM_KEY = 'motion_project_rhythm_v1';
const ACCESS_PASSWORD = '@Vitor0911071234';
const ACCESS_SESSION_KEY = 'motion_hub_access_ok_v1';
const DATA_FIELDS = ['projects', 'tasks', 'ideas', 'contacts', 'transactions', 'docs', 'habits', 'goals', 'reviews', 'notes'];
let currentUserId   = 'vitor';
let currentUserName = 'Vitor';
let currentUserColor = '#6366f1';

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Local storage read error:', e);
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage write error:', e);
    toast?.('Não foi possível salvar no navegador.', 'error');
  }
}

function getStoredData() {
  return readStore(STORAGE_KEY, {});
}

async function syncData(updates) {
  const data = { ...getStoredData(), ...updates };
  writeStore(STORAGE_KEY, data);
}

async function loadAll() {
  const data = getStoredData();
  if (data) {
    DATA_FIELDS.forEach(field => { S[field] = data[field] || []; });
  }
  return data;
}

async function loadProfiles() {
  S.profiles = {
    vitor: {
      id: 'vitor',
      display_name: 'Vitor',
      avatar_color: currentUserColor
    }
  };
}

function ownerBadge(item) {
  if (!item.owner_name) return '';
  const profile = item.owner_id ? S.profiles[item.owner_id] : null;
  const color = profile?.avatar_color || currentUserColor;
  return `<span class="owner-badge" style="background:${color}22;color:${color};border:1px solid ${color}44"><i class='bx bx-user'></i>${escHtml(item.owner_name)}</span>`;
}
function saveProjects()     { syncData({ projects:     S.projects }); }
function saveTasks()        { syncData({ tasks:        S.tasks }); }
function saveIdeas()        { syncData({ ideas:        S.ideas }); }
function saveContacts()     { syncData({ contacts:     S.contacts }); }
function saveTransactions() { syncData({ transactions: S.transactions }); }
function saveDocs()         { syncData({ docs:         S.docs }); }
function saveHabits()       { syncData({ habits:       S.habits }); }
function saveGoals()        { syncData({ goals:        S.goals }); }
function saveReviews()      { syncData({ reviews:      S.reviews }); }
function saveNotes()        { syncData({ notes:        S.notes }); }

/* ===== IDs ===== */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ===== SEED DATA ===== */
function seedIfEmpty(existingData) {
  if (existingData && existingData.seeded) return;
  S.projects = [
      { id: uid(), name: 'Cotai', desc: 'SaaS de cotação inteligente para materiais de construção.', status: 'Em desenvolvimento', priority: 'Alta', progress: 70, createdAt: '2025-01-15' },
      { id: uid(), name: 'Simplifique', desc: 'Plataforma de BPO financeiro e assessoria para pequenos negócios.', status: 'Validação', priority: 'Média', progress: 35, createdAt: '2025-02-10' },
      { id: uid(), name: 'VidaPet', desc: 'Plataforma de alimentação natural para pets.', status: 'Ideia', priority: 'Média', progress: 10, createdAt: '2025-03-01' },
      { id: uid(), name: 'Motion Hub', desc: 'Hub pessoal para organizar projetos, tarefas, ideias e execução.', status: 'Em desenvolvimento', priority: 'Alta', progress: 20, createdAt: '2025-05-01' }
    ];
    S.tasks = [
      { id: uid(), title: 'Refinar dashboard do Cotai', project: 'Cotai', priority: 'Alta', due: '2025-05-25', col: 'inprogress' },
      { id: uid(), title: 'Criar lista de fornecedores', project: 'Cotai', priority: 'Média', due: '2025-05-28', col: 'today' },
      { id: uid(), title: 'Organizar ideias de novos SaaS', project: 'Motion Hub', priority: 'Baixa', due: '', col: 'backlog' },
      { id: uid(), title: 'Criar primeira versão do Motion Hub', project: 'Motion Hub', priority: 'Alta', due: '2025-06-01', col: 'inprogress' },
      { id: uid(), title: 'Mapear concorrentes do Simplifique', project: 'Simplifique', priority: 'Média', due: '2025-05-30', col: 'today' },
      { id: uid(), title: 'Pesquisar mercado pet alimentação natural', project: 'VidaPet', priority: 'Baixa', due: '', col: 'backlog' }
    ];
    S.ideas = [
      { id: uid(), name: 'Consultoria fiscal automatizada', problem: 'Complexidade da Reforma Tributária para PMEs', audience: 'Pequenas e médias empresas', monetization: 'SaaS mensal + consultoria', potential: 'Alto', status: 'Em análise', notes: 'Oportunidade gerada pela Reforma Tributária 2024.' },
      { id: uid(), name: 'Plataforma para clínicas', problem: 'Gestão fragmentada de agendas, pacientes e financeiro', audience: 'Clínicas médicas e odontológicas', monetization: 'SaaS mensal por profissional', potential: 'Alto', status: 'Guardada', notes: 'Verificar regulamentações do CFM.' },
      { id: uid(), name: 'Sistema para advogados', problem: 'Controle de processos, clientes e prazos é manual', audience: 'Escritórios de advocacia pequenos', monetization: 'SaaS + módulo de documentos', potential: 'Médio', status: 'Guardada', notes: 'Nicho com baixa digitalização.' },
      { id: uid(), name: 'Marketplace de materiais de construção', problem: 'Cotação de preços descentralizada e demorada', audience: 'Construtoras e empreiteiros', monetization: 'Comissão por venda + plano fornecedor', potential: 'Alto', status: 'Validando', notes: 'Extensão natural do Cotai.' }
    ];
    S.contacts = [
      { id: uid(), name: 'Carlos Andrade', type: 'Cliente', company: 'Construtora Alpha', contact: 'carlos@alpha.com', status: 'Em conversa', nextStep: 'Enviar proposta comercial', notes: 'Interessado no plano enterprise do Cotai.' },
      { id: uid(), name: 'Mariana Souza', type: 'Parceiro', company: 'Hub Digital', contact: '(11) 99999-1234', status: 'Reunião marcada', nextStep: 'Reunião dia 22/05 às 14h', notes: 'Possível parceria para distribuição.' },
      { id: uid(), name: 'Felipe Lima', type: 'Lead', company: 'Auto-Peças Irmãos Lima', contact: 'felipe@limapeças.com', status: 'Novo', nextStep: 'Fazer primeiro contato', notes: 'Veio via indicação de Carlos Andrade.' }
    ];
    S.transactions = [
      { id: uid(), type: 'Receita', desc: 'Consultoria Cotai — Construtora Alpha', value: 2500, project: 'Cotai', date: '2025-05-10' },
      { id: uid(), type: 'Despesa', desc: 'Hospedagem AWS (mensal)', value: 180, project: 'Cotai', date: '2025-05-01' },
      { id: uid(), type: 'Despesa', desc: 'Ferramentas SaaS (Figma, Linear, Notion)', value: 95, project: 'Motion Hub', date: '2025-05-01' },
      { id: uid(), type: 'Receita', desc: 'Venda curso online', value: 497, project: 'Simplifique', date: '2025-05-12' },
      { id: uid(), type: 'Despesa', desc: 'Tráfego pago Meta Ads', value: 350, project: 'Simplifique', date: '2025-05-05' }
    ];
    S.docs = [
      { id: uid(), title: 'Prompt de copywriting para landing page', category: 'Prompt', content: 'Você é um copywriter especialista em SaaS B2B. Crie uma headline e subheadline poderosas para uma landing page de [PRODUTO] voltado para [PÚBLICO-ALVO]. A headline deve gerar curiosidade e focar no benefício principal. A subheadline deve complementar e clarificar a proposta de valor.', project: 'Cotai', date: '2025-05-08' },
      { id: uid(), title: 'Script de abordagem via WhatsApp', category: 'Script', content: 'Olá, [NOME]! Tudo bem?\n\nSou o Vitor, fundador do Cotai. Vi que sua empresa atua no setor de construção civil e queria apresentar uma solução que pode reduzir o tempo de cotação de materiais em até 70%.\n\nPoderia conversar 15 minutos esta semana?', project: 'Cotai', date: '2025-05-10' },
      { id: uid(), title: 'Estratégia de lançamento do Simplifique', category: 'Estratégia', content: 'Fase 1 (Mês 1-2): Validação com 10 clientes beta gratuitos.\nFase 2 (Mês 3): Lançamento com preço fundador para os primeiros 50 clientes.\nFase 3 (Mês 4+): Escala via tráfego pago e parcerias com contadores.', project: 'Simplifique', date: '2025-04-20' }
    ];
  saveProjects(); saveTasks(); saveIdeas(); saveContacts(); saveTransactions(); saveDocs();
  syncData({ seeded: true });
}

/* ===== SEED V2 (hábitos, metas, revisão) ===== */
function seedV2(existingData) {
  if (existingData && existingData.seeded_v2) return;
  const d = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  const today = d(0);

  S.habits = [
    { id: uid(), name: 'Leitura 30 min', category: 'Desenvolvimento', icon: 'bx-book-open',
      completions: [d(1), d(2), d(3), d(4), d(5), d(6), d(8), d(9), d(10), d(11)] },
    { id: uid(), name: 'Exercício físico', category: 'Saúde', icon: 'bx-run',
      completions: [today, d(1), d(3), d(5), d(6), d(8), d(10)] },
    { id: uid(), name: 'Revisão do dia', category: 'Foco', icon: 'bx-check-double',
      completions: [today, d(1), d(2), d(3), d(4), d(5), d(6), d(7), d(8), d(9), d(10), d(11), d(12)] },
    { id: uid(), name: 'Prospectar 2 leads', category: 'Negócio', icon: 'bx-phone-call',
      completions: [d(1), d(2), d(4), d(7), d(9)] },
    { id: uid(), name: 'Meditação 10 min', category: 'Bem-estar', icon: 'bx-brain',
      completions: [d(1), d(2), d(3), d(5), d(8)] }
  ];

  S.goals = [
    {
      id: uid(),
      objective: 'Validar o Cotai comercialmente',
      quarter: 'Q2 2025',
      status: 'No prazo',
      keyResults: [
        { id: uid(), desc: 'Fechar 5 clientes beta pagantes', current: 2, target: 5, unit: 'clientes' },
        { id: uid(), desc: 'Coletar 20 feedbacks de produto', current: 8, target: 20, unit: 'feedbacks' },
        { id: uid(), desc: 'Atingir R$3.000 em receita recorrente', current: 2500, target: 3000, unit: 'R$' }
      ]
    },
    {
      id: uid(),
      objective: 'Estruturar a operação dos projetos',
      quarter: 'Q2 2025',
      status: 'Em risco',
      keyResults: [
        { id: uid(), desc: 'Documentar 3 processos-chave', current: 1, target: 3, unit: 'docs' },
        { id: uid(), desc: 'Automatizar 2 tarefas repetitivas', current: 0, target: 2, unit: 'automações' },
        { id: uid(), desc: 'Onboarding de 1 colaborador novo', current: 0, target: 1, unit: 'pessoa' }
      ]
    },
    {
      id: uid(),
      objective: 'Lançar o Simplifique para o mercado',
      quarter: 'Q3 2025',
      status: 'No prazo',
      keyResults: [
        { id: uid(), desc: 'Finalizar MVP do produto', current: 35, target: 100, unit: '%' },
        { id: uid(), desc: 'Conquistar 20 clientes no lançamento', current: 0, target: 20, unit: 'clientes' }
      ]
    }
  ];

  const ws = getWeekStart(new Date(Date.now() - 7 * 86400000));
  S.reviews = [
    {
      id: uid(),
      weekOf: ws,
      mood: 4,
      advances: 'Finalizei o MVP do Motion Hub e iniciei os testes internos. Avancei 2 reuniões comerciais do Cotai e recebi feedback positivo de um cliente potencial.',
      blockers: 'Reuniões excessivas que atrasaram blocos de desenvolvimento. Dificuldade de manter foco no período da tarde.',
      learnings: 'Preciso bloquear períodos de foco antes que outros compromissos tomem o espaço. Pomodoro 50/10 funciona melhor do que 25/5 pra mim.',
      nextFocus: 'Fechar o primeiro cliente pagante do Cotai. Avançar no módulo financeiro do Motion Hub. Mapear os processos de onboarding do Simplifique.',
      createdAt: d(0)
    }
  ];

  saveHabits();
  saveGoals();
  saveReviews();
  syncData({ seeded_v2: true });
}

/* ===== SEED NOTES ===== */
function seedNotes(existingData) {
  if (existingData && existingData.seeded_notes) return;
  const f1 = uid(), f2 = uid();
  S.notes = [
    { id: f1,    type: 'folder', name: 'Projetos',   parentId: null,  createdAt: new Date().toISOString() },
    { id: f2,    type: 'folder', name: 'Pessoal',    parentId: null,  createdAt: new Date().toISOString() },
    { id: uid(), type: 'note',   name: 'Cotai — Roadmap', parentId: f1, content: '# Cotai — Roadmap\n\n## Próximas features\n\n- [ ] Dashboard de analytics\n- [ ] Integração com fornecedores\n- [x] MVP de cotação\n\n## Notas de produto\n\n> Foco em reduzir o tempo de cotação de materiais para construtoras.\n\n**Prioridade:** validar com 5 clientes beta até fim do mês.', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: uid(), type: 'note',   name: 'Simplifique — Ideias', parentId: f1, content: '# Simplifique\n\n## Diferenciais vs concorrentes\n\n- Onboarding em menos de 10 minutos\n- Suporte humanizado incluso\n- Integração com contadores\n\n## Público-alvo\n\nPequenas empresas com faturamento entre R$ 50k e R$ 500k/mês.', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: uid(), type: 'note',   name: 'Leituras recomendadas', parentId: f2, content: '# Leituras\n\n## Negócio\n\n- **Zero to One** — Peter Thiel\n- **The Mom Test** — Rob Fitzpatrick\n- **Obviously Awesome** — April Dunford\n\n## Tecnologia\n\n- **Clean Code** — Robert Martin\n- **The Pragmatic Programmer**\n\n---\n\n*Atualizar conforme for lendo.*', updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() }
  ];
  saveNotes();
  syncData({ seeded_notes: true });
}

/* ===== NAVIGATION ===== */
const sectionMeta = {
  dashboard:  { label: 'Dashboard',        btnLabel: null },
  jarvis:     { label: 'Jarvis',           btnLabel: null },
  agenda:     { label: 'Agenda',           btnLabel: 'Nova Tarefa' },
  projects:   { label: 'Projetos',          btnLabel: 'Novo Projeto' },
  tasks:      { label: 'Tarefas',           btnLabel: 'Nova Tarefa' },
  habits:     { label: 'Hábitos',           btnLabel: 'Novo Hábito' },
  ideas:      { label: 'Ideias',            btnLabel: 'Nova Ideia' },
  goals:      { label: 'Metas & OKRs',      btnLabel: 'Nova Meta' },
  crm:        { label: 'CRM',               btnLabel: 'Novo Contato' },
  financial:  { label: 'Financeiro',        btnLabel: 'Novo Lançamento' },
  review:     { label: 'Revisão Semanal',   btnLabel: 'Nova Revisão' },
  prompts:    { label: 'Prompts & Docs',    btnLabel: 'Novo Documento' },
  notes:      { label: 'Notas',             btnLabel: null }
};

const sectionOrder = ['dashboard', 'projects', 'tasks', 'habits', 'agenda', 'jarvis', 'ideas', 'goals', 'crm', 'financial', 'review', 'prompts', 'notes'];

function navigateTo(section, direction = null) {
  const contentArea = document.querySelector('.content-area');
  if (direction && contentArea) {
    contentArea.classList.remove('nav-slide-left', 'nav-slide-right');
    void contentArea.offsetWidth;
    contentArea.classList.add(direction === 'next' ? 'nav-slide-left' : 'nav-slide-right');
    window.setTimeout(() => contentArea.classList.remove('nav-slide-left', 'nav-slide-right'), 420);
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('section-' + section);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (navItem) navItem.classList.add('active');
  S.section = section;
  const meta = sectionMeta[section];
  document.getElementById('pageBreadcrumb').textContent = meta.label;
  const btn = document.getElementById('primaryBtn');
  const btnLabel = document.getElementById('primaryBtnLabel');
  if (meta.btnLabel) {
    btn.style.display = '';
    btnLabel.textContent = meta.btnLabel;
  } else {
    btn.style.display = 'none';
  }
  renderSection(section);
  updateNotifBadge();
}

function navigateByShortcut(direction) {
  const currentIndex = sectionOrder.indexOf(S.section);
  if (currentIndex === -1) return;
  const offset = direction === 'next' ? 1 : -1;
  const nextIndex = (currentIndex + offset + sectionOrder.length) % sectionOrder.length;
  navigateTo(sectionOrder[nextIndex], direction);
}

function renderSection(section) {
  if (section === 'agenda') renderAgenda();
  else if (section === 'jarvis') renderJarvisPage();
  else if (section === 'dashboard') renderDashboard();
  else if (section === 'projects') renderProjects();
  else if (section === 'tasks') renderKanban();
  else if (section === 'habits') renderHabits();
  else if (section === 'ideas') renderIdeas();
  else if (section === 'goals') renderGoals();
  else if (section === 'crm') renderCRM();
  else if (section === 'financial') renderFinancial();
  else if (section === 'review') renderReview();
  else if (section === 'prompts') renderPrompts();
  else if (section === 'notes') renderNotesTree();
}

/* ===== TOAST ===== */
function toast(msg, type = 'success') {
  const icons = { success: 'bx-check-circle', error: 'bx-error-circle', info: 'bx-info-circle' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class='bx ${icons[type]}'></i><span>${msg}</span>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, 2800);
}

/* ===== MODAL ===== */
function openModal(title, bodyHTML, onSave) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalCancel').textContent = 'Cancelar';
  document.getElementById('modalSave').innerHTML = 'Salvar';
  document.getElementById('modalOverlay').classList.add('open');
  S.modalSave = onSave;
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  S.modalSave = null;
  projectRhythmAlertOpen = false;
}

/* ===== CONFIRM ===== */
function openConfirm(onOk) {
  document.getElementById('confirmOverlay').classList.add('open');
  S.confirmOk = onOk;
}
function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');
  S.confirmOk = null;
}

/* ===== HELPERS ===== */
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}
function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
function statusClass(status) {
  const map = {
    'Em desenvolvimento': 'status-blue', 'Ideia': 'status-gray', 'Validação': 'status-amber',
    'Lançado': 'status-green', 'Pausado': 'status-red',
    'Guardada': 'status-gray', 'Em análise': 'status-blue', 'Validando': 'status-amber',
    'Aprovada': 'status-green', 'Descartada': 'status-red',
    'Novo': 'status-gray', 'Contatado': 'status-blue', 'Em conversa': 'status-amber',
    'Reunião marcada': 'status-purple', 'Fechado': 'status-green', 'Perdido': 'status-red',
    'Semana ativa': 'status-green'
  };
  return map[status] || 'status-gray';
}
function prioClass(p) {
  if (p === 'Alta') return 'prio-high';
  if (p === 'Média') return 'prio-medium';
  return 'prio-low';
}
function potentialClass(p) {
  if (p === 'Alto') return 'badge-green';
  if (p === 'Médio') return 'badge-amber';
  return 'badge-gray';
}
function projDot(status) {
  const c = { 'Em desenvolvimento': '#2563EB', 'Ideia': '#545D70', 'Validação': '#F5A623', 'Lançado': '#22C55E', 'Pausado': '#FF4757' };
  return c[status] || '#545D70';
}
function getProjectNames() { return S.projects.map(p => p.name); }

/* ===== PROJECT RHYTHM ===== */
function rhythmProjectArg(name) {
  return String(name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function defaultProjectRhythm() {
  const activeNames = S.projects.filter(p => p.status !== 'Pausado').map(p => p.name);
  return {
    activeProject: activeNames[0] || '',
    timer: {
      project: activeNames[0] || '',
      durationMin: 45,
      remainingSec: 45 * 60,
      running: false,
      endsAt: null,
      startedAt: null,
      notified: false
    },
    sessions: [],
    plans: activeNames.map((name, index) => ({
      project: name,
      start: `${String(9 + index).padStart(2, '0')}:00`,
      minutes: index === 0 ? 60 : 45,
      enabled: true
    }))
  };
}

function getProjectRhythm() {
  const stored = readStore(PROJECT_RHYTHM_KEY, null);
  const rhythm = stored || defaultProjectRhythm();
  const projectNames = getProjectNames();
  const existingPlans = Array.isArray(rhythm.plans) ? rhythm.plans : [];
  rhythm.plans = projectNames.map((name, index) => {
    const found = existingPlans.find(p => p.project === name);
    return found || {
      project: name,
      start: `${String(9 + index).padStart(2, '0')}:00`,
      minutes: index === 0 ? 60 : 45,
      enabled: true
    };
  });
  if (!rhythm.activeProject || !projectNames.includes(rhythm.activeProject)) rhythm.activeProject = rhythm.plans[0]?.project || '';
  if (!rhythm.timer) rhythm.timer = defaultProjectRhythm().timer;
  if (!rhythm.timer.project || !projectNames.includes(rhythm.timer.project)) rhythm.timer.project = rhythm.activeProject;
  if (!Array.isArray(rhythm.sessions)) rhythm.sessions = [];
  return rhythm;
}

function saveProjectRhythm(rhythm) {
  writeStore(PROJECT_RHYTHM_KEY, rhythm);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function recordProjectTime(rhythm, project, seconds, reason = 'manual') {
  const safeSeconds = Math.floor(Number(seconds || 0));
  if (!project || safeSeconds < 60) return;
  rhythm.sessions = Array.isArray(rhythm.sessions) ? rhythm.sessions : [];
  rhythm.sessions.push({
    id: uid(),
    project,
    seconds: safeSeconds,
    minutes: Math.round(safeSeconds / 60),
    reason,
    date: todayKey(),
    endedAt: new Date().toISOString()
  });
  rhythm.sessions = rhythm.sessions.slice(-250);
}

function recordRunningTimerIfNeeded(rhythm, reason = 'manual') {
  const timer = rhythm.timer;
  if (!timer?.running || !timer.endsAt || timer.logged) return;
  const durationSec = Math.max(1, Number(timer.durationMin || 45) * 60);
  const remainingSec = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
  const elapsedSec = Math.max(0, durationSec - remainingSec);
  recordProjectTime(rhythm, timer.project, elapsedSec, reason);
  timer.logged = true;
}

function getProjectTimeSummary(rhythm) {
  const today = todayKey();
  const sessions = (rhythm.sessions || []).filter(s => s.date === today);
  const byProject = {};
  sessions.forEach(s => {
    byProject[s.project] = (byProject[s.project] || 0) + Number(s.seconds || 0);
  });
  const totalSec = Object.values(byProject).reduce((sum, sec) => sum + sec, 0);
  return { sessions, byProject, totalSec };
}

function formatWorkTime(seconds) {
  const min = Math.round(Number(seconds || 0) / 60);
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function formatTimer(sec) {
  const safe = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getSuggestedPlan(rhythm) {
  const enabled = rhythm.plans.filter(p => p.enabled);
  if (!enabled.length) return rhythm.plans[0] || null;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const upcoming = enabled
    .map(p => {
      const [h, m] = String(p.start || '09:00').split(':').map(Number);
      return { ...p, sortMin: (h || 0) * 60 + (m || 0) };
    })
    .sort((a, b) => a.sortMin - b.sortMin);
  return upcoming.find(p => p.sortMin >= current) || upcoming[0];
}

function startProjectTimer(projectName, minutes) {
  const rhythm = getProjectRhythm();
  recordRunningTimerIfNeeded(rhythm, 'troca');
  const plan = rhythm.plans.find(p => p.project === projectName) || getSuggestedPlan(rhythm);
  const durationMin = Math.max(5, Math.min(240, Number(minutes || plan?.minutes || 45)));
  rhythm.activeProject = projectName || plan?.project || rhythm.activeProject;
  rhythm.timer = {
    project: rhythm.activeProject,
    durationMin,
    remainingSec: durationMin * 60,
    running: true,
    endsAt: Date.now() + durationMin * 60 * 1000,
    startedAt: Date.now(),
    notified: false,
    logged: false
  };
  saveProjectRhythm(rhythm);
  renderProjectRhythm();
}

function pauseProjectTimer() {
  const rhythm = getProjectRhythm();
  const timer = rhythm.timer;
  if (!timer?.project) return;
  if (timer.running) {
    timer.remainingSec = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
    timer.running = false;
    timer.endsAt = null;
  } else {
    timer.running = true;
    timer.endsAt = Date.now() + Math.max(1, timer.remainingSec || timer.durationMin * 60) * 1000;
  }
  saveProjectRhythm(rhythm);
  renderProjectRhythm();
}

function resetProjectTimer() {
  const rhythm = getProjectRhythm();
  recordRunningTimerIfNeeded(rhythm, 'reset');
  const plan = rhythm.plans.find(p => p.project === rhythm.timer?.project) || getSuggestedPlan(rhythm);
  rhythm.timer = {
    project: plan?.project || rhythm.activeProject || '',
    durationMin: Number(plan?.minutes || 45),
    remainingSec: Number(plan?.minutes || 45) * 60,
    running: false,
    endsAt: null,
    startedAt: null,
    notified: false,
    logged: false
  };
  rhythm.activeProject = rhythm.timer.project;
  saveProjectRhythm(rhythm);
  renderProjectRhythm();
}

function nextProjectTimer() {
  const rhythm = getProjectRhythm();
  const enabled = rhythm.plans.filter(p => p.enabled);
  if (!enabled.length) return;
  const current = enabled.findIndex(p => p.project === rhythm.timer?.project || p.project === rhythm.activeProject);
  const next = enabled[(current + 1 + enabled.length) % enabled.length];
  startProjectTimer(next.project, next.minutes);
}

function updateProjectPlan(projectName, field, value) {
  const rhythm = getProjectRhythm();
  const plan = rhythm.plans.find(p => p.project === projectName);
  if (!plan) return;
  if (field === 'enabled') plan.enabled = Boolean(value);
  if (field === 'start') plan.start = value || '09:00';
  if (field === 'minutes') plan.minutes = Math.max(5, Math.min(240, Number(value || 45)));
  saveProjectRhythm(rhythm);
  renderProjectRhythm();
}

function addTenMinutesToCurrentBlock() {
  const rhythm = getProjectRhythm();
  const timer = rhythm.timer;
  if (!timer?.project) return;
  timer.durationMin = Number(timer.durationMin || 45) + 10;
  timer.remainingSec = Math.max(0, Number(timer.remainingSec || 0)) + 10 * 60;
  timer.running = true;
  timer.endsAt = Date.now() + timer.remainingSec * 1000;
  timer.notified = false;
  timer.logged = false;
  saveProjectRhythm(rhythm);
  projectRhythmAlertOpen = false;
  closeModal();
  renderProjectRhythm();
}

function openProjectSwitchAlert(finishedProject) {
  if (projectRhythmAlertOpen) return;
  const rhythm = getProjectRhythm();
  const enabled = rhythm.plans.filter(p => p.enabled);
  const current = enabled.findIndex(p => p.project === finishedProject);
  const next = enabled[(current + 1 + enabled.length) % enabled.length] || getSuggestedPlan(rhythm);
  projectRhythmAlertOpen = true;
  openModal('Bloco finalizado', `
    <div class="rhythm-alert">
      <div class="rhythm-alert-icon"><i class='bx bx-bell-ring'></i></div>
      <div>
        <h4>${escHtml(finishedProject || 'Projeto')} concluido por agora</h4>
        <p>Voce registrou este bloco no historico de foco. Minha sugestao: girar para <strong>${escHtml(next?.project || 'o proximo projeto')}</strong> para manter a rotacao viva.</p>
      </div>
      <div class="rhythm-alert-actions">
        <button class="btn-ghost" type="button" onclick="addTenMinutesToCurrentBlock()"><i class='bx bx-plus'></i> Mais 10 min</button>
      </div>
    </div>
  `, () => {
    projectRhythmAlertOpen = false;
    if (next) startProjectTimer(next.project, next.minutes);
  });
  const saveBtn = document.getElementById('modalSave');
  if (saveBtn) saveBtn.innerHTML = `<i class='bx bx-skip-next'></i> Ir para proximo`;
  const cancelBtn = document.getElementById('modalCancel');
  if (cancelBtn) cancelBtn.textContent = 'Ficar parado';
}

function renderProjectRhythm() {
  const el = document.getElementById('projectRhythm');
  if (!el) return;
  const rhythm = getProjectRhythm();
  const timer = rhythm.timer || {};
  if (timer.running && timer.endsAt) {
    timer.remainingSec = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
    if (timer.remainingSec <= 0) {
      timer.running = false;
      timer.endsAt = null;
      timer.remainingSec = 0;
      if (!timer.logged) {
        recordProjectTime(rhythm, timer.project, Number(timer.durationMin || 45) * 60, 'concluido');
        timer.logged = true;
      }
      if (!timer.notified) {
        timer.notified = true;
        toast(`Bloco de ${timer.project || 'projeto'} finalizado. Hora de trocar o foco.`, 'info');
        openProjectSwitchAlert(timer.project);
      }
    }
    saveProjectRhythm(rhythm);
  }
  const suggested = getSuggestedPlan(rhythm);
  const activePlan = rhythm.plans.find(p => p.project === timer.project) || suggested;
  const durationSec = Math.max(1, Number(timer.durationMin || activePlan?.minutes || 45) * 60);
  const remainingSec = timer.remainingSec ?? durationSec;
  const progress = Math.max(0, Math.min(100, 100 - (remainingSec / durationSec) * 100));
  const summary = getProjectTimeSummary(rhythm);

  if (!rhythm.plans.length) {
    el.innerHTML = `
      <div class="rhythm-empty">
        <i class='bx bx-time-five'></i>
        <div>
          <strong>Ritmo dos Projetos</strong>
          <span>Crie projetos para montar blocos de foco e evitar ficar preso em uma unica coisa.</span>
        </div>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="rhythm-main">
      <div class="rhythm-head">
        <div>
          <span class="rhythm-kicker">Ritmo dos Projetos</span>
          <h3>${escHtml(timer.project || suggested?.project || 'Escolha um projeto')}</h3>
          <p>${timer.running ? 'Bloco em andamento' : 'Pronto para iniciar o proximo bloco'} Â· ${activePlan?.start || '--:--'} Â· ${activePlan?.minutes || 45} min Â· Hoje: ${formatWorkTime(summary.totalSec)}</p>
        </div>
        <div class="rhythm-clock">
          <div class="rhythm-ring" style="--timer-progress:${progress}%">
            <span>${formatTimer(remainingSec)}</span>
          </div>
        </div>
      </div>
      <div class="rhythm-today">
        ${Object.entries(summary.byProject).length
          ? Object.entries(summary.byProject)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([project, sec]) => `<span><strong>${escHtml(project)}</strong>${formatWorkTime(sec)}</span>`)
              .join('')
          : '<span><strong>Hoje</strong>0min registrados</span>'}
      </div>
      <div class="rhythm-controls">
        <button class="btn-primary" type="button" onclick="startProjectTimer('${rhythmProjectArg(timer.project || suggested?.project || '')}', ${activePlan?.minutes || 45})">
          <i class='bx bx-play'></i><span>Iniciar</span>
        </button>
        <button class="btn-ghost" type="button" onclick="pauseProjectTimer()">
          <i class='bx ${timer.running ? 'bx-pause' : 'bx-play-circle'}'></i><span>${timer.running ? 'Pausar' : 'Retomar'}</span>
        </button>
        <button class="btn-ghost" type="button" onclick="nextProjectTimer()">
          <i class='bx bx-skip-next'></i><span>Proximo</span>
        </button>
        <button class="btn-icon" type="button" onclick="resetProjectTimer()" title="Resetar timer"><i class='bx bx-reset'></i></button>
      </div>
    </div>
    <div class="rhythm-plan-list">
      ${rhythm.plans.map(plan => `
        <div class="rhythm-plan ${plan.project === timer.project ? 'active' : ''}">
          <label class="rhythm-toggle">
            <input type="checkbox" ${plan.enabled ? 'checked' : ''} onchange="updateProjectPlan('${rhythmProjectArg(plan.project)}', 'enabled', this.checked)">
            <span></span>
          </label>
          <div class="rhythm-plan-name">${escHtml(plan.project)}<span>${formatWorkTime(summary.byProject[plan.project] || 0)} hoje</span></div>
          <input class="rhythm-input time" type="time" value="${escHtml(plan.start || '09:00')}" onchange="updateProjectPlan('${rhythmProjectArg(plan.project)}', 'start', this.value)">
          <input class="rhythm-input mins" type="number" min="5" max="240" step="5" value="${Number(plan.minutes || 45)}" onchange="updateProjectPlan('${rhythmProjectArg(plan.project)}', 'minutes', this.value)">
          <button class="btn-icon" type="button" onclick="startProjectTimer('${rhythmProjectArg(plan.project)}', ${Number(plan.minutes || 45)})" title="Iniciar bloco"><i class='bx bx-play'></i></button>
        </div>
      `).join('')}
    </div>
  `;
}

/* ===== DASHBOARD ===== */
function renderDashboard() {
  const now = new Date();
  const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('todayDate').innerHTML = `
    <div class="welcome-date-day">${now.getDate()}</div>
    <div class="welcome-date-info">${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getFullYear()}</div>
  `;

  // Metrics
  const activeProjs = S.projects.filter(p => p.status === 'Em desenvolvimento').length;
  const pendingTasks = S.tasks.filter(t => t.col !== 'done').length;
  const totalIdeas = S.ideas.length;
  const totalContacts = S.contacts.length;
  document.getElementById('metricsGrid').innerHTML = `
    <div class="metric-card" style="--accent-color:#2563EB">
      <div class="metric-icon" style="background:rgba(37,99,235,0.15);color:#2563EB"><i class='bx bx-folder-open'></i></div>
      <div class="metric-body">
        <div class="metric-value">${activeProjs}</div>
        <div class="metric-label">Projetos Ativos</div>
        <div class="metric-delta" style="color:#2563EB"><i class='bx bx-trending-up'></i>${S.projects.length} total</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:#4D8EFF">
      <div class="metric-icon" style="background:rgba(77,142,255,0.12);color:#4D8EFF"><i class='bx bx-check-square'></i></div>
      <div class="metric-body">
        <div class="metric-value">${pendingTasks}</div>
        <div class="metric-label">Tarefas Pendentes</div>
        <div class="metric-delta" style="color:#4D8EFF"><i class='bx bx-time'></i>${S.tasks.filter(t=>t.col==='inprogress').length} em andamento</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:#9B6DFF">
      <div class="metric-icon" style="background:rgba(155,109,255,0.15);color:#9B6DFF"><i class='bx bx-bulb'></i></div>
      <div class="metric-body">
        <div class="metric-value">${totalIdeas}</div>
        <div class="metric-label">Ideias Registradas</div>
        <div class="metric-delta" style="color:#9B6DFF"><i class='bx bx-trending-up'></i>${S.ideas.filter(i=>i.status==='Validando').length} validando</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:#F5A623">
      <div class="metric-icon" style="background:rgba(245,166,35,0.12);color:#F5A623"><i class='bx bx-user-circle'></i></div>
      <div class="metric-body">
        <div class="metric-value">${totalContacts}</div>
        <div class="metric-label">Contatos CRM</div>
        <div class="metric-delta" style="color:#F5A623"><i class='bx bx-radio-circle-marked'></i>${S.contacts.filter(c=>c.status==='Em conversa'||c.status==='Reunião marcada').length} ativos</div>
      </div>
    </div>
  `;

  // Week Focus
  const focusTasks = S.tasks.filter(t => t.col === 'inprogress' || t.col === 'today').slice(0, 4);
  document.getElementById('weekFocus').innerHTML = focusTasks.length
    ? focusTasks.map((t, i) => `
        <div class="focus-item">
          <div class="focus-num">${i + 1}</div>
          <div class="focus-text">${escHtml(t.title)}</div>
          <span class="focus-proj">${escHtml(t.project || '—')}</span>
        </div>`).join('')
    : '<div class="focus-item"><div class="focus-text" style="color:var(--text3)">Nenhuma tarefa ativa. Adicione tarefas no Kanban.</div></div>';

  // Priority Tasks
  const hiPrio = S.tasks.filter(t => t.priority === 'Alta' && t.col !== 'done').slice(0, 5);
  document.getElementById('priorityTasks').innerHTML = hiPrio.length
    ? hiPrio.map(t => `
        <div class="task-row">
          <div class="task-check"></div>
          <div class="task-text">${escHtml(t.title)}</div>
          <span class="task-proj-tag">${escHtml(t.project || '—')}</span>
        </div>`).join('')
    : '<div class="task-row"><div class="task-text" style="color:var(--text3)">Nenhuma tarefa prioritária pendente.</div></div>';

  // Active Projects
  const active = S.projects.filter(p => p.status === 'Em desenvolvimento').slice(0, 4);
  document.getElementById('activeProjects').innerHTML = active.length
    ? active.map(p => `
        <div class="proj-row">
          <div class="proj-dot" style="background:${projDot(p.status)}"></div>
          <div class="proj-row-info">
            <div class="proj-row-name">${escHtml(p.name)}</div>
            <div class="proj-row-meta">${escHtml(p.status)}</div>
          </div>
          <div class="proj-row-pct">${p.progress}%</div>
        </div>`).join('')
    : '<div class="proj-row"><div class="proj-row-info"><div class="proj-row-name" style="color:var(--text3)">Nenhum projeto em desenvolvimento.</div></div></div>';

  // Next Steps
  const steps = [
    'Revisar progresso dos projetos ativos',
    'Atualizar status das tarefas no Kanban',
    'Fazer contato com leads do CRM',
    'Registrar novos gastos e receitas',
    'Capturar novas ideias de negócio'
  ];
  document.getElementById('nextSteps').innerHTML = steps.map(s => `
    <div class="step-item">
      <div class="step-bullet"></div>
      <div class="step-text">${s}</div>
    </div>`).join('');

  renderProjectRhythm();
}

/* ===== PROJECTS ===== */
function renderProjects(filter) {
  if (filter !== undefined) S.projectFilter = filter;
  const f = S.projectFilter;
  let list = f === 'all' ? S.projects : S.projects.filter(p => p.status === f);
  const q = (document.getElementById('globalSearch').value || '').toLowerCase();
  if (q && S.section === 'projects') list = list.filter(p => p.name.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q));

  document.querySelectorAll('#section-projects .ftab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });

  const grid = document.getElementById('projectsGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class='bx bx-folder-open'></i></div><div class="empty-title">Nenhum projeto encontrado</div><div class="empty-sub">Crie um novo projeto ou ajuste o filtro.</div></div>`;
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="proj-card" data-id="${p.id}">
      <div class="proj-card-top">
        <div class="proj-card-header">
          <div class="proj-card-name">${escHtml(p.name)}</div>
          <div class="card-actions">
            <button class="btn-icon green" onclick="editProject('${p.id}')"><i class='bx bx-edit-alt'></i></button>
            <button class="btn-icon danger" onclick="delProject('${p.id}')"><i class='bx bx-trash'></i></button>
          </div>
        </div>
        <div class="proj-card-desc">${escHtml(p.desc)}</div>
        <div class="proj-card-meta">
          <span class="status-badge ${statusClass(p.status)}">${escHtml(p.status)}</span>
          <span class="prio ${prioClass(p.priority)}">${escHtml(p.priority)}</span>
          ${ownerBadge(p)}
        </div>
      </div>
      <div class="proj-card-bottom">
        <div class="progress-wrap">
          <div class="progress-label">
            <span class="progress-text">Progresso</span>
            <span class="progress-pct">${p.progress}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>
        </div>
      </div>
    </div>`).join('');
}

function projectForm(p = {}) {
  const projects = S.projects.map(x => x.name);
  return `
    <div class="form-group">
      <label class="form-label">Nome do Projeto *</label>
      <input class="form-input" id="f-name" placeholder="Ex: Cotai" value="${escHtml(p.name || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Descrição</label>
      <textarea class="form-textarea" id="f-desc" placeholder="Descreva o projeto brevemente..." rows="3">${escHtml(p.desc || '')}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="f-status">
          ${['Ideia','Em desenvolvimento','Validação','Lançado','Pausado'].map(s => `<option${p.status===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Prioridade</label>
        <select class="form-select" id="f-priority">
          ${['Alta','Média','Baixa'].map(s => `<option${p.priority===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Progresso: <span id="f-prog-val">${p.progress || 0}%</span></label>
      <div class="range-wrap">
        <input class="form-range" id="f-progress" type="range" min="0" max="100" value="${p.progress || 0}" oninput="document.getElementById('f-prog-val').textContent=this.value+'%'">
      </div>
    </div>
  `;
}

function newProject(defaultCol) {
  openModal('Novo Projeto', projectForm(), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome do projeto é obrigatório.', 'error'); return false; }
    S.projects.unshift({ id: uid(), name, desc: document.getElementById('f-desc').value.trim(), status: document.getElementById('f-status').value, priority: document.getElementById('f-priority').value, progress: +document.getElementById('f-progress').value, createdAt: new Date().toISOString().slice(0,10), owner_id: currentUserId, owner_name: currentUserName });
    saveProjects(); renderProjects(); renderDashboard(); toast('Projeto criado com sucesso!');
  });
}

function editProject(id) {
  const p = S.projects.find(x => x.id === id);
  if (!p) return;
  openModal('Editar Projeto', projectForm(p), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    Object.assign(p, { name, desc: document.getElementById('f-desc').value.trim(), status: document.getElementById('f-status').value, priority: document.getElementById('f-priority').value, progress: +document.getElementById('f-progress').value });
    saveProjects(); renderProjects(); renderDashboard(); toast('Projeto atualizado!');
  });
}

function delProject(id) {
  openConfirm(() => {
    S.projects = S.projects.filter(x => x.id !== id);
    saveProjects(); renderProjects(); renderDashboard(); toast('Projeto excluído.', 'info');
  });
}

/* ===== TASKS (KANBAN) ===== */
const colLabels = { backlog: 'Backlog', today: 'Hoje', inprogress: 'Em andamento', done: 'Concluído' };

function renderKanban() {
  ['backlog','today','inprogress','done'].forEach(col => {
    const tasks = S.tasks.filter(t => t.col === col);
    document.getElementById('ct-' + col).textContent = tasks.length;
    const q = (document.getElementById('globalSearch').value || '').toLowerCase();
    const filtered = q && S.section === 'tasks' ? tasks.filter(t => t.title.toLowerCase().includes(q)) : tasks;
    document.getElementById('col-' + col).innerHTML = filtered.map(t => taskCard(t)).join('') || '';
  });
}

function taskCard(t) {
  const now = new Date(); now.setHours(0,0,0,0);
  const dueDate = t.due ? new Date(t.due + 'T00:00:00') : null;
  const isOverdue = dueDate && dueDate < now && t.col !== 'done';
  return `
    <div class="task-card" data-id="${t.id}">
      <div class="task-card-title">${escHtml(t.title)}</div>
      <div class="task-card-meta">
        <div class="task-card-tags">
          <span class="prio ${prioClass(t.priority)}">${escHtml(t.priority)}</span>
          ${t.project ? `<span class="task-proj-tag">${escHtml(t.project)}</span>` : ''}
          ${ownerBadge(t)}
        </div>
        <div class="task-card-actions">
          <button class="btn-icon green" onclick="editTask('${t.id}')"><i class='bx bx-edit-alt'></i></button>
          <button class="btn-icon danger" onclick="delTask('${t.id}')"><i class='bx bx-trash'></i></button>
        </div>
      </div>
      ${t.due ? `<div class="task-due${isOverdue?' overdue':''}"><i class='bx bx-calendar'></i>${fmtDate(t.due)}${isOverdue?' · Atrasada':''}</div>` : ''}
      <div style="margin-top:8px">
        <select class="form-select" style="font-size:11px;padding:4px 24px 4px 8px;height:auto" onchange="moveTask('${t.id}',this.value)">
          ${Object.entries(colLabels).map(([k,v]) => `<option value="${k}"${t.col===k?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>
    </div>`;
}

function taskForm(t = {}) {
  const projNames = getProjectNames();
  return `
    <div class="form-group">
      <label class="form-label">Título da Tarefa *</label>
      <input class="form-input" id="f-title" placeholder="Ex: Refinar dashboard" value="${escHtml(t.title || '')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Projeto</label>
        <select class="form-select" id="f-project">
          <option value="">— Nenhum —</option>
          ${projNames.map(n => `<option${t.project===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Prioridade</label>
        <select class="form-select" id="f-priority">
          ${['Alta','Média','Baixa'].map(s => `<option${t.priority===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Coluna</label>
        <select class="form-select" id="f-col">
          ${Object.entries(colLabels).map(([k,v]) => `<option value="${k}"${(t.col||'backlog')===k?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Prazo</label>
        <input class="form-input" id="f-due" type="date" value="${t.due || ''}">
      </div>
    </div>
  `;
}

function newTask(col) {
  const def = { col: col || 'backlog' };
  openModal('Nova Tarefa', taskForm(def), () => {
    const title = document.getElementById('f-title').value.trim();
    if (!title) { toast('Título obrigatório.', 'error'); return false; }
    S.tasks.unshift({ id: uid(), title, project: document.getElementById('f-project').value, priority: document.getElementById('f-priority').value, col: document.getElementById('f-col').value, due: document.getElementById('f-due').value, owner_id: currentUserId, owner_name: currentUserName });
    saveTasks(); renderKanban(); renderDashboard(); toast('Tarefa criada!');
  });
}

function editTask(id) {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  openModal('Editar Tarefa', taskForm(t), () => {
    const title = document.getElementById('f-title').value.trim();
    if (!title) { toast('Título obrigatório.', 'error'); return false; }
    Object.assign(t, { title, project: document.getElementById('f-project').value, priority: document.getElementById('f-priority').value, col: document.getElementById('f-col').value, due: document.getElementById('f-due').value });
    saveTasks(); renderKanban(); renderDashboard(); toast('Tarefa atualizada!');
  });
}

function delTask(id) {
  openConfirm(() => {
    S.tasks = S.tasks.filter(x => x.id !== id);
    saveTasks(); renderKanban(); renderDashboard(); toast('Tarefa excluída.', 'info');
  });
}

function moveTask(id, col) {
  const t = S.tasks.find(x => x.id === id);
  if (t) { t.col = col; saveTasks(); renderKanban(); renderDashboard(); }
}

/* ===== IDEAS ===== */
function renderIdeas() {
  let list = [...S.ideas];
  const q = (document.getElementById('globalSearch').value || '').toLowerCase();
  if (q && S.section === 'ideas') list = list.filter(i => i.name.toLowerCase().includes(q) || (i.problem||'').toLowerCase().includes(q));
  const grid = document.getElementById('ideasGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class='bx bx-bulb'></i></div><div class="empty-title">Nenhuma ideia registrada</div><div class="empty-sub">Capture sua próxima grande ideia de negócio.</div></div>`;
    return;
  }
  grid.innerHTML = list.map(i => `
    <div class="idea-card" data-id="${i.id}">
      <div class="idea-card-head">
        <div class="idea-card-name">${escHtml(i.name)}</div>
        <div class="idea-card-actions">
          <button class="btn-icon green" onclick="editIdea('${i.id}')"><i class='bx bx-edit-alt'></i></button>
          <button class="btn-icon danger" onclick="delIdea('${i.id}')"><i class='bx bx-trash'></i></button>
        </div>
      </div>
      <div class="idea-card-body">
        <div class="idea-field">
          <div class="idea-field-label">Problema</div>
          <div class="idea-field-value">${escHtml(i.problem)}</div>
        </div>
        <div class="idea-field">
          <div class="idea-field-label">Público-alvo</div>
          <div class="idea-field-value">${escHtml(i.audience)}</div>
        </div>
        <div class="idea-field">
          <div class="idea-field-label">Monetização</div>
          <div class="idea-field-value">${escHtml(i.monetization)}</div>
        </div>
        ${i.notes ? `<div class="idea-field"><div class="idea-field-label">Observações</div><div class="idea-field-value">${escHtml(i.notes)}</div></div>` : ''}
      </div>
      <div class="idea-card-foot">
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <span class="status-badge ${statusClass(i.status)}">${escHtml(i.status)}</span>
          <span class="badge ${potentialClass(i.potential)}">${escHtml(i.potential)} potencial</span>
          ${ownerBadge(i)}
        </div>
      </div>
    </div>`).join('');
}

function ideaForm(i = {}) {
  return `
    <div class="form-group">
      <label class="form-label">Nome da Ideia *</label>
      <input class="form-input" id="f-name" placeholder="Ex: Plataforma para clínicas" value="${escHtml(i.name||'')}">
    </div>
    <div class="form-group">
      <label class="form-label">Problema que resolve</label>
      <textarea class="form-textarea" id="f-problem" rows="2" placeholder="Qual dor resolve?">${escHtml(i.problem||'')}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Público-alvo</label>
        <input class="form-input" id="f-audience" placeholder="Ex: PMEs" value="${escHtml(i.audience||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">Monetização</label>
        <input class="form-input" id="f-monetization" placeholder="Ex: SaaS mensal" value="${escHtml(i.monetization||'')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Potencial</label>
        <select class="form-select" id="f-potential">
          ${['Alto','Médio','Baixo'].map(s => `<option${i.potential===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="f-status">
          ${['Guardada','Em análise','Validando','Aprovada','Descartada'].map(s => `<option${i.status===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Observações</label>
      <textarea class="form-textarea" id="f-notes" rows="2" placeholder="Notas adicionais...">${escHtml(i.notes||'')}</textarea>
    </div>
  `;
}

function newIdea() {
  openModal('Nova Ideia', ideaForm(), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    S.ideas.unshift({ id: uid(), name, problem: document.getElementById('f-problem').value.trim(), audience: document.getElementById('f-audience').value.trim(), monetization: document.getElementById('f-monetization').value.trim(), potential: document.getElementById('f-potential').value, status: document.getElementById('f-status').value, notes: document.getElementById('f-notes').value.trim(), owner_id: currentUserId, owner_name: currentUserName });
    saveIdeas(); renderIdeas(); renderDashboard(); toast('Ideia registrada!');
  });
}

function editIdea(id) {
  const i = S.ideas.find(x => x.id === id);
  if (!i) return;
  openModal('Editar Ideia', ideaForm(i), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    Object.assign(i, { name, problem: document.getElementById('f-problem').value.trim(), audience: document.getElementById('f-audience').value.trim(), monetization: document.getElementById('f-monetization').value.trim(), potential: document.getElementById('f-potential').value, status: document.getElementById('f-status').value, notes: document.getElementById('f-notes').value.trim() });
    saveIdeas(); renderIdeas(); toast('Ideia atualizada!');
  });
}

function delIdea(id) {
  openConfirm(() => {
    S.ideas = S.ideas.filter(x => x.id !== id);
    saveIdeas(); renderIdeas(); renderDashboard(); toast('Ideia excluída.', 'info');
  });
}

/* ===== CRM ===== */
function renderCRM() {
  let list = [...S.contacts];
  const q = (document.getElementById('globalSearch').value || '').toLowerCase();
  if (q && S.section === 'crm') list = list.filter(c => c.name.toLowerCase().includes(q) || (c.company||'').toLowerCase().includes(q));
  const grid = document.getElementById('crmGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class='bx bx-user-circle'></i></div><div class="empty-title">Nenhum contato cadastrado</div><div class="empty-sub">Adicione clientes, parceiros e leads ao seu CRM.</div></div>`;
    return;
  }
  grid.innerHTML = list.map(c => {
    const initial = (c.name || '?')[0].toUpperCase();
    const avatarColors = { 'Cliente': '#2563EB', 'Parceiro': '#9B6DFF', 'Lead': '#F5A623', 'Fornecedor': '#22C55E', 'Engenheiro': '#FF4757' };
    const col = avatarColors[c.type] || '#4D8EFF';
    return `
      <div class="crm-card" data-id="${c.id}">
        <div class="crm-card-head">
          <div class="crm-avatar" style="background:linear-gradient(135deg,${col}88,${col}44)">${initial}</div>
          <div class="crm-card-info">
            <div class="crm-name">${escHtml(c.name)}</div>
            <div class="crm-company">${escHtml(c.company || '—')}</div>
          </div>
          <div class="crm-card-actions">
            <button class="btn-icon green" onclick="editContact('${c.id}')"><i class='bx bx-edit-alt'></i></button>
            <button class="btn-icon danger" onclick="delContact('${c.id}')"><i class='bx bx-trash'></i></button>
          </div>
        </div>
        <div class="crm-fields">
          <div class="crm-field">
            <i class='bx bx-phone'></i>
            <span class="crm-field-text">${escHtml(c.contact || '—')}</span>
          </div>
          <div class="crm-field">
            <i class='bx bx-right-arrow-alt'></i>
            <span class="crm-field-text">${escHtml(c.nextStep || '—')}</span>
          </div>
          ${c.notes ? `<div class="crm-field"><i class='bx bx-note'></i><span class="crm-field-text">${escHtml(c.notes)}</span></div>` : ''}
        </div>
        <div class="crm-card-foot">
          <span class="badge badge-gray">${escHtml(c.type)}</span>
          <span class="status-badge ${statusClass(c.status)}">${escHtml(c.status)}</span>
          ${ownerBadge(c)}
        </div>
      </div>`;
  }).join('');
}

function contactForm(c = {}) {
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nome *</label>
        <input class="form-input" id="f-name" placeholder="Nome completo" value="${escHtml(c.name||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">Empresa</label>
        <input class="form-input" id="f-company" placeholder="Nome da empresa" value="${escHtml(c.company||'')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select class="form-select" id="f-type">
          ${['Cliente','Fornecedor','Engenheiro','Parceiro','Lead'].map(s => `<option${c.type===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">WhatsApp / Email</label>
        <input class="form-input" id="f-contact" placeholder="(11) 99999-0000" value="${escHtml(c.contact||'')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="f-status">
          ${['Novo','Contatado','Em conversa','Reunião marcada','Fechado','Perdido'].map(s => `<option${c.status===s?' selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Próximo Passo</label>
        <input class="form-input" id="f-nextstep" placeholder="Ex: Enviar proposta" value="${escHtml(c.nextStep||'')}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Observações</label>
      <textarea class="form-textarea" id="f-notes" rows="2" placeholder="Notas sobre o contato...">${escHtml(c.notes||'')}</textarea>
    </div>
  `;
}

function newContact() {
  openModal('Novo Contato', contactForm(), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    S.contacts.unshift({ id: uid(), name, company: document.getElementById('f-company').value.trim(), type: document.getElementById('f-type').value, contact: document.getElementById('f-contact').value.trim(), status: document.getElementById('f-status').value, nextStep: document.getElementById('f-nextstep').value.trim(), notes: document.getElementById('f-notes').value.trim(), owner_id: currentUserId, owner_name: currentUserName });
    saveContacts(); renderCRM(); renderDashboard(); toast('Contato criado!');
  });
}

function editContact(id) {
  const c = S.contacts.find(x => x.id === id);
  if (!c) return;
  openModal('Editar Contato', contactForm(c), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    Object.assign(c, { name, company: document.getElementById('f-company').value.trim(), type: document.getElementById('f-type').value, contact: document.getElementById('f-contact').value.trim(), status: document.getElementById('f-status').value, nextStep: document.getElementById('f-nextstep').value.trim(), notes: document.getElementById('f-notes').value.trim() });
    saveContacts(); renderCRM(); toast('Contato atualizado!');
  });
}

function delContact(id) {
  openConfirm(() => {
    S.contacts = S.contacts.filter(x => x.id !== id);
    saveContacts(); renderCRM(); renderDashboard(); toast('Contato excluído.', 'info');
  });
}

/* ===== FINANCIAL ===== */
function renderFinancial() {
  const income = S.transactions.filter(t => t.type === 'Receita').reduce((s, t) => s + (+t.value || 0), 0);
  const expense = S.transactions.filter(t => t.type === 'Despesa').reduce((s, t) => s + (+t.value || 0), 0);
  const balance = income - expense;

  document.getElementById('financialMetrics').innerHTML = `
    <div class="metric-card" style="--accent-color:#22C55E">
      <div class="metric-icon" style="background:rgba(34,197,94,0.15);color:#22C55E"><i class='bx bx-trending-up'></i></div>
      <div class="metric-body">
        <div class="metric-value" style="font-size:20px">${fmtCurrency(income)}</div>
        <div class="metric-label">Receita Total</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:#FF4757">
      <div class="metric-icon" style="background:rgba(255,71,87,0.12);color:#FF4757"><i class='bx bx-trending-down'></i></div>
      <div class="metric-body">
        <div class="metric-value" style="font-size:20px">${fmtCurrency(expense)}</div>
        <div class="metric-label">Despesas Totais</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:${balance >= 0 ? '#22C55E' : '#FF4757'}">
      <div class="metric-icon" style="background:${balance>=0?'rgba(34,197,94,0.15)':'rgba(255,71,87,0.12)'};color:${balance>=0?'#22C55E':'#FF4757'}"><i class='bx bx-wallet'></i></div>
      <div class="metric-body">
        <div class="metric-value" style="font-size:20px;color:${balance>=0?'#22C55E':'var(--red)'}">${fmtCurrency(balance)}</div>
        <div class="metric-label">${balance >= 0 ? 'Lucro Estimado' : 'Prejuízo Estimado'}</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:#4D8EFF">
      <div class="metric-icon" style="background:rgba(77,142,255,0.12);color:#4D8EFF"><i class='bx bx-receipt'></i></div>
      <div class="metric-body">
        <div class="metric-value">${S.transactions.length}</div>
        <div class="metric-label">Lançamentos</div>
      </div>
    </div>
  `;

  let list = [...S.transactions].sort((a,b) => (b.date||'').localeCompare(a.date||''));
  if (S.finFilter !== 'all') list = list.filter(t => t.type === S.finFilter);

  document.querySelectorAll('#section-financial .ftab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === S.finFilter);
  });

  const el = document.getElementById('transactionsList');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="grid-column:unset"><div class="empty-icon"><i class='bx bx-receipt'></i></div><div class="empty-title">Nenhum lançamento</div><div class="empty-sub">Registre receitas e despesas dos seus projetos.</div></div>`;
    return;
  }
  el.innerHTML = list.map(t => `
    <div class="transaction-row">
      <div class="tx-icon ${t.type==='Receita'?'income':'expense'}">
        <i class='bx ${t.type==='Receita'?'bx-plus':'bx-minus'}'></i>
      </div>
      <div class="tx-info">
        <div class="tx-desc">${escHtml(t.desc)}</div>
        <div class="tx-meta" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${escHtml(t.project||'Geral')} · ${fmtDate(t.date)} ${ownerBadge(t)}</div>
      </div>
      <div class="tx-amount ${t.type==='Receita'?'income':'expense'}">${t.type==='Receita'?'+':'-'}${fmtCurrency(t.value)}</div>
      <div class="tx-actions">
        <button class="btn-icon green" onclick="editTransaction('${t.id}')"><i class='bx bx-edit-alt'></i></button>
        <button class="btn-icon danger" onclick="delTransaction('${t.id}')"><i class='bx bx-trash'></i></button>
      </div>
    </div>`).join('');
}

function transactionForm(t = {}) {
  const projNames = getProjectNames();
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Tipo *</label>
        <select class="form-select" id="f-type">
          <option${t.type==='Receita'?' selected':''}>Receita</option>
          <option${t.type==='Despesa'?' selected':''}>Despesa</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Valor (R$) *</label>
        <input class="form-input" id="f-value" type="number" min="0" step="0.01" placeholder="0,00" value="${t.value||''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Descrição *</label>
      <input class="form-input" id="f-desc" placeholder="Ex: Hospedagem AWS" value="${escHtml(t.desc||'')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Projeto</label>
        <select class="form-select" id="f-project">
          <option value="">— Geral —</option>
          ${projNames.map(n => `<option${t.project===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Data</label>
        <input class="form-input" id="f-date" type="date" value="${t.date || new Date().toISOString().slice(0,10)}">
      </div>
    </div>
  `;
}

function newTransaction() {
  openModal('Novo Lançamento', transactionForm(), () => {
    const desc = document.getElementById('f-desc').value.trim();
    const value = parseFloat(document.getElementById('f-value').value);
    if (!desc) { toast('Descrição obrigatória.', 'error'); return false; }
    if (!value || value <= 0) { toast('Valor inválido.', 'error'); return false; }
    S.transactions.unshift({ id: uid(), type: document.getElementById('f-type').value, desc, value, project: document.getElementById('f-project').value, date: document.getElementById('f-date').value, owner_id: currentUserId, owner_name: currentUserName });
    saveTransactions(); renderFinancial(); toast('Lançamento criado!');
  });
}

function editTransaction(id) {
  const t = S.transactions.find(x => x.id === id);
  if (!t) return;
  openModal('Editar Lançamento', transactionForm(t), () => {
    const desc = document.getElementById('f-desc').value.trim();
    const value = parseFloat(document.getElementById('f-value').value);
    if (!desc) { toast('Descrição obrigatória.', 'error'); return false; }
    if (!value || value <= 0) { toast('Valor inválido.', 'error'); return false; }
    Object.assign(t, { type: document.getElementById('f-type').value, desc, value, project: document.getElementById('f-project').value, date: document.getElementById('f-date').value });
    saveTransactions(); renderFinancial(); toast('Lançamento atualizado!');
  });
}

function delTransaction(id) {
  openConfirm(() => {
    S.transactions = S.transactions.filter(x => x.id !== id);
    saveTransactions(); renderFinancial(); toast('Lançamento excluído.', 'info');
  });
}

/* ===== PROMPTS & DOCS ===== */
function renderPrompts(filter) {
  if (filter !== undefined) S.promptFilter = filter;
  const f = S.promptFilter;
  let list = f === 'all' ? [...S.docs] : S.docs.filter(d => d.category === f);
  const q = (document.getElementById('globalSearch').value || '').toLowerCase();
  if (q && S.section === 'prompts') list = list.filter(d => d.title.toLowerCase().includes(q) || (d.content||'').toLowerCase().includes(q));

  document.querySelectorAll('#section-prompts .ftab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });

  const grid = document.getElementById('promptsGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class='bx bx-file-blank'></i></div><div class="empty-title">Nenhum documento encontrado</div><div class="empty-sub">Guarde prompts, scripts, estratégias e briefings aqui.</div></div>`;
    return;
  }
  const catColors = { 'Prompt': 'badge-purple', 'Script': 'badge-blue', 'Estratégia': 'badge-green', 'Briefing': 'badge-amber', 'Texto de venda': 'badge-red', 'Anotação': 'badge-gray' };
  grid.innerHTML = list.map(d => `
    <div class="prompt-card" data-id="${d.id}">
      <div class="prompt-card-top">
        <div class="prompt-card-head">
          <div class="prompt-card-title">${escHtml(d.title)}</div>
          <div class="prompt-actions">
            <button class="btn-icon green" title="Copiar" onclick="copyDoc('${d.id}')"><i class='bx bx-copy'></i></button>
            <button class="btn-icon" onclick="editDoc('${d.id}')"><i class='bx bx-edit-alt'></i></button>
            <button class="btn-icon danger" onclick="delDoc('${d.id}')"><i class='bx bx-trash'></i></button>
          </div>
        </div>
        <div class="prompt-preview">${escHtml(d.content)}</div>
      </div>
      <div class="prompt-card-foot">
        <span class="badge ${catColors[d.category] || 'badge-gray'}">${escHtml(d.category)}</span>
        <span class="prompt-meta">${escHtml(d.project || 'Geral')} · ${fmtDate(d.date)}</span>
        ${ownerBadge(d)}
      </div>
    </div>`).join('');
}

function docForm(d = {}) {
  const projNames = getProjectNames();
  const cats = ['Prompt','Script','Estratégia','Briefing','Texto de venda','Anotação'];
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Título *</label>
        <input class="form-input" id="f-title" placeholder="Título do documento" value="${escHtml(d.title||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">Categoria</label>
        <select class="form-select" id="f-category">
          ${cats.map(c => `<option${d.category===c?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Conteúdo *</label>
      <textarea class="form-textarea" id="f-content" rows="8" placeholder="Cole ou escreva o conteúdo aqui...">${escHtml(d.content||'')}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Projeto relacionado</label>
        <select class="form-select" id="f-project">
          <option value="">— Geral —</option>
          ${projNames.map(n => `<option${d.project===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Data</label>
        <input class="form-input" id="f-date" type="date" value="${d.date || new Date().toISOString().slice(0,10)}">
      </div>
    </div>
  `;
}

function newDoc() {
  openModal('Novo Documento', docForm(), () => {
    const title = document.getElementById('f-title').value.trim();
    const content = document.getElementById('f-content').value.trim();
    if (!title) { toast('Título obrigatório.', 'error'); return false; }
    if (!content) { toast('Conteúdo obrigatório.', 'error'); return false; }
    S.docs.unshift({ id: uid(), title, category: document.getElementById('f-category').value, content, project: document.getElementById('f-project').value, date: document.getElementById('f-date').value, owner_id: currentUserId, owner_name: currentUserName });
    saveDocs(); renderPrompts(); toast('Documento criado!');
  });
}

function editDoc(id) {
  const d = S.docs.find(x => x.id === id);
  if (!d) return;
  openModal('Editar Documento', docForm(d), () => {
    const title = document.getElementById('f-title').value.trim();
    const content = document.getElementById('f-content').value.trim();
    if (!title) { toast('Título obrigatório.', 'error'); return false; }
    if (!content) { toast('Conteúdo obrigatório.', 'error'); return false; }
    Object.assign(d, { title, category: document.getElementById('f-category').value, content, project: document.getElementById('f-project').value, date: document.getElementById('f-date').value });
    saveDocs(); renderPrompts(); toast('Documento atualizado!');
  });
}

function delDoc(id) {
  openConfirm(() => {
    S.docs = S.docs.filter(x => x.id !== id);
    saveDocs(); renderPrompts(); toast('Documento excluído.', 'info');
  });
}

function copyDoc(id) {
  const d = S.docs.find(x => x.id === id);
  if (!d) return;
  navigator.clipboard.writeText(d.content).then(() => toast('Conteúdo copiado!')).catch(() => {
    const el = document.createElement('textarea');
    el.value = d.content; document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove();
    toast('Conteúdo copiado!');
  });
}

/* ===== PRIMARY BUTTON ACTIONS ===== */
function primaryAction() {
  const actions = {
    agenda:   () => newTask(_calSelected || ''),
    projects: () => newProject(),
    tasks: () => newTask(),
    habits: () => newHabit(),
    ideas: () => newIdea(),
    goals: () => newGoal(),
    crm: () => newContact(),
    financial: () => newTransaction(),
    review: () => newReview(),
    prompts: () => newDoc()
  };
  if (actions[S.section]) actions[S.section]();
}

/* ===== HABIT HELPERS ===== */
function getLast21Days() {
  const days = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function calcStreak(h) {
  let streak = 0;
  const now = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (h.completions.includes(ds)) { streak++; }
    else if (i === 0) { continue; }
    else { break; }
  }
  return streak;
}

/* ===== HABITS ===== */
function renderHabits() {
  const today = new Date().toISOString().slice(0, 10);
  const done = S.habits.filter(h => h.completions.includes(today)).length;
  const total = S.habits.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const r = 30, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const bestStreak = S.habits.reduce((max, h) => Math.max(max, calcStreak(h)), 0);
  const totalToday = S.habits.reduce((sum, h) => sum + h.completions.filter(c => c === today).length, 0);

  document.getElementById('habitsOverview').innerHTML = `
    <div class="hov-info">
      <div class="hov-label">Hábitos concluídos hoje</div>
      <div class="hov-val">${done}<span style="font-size:18px;color:var(--text3);font-weight:500"> / ${total}</span></div>
      <div class="hov-sub">${pct}% da meta diária</div>
    </div>
    <div class="hov-stats">
      <div class="hov-stat">
        <div class="hov-stat-val">${bestStreak}</div>
        <div class="hov-stat-label">Maior streak</div>
      </div>
      <div class="hov-stat">
        <div class="hov-stat-val">${S.habits.length}</div>
        <div class="hov-stat-label">Hábitos ativos</div>
      </div>
    </div>
    <div class="hov-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle class="ring-bg" cx="36" cy="36" r="${r}" stroke-width="6"/>
        <circle class="ring-fill" cx="36" cy="36" r="${r}" stroke-width="6"
          stroke="var(--accent)"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${offset}"/>
      </svg>
      <div class="hov-ring-label" style="color:var(--accent)">${pct}%</div>
    </div>
  `;

  const grid = document.getElementById('habitsGrid');
  if (!S.habits.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon"><i class='bx bx-calendar-check'></i></div><div class="empty-title">Nenhum hábito cadastrado</div><div class="empty-sub">Adicione hábitos diários para acompanhar sua consistência.</div></div>`;
    return;
  }
  const days = getLast21Days();
  grid.innerHTML = S.habits.map(h => {
    const isDone = h.completions.includes(today);
    const streak = calcStreak(h);
    const dots = days.map(d => {
      if (d === today && !isDone) return `<div class="streak-dot today-ring" title="Hoje"></div>`;
      if (h.completions.includes(d)) return `<div class="streak-dot filled" title="${d}"></div>`;
      return `<div class="streak-dot" title="${d}"></div>`;
    }).join('');
    return `
      <div class="habit-card${isDone ? ' done' : ''}">
        <div class="habit-card-main">
          <div class="habit-icon"><i class='bx ${escHtml(h.icon)}'></i></div>
          <div class="habit-info">
            <div class="habit-name">${escHtml(h.name)}</div>
            <div class="habit-streak-row">
              <span class="habit-streak-txt"><i class='bx bx-flame'></i>${streak} dia${streak !== 1 ? 's' : ''} seguido${streak !== 1 ? 's' : ''}</span>
              <span class="badge badge-gray">${escHtml(h.category)}</span>
              ${ownerBadge(h)}
            </div>
          </div>
          <button class="habit-check-btn" onclick="toggleHabitToday('${h.id}')">
            <i class='bx ${isDone ? 'bx-check' : 'bx-plus'}'></i>
          </button>
        </div>
        <div class="streak-row">${dots}</div>
        <div class="habit-card-foot">
          <span style="font-size:11px;color:var(--text3)">${isDone ? '✓ Concluído hoje' : 'Pendente hoje'}</span>
          <div class="habit-actions">
            <button class="btn-icon green" onclick="editHabit('${h.id}')"><i class='bx bx-edit-alt'></i></button>
            <button class="btn-icon danger" onclick="delHabit('${h.id}')"><i class='bx bx-trash'></i></button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleHabitToday(id) {
  const h = S.habits.find(x => x.id === id);
  if (!h) return;
  const today = new Date().toISOString().slice(0, 10);
  const idx = h.completions.indexOf(today);
  if (idx === -1) { h.completions.push(today); toast(`${h.name} concluído!`); }
  else { h.completions.splice(idx, 1); toast(`${h.name} desmarcado.`, 'info'); }
  saveHabits();
  renderHabits();
}

function habitForm(h = {}) {
  const icons = ['bx-book-open','bx-run','bx-check-double','bx-phone-call','bx-brain','bx-dumbbell','bx-water','bx-coffee','bx-pencil','bx-sun','bx-moon','bx-heart','bx-music','bx-code-alt','bx-dollar'];
  const cats = ['Saúde','Foco','Negócio','Desenvolvimento','Bem-estar','Aprendizado'];
  return `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nome do Hábito *</label>
        <input class="form-input" id="f-name" placeholder="Ex: Leitura 30 min" value="${escHtml(h.name || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Categoria</label>
        <select class="form-select" id="f-category">
          ${cats.map(c => `<option${h.category === c ? ' selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Ícone</label>
      <select class="form-select" id="f-icon">
        ${icons.map(i => `<option value="${i}"${h.icon === i ? ' selected' : ''}>${i.replace('bx-', '')}</option>`).join('')}
      </select>
    </div>
  `;
}

function newHabit() {
  openModal('Novo Hábito', habitForm(), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    S.habits.push({ id: uid(), name, category: document.getElementById('f-category').value, icon: document.getElementById('f-icon').value, completions: [], owner_id: currentUserId, owner_name: currentUserName });
    saveHabits(); renderHabits(); toast('Hábito criado!');
  });
}

function editHabit(id) {
  const h = S.habits.find(x => x.id === id);
  if (!h) return;
  openModal('Editar Hábito', habitForm(h), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    Object.assign(h, { name, category: document.getElementById('f-category').value, icon: document.getElementById('f-icon').value });
    saveHabits(); renderHabits(); toast('Hábito atualizado!');
  });
}

function delHabit(id) {
  openConfirm(() => {
    S.habits = S.habits.filter(x => x.id !== id);
    saveHabits(); renderHabits(); toast('Hábito excluído.', 'info');
  });
}

/* ===== GOAL HELPERS ===== */
function goalProgress(goal) {
  if (!goal.keyResults.length) return 0;
  const sum = goal.keyResults.reduce((s, kr) => s + Math.min(100, (+kr.target > 0 ? Math.round((+kr.current / +kr.target) * 100) : 0)), 0);
  return Math.round(sum / goal.keyResults.length);
}

function goalStatusClass(s) {
  return { 'No prazo': 'status-green', 'Em risco': 'status-amber', 'Atrasado': 'status-red', 'Concluído': 'status-blue' }[s] || 'status-gray';
}

function krColor(pct) {
  if (pct >= 80) return 'var(--green)';
  if (pct >= 50) return 'var(--accent)';
  if (pct >= 25) return 'var(--amber)';
  return 'var(--red)';
}

/* ===== GOALS ===== */
function renderGoals() {
  const grid = document.getElementById('goalsGrid');
  if (!S.goals.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class='bx bx-target-lock'></i></div><div class="empty-title">Nenhuma meta definida</div><div class="empty-sub">Defina objetivos trimestrais e acompanhe o progresso com Key Results.</div></div>`;
    return;
  }
  grid.innerHTML = S.goals.map(g => {
    const pct = goalProgress(g);
    const krsHTML = g.keyResults.map(kr => {
      const kpct = kr.target > 0 ? Math.min(100, Math.round((+kr.current / +kr.target) * 100)) : 0;
      const col = krColor(kpct);
      return `
        <div class="kr-item">
          <div class="kr-dot" style="background:${col}"></div>
          <div class="kr-info">
            <div class="kr-desc">${escHtml(kr.desc)}</div>
            <div class="kr-bar-row">
              <div class="kr-bar"><div class="kr-bar-fill" style="width:${kpct}%;background:${col}"></div></div>
              <span class="kr-val">${kr.current} / ${kr.target} ${escHtml(kr.unit)}</span>
              <span class="kr-pct" style="color:${col}">${kpct}%</span>
            </div>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="goal-card">
        <div class="goal-card-top">
          <div>
            <div class="goal-objective">${escHtml(g.objective)}</div>
            <div class="goal-meta">
              <span class="badge badge-blue">${escHtml(g.quarter)}</span>
              <span class="status-badge ${goalStatusClass(g.status)}">${escHtml(g.status)}</span>
              ${ownerBadge(g)}
            </div>
          </div>
          <div class="goal-actions">
            <button class="btn-icon green" onclick="editGoal('${g.id}')"><i class='bx bx-edit-alt'></i></button>
            <button class="btn-icon danger" onclick="delGoal('${g.id}')"><i class='bx bx-trash'></i></button>
          </div>
        </div>
        <div class="goal-progress-wrap">
          <div class="goal-progress-top">
            <span class="goal-progress-lbl">Progresso geral</span>
            <span class="goal-progress-pct">${pct}%</span>
          </div>
          <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%"></div></div>
        </div>
        ${g.keyResults.length ? `<div class="goal-krs">${krsHTML}</div>` : ''}
      </div>`;
  }).join('');
}

function krRowHTML(kr = {}) {
  _krCounter++;
  const rid = 'kr' + _krCounter;
  return `
    <div class="kr-form-row" id="${rid}">
      <input class="form-input" style="flex:1" placeholder="Descrição do Key Result" value="${escHtml(kr.desc || '')}">
      <input class="form-input" type="number" style="width:80px;min-width:80px" placeholder="Atual" value="${kr.current !== undefined ? kr.current : ''}">
      <input class="form-input" type="number" style="width:80px;min-width:80px" placeholder="Meta" value="${kr.target !== undefined ? kr.target : ''}">
      <input class="form-input" style="width:90px;min-width:90px" placeholder="Unidade" value="${escHtml(kr.unit || '')}">
      <button class="btn-icon danger" type="button" onclick="document.getElementById('${rid}').remove()"><i class='bx bx-trash'></i></button>
    </div>`;
}

function addKRRow() {
  const c = document.getElementById('krsContainer');
  if (c) c.insertAdjacentHTML('beforeend', krRowHTML());
}

function goalForm(g = {}) {
  _krCounter = 0;
  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'];
  const krsHTML = (g.keyResults || []).map(kr => krRowHTML(kr)).join('');
  return `
    <div class="form-group">
      <label class="form-label">Objetivo *</label>
      <input class="form-input" id="f-objective" placeholder="Ex: Validar o Cotai comercialmente" value="${escHtml(g.objective || '')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Trimestre</label>
        <select class="form-select" id="f-quarter">
          ${quarters.map(q => `<option${g.quarter === q ? ' selected' : ''}>${q}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="f-gstatus">
          ${['No prazo', 'Em risco', 'Atrasado', 'Concluído'].map(s => `<option${g.status === s ? ' selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Key Results</label>
      <div style="display:flex;gap:6px;margin-bottom:6px;padding:0 2px">
        <span style="flex:1;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px">Descrição</span>
        <span style="width:80px;min-width:80px;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px">Atual</span>
        <span style="width:80px;min-width:80px;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px">Meta</span>
        <span style="width:90px;min-width:90px;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px">Unidade</span>
        <span style="width:30px"></span>
      </div>
      <div id="krsContainer" style="display:flex;flex-direction:column;gap:8px">${krsHTML}</div>
      <button class="btn-ghost" type="button" onclick="addKRRow()" style="margin-top:10px;width:100%;justify-content:center">
        <i class='bx bx-plus'></i> Adicionar Key Result
      </button>
    </div>`;
}

function collectKRs() {
  return Array.from(document.querySelectorAll('#krsContainer .kr-form-row')).map(row => {
    const inputs = row.querySelectorAll('input');
    return { id: uid(), desc: inputs[0].value.trim(), current: +inputs[1].value || 0, target: +inputs[2].value || 1, unit: inputs[3].value.trim() };
  }).filter(kr => kr.desc);
}

function newGoal() {
  openModal('Nova Meta / OKR', goalForm(), () => {
    const objective = document.getElementById('f-objective').value.trim();
    if (!objective) { toast('Objetivo obrigatório.', 'error'); return false; }
    S.goals.unshift({ id: uid(), objective, quarter: document.getElementById('f-quarter').value, status: document.getElementById('f-gstatus').value, keyResults: collectKRs(), owner_id: currentUserId, owner_name: currentUserName });
    saveGoals(); renderGoals(); toast('Meta criada!');
  });
}

function editGoal(id) {
  const g = S.goals.find(x => x.id === id);
  if (!g) return;
  openModal('Editar Meta / OKR', goalForm(g), () => {
    const objective = document.getElementById('f-objective').value.trim();
    if (!objective) { toast('Objetivo obrigatório.', 'error'); return false; }
    Object.assign(g, { objective, quarter: document.getElementById('f-quarter').value, status: document.getElementById('f-gstatus').value, keyResults: collectKRs() });
    saveGoals(); renderGoals(); toast('Meta atualizada!');
  });
}

function delGoal(id) {
  openConfirm(() => {
    S.goals = S.goals.filter(x => x.id !== id);
    saveGoals(); renderGoals(); toast('Meta excluída.', 'info');
  });
}

/* ===== REVIEW HELPERS ===== */
function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function weekLabel(dateStr) {
  if (!dateStr) return '—';
  const [y, m, day] = dateStr.split('-').map(Number);
  const start = new Date(y, m - 1, day);
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const ms = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${day} ${ms[m - 1]} – ${end.getDate()} ${ms[end.getMonth()]}`;
}

function selectMood(n) {
  _selectedMood = n;
  document.querySelectorAll('.mood-opt').forEach(el => {
    el.classList.toggle('selected', +el.dataset.mood === n);
  });
}

const MOODS = [
  { v: 1, e: '😔', l: 'Difícil', bg: 'rgba(255,71,87,0.15)' },
  { v: 2, e: '😐', l: 'Regular', bg: 'rgba(255,255,255,0.07)' },
  { v: 3, e: '🙂', l: 'Ok',      bg: 'rgba(245,166,35,0.12)' },
  { v: 4, e: '😊', l: 'Boa',     bg: 'rgba(37,99,235,0.12)' },
  { v: 5, e: '🚀', l: 'Incrível', bg: 'rgba(34,197,94,0.15)' }
];

/* ===== REVIEW ===== */
function renderReview() {
  const list = document.getElementById('reviewList');
  if (!S.reviews.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class='bx bx-notepad'></i></div><div class="empty-title">Nenhuma revisão registrada</div><div class="empty-sub">Faça uma revisão semanal toda sexta-feira para manter clareza sobre o que está funcionando.</div></div>`;
    return;
  }
  const sorted = [...S.reviews].sort((a, b) => (b.weekOf || '').localeCompare(a.weekOf || ''));
  list.innerHTML = sorted.map(r => {
    const mood = MOODS.find(m => m.v === r.mood) || MOODS[2];
    return `
      <div class="review-card" id="rv-${r.id}">
        <div class="review-card-head" onclick="toggleReview('${r.id}')">
          <div class="review-head-left">
            <div class="review-mood-icon" style="background:${mood.bg}">${mood.e}</div>
            <div>
              <div class="review-week-label">Semana de ${weekLabel(r.weekOf)}</div>
              <div class="review-week-date" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">Registrado em ${fmtDate(r.createdAt)} · Humor: ${mood.l} ${ownerBadge(r)}</div>
            </div>
          </div>
          <div class="review-head-right">
            <div class="review-actions">
              <button class="btn-icon danger" onclick="event.stopPropagation();delReview('${r.id}')"><i class='bx bx-trash'></i></button>
            </div>
            <i class='bx bx-chevron-down review-chevron'></i>
          </div>
        </div>
        <div class="review-body">
          <div class="rv-block">
            <div class="rv-block-label">O que avancei</div>
            <div class="rv-block-text">${escHtml(r.advances || '—')}</div>
          </div>
          <div class="rv-block">
            <div class="rv-block-label">O que me bloqueou</div>
            <div class="rv-block-text">${escHtml(r.blockers || '—')}</div>
          </div>
          <div class="rv-block">
            <div class="rv-block-label">Aprendizados</div>
            <div class="rv-block-text">${escHtml(r.learnings || '—')}</div>
          </div>
          <div class="rv-block">
            <div class="rv-block-label">Foco da próxima semana</div>
            <div class="rv-block-text">${escHtml(r.nextFocus || '—')}</div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleReview(id) {
  const card = document.getElementById('rv-' + id);
  if (card) card.classList.toggle('open');
}

function reviewForm(r = {}) {
  _selectedMood = r.mood || 3;
  const moodOpts = MOODS.map(m => `
    <div class="mood-opt${_selectedMood === m.v ? ' selected' : ''}" data-mood="${m.v}" onclick="selectMood(${m.v})">
      <span class="mood-emoji">${m.e}</span>
      <span class="mood-lbl">${m.l}</span>
    </div>`).join('');
  return `
    <div class="form-group">
      <label class="form-label">Semana de</label>
      <input class="form-input" id="f-weekof" type="date" value="${r.weekOf || getWeekStart()}">
    </div>
    <div class="form-group">
      <label class="form-label">Como foi a semana?</label>
      <div class="mood-selector">${moodOpts}</div>
    </div>
    <div class="form-group">
      <label class="form-label">O que avancei?</label>
      <textarea class="form-textarea" id="f-advances" rows="3" placeholder="Principais avanços da semana...">${escHtml(r.advances || '')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">O que me bloqueou?</label>
      <textarea class="form-textarea" id="f-blockers" rows="3" placeholder="Obstáculos, distrações, gargalos...">${escHtml(r.blockers || '')}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Aprendizados</label>
        <textarea class="form-textarea" id="f-learnings" rows="3" placeholder="O que aprendi esta semana...">${escHtml(r.learnings || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Foco da próxima semana</label>
        <textarea class="form-textarea" id="f-nextfocus" rows="3" placeholder="Prioridades para a próxima semana...">${escHtml(r.nextFocus || '')}</textarea>
      </div>
    </div>`;
}

function newReview() {
  openModal('Nova Revisão Semanal', reviewForm(), () => {
    const weekOf = document.getElementById('f-weekof').value;
    if (!weekOf) { toast('Defina a semana.', 'error'); return false; }
    S.reviews.unshift({
      id: uid(),
      weekOf,
      mood: _selectedMood,
      advances: document.getElementById('f-advances').value.trim(),
      blockers: document.getElementById('f-blockers').value.trim(),
      learnings: document.getElementById('f-learnings').value.trim(),
      nextFocus: document.getElementById('f-nextfocus').value.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      owner_id: currentUserId,
      owner_name: currentUserName
    });
    saveReviews(); renderReview(); toast('Revisão registrada!');
  });
}

function delReview(id) {
  openConfirm(() => {
    S.reviews = S.reviews.filter(x => x.id !== id);
    saveReviews(); renderReview(); toast('Revisão excluída.', 'info');
  });
}


/* ===== AGENDA ===== */
let _calYear = new Date().getFullYear();
let _calMonth = new Date().getMonth();
let _calSelected = null;

const CAL_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CAL_DAYS   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function renderAgenda() {
  const today = new Date().toISOString().slice(0, 10);
  const year  = _calYear;
  const month = _calMonth;

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  let cells = '';
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell cal-empty"></div>`;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds === today;
    const isSel   = ds === _calSelected;
    const dayTasks = S.tasks.filter(t => t.due === ds && t.col !== 'done');
    const dots = dayTasks.slice(0, 3).map(t => {
      const c = t.priority === 'Alta' ? 'red' : t.priority === 'Média' ? 'amber' : 'blue';
      return `<span class="cal-dot cal-dot-${c}"></span>`;
    }).join('');
    cells += `<div class="cal-cell${isToday?' is-today':''}${isSel?' is-selected':''}" onclick="selectCalDay('${ds}')">
      <span class="cal-day-num">${d}</span>
      <div class="cal-dots">${dots}</div>
    </div>`;
  }

  let dayPanel = '';
  if (_calSelected) {
    const sel = _calSelected;
    const [sy, sm, sd] = sel.split('-');
    const label = `${parseInt(sd)} de ${CAL_MONTHS[parseInt(sm)-1]} de ${sy}`;
    const selTasks = S.tasks.filter(t => t.due === sel && t.col !== 'done');
    const doneTasks = S.tasks.filter(t => t.due === sel && t.col === 'done');

    const taskRows = selTasks.length
      ? selTasks.map(t => `
          <div class="cal-task-item" onclick="navigateTo('tasks')">
            <span class="prio prio-${t.priority==='Alta'?'high':t.priority==='Média'?'medium':'low'}">${t.priority}</span>
            <span class="cal-task-title">${escHtml(t.title)}</span>
            ${t.project ? `<span class="focus-proj">${escHtml(t.project)}</span>` : ''}
          </div>`).join('')
      : `<div class="notif-empty" style="padding:24px 0"><i class='bx bx-check-circle'></i><p>Nenhuma tarefa pendente</p></div>`;

    dayPanel = `<div class="cal-day-panel">
      <div class="cal-day-head">
        <span class="cal-day-label">${label}</span>
        ${selTasks.length ? `<span class="notif-panel-count">${selTasks.length} pendente${selTasks.length>1?'s':''}</span>` : ''}
        ${doneTasks.length ? `<span class="notif-panel-count" style="background:var(--green-dim);color:var(--green)">${doneTasks.length} concluída${doneTasks.length>1?'s':''}</span>` : ''}
      </div>
      <div class="cal-task-list">${taskRows}</div>
    </div>`;
  }

  document.getElementById('agendaView').innerHTML = `
    <div class="cal-header">
      <button class="btn-icon" onclick="calNav(-1)"><i class='bx bx-chevron-left'></i></button>
      <h2 class="cal-month-label">${CAL_MONTHS[month]} ${year}</h2>
      <button class="btn-icon" onclick="calNav(1)"><i class='bx bx-chevron-right'></i></button>
      <button class="btn-ghost cal-today-btn" onclick="calGoToday()">Hoje</button>
    </div>
    <div class="cal-wrap">
      <div class="cal-weekdays">${CAL_DAYS.map(d=>`<span>${d}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
    </div>
    ${dayPanel}`;
}

function selectCalDay(ds) {
  _calSelected = _calSelected === ds ? null : ds;
  renderAgenda();
}

function calNav(dir) {
  _calMonth += dir;
  if (_calMonth > 11) { _calMonth = 0; _calYear++; }
  if (_calMonth < 0)  { _calMonth = 11; _calYear--; }
  renderAgenda();
}

function calGoToday() {
  const now = new Date();
  _calYear  = now.getFullYear();
  _calMonth = now.getMonth();
  _calSelected = now.toISOString().slice(0, 10);
  renderAgenda();
}

/* ===== NOTIFICATIONS ===== */
function buildNotifications() {
  const today = new Date().toISOString().slice(0, 10);
  const notifs = [];

  const overdue = S.tasks.filter(t => t.col !== 'done' && t.due && t.due < today);
  if (overdue.length) notifs.push({
    icon: 'bx-error-circle', color: 'red',
    title: `${overdue.length} tarefa${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}`,
    desc: overdue.slice(0, 2).map(t => t.title).join(', ') + (overdue.length > 2 ? ` +${overdue.length - 2}` : ''),
    section: 'tasks'
  });

  const dueToday = S.tasks.filter(t => t.col !== 'done' && t.due === today);
  if (dueToday.length) notifs.push({
    icon: 'bx-calendar-check', color: 'amber',
    title: `${dueToday.length} tarefa${dueToday.length > 1 ? 's' : ''} para hoje`,
    desc: dueToday.slice(0, 2).map(t => t.title).join(', ') + (dueToday.length > 2 ? ` +${dueToday.length - 2}` : ''),
    section: 'tasks'
  });

  const pendingHabits = S.habits.filter(h => !h.completions.includes(today));
  if (pendingHabits.length) notifs.push({
    icon: 'bx-calendar-x', color: 'blue',
    title: `${pendingHabits.length} hábito${pendingHabits.length > 1 ? 's' : ''} pendente${pendingHabits.length > 1 ? 's' : ''} hoje`,
    desc: pendingHabits.slice(0, 2).map(h => h.name).join(', ') + (pendingHabits.length > 2 ? ` +${pendingHabits.length - 2}` : ''),
    section: 'habits'
  });

  const atRisk = S.goals.filter(g => g.status === 'Em risco');
  if (atRisk.length) notifs.push({
    icon: 'bx-target-lock', color: 'purple',
    title: `${atRisk.length} meta${atRisk.length > 1 ? 's' : ''} em risco`,
    desc: atRisk.map(g => g.objective).join(', '),
    section: 'goals'
  });

  return notifs;
}

function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const n = buildNotifications().length;
  badge.textContent = n;
  badge.style.display = n ? 'flex' : 'none';
}

function renderNotifPanel() {
  const notifs = buildNotifications();
  const list   = document.getElementById('notifList');
  const count  = document.getElementById('notifCount');
  count.textContent = notifs.length;

  if (!notifs.length) {
    list.innerHTML = `<div class="notif-empty"><i class='bx bx-check-circle'></i><p>Tudo em dia!</p></div>`;
    return;
  }
  list.innerHTML = notifs.map(n => `
    <div class="notif-item notif-${n.color}" onclick="navigateTo('${n.section}');closeNotifPanel()">
      <div class="notif-item-icon"><i class='bx ${n.icon}'></i></div>
      <div class="notif-item-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-desc">${escHtml(n.desc)}</div>
      </div>
      <i class='bx bx-chevron-right notif-item-arrow'></i>
    </div>`).join('');
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel.classList.contains('open')) { closeNotifPanel(); return; }
  renderNotifPanel();
  panel.classList.add('open');
}

function closeNotifPanel() {
  document.getElementById('notifPanel').classList.remove('open');
}

/* ===== EVENT LISTENERS ===== */
function bindEvents() {
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      if (item.classList.contains('nav-external')) return;
      e.preventDefault();
      navigateTo(item.dataset.section);
    });
  });

  // Dashboard panel links
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-section]');
    if (link && !link.classList.contains('nav-item')) {
      e.preventDefault();
      navigateTo(link.dataset.section);
    }
  });

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Primary action button
  document.getElementById('primaryBtn').addEventListener('click', primaryAction);

  // Modal
  document.getElementById('modalSave').addEventListener('click', () => {
    if (S.modalSave && S.modalSave() !== false) closeModal();
    else if (!S.modalSave) closeModal();
  });
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Confirm
  document.getElementById('confirmOk').addEventListener('click', () => {
    if (S.confirmOk) S.confirmOk();
    closeConfirm();
  });
  document.getElementById('confirmCancel').addEventListener('click', closeConfirm);
  document.getElementById('confirmOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirmOverlay')) closeConfirm();
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeConfirm(); }
    const isTyping = e.target?.matches?.('input, textarea, select, [contenteditable="true"]');
    const hasOverlayOpen = document.getElementById('modalOverlay')?.classList.contains('open') ||
      document.getElementById('confirmOverlay')?.classList.contains('open');
    if (isTyping || !e.ctrlKey || e.shiftKey || e.metaKey) return;

    const key = e.key.toLowerCase();
    if (key === 'b' && !e.altKey) {
      e.preventDefault();
      document.getElementById('sidebar')?.classList.toggle('collapsed');
      return;
    }
    if (key === 'n' && e.altKey && !hasOverlayOpen) {
      e.preventDefault();
      primaryAction();
      return;
    }
    if (!e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      navigateByShortcut(e.key === 'ArrowRight' ? 'next' : 'prev');
    }
  });

  // Project filters
  document.querySelectorAll('#section-projects .ftab').forEach(btn => {
    btn.addEventListener('click', () => renderProjects(btn.dataset.filter));
  });

  // Prompt filters
  document.querySelectorAll('#section-prompts .ftab').forEach(btn => {
    btn.addEventListener('click', () => renderPrompts(btn.dataset.filter));
  });

  // Financial filters
  document.querySelectorAll('#section-financial .ftab').forEach(btn => {
    btn.addEventListener('click', () => {
      S.finFilter = btn.dataset.filter;
      renderFinancial();
    });
  });

  // Kanban "add task" buttons
  document.querySelectorAll('.k-add').forEach(btn => {
    btn.addEventListener('click', () => newTask(btn.dataset.col));
  });

  // Global search
  document.getElementById('globalSearch').addEventListener('input', globalSearchHandler);
  document.getElementById('globalSearch').addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.target.value = '';
      globalSearchClose();
    }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-box')) globalSearchClose();
  });

  // Notifications
  document.getElementById('notifBtn').addEventListener('click', e => {
    e.stopPropagation();
    toggleNotifPanel();
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#notifWrap')) closeNotifPanel();
  });
}

/* ===== PASSWORD ACCESS ===== */

function showLoader() {
  document.getElementById('loaderScreen').style.display = 'flex';
}

function showLoginError(msg) {
  const err = document.getElementById('loginError');
  err.innerHTML = `<i class='bx bx-error-circle'></i> ${msg}`;
  err.style.display = 'flex';
}

function unlockApp() {
  const loginScreen = document.getElementById('loginScreen');
  loginScreen.classList.add('out');
  setTimeout(async () => {
    loginScreen.remove();
    showLoader();
    await startApp();
  }, 450);
}

function checkAccessPassword() {
  const pass = document.getElementById('accessPassword').value;
  const btn = document.getElementById('accessBtn');
  const input = document.getElementById('accessPassword');

  if (!pass) { showLoginError('Informe a senha.'); return; }
  document.getElementById('loginError').style.display = 'none';

  btn.disabled = true;
  btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Entrando...`;

  if (pass !== ACCESS_PASSWORD) {
    btn.disabled = false;
    btn.innerHTML = `<i class='bx bx-log-in-circle'></i> Entrar`;
    showLoginError('Senha incorreta.');
    input.classList.remove('input-shake');
    void input.offsetWidth;
    input.classList.add('input-shake');
    return;
  }

  writeStore(ACCESS_SESSION_KEY, { ok: true });
  unlockApp();
}

async function startApp() {
  await loadProfiles();
  const existingData = await loadAll();
  seedIfEmpty(existingData);
  seedV2(existingData);
  seedNotes(existingData);
  bindEvents();
  initJarvis();
  initNotes();
  if (!projectRhythmInterval) {
    projectRhythmInterval = setInterval(() => {
      if (S.section === 'dashboard') renderProjectRhythm();
    }, 1000);
  }
  navigateTo('dashboard');
  setTimeout(() => {
    const loader = document.getElementById('loaderScreen');
    if (loader) { loader.classList.add('out'); setTimeout(() => loader.remove(), 580); }
  }, 3000);
}

/* ====================================================
   BUSCA GLOBAL
   ==================================================== */

function globalSearchClose() {
  const panel = document.getElementById('searchResults');
  if (panel) panel.classList.remove('open');
}

function globalSearchHandler() {
  const q     = (document.getElementById('globalSearch').value || '').trim().toLowerCase();
  const panel = document.getElementById('searchResults');
  if (!panel) return;

  if (q.length < 2) { globalSearchClose(); return; }

  const groups = [];

  const tasks = S.tasks.filter(t =>
    t.title.toLowerCase().includes(q) || (t.project||'').toLowerCase().includes(q)
  ).slice(0, 4);
  if (tasks.length) groups.push({ label: 'Tarefas', icon: 'bx-check-square', bg: '--blue-dim', color: '--blue', section: 'tasks', items: tasks.map(t => ({ title: t.title, sub: t.project || 'Tarefa', id: null })) });

  const projects = S.projects.filter(p =>
    p.name.toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q)
  ).slice(0, 3);
  if (projects.length) groups.push({ label: 'Projetos', icon: 'bx-folder-open', bg: '--amber-dim', color: '--amber', section: 'projects', items: projects.map(p => ({ title: p.name, sub: p.status, id: null })) });

  const ideas = S.ideas.filter(i =>
    i.name.toLowerCase().includes(q) || (i.problem||'').toLowerCase().includes(q)
  ).slice(0, 3);
  if (ideas.length) groups.push({ label: 'Ideias', icon: 'bx-bulb', bg: '--purple-dim', color: '--purple', section: 'ideas', items: ideas.map(i => ({ title: i.name, sub: i.status, id: null })) });

  const notes = S.notes.filter(n =>
    n.type === 'note' && (n.name.toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q))
  ).slice(0, 5);
  if (notes.length) groups.push({ label: 'Notas', icon: 'bx-notepad', bg: '--green-dim', color: '--green', section: 'notes', items: notes.map(n => {
    const folder = n.parentId ? S.notes.find(f => f.id === n.parentId) : null;
    return { title: n.name, sub: folder ? folder.name : 'Notas', noteId: n.id };
  })});

  const contacts = S.contacts.filter(c =>
    c.name.toLowerCase().includes(q) || (c.company||'').toLowerCase().includes(q)
  ).slice(0, 3);
  if (contacts.length) groups.push({ label: 'CRM', icon: 'bx-user-circle', bg: '--blue-dim', color: '--blue', section: 'crm', items: contacts.map(c => ({ title: c.name, sub: c.company || 'Contato', id: null })) });

  if (!groups.length) {
    panel.innerHTML = `<div class="search-empty"><i class='bx bx-search-alt'></i>Nenhum resultado para "<strong>${q}</strong>"</div>`;
    panel.classList.add('open');
    return;
  }

  panel.innerHTML = groups.map((g, gi) => `
    ${gi > 0 ? '<hr class="search-divider">' : ''}
    <div class="search-group-label">${g.label}</div>
    ${g.items.map(item => `
      <div class="search-result-item" data-section="${g.section}" data-note-id="${item.noteId || ''}">
        <div class="search-result-icon" style="background:var(${g.bg});color:var(${g.color})">
          <i class='bx ${g.icon}'></i>
        </div>
        <div class="search-result-text">
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-sub">${item.sub}</div>
        </div>
      </div>`).join('')}`).join('');

  panel.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const { section, noteId } = el.dataset;
      navigateTo(section);
      if (section === 'notes' && noteId) setTimeout(() => notesOpenNote(noteId), 60);
      document.getElementById('globalSearch').value = '';
      globalSearchClose();
    });
  });

  panel.classList.add('open');
}

/* ====================================================
   NOTAS
   ==================================================== */

let notesCurrentId       = null;
let notesSaveTimer       = null;
let notesExpandedFolders = new Set();
let ntbSavedRange        = null;

const NTB_FG = ['#F0F2F8','#8A93A6','#545D70','#FFFFFF','#2563EB','#4D8EFF','#22C55E','#F5A623','#FF4757','#9B6DFF','#EC4899','#F97316'];
const NTB_BG = [null,'rgba(37,99,235,0.28)','rgba(34,197,94,0.28)','rgba(245,166,35,0.28)','rgba(255,71,87,0.22)','rgba(155,109,255,0.28)','rgba(255,235,59,0.45)','rgba(255,105,180,0.28)'];

function mdToHtml(md) {
  if (!md) return '';
  let h = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Fenced code blocks
  h = h.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${code.trim()}</code></pre>`);
  // Inline code
  h = h.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  // Headers
  h = h.replace(/^###\s(.+)$/gm, '<h3>$1</h3>');
  h = h.replace(/^##\s(.+)$/gm,  '<h2>$1</h2>');
  h = h.replace(/^#\s(.+)$/gm,   '<h1>$1</h1>');
  // HR
  h = h.replace(/^[-*_]{3,}$/gm, '<hr>');
  // Blockquote
  h = h.replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>');
  // Bold + italic
  h = h.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
  h = h.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // Links
  h = h.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Lists
  h = h.replace(/((?:^[-*]\s.+(?:\n|$))+)/gm, match => {
    const items = match.trim().split('\n')
      .map(l => {
        const text = l.replace(/^[-*]\s/, '');
        if (/^\[x\]/i.test(text)) return `<li class="task-done"><input type="checkbox" checked disabled> ${text.slice(3)}</li>`;
        if (/^\[ \]/.test(text))  return `<li class="task-todo"><input type="checkbox" disabled> ${text.slice(3)}</li>`;
        return `<li>${text}</li>`;
      }).join('');
    return `<ul>${items}</ul>`;
  });
  h = h.replace(/((?:^\d+\.\s.+(?:\n|$))+)/gm, match => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\.\s/, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });
  // Paragraphs
  const blocks = h.split(/\n{2,}/);
  h = blocks.map(b => {
    b = b.trim();
    if (!b) return '';
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr)/.test(b)) return b;
    return `<p>${b.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
  return h;
}

function renderNotesTree() {
  const tree = document.getElementById('notesTree');
  if (!tree) return;
  tree.innerHTML = '';
  const roots = S.notes.filter(n => n.parentId === null);
  notesRenderItems(tree, roots, 0);
}

function notesRenderItems(container, items, depth) {
  const folders = items.filter(n => n.type === 'folder').sort((a,b) => a.name.localeCompare(b.name));
  const notes   = items.filter(n => n.type === 'note').sort((a,b) => a.name.localeCompare(b.name));

  for (const folder of folders) {
    const isOpen = notesExpandedFolders.has(folder.id);
    const wrap   = document.createElement('div');
    wrap.className = 'notes-tree-folder';

    const head = document.createElement('div');
    head.className = `notes-tree-item notes-tree-folder-head${isOpen ? ' open' : ''}`;
    head.style.paddingLeft = `${12 + depth * 12}px`;
    head.dataset.id = folder.id;
    head.innerHTML = `
      <i class='bx bx-chevron-right notes-chevron'></i>
      <i class='bx bxs-folder notes-icon'></i>
      <span class="notes-item-name">${folder.name}</span>
      <div class="notes-item-actions">
        <button class="notes-action-btn" data-action="new-note" data-id="${folder.id}" title="Nova nota aqui"><i class='bx bx-plus'></i></button>
        <button class="notes-action-btn" data-action="rename" data-id="${folder.id}" title="Renomear"><i class='bx bx-pencil'></i></button>
        <button class="notes-action-btn" data-action="delete" data-id="${folder.id}" title="Excluir"><i class='bx bx-trash'></i></button>
      </div>`;

    const children = document.createElement('div');
    children.className = 'notes-tree-children';
    children.style.display = isOpen ? 'block' : 'none';

    head.addEventListener('click', e => {
      if (e.target.closest('.notes-action-btn')) return;
      if (notesExpandedFolders.has(folder.id)) notesExpandedFolders.delete(folder.id);
      else notesExpandedFolders.add(folder.id);
      renderNotesTree();
    });

    wrap.appendChild(head);
    wrap.appendChild(children);
    container.appendChild(wrap);

    const childItems = S.notes.filter(n => n.parentId === folder.id);
    notesRenderItems(children, childItems, depth + 1);
  }

  for (const note of notes) {
    const el = document.createElement('div');
    el.className = `notes-tree-item notes-tree-note${note.id === notesCurrentId ? ' active' : ''}`;
    el.style.paddingLeft = `${28 + depth * 12}px`;
    el.dataset.id = note.id;
    el.innerHTML = `
      <i class='bx bx-file notes-icon'></i>
      <span class="notes-item-name">${note.name}</span>
      <div class="notes-item-actions">
        <button class="notes-action-btn" data-action="rename" data-id="${note.id}" title="Renomear"><i class='bx bx-pencil'></i></button>
        <button class="notes-action-btn" data-action="delete" data-id="${note.id}" title="Excluir"><i class='bx bx-trash'></i></button>
      </div>`;
    el.addEventListener('click', e => {
      if (e.target.closest('.notes-action-btn')) return;
      notesOpenNote(note.id);
    });
    container.appendChild(el);
  }
}

function notesOpenNote(id) {
  const note = S.notes.find(n => n.id === id);
  if (!note || note.type !== 'note') return;
  notesCurrentId = id;

  document.getElementById('notesEmpty').style.display  = 'none';
  document.getElementById('notesEditor').style.display = 'flex';
  document.getElementById('notesTitleInput').value     = note.name;
  document.getElementById('notesAutosave').textContent = '';

  const body = document.getElementById('notesBody');
  const isHtml = /<[a-z][\s\S]*>/i.test(note.content || '');
  body.innerHTML = isHtml ? (note.content || '') : (note.content ? mdToHtml(note.content) : '');

  const updated = note.updatedAt ? new Date(note.updatedAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
  document.getElementById('notesMeta').textContent = updated ? `Atualizado ${updated}` : '';

  renderNotesTree();
  setTimeout(() => body.focus(), 60);
}

function notesSaveContent(showFeedback = false) {
  if (!notesCurrentId) return;
  const note = S.notes.find(n => n.id === notesCurrentId);
  if (!note) return;
  note.name      = document.getElementById('notesTitleInput').value.trim() || 'Sem título';
  note.content   = document.getElementById('notesBody').innerHTML;
  note.updatedAt = new Date().toISOString();
  saveNotes();
  renderNotesTree();
  const updated = new Date(note.updatedAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  document.getElementById('notesMeta').textContent = `Atualizado ${updated}`;
  if (showFeedback) {
    const el = document.getElementById('notesAutosave');
    el.textContent = 'Salvo';
    setTimeout(() => { el.textContent = ''; }, 1800);
  }
}

function notesAutoSave() {
  clearTimeout(notesSaveTimer);
  notesSaveTimer = setTimeout(() => notesSaveContent(true), 1200);
}

function notesNewFolder(parentId = null) {
  openModal('Nova Pasta', `
    <div class="form-group">
      <label class="form-label">Nome da pasta</label>
      <input class="form-input" id="mFolderName" placeholder="Ex: Projetos" autofocus>
    </div>`, () => {
    const name = document.getElementById('mFolderName').value.trim();
    if (!name) return false;
    S.notes.push({ id: uid(), type: 'folder', name, parentId, createdAt: new Date().toISOString(), owner_id: currentUserId, owner_name: currentUserName });
    saveNotes();
    renderNotesTree();
    toast('Pasta criada!', 'success');
  });
  setTimeout(() => document.getElementById('mFolderName')?.focus(), 50);
}

function notesNewNote(parentId = null) {
  openModal('Nova Nota', `
    <div class="form-group">
      <label class="form-label">Nome da nota</label>
      <input class="form-input" id="mNoteName" placeholder="Ex: Ideias de produto" autofocus>
    </div>`, () => {
    const name = document.getElementById('mNoteName').value.trim();
    if (!name) return false;
    const note = { id: uid(), type: 'note', name, parentId, content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), owner_id: currentUserId, owner_name: currentUserName };
    S.notes.push(note);
    saveNotes();
    if (parentId) notesExpandedFolders.add(parentId);
    notesOpenNote(note.id);
    toast('Nota criada!', 'success');
  });
  setTimeout(() => document.getElementById('mNoteName')?.focus(), 50);
}

function notesRenameItem(id) {
  const item = S.notes.find(n => n.id === id);
  if (!item) return;
  openModal(`Renomear ${item.type === 'folder' ? 'Pasta' : 'Nota'}`, `
    <div class="form-group">
      <label class="form-label">Novo nome</label>
      <input class="form-input" id="mRenameVal" value="${item.name}" autofocus>
    </div>`, () => {
    const name = document.getElementById('mRenameVal').value.trim();
    if (!name) return false;
    item.name = name;
    saveNotes();
    if (notesCurrentId === id) document.getElementById('notesTitleInput').value = name;
    renderNotesTree();
    toast('Renomeado!', 'success');
  });
  setTimeout(() => { const el = document.getElementById('mRenameVal'); el?.focus(); el?.select(); }, 50);
}

function notesDeleteItem(id) {
  const item = S.notes.find(n => n.id === id);
  if (!item) return;
  const isFolder = item.type === 'folder';
  const label = isFolder ? `a pasta "${item.name}" e todo seu conteúdo` : `a nota "${item.name}"`;
  document.getElementById('confirmOverlay').classList.add('open');
  document.querySelector('.confirm-heading').textContent = `Excluir ${label}?`;
  S.confirmOk = () => {
    if (isFolder) {
      const idsToRemove = new Set([id]);
      const collectChildren = pid => {
        S.notes.filter(n => n.parentId === pid).forEach(n => { idsToRemove.add(n.id); if (n.type === 'folder') collectChildren(n.id); });
      };
      collectChildren(id);
      if (idsToRemove.has(notesCurrentId)) {
        notesCurrentId = null;
        document.getElementById('notesEmpty').style.display  = 'flex';
        document.getElementById('notesEditor').style.display = 'none';
      }
      S.notes = S.notes.filter(n => !idsToRemove.has(n.id));
    } else {
      S.notes = S.notes.filter(n => n.id !== id);
      if (notesCurrentId === id) {
        notesCurrentId = null;
        document.getElementById('notesEmpty').style.display  = 'flex';
        document.getElementById('notesEditor').style.display = 'none';
      }
    }
    saveNotes();
    renderNotesTree();
    toast('Excluído!', 'success');
  };
}

function ntbExec(cmd, value = null) {
  document.getElementById('notesBody')?.focus();
  document.execCommand(cmd, false, value);
  ntbUpdateState();
}

function ntbUpdateState() {
  document.querySelectorAll('.ntb-btn[data-cmd]').forEach(btn => {
    try { btn.classList.toggle('active', document.queryCommandState(btn.dataset.cmd)); } catch(_) {}
  });
  try {
    const block = document.queryCommandValue('formatBlock').toLowerCase().replace(/[<>]/g, '');
    const sel = document.getElementById('ntbBlock');
    if (sel) sel.value = ['h1','h2','h3'].includes(block) ? block : 'p';
  } catch(_) {}
}

function ntbSaveRange() {
  const sel = window.getSelection();
  ntbSavedRange = sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
}

function ntbRestoreRange() {
  if (!ntbSavedRange) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(ntbSavedRange);
  document.getElementById('notesBody')?.focus();
}

function ntbBuildPalette(paletteEl, colors, applyFn, barId) {
  paletteEl.innerHTML = '';
  colors.forEach(color => {
    const sw = document.createElement('div');
    sw.className = 'ntb-swatch' + (color === null ? ' none' : '');
    if (color) sw.style.background = color;
    sw.addEventListener('mousedown', e => {
      e.preventDefault();
      ntbRestoreRange();
      applyFn(color);
      const bar = document.getElementById(barId);
      if (bar) bar.style.background = color || 'transparent';
      paletteEl.classList.remove('open');
    });
    paletteEl.appendChild(sw);
  });
}

function initNotes() {
  document.getElementById('notesBtnFolder')?.addEventListener('click', () => notesNewFolder(null));
  document.getElementById('notesBtnNote')?.addEventListener('click', () => notesNewNote(null));

  document.getElementById('notesTree')?.addEventListener('click', e => {
    const btn = e.target.closest('.notes-action-btn');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'rename')   notesRenameItem(id);
    if (action === 'delete')   notesDeleteItem(id);
    if (action === 'new-note') notesNewNote(id);
  });

  // Toolbar command buttons
  document.getElementById('notesToolbar')?.addEventListener('mousedown', e => {
    const btn = e.target.closest('.ntb-btn[data-cmd]');
    if (!btn) return;
    e.preventDefault();
    ntbExec(btn.dataset.cmd);
  });

  // Block format select
  document.getElementById('ntbBlock')?.addEventListener('change', function() {
    document.getElementById('notesBody')?.focus();
    document.execCommand('formatBlock', false, this.value);
    ntbUpdateState();
  });

  // Font select
  document.getElementById('ntbFont')?.addEventListener('change', function() {
    document.getElementById('notesBody')?.focus();
    document.execCommand('fontName', false, this.value);
  });

  // Size select
  document.getElementById('ntbSize')?.addEventListener('change', function() {
    if (!this.value) return;
    document.getElementById('notesBody')?.focus();
    document.execCommand('fontSize', false, this.value);
    this.value = '';
  });

  // Color palettes
  const fgPalette = document.getElementById('ntbFgPalette');
  const bgPalette = document.getElementById('ntbBgPalette');
  if (fgPalette) ntbBuildPalette(fgPalette, NTB_FG, c => ntbExec('foreColor', c), 'ntbFgBar');
  if (bgPalette) ntbBuildPalette(bgPalette, NTB_BG, c => { try { ntbExec('hiliteColor', c || 'transparent'); } catch(_) { ntbExec('backColor', c || 'transparent'); } }, 'ntbBgBar');

  document.getElementById('ntbFgBtn')?.addEventListener('mousedown', e => {
    e.preventDefault(); ntbSaveRange();
    fgPalette?.classList.toggle('open');
    bgPalette?.classList.remove('open');
  });
  document.getElementById('ntbBgBtn')?.addEventListener('mousedown', e => {
    e.preventDefault(); ntbSaveRange();
    bgPalette?.classList.toggle('open');
    fgPalette?.classList.remove('open');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#ntbFgWrap')) fgPalette?.classList.remove('open');
    if (!e.target.closest('#ntbBgWrap')) bgPalette?.classList.remove('open');
  });

  // Editor events
  const body = document.getElementById('notesBody');
  body?.addEventListener('input', () => { notesAutoSave(); ntbUpdateState(); });
  body?.addEventListener('keyup', ntbUpdateState);
  body?.addEventListener('mouseup', ntbUpdateState);
  body?.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') { e.preventDefault(); notesSaveContent(true); }
    }
  });

  document.getElementById('notesTitleInput')?.addEventListener('input', notesAutoSave);
}

/* ====================================================
   JARVIS — Assistente Virtual (Groq)
   ==================================================== */

const JARVIS_MODEL    = 'llama-3.3-70b-versatile';
const JARVIS_KEY_STORE = 'jarvis_groq_key';
const CODE_ASSET_INDEX_STORE = 'motion_code_assets_index_v1';
const CODE_ASSET_SEARCH_REQUEST_STORE = 'motion_code_assets_search_request_v1';

const JARVIS_ASSET_FALLBACK = [
  { id: 'asset-1', title: 'Magnetic CTA', category: 'buttons', categoryLabel: 'Botoes', level: 'Intermediario', desc: 'Botao escuro com brilho e resposta magnetica ao cursor.', tags: ['cta','hover','js','landing','dark'], hasJs: true },
  { id: 'asset-2', title: 'Liquid Button', category: 'buttons', categoryLabel: 'Botoes', level: 'Basico', desc: 'Botao com onda liquida animada para telas modernas.', tags: ['button','css','motion','landing'], hasJs: false },
  { id: 'asset-3', title: 'Neon Border Button', category: 'buttons', categoryLabel: 'Botoes', level: 'Basico', desc: 'Botao dark com borda neon animada sem dependencias.', tags: ['neon','css','dark','landing'], hasJs: false },
  { id: 'asset-4', title: 'Icon Micro Button Set', category: 'buttons', categoryLabel: 'Botoes', level: 'Basico', desc: 'Conjunto de botoes compactos para toolbars.', tags: ['toolbar','icons','app'], hasJs: false },
  { id: 'asset-5', title: 'Split Action Button', category: 'buttons', categoryLabel: 'Botoes', level: 'Intermediario', desc: 'Acao principal com menu secundario compacto.', tags: ['menu','action','dashboard'], hasJs: false },
  { id: 'asset-6', title: 'Pulse Ring CTA', category: 'buttons', categoryLabel: 'Botoes', level: 'Basico', desc: 'Chamada de acao com anel pulsante.', tags: ['pulse','cta','landing'], hasJs: false },
  { id: 'asset-7', title: 'Reveal On Scroll', category: 'animations', categoryLabel: 'Animacoes', level: 'Intermediario', desc: 'Entrada suave de elementos conforme aparecem na tela.', tags: ['scroll','observer','landing'], hasJs: true },
  { id: 'asset-8', title: 'Counter Up', category: 'animations', categoryLabel: 'Animacoes', level: 'Intermediario', desc: 'Contador numerico animado para metricas.', tags: ['metric','number','dashboard'], hasJs: true },
  { id: 'asset-9', title: 'Parallax Tilt', category: 'animations', categoryLabel: 'Animacoes', level: 'Intermediario', desc: 'Card inclina com o movimento do cursor.', tags: ['tilt','hover','card'], hasJs: true },
  { id: 'asset-10', title: 'Typewriter Headline', category: 'text', categoryLabel: 'Text Effects', level: 'Intermediario', desc: 'Texto digitado automaticamente com cursor.', tags: ['headline','typing','landing'], hasJs: true },
  { id: 'asset-11', title: 'Gradient Text Shine', category: 'text', categoryLabel: 'Text Effects', level: 'Basico', desc: 'Headline com gradiente animado de brilho.', tags: ['gradient','headline','landing'], hasJs: false },
  { id: 'asset-12', title: 'Scramble Text Hover', category: 'text', categoryLabel: 'Text Effects', level: 'Avancado', desc: 'Texto embaralha letras ao passar o mouse.', tags: ['hover','letters','dark'], hasJs: true },
  { id: 'asset-13', title: 'Glass Product Card', category: 'cards', categoryLabel: 'Cards', level: 'Basico', desc: 'Card glassmorphism com acao e badge.', tags: ['glass','product','landing','dark'], hasJs: false },
  { id: 'asset-14', title: 'Pricing Card', category: 'cards', categoryLabel: 'Cards', level: 'Basico', desc: 'Card de plano com lista de beneficios.', tags: ['pricing','saas','landing'], hasJs: false },
  { id: 'asset-15', title: 'Stat Stack Card', category: 'cards', categoryLabel: 'Cards', level: 'Basico', desc: 'Card compacto para dashboard com delta.', tags: ['dashboard','metric','dark'], hasJs: false },
  { id: 'asset-21', title: 'Mesh Gradient Background', category: 'backgrounds', categoryLabel: 'Backgrounds', level: 'Basico', desc: 'Fundo com manchas suaves animadas.', tags: ['mesh','gradient','hero','landing'], hasJs: false },
  { id: 'asset-22', title: 'Grid Glow Background', category: 'backgrounds', categoryLabel: 'Backgrounds', level: 'Basico', desc: 'Grade tecnica para dashboards e landing pages dark.', tags: ['grid','background','dark','hero'], hasJs: false },
  { id: 'asset-25', title: 'Animated Nav Pill', category: 'menus', categoryLabel: 'Menus', level: 'Intermediario', desc: 'Menu com indicador que acompanha a aba ativa.', tags: ['nav','tabs','landing'], hasJs: true },
  { id: 'asset-29', title: 'Floating Label Input', category: 'forms', categoryLabel: 'Inputs', level: 'Basico', desc: 'Input com label flutuante acessivel.', tags: ['input','form','login'], hasJs: false },
  { id: 'asset-33', title: 'Bento Layout', category: 'layouts', categoryLabel: 'Layouts', level: 'Basico', desc: 'Layout bento para apresentar features.', tags: ['bento','features','landing'], hasJs: false }
];

let jarvisOpen     = false;
let jarvisMessages = [];
let jarvisBusy     = false;
let jarvisGreeted  = false;

const JARVIS_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_summary',
      description: 'Retorna resumo completo do Motion Hub: tarefas, projetos, hábitos, metas e financeiro.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_tasks',
      description: 'Lista tarefas com filtro opcional por coluna do kanban.',
      parameters: {
        type: 'object',
        properties: {
          col: { type: 'string', enum: ['all','backlog','today','inprogress','done'] }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Cria uma nova tarefa no kanban.',
      parameters: {
        type: 'object',
        properties: {
          title:    { type: 'string' },
          project:  { type: 'string' },
          priority: { type: 'string', enum: ['Alta','Média','Baixa'] },
          due:      { type: 'string', description: 'YYYY-MM-DD (opcional)' },
          col:      { type: 'string', enum: ['backlog','today','inprogress','done'] }
        },
        required: ['title','col']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Atualiza campos de uma tarefa (mover de coluna, prioridade, etc.).',
      parameters: {
        type: 'object',
        properties: {
          id:       { type: 'string' },
          title:    { type: 'string' },
          col:      { type: 'string', enum: ['backlog','today','inprogress','done'] },
          priority: { type: 'string', enum: ['Alta','Média','Baixa'] },
          due:      { type: 'string' },
          project:  { type: 'string' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_task',
      description: 'Exclui uma tarefa pelo ID.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_projects',
      description: 'Lista todos os projetos.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_project',
      description: 'Cria um novo projeto.',
      parameters: {
        type: 'object',
        properties: {
          name:     { type: 'string' },
          desc:     { type: 'string' },
          status:   { type: 'string', enum: ['Ideia','Em desenvolvimento','Validação','Lançado','Pausado'] },
          priority: { type: 'string', enum: ['Alta','Média','Baixa'] },
          progress: { type: 'number', minimum: 0, maximum: 100 }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_habits',
      description: 'Lista hábitos e status de conclusão de hoje.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_habit',
      description: 'Marca ou desmarca um hábito como concluído hoje.',
      parameters: {
        type: 'object',
        properties: {
          id:   { type: 'string' },
          done: { type: 'boolean' }
        },
        required: ['id','done']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_goals',
      description: 'Lista objetivos e OKRs.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Cria uma meta/OKR simples. Use quando o usuario pedir para transformar uma decisao em objetivo acompanhavel.',
      parameters: {
        type: 'object',
        properties: {
          objective: { type: 'string' },
          quarter:   { type: 'string', description: 'Ex: Q3 2026' },
          status:    { type: 'string', enum: ['No prazo','Em risco','Atrasado','Concluido'] },
          key_results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                desc:    { type: 'string' },
                current: { type: 'number' },
                target:  { type: 'number' },
                unit:    { type: 'string' }
              },
              required: ['desc','target']
            }
          }
        },
        required: ['objective']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_idea',
      description: 'Registra uma nova ideia de negócio.',
      parameters: {
        type: 'object',
        properties: {
          name:         { type: 'string' },
          problem:      { type: 'string' },
          audience:     { type: 'string' },
          monetization: { type: 'string' },
          potential:    { type: 'string', enum: ['Alto','Médio','Baixo'] },
          status:       { type: 'string', enum: ['Em análise','Validando','Guardada'] },
          notes:        { type: 'string' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to',
      description: 'Navega para uma seção do Motion Hub.',
      parameters: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            enum: ['dashboard','jarvis','projects','tasks','habits','agenda','ideas','goals','crm','financial','review','prompts','notes']
          }
        },
        required: ['section']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_contacts',
      description: 'Lista contatos do CRM.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_contact',
      description: 'Cria um contato no CRM.',
      parameters: {
        type: 'object',
        properties: {
          name:      { type: 'string' },
          type:      { type: 'string', enum: ['Lead','Cliente','Parceiro','Fornecedor','Investidor'] },
          company:   { type: 'string' },
          contact:   { type: 'string' },
          status:    { type: 'string', enum: ['Novo','Em conversa','Reuniao marcada','Proposta enviada','Fechado','Perdido'] },
          next_step: { type: 'string' },
          notes:     { type: 'string' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_docs',
      description: 'Lista documentos, prompts, scripts e estrategias salvos em Prompts & Docs.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_doc',
      description: 'Cria um documento em Prompts & Docs.',
      parameters: {
        type: 'object',
        properties: {
          title:    { type: 'string' },
          category: { type: 'string', enum: ['Prompt','Script','Estrategia','Briefing','Texto de venda','Anotacao'] },
          content:  { type: 'string' },
          project:  { type: 'string' },
          date:     { type: 'string', description: 'YYYY-MM-DD, padrao hoje' }
        },
        required: ['title','content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_notes',
      description: 'Lista pastas e notas do bloco de notas.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_notes',
      description: 'Busca notas pelo nome ou conteúdo.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Texto a buscar' } },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_note',
      description: 'Lê o conteúdo completo de uma nota pelo ID.',
      parameters: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_note',
      description: 'Cria uma nova nota, opcionalmente dentro de uma pasta existente.',
      parameters: {
        type: 'object',
        properties: {
          name:        { type: 'string', description: 'Nome da nota' },
          content:     { type: 'string', description: 'Conteúdo em markdown' },
          folder_name: { type: 'string', description: 'Nome da pasta onde criar (opcional)' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_transaction',
      description: 'Registra receita ou despesa no financeiro.',
      parameters: {
        type: 'object',
        properties: {
          type:    { type: 'string', enum: ['Receita','Despesa'] },
          desc:    { type: 'string' },
          value:   { type: 'number' },
          project: { type: 'string' },
          date:    { type: 'string', description: 'YYYY-MM-DD, padrão hoje' }
        },
        required: ['type','desc','value']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_transactions',
      description: 'Lista ultimos lancamentos financeiros.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', minimum: 1, maximum: 30 } },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Pesquisa a web em tempo real para temas atuais, validacao de ideias, mercado, concorrentes, tendencias, noticias, ferramentas, dados recentes ou qualquer pergunta que precise de fontes externas atuais. Retorna resultados com links.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Consulta objetiva para pesquisar na web.' },
          max_results: { type: 'number', minimum: 3, maximum: 8 },
          search_depth: { type: 'string', enum: ['basic','advanced'], description: 'Use advanced para validacao de negocio, concorrentes ou pesquisa mais profunda.' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'open_code_assets',
      description: 'Abre a biblioteca Code Assets do Motion Hub em assets.html, opcionalmente ja filtrada por busca, categoria ou asset.',
      parameters: {
        type: 'object',
        properties: {
          query:    { type: 'string' },
          category: { type: 'string', enum: ['all','animations','buttons','cards','loaders','backgrounds','menus','forms','text','layouts'] },
          asset_id: { type: 'string' }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_code_assets',
      description: 'Pesquisa na biblioteca Code Assets e retorna os melhores snippets para um caso de uso. Use antes de abrir/filtrar a biblioteca.',
      parameters: {
        type: 'object',
        properties: {
          query:    { type: 'string', description: 'Ex: 5 botoes bons para landing page dark' },
          category: { type: 'string', enum: ['all','animations','buttons','cards','loaders','backgrounds','menus','forms','text','layouts'] },
          limit:    { type: 'number', minimum: 1, maximum: 10 },
          open:     { type: 'boolean', description: 'Se true, abre assets.html com os filtros aplicados depois de pesquisar.' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'show_choices',
      description: 'Mostra uma caixa de escolha clicavel para o usuario quando houver caminhos possiveis, confirmacao ou planejamento em etapas.',
      parameters: {
        type: 'object',
        properties: {
          title:       { type: 'string' },
          description: { type: 'string' },
          options: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: {
              type: 'object',
              properties: {
                label:  { type: 'string' },
                prompt: { type: 'string', description: 'Texto que sera enviado ou colocado na caixa quando o usuario clicar' }
              },
              required: ['label','prompt']
            }
          }
        },
        required: ['title','options']
      }
    }
  }
];

function jarvisNormalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function jarvisReadAssetIndex() {
  try {
    const stored = JSON.parse(localStorage.getItem(CODE_ASSET_INDEX_STORE) || '{}');
    if (Array.isArray(stored.assets) && stored.assets.length) return stored.assets;
  } catch (_) {}
  return JARVIS_ASSET_FALLBACK;
}

function jarvisSearchCodeAssets(args = {}) {
  const category = args.category || 'all';
  const limit = Math.min(Math.max(+args.limit || 5, 1), 10);
  const rawQuery = args.query || '';
  const query = jarvisNormalize(rawQuery);
  const terms = query.split(/\s+/).filter(term => term.length > 2);
  const aliases = {
    botao: 'buttons',
    botoes: 'buttons',
    button: 'buttons',
    buttons: 'buttons',
    input: 'forms',
    inputs: 'forms',
    form: 'forms',
    formulario: 'forms',
    card: 'cards',
    cards: 'cards',
    loader: 'loaders',
    loading: 'loaders',
    menu: 'menus',
    nav: 'menus',
    texto: 'text',
    headline: 'text',
    animacao: 'animations',
    animacoes: 'animations',
    background: 'backgrounds',
    fundo: 'backgrounds',
    layout: 'layouts',
    landing: 'layouts'
  };
  const inferredCategory = category !== 'all' ? category : terms.map(term => aliases[term]).find(Boolean) || 'all';

  const results = jarvisReadAssetIndex()
    .filter(asset => inferredCategory === 'all' || asset.category === inferredCategory)
    .map(asset => {
      const title = jarvisNormalize(asset.title);
      const tags = jarvisNormalize((asset.tags || []).join(' '));
      const desc = jarvisNormalize(asset.desc);
      const cat = jarvisNormalize(`${asset.category} ${asset.categoryLabel || ''}`);
      const haystack = `${title} ${tags} ${desc} ${cat}`;
      let score = 0;
      terms.forEach(term => {
        if (title.includes(term)) score += 8;
        if (tags.includes(term)) score += 5;
        if (desc.includes(term)) score += 3;
        if (cat.includes(term)) score += 4;
        if (haystack.includes(term)) score += 1;
      });
      if (inferredCategory !== 'all' && asset.category === inferredCategory) score += 10;
      if (query.includes('dark') && haystack.includes('dark')) score += 8;
      if (query.includes('landing') && haystack.includes('landing')) score += 6;
      if (query.includes('cta') && haystack.includes('cta')) score += 6;
      return { ...asset, score };
    })
    .filter(asset => asset.score > 0 || inferredCategory !== 'all')
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map(asset => ({
      id: asset.id,
      title: asset.title,
      category: asset.category,
      categoryLabel: asset.categoryLabel || asset.category,
      level: asset.level,
      desc: asset.desc,
      tags: asset.tags || [],
      hasJs: Boolean(asset.hasJs),
      score: asset.score
    }));

  const request = {
    query: rawQuery,
    category: inferredCategory,
    asset_id: results[0]?.id || '',
    result_ids: results.map(asset => asset.id),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(CODE_ASSET_SEARCH_REQUEST_STORE, JSON.stringify(request));

  return { query: rawQuery, category: inferredCategory, count: results.length, results };
}

function jarvisOpenCodeAssets(args = {}) {
  const params = new URLSearchParams();
  if (args.query) params.set('q', args.query);
  if (args.category && args.category !== 'all') params.set('category', args.category);
  if (args.asset_id) params.set('asset', args.asset_id);
  const request = {
    query: args.query || '',
    category: args.category || 'all',
    asset_id: args.asset_id || '',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(CODE_ASSET_SEARCH_REQUEST_STORE, JSON.stringify(request));
  window.location.href = `assets.html${params.toString() ? `?${params}` : ''}`;
  return { success: true, target: 'assets.html', ...request };
}

async function jarvisRunTool(name, args) {
  const today = new Date().toISOString().slice(0, 10);

  switch (name) {
    case 'get_summary': {
      const income  = S.transactions.filter(t => t.type === 'Receita').reduce((a,t) => a + t.value, 0);
      const expense = S.transactions.filter(t => t.type === 'Despesa').reduce((a,t) => a + t.value, 0);
      return {
        tasks: {
          backlog:    S.tasks.filter(t => t.col === 'backlog').length,
          today:      S.tasks.filter(t => t.col === 'today').length,
          inprogress: S.tasks.filter(t => t.col === 'inprogress').length,
          done:       S.tasks.filter(t => t.col === 'done').length
        },
        projects: {
          total: S.projects.length,
          byStatus: S.projects.reduce((a,p) => { a[p.status] = (a[p.status]||0)+1; return a; }, {})
        },
        habits: { total: S.habits.length, completedToday: S.habits.filter(h => (h.completions||[]).includes(today)).length },
        goals:  { total: S.goals.length },
        financial: { income, expense, balance: income - expense },
        ideas:    { total: S.ideas.length },
        contacts: { total: S.contacts.length }
      };
    }

    case 'list_tasks': {
      const col = args.col || 'all';
      const list = col === 'all' ? S.tasks : S.tasks.filter(t => t.col === col);
      return list.map(t => ({ id: t.id, title: t.title, project: t.project, priority: t.priority, due: t.due, col: t.col }));
    }

    case 'create_task': {
      const t = { id: uid(), title: args.title, project: args.project||'', priority: args.priority||'Média', due: args.due||'', col: args.col||'backlog' };
      S.tasks.push(t);
      saveTasks();
      renderKanban();
      return { success: true, task: t };
    }

    case 'update_task': {
      const i = S.tasks.findIndex(t => t.id === args.id);
      if (i === -1) return { success: false, error: 'Tarefa não encontrada' };
      ['title','col','priority','due','project'].forEach(f => { if (args[f] !== undefined) S.tasks[i][f] = args[f]; });
      saveTasks();
      renderKanban();
      return { success: true, task: S.tasks[i] };
    }

    case 'delete_task': {
      const before = S.tasks.length;
      S.tasks = S.tasks.filter(t => t.id !== args.id);
      saveTasks();
      renderKanban();
      return { success: S.tasks.length < before };
    }

    case 'list_projects':
      return S.projects.map(p => ({ id: p.id, name: p.name, desc: p.desc, status: p.status, priority: p.priority, progress: p.progress }));

    case 'create_project': {
      const p = { id: uid(), name: args.name, desc: args.desc||'', status: args.status||'Ideia', priority: args.priority||'Média', progress: args.progress||0, createdAt: today };
      S.projects.push(p);
      saveProjects();
      renderProjects(S.projectFilter);
      return { success: true, project: p };
    }

    case 'list_habits':
      return S.habits.map(h => ({
        id: h.id, name: h.name, icon: h.icon, category: h.category,
        completedToday: (h.completions||[]).includes(today),
        totalCompletions: (h.completions||[]).length
      }));

    case 'check_habit': {
      const h = S.habits.find(h => h.id === args.id);
      if (!h) return { success: false, error: 'Hábito não encontrado' };
      if (!h.completions) h.completions = [];
      if (args.done && !h.completions.includes(today)) h.completions.push(today);
      else if (!args.done) h.completions = h.completions.filter(d => d !== today);
      saveHabits();
      renderHabits();
      return { success: true, name: h.name, completedToday: args.done };
    }

    case 'list_goals':
      return S.goals.map(g => ({ id: g.id, objective: g.objective, quarter: g.quarter, status: g.status, keyResults: g.keyResults }));

    case 'create_goal': {
      const currentQuarter = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;
      const keyResults = (args.key_results || []).map(kr => ({
        id: uid(),
        desc: kr.desc,
        current: +kr.current || 0,
        target: +kr.target || 1,
        unit: kr.unit || ''
      })).filter(kr => kr.desc);
      const goalStatusMap = { Concluido: 'Conclu\u00eddo' };
      const goal = {
        id: uid(),
        objective: args.objective,
        quarter: args.quarter || currentQuarter,
        status: goalStatusMap[args.status] || args.status || 'No prazo',
        keyResults,
        owner_id: currentUserId,
        owner_name: currentUserName
      };
      S.goals.unshift(goal);
      saveGoals();
      renderGoals();
      return { success: true, goal };
    }

    case 'create_idea': {
      const idea = { id: uid(), name: args.name, problem: args.problem||'', audience: args.audience||'', monetization: args.monetization||'', potential: args.potential||'Médio', status: args.status||'Em análise', notes: args.notes||'' };
      S.ideas.push(idea);
      saveIdeas();
      renderIdeas();
      return { success: true, idea };
    }

    case 'navigate_to':
      navigateTo(args.section);
      return { success: true, section: args.section };

    case 'list_contacts':
      return S.contacts.map(c => ({ id: c.id, name: c.name, type: c.type, company: c.company, status: c.status, nextStep: c.nextStep }));

    case 'create_contact': {
      const contactStatusMap = { 'Reuniao marcada': 'Reuni\u00e3o marcada' };
      const contact = {
        id: uid(),
        name: args.name,
        type: args.type || 'Lead',
        company: args.company || '',
        contact: args.contact || '',
        status: contactStatusMap[args.status] || args.status || 'Novo',
        nextStep: args.next_step || '',
        notes: args.notes || '',
        owner_id: currentUserId,
        owner_name: currentUserName
      };
      S.contacts.unshift(contact);
      saveContacts();
      renderCRM();
      return { success: true, contact };
    }

    case 'list_docs':
      return S.docs.map(d => ({ id: d.id, title: d.title, category: d.category, project: d.project, date: d.date, preview: (d.content || '').slice(0, 220) }));

    case 'create_doc': {
      const categoryMap = { Estrategia: 'Estrat\u00e9gia', Anotacao: 'Anota\u00e7\u00e3o' };
      const doc = {
        id: uid(),
        title: args.title,
        category: categoryMap[args.category] || args.category || 'Anota\u00e7\u00e3o',
        content: args.content,
        project: args.project || '',
        date: args.date || today,
        owner_id: currentUserId,
        owner_name: currentUserName
      };
      S.docs.unshift(doc);
      saveDocs();
      renderPrompts();
      return { success: true, doc: { id: doc.id, title: doc.title, category: doc.category } };
    }

    case 'add_transaction': {
      const tx = { id: uid(), type: args.type, desc: args.desc, value: args.value, project: args.project||'', date: args.date||today };
      S.transactions.push(tx);
      saveTransactions();
      renderFinancial();
      return { success: true, transaction: tx };
    }

    case 'list_transactions': {
      const limit = Math.min(Math.max(+args.limit || 10, 1), 30);
      return [...S.transactions]
        .sort((a,b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, limit)
        .map(t => ({ id: t.id, type: t.type, desc: t.desc, value: t.value, project: t.project, date: t.date }));
    }

    case 'search_code_assets': {
      const search = jarvisSearchCodeAssets(args);
      if (args.open) {
        jarvisOpenCodeAssets({
          query: args.query,
          category: search.category,
          asset_id: search.results[0]?.id || ''
        });
      }
      return search;
    }

    case 'web_search':
      return jarvisWebSearch(args);

    case 'open_code_assets':
      return jarvisOpenCodeAssets(args);

    case 'show_choices':
      jarvisAppendChoices(args.title, args.description || '', args.options || []);
      return { success: true, rendered: true };

    case 'list_notes': {
      const folders = S.notes.filter(n => n.type === 'folder').map(f => ({
        id: f.id, name: f.name,
        notes: S.notes.filter(n => n.type === 'note' && n.parentId === f.id).map(n => ({ id: n.id, name: n.name, updatedAt: n.updatedAt }))
      }));
      const rootNotes = S.notes.filter(n => n.type === 'note' && !n.parentId).map(n => ({ id: n.id, name: n.name, updatedAt: n.updatedAt }));
      return { folders, rootNotes };
    }

    case 'search_notes': {
      const q = (args.query || '').toLowerCase();
      const found = S.notes.filter(n => n.type === 'note' && (n.name.toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q)));
      return found.map(n => {
        const folder = n.parentId ? S.notes.find(f => f.id === n.parentId) : null;
        const idx = (n.content||'').toLowerCase().indexOf(q);
        const excerpt = idx >= 0 ? '…' + (n.content||'').slice(Math.max(0, idx - 40), idx + 80) + '…' : '';
        return { id: n.id, name: n.name, folder: folder?.name || null, excerpt };
      });
    }

    case 'read_note': {
      const note = S.notes.find(n => n.id === args.id && n.type === 'note');
      if (!note) return { success: false, error: 'Nota não encontrada' };
      return { id: note.id, name: note.name, content: note.content, updatedAt: note.updatedAt };
    }

    case 'create_note': {
      let parentId = null;
      if (args.folder_name) {
        const folder = S.notes.find(n => n.type === 'folder' && n.name.toLowerCase() === args.folder_name.toLowerCase());
        if (folder) { parentId = folder.id; notesExpandedFolders.add(folder.id); }
      }
      const note = { id: uid(), type: 'note', name: args.name, content: args.content || '', parentId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      S.notes.push(note);
      saveNotes();
      if (S.section === 'notes') { renderNotesTree(); setTimeout(() => notesOpenNote(note.id), 50); }
      return { success: true, note: { id: note.id, name: note.name, folder: args.folder_name || null } };
    }

    default:
      return { error: `Ferramenta desconhecida: ${name}` };
  }
}

function jarvisBuildHubSnapshot() {
  const activeProjects = S.projects
    .filter(p => p.status === 'Em desenvolvimento' || p.status === 'Validação' || p.status === 'Validando')
    .slice(0, 5)
    .map(p => `${p.name} (${p.status}, ${p.progress || 0}%)`);
  const priorityTasks = S.tasks
    .filter(t => t.priority === 'Alta' && t.col !== 'done')
    .slice(0, 6)
    .map(t => `${t.title}${t.project ? ` - ${t.project}` : ''}`);
  const openFollowUps = S.contacts
    .filter(c => c.nextStep)
    .slice(0, 5)
    .map(c => `${c.name}: ${c.nextStep}`);
  const income = S.transactions.filter(t => t.type === 'Receita').reduce((sum, t) => sum + (+t.value || 0), 0);
  const expense = S.transactions.filter(t => t.type === 'Despesa').reduce((sum, t) => sum + (+t.value || 0), 0);
  const rhythm = getProjectRhythm();
  const timeSummary = getProjectTimeSummary(rhythm);
  const timeByProject = Object.entries(timeSummary.byProject)
    .sort((a, b) => b[1] - a[1])
    .map(([project, sec]) => `${project}: ${formatWorkTime(sec)}`)
    .join('; ');

  return [
    `Projetos: ${S.projects.length}. Ativos: ${activeProjects.join('; ') || 'nenhum'}.`,
    `Tarefas abertas: ${S.tasks.filter(t => t.col !== 'done').length}. Prioridades: ${priorityTasks.join('; ') || 'nenhuma'}.`,
    `Ideias: ${S.ideas.length}. CRM: ${S.contacts.length} contatos. Follow-ups: ${openFollowUps.join('; ') || 'nenhum'}.`,
    `Financeiro: entradas ${fmtCurrency(income)}, saidas ${fmtCurrency(expense)}, saldo ${fmtCurrency(income - expense)}.`,
    `Ritmo dos projetos hoje: ${timeByProject || 'nenhum tempo registrado'}. Projeto atual: ${rhythm.timer?.project || rhythm.activeProject || 'nenhum'}.`,
    `Notas: ${S.notes.filter(n => n.type === 'note').length}. Secao atual: ${sectionMeta[S.section]?.label || S.section}.`
  ].join('\n');
}

function jarvisBuildSystemPrompt() {
  return `Voce e o Jarvis, assistente pessoal de Vitor Falcao integrado ao Motion Hub.

Papel principal:
- Seja um assistente generalista inteligente: responda duvidas sobre negocios, tecnologia, produto, marketing, vendas, financas, estudos, estrategia e temas gerais.
- Seja tambem um parceiro estrategico de execucao: conecte respostas ao contexto real do Motion Hub quando isso ajudar.
- Nao espere o usuario apertar um botao ou escolher um modo. Perceba a intencao pela mensagem.

Quando detectar uma ideia nova de negocio, oportunidade, SaaS, produto, projeto, campanha ou validacao:
- Atue como consultor de negocios e produto.
- Estruture a resposta com: ideia resumida, problema/dor, publico-alvo, proposta de valor, alternativas/concorrentes, MVP, monetizacao, canais, riscos, perguntas criticas e plano de validacao.
- Se a ideia estiver vaga, faca 2 a 4 perguntas boas ou use show_choices para caminhos possiveis.
- Se houver informacao suficiente, entregue um plano pratico de proximos passos e sugira tarefas/projeto/nota que podem ser salvos no Hub.

Quando o usuario pedir opiniao ou tiver duvida geral:
- Responda diretamente, com clareza e raciocinio.
- Separe fatos de inferencias quando estiver estimando.
- Evite enrolacao. Seja util, especifico e proativo.

Uso de ferramentas:
- Use ferramentas quando o usuario pedir para criar, mover, atualizar, excluir, listar ou consultar dados do Motion Hub.
- Use web_search quando a pergunta depender de informacao atual, mercado, concorrentes, noticias, precos, tendencias, ferramentas recentes, leis, dados externos ou validacao de uma ideia no mundo real.
- Ao usar web_search, cite as fontes principais com links no fim da resposta e deixe claro quando algo for inferencia sua.
- Para perguntas gerais, nao use ferramentas sem necessidade.
- Antes de alterar dados importantes, confirme se o pedido estiver ambiguo.
- Depois de executar uma acao, confirme brevemente o que foi feito.

Hoje e ${new Date().toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}.
Responda sempre em portugues brasileiro.

Contexto atual do Motion Hub:
${jarvisBuildHubSnapshot()}`;
}

async function jarvisWebSearch(args = {}) {
  const query = String(args.query || '').trim();
  if (!query) return { success: false, error: 'Informe uma busca em query.' };

  try {
    const res = await fetch('/api/web-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        max_results: args.max_results || 6,
        search_depth: args.search_depth || 'basic'
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      return { success: false, error: data.error || `Pesquisa web HTTP ${res.status}` };
    }
    return data;
  } catch (error) {
    return { success: false, error: error.message || 'Falha ao pesquisar na web.' };
  }
}

async function jarvisCallGroq(messages) {
  const key = localStorage.getItem(JARVIS_KEY_STORE);
  const systemPrompt = jarvisBuildSystemPrompt();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: JARVIS_MODEL,
      messages: [{
        role: 'system',
        content: `${systemPrompt}

Secao atual do usuario no Hub: ${sectionMeta[S.section]?.label || S.section}.
Use show_choices quando houver varios caminhos bons, quando faltar uma decisao importante, ou quando o usuario pedir um plano. As opcoes devem ser curtas, acionaveis e em portugues brasileiro.`
        + `
Para pedidos sobre componentes, snippets, botoes, inputs, cards, loaders, animacoes ou landing pages, use search_code_assets. Quando fizer sentido, ofereca abrir a biblioteca filtrada com open_code_assets.`
      }, ...messages],
      tools: JARVIS_TOOLS,
      tool_choice: 'auto',
      parallel_tool_calls: false,
      max_tokens: 1600
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0];
}

async function jarvisCallGroqNoTools(messages) {
  const key = localStorage.getItem(JARVIS_KEY_STORE);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: JARVIS_MODEL,
      messages,
      max_tokens: 1600
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0];
}

async function jarvisSend(source = 'panel') {
  const input = document.getElementById(source === 'page' ? 'jarvisPageInput' : 'jarvisInput');
  const text  = input?.value?.trim();
  if (!text || jarvisBusy) return;

  const key = localStorage.getItem(JARVIS_KEY_STORE);
  if (!key) { jarvisPromptKey(); return; }

  input.value = '';
  input.style.height = 'auto';
  jarvisMessages.push({ role: 'user', content: text });
  jarvisAppendMsg('user', text);
  jarvisSetBusy(true);

  try {
    const jarvisFallbackMsgs = () => [
      { role: 'system', content: jarvisBuildSystemPrompt() },
      ...jarvisMessages
    ];

    let choice;
    try {
      choice = await jarvisCallGroq(jarvisMessages);
      if (choice.finish_reason === 'failed_generation') throw new Error('failed_generation');
    } catch (_) {
      choice = await jarvisCallGroqNoTools(jarvisFallbackMsgs());
    }

    while (choice.finish_reason === 'tool_calls') {
      const msg = choice.message;
      jarvisMessages.push(msg);
      for (const tc of msg.tool_calls) {
        const result = await jarvisRunTool(tc.function.name, JSON.parse(tc.function.arguments || '{}'));
        jarvisMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
      try {
        choice = await jarvisCallGroq(jarvisMessages);
        if (choice.finish_reason === 'failed_generation') throw new Error('failed_generation');
      } catch (_) {
        choice = await jarvisCallGroqNoTools(jarvisFallbackMsgs());
      }
    }

    const reply = choice.message;
    jarvisMessages.push(reply);
    jarvisSetBusy(false);
    jarvisAppendMsg('assistant', reply.content || '…');
  } catch (err) {
    jarvisSetBusy(false);
    jarvisAppendMsg('error', err.message);
  }
}

function jarvisAppendMsg(role, content) {
  ['jarvisMsgList', 'jarvisPageMsgList'].forEach(listId => {
    const list = document.getElementById(listId);
    if (!list) return;
    const div = document.createElement('div');
    div.className = `jarvis-msg jarvis-msg-${role}`;
    if (role === 'user') {
      div.innerHTML = `<div class="jarvis-bubble">${jarvisEsc(content)}</div>`;
    } else if (role === 'assistant') {
      div.innerHTML = `<div class="jarvis-avatar-sm"><i class='bx bx-bot'></i></div><div class="jarvis-bubble">${jarvisMd(content)}</div>`;
    } else {
      div.innerHTML = `<div class="jarvis-bubble"><i class='bx bx-error-circle'></i> ${jarvisEsc(content)}</div>`;
    }
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  });
}

function jarvisAppendChoices(title, description, options) {
  const validOptions = (options || []).filter(opt => opt?.label && opt?.prompt).slice(0, 4);
  if (!validOptions.length) return;

  ['jarvisMsgList', 'jarvisPageMsgList'].forEach(listId => {
    const list = document.getElementById(listId);
    if (!list) return;

    const div = document.createElement('div');
    div.className = 'jarvis-msg jarvis-msg-assistant';
    div.innerHTML = `
      <div class="jarvis-avatar-sm"><i class='bx bx-bot'></i></div>
      <div class="jarvis-bubble jarvis-choice-card">
        <div class="jarvis-choice-title">${jarvisEsc(title || 'Escolha um caminho')}</div>
        ${description ? `<div class="jarvis-choice-desc">${jarvisEsc(description)}</div>` : ''}
        <div class="jarvis-choice-list">
          ${validOptions.map(opt => `
            <button class="jarvis-choice-btn" type="button" data-prompt="${jarvisAttr(opt.prompt)}">
              ${jarvisEsc(opt.label)}
            </button>
          `).join('')}
        </div>
      </div>`;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  });
}

function jarvisRenderHistory() {
  ['jarvisMsgList', 'jarvisPageMsgList'].forEach(id => {
    const list = document.getElementById(id);
    if (list) list.innerHTML = '';
  });
  jarvisMessages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .forEach(msg => jarvisAppendMsg(msg.role, msg.content || ''));
}

function jarvisEsc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function jarvisAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function jarvisMd(s) {
  return jarvisEsc(s)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function jarvisSetBusy(on) {
  jarvisBusy = on;
  const typing = document.getElementById('jarvisTyping');
  const pageTyping = document.getElementById('jarvisPageTyping');
  const btn    = document.getElementById('jarvisSend');
  const pageBtn = document.getElementById('jarvisPageSend');
  if (typing) typing.style.display = on ? 'flex' : 'none';
  if (pageTyping) pageTyping.style.display = on ? 'flex' : 'none';
  if (btn)    btn.disabled = on;
  if (pageBtn) pageBtn.disabled = on;
  if (!on) document.getElementById('jarvisMsgList')?.scrollTo(0, 999999);
  if (!on) document.getElementById('jarvisPageMsgList')?.scrollTo(0, 999999);
}

function jarvisPromptKey() {
  const key = prompt('Cole sua chave API do Groq (armazenada apenas no seu navegador):\n\nObtê-la em: console.groq.com/keys');
  if (key?.trim()) {
    localStorage.setItem(JARVIS_KEY_STORE, key.trim());
    toast('Chave Groq salva!', 'success');
  }
}

function jarvisGreet() {
  if (jarvisGreeted) return;
  jarvisGreeted = true;
  jarvisAppendMsg('assistant', 'Ola, **Vitor**! Sou o **Jarvis**, seu assistente estrategico no Motion Hub. Posso responder duvidas gerais, analisar ideias de negocio, pensar produto, growth, vendas e tambem executar acoes no seu Hub.');
}

function renderJarvisPage() {
  jarvisRenderHistory();
  if (!jarvisMessages.some(msg => msg.role === 'user' || msg.role === 'assistant')) jarvisGreeted = false;
  jarvisGreet();
  setTimeout(() => document.getElementById('jarvisPageInput')?.focus(), 80);
}

function jarvisToggle() {
  jarvisOpen = !jarvisOpen;
  document.getElementById('jarvisPanel')?.classList.toggle('open', jarvisOpen);
  document.getElementById('jarvisBtn')?.classList.toggle('active', jarvisOpen);
  if (jarvisOpen) {
    if (!jarvisGreeted) {
      jarvisGreeted = true;
      jarvisAppendMsg('assistant', 'Ola, **Vitor**! Sou o **Jarvis**, seu assistente estrategico no Motion Hub. Posso responder duvidas gerais, analisar ideias de negocio, pensar produto, growth, vendas e tambem executar acoes no seu Hub.');
    }
    setTimeout(() => document.getElementById('jarvisInput')?.focus(), 120);
  }
}

function initJarvis() {
  document.getElementById('jarvisBtn')?.addEventListener('click', e => { e.stopPropagation(); jarvisToggle(); });
  document.getElementById('jarvisClose')?.addEventListener('click', () => {
    jarvisOpen = false;
    document.getElementById('jarvisPanel')?.classList.remove('open');
    document.getElementById('jarvisBtn')?.classList.remove('active');
  });
  document.getElementById('jarvisSend')?.addEventListener('click', jarvisSend);
  document.getElementById('jarvisInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); jarvisSend(); }
  });
  document.getElementById('jarvisInput')?.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 110) + 'px';
  });
  document.getElementById('jarvisClear')?.addEventListener('click', () => {
    jarvisMessages = [];
    jarvisGreeted  = false;
    jarvisRenderHistory();
    jarvisAppendMsg('assistant', 'Conversa limpa. Como posso ajudar?');
    jarvisGreeted = true;
  });
  document.getElementById('jarvisKeyBtn')?.addEventListener('click', jarvisPromptKey);
  document.getElementById('jarvisPageSend')?.addEventListener('click', () => jarvisSend('page'));
  document.getElementById('jarvisPageInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); jarvisSend('page'); }
  });
  document.getElementById('jarvisPageInput')?.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
  });
  document.getElementById('jarvisPageClear')?.addEventListener('click', () => {
    jarvisMessages = [];
    jarvisGreeted = false;
    jarvisRenderHistory();
    jarvisAppendMsg('assistant', 'Conversa limpa. Como posso ajudar?');
    jarvisGreeted = true;
  });
  document.getElementById('jarvisPageKey')?.addEventListener('click', jarvisPromptKey);
  document.querySelectorAll('.jarvis-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('jarvisPageInput');
      if (!input) return;
      input.value = btn.dataset.prompt || '';
      input.focus();
    });
  });
  document.addEventListener('click', e => {
    const choiceBtn = e.target.closest('.jarvis-choice-btn');
    if (!choiceBtn) return;
    const usePage = S.section === 'jarvis' && document.getElementById('jarvisPageInput');
    const input = document.getElementById(usePage ? 'jarvisPageInput' : 'jarvisInput');
    if (!usePage && !jarvisOpen) jarvisToggle();
    if (!input) return;
    input.value = choiceBtn.dataset.prompt || '';
    input.focus();
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, usePage ? 150 : 110) + 'px';
  });
  document.addEventListener('click', e => {
    if (!jarvisOpen) return;
    const panel = document.getElementById('jarvisPanel');
    const btn   = document.getElementById('jarvisBtn');
    if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
      jarvisOpen = false;
      panel.classList.remove('open');
      btn.classList.remove('active');
    }
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', async () => {
  const access = readStore(ACCESS_SESSION_KEY, null);

  if (access?.ok) {
    document.getElementById('loginScreen').remove();
    showLoader();
    await startApp();
    return;
  }

  document.getElementById('accessBtn').addEventListener('click', checkAccessPassword);
  document.getElementById('accessPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAccessPassword();
  });
  document.getElementById('accessPassword').focus();
});
