const STORE_KEY = 'growth_hub_data_v2';

const seed = {
  clients: [
    { id: 'proceder-auto', name: 'Operacao Automotiva', summary: 'Exemplo de operacao com unidades, leads locais, criativos de prova social e campanhas de aquisicao regional.' },
    { id: 'b2b-services', name: 'Servicos B2B', summary: 'Modelo generalizado para empresas de servico, captacao de leads e acompanhamento comercial.' }
  ],
  activeClientId: 'proceder-auto',
  metrics: {
    leadsMonth: 428,
    costPerLead: 18.72,
    activeCampaigns: 9,
    creativesTested: 34,
    activeUnits: 12,
    adSpend: 8012,
    bestCampaign: 'Compra Segura'
  },
  trend: [
    { label: 'Sem 1', value: 74 },
    { label: 'Sem 2', value: 96 },
    { label: 'Sem 3', value: 118 },
    { label: 'Sem 4', value: 140 }
  ],
  actions: [
    { title: 'Duplicar os 3 melhores criativos por regiao', area: 'Criativos', due: 'Esta semana', priority: 'Alta' },
    { title: 'Revisar CPL acima da meta nas campanhas de topo', area: 'Midia', due: '48h', priority: 'Alta' },
    { title: 'Conferir tempo de resposta dos leads enviados', area: 'Atendimento', due: 'Hoje', priority: 'Media' },
    { title: 'Preparar relatorio executivo do mes', area: 'Relatorios', due: 'Sexta', priority: 'Media' }
  ],
  campaigns: [
    { name: 'Vistoria Rio Preto', objective: 'Gerar leads qualificados', audience: 'Donos de veiculos e compradores locais', region: 'Sao Jose do Rio Preto', budget: 1800, status: 'Ativa', result: '132 leads / CPL R$ 13,64' },
    { name: 'Compra Segura', objective: 'Educar e captar demanda', audience: 'Pessoas comprando carro usado', region: 'Interior SP', budget: 2600, status: 'Ativa', result: '189 leads / 22 agendamentos' },
    { name: 'Seja Parceiro Procede', objective: 'Captar parceiros e unidades', audience: 'Lojistas, despachantes e empreendedores', region: 'Nacional', budget: 1200, status: 'Planejamento', result: 'Briefing e landing em revisao' },
    { name: 'Lead Magnet Diagnostico', objective: 'Topo de funil B2B', audience: 'PMEs com operacao comercial ativa', region: 'Brasil', budget: 900, status: 'Pausada', result: 'CPL alto; ajustar oferta' }
  ],
  creatives: [
    { title: 'Checklist antes de comprar', category: 'Compra de Carro Usado', objective: 'Gerar consciencia e lead', status: 'Usar', tone: 'Educativo' },
    { title: 'Vistoria evita prejuizo', category: 'Vistoria Veicular', objective: 'Conversao direta', status: 'Usar', tone: 'Dor e solucao' },
    { title: 'Transferencia sem erro', category: 'Transferencia', objective: 'Captar demanda local', status: 'Revisar', tone: 'Servico' },
    { title: 'Quem confia na marca', category: 'Prova Social', objective: 'Aumentar confianca', status: 'Revisar', tone: 'Depoimento' },
    { title: 'Abra uma unidade na sua cidade', category: 'Parceiros/Franquias', objective: 'Captar parceiros', status: 'Pausar', tone: 'Oportunidade' }
  ],
  leadStatuses: ['Novo Lead', 'Respondido', 'Qualificado', 'Enviado para Unidade', 'Agendado', 'Fechado', 'Perdido'],
  leads: [
    { name: 'Ana Martins', phone: '(17) 99999-1842', city: 'Rio Preto', interest: 'Vistoria veicular', origin: 'Meta Ads', status: 'Novo Lead', note: 'Quer atendimento hoje.' },
    { name: 'Joao Lima', phone: '(11) 98888-2401', city: 'Sao Paulo', interest: 'Compra segura', origin: 'Landing Page', status: 'Respondido', note: 'Recebeu primeira mensagem.' },
    { name: 'Carla Nunes', phone: '(19) 97777-4433', city: 'Campinas', interest: 'Pesquisa veicular', origin: 'Instagram', status: 'Qualificado', note: 'Tem placa e RENAVAM.' },
    { name: 'Pedro Alves', phone: '(16) 96666-9101', city: 'Ribeirao Preto', interest: 'Transferencia', origin: 'Google Sheets', status: 'Enviado para Unidade', note: 'Unidade recebeu contato.' },
    { name: 'Marina Costa', phone: '(34) 95555-3321', city: 'Uberlandia', interest: 'Franquia', origin: 'Formulario', status: 'Agendado', note: 'Reuniao marcada.' },
    { name: 'Rafael Torres', phone: '(17) 94444-2108', city: 'Rio Preto', interest: 'Vistoria cautelar', origin: 'WhatsApp', status: 'Fechado', note: 'Servico confirmado.' }
  ],
  units: [
    { city: 'Sao Jose do Rio Preto', owner: 'Marcos Vieira', whatsapp: '(17) 99999-0001', status: 'Ativa', campaigns: ['Vistoria Rio Preto', 'Compra Segura'], leads: 132 },
    { city: 'Campinas', owner: 'Renata Prado', whatsapp: '(19) 98888-0002', status: 'Teste', campaigns: ['Compra Segura'], leads: 38 },
    { city: 'Ribeirao Preto', owner: 'Lucas Moraes', whatsapp: '(16) 97777-0003', status: 'Ativa', campaigns: ['Transferencia sem erro'], leads: 54 },
    { city: 'Uberlandia', owner: 'Paula Mendes', whatsapp: '(34) 96666-0004', status: 'Nao iniciada', campaigns: ['Seja Parceiro Procede'], leads: 8 }
  ],
  reports: [
    { period: 'Junho 2026', campaigns: '5 campanhas ativas, 2 testes pausados', results: 'CPL medio em R$ 18,72; 428 leads; melhor volume em Compra Segura.', winners: 'Checklist antes de comprar; Vistoria evita prejuizo', problems: 'Tempo de resposta irregular em duas unidades; baixa conversao em oferta B2B fria.', next: 'Padronizar follow-up, abrir novos angulos de prova social e testar formularios mais curtos.' },
    { period: 'Maio 2026', campaigns: '4 campanhas de aquisicao e 1 remarketing', results: '312 leads; CTR subiu apos troca de headlines; remarketing reduziu CPA.', winners: 'Historico completo do veiculo; Stories atendimento rapido', problems: 'Criativos muito institucionais tiveram baixo engajamento.', next: 'Aumentar verba nos criativos educativos e separar campanhas por cidade.' }
  ]
};

let state = load();
let activeTab = 'overview';
let modalSave = null;

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...structuredClone(seed), ...JSON.parse(raw) } : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function money(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));
}

function badge(status) {
  const map = {
    'Ativa': 'badge-green', 'Usar': 'badge-green', 'Fechado': 'badge-green',
    'Agendado': 'badge-purple', 'Qualificado': 'badge-blue', 'Respondido': 'badge-blue',
    'Teste': 'badge-blue', 'Planejamento': 'badge-amber', 'Revisar': 'badge-amber',
    'Novo Lead': 'badge-amber', 'Enviado para Unidade': 'badge-purple',
    'Pausada': 'badge-red', 'Pausar': 'badge-red', 'Perdido': 'badge-red',
    'Finalizada': 'badge-gray', 'Nao iniciada': 'badge-gray', 'Alta': 'badge-red',
    'Media': 'badge-amber', 'Baixa': 'badge-blue'
  };
  return map[status] || 'badge-gray';
}

function currentClient() {
  return state.clients.find(c => c.id === state.activeClientId) || state.clients[0];
}

function render() {
  renderHeader();
  renderMetrics();
  renderTrend();
  renderActions();
  renderCampaigns();
  renderCreatives();
  renderLeads();
  renderUnits();
  renderReports();
}

function renderHeader() {
  const select = document.getElementById('clientSelect');
  select.innerHTML = state.clients.map(c => `<option value="${esc(c.id)}" ${c.id === state.activeClientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const client = currentClient();
  document.getElementById('clientName').textContent = client.name;
  document.getElementById('clientSummary').textContent = client.summary;
}

function renderMetrics() {
  const m = state.metrics;
  const items = [
    ['leadsMonth', 'bx-user-plus', m.leadsMonth, 'Leads no mes', '+18% vs. mes anterior', '#60a5fa'],
    ['costPerLead', 'bx-purchase-tag-alt', money(m.costPerLead), 'Custo por lead', 'Meta: ate R$ 22', '#22c55e'],
    ['activeCampaigns', 'bx-broadcast', m.activeCampaigns, 'Campanhas ativas', '3 em escala', '#8b5cf6'],
    ['creativesTested', 'bx-images', m.creativesTested, 'Criativos testados', '8 vencedores', '#f59e0b'],
    ['activeUnits', 'bx-map-pin', m.activeUnits, 'Cidades/unidades', '5 em monitoramento', '#3478f6'],
    ['adSpend', 'bx-wallet', money(m.adSpend), 'Verba investida', 'Distribuida por regiao', '#ec4899'],
    ['bestCampaign', 'bx-trophy', m.bestCampaign, 'Melhor campanha', 'Maior volume qualificado', '#22c55e']
  ];
  document.getElementById('metricsGrid').innerHTML = items.map(([key, icon, value, label, hint, color]) => `
    <article class="gh-metric" style="--metric-color:${color}">
      <div class="gh-metric-top">
        <div class="gh-metric-icon"><i class='bx ${icon}'></i></div>
        <button class="gh-edit" onclick="editMetric('${key}')" title="Editar"><i class='bx bx-pencil'></i></button>
      </div>
      <div class="gh-metric-value">${esc(value)}</div>
      <div class="gh-metric-label">${esc(label)}</div>
      <small>${esc(hint)}</small>
    </article>`).join('');
}

function renderTrend() {
  const max = Math.max(...state.trend.map(x => Number(x.value || 0)), 1);
  document.getElementById('leadChart').innerHTML = state.trend.map((p, i) => `
    <div class="gh-bar" onclick="editTrend(${i})">
      <div class="gh-bar-value">${Number(p.value || 0)}</div>
      <div class="gh-bar-track"><div class="gh-bar-fill" style="height:${Math.max(14, (Number(p.value || 0) / max) * 100)}%"></div></div>
      <div class="gh-bar-label">${esc(p.label)}</div>
    </div>`).join('');
}

function renderActions() {
  document.getElementById('actionsList').innerHTML = state.actions.map((a, i) => `
    <div class="gh-action">
      <div class="gh-action-num">${i + 1}</div>
      <div><div class="gh-action-title">${esc(a.title)}</div><div class="gh-action-meta">${esc(a.area)} - ${esc(a.due)}</div></div>
      <span class="gh-badge ${badge(a.priority)}">${esc(a.priority)}</span>
      <button class="gh-edit" onclick="editItem('actions', ${i})"><i class='bx bx-pencil'></i></button>
    </div>`).join('');
}

function renderCampaigns() {
  document.getElementById('campaignsTable').innerHTML = `
    <thead><tr><th>Campanha</th><th>Objetivo</th><th>Publico</th><th>Regiao</th><th>Verba</th><th>Status</th><th>Resultado</th><th></th></tr></thead>
    <tbody>${state.campaigns.map((c, i) => `
      <tr><td><strong>${esc(c.name)}</strong></td><td>${esc(c.objective)}</td><td>${esc(c.audience)}</td><td>${esc(c.region)}</td><td>${money(c.budget)}</td><td><span class="gh-badge ${badge(c.status)}">${esc(c.status)}</span></td><td>${esc(c.result)}</td><td><button class="gh-edit" onclick="editItem('campaigns', ${i})"><i class='bx bx-pencil'></i></button></td></tr>
    `).join('')}</tbody>`;
}

function renderCreatives() {
  document.getElementById('creativesGrid').innerHTML = state.creatives.map((c, i) => `
    <article class="gh-card">
      <button class="gh-edit" onclick="editItem('creatives', ${i})"><i class='bx bx-pencil'></i></button>
      <div class="gh-thumb"><i class='bx bx-image'></i></div>
      <div class="gh-card-body">
        <div class="gh-card-top"><h3>${esc(c.title)}</h3><span class="gh-badge ${badge(c.status)}">${esc(c.status)}</span></div>
        <p>${esc(c.objective)}</p>
        <div class="gh-tags"><span>${esc(c.category)}</span><span>${esc(c.tone)}</span></div>
      </div>
    </article>`).join('');
}

function renderLeads() {
  document.getElementById('leadsBoard').innerHTML = state.leadStatuses.map(status => {
    const leads = state.leads.map((lead, index) => ({ ...lead, index })).filter(l => l.status === status);
    return `<div class="gh-lead-col">
      <div class="gh-lead-head"><span>${esc(status)}</span><strong>${leads.length}</strong></div>
      ${leads.map(l => `<div class="gh-lead"><button class="gh-edit" onclick="editItem('leads', ${l.index})"><i class='bx bx-pencil'></i></button><h4>${esc(l.name)}</h4><p>${esc(l.phone)}</p><p>${esc(l.city)} - ${esc(l.interest)}</p><small>${esc(l.origin)}</small><p>${esc(l.note)}</p></div>`).join('') || '<div class="gh-empty">Sem leads</div>'}
    </div>`;
  }).join('');
}

function renderUnits() {
  document.getElementById('unitsGrid').innerHTML = state.units.map((u, i) => `
    <article class="gh-card">
      <button class="gh-edit" onclick="editItem('units', ${i})"><i class='bx bx-pencil'></i></button>
      <div class="gh-card-body">
        <div class="gh-card-top"><h3>${esc(u.city)}</h3><span class="gh-badge ${badge(u.status)}">${esc(u.status)}</span></div>
        <div class="gh-card-line"><i class='bx bx-user'></i>${esc(u.owner)}</div>
        <div class="gh-card-line"><i class='bx bxl-whatsapp'></i>${esc(u.whatsapp)}</div>
        <div class="gh-tags">${u.campaigns.map(c => `<span>${esc(c)}</span>`).join('')}</div>
        <div class="gh-card-footer"><span>Leads recebidos</span><strong>${Number(u.leads || 0)}</strong></div>
      </div>
    </article>`).join('');
}

function renderReports() {
  document.getElementById('reportsGrid').innerHTML = state.reports.map((r, i) => `
    <article class="gh-report">
      <button class="gh-edit" onclick="editItem('reports', ${i})"><i class='bx bx-pencil'></i></button>
      <h3>${esc(r.period)}</h3>
      <dl>
        <dt>Campanhas testadas</dt><dd>${esc(r.campaigns)}</dd>
        <dt>Principais resultados</dt><dd>${esc(r.results)}</dd>
        <dt>Criativos vencedores</dt><dd>${esc(r.winners)}</dd>
        <dt>Problemas encontrados</dt><dd>${esc(r.problems)}</dd>
        <dt>Proximos passos</dt><dd>${esc(r.next)}</dd>
      </dl>
    </article>`).join('');
}

function field(id, label, value = '', type = 'text', full = false) {
  return `<div class="gh-field ${full ? 'full' : ''}"><label>${label}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`;
}

function area(id, label, value = '', full = true) {
  return `<div class="gh-field ${full ? 'full' : ''}"><label>${label}</label><textarea id="${id}">${esc(value)}</textarea></div>`;
}

function selectField(id, label, value, options, full = false) {
  return `<div class="gh-field ${full ? 'full' : ''}"><label>${label}</label><select id="${id}">${options.map(o => `<option value="${esc(o)}" ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
}

function openModal(title, html, onSave) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = `<div class="gh-form-grid">${html}</div>`;
  document.getElementById('modalOverlay').classList.add('open');
  modalSave = onSave;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  modalSave = null;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}

function editMetric(key) {
  const labels = { leadsMonth: 'Leads no mes', costPerLead: 'Custo por lead', activeCampaigns: 'Campanhas ativas', creativesTested: 'Criativos testados', activeUnits: 'Cidades/unidades', adSpend: 'Verba investida', bestCampaign: 'Melhor campanha' };
  const isNumber = key !== 'bestCampaign';
  openModal(`Editar ${labels[key]}`, field('value', labels[key], state.metrics[key], isNumber ? 'number' : 'text', true), () => {
    const value = document.getElementById('value').value.trim();
    state.metrics[key] = isNumber ? Number(value || 0) : value;
    save(); render(); toast('Indicador atualizado');
  });
}

function editTrend(index) {
  const item = state.trend[index];
  openModal('Editar grafico', field('label', 'Periodo', item.label) + field('value', 'Leads', item.value, 'number'), () => {
    item.label = document.getElementById('label').value.trim();
    item.value = Number(document.getElementById('value').value || 0);
    save(); render(); toast('Grafico atualizado');
  });
}

function formFor(collection, item) {
  const forms = {
    actions: () => area('title', 'Acao', item.title) + field('area', 'Area', item.area) + field('due', 'Prazo', item.due) + selectField('priority', 'Prioridade', item.priority, ['Alta', 'Media', 'Baixa']),
    campaigns: () => field('name', 'Nome', item.name) + field('objective', 'Objetivo', item.objective) + area('audience', 'Publico', item.audience) + field('region', 'Regiao', item.region) + field('budget', 'Verba', item.budget, 'number') + selectField('status', 'Status', item.status, ['Planejamento', 'Ativa', 'Pausada', 'Finalizada']) + area('result', 'Resultado', item.result),
    creatives: () => field('title', 'Titulo', item.title) + selectField('category', 'Categoria', item.category, ['Vistoria Veicular', 'Compra de Carro Usado', 'Transferencia', 'Pesquisa Veicular', 'Institucional', 'Prova Social', 'Parceiros/Franquias', 'Stories', 'Datas Comemorativas']) + area('objective', 'Objetivo', item.objective) + selectField('status', 'Status', item.status, ['Usar', 'Revisar', 'Pausar']) + field('tone', 'Tom', item.tone),
    leads: () => field('name', 'Nome', item.name) + field('phone', 'Telefone', item.phone) + field('city', 'Cidade', item.city) + field('interest', 'Interesse', item.interest) + field('origin', 'Origem', item.origin) + selectField('status', 'Status', item.status, state.leadStatuses) + area('note', 'Observacao', item.note),
    units: () => field('city', 'Cidade', item.city) + field('owner', 'Responsavel', item.owner) + field('whatsapp', 'WhatsApp', item.whatsapp) + selectField('status', 'Status', item.status, ['Nao iniciada', 'Teste', 'Ativa', 'Pausada']) + area('campaigns', 'Campanhas vinculadas (uma por linha)', (item.campaigns || []).join('\n')) + field('leads', 'Leads recebidos', item.leads, 'number'),
    reports: () => field('period', 'Periodo', item.period) + area('campaigns', 'Campanhas testadas', item.campaigns) + area('results', 'Principais resultados', item.results) + area('winners', 'Criativos vencedores', item.winners) + area('problems', 'Problemas encontrados', item.problems) + area('next', 'Proximos passos', item.next)
  };
  return forms[collection]();
}

function readItem(collection, item) {
  const v = id => document.getElementById(id).value.trim();
  if (collection === 'actions') Object.assign(item, { title: v('title'), area: v('area'), due: v('due'), priority: v('priority') });
  if (collection === 'campaigns') Object.assign(item, { name: v('name'), objective: v('objective'), audience: v('audience'), region: v('region'), budget: Number(v('budget') || 0), status: v('status'), result: v('result') });
  if (collection === 'creatives') Object.assign(item, { title: v('title'), category: v('category'), objective: v('objective'), status: v('status'), tone: v('tone') });
  if (collection === 'leads') Object.assign(item, { name: v('name'), phone: v('phone'), city: v('city'), interest: v('interest'), origin: v('origin'), status: v('status'), note: v('note') });
  if (collection === 'units') Object.assign(item, { city: v('city'), owner: v('owner'), whatsapp: v('whatsapp'), status: v('status'), campaigns: v('campaigns').split('\n').map(x => x.trim()).filter(Boolean), leads: Number(v('leads') || 0) });
  if (collection === 'reports') Object.assign(item, { period: v('period'), campaigns: v('campaigns'), results: v('results'), winners: v('winners'), problems: v('problems'), next: v('next') });
}

function blank(collection) {
  const samples = {
    actions: { title: '', area: '', due: '', priority: 'Media' },
    campaigns: { name: '', objective: '', audience: '', region: '', budget: 0, status: 'Planejamento', result: '' },
    creatives: { title: '', category: 'Institucional', objective: '', status: 'Revisar', tone: '' },
    leads: { name: '', phone: '', city: '', interest: '', origin: '', status: 'Novo Lead', note: '' },
    units: { city: '', owner: '', whatsapp: '', status: 'Nao iniciada', campaigns: [], leads: 0 },
    reports: { period: '', campaigns: '', results: '', winners: '', problems: '', next: '' }
  };
  return structuredClone(samples[collection]);
}

function editItem(collection, index) {
  const item = state[collection][index];
  openModal('Editar item', formFor(collection, item), () => {
    readItem(collection, item);
    save(); render(); toast('Item atualizado');
  });
}

function addItem(collection) {
  const item = blank(collection);
  openModal('Novo item', formFor(collection, item), () => {
    readItem(collection, item);
    state[collection].unshift(item);
    save(); render(); toast('Item criado');
  });
}

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.gh-tab').forEach(el => el.classList.toggle('active', el.id === `tab-${tab}`));
  document.querySelectorAll('.gh-nav button').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  document.getElementById('newItemBtn').style.display = tab === 'overview' ? 'none' : '';
}

document.getElementById('ghNav').addEventListener('click', e => {
  const btn = e.target.closest('button[data-tab]');
  if (btn) setTab(btn.dataset.tab);
});

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) addItem(add.dataset.add);
});

document.getElementById('newItemBtn').addEventListener('click', () => {
  const map = { campaigns: 'campaigns', creatives: 'creatives', leads: 'leads', units: 'units', reports: 'reports' };
  if (map[activeTab]) addItem(map[activeTab]);
});

document.getElementById('clientSelect').addEventListener('change', e => {
  state.activeClientId = e.target.value;
  save(); renderHeader();
});

document.getElementById('editTrendBtn').addEventListener('click', () => editTrend(0));
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalSave').addEventListener('click', () => {
  if (modalSave) modalSave();
  closeModal();
});
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target.id === 'modalOverlay') closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

setTab('overview');
render();
