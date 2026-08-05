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
  inbox: [],
  dailyPlans: [],
  studyPrograms: [],
  studyTerms: [],
  subjects: [],
  assessments: [],
  studySessions: [],
  profiles: {},
  settingsTab: 'profile',
  activeInsights: [],
  modalSave: null,
  confirmOk: null,
  projectFilter: 'all',
  taskFilter: 'all',
  promptFilter: 'all',
  finFilter: 'all',
  studyView: 'overview',
  studyTermId: null,
  studyProgramFilter: 'all',
  studySubjectFilter: 'all',
  studyAssessmentFilter: 'all'
};
let _krCounter = 0;
let _selectedMood = 3;
let projectRhythmInterval = null;
let projectRhythmAlertOpen = false;
let insightInterval = null;

/* ===== LOCAL STORAGE ===== */
const STORAGE_KEY = 'motion_hub_data_v1';
const SETTINGS_KEY = 'motion_hub_settings_v1';
const INSIGHT_STATE_KEY = 'motion_hub_insight_state_v1';
const PROJECT_RHYTHM_KEY = 'motion_project_rhythm_v1';
const ACCESS_PASSWORD = '@Vitor0911071234';
const ACCESS_SESSION_KEY = 'motion_hub_access_ok_v1';
const DATA_FIELDS = ['projects', 'tasks', 'ideas', 'contacts', 'transactions', 'docs', 'habits', 'goals', 'reviews', 'notes', 'inbox', 'dailyPlans', 'studyPrograms', 'studyTerms', 'subjects', 'assessments', 'studySessions'];
const BACKUP_FORMAT = 'motion-hub-backup';
const BACKUP_VERSION = 2;
const BACKUP_SAFETY_KEY = 'motion_hub_safety_backup_v1';
const BACKUP_MAX_BYTES = 20 * 1024 * 1024;
const BACKUP_STORES = [
  { key: STORAGE_KEY, label: 'Motion Hub', icon: 'bx-grid-alt', required: true },
  { key: SETTINGS_KEY, label: 'Preferências', icon: 'bx-cog' },
  { key: INSIGHT_STATE_KEY, label: 'Jarvis proativo', icon: 'bx-bot' },
  { key: PROJECT_RHYTHM_KEY, label: 'Ritmo dos projetos', icon: 'bx-timer' },
  { key: 'growth_hub_data_v2', label: 'Growth Hub', icon: 'bx-line-chart' },
  { key: 'motion_code_assets_library_v1', label: 'Code Assets', icon: 'bx-code-curly' }
];
let currentUserId   = 'vitor';
let currentUserName = 'Vitor';
let currentUserColor = '#6366f1';

const SETTINGS_COLORS = [
  { name: 'Azul', value: '#2563EB', strong: '#1D4ED8', soft: '#60A5FA' },
  { name: 'Índigo', value: '#6366F1', strong: '#4F46E5', soft: '#A5B4FC' },
  { name: 'Roxo', value: '#8B5CF6', strong: '#7C3AED', soft: '#C4B5FD' },
  { name: 'Verde', value: '#16A34A', strong: '#15803D', soft: '#86EFAC' },
  { name: 'Laranja', value: '#EA580C', strong: '#C2410C', soft: '#FDBA74' },
  { name: 'Rosa', value: '#DB2777', strong: '#BE185D', soft: '#F9A8D4' }
];
const DASHBOARD_WIDGETS = [
  { id: 'dailyPlanner', label: 'Planejamento do dia', icon: 'bx-sun' },
  { id: 'jarvisInsights', label: 'Jarvis recomenda', icon: 'bx-bot' },
  { id: 'metrics', label: 'Métricas gerais', icon: 'bx-bar-chart-alt-2' },
  { id: 'projectRhythm', label: 'Ritmo dos projetos', icon: 'bx-timer' },
  { id: 'inbox', label: 'Caixa de entrada', icon: 'bx-inbox' },
  { id: 'activeProjects', label: 'Projetos em andamento', icon: 'bx-folder-open' },
  { id: 'weekFocus', label: 'Foco da semana', icon: 'bx-target-lock' },
  { id: 'nextSteps', label: 'Próximos passos', icon: 'bx-list-ul' },
  { id: 'priorityTasks', label: 'Tarefas prioritárias', icon: 'bx-check-square' }
];
const DEFAULT_SETTINGS = {
  profile: { displayName: 'Vitor Falcão', role: 'Founder', avatarColor: '#6366F1' },
  appearance: { accentColor: '#2563EB' },
  notifications: { enabled: true, overdueTasks: true, todayTasks: true, pendingHabits: true, atRiskGoals: true },
  dashboard: { widgets: DASHBOARD_WIDGETS.map(widget => ({ id: widget.id, visible: true })) },
  automations: {
    enabled: true,
    staleProjects: true,
    overdueTasks: true,
    crmFollowUps: true,
    atRiskGoals: true,
    weeklyReview: true,
    dailyWrap: true,
    staleProjectDays: 7,
    overdueMove: 'off'
  }
};
let appSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
let insightState = { dismissedUntil: {}, lastProactiveKey: '', lastAutomationDate: '' };

function normalizeSettings(candidate = {}) {
  const profile = candidate?.profile && typeof candidate.profile === 'object' ? candidate.profile : {};
  const appearance = candidate?.appearance && typeof candidate.appearance === 'object' ? candidate.appearance : {};
  const notifications = candidate?.notifications && typeof candidate.notifications === 'object' ? candidate.notifications : {};
  const dashboard = candidate?.dashboard && typeof candidate.dashboard === 'object' ? candidate.dashboard : {};
  const automations = candidate?.automations && typeof candidate.automations === 'object' ? candidate.automations : {};
  const validColor = color => SETTINGS_COLORS.some(option => option.value.toLowerCase() === String(color || '').toLowerCase());
  const bool = (value, fallback) => typeof value === 'boolean' ? value : fallback;
  const cleanName = typeof profile.displayName === 'string' ? profile.displayName.trim().slice(0, 60) : '';
  const cleanRole = typeof profile.role === 'string' ? profile.role.trim().slice(0, 40) : '';
  const widgetCandidates = Array.isArray(dashboard.widgets) ? dashboard.widgets : [];
  const normalizedWidgets = [];
  widgetCandidates.forEach(item => {
    if (!item || !DASHBOARD_WIDGETS.some(widget => widget.id === item.id) || normalizedWidgets.some(widget => widget.id === item.id)) return;
    normalizedWidgets.push({ id: item.id, visible: item.visible !== false });
  });
  DASHBOARD_WIDGETS.forEach(widget => {
    if (!normalizedWidgets.some(item => item.id === widget.id)) normalizedWidgets.push({ id: widget.id, visible: true });
  });
  const staleDays = Math.max(2, Math.min(90, Number(automations.staleProjectDays) || 7));
  return {
    profile: {
      displayName: cleanName || DEFAULT_SETTINGS.profile.displayName,
      role: cleanRole || DEFAULT_SETTINGS.profile.role,
      avatarColor: validColor(profile.avatarColor) ? profile.avatarColor.toUpperCase() : DEFAULT_SETTINGS.profile.avatarColor
    },
    appearance: {
      accentColor: validColor(appearance.accentColor) ? appearance.accentColor.toUpperCase() : DEFAULT_SETTINGS.appearance.accentColor
    },
    notifications: {
      enabled: bool(notifications.enabled, true),
      overdueTasks: bool(notifications.overdueTasks, true),
      todayTasks: bool(notifications.todayTasks, true),
      pendingHabits: bool(notifications.pendingHabits, true),
      atRiskGoals: bool(notifications.atRiskGoals, true)
    },
    dashboard: { widgets: normalizedWidgets },
    automations: {
      enabled: bool(automations.enabled, true),
      staleProjects: bool(automations.staleProjects, true),
      overdueTasks: bool(automations.overdueTasks, true),
      crmFollowUps: bool(automations.crmFollowUps, true),
      atRiskGoals: bool(automations.atRiskGoals, true),
      weeklyReview: bool(automations.weeklyReview, true),
      dailyWrap: bool(automations.dailyWrap, true),
      staleProjectDays: staleDays,
      overdueMove: automations.overdueMove === 'today' ? 'today' : 'off'
    }
  };
}

function colorRgb(hex) {
  const value = hex.replace('#', '');
  return `${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}`;
}

function profileInitials(name) {
  return String(name || 'U').trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'U';
}

function applySettings() {
  const accent = SETTINGS_COLORS.find(option => option.value === appSettings.appearance.accentColor) || SETTINGS_COLORS[0];
  const root = document.documentElement;
  root.style.setProperty('--accent', accent.value);
  root.style.setProperty('--accent-rgb', colorRgb(accent.value));
  root.style.setProperty('--accent-strong', accent.strong);
  root.style.setProperty('--accent-soft', accent.soft);
  root.style.setProperty('--accent-dim', `rgba(${colorRgb(accent.value)}, 0.15)`);
  root.style.setProperty('--accent-dim2', `rgba(${colorRgb(accent.value)}, 0.06)`);
  root.style.setProperty('--accent-glow', `0 0 20px rgba(${colorRgb(accent.value)}, 0.4)`);

  currentUserName = appSettings.profile.displayName;
  currentUserColor = appSettings.profile.avatarColor;
  const avatar = document.getElementById('sidebarUserAvatar');
  const name = document.getElementById('sidebarUserName');
  const role = document.getElementById('sidebarUserRole');
  if (avatar) { avatar.textContent = profileInitials(currentUserName); avatar.style.background = currentUserColor; }
  if (name) name.textContent = currentUserName;
  if (role) role.textContent = appSettings.profile.role;
  if (S.profiles.vitor) {
    S.profiles.vitor.display_name = currentUserName;
    S.profiles.vitor.avatar_color = currentUserColor;
  }
  applyDashboardPreferences();
}

function loadSettings() {
  appSettings = normalizeSettings(readStore(SETTINGS_KEY, {}));
  writeStore(SETTINGS_KEY, appSettings);
  applySettings();
}

function loadInsightState() {
  const stored = readStore(INSIGHT_STATE_KEY, {});
  insightState = {
    dismissedUntil: stored?.dismissedUntil && typeof stored.dismissedUntil === 'object' ? stored.dismissedUntil : {},
    lastProactiveKey: typeof stored?.lastProactiveKey === 'string' ? stored.lastProactiveKey : '',
    lastAutomationDate: typeof stored?.lastAutomationDate === 'string' ? stored.lastAutomationDate : ''
  };
  writeStore(INSIGHT_STATE_KEY, insightState);
}

function saveInsightState() {
  writeStore(INSIGHT_STATE_KEY, insightState);
}

function saveSettings(nextSettings, message = 'Configurações salvas com sucesso.') {
  appSettings = normalizeSettings(nextSettings);
  writeStore(SETTINGS_KEY, appSettings);
  applySettings();
  updateNotifBadge();
  toast(message, 'success');
}

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
      display_name: currentUserName,
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
function saveInbox()        { syncData({ inbox:        S.inbox }); }
function saveDailyPlans()   { syncData({ dailyPlans:   S.dailyPlans }); }
function saveStudyPrograms(){ syncData({ studyPrograms:S.studyPrograms }); }
function saveStudyTerms()   { syncData({ studyTerms:   S.studyTerms }); }
function saveSubjects()     { syncData({ subjects:     S.subjects }); }
function saveAssessments()  { syncData({ assessments:  S.assessments }); }
function saveStudySessions(){ syncData({ studySessions:S.studySessions }); }

/* ===== BACKUP & RESTORE ===== */
function backupSafeClone(value) {
  if (Array.isArray(value)) return value.map(backupSafeClone);
  if (!value || typeof value !== 'object') return value;
  const clean = {};
  Object.keys(value).forEach(key => {
    if (key === '__proto__' || key === 'prototype' || key === 'constructor') return;
    clean[key] = backupSafeClone(value[key]);
  });
  return clean;
}

function collectBackupStores() {
  const stores = {};
  BACKUP_STORES.forEach(store => {
    const value = readStore(store.key, undefined);
    if (value !== undefined) stores[store.key] = backupSafeClone(value);
  });
  return stores;
}

function backupCounts(mainData = {}) {
  return DATA_FIELDS.reduce((counts, field) => {
    counts[field] = Array.isArray(mainData[field]) ? mainData[field].length : 0;
    return counts;
  }, {});
}

function createBackupDocument(reason = 'manual') {
  const stores = collectBackupStores();
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    reason,
    app: { name: 'Motion Hub', storage: 'local' },
    summary: backupCounts(stores[STORAGE_KEY]),
    stores
  };
}

function backupFilename(date = new Date()) {
  const stamp = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `motion-hub-backup-${stamp}.json`;
}

function downloadJson(documentData, filename = backupFilename()) {
  const blob = new Blob([JSON.stringify(documentData, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportMotionBackup() {
  const backup = createBackupDocument('manual-export');
  downloadJson(backup);
  toast('Backup completo baixado com sucesso.');
  renderBackupPage();
}

function validateBackupDocument(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new Error('O arquivo não contém um backup válido.');
  if (candidate.format !== BACKUP_FORMAT) throw new Error('Este JSON não foi gerado pelo Motion Hub.');
  if (!Number.isInteger(candidate.version) || candidate.version < 1) throw new Error('A versão do backup é inválida.');
  if (candidate.version > BACKUP_VERSION) throw new Error('Este backup foi criado por uma versão mais nova do Motion Hub.');
  if (!candidate.stores || typeof candidate.stores !== 'object' || Array.isArray(candidate.stores)) throw new Error('O backup não possui dados restauráveis.');
  const main = candidate.stores[STORAGE_KEY];
  if (!main || typeof main !== 'object' || Array.isArray(main)) throw new Error('Os dados principais do Motion Hub não foram encontrados.');
  const stores = {};
  BACKUP_STORES.forEach(store => {
    if (!Object.prototype.hasOwnProperty.call(candidate.stores, store.key)) return;
    const value = candidate.stores[store.key];
    if (value === null || typeof value !== 'object') throw new Error(`A área “${store.label}” está corrompida.`);
    stores[store.key] = backupSafeClone(value);
  });
  return { ...backupSafeClone(candidate), stores };
}

function backupIdentity(item) {
  if (!item || typeof item !== 'object') return null;
  const fields = ['id', 'key', 'name', 'title', 'objective', 'phone'];
  const field = fields.find(candidate => item[candidate] !== undefined && item[candidate] !== '');
  return field ? `${field}:${String(item[field])}` : null;
}

function mergeBackupValue(current, imported) {
  if (Array.isArray(current) && Array.isArray(imported)) {
    const result = current.map(backupSafeClone);
    imported.forEach(item => {
      if (item === null || typeof item !== 'object') {
        if (!result.some(existing => Object.is(existing, item))) result.push(item);
        return;
      }
      const identity = backupIdentity(item);
      const index = identity ? result.findIndex(existing => backupIdentity(existing) === identity) : -1;
      if (index >= 0) result[index] = mergeBackupValue(result[index], item);
      else result.push(backupSafeClone(item));
    });
    return result;
  }
  if (current && imported && typeof current === 'object' && typeof imported === 'object' && !Array.isArray(current) && !Array.isArray(imported)) {
    const merged = backupSafeClone(current);
    Object.keys(imported).forEach(key => {
      if (key === '__proto__' || key === 'prototype' || key === 'constructor') return;
      merged[key] = Object.prototype.hasOwnProperty.call(merged, key)
        ? mergeBackupValue(merged[key], imported[key])
        : backupSafeClone(imported[key]);
    });
    return merged;
  }
  return backupSafeClone(imported);
}

function saveSafetyBackup() {
  const snapshot = createBackupDocument('automatic-before-import');
  writeStore(BACKUP_SAFETY_KEY, snapshot);
  return snapshot;
}

function applyBackupDocument(backup, mode = 'merge', { createSafety = true } = {}) {
  const validated = validateBackupDocument(backup);
  if (createSafety) saveSafetyBackup();

  if (mode === 'replace') {
    BACKUP_STORES.forEach(store => localStorage.removeItem(store.key));
    Object.entries(validated.stores).forEach(([key, value]) => writeStore(key, value));
  } else {
    Object.entries(validated.stores).forEach(([key, imported]) => {
      const current = readStore(key, {});
      writeStore(key, mergeBackupValue(current, imported));
    });
  }
}

function backupSummaryRows(backup) {
  const counts = backupCounts(backup.stores[STORAGE_KEY]);
  const fields = [
    ['projects', 'Projetos'], ['tasks', 'Tarefas'], ['inbox', 'Caixa de entrada'],
    ['habits', 'Hábitos'], ['goals', 'Metas'], ['notes', 'Notas'],
    ['transactions', 'Lançamentos'], ['contacts', 'Contatos'],
    ['studyPrograms', 'Cursos'], ['studyTerms', 'Períodos'], ['subjects', 'Matérias'],
    ['assessments', 'Avaliações'], ['studySessions', 'Sessões de estudo']
  ];
  return fields.map(([key, label]) => `<div class="backup-preview-stat"><strong>${counts[key] || 0}</strong><span>${label}</span></div>`).join('');
}

function openBackupPreview(backup, fileName = 'backup.json') {
  const created = new Date(backup.createdAt);
  const validDate = !Number.isNaN(created.getTime());
  const included = BACKUP_STORES.filter(store => Object.prototype.hasOwnProperty.call(backup.stores, store.key));
  openModal('Prévia da importação', `
    <div class="backup-preview-head">
      <div class="backup-preview-file"><i class='bx bx-file'></i><div><strong>${escHtml(fileName)}</strong><span>${validDate ? created.toLocaleString('pt-BR') : 'Data não informada'} · versão ${backup.version}</span></div></div>
      <span class="badge badge-green"><i class='bx bx-check-shield'></i> Validado</span>
    </div>
    <div class="backup-preview-stats">${backupSummaryRows(backup)}</div>
    <div class="backup-preview-areas">${included.map(store => `<span><i class='bx ${store.icon}'></i>${store.label}</span>`).join('')}</div>
    <div class="backup-mode-title">Como deseja restaurar?</div>
    <label class="backup-mode-option selected">
      <input type="radio" name="backup-mode" value="merge" checked>
      <i class='bx bx-git-merge'></i>
      <span><strong>Mesclar dados</strong><small>Mantém o que já existe e adiciona ou atualiza itens do backup.</small></span>
    </label>
    <label class="backup-mode-option danger-option">
      <input type="radio" name="backup-mode" value="replace">
      <i class='bx bx-refresh'></i>
      <span><strong>Substituir tudo</strong><small>Restaura exatamente o backup. Uma cópia de segurança será criada antes.</small></span>
    </label>
  `, () => {
    const mode = document.querySelector('input[name="backup-mode"]:checked')?.value || 'merge';
    applyBackupDocument(backup, mode);
    toast(mode === 'replace' ? 'Backup restaurado. Recarregando…' : 'Dados mesclados. Recarregando…');
    setTimeout(() => window.location.reload(), 700);
    return true;
  });
  document.getElementById('modalSave').innerHTML = `<i class='bx bx-import'></i> Importar backup`;
  document.querySelectorAll('.backup-mode-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.backup-mode-option').forEach(item => item.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
}

async function importMotionBackupFile(file) {
  if (!file) return;
  if (file.size > BACKUP_MAX_BYTES) throw new Error('O arquivo é maior que o limite de 20 MB.');
  const text = await file.text();
  let parsed;
  try { parsed = JSON.parse(text); }
  catch { throw new Error('Não foi possível ler o JSON. Verifique se o arquivo não está corrompido.'); }
  const backup = validateBackupDocument(parsed);
  openBackupPreview(backup, file.name);
}

function restoreSafetyBackup() {
  const safety = readStore(BACKUP_SAFETY_KEY, null);
  if (!safety) return toast('Nenhuma cópia de segurança disponível.', 'info');
  openModal('Desfazer última importação', `
    <div class="backup-restore-warning"><i class='bx bx-history'></i><div><strong>Voltar ao estado anterior?</strong><p>Os dados atuais serão substituídos pela cópia criada antes da última importação.</p></div></div>
  `, () => {
    applyBackupDocument(safety, 'replace', { createSafety: false });
    toast('Estado anterior restaurado. Recarregando…');
    setTimeout(() => window.location.reload(), 700);
    return true;
  });
  document.getElementById('modalSave').innerHTML = `<i class='bx bx-undo'></i> Restaurar estado anterior`;
}

function renderBackupPage() {
  const scope = document.getElementById('backupScopeList');
  if (!scope) return;
  const stores = collectBackupStores();
  scope.innerHTML = BACKUP_STORES.map(store => {
    const available = Object.prototype.hasOwnProperty.call(stores, store.key);
    return `<div class="backup-scope-item"><i class='bx ${store.icon}'></i><div><strong>${store.label}</strong><span>${available ? 'Incluído na exportação' : 'Será incluído quando houver dados'}</span></div><i class='bx ${available ? 'bx-check-circle included' : 'bx-minus-circle'}'></i></div>`;
  }).join('') + `<div class="backup-scope-item secure"><i class='bx bx-key'></i><div><strong>Credenciais protegidas</strong><span>Chave Groq, senha e sessão nunca são exportadas</span></div><i class='bx bx-shield-quarter included'></i></div>`;

  const safety = readStore(BACKUP_SAFETY_KEY, null);
  const safetyBox = document.getElementById('backupSafetyStatus');
  if (!safety) {
    safetyBox.innerHTML = `<div class="backup-empty-safety"><i class='bx bx-check-circle'></i><strong>Tudo tranquilo</strong><span>A primeira cópia será criada automaticamente antes de uma importação.</span></div>`;
    return;
  }
  const date = new Date(safety.createdAt);
  safetyBox.innerHTML = `<div class="backup-safety-available"><div><span>Último estado protegido</span><strong>${Number.isNaN(date.getTime()) ? 'Data não informada' : date.toLocaleString('pt-BR')}</strong></div><button class="btn-ghost" type="button" onclick="restoreSafetyBackup()"><i class='bx bx-undo'></i> Desfazer importação</button></div>`;
}

function initBackup() {
  document.getElementById('backupExportBtn')?.addEventListener('click', exportMotionBackup);
  document.getElementById('backupImportBtn')?.addEventListener('click', () => document.getElementById('backupFileInput')?.click());
  document.getElementById('backupFileInput')?.addEventListener('change', async event => {
    try { await importMotionBackupFile(event.target.files?.[0]); }
    catch (error) { toast(error.message || 'Não foi possível importar o backup.', 'error'); }
    finally { event.target.value = ''; }
  });
}

/* ===== SETTINGS ===== */
function settingsColorOptions(selected, inputName, optionClass = '') {
  return SETTINGS_COLORS.map(option => `
    <label class="settings-color-option ${optionClass}" title="${option.name}">
      <input type="radio" name="${inputName}" value="${option.value}" ${selected === option.value ? 'checked' : ''}>
      <span class="settings-color-swatch" style="--swatch:${option.value}"><i class='bx bx-check'></i></span>
      <small>${option.name}</small>
    </label>`).join('');
}

function switchSettingsTab(tab = 'profile') {
  const available = ['profile', 'appearance', 'notifications', 'automations', 'jarvis', 'data'];
  S.settingsTab = available.includes(tab) ? tab : 'profile';
  document.querySelectorAll('[data-settings-tab]').forEach(button => {
    const active = button.dataset.settingsTab === S.settingsTab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('[data-settings-pane]').forEach(pane => pane.classList.toggle('active', pane.dataset.settingsPane === S.settingsTab));
  if (S.settingsTab === 'data') renderBackupPage();
  if (S.settingsTab === 'jarvis') renderJarvisSettings();
  if (S.settingsTab === 'automations') renderAutomationSettings();
}

function applyDashboardPreferences() {
  const container = document.getElementById('dashboardWidgets');
  if (!container || !appSettings.dashboard?.widgets) return;
  appSettings.dashboard.widgets.forEach(widget => {
    const element = container.querySelector(`[data-dashboard-widget="${widget.id}"]`);
    if (!element) return;
    element.classList.toggle('dashboard-widget-hidden', !widget.visible);
    container.appendChild(element);
  });
}

function moveDashboardWidget(button, direction) {
  const row = button.closest('.dashboard-customize-row');
  if (!row) return;
  if (direction < 0 && row.previousElementSibling) row.parentElement.insertBefore(row, row.previousElementSibling);
  if (direction > 0 && row.nextElementSibling) row.parentElement.insertBefore(row.nextElementSibling, row);
}

function openDashboardCustomizer() {
  const current = appSettings.dashboard.widgets;
  openModal('Personalizar Dashboard', `
    <div class="dashboard-customize-intro"><i class='bx bx-slider-alt'></i><div><strong>Escolha o que merece sua atenção</strong><p>Mostre, oculte e reorganize os blocos do Dashboard.</p></div></div>
    <div class="dashboard-customize-list" id="dashboardCustomizeList">
      ${current.map(item => {
        const meta = DASHBOARD_WIDGETS.find(widget => widget.id === item.id);
        return `<div class="dashboard-customize-row" data-widget-id="${item.id}">
          <label><input type="checkbox" ${item.visible ? 'checked' : ''}><span><i class='bx bx-check'></i></span><i class='bx ${meta?.icon || 'bx-grid-alt'}'></i><strong>${escHtml(meta?.label || item.id)}</strong></label>
          <div><button class="btn-icon" type="button" onclick="moveDashboardWidget(this,-1)" aria-label="Mover para cima"><i class='bx bx-up-arrow-alt'></i></button><button class="btn-icon" type="button" onclick="moveDashboardWidget(this,1)" aria-label="Mover para baixo"><i class='bx bx-down-arrow-alt'></i></button></div>
        </div>`;
      }).join('')}
    </div>`, () => {
    const rows = [...document.querySelectorAll('#dashboardCustomizeList .dashboard-customize-row')];
    const widgets = rows.map(row => ({ id: row.dataset.widgetId, visible: row.querySelector('input').checked }));
    if (!widgets.some(widget => widget.visible)) { toast('Mantenha pelo menos um bloco visível.', 'error'); return false; }
    saveSettings({ ...appSettings, dashboard: { widgets } }, 'Dashboard personalizado com sucesso.');
    renderDashboard();
    return true;
  });
  document.getElementById('modalSave').innerHTML = `<i class='bx bx-save'></i> Salvar Dashboard`;
}

function renderProfileSettings() {
  const profile = appSettings.profile;
  const nameInput = document.getElementById('settingsProfileName');
  const roleInput = document.getElementById('settingsProfileRole');
  if (!nameInput || !roleInput) return;
  nameInput.value = profile.displayName;
  roleInput.value = profile.role;
  document.getElementById('profileColorOptions').innerHTML = settingsColorOptions(profile.avatarColor, 'profileAvatarColor');
  updateProfilePreview();
}

function updateProfilePreview() {
  const name = document.getElementById('settingsProfileName')?.value.trim() || DEFAULT_SETTINGS.profile.displayName;
  const role = document.getElementById('settingsProfileRole')?.value.trim() || DEFAULT_SETTINGS.profile.role;
  const color = document.querySelector('input[name="profileAvatarColor"]:checked')?.value || appSettings.profile.avatarColor;
  const avatar = document.getElementById('profilePreviewAvatar');
  if (avatar) { avatar.textContent = profileInitials(name); avatar.style.background = color; }
  const previewName = document.getElementById('profilePreviewName');
  const previewRole = document.getElementById('profilePreviewRole');
  if (previewName) previewName.textContent = name;
  if (previewRole) previewRole.textContent = role;
}

function renderAppearanceSettings() {
  const container = document.getElementById('accentColorOptions');
  if (container) container.innerHTML = settingsColorOptions(appSettings.appearance.accentColor, 'settingsAccentColor', 'accent-color-option');
}

function renderNotificationSettings() {
  const settings = appSettings.notifications;
  const enabled = document.getElementById('settingsNotifEnabled');
  if (enabled) enabled.checked = settings.enabled;
  document.querySelectorAll('[data-notification]').forEach(input => { input.checked = settings[input.dataset.notification]; });
  syncNotificationSettingsState();
}

function renderAutomationSettings() {
  const settings = appSettings.automations;
  const enabled = document.getElementById('settingsAutomationEnabled');
  if (enabled) enabled.checked = settings.enabled;
  document.querySelectorAll('[data-automation]').forEach(input => { input.checked = settings[input.dataset.automation]; });
  const staleDays = document.getElementById('settingsStaleProjectDays');
  const overdueMove = document.getElementById('settingsOverdueMove');
  if (staleDays) staleDays.value = settings.staleProjectDays;
  if (overdueMove) overdueMove.value = settings.overdueMove;
  syncAutomationSettingsState();
}

function syncAutomationSettingsState() {
  const enabled = document.getElementById('settingsAutomationEnabled')?.checked !== false;
  document.getElementById('automationRuleSettings')?.classList.toggle('disabled', !enabled);
  document.querySelectorAll('[data-automation], #settingsStaleProjectDays, #settingsOverdueMove').forEach(input => { input.disabled = !enabled; });
}

function syncNotificationSettingsState() {
  const enabled = document.getElementById('settingsNotifEnabled')?.checked !== false;
  document.getElementById('notificationCategorySettings')?.classList.toggle('disabled', !enabled);
  document.querySelectorAll('[data-notification]').forEach(input => { input.disabled = !enabled; });
}

function renderJarvisSettings() {
  const configured = Boolean(localStorage.getItem(JARVIS_KEY_STORE));
  const status = document.getElementById('jarvisKeyStatus');
  const remove = document.getElementById('removeGroqKeyBtn');
  const input = document.getElementById('settingsGroqKey');
  if (status) {
    status.className = `settings-status ${configured ? 'configured' : 'not-configured'}`;
    status.innerHTML = `<i class='bx ${configured ? 'bx-check-circle' : 'bx-info-circle'}'></i>${configured ? 'Chave configurada' : 'Não configurada'}`;
  }
  if (remove) remove.disabled = !configured;
  if (input) { input.value = ''; input.type = 'password'; }
  const visibility = document.querySelector('#toggleGroqKeyVisibility i');
  if (visibility) visibility.className = 'bx bx-show';
}

function renderSettingsPage() {
  renderProfileSettings();
  renderAppearanceSettings();
  renderNotificationSettings();
  renderAutomationSettings();
  renderJarvisSettings();
  switchSettingsTab(S.settingsTab);
}

function openSettings(tab = 'profile') {
  S.settingsTab = tab;
  navigateTo('settings');
}

function initSettings() {
  document.getElementById('settingsTabs')?.addEventListener('click', event => {
    const button = event.target.closest('[data-settings-tab]');
    if (button) switchSettingsTab(button.dataset.settingsTab);
  });

  const userCard = document.getElementById('userCard');
  userCard?.addEventListener('click', () => openSettings('profile'));
  userCard?.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openSettings('profile'); }
  });

  document.getElementById('profileSettingsForm')?.addEventListener('input', updateProfilePreview);
  document.getElementById('profileSettingsForm')?.addEventListener('change', updateProfilePreview);
  document.getElementById('profileSettingsForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const displayName = document.getElementById('settingsProfileName').value.trim();
    const role = document.getElementById('settingsProfileRole').value.trim();
    if (displayName.length < 2) return toast('Informe um nome com pelo menos 2 caracteres.', 'error');
    if (!role) return toast('Informe sua função no workspace.', 'error');
    const avatarColor = document.querySelector('input[name="profileAvatarColor"]:checked')?.value || DEFAULT_SETTINGS.profile.avatarColor;
    saveSettings({ ...appSettings, profile: { displayName, role, avatarColor } }, 'Perfil atualizado com sucesso.');
    renderProfileSettings();
  });

  document.getElementById('appearanceSettingsForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const accentColor = document.querySelector('input[name="settingsAccentColor"]:checked')?.value || DEFAULT_SETTINGS.appearance.accentColor;
    saveSettings({ ...appSettings, appearance: { accentColor } }, 'Aparência atualizada com sucesso.');
    renderAppearanceSettings();
  });

  document.getElementById('settingsNotifEnabled')?.addEventListener('change', syncNotificationSettingsState);
  document.getElementById('notificationSettingsForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const notifications = { enabled: document.getElementById('settingsNotifEnabled').checked };
    document.querySelectorAll('[data-notification]').forEach(input => { notifications[input.dataset.notification] = input.checked; });
    saveSettings({ ...appSettings, notifications }, 'Preferências de notificação salvas.');
    renderNotificationSettings();
  });

  document.getElementById('settingsAutomationEnabled')?.addEventListener('change', syncAutomationSettingsState);
  document.getElementById('automationSettingsForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const automations = {
      enabled: document.getElementById('settingsAutomationEnabled').checked,
      staleProjectDays: Number(document.getElementById('settingsStaleProjectDays').value),
      overdueMove: document.getElementById('settingsOverdueMove').value
    };
    document.querySelectorAll('[data-automation]').forEach(input => { automations[input.dataset.automation] = input.checked; });
    saveSettings({ ...appSettings, automations }, 'Automações atualizadas com sucesso.');
    renderAutomationSettings();
    runAutomationCycle({ force: true });
  });

  document.getElementById('customizeDashboardBtn')?.addEventListener('click', openDashboardCustomizer);

  document.getElementById('toggleGroqKeyVisibility')?.addEventListener('click', () => {
    const input = document.getElementById('settingsGroqKey');
    const icon = document.querySelector('#toggleGroqKeyVisibility i');
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.className = `bx ${input.type === 'password' ? 'bx-show' : 'bx-hide'}`;
  });
  document.getElementById('jarvisSettingsForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('settingsGroqKey');
    const key = input.value.trim();
    if (!key) return toast(localStorage.getItem(JARVIS_KEY_STORE) ? 'Digite uma nova chave para substituir a atual.' : 'Informe uma chave Groq.', 'info');
    localStorage.setItem(JARVIS_KEY_STORE, key);
    renderJarvisSettings();
    toast('Chave Groq salva neste navegador.', 'success');
  });
  document.getElementById('removeGroqKeyBtn')?.addEventListener('click', () => {
    openModal('Remover chave Groq', `<div class="backup-restore-warning"><i class='bx bx-key'></i><div><strong>Remover a chave deste navegador?</strong><p>O Jarvis continuará funcionando com o cérebro local, mas respostas abertas via Groq ficarão indisponíveis.</p></div></div>`, () => {
      localStorage.removeItem(JARVIS_KEY_STORE);
      renderJarvisSettings();
      toast('Chave Groq removida.', 'success');
      return true;
    });
    document.getElementById('modalSave').innerHTML = `<i class='bx bx-trash'></i> Remover chave`;
  });
}

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
  agenda:     { label: 'Agenda',           btnLabel: 'Novo Evento' },
  studies:    { label: 'Estudos',          btnLabel: 'Nova Matéria' },
  projects:   { label: 'Projetos',          btnLabel: 'Novo Projeto' },
  tasks:      { label: 'Tarefas',           btnLabel: 'Nova Tarefa' },
  habits:     { label: 'Hábitos',           btnLabel: 'Novo Hábito' },
  ideas:      { label: 'Ideias',            btnLabel: 'Nova Ideia' },
  goals:      { label: 'Metas & OKRs',      btnLabel: 'Nova Meta' },
  crm:        { label: 'CRM',               btnLabel: 'Novo Contato' },
  financial:  { label: 'Financeiro',        btnLabel: 'Novo Lançamento' },
  review:     { label: 'Revisão Semanal',   btnLabel: 'Nova Revisão' },
  prompts:    { label: 'Prompts & Docs',    btnLabel: 'Novo Documento' },
  notes:      { label: 'Notas',             btnLabel: null },
  settings:   { label: 'Configurações',     btnLabel: null }
};

const sectionOrder = ['dashboard', 'projects', 'tasks', 'habits', 'agenda', 'studies', 'jarvis', 'ideas', 'goals', 'crm', 'financial', 'review', 'prompts', 'notes', 'settings'];

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
  document.getElementById('jarvisBtn')?.classList.toggle('hide-on-page', section === 'jarvis');
  syncMobileNavigation(section);
  closeMobileNavigation();
  toggleMobileSearch(false);
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

function isMobileLayout() {
  return window.matchMedia?.('(max-width: 767px)').matches;
}

function syncMobileNavigation(section = S.section) {
  const primarySections = ['dashboard', 'tasks', 'agenda', 'financial'];
  document.querySelectorAll('.mobile-tab[data-section]').forEach(button => {
    const active = button.dataset.section === section;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.getElementById('mobileMoreBtn')?.classList.toggle('active', !primarySections.includes(section));
}

function openMobileNavigation() {
  if (!isMobileLayout()) return;
  document.getElementById('sidebar')?.classList.add('mobile-open');
  document.getElementById('mobileNavBackdrop')?.classList.add('open');
  document.body.classList.add('mobile-menu-open');
}

function closeMobileNavigation() {
  document.getElementById('sidebar')?.classList.remove('mobile-open');
  document.getElementById('mobileNavBackdrop')?.classList.remove('open');
  document.body.classList.remove('mobile-menu-open');
}

function toggleMobileSearch(force) {
  const header = document.querySelector('.app-header');
  const next = typeof force === 'boolean' ? force : !header?.classList.contains('mobile-search-open');
  header?.classList.toggle('mobile-search-open', next);
  document.getElementById('mobileSearchBtn')?.classList.toggle('active', next);
  if (next) setTimeout(() => document.getElementById('globalSearch')?.focus(), 40);
  else globalSearchClose();
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
  else if (section === 'tasks') renderTasks();
  else if (section === 'habits') renderHabits();
  else if (section === 'studies') renderStudies();
  else if (section === 'ideas') renderIdeas();
  else if (section === 'goals') renderGoals();
  else if (section === 'crm') renderCRM();
  else if (section === 'financial') renderFinancial();
  else if (section === 'review') renderReview();
  else if (section === 'prompts') renderPrompts();
  else if (section === 'notes') renderNotesTree();
  else if (section === 'settings') renderSettingsPage();
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

/* ===== UNIVERSAL INBOX ===== */
function captureTitle(text) {
  return String(text || '').split(/\r?\n/).map(line => line.trim()).find(Boolean) || 'Sem título';
}

function openInboxCapture(defaultKind = 'inbox') {
  globalSearchClose();
  openModal('Captura rápida', `
    <div class="capture-intro">
      <span class="capture-intro-icon"><i class='bx bx-edit-alt'></i></span>
      <div><strong>Tire isso da cabeça.</strong><p>Registre agora e decida o destino quando estiver pronto.</p></div>
    </div>
    <div class="form-group">
      <label class="form-label">O que você quer registrar?</label>
      <textarea class="form-textarea capture-textarea" id="f-capture-text" rows="5" placeholder="Uma tarefa, ideia, lembrete, anotação..."></textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Destino</label>
        <select class="form-select" id="f-capture-kind">
          <option value="inbox"${defaultKind==='inbox'?' selected':''}>Caixa de entrada</option>
          <option value="task"${defaultKind==='task'?' selected':''}>Tarefa</option>
          <option value="note"${defaultKind==='note'?' selected':''}>Nota</option>
          <option value="idea"${defaultKind==='idea'?' selected':''}>Ideia</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Projeto opcional</label>
        <select class="form-select" id="f-capture-project">
          <option value="">— Nenhum —</option>
          ${getProjectNames().map(name => `<option>${escHtml(name)}</option>`).join('')}
        </select>
      </div>
    </div>
  `, () => {
    const text = document.getElementById('f-capture-text').value.trim();
    if (!text) { toast('Escreva algo para capturar.', 'error'); return false; }
    const kind = document.getElementById('f-capture-kind').value;
    const project = document.getElementById('f-capture-project').value;
    if (kind === 'inbox') {
      S.inbox.unshift({ id: uid(), text, project, createdAt: new Date().toISOString(), owner_id: currentUserId, owner_name: currentUserName });
      saveInbox();
    } else {
      createFromCapture({ text, project }, kind);
    }
    renderDashboard();
    toast(kind === 'inbox' ? 'Item guardado na caixa de entrada.' : 'Captura organizada com sucesso!');
  });
  setTimeout(() => document.getElementById('f-capture-text')?.focus(), 40);
}

function createFromCapture(capture, kind) {
  const title = captureTitle(capture.text);
  const detail = capture.text.split(/\r?\n/).slice(1).join('\n').trim();
  if (kind === 'task') {
    const now = new Date().toISOString();
    S.tasks.unshift({ id: uid(), title, description: detail, project: capture.project || '', priority: 'Média', col: 'backlog', due: '', subtasks: [], estimatedMinutes: 30, blocked: false, recurrence: 'none', createdAt: now, updatedAt: now, owner_id: currentUserId, owner_name: currentUserName });
    saveTasks();
  } else if (kind === 'note') {
    S.notes.unshift({ id: uid(), type: 'note', name: title, content: capture.text, parentId: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), owner_id: currentUserId, owner_name: currentUserName });
    saveNotes();
  } else if (kind === 'idea') {
    S.ideas.unshift({ id: uid(), name: title, problem: detail, audience: '', monetization: '', potential: 'Médio', status: 'Em análise', notes: '', owner_id: currentUserId, owner_name: currentUserName });
    saveIdeas();
  }
}

function organizeInboxItem(id, kind) {
  const item = S.inbox.find(entry => entry.id === id);
  if (!item) return;
  createFromCapture(item, kind);
  S.inbox = S.inbox.filter(entry => entry.id !== id);
  saveInbox();
  renderDashboard();
  if (S.section === 'tasks') renderTasks();
  toast(kind === 'task' ? 'Transformado em tarefa.' : kind === 'note' ? 'Transformado em nota.' : 'Transformado em ideia.');
}

function deleteInboxItem(id) {
  S.inbox = S.inbox.filter(entry => entry.id !== id);
  saveInbox();
  renderInbox();
  toast('Captura removida.', 'info');
}

function renderInbox() {
  const target = document.getElementById('inboxList');
  if (!target) return;
  const items = S.inbox.slice(0, 6);
  target.innerHTML = items.length ? items.map(item => `
    <div class="inbox-item">
      <span class="inbox-item-icon"><i class='bx bx-edit-alt'></i></span>
      <div class="inbox-item-content">
        <strong>${escHtml(captureTitle(item.text))}</strong>
        <span>${escHtml(item.project || 'Não organizado')} · ${new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
      </div>
      <div class="inbox-item-actions">
        <button type="button" title="Transformar em tarefa" onclick="organizeInboxItem('${item.id}','task')"><i class='bx bx-check-square'></i></button>
        <button type="button" title="Transformar em nota" onclick="organizeInboxItem('${item.id}','note')"><i class='bx bx-note'></i></button>
        <button type="button" title="Transformar em ideia" onclick="organizeInboxItem('${item.id}','idea')"><i class='bx bx-bulb'></i></button>
        <button class="danger" type="button" title="Remover" onclick="deleteInboxItem('${item.id}')"><i class='bx bx-x'></i></button>
      </div>
    </div>`).join('') : `
      <button class="inbox-empty" type="button" onclick="openInboxCapture()">
        <i class='bx bx-check-circle'></i><span>Caixa de entrada vazia</span><small>Capture qualquer coisa com um único atalho.</small>
      </button>`;
}

/* ===== DAILY PLANNER ===== */
function currentDailyPlan() {
  const today = localDateString(new Date());
  return S.dailyPlans.find(plan => plan.date === today) || null;
}

function openDailyPlanner() {
  globalSearchClose();
  const today = localDateString(new Date());
  const plan = currentDailyPlan();
  const selected = new Set(plan?.taskIds || []);
  const openTasks = S.tasks
    .filter(task => task.kind !== 'event' && (task.col !== 'done' || selected.has(task.id)))
    .sort((a, b) => Number(b.priority === 'Alta') - Number(a.priority === 'Alta') || (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31'));
  openModal(plan ? 'Editar planejamento de hoje' : 'Planejar meu dia', `
    <div class="daily-plan-form-head">
      <span><i class='bx bx-sun'></i></span>
      <div><strong>Escolha até 3 prioridades</strong><p>Um dia claro começa decidindo o que realmente importa.</p></div>
    </div>
    <div class="form-group">
      <label class="form-label">Intenção do dia</label>
      <input class="form-input" id="f-plan-intention" placeholder="Ex: Terminar o dia com a proposta enviada" value="${escHtml(plan?.intention || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Prioridades</label>
      <div class="daily-task-picker">
        ${openTasks.length ? openTasks.map(task => `
          <label class="daily-task-option">
            <input type="checkbox" name="daily-task" value="${task.id}"${selected.has(task.id)?' checked':''}>
            <span class="daily-task-check"><i class='bx bx-check'></i></span>
            <span class="daily-task-option-copy"><strong>${escHtml(task.title)}</strong><small>${escHtml(task.project || colLabels[task.col] || 'Tarefa')}${task.due ? ` · ${fmtDate(task.due)}` : ''}</small></span>
            <span class="prio ${prioClass(task.priority)}">${escHtml(task.priority)}</span>
          </label>`).join('') : '<div class="daily-picker-empty">Nenhuma tarefa pendente. Crie uma tarefa primeiro.</div>'}
      </div>
    </div>
  `, () => {
    const taskIds = [...document.querySelectorAll('input[name="daily-task"]:checked')].map(input => input.value);
    if (taskIds.length > 3) { toast('Escolha no máximo 3 prioridades.', 'error'); return false; }
    if (!taskIds.length) { toast('Escolha pelo menos uma prioridade.', 'error'); return false; }
    const next = { date: today, intention: document.getElementById('f-plan-intention').value.trim(), taskIds, updatedAt: new Date().toISOString() };
    const index = S.dailyPlans.findIndex(item => item.date === today);
    if (index >= 0) S.dailyPlans[index] = next;
    else S.dailyPlans.unshift(next);
    saveDailyPlans();
    renderDashboard();
    toast('Planejamento do dia salvo!');
  });
}

function renderDailyPlanner() {
  const target = document.getElementById('dailyPlanner');
  if (!target) return;
  const plan = currentDailyPlan();
  if (!plan) {
    const suggested = S.tasks.filter(task => task.kind !== 'event' && task.col !== 'done' && (task.col === 'today' || task.priority === 'Alta')).length;
    target.innerHTML = `<button class="daily-plan-callout" type="button" onclick="openDailyPlanner()">
      <span class="daily-plan-callout-icon"><i class='bx bx-sun'></i></span>
      <span><strong>Planeje seu dia em 1 minuto</strong><small>${suggested ? `${suggested} tarefa${suggested > 1 ? 's' : ''} merece${suggested > 1 ? 'm' : ''} atenção hoje.` : 'Escolha suas três prioridades e comece com clareza.'}</small></span>
      <span class="daily-plan-callout-action">Planejar <i class='bx bx-right-arrow-alt'></i></span>
    </button>`;
    return;
  }
  const tasks = plan.taskIds.map(id => S.tasks.find(task => task.id === id)).filter(Boolean);
  const done = tasks.filter(task => task.col === 'done').length;
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  target.innerHTML = `<section class="daily-plan-card">
    <div class="daily-plan-card-head">
      <div><span class="daily-plan-eyebrow"><i class='bx bx-sun'></i> Plano de hoje</span><h2>${escHtml(plan.intention || 'Prioridades definidas')}</h2></div>
      <div class="daily-plan-progress"><strong>${done}/${tasks.length}</strong><span>concluídas</span><button type="button" onclick="openDailyPlanner()"><i class='bx bx-edit-alt'></i></button></div>
    </div>
    <div class="daily-plan-bar"><i style="width:${progress}%"></i></div>
    <div class="daily-plan-tasks">
      ${tasks.map(task => `<button class="daily-plan-task${task.col === 'done' ? ' done' : ''}" type="button" onclick="toggleTaskDone('${task.id}')"><span><i class='bx ${task.col === 'done' ? 'bx-check' : ''}'></i></span>${escHtml(task.title)}</button>`).join('')}
    </div>
  </section>`;
}

/* ===== JARVIS INSIGHTS & AUTOMATIONS ===== */
function insightDateValue(value) {
  if (!value) return null;
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSince(value) {
  const date = insightDateValue(value);
  return date ? Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000)) : 999;
}

function projectLastActivity(project) {
  const dates = [project.updatedAt, project.createdAt];
  S.tasks.filter(task => task.project === project.name).forEach(task => dates.push(task.updatedAt, task.createdAt));
  S.docs.filter(doc => doc.project === project.name).forEach(doc => dates.push(doc.updatedAt, doc.date));
  const valid = dates.map(insightDateValue).filter(Boolean).filter(date => date.getTime() <= Date.now());
  return valid.length ? new Date(Math.max(...valid.map(date => date.getTime()))) : null;
}

function taskInsightScore(task, today = localDateString(new Date())) {
  let score = task.priority === 'Alta' ? 35 : task.priority === 'Média' ? 18 : 8;
  if (task.due && task.due < today) score += 50 + Math.min(20, daysSince(task.due));
  else if (task.due === today) score += 42;
  else if (task.col === 'today') score += 30;
  if (task.col === 'inprogress') score += 15;
  if (task.blocked) score -= 25;
  return score;
}

function insightIsVisible(insight) {
  const dismissedUntil = insightState.dismissedUntil[insight.id];
  return !dismissedUntil || Number(dismissedUntil) <= Date.now();
}

function generateInsights() {
  const rules = appSettings.automations;
  if (!rules.enabled) return [];
  const today = localDateString(new Date());
  const insights = [];
  const openTasks = S.tasks.filter(task => task.kind !== 'event' && task.col !== 'done');
  const ranked = openTasks.map(task => ({ task, score: taskInsightScore(task, today) })).sort((a, b) => b.score - a.score).slice(0, 3);

  if (ranked.length) {
    const titles = ranked.map(item => item.task.title);
    insights.push({
      id: `priorities:${today}`, type: 'priorities', tone: 'accent', icon: 'bx-list-check', score: 110,
      title: 'Prioridades sugeridas',
      message: `Eu começaria por ${titles.map((title, index) => `${index + 1}. ${title}`).join(' · ')}`,
      detail: 'A ordem considera prazo, prioridade, status e bloqueios.',
      action: 'plan-day', actionLabel: 'Planejar meu dia'
    });
  }

  if (rules.overdueTasks) {
    const overdue = openTasks.filter(task => task.due && task.due < today);
    if (overdue.length) insights.push({
      id: 'overdue-tasks', type: 'overdue', tone: 'red', icon: 'bx-error-circle', score: 105,
      title: `${overdue.length} tarefa${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}`,
      message: `${overdue.slice(0, 2).map(task => task.title).join(' e ')}${overdue.length > 2 ? ` e mais ${overdue.length - 2}` : ''} precisam ser renegociadas ou concluídas.`,
      action: 'tasks', actionLabel: 'Revisar tarefas'
    });
  }

  if (rules.staleProjects) {
    S.projects.filter(project => project.status === 'Em desenvolvimento').map(project => {
      const activity = projectLastActivity(project);
      return { project, days: activity ? daysSince(activity.toISOString()) : 999 };
    }).filter(item => item.days >= rules.staleProjectDays).sort((a, b) => b.days - a.days).slice(0, 3).forEach(item => {
      insights.push({
        id: `stale-project:${item.project.id}`, type: 'stale-project', tone: 'amber', icon: 'bx-folder-minus', score: 85 + Math.min(item.days, 20),
        title: `${item.project.name} parece parado`,
        message: `Não encontrei movimentação recente neste projeto há ${item.days === 999 ? 'muito tempo' : `${item.days} dias`}.`,
        detail: 'Definir uma próxima ação pequena costuma destravar o ritmo.',
        action: 'project-task', actionLabel: 'Criar próxima tarefa', projectId: item.project.id
      });
    });
  }

  if (rules.crmFollowUps) {
    const followUps = S.contacts.filter(contact => contact.nextStep && !['Fechado', 'Perdido'].includes(contact.status));
    if (followUps.length) insights.push({
      id: 'crm-followups', type: 'crm', tone: 'purple', icon: 'bx-user-voice', score: 78,
      title: `${followUps.length} follow-up${followUps.length > 1 ? 's' : ''} aguardando`,
      message: `${followUps.slice(0, 3).map(contact => `${contact.name}: ${contact.nextStep}`).join(' · ')}${followUps.length > 3 ? ` · +${followUps.length - 3}` : ''}`,
      action: 'crm', actionLabel: 'Abrir CRM'
    });
  }

  if (rules.atRiskGoals) {
    S.goals.filter(goal => goal.status === 'Em risco').slice(0, 2).forEach(goal => insights.push({
      id: `goal-risk:${goal.id}`, type: 'goal', tone: 'purple', icon: 'bx-target-lock', score: 92,
      title: 'Meta em risco', message: goal.objective,
      detail: 'Revise os resultados-chave e escolha uma ação de recuperação.',
      action: 'goals', actionLabel: 'Revisar meta'
    }));
  }

  const now = new Date();
  if (rules.weeklyReview && [1, 2].includes(now.getDay()) && !S.reviews.some(review => review.weekOf === getWeekStart(now))) {
    insights.push({ id: `weekly-review:${getWeekStart(now)}`, type: 'review', tone: 'green', icon: 'bx-calendar-week', score: 72, title: 'Comece a semana com clareza', message: 'Sua revisão semanal ainda não foi registrada.', action: 'review', actionLabel: 'Fazer revisão' });
  }
  if (rules.dailyWrap && now.getHours() >= 17) {
    const remainingToday = openTasks.filter(task => task.due === today || task.col === 'today');
    if (remainingToday.length) insights.push({ id: `daily-wrap:${today}`, type: 'wrap', tone: 'blue', icon: 'bx-sunset', score: 70, title: 'Antes de encerrar o dia', message: `${remainingToday.length} tarefa${remainingToday.length > 1 ? 's' : ''} de hoje ainda ${remainingToday.length > 1 ? 'estão' : 'está'} aberta${remainingToday.length > 1 ? 's' : ''}.`, action: 'tasks', actionLabel: 'Fazer fechamento' });
  }

  return insights.filter(insightIsVisible).sort((a, b) => b.score - a.score);
}

function runConfiguredAutomations(force = false) {
  const rules = appSettings.automations;
  const today = localDateString(new Date());
  if (!rules.enabled || (!force && insightState.lastAutomationDate === today)) return;
  if (rules.overdueTasks && rules.overdueMove === 'today') {
    let moved = 0;
    S.tasks.forEach(task => {
      if (task.kind !== 'event' && task.col !== 'done' && task.due && task.due < today && task.col !== 'today') {
        task.col = 'today'; task.updatedAt = new Date().toISOString(); moved += 1;
      }
    });
    if (moved) { saveTasks(); toast(`${moved} tarefa${moved > 1 ? 's vencidas foram movidas' : ' vencida foi movida'} para Hoje.`, 'info'); }
  }
  insightState.lastAutomationDate = today;
  saveInsightState();
}

function renderJarvisInsights() {
  const target = document.getElementById('jarvisInsightsList');
  if (!target) return;
  const insights = S.activeInsights.slice(0, 5);
  if (!appSettings.automations.enabled) {
    target.innerHTML = `<div class="insight-empty"><i class='bx bx-bell-off'></i><div><strong>Jarvis proativo desativado</strong><span>Ative as automações para receber recomendações contextuais.</span></div><button class="panel-action" type="button" onclick="openSettings('automations')">Configurar</button></div>`;
    return;
  }
  if (!insights.length) {
    target.innerHTML = `<div class="insight-empty"><i class='bx bx-check-circle'></i><div><strong>Nada urgente por aqui</strong><span>O Jarvis continuará observando tarefas, projetos, metas e CRM.</span></div></div>`;
    return;
  }
  target.innerHTML = insights.map(insight => `
    <article class="insight-card insight-${insight.tone}">
      <div class="insight-icon"><i class='bx ${insight.icon}'></i></div>
      <div class="insight-copy"><strong>${escHtml(insight.title)}</strong><p>${escHtml(insight.message)}</p>${insight.detail ? `<small>${escHtml(insight.detail)}</small>` : ''}</div>
      <div class="insight-actions"><button class="insight-main-action" type="button" onclick="handleInsightAction('${insight.id}')">${escHtml(insight.actionLabel)} <i class='bx bx-right-arrow-alt'></i></button><button class="btn-icon" type="button" onclick="snoozeInsight('${insight.id}')" title="Lembrar mais tarde"><i class='bx bx-time-five'></i></button><button class="btn-icon" type="button" onclick="dismissInsight('${insight.id}')" title="Dispensar"><i class='bx bx-x'></i></button></div>
    </article>`).join('');
}

function dismissInsight(id, days = 30) {
  insightState.dismissedUntil[id] = Date.now() + days * 86400000;
  saveInsightState();
  runAutomationCycle({ proactive: false });
  toast('Recomendação dispensada.', 'info');
}

function snoozeInsight(id, hours = 4) {
  insightState.dismissedUntil[id] = Date.now() + hours * 3600000;
  saveInsightState();
  document.getElementById('jarvisProactive')?.classList.remove('open');
  runAutomationCycle({ proactive: false });
  toast('O Jarvis vai lembrar você mais tarde.', 'info');
}

function openInsightProjectTask(projectId) {
  const project = S.projects.find(item => item.id === projectId);
  if (!project) return navigateTo('projects');
  openModal('Próxima ação do projeto', taskForm({ project: project.name, priority: project.priority || 'Média', col: 'today', title: `Definir próximo passo — ${project.name}` }), () => {
    const title = document.getElementById('f-title').value.trim();
    if (!title) { toast('Título obrigatório.', 'error'); return false; }
    const now = new Date().toISOString();
    S.tasks.unshift(readTaskForm({ id: uid(), createdAt: now, updatedAt: now, owner_id: currentUserId, owner_name: currentUserName }));
    project.updatedAt = now;
    saveTasks(); saveProjects(); renderDashboard(); toast('Próxima ação criada.');
    return true;
  });
}

function handleInsightAction(id) {
  const insight = S.activeInsights.find(item => item.id === id);
  if (!insight) return;
  if (insight.action === 'plan-day') openDailyPlanner();
  else if (insight.action === 'project-task') openInsightProjectTask(insight.projectId);
  else if (insight.action === 'tasks') navigateTo('tasks');
  else if (insight.action === 'crm') navigateTo('crm');
  else if (insight.action === 'goals') navigateTo('goals');
  else if (insight.action === 'review') navigateTo('review');
}

function showProactiveInsight(insight) {
  const bubble = document.getElementById('jarvisProactive');
  const text = document.getElementById('jarvisProactiveText');
  if (!bubble || !text || !insight) return;
  bubble.dataset.insightId = insight.id;
  text.textContent = `${insight.title}: ${insight.message}`;
  bubble.classList.add('open');
  const content = `**${insight.title}**\n\n${insight.message}${insight.detail ? `\n\n${insight.detail}` : ''}`;
  jarvisMessages.push({ role: 'assistant', content, brain: 'local', proactive: true });
  jarvisGreeted = true;
  jarvisAppendMsg('assistant', content, 'local');
}

function runAutomationCycle({ force = false, proactive = true } = {}) {
  runConfiguredAutomations(force);
  S.activeInsights = generateInsights();
  renderJarvisInsights();
  const top = S.activeInsights[0];
  if (!proactive || !top || !appSettings.automations.enabled) return;
  const key = `${localDateString(new Date())}:${top.id}`;
  if (!force && insightState.lastProactiveKey === key) return;
  insightState.lastProactiveKey = key;
  saveInsightState();
  showProactiveInsight(top);
}

function initInsights() {
  document.getElementById('jarvisProactiveClose')?.addEventListener('click', () => {
    const id = document.getElementById('jarvisProactive')?.dataset.insightId;
    if (id) dismissInsight(id);
    document.getElementById('jarvisProactive')?.classList.remove('open');
  });
  document.getElementById('jarvisProactiveLater')?.addEventListener('click', () => {
    const id = document.getElementById('jarvisProactive')?.dataset.insightId;
    if (id) snoozeInsight(id);
  });
  document.getElementById('jarvisProactiveOpen')?.addEventListener('click', event => {
    event.stopPropagation();
    document.getElementById('jarvisProactive')?.classList.remove('open');
    if (!jarvisOpen) jarvisToggle();
  });
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

  renderDailyPlanner();
  renderInbox();
  S.activeInsights = generateInsights();
  renderJarvisInsights();
  applyDashboardPreferences();

  // Metrics
  const activeProjs = S.projects.filter(p => p.status === 'Em desenvolvimento').length;
  const pendingTasks = S.tasks.filter(t => t.kind !== 'event' && t.col !== 'done').length;
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
  const focusTasks = S.tasks.filter(t => t.kind !== 'event' && (t.col === 'inprogress' || t.col === 'today')).slice(0, 4);
  document.getElementById('weekFocus').innerHTML = focusTasks.length
    ? focusTasks.map((t, i) => `
        <div class="focus-item">
          <div class="focus-num">${i + 1}</div>
          <div class="focus-text">${escHtml(t.title)}</div>
          <span class="focus-proj">${escHtml(t.project || '—')}</span>
        </div>`).join('')
    : '<div class="focus-item"><div class="focus-text" style="color:var(--text3)">Nenhuma tarefa ativa. Adicione uma tarefa na lista.</div></div>';

  // Priority Tasks
  const hiPrio = S.tasks.filter(t => t.kind !== 'event' && t.priority === 'Alta' && t.col !== 'done').slice(0, 5);
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
    'Atualizar status das tarefas na lista',
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
    const now = new Date().toISOString();
    S.projects.unshift({ id: uid(), name, desc: document.getElementById('f-desc').value.trim(), status: document.getElementById('f-status').value, priority: document.getElementById('f-priority').value, progress: +document.getElementById('f-progress').value, createdAt: now, updatedAt: now, owner_id: currentUserId, owner_name: currentUserName });
    saveProjects(); renderProjects(); renderDashboard(); toast('Projeto criado com sucesso!');
  });
}

function editProject(id) {
  const p = S.projects.find(x => x.id === id);
  if (!p) return;
  openModal('Editar Projeto', projectForm(p), () => {
    const name = document.getElementById('f-name').value.trim();
    if (!name) { toast('Nome obrigatório.', 'error'); return false; }
    Object.assign(p, { name, desc: document.getElementById('f-desc').value.trim(), status: document.getElementById('f-status').value, priority: document.getElementById('f-priority').value, progress: +document.getElementById('f-progress').value, updatedAt: new Date().toISOString() });
    saveProjects(); renderProjects(); renderDashboard(); toast('Projeto atualizado!');
  });
}

function delProject(id) {
  openConfirm(() => {
    S.projects = S.projects.filter(x => x.id !== id);
    saveProjects(); renderProjects(); renderDashboard(); toast('Projeto excluído.', 'info');
  });
}

/* ===== TASKS (LIST) ===== */
const colLabels = { backlog: 'Backlog', today: 'Hoje', inprogress: 'Em andamento', done: 'Concluído' };
const taskStatusMeta = {
  backlog:    { label: 'Backlog', icon: 'bx-archive', tone: 'gray' },
  today:      { label: 'Hoje', icon: 'bx-sun', tone: 'blue' },
  inprogress: { label: 'Em andamento', icon: 'bx-loader-circle', tone: 'amber' },
  done:       { label: 'Concluídas', icon: 'bx-check-circle', tone: 'green' }
};

function renderTasks() {
  const allTasks = S.tasks.filter(t => t.kind !== 'event');
  const counts = Object.fromEntries(['backlog','today','inprogress','done'].map(col => [col, allTasks.filter(t => t.col === col).length]));
  const allCount = document.getElementById('ct-all');
  if (!allCount) return;
  allCount.textContent = allTasks.length;
  Object.entries(counts).forEach(([col, count]) => { document.getElementById('ct-' + col).textContent = count; });

  document.getElementById('taskSummary').innerHTML = ['backlog','today','inprogress','done'].map(col => {
    const meta = taskStatusMeta[col];
    return `<button class="task-stat ${meta.tone}" type="button" onclick="setTaskFilter('${col}')">
      <span class="task-stat-icon"><i class='bx ${meta.icon}'></i></span>
      <span><strong>${counts[col]}</strong><small>${meta.label}</small></span>
    </button>`;
  }).join('');

  document.querySelectorAll('.task-filter').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === S.taskFilter));
  const q = (document.getElementById('globalSearch')?.value || '').trim().toLowerCase();
  let tasks = S.taskFilter === 'all' ? [...allTasks] : allTasks.filter(t => t.col === S.taskFilter);
  if (q) tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.project || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));

  const statusOrder = { today: 0, inprogress: 1, backlog: 2, done: 3 };
  const priorityOrder = { 'Alta': 0, 'Média': 1, 'Baixa': 2 };
  tasks.sort((a, b) => (statusOrder[a.col] ?? 9) - (statusOrder[b.col] ?? 9)
    || (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)
    || (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31'));

  document.getElementById('taskList').innerHTML = tasks.length
    ? tasks.map(taskListItem).join('')
    : `<div class="task-list-empty"><i class='bx bx-check-circle'></i><strong>Nenhuma tarefa por aqui</strong><span>${q ? 'Tente outro termo de busca.' : 'Adicione uma tarefa ou escolha outro filtro.'}</span></div>`;
}

function setTaskFilter(filter) {
  S.taskFilter = filter;
  renderTasks();
}

function taskListItem(t) {
  const now = new Date(); now.setHours(0,0,0,0);
  const dueDate = t.due ? new Date(t.due + 'T00:00:00') : null;
  const isOverdue = dueDate && dueDate < now && t.col !== 'done';
  const isDone = t.col === 'done';
  const subtasks = Array.isArray(t.subtasks) ? t.subtasks : [];
  const subtaskDone = subtasks.filter(item => item.done).length;
  const recurrenceLabels = { daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal' };
  return `
    <div class="task-list-item${isDone ? ' is-done' : ''}" data-id="${t.id}">
      <div class="task-list-main">
        <button class="task-complete" type="button" onclick="toggleTaskDone('${t.id}')" aria-label="${isDone ? 'Reabrir' : 'Concluir'} tarefa" aria-pressed="${isDone}">
          <i class='bx ${isDone ? 'bx-check' : ''}'></i>
        </button>
        <button class="task-list-title" type="button" onclick="editTask('${t.id}')">${escHtml(t.title)}</button>
        <div class="task-list-mobile-meta">
          ${t.project ? `<span><i class='bx bx-folder'></i>${escHtml(t.project)}</span>` : ''}
          ${t.due ? `<span class="${isOverdue ? 'overdue' : ''}"><i class='bx bx-calendar'></i>${fmtDate(t.due)}</span>` : ''}
        </div>
        <div class="task-extra-meta">
          ${t.blocked ? `<span class="task-blocked"><i class='bx bx-block'></i> Bloqueada</span>` : ''}
          ${subtasks.length ? `<span><i class='bx bx-list-check'></i> ${subtaskDone}/${subtasks.length}</span>` : ''}
          ${Number(t.estimatedMinutes) ? `<span><i class='bx bx-time-five'></i> ${Number(t.estimatedMinutes)} min</span>` : ''}
          ${t.recurrence && t.recurrence !== 'none' ? `<span><i class='bx bx-repeat'></i> ${recurrenceLabels[t.recurrence] || 'Recorrente'}</span>` : ''}
        </div>
      </div>
      <div class="task-list-project">${t.project ? `<span class="task-proj-tag">${escHtml(t.project)}</span>` : '<span class="task-muted">Sem projeto</span>'}</div>
      <div class="task-list-date${isOverdue ? ' overdue' : ''}">${t.due ? `<i class='bx bx-calendar'></i>${fmtDate(t.due)}${isOverdue ? '<small>Atrasada</small>' : ''}` : '<span class="task-muted">Sem prazo</span>'}</div>
      <div><span class="prio ${prioClass(t.priority)}">${escHtml(t.priority)}</span></div>
      <div>
        <select class="task-status-select status-${t.col}" aria-label="Status da tarefa" onchange="moveTask('${t.id}',this.value)">
          ${Object.entries(colLabels).map(([k,v]) => `<option value="${k}"${t.col===k?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="task-list-actions">
        ${ownerBadge(t)}
        <button class="btn-icon green" type="button" onclick="editTask('${t.id}')" aria-label="Editar tarefa"><i class='bx bx-edit-alt'></i></button>
        <button class="btn-icon danger" type="button" onclick="delTask('${t.id}')" aria-label="Excluir tarefa"><i class='bx bx-trash'></i></button>
      </div>
    </div>`;
}

function toggleTaskDone(id) {
  const task = S.tasks.find(t => t.id === id);
  if (!task) return;
  if (task.col === 'done') {
    task.col = task.previousCol && task.previousCol !== 'done' ? task.previousCol : 'backlog';
    if (task.nextOccurrenceId) {
      S.tasks = S.tasks.filter(candidate => candidate.id !== task.nextOccurrenceId || candidate.recurrenceSourceId !== task.id || candidate.col === 'done');
      delete task.nextOccurrenceId;
    }
  } else {
    task.previousCol = task.col;
    task.col = 'done';
    createNextTaskOccurrence(task);
  }
  task.updatedAt = new Date().toISOString();
  saveTasks(); renderTasks(); renderDashboard();
}

function nextTaskDue(task) {
  const base = dateFromString(task.due || localDateString(new Date()));
  if (task.recurrence === 'daily') base.setDate(base.getDate() + 1);
  else if (task.recurrence === 'weekly') base.setDate(base.getDate() + 7);
  else if (task.recurrence === 'monthly') base.setMonth(base.getMonth() + 1);
  return localDateString(base);
}

function createNextTaskOccurrence(task) {
  if (!task.recurrence || task.recurrence === 'none' || task.nextOccurrenceId) return;
  const due = nextTaskDue(task);
  const next = {
    ...task,
    id: uid(),
    due,
    col: due === localDateString(new Date()) ? 'today' : 'backlog',
    previousCol: undefined,
    nextOccurrenceId: undefined,
    recurrenceSourceId: task.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: (task.subtasks || []).map(item => ({ ...item, id: uid(), done: false }))
  };
  task.nextOccurrenceId = next.id;
  S.tasks.unshift(next);
  toast(`Próxima ocorrência criada para ${fmtDate(due)}.`, 'info');
}

function subtaskField(item = {}) {
  return `<div class="subtask-form-row" data-id="${escHtml(item.id || uid())}">
    <label><input class="subtask-form-check" type="checkbox"${item.done ? ' checked' : ''}><span><i class='bx bx-check'></i></span></label>
    <input class="form-input subtask-form-title" value="${escHtml(item.title || '')}" placeholder="Descreva a subtarefa">
    <button class="btn-icon danger" type="button" onclick="this.closest('.subtask-form-row').remove()" aria-label="Remover subtarefa"><i class='bx bx-x'></i></button>
  </div>`;
}

function addSubtaskField(item = {}) {
  const list = document.getElementById('taskSubtaskList');
  if (!list) return;
  list.insertAdjacentHTML('beforeend', subtaskField(item));
  list.lastElementChild?.querySelector('.subtask-form-title')?.focus();
}

function collectSubtasks() {
  return [...document.querySelectorAll('#taskSubtaskList .subtask-form-row')].map(row => ({
    id: row.dataset.id || uid(),
    title: row.querySelector('.subtask-form-title').value.trim(),
    done: row.querySelector('.subtask-form-check').checked
  })).filter(item => item.title);
}

function taskForm(t = {}) {
  const projNames = getProjectNames();
  return `
    <div class="form-group">
      <label class="form-label">Título da Tarefa *</label>
      <input class="form-input" id="f-title" placeholder="Ex: Refinar dashboard" value="${escHtml(t.title || '')}">
    </div>
    <div class="form-group">
      <label class="form-label">Descrição</label>
      <textarea class="form-textarea" id="f-task-description" rows="3" placeholder="Contexto, resultado esperado ou links importantes">${escHtml(t.description || '')}</textarea>
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
        <label class="form-label">Status</label>
        <select class="form-select" id="f-col">
          ${Object.entries(colLabels).map(([k,v]) => `<option value="${k}"${(t.col||'backlog')===k?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Prazo</label>
        <input class="form-input" id="f-due" type="date" value="${t.due || ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Tempo estimado</label>
        <div class="input-suffix"><input class="form-input" id="f-task-estimate" type="number" min="0" max="1440" step="5" value="${Number(t.estimatedMinutes || 0)}"><span>min</span></div>
      </div>
      <div class="form-group">
        <label class="form-label">Recorrência</label>
        <select class="form-select" id="f-task-recurrence">
          ${[['none','Não repetir'],['daily','Diariamente'],['weekly','Semanalmente'],['monthly','Mensalmente']].map(([value,label]) => `<option value="${value}"${(t.recurrence||'none')===value?' selected':''}>${label}</option>`).join('')}
        </select>
      </div>
    </div>
    <label class="task-block-toggle">
      <input type="checkbox" id="f-task-blocked"${t.blocked ? ' checked' : ''}>
      <span><i class='bx bx-block'></i></span>
      <span><strong>Tarefa bloqueada</strong><small>Marque quando ela depende de algo antes de avançar.</small></span>
    </label>
    <div class="form-group task-subtasks-form">
      <div class="form-section-head"><label class="form-label">Subtarefas</label><button type="button" onclick="addSubtaskField()"><i class='bx bx-plus'></i> Adicionar</button></div>
      <div id="taskSubtaskList">${(t.subtasks || []).map(subtaskField).join('')}</div>
    </div>
  `;
}

function readTaskForm(base = {}) {
  const now = new Date().toISOString();
  return {
    ...base,
    createdAt: base.createdAt || now,
    updatedAt: now,
    title: document.getElementById('f-title').value.trim(),
    description: document.getElementById('f-task-description').value.trim(),
    project: document.getElementById('f-project').value,
    priority: document.getElementById('f-priority').value,
    col: document.getElementById('f-col').value,
    due: document.getElementById('f-due').value,
    estimatedMinutes: Math.max(0, Number(document.getElementById('f-task-estimate').value) || 0),
    recurrence: document.getElementById('f-task-recurrence').value,
    blocked: document.getElementById('f-task-blocked').checked,
    subtasks: collectSubtasks()
  };
}

function newTask(col) {
  const def = { col: col || 'backlog' };
  openModal('Nova Tarefa', taskForm(def), () => {
    const title = document.getElementById('f-title').value.trim();
    if (!title) { toast('Título obrigatório.', 'error'); return false; }
    S.tasks.unshift(readTaskForm({ id: uid(), owner_id: currentUserId, owner_name: currentUserName }));
    saveTasks(); renderTasks(); renderDashboard(); if (S.section === 'agenda') renderAgenda(); toast('Tarefa criada!');
  });
}

function editTask(id) {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  openModal('Editar Tarefa', taskForm(t), () => {
    const title = document.getElementById('f-title').value.trim();
    if (!title) { toast('Título obrigatório.', 'error'); return false; }
    Object.assign(t, readTaskForm(t));
    saveTasks(); renderTasks(); renderDashboard(); if (S.section === 'agenda') renderAgenda(); toast('Tarefa atualizada!');
  });
}

function delTask(id) {
  openConfirm(() => {
    S.tasks = S.tasks.filter(x => x.id !== id);
    saveTasks(); renderTasks(); renderDashboard(); if (S.section === 'agenda') renderAgenda(); toast('Tarefa excluída.', 'info');
  });
}

function moveTask(id, col) {
  const t = S.tasks.find(x => x.id === id);
  if (t) { t.col = col; t.updatedAt = new Date().toISOString(); saveTasks(); renderTasks(); renderDashboard(); }
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
function isRecurringTransaction(transaction) {
  return transaction?.kind === 'recurring' && Boolean(transaction?.recurrence?.frequency);
}

function transactionMatchesPattern(transaction, dateString) {
  const recurrence = transaction.recurrence || {};
  const start = dateFromString(transaction.date);
  const date = dateFromString(dateString);
  if (!transaction.date || Number.isNaN(start.getTime()) || date < start) return false;
  const interval = Math.max(Number(recurrence.interval) || 1, 1);
  const diffDays = Math.floor((date - start) / 86400000);
  if (recurrence.frequency === 'weekly') return diffDays >= 0 && diffDays % (7 * interval) === 0;
  if (recurrence.frequency === 'yearly') {
    const yearDiff = date.getFullYear() - start.getFullYear();
    return yearDiff >= 0 && yearDiff % interval === 0 && date.getMonth() === start.getMonth() && date.getDate() === start.getDate();
  }
  const monthDiff = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
  return monthDiff >= 0 && monthDiff % interval === 0 && date.getDate() === start.getDate();
}

function transactionOccursOn(transaction, dateString) {
  if (!isRecurringTransaction(transaction) || !transactionMatchesPattern(transaction, dateString)) return false;
  const recurrence = transaction.recurrence;
  return !(recurrence.end === 'date' && recurrence.until && dateString > recurrence.until);
}

function financialEntriesBetween(from, to) {
  const entries = S.transactions
    .filter(transaction => !isRecurringTransaction(transaction) && transaction.date >= from && transaction.date <= to)
    .map(transaction => ({ ...transaction, projected: transaction.date > localDateString(new Date()) }));
  S.transactions.filter(isRecurringTransaction).forEach(series => {
    const start = series.date > from ? series.date : from;
    for (let cursor = start; cursor <= to; cursor = addCalendarDays(cursor, 1)) {
      if (transactionOccursOn(series, cursor)) entries.push({ ...series, id: `${series.id}:${cursor}`, date: cursor, seriesId: series.id, projected: cursor > localDateString(new Date()) });
      if (series.recurrence.end === 'date' && series.recurrence.until && cursor > series.recurrence.until) break;
    }
  });
  return entries;
}

function financialTotals(entries) {
  const income = entries.filter(item => item.type === 'Receita').reduce((sum, item) => sum + Number(item.value || 0), 0);
  const expense = entries.filter(item => item.type === 'Despesa').reduce((sum, item) => sum + Number(item.value || 0), 0);
  return { income, expense, balance: income - expense };
}

function financialMonthRange(offset = 0) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  const start = localDateString(date);
  const end = localDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  return { start, end, label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '') };
}

function recurringTransactionLabel(transaction) {
  const recurrence = transaction.recurrence || {};
  const interval = Math.max(Number(recurrence.interval) || 1, 1);
  const labels = {
    weekly: interval === 1 ? 'Toda semana' : `A cada ${interval} semanas`,
    monthly: interval === 1 ? 'Todo mês' : `A cada ${interval} meses`,
    yearly: interval === 1 ? 'Todo ano' : `A cada ${interval} anos`
  };
  let label = labels[recurrence.frequency] || 'Recorrente';
  if (recurrence.end === 'date' && recurrence.until) label += ` · até ${fmtDate(recurrence.until)}`;
  return label;
}

function nextTransactionOccurrence(transaction, from = localDateString(new Date())) {
  const start = transaction.date > from ? transaction.date : from;
  for (let cursor = start, checked = 0; checked < 3660; cursor = addCalendarDays(cursor, 1), checked++) {
    if (transactionOccursOn(transaction, cursor)) return cursor;
    if (transaction.recurrence?.end === 'date' && transaction.recurrence.until && cursor > transaction.recurrence.until) break;
  }
  return '';
}

function validateFinancialRecurrenceArgs(args, startDate) {
  const frequency = args.frequency || 'monthly';
  const end = args.end_type || 'never';
  if (!['weekly','monthly','yearly'].includes(frequency)) return 'Frequência inválida.';
  if (!['never','date'].includes(end)) return 'Regra de término inválida.';
  if (end === 'date' && (!args.until || args.until < startDate)) return 'A data final deve ser igual ou posterior à inicial.';
  return '';
}

function renderFinancial() {
  const today = localDateString(new Date());
  const earliest = S.transactions.map(item => item.date).filter(Boolean).sort()[0] || today;
  const realized = financialTotals(financialEntriesBetween(earliest, today));
  const next30 = financialTotals(financialEntriesBetween(addCalendarDays(today, 1), addCalendarDays(today, 30)));
  const { income, expense, balance } = realized;

  document.getElementById('financialMetrics').innerHTML = `
    <div class="metric-card" style="--accent-color:#22C55E">
      <div class="metric-icon" style="background:rgba(34,197,94,0.15);color:#22C55E"><i class='bx bx-trending-up'></i></div>
      <div class="metric-body">
        <div class="metric-value" style="font-size:20px">${fmtCurrency(income)}</div>
        <div class="metric-label">Receitas realizadas</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:#FF4757">
      <div class="metric-icon" style="background:rgba(255,71,87,0.12);color:#FF4757"><i class='bx bx-trending-down'></i></div>
      <div class="metric-body">
        <div class="metric-value" style="font-size:20px">${fmtCurrency(expense)}</div>
        <div class="metric-label">Despesas realizadas</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:${balance >= 0 ? '#22C55E' : '#FF4757'}">
      <div class="metric-icon" style="background:${balance>=0?'rgba(34,197,94,0.15)':'rgba(255,71,87,0.12)'};color:${balance>=0?'#22C55E':'#FF4757'}"><i class='bx bx-wallet'></i></div>
      <div class="metric-body">
        <div class="metric-value" style="font-size:20px;color:${balance>=0?'#22C55E':'var(--red)'}">${fmtCurrency(balance)}</div>
        <div class="metric-label">${balance >= 0 ? 'Saldo acumulado' : 'Saldo negativo'}</div>
      </div>
    </div>
    <div class="metric-card" style="--accent-color:#4D8EFF">
      <div class="metric-icon" style="background:rgba(77,142,255,0.12);color:#4D8EFF"><i class='bx bx-calendar-check'></i></div>
      <div class="metric-body">
        <div class="metric-value" style="font-size:20px;color:${next30.balance>=0?'#22C55E':'var(--red)'}">${fmtCurrency(next30.balance)}</div>
        <div class="metric-label">Fluxo previsto · 30 dias</div>
      </div>
    </div>
  `;

  const months = Array.from({ length: 6 }, (_, offset) => {
    const range = financialMonthRange(offset);
    return { ...range, ...financialTotals(financialEntriesBetween(range.start, range.end)) };
  });
  const maxMonthValue = Math.max(...months.map(month => Math.max(month.income, month.expense)), 1);
  document.getElementById('financialForecast').innerHTML = `
    <div class="panel financial-forecast-panel">
      <div class="panel-head"><div><h3 class="panel-title">Projeção de caixa</h3><p class="panel-subtitle">Lançamentos únicos e recorrentes dos próximos 6 meses</p></div></div>
      <div class="forecast-months">${months.map(month => `
        <div class="forecast-month">
          <div class="forecast-month-head"><strong>${month.label}</strong><span class="${month.balance>=0?'income':'expense'}">${fmtCurrency(month.balance)}</span></div>
          <div class="forecast-bar-row"><span>Entradas</span><div><i class="income" style="width:${Math.round(month.income/maxMonthValue*100)}%"></i></div><b>${fmtCurrency(month.income)}</b></div>
          <div class="forecast-bar-row"><span>Saídas</span><div><i class="expense" style="width:${Math.round(month.expense/maxMonthValue*100)}%"></i></div><b>${fmtCurrency(month.expense)}</b></div>
        </div>`).join('')}</div>
    </div>`;

  let recurring = S.transactions.filter(isRecurringTransaction);
  if (S.finFilter !== 'all') recurring = recurring.filter(transaction => transaction.type === S.finFilter);
  document.getElementById('recurringTransactions').innerHTML = `
    <div class="panel recurring-financial-panel">
      <div class="panel-head"><div><h3 class="panel-title">Lançamentos recorrentes</h3><p class="panel-subtitle">${recurring.length} série${recurring.length===1?'':'s'} cadastrada${recurring.length===1?'':'s'}</p></div><button class="btn-ghost" onclick="newTransaction(true)"><i class='bx bx-repeat'></i> Novo recorrente</button></div>
      <div class="recurring-financial-list">${recurring.length ? recurring.map(transaction => {
        const next = nextTransactionOccurrence(transaction);
        return `<div class="recurring-financial-row"><div class="tx-icon ${transaction.type==='Receita'?'income':'expense'}"><i class='bx bx-repeat'></i></div><div class="tx-info"><div class="tx-desc">${escHtml(transaction.desc)}</div><div class="tx-meta">${escHtml(recurringTransactionLabel(transaction))} · ${next ? `próximo em ${fmtDate(next)}` : 'encerrado'}${transaction.project ? ` · ${escHtml(transaction.project)}` : ''}</div></div><div class="tx-amount ${transaction.type==='Receita'?'income':'expense'}">${transaction.type==='Receita'?'+':'-'}${fmtCurrency(transaction.value)}</div><div class="tx-actions"><button class="btn-icon green" onclick="editTransaction('${transaction.id}')"><i class='bx bx-edit-alt'></i></button><button class="btn-icon danger" onclick="delTransaction('${transaction.id}')"><i class='bx bx-trash'></i></button></div></div>`;
      }).join('') : `<div class="finance-inline-empty">Nenhum lançamento recorrente neste filtro.</div>`}</div>
    </div>`;

  let list = S.transactions.filter(transaction => !isRecurringTransaction(transaction)).sort((a,b) => (b.date||'').localeCompare(a.date||''));
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

function transactionForm(t = {}, forceRecurring = false) {
  const projNames = getProjectNames();
  const recurring = forceRecurring || isRecurringTransaction(t);
  const recurrence = t.recurrence || {};
  const recurrenceEnd = recurrence.end || 'never';
  const startDate = t.date || localDateString(new Date());
  return `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Tipo *</label><select class="form-select" id="f-type"><option${t.type==='Receita'?' selected':''}>Receita</option><option${t.type==='Despesa'?' selected':''}>Despesa</option></select></div>
      <div class="form-group"><label class="form-label">Valor (R$) *</label><input class="form-input" id="f-value" type="number" min="0" step="0.01" placeholder="0,00" value="${t.value||''}"></div>
    </div>
    <div class="form-group"><label class="form-label">Descrição *</label><input class="form-input" id="f-desc" placeholder="Ex: Hospedagem AWS" value="${escHtml(t.desc||'')}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Projeto</label><select class="form-select" id="f-project"><option value="">— Geral —</option>${projNames.map(n => `<option${t.project===n?' selected':''}>${escHtml(n)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Data inicial</label><input class="form-input" id="f-date" type="date" value="${startDate}" onchange="syncTransactionRecurrenceForm()"></div>
    </div>
    <label class="finance-repeat-toggle"><input type="checkbox" id="f-tx-recurring"${recurring?' checked':''} onchange="syncTransactionRecurrenceForm()"><span><i class='bx bx-repeat'></i></span><div><strong>Repetir lançamento</strong><small>Inclui automaticamente este valor nas projeções futuras.</small></div></label>
    <div class="finance-recurrence-box" id="financeRecurrenceBox"${recurring?'':' style="display:none"'}>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Frequência</label><select class="form-select" id="f-tx-frequency"><option value="weekly"${recurrence.frequency==='weekly'?' selected':''}>Semanal</option><option value="monthly"${(recurrence.frequency||'monthly')==='monthly'?' selected':''}>Mensal</option><option value="yearly"${recurrence.frequency==='yearly'?' selected':''}>Anual</option></select></div>
        <div class="form-group"><label class="form-label">A cada</label><input class="form-input" id="f-tx-interval" type="number" min="1" max="99" value="${Math.max(Number(recurrence.interval)||1,1)}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Término</label><select class="form-select" id="f-tx-end" onchange="syncTransactionRecurrenceForm()"><option value="never"${recurrenceEnd==='never'?' selected':''}>Nunca</option><option value="date"${recurrenceEnd==='date'?' selected':''}>Em uma data</option></select></div>
        <div class="form-group" id="financeRecurrenceUntil"${recurrenceEnd==='never'?' style="display:none"':''}><label class="form-label">Última ocorrência</label><input class="form-input" id="f-tx-until" type="date" min="${startDate}" value="${recurrence.until || startDate}"></div>
      </div>
    </div>`;
}

function syncTransactionRecurrenceForm() {
  const recurring = document.getElementById('f-tx-recurring')?.checked;
  const box = document.getElementById('financeRecurrenceBox');
  if (box) box.style.display = recurring ? '' : 'none';
  const end = document.getElementById('f-tx-end')?.value;
  const untilWrap = document.getElementById('financeRecurrenceUntil');
  if (untilWrap) untilWrap.style.display = recurring && end === 'date' ? '' : 'none';
  const until = document.getElementById('f-tx-until');
  if (until) until.min = document.getElementById('f-date')?.value || '';
}

function readTransactionForm(existing = {}) {
  const desc = document.getElementById('f-desc').value.trim();
  const value = parseFloat(document.getElementById('f-value').value);
  const date = document.getElementById('f-date').value;
  if (!desc) { toast('Descrição obrigatória.', 'error'); return null; }
  if (!value || value <= 0) { toast('Valor inválido.', 'error'); return null; }
  if (!date) { toast('Data obrigatória.', 'error'); return null; }
  const recurring = document.getElementById('f-tx-recurring').checked;
  const end = document.getElementById('f-tx-end').value;
  const until = document.getElementById('f-tx-until').value;
  if (recurring && end === 'date' && (!until || until < date)) { toast('A última ocorrência deve ser posterior à data inicial.', 'error'); return null; }
  return {
    ...existing, type: document.getElementById('f-type').value, desc, value,
    project: document.getElementById('f-project').value, date,
    kind: recurring ? 'recurring' : undefined,
    recurrence: recurring ? { frequency: document.getElementById('f-tx-frequency').value, interval: Math.max(Number(document.getElementById('f-tx-interval').value) || 1, 1), end, until: end === 'date' ? until : '' } : undefined
  };
}

function newTransaction(forceRecurring = false) {
  openModal(forceRecurring ? 'Novo Lançamento Recorrente' : 'Novo Lançamento', transactionForm({}, forceRecurring), () => {
    const transaction = readTransactionForm({ id: uid(), owner_id: currentUserId, owner_name: currentUserName });
    if (!transaction) return false;
    S.transactions.unshift(transaction);
    saveTransactions(); renderFinancial(); toast('Lançamento criado!');
  });
}

function editTransaction(id) {
  const transaction = S.transactions.find(item => item.id === id);
  if (!transaction) return;
  openModal('Editar Lançamento', transactionForm(transaction), () => {
    const updated = readTransactionForm(transaction);
    if (!updated) return false;
    Object.assign(transaction, updated);
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

/* ====================================================
   ESTUDOS
   ==================================================== */

let studyTimerInterval = null;
const STUDY_COLORS = ['#4D8EFF', '#9B6DFF', '#22C55E', '#F5A623', '#EC4899', '#F97316', '#14B8A6', '#FF4757'];

function ensureStudyPrograms() {
  if (S.studyPrograms.length) return;
  const now = studyNowIso();
  S.studyPrograms = [
    { id: 'computer-science', name: 'Ciência da Computação', shortName: 'CC', color: '#4D8EFF', icon: 'bx-code-alt', createdAt: now, updatedAt: now },
    { id: 'systems-analysis', name: 'Análise e Desenvolvimento de Sistemas', shortName: 'ADS', color: '#9B6DFF', icon: 'bx-devices', createdAt: now, updatedAt: now }
  ];
  saveStudyPrograms();
}

function suggestedStudyTerm() {
  const now = new Date();
  return `${now.getFullYear()}.${now.getMonth() < 6 ? 1 : 2}`;
}

function selectedStudyTerm() {
  let term = S.studyTerms.find(item => item.id === S.studyTermId);
  if (!term) term = S.studyTerms.find(item => item.active && !item.archived) || S.studyTerms.find(item => !item.archived) || S.studyTerms[0];
  if (term) S.studyTermId = term.id;
  return term || null;
}

function studySubject(id) { return S.subjects.find(subject => subject.id === id); }
function studyProgram(id) { return S.studyPrograms.find(program => program.id === id); }
function studyTermSubjects(termId) { return S.subjects.filter(subject => subject.termId === termId); }
function visibleStudySubjects(termId) {
  const subjects = studyTermSubjects(termId);
  return S.studyProgramFilter === 'all' ? subjects : subjects.filter(subject => subject.programId === S.studyProgramFilter);
}
function studyNowIso() { return new Date().toISOString(); }
function studyDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function studyMinutesLabel(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  if (!hours) return `${rest}min`;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}
function studyElapsedLabel(startedAt) {
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}
function activeStudySession() { return S.studySessions.find(session => session.startedAt && !session.endedAt) || null; }

function setStudyView(view) {
  S.studyView = ['overview', 'subjects', 'assessments', 'sessions'].includes(view) ? view : 'overview';
  renderStudies();
}

function setStudyProgramFilter(programId) {
  if (programId !== 'all' && !S.studyPrograms.some(program => program.id === programId)) return;
  S.studyProgramFilter = programId;
  S.studySubjectFilter = 'all';
  renderStudies();
}

function selectStudyTerm(id) {
  if (!S.studyTerms.some(term => term.id === id)) return;
  S.studyTermId = id;
  S.studyProgramFilter = 'all';
  S.studySubjectFilter = 'all';
  S.studyAssessmentFilter = 'all';
  renderStudies();
}

function activateStudyTerm(id) {
  const now = studyNowIso();
  S.studyTerms = S.studyTerms.map(term => ({ ...term, active: term.id === id, archived: term.id === id ? false : term.archived, updatedAt: term.id === id ? now : term.updatedAt }));
  S.studyTermId = id;
  saveStudyTerms();
  renderStudies();
  toast('Período definido como ativo.');
}

function archiveStudyTerm(id) {
  const term = S.studyTerms.find(item => item.id === id);
  if (!term) return;
  openConfirm(() => {
    term.archived = true;
    term.active = false;
    term.updatedAt = studyNowIso();
    const next = S.studyTerms.find(item => item.id !== id && !item.archived);
    if (next && !S.studyTerms.some(item => item.active && !item.archived)) next.active = true;
    saveStudyTerms();
    renderStudies();
    toast('Período arquivado.', 'info');
  });
}

function studyEmpty(icon, title, text, action = '') {
  return `<div class="study-empty"><i class='bx ${icon}'></i><strong>${title}</strong><span>${text}</span>${action}</div>`;
}

function renderStudies() {
  const root = document.getElementById('studiesView');
  if (!root) return;
  const term = selectedStudyTerm();
  if (!term) {
    root.innerHTML = `<div class="study-onboarding"><div class="study-onboarding-icon"><i class='bx bx-book-reader'></i></div><span class="study-eyebrow">Sua jornada acadêmica começa aqui</span><h1>Organize seu semestre em um só lugar</h1><p>Cadastre o período atual para acompanhar matérias, avaliações, notas e todo o tempo dedicado aos estudos.</p><button class="btn-primary" type="button" onclick="newStudyTerm()"><i class='bx bx-plus'></i> Criar primeiro período</button></div>`;
    return;
  }

  const tabs = [
    ['overview', 'bx-grid-alt', 'Visão geral'], ['subjects', 'bx-book', 'Matérias'],
    ['assessments', 'bx-clipboard', 'Avaliações'], ['sessions', 'bx-time-five', 'Sessões']
  ];
  root.innerHTML = `
    <div class="study-header">
      <div><span class="study-eyebrow">Central acadêmica</span><h1>${escHtml(term.name)}</h1><p>${term.archived ? 'Período arquivado · consulte seu histórico' : term.active ? 'Seu período acadêmico ativo' : 'Consultando um período anterior'}</p></div>
      <div class="study-term-controls">
        <label class="study-term-select"><i class='bx bx-calendar'></i><select aria-label="Selecionar período" onchange="selectStudyTerm(this.value)">${S.studyTerms.map(item => `<option value="${item.id}"${item.id === term.id ? ' selected' : ''}>${escHtml(item.name)}${item.active ? ' · ativo' : item.archived ? ' · arquivado' : ''}</option>`).join('')}</select></label>
        <button class="btn-ghost study-icon-action" type="button" onclick="newStudyTerm()" title="Novo período"><i class='bx bx-plus'></i></button>
        <button class="btn-ghost study-icon-action" type="button" onclick="editStudyTerm('${term.id}')" title="Editar período"><i class='bx bx-edit'></i></button>
        ${!term.active ? `<button class="btn-ghost" type="button" onclick="activateStudyTerm('${term.id}')"><i class='bx bx-check-circle'></i> Tornar ativo</button>` : ''}
        ${!term.archived ? `<button class="btn-ghost study-icon-action" type="button" onclick="archiveStudyTerm('${term.id}')" title="Arquivar período"><i class='bx bx-archive-in'></i></button>` : ''}
      </div>
    </div>
    <div class="study-program-switcher" aria-label="Filtrar por curso">
      <button type="button" class="study-program-option${S.studyProgramFilter === 'all' ? ' active' : ''}" onclick="setStudyProgramFilter('all')"><span class="study-program-symbol all-programs"><i class='bx bx-layer'></i></span><span><strong>Todos</strong><small>Visão combinada</small></span></button>
      ${S.studyPrograms.map(program => `<button type="button" class="study-program-option${S.studyProgramFilter === program.id ? ' active' : ''}" style="--program:${program.color}" onclick="setStudyProgramFilter('${program.id}')"><span class="study-program-symbol"><i class='bx ${program.icon || 'bx-book'}'></i></span><span><strong>${escHtml(program.shortName)}</strong><small>${escHtml(program.name)}</small></span></button>`).join('')}
    </div>
    <div class="study-tabs" role="tablist">${tabs.map(([id, icon, label]) => `<button type="button" role="tab" aria-selected="${S.studyView === id}" class="study-tab${S.studyView === id ? ' active' : ''}" onclick="setStudyView('${id}')"><i class='bx ${icon}'></i><span>${label}</span></button>`).join('')}</div>
    <div id="studyTimerMount">${renderStudyTimer()}</div>
    <div class="study-view" id="studyViewContent"></div>`;

  if (S.studyView === 'subjects') renderStudySubjects(term);
  else if (S.studyView === 'assessments') renderStudyAssessments(term);
  else if (S.studyView === 'sessions') renderStudySessions(term);
  else renderStudyOverview(term);
  syncStudyTimerInterval();
}

function renderStudyTimer() {
  const session = activeStudySession();
  if (!session) return '';
  const subject = studySubject(session.subjectId);
  const program = studyProgram(subject?.programId);
  return `<div class="study-running" role="timer"><div class="study-running-pulse"><i class='bx bx-timer'></i></div><div class="study-running-copy"><span>Sessão em andamento${program ? ` · ${escHtml(program.shortName)}` : ''}</span><strong>${escHtml(subject?.name || 'Matéria removida')}${session.topic ? ` · ${escHtml(session.topic)}` : ''}</strong></div><div class="study-running-time" id="studyRunningTime">${studyElapsedLabel(session.startedAt)}</div><button class="btn-primary" type="button" onclick="finishStudyTimer()"><i class='bx bx-stop-circle'></i> Finalizar</button><button class="btn-ghost study-icon-action" type="button" onclick="cancelStudyTimer()" title="Cancelar sessão"><i class='bx bx-x'></i></button></div>`;
}

function syncStudyTimerInterval() {
  if (studyTimerInterval) clearInterval(studyTimerInterval);
  studyTimerInterval = null;
  if (!activeStudySession()) return;
  studyTimerInterval = setInterval(() => {
    const session = activeStudySession();
    const el = document.getElementById('studyRunningTime');
    if (!session) { clearInterval(studyTimerInterval); studyTimerInterval = null; return; }
    if (el) el.textContent = studyElapsedLabel(session.startedAt);
  }, 1000);
}

function renderStudyOverview(term) {
  const target = document.getElementById('studyViewContent');
  const subjects = visibleStudySubjects(term.id);
  const subjectIds = new Set(subjects.map(subject => subject.id));
  const assessments = S.assessments.filter(item => subjectIds.has(item.subjectId));
  const sessions = S.studySessions.filter(item => subjectIds.has(item.subjectId) && item.endedAt);
  const today = localDateString(new Date());
  const weekStart = new Date();
  const day = weekStart.getDay() || 7;
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - day + 1);
  const weekly = sessions.filter(item => new Date(item.endedAt || item.date) >= weekStart).reduce((total, item) => total + Number(item.durationMinutes || 0), 0);
  const upcoming = assessments.filter(item => item.dueDate >= today && item.status !== 'Concluída').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const graded = assessments.filter(item => item.score !== null && item.score !== undefined && item.score !== '').sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const distribution = subjects.map(subject => ({ subject, minutes: sessions.filter(item => item.subjectId === subject.id).reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0) })).filter(item => item.minutes > 0).sort((a, b) => b.minutes - a.minutes);
  const totalMinutes = distribution.reduce((sum, item) => sum + item.minutes, 0);
  const next = upcoming[0];
  const programSummary = S.studyProgramFilter === 'all' ? S.studyPrograms.map(program => {
    const programSubjects = studyTermSubjects(term.id).filter(subject => subject.programId === program.id);
    const ids = new Set(programSubjects.map(subject => subject.id));
    const minutes = S.studySessions.filter(item => ids.has(item.subjectId) && item.endedAt).reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
    const pending = S.assessments.filter(item => ids.has(item.subjectId) && item.status !== 'Concluída').length;
    return { program, subjects: programSubjects.length, minutes, pending };
  }) : [];
  target.innerHTML = `
    <div class="study-metrics">
      <div class="study-metric"><i class='bx bx-book' style="color:var(--blue);background:var(--blue-dim)"></i><div><strong>${subjects.length}</strong><span>Matérias</span></div></div>
      <div class="study-metric"><i class='bx bx-time-five' style="color:var(--green);background:var(--green-dim)"></i><div><strong>${studyMinutesLabel(weekly)}</strong><span>Esta semana</span></div></div>
      <div class="study-metric"><i class='bx bx-calendar-event' style="color:var(--amber);background:var(--amber-dim)"></i><div><strong>${upcoming.length}</strong><span>Próximas avaliações</span></div></div>
      <div class="study-metric"><i class='bx bx-medal' style="color:var(--purple);background:var(--purple-dim)"></i><div><strong>${graded.length}</strong><span>Notas registradas</span></div></div>
    </div>
    ${programSummary.length ? `<div class="study-program-summary">${programSummary.map(item => `<button type="button" style="--program:${item.program.color}" onclick="setStudyProgramFilter('${item.program.id}')"><span class="study-program-summary-icon"><i class='bx ${item.program.icon || 'bx-book'}'></i></span><span><strong>${escHtml(item.program.name)}</strong><small>${item.subjects} ${item.subjects === 1 ? 'matéria' : 'matérias'} · ${studyMinutesLabel(item.minutes)} estudados · ${item.pending} pendentes</small></span><i class='bx bx-chevron-right'></i></button>`).join('')}</div>` : ''}
    ${next ? `<div class="study-next-assessment"><div><span>Próximo compromisso</span><strong>${escHtml(next.title)}</strong><small>${escHtml(studySubject(next.subjectId)?.name || 'Sem matéria')} · ${fmtDate(next.dueDate)}</small></div><button class="btn-ghost" type="button" onclick="editAssessment('${next.id}')">Ver avaliação <i class='bx bx-right-arrow-alt'></i></button></div>` : ''}
    <div class="study-overview-grid">
      <div class="panel study-panel"><div class="panel-head"><div><h3 class="panel-title">Próximas avaliações</h3><p class="panel-subtitle">Prazos que merecem sua atenção.</p></div><button class="panel-action" onclick="newAssessment()"><i class='bx bx-plus'></i> Adicionar</button></div><div class="study-list">${upcoming.slice(0, 5).map(studyAssessmentRow).join('') || studyEmpty('bx-calendar-x', 'Nenhuma avaliação próxima', 'Cadastre provas e trabalhos para acompanhar os prazos.')}</div></div>
      <div class="panel study-panel"><div class="panel-head"><div><h3 class="panel-title">Notas recentes</h3><p class="panel-subtitle">Resultados registrados no período.</p></div></div><div class="study-list">${graded.slice(0, 5).map(studyGradeRow).join('') || studyEmpty('bx-medal', 'Nenhuma nota registrada', 'Adicione a nota em uma avaliação concluída.')}</div></div>
      <div class="panel study-panel"><div class="panel-head"><div><h3 class="panel-title">Grade acadêmica</h3><p class="panel-subtitle">Horários das matérias deste período.</p></div></div><div class="study-list">${subjects.filter(subject => subject.schedule).map(subject => `<div class="study-schedule-row"><span style="background:${subject.color || STUDY_COLORS[0]}"></span><div><strong>${escHtml(subject.name)}</strong><small>${escHtml(subject.schedule)}${subject.room ? ` · ${escHtml(subject.room)}` : ''}</small></div></div>`).join('') || studyEmpty('bx-calendar', 'Grade ainda vazia', 'Adicione os horários ao cadastro das matérias.')}</div></div>
      <div class="panel study-panel"><div class="panel-head"><div><h3 class="panel-title">Tempo por matéria</h3><p class="panel-subtitle">Distribuição acumulada no período.</p></div><strong class="study-total-time">${studyMinutesLabel(totalMinutes)}</strong></div><div class="study-distribution">${distribution.map(item => `<div class="study-distribution-row"><div><span>${escHtml(item.subject.name)}</span><strong>${studyMinutesLabel(item.minutes)}</strong></div><div class="study-progress"><span style="width:${Math.max(4, Math.round(item.minutes / totalMinutes * 100))}%;background:${item.subject.color || STUDY_COLORS[0]}"></span></div></div>`).join('') || studyEmpty('bx-bar-chart-alt-2', 'Sem tempo registrado', 'Use o timer ou lance uma sessão manualmente.')}</div></div>
    </div>`;
}

function studyAssessmentRow(item) {
  const subject = studySubject(item.subjectId);
  const program = studyProgram(subject?.programId);
  return `<button class="study-list-row" type="button" onclick="editAssessment('${item.id}')"><span class="study-date-box"><strong>${item.dueDate?.slice(8, 10) || '--'}</strong><small>${item.dueDate ? new Date(`${item.dueDate}T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') : ''}</small></span><div><strong>${escHtml(item.title)}</strong><small><span class="study-dot" style="background:${subject?.color || STUDY_COLORS[0]}"></span>${escHtml(subject?.name || 'Sem matéria')} · ${escHtml(program?.shortName || item.type)}</small></div><span class="study-status status-${item.status === 'Concluída' ? 'done' : item.status === 'Entregue' ? 'sent' : 'pending'}">${escHtml(item.status)}</span></button>`;
}

function studyGradeRow(item) {
  const subject = studySubject(item.subjectId);
  const program = studyProgram(subject?.programId);
  return `<button class="study-list-row study-grade-row" type="button" onclick="editAssessment('${item.id}')"><span class="study-subject-mark" style="background:${subject?.color || STUDY_COLORS[0]}"><i class='bx bx-book'></i></span><div><strong>${escHtml(item.title)}</strong><small>${escHtml(subject?.name || 'Sem matéria')}${program ? ` · ${escHtml(program.shortName)}` : ''}</small></div><span class="study-grade"><strong>${escHtml(item.score)}</strong><small>/ ${escHtml(item.maxScore)}</small></span></button>`;
}

function renderStudySubjects(term) {
  const target = document.getElementById('studyViewContent');
  const subjects = visibleStudySubjects(term.id);
  target.innerHTML = `<div class="study-view-toolbar"><div><h2>Matérias</h2><p>${subjects.length} ${subjects.length === 1 ? 'matéria cadastrada' : 'matérias cadastradas'} em ${escHtml(term.name)}</p></div><button class="btn-primary" type="button" onclick="newSubject()"><i class='bx bx-plus'></i> Nova matéria</button></div>${subjects.length ? `<div class="study-subject-grid">${subjects.map(subject => {
    const assessments = S.assessments.filter(item => item.subjectId === subject.id);
    const minutes = S.studySessions.filter(item => item.subjectId === subject.id && item.endedAt).reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
    const program = studyProgram(subject.programId);
    return `<article class="study-subject-card" style="--subject:${subject.color || STUDY_COLORS[0]};--program:${program?.color || subject.color || STUDY_COLORS[0]}"><div class="study-subject-card-top"><span class="study-subject-icon"><i class='bx bx-book-bookmark'></i></span><div class="study-card-actions"><button onclick="editSubject('${subject.id}')" title="Editar"><i class='bx bx-edit'></i></button><button onclick="deleteSubject('${subject.id}')" title="Excluir"><i class='bx bx-trash'></i></button></div></div><div class="study-subject-labels"><span class="study-subject-code">${escHtml(subject.code || 'MATÉRIA')}</span>${program ? `<span class="study-program-badge"><i class='bx ${program.icon}'></i>${escHtml(program.shortName)}</span>` : '<span class="study-program-badge unassigned">Sem curso</span>'}</div><h3>${escHtml(subject.name)}</h3><p>${escHtml(subject.professor || 'Professor não informado')}</p><div class="study-subject-details">${subject.schedule ? `<span><i class='bx bx-time'></i>${escHtml(subject.schedule)}</span>` : ''}${subject.room ? `<span><i class='bx bx-map'></i>${escHtml(subject.room)}</span>` : ''}</div><div class="study-subject-foot"><span><strong>${assessments.length}</strong> avaliações</span><span><strong>${studyMinutesLabel(minutes)}</strong> estudados</span></div></article>`;
  }).join('')}</div>` : studyEmpty('bx-book-open', 'Nenhuma matéria neste período', 'Cadastre sua primeira matéria para começar.', `<button class="btn-primary" onclick="newSubject()"><i class='bx bx-plus'></i> Nova matéria</button>`)}`;
}

function renderStudyAssessments(term) {
  const target = document.getElementById('studyViewContent');
  const subjects = visibleStudySubjects(term.id);
  const subjectIds = new Set(subjects.map(subject => subject.id));
  let items = S.assessments.filter(item => subjectIds.has(item.subjectId));
  if (S.studySubjectFilter !== 'all') items = items.filter(item => item.subjectId === S.studySubjectFilter);
  if (S.studyAssessmentFilter !== 'all') items = items.filter(item => item.status === S.studyAssessmentFilter);
  items.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  target.innerHTML = `<div class="study-view-toolbar"><div><h2>Avaliações</h2><p>Provas, trabalhos e resultados do período.</p></div><button class="btn-primary" type="button" onclick="newAssessment()"><i class='bx bx-plus'></i> Nova avaliação</button></div><div class="study-filter-row"><select class="form-select" aria-label="Filtrar por matéria" onchange="S.studySubjectFilter=this.value;renderStudies()"><option value="all">Todas as matérias</option>${subjects.map(subject => `<option value="${subject.id}"${S.studySubjectFilter === subject.id ? ' selected' : ''}>${escHtml(subject.name)}</option>`).join('')}</select>${['all', 'Pendente', 'Entregue', 'Concluída'].map(status => `<button class="ftab${S.studyAssessmentFilter === status ? ' active' : ''}" onclick="S.studyAssessmentFilter='${status}';renderStudies()">${status === 'all' ? 'Todos' : status}</button>`).join('')}</div>${items.length ? `<div class="panel study-assessment-table"><div class="study-assessment-head"><span>Avaliação</span><span>Matéria</span><span>Prazo</span><span>Nota</span><span>Status</span><span></span></div>${items.map(item => { const subject = studySubject(item.subjectId); const program = studyProgram(subject?.programId); return `<div class="study-assessment-item"><div><span class="study-type-icon"><i class='bx bx-clipboard'></i></span><div><strong>${escHtml(item.title)}</strong><small>${escHtml(item.type)}${program ? ` · ${escHtml(program.shortName)}` : ''}</small></div></div><span><i class="study-dot" style="background:${subject?.color || STUDY_COLORS[0]}"></i>${escHtml(subject?.name || 'Sem matéria')}</span><span>${fmtDate(item.dueDate)}</span><span>${item.score !== null && item.score !== undefined && item.score !== '' ? `<strong>${escHtml(item.score)}</strong> / ${escHtml(item.maxScore)}` : '—'}</span><span class="study-status status-${item.status === 'Concluída' ? 'done' : item.status === 'Entregue' ? 'sent' : 'pending'}">${escHtml(item.status)}</span><span class="study-row-actions"><button onclick="editAssessment('${item.id}')" title="Editar"><i class='bx bx-edit'></i></button><button onclick="deleteAssessment('${item.id}')" title="Excluir"><i class='bx bx-trash'></i></button></span></div>`; }).join('')}</div>` : studyEmpty('bx-clipboard', subjects.length ? 'Nenhuma avaliação encontrada' : 'Nenhuma matéria neste curso', subjects.length ? 'Ajuste os filtros ou adicione uma nova avaliação.' : 'Cadastre uma matéria ou selecione outra graduação.')}`;
}

function renderStudySessions(term) {
  const target = document.getElementById('studyViewContent');
  const subjects = visibleStudySubjects(term.id);
  const subjectIds = new Set(subjects.map(subject => subject.id));
  let sessions = S.studySessions.filter(item => subjectIds.has(item.subjectId) && item.endedAt);
  if (S.studySubjectFilter !== 'all') sessions = sessions.filter(item => item.subjectId === S.studySubjectFilter);
  sessions.sort((a, b) => (b.endedAt || b.date || '').localeCompare(a.endedAt || a.date || ''));
  target.innerHTML = `<div class="study-view-toolbar"><div><h2>Sessões de estudo</h2><p>Registre sua dedicação e entenda para onde seu tempo está indo.</p></div><div class="study-toolbar-actions"><button class="btn-ghost" type="button" onclick="newStudySession()"><i class='bx bx-edit-alt'></i> Lançar manualmente</button>${activeStudySession() ? `<button class="btn-primary study-active-timer-btn" type="button" onclick="document.getElementById('studyTimerMount')?.scrollIntoView({behavior:'smooth',block:'center'})"><i class='bx bx-timer'></i> Timer em andamento</button>` : `<button class="btn-primary" type="button" onclick="startStudyTimer()"><i class='bx bx-play-circle'></i> Iniciar timer</button>`}</div></div><div class="study-filter-row"><select class="form-select" aria-label="Filtrar sessões por matéria" onchange="S.studySubjectFilter=this.value;renderStudies()"><option value="all">Todas as matérias</option>${subjects.map(subject => `<option value="${subject.id}"${S.studySubjectFilter === subject.id ? ' selected' : ''}>${escHtml(subject.name)}</option>`).join('')}</select></div>${sessions.length ? `<div class="study-session-list">${sessions.map(session => { const subject = studySubject(session.subjectId); const program = studyProgram(subject?.programId); return `<article class="study-session-item"><span class="study-session-icon" style="color:${subject?.color || STUDY_COLORS[0]};background:${subject?.color || STUDY_COLORS[0]}22"><i class='bx bx-time-five'></i></span><div><strong>${escHtml(session.topic || 'Sessão de estudo')}</strong><small>${escHtml(subject?.name || 'Matéria removida')}${program ? ` · ${escHtml(program.shortName)}` : ''} · ${fmtDate(session.date || session.endedAt?.slice(0, 10))}${session.source === 'timer' ? ' · timer' : ' · manual'}</small></div><strong class="study-session-duration">${studyMinutesLabel(session.durationMinutes)}</strong><span class="study-row-actions"><button onclick="editStudySession('${session.id}')" title="Editar"><i class='bx bx-edit'></i></button><button onclick="deleteStudySession('${session.id}')" title="Excluir"><i class='bx bx-trash'></i></button></span></article>`; }).join('')}</div>` : studyEmpty('bx-time-five', subjects.length ? 'Nenhuma sessão registrada' : 'Nenhuma matéria neste curso', subjects.length ? 'Inicie o timer ou faça um lançamento manual.' : 'Cadastre uma matéria ou selecione outra graduação.')}`;
}

function studyTermForm(term = {}) {
  return `<div class="form-group"><label class="form-label">Nome do período *</label><input class="form-input" id="f-study-term-name" maxlength="40" placeholder="Ex.: ${suggestedStudyTerm()}" value="${escHtml(term.name || suggestedStudyTerm())}"></div><label class="settings-toggle"><span><i class='bx bx-check-circle'></i><span><strong>Definir como período ativo</strong><small>O Hub abrirá este período por padrão.</small></span></span><input type="checkbox" id="f-study-term-active"${term.active || !S.studyTerms.some(item => item.active && !item.archived) ? ' checked' : ''}><span class="toggle-track"></span></label>`;
}

function newStudyTerm() {
  openModal('Novo período acadêmico', studyTermForm(), () => {
    const name = document.getElementById('f-study-term-name').value.trim();
    if (!name) return toast('Informe o nome do período.', 'error'), false;
    const active = document.getElementById('f-study-term-active').checked;
    if (active) S.studyTerms.forEach(item => { item.active = false; });
    const now = studyNowIso();
    const term = { id: uid(), name, active, archived: false, createdAt: now, updatedAt: now };
    S.studyTerms.push(term); S.studyTermId = term.id; saveStudyTerms(); renderStudies(); toast('Período criado!');
  });
}

function editStudyTerm(id) {
  const term = S.studyTerms.find(item => item.id === id); if (!term) return;
  openModal('Editar período', studyTermForm(term), () => {
    const name = document.getElementById('f-study-term-name').value.trim();
    if (!name) return toast('Informe o nome do período.', 'error'), false;
    const active = document.getElementById('f-study-term-active').checked;
    if (active) S.studyTerms.forEach(item => { item.active = item.id === id; });
    Object.assign(term, { name, active, archived: active ? false : term.archived, updatedAt: studyNowIso() });
    saveStudyTerms(); renderStudies(); toast('Período atualizado!');
  });
}

function studySubjectOptions(termId, selected = '') {
  const subjects = visibleStudySubjects(termId);
  const selectedSubject = selected ? studySubject(selected) : null;
  if (selectedSubject && !subjects.some(subject => subject.id === selectedSubject.id)) subjects.push(selectedSubject);
  return subjects.map(subject => { const program = studyProgram(subject.programId); return `<option value="${subject.id}"${selected === subject.id ? ' selected' : ''}>${escHtml(subject.name)}${program ? ` · ${escHtml(program.shortName)}` : ''}</option>`; }).join('');
}

function subjectForm(subject = {}) {
  const term = selectedStudyTerm();
  const selectedProgram = subject.programId || (S.studyProgramFilter !== 'all' ? S.studyProgramFilter : S.studyPrograms[0]?.id || '');
  return `<div class="form-group"><label class="form-label">Curso *</label><select class="form-select" id="f-subject-program"><option value="">Selecione o curso</option>${S.studyPrograms.map(program => `<option value="${program.id}"${selectedProgram === program.id ? ' selected' : ''}>${escHtml(program.name)}</option>`).join('')}</select></div><div class="form-row"><div class="form-group"><label class="form-label">Nome da matéria *</label><input class="form-input" id="f-subject-name" maxlength="80" placeholder="Ex.: Introdução à Administração" value="${escHtml(subject.name || '')}"></div><div class="form-group"><label class="form-label">Código</label><input class="form-input" id="f-subject-code" maxlength="20" placeholder="Ex.: ADM101" value="${escHtml(subject.code || '')}"></div></div><div class="form-row"><div class="form-group"><label class="form-label">Professor</label><input class="form-input" id="f-subject-professor" maxlength="80" value="${escHtml(subject.professor || '')}"></div><div class="form-group"><label class="form-label">Sala</label><input class="form-input" id="f-subject-room" maxlength="40" placeholder="Ex.: Bloco B · Sala 204" value="${escHtml(subject.room || '')}"></div></div><div class="form-group"><label class="form-label">Horários</label><input class="form-input" id="f-subject-schedule" maxlength="100" placeholder="Ex.: Seg e Qua · 19:00–20:40" value="${escHtml(subject.schedule || '')}"></div><div class="form-group"><label class="form-label">Cor da matéria</label><div class="study-color-picker">${STUDY_COLORS.map((color, index) => `<label><input type="radio" name="subject-color" value="${color}"${(subject.color || STUDY_COLORS[studyTermSubjects(term.id).length % STUDY_COLORS.length]) === color ? ' checked' : ''}><span style="background:${color}"></span></label>`).join('')}</div></div>`;
}

function newSubject(afterSave = null) {
  const term = selectedStudyTerm(); if (!term) return newStudyTerm();
  openModal('Nova matéria', subjectForm(), () => {
    const name = document.getElementById('f-subject-name').value.trim();
    const programId = document.getElementById('f-subject-program').value;
    if (!name || !programId) return toast('Informe o curso e o nome da matéria.', 'error'), false;
    const now = studyNowIso();
    S.subjects.push({ id: uid(), termId: term.id, programId, name, code: document.getElementById('f-subject-code').value.trim(), professor: document.getElementById('f-subject-professor').value.trim(), room: document.getElementById('f-subject-room').value.trim(), schedule: document.getElementById('f-subject-schedule').value.trim(), color: document.querySelector('input[name="subject-color"]:checked')?.value || STUDY_COLORS[0], createdAt: now, updatedAt: now });
    saveSubjects();
    if (!afterSave) S.studyView = 'subjects';
    renderStudies(); toast('Matéria criada!');
    if (typeof afterSave === 'function') setTimeout(afterSave, 0);
  });
}

function editSubject(id) {
  const subject = studySubject(id); if (!subject) return;
  openModal('Editar matéria', subjectForm(subject), () => {
    const name = document.getElementById('f-subject-name').value.trim();
    const programId = document.getElementById('f-subject-program').value;
    if (!name || !programId) return toast('Informe o curso e o nome da matéria.', 'error'), false;
    Object.assign(subject, { programId, name, code: document.getElementById('f-subject-code').value.trim(), professor: document.getElementById('f-subject-professor').value.trim(), room: document.getElementById('f-subject-room').value.trim(), schedule: document.getElementById('f-subject-schedule').value.trim(), color: document.querySelector('input[name="subject-color"]:checked')?.value || STUDY_COLORS[0], updatedAt: studyNowIso() });
    saveSubjects(); renderStudies(); toast('Matéria atualizada!');
  });
}

function deleteSubject(id) {
  const subject = studySubject(id); if (!subject) return;
  const hasRunning = activeStudySession()?.subjectId === id;
  if (hasRunning) return toast('Finalize ou cancele o timer desta matéria antes de excluí-la.', 'error');
  openConfirm(() => {
    S.subjects = S.subjects.filter(item => item.id !== id);
    S.assessments = S.assessments.filter(item => item.subjectId !== id);
    S.studySessions = S.studySessions.filter(item => item.subjectId !== id);
    saveSubjects(); saveAssessments(); saveStudySessions(); renderStudies(); toast('Matéria e registros relacionados excluídos.', 'info');
  });
}

function assessmentForm(item = {}) {
  const term = selectedStudyTerm();
  return `<div class="form-row"><div class="form-group"><label class="form-label">Título *</label><input class="form-input" id="f-assessment-title" maxlength="100" placeholder="Ex.: Prova do primeiro bimestre" value="${escHtml(item.title || '')}"></div><div class="form-group"><label class="form-label">Matéria *</label><select class="form-select" id="f-assessment-subject"><option value="">Selecione</option>${studySubjectOptions(term.id, item.subjectId)}</select></div></div><div class="form-row"><div class="form-group"><label class="form-label">Tipo</label><select class="form-select" id="f-assessment-type">${['Prova', 'Trabalho', 'Seminário', 'Atividade', 'Outro'].map(type => `<option${(item.type || 'Prova') === type ? ' selected' : ''}>${type}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">Prazo *</label><input class="form-input" id="f-assessment-date" type="date" value="${item.dueDate || localDateString(new Date())}"></div></div><div class="form-row"><div class="form-group"><label class="form-label">Status</label><select class="form-select" id="f-assessment-status">${['Pendente', 'Entregue', 'Concluída'].map(status => `<option${(item.status || 'Pendente') === status ? ' selected' : ''}>${status}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">Nota obtida</label><input class="form-input" id="f-assessment-score" type="number" min="0" step="0.01" placeholder="Ex.: 8.5" value="${item.score ?? ''}"></div><div class="form-group"><label class="form-label">Nota máxima</label><input class="form-input" id="f-assessment-max" type="number" min="0.01" step="0.01" placeholder="Ex.: 10" value="${item.maxScore ?? ''}"></div></div>`;
}

function readAssessmentForm(item, term) {
  const title = document.getElementById('f-assessment-title').value.trim();
  const subjectId = document.getElementById('f-assessment-subject').value;
  const dueDate = document.getElementById('f-assessment-date').value;
  const scoreRaw = document.getElementById('f-assessment-score').value;
  const maxRaw = document.getElementById('f-assessment-max').value;
  if (!title || !subjectId || !dueDate) return toast('Preencha título, matéria e prazo.', 'error'), false;
  if ((scoreRaw && !maxRaw) || (!scoreRaw && maxRaw)) return toast('Informe a nota obtida e a nota máxima juntas.', 'error'), false;
  const score = scoreRaw === '' ? null : Number(scoreRaw), maxScore = maxRaw === '' ? null : Number(maxRaw);
  if (score !== null && (!Number.isFinite(score) || !Number.isFinite(maxScore) || score < 0 || maxScore <= 0 || score > maxScore)) return toast('Confira os valores da nota.', 'error'), false;
  return { title, subjectId, termId: term.id, type: document.getElementById('f-assessment-type').value, dueDate, status: document.getElementById('f-assessment-status').value, score, maxScore, updatedAt: studyNowIso() };
}

function studyTermForAction(retry) {
  const term = selectedStudyTerm();
  if (!term) {
    toast('Crie um período acadêmico primeiro.', 'info');
    newStudyTerm();
    return null;
  }
  if (!visibleStudySubjects(term.id).length) {
    const program = S.studyProgramFilter === 'all' ? null : studyProgram(S.studyProgramFilter);
    toast(program ? `Cadastre uma matéria de ${program.shortName} para continuar.` : 'Cadastre uma matéria para continuar.', 'info');
    newSubject(retry);
    return null;
  }
  return term;
}

function newAssessment() {
  const term = studyTermForAction(() => newAssessment()); if (!term) return;
  openModal('Nova avaliação', assessmentForm(), () => { const values = readAssessmentForm(null, term); if (!values) return false; S.assessments.push({ id: uid(), ...values, createdAt: studyNowIso() }); saveAssessments(); S.studyView = 'assessments'; renderStudies(); toast('Avaliação criada!'); });
}
function editAssessment(id) {
  const item = S.assessments.find(entry => entry.id === id); if (!item) return;
  const term = S.studyTerms.find(entry => entry.id === item.termId) || selectedStudyTerm();
  openModal('Editar avaliação', assessmentForm(item), () => { const values = readAssessmentForm(item, term); if (!values) return false; Object.assign(item, values); saveAssessments(); renderStudies(); toast('Avaliação atualizada!'); });
}
function deleteAssessment(id) { openConfirm(() => { S.assessments = S.assessments.filter(item => item.id !== id); saveAssessments(); renderStudies(); toast('Avaliação excluída.', 'info'); }); }

function sessionForm(item = {}) {
  const term = selectedStudyTerm();
  return `<div class="form-row"><div class="form-group"><label class="form-label">Matéria *</label><select class="form-select" id="f-session-subject"><option value="">Selecione</option>${studySubjectOptions(term.id, item.subjectId)}</select></div><div class="form-group"><label class="form-label">Data *</label><input class="form-input" id="f-session-date" type="date" value="${item.date || localDateString(new Date())}"></div></div><div class="form-group"><label class="form-label">Assunto estudado</label><input class="form-input" id="f-session-topic" maxlength="120" placeholder="Ex.: Revisão dos capítulos 1 e 2" value="${escHtml(item.topic || '')}"></div><div class="form-group"><label class="form-label">Duração em minutos *</label><input class="form-input" id="f-session-duration" type="number" min="1" max="1440" step="1" placeholder="Ex.: 50" value="${item.durationMinutes || ''}"></div>`;
}
function readSessionForm() {
  const subjectId = document.getElementById('f-session-subject').value, date = document.getElementById('f-session-date').value, durationMinutes = Number(document.getElementById('f-session-duration').value);
  if (!subjectId || !date || !Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440) return toast('Informe matéria, data e uma duração válida.', 'error'), false;
  return { subjectId, date, topic: document.getElementById('f-session-topic').value.trim(), durationMinutes: Math.round(durationMinutes), updatedAt: studyNowIso() };
}
function newStudySession() {
  const term = studyTermForAction(() => newStudySession()); if (!term) return;
  openModal('Registrar sessão', sessionForm(), () => { const values = readSessionForm(); if (!values) return false; const end = new Date(`${values.date}T12:00:00`); S.studySessions.push({ id: uid(), ...values, source: 'manual', startedAt: null, endedAt: end.toISOString(), createdAt: studyNowIso() }); saveStudySessions(); renderStudies(); toast('Sessão registrada!'); });
}
function editStudySession(id) {
  const item = S.studySessions.find(entry => entry.id === id); if (!item || !item.endedAt) return;
  openModal('Editar sessão', sessionForm(item), () => { const values = readSessionForm(); if (!values) return false; Object.assign(item, values); saveStudySessions(); renderStudies(); toast('Sessão atualizada!'); });
}
function deleteStudySession(id) { openConfirm(() => { S.studySessions = S.studySessions.filter(item => item.id !== id); saveStudySessions(); renderStudies(); toast('Sessão excluída.', 'info'); }); }

function startStudyTimer() {
  if (activeStudySession()) { toast('Já existe uma sessão em andamento.', 'info'); if (S.section !== 'studies') navigateTo('studies'); return; }
  const term = studyTermForAction(() => startStudyTimer()); if (!term) return;
  openModal('Iniciar sessão de estudo', `<div class="study-timer-modal"><i class='bx bx-timer'></i><p>Escolha a matéria e, se quiser, indique o assunto desta sessão.</p></div><div class="form-group"><label class="form-label">Matéria *</label><select class="form-select" id="f-timer-subject"><option value="">Selecione</option>${studySubjectOptions(term.id)}</select></div><div class="form-group"><label class="form-label">Assunto</label><input class="form-input" id="f-timer-topic" maxlength="120" placeholder="O que você vai estudar?"></div>`, () => {
    const subjectId = document.getElementById('f-timer-subject').value; if (!subjectId) return toast('Selecione uma matéria.', 'error'), false;
    const now = studyNowIso(); S.studySessions.push({ id: uid(), subjectId, topic: document.getElementById('f-timer-topic').value.trim(), date: localDateString(new Date()), durationMinutes: 0, source: 'timer', startedAt: now, endedAt: null, createdAt: now, updatedAt: now }); saveStudySessions(); S.studyView = 'sessions'; renderStudies(); toast('Timer iniciado!');
  });
  document.getElementById('modalSave').innerHTML = `<i class='bx bx-play'></i> Iniciar`;
}

function finishStudyTimer() {
  const session = activeStudySession(); if (!session) return;
  const started = new Date(session.startedAt).getTime();
  if (!Number.isFinite(started) || started > Date.now()) return toast('O horário inicial do timer é inválido.', 'error');
  session.endedAt = studyNowIso(); session.durationMinutes = Math.max(1, Math.round((Date.now() - started) / 60000)); session.updatedAt = session.endedAt;
  saveStudySessions(); renderStudies(); toast(`Sessão de ${studyMinutesLabel(session.durationMinutes)} concluída!`);
}
function cancelStudyTimer() {
  const session = activeStudySession(); if (!session) return;
  openConfirm(() => { S.studySessions = S.studySessions.filter(item => item.id !== session.id); saveStudySessions(); renderStudies(); toast('Sessão em andamento cancelada.', 'info'); });
}

/* ===== PRIMARY BUTTON ACTIONS ===== */
function primaryAction() {
  const actions = {
    agenda:   () => newRecurringEvent(_calSelected || localDateString(new Date())),
    projects: () => newProject(),
    tasks: () => newTask(),
    habits: () => newHabit(),
    studies: () => newSubject(),
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
  const today = localDateString(new Date());
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
let _agendaMode = 'calendar';

const CAL_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CAL_DAYS   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromString(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addCalendarDays(value, amount) {
  const date = dateFromString(value);
  date.setDate(date.getDate() + amount);
  return localDateString(date);
}

function weekStartDate(date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  result.setHours(0, 0, 0, 0);
  return result;
}

function isRecurringEvent(item) {
  return item?.kind === 'event' && item?.recurrence?.frequency;
}

function eventMatchesPattern(event, dateString) {
  const recurrence = event.recurrence || {};
  const start = dateFromString(event.due);
  const date = dateFromString(dateString);
  if (!event.due || Number.isNaN(start.getTime()) || date < start) return false;
  const interval = Math.max(Number(recurrence.interval) || 1, 1);
  const diffDays = Math.floor((date - start) / 86400000);
  if (recurrence.frequency === 'daily') return diffDays % interval === 0;
  if (recurrence.frequency === 'monthly') {
    const monthDiff = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
    return monthDiff >= 0 && monthDiff % interval === 0 && date.getDate() === start.getDate();
  }
  const weekdays = Array.isArray(recurrence.weekdays) && recurrence.weekdays.length
    ? recurrence.weekdays.map(Number)
    : [start.getDay()];
  const weekDiff = Math.floor((weekStartDate(date) - weekStartDate(start)) / (7 * 86400000));
  return weekDiff >= 0 && weekDiff % interval === 0 && weekdays.includes(date.getDay());
}

function eventOccurrenceNumber(event, dateString) {
  let count = 0;
  for (let cursor = event.due; cursor && cursor <= dateString; cursor = addCalendarDays(cursor, 1)) {
    if (eventMatchesPattern(event, cursor)) count++;
  }
  return count;
}

function eventOccursOn(event, dateString) {
  if (!isRecurringEvent(event) || !eventMatchesPattern(event, dateString)) return false;
  const recurrence = event.recurrence;
  if (recurrence.end === 'date' && recurrence.until && dateString > recurrence.until) return false;
  if (recurrence.end === 'count' && Number(recurrence.count) > 0) {
    return eventOccurrenceNumber(event, dateString) <= Number(recurrence.count);
  }
  return true;
}

function agendaItemsForDate(dateString) {
  return S.tasks.filter(item => {
    if (isRecurringEvent(item)) return eventOccursOn(item, dateString);
    return item.kind !== 'event' && item.due === dateString;
  }).sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
}

function nextEventOccurrence(event, from = localDateString(new Date())) {
  if (event.recurrence?.end === 'count' && Number(event.recurrence.count) > 0) {
    let occurrence = 0;
    for (let cursor = event.due, checked = 0; cursor && checked < 36600; cursor = addCalendarDays(cursor, 1), checked++) {
      if (!eventMatchesPattern(event, cursor)) continue;
      occurrence++;
      if (cursor >= from) return cursor;
      if (occurrence >= Number(event.recurrence.count)) return '';
    }
    return '';
  }
  const start = event.due > from ? event.due : from;
  for (let cursor = start, checked = 0; checked < 3660; cursor = addCalendarDays(cursor, 1), checked++) {
    if (eventOccursOn(event, cursor)) return cursor;
    if (event.recurrence?.end === 'date' && event.recurrence.until && cursor > event.recurrence.until) break;
  }
  return '';
}

function recurrenceLabel(event) {
  const recurrence = event.recurrence || {};
  const interval = Math.max(Number(recurrence.interval) || 1, 1);
  let label = '';
  if (recurrence.frequency === 'daily') label = interval === 1 ? 'Todos os dias' : `A cada ${interval} dias`;
  else if (recurrence.frequency === 'monthly') label = interval === 1 ? `Todo mês, dia ${dateFromString(event.due).getDate()}` : `A cada ${interval} meses`;
  else {
    const names = ['dom','seg','ter','qua','qui','sex','sáb'];
    const days = (recurrence.weekdays || [dateFromString(event.due).getDay()]).map(day => names[Number(day)]).join(', ');
    label = interval === 1 ? `Toda semana: ${days}` : `A cada ${interval} semanas: ${days}`;
  }
  if (recurrence.end === 'date' && recurrence.until) label += ` · até ${fmtDate(recurrence.until)}`;
  if (recurrence.end === 'count' && recurrence.count) label += ` · ${recurrence.count} ocorrências`;
  return label;
}

function recurringEventForm(event = {}) {
  const recurrence = event.recurrence || {};
  const start = event.due || localDateString(new Date());
  const startDay = dateFromString(start).getDay();
  const weekdays = (recurrence.weekdays || [startDay]).map(Number);
  const frequency = recurrence.frequency || 'weekly';
  const end = recurrence.end || 'never';
  const weekdayNames = [['D',0],['S',1],['T',2],['Q',3],['Q',4],['S',5],['S',6]];
  return `
    <div class="form-group">
      <label class="form-label">Nome do evento *</label>
      <input class="form-input" id="f-event-title" placeholder="Ex: Reunião semanal" value="${escHtml(event.title || '')}">
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Data inicial *</label><input class="form-input" id="f-event-start" type="date" value="${start}" onchange="syncRecurrenceForm()"></div>
      <div class="form-group"><label class="form-label">Horário *</label><input class="form-input" id="f-event-time" type="time" value="${event.time || '09:00'}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Projeto</label><select class="form-select" id="f-event-project"><option value="">— Nenhum —</option>${getProjectNames().map(name => `<option${event.project===name?' selected':''}>${escHtml(name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Duração</label><select class="form-select" id="f-event-duration">${[15,30,45,60,90,120].map(value => `<option value="${value}"${Number(event.duration || 60)===value?' selected':''}>${value < 60 ? `${value} min` : `${value/60}h`}</option>`).join('')}</select></div>
    </div>
    <div class="recurrence-box">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Repetir</label><select class="form-select" id="f-event-frequency" onchange="syncRecurrenceForm()"><option value="daily"${frequency==='daily'?' selected':''}>Diariamente</option><option value="weekly"${frequency==='weekly'?' selected':''}>Semanalmente</option><option value="monthly"${frequency==='monthly'?' selected':''}>Mensalmente</option></select></div>
        <div class="form-group"><label class="form-label">Intervalo</label><input class="form-input" id="f-event-interval" type="number" min="1" max="99" value="${Math.max(Number(recurrence.interval)||1,1)}"></div>
      </div>
      <div class="form-group" id="recurrenceWeekdays"${frequency!=='weekly'?' style="display:none"':''}>
        <label class="form-label">Dias da semana</label><div class="weekday-picker">${weekdayNames.map(([name, value]) => `<label class="weekday-option"><input type="checkbox" name="event-weekday" value="${value}"${weekdays.includes(value)?' checked':''}><span>${name}</span></label>`).join('')}</div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Término</label><select class="form-select" id="f-event-end" onchange="syncRecurrenceForm()"><option value="never"${end==='never'?' selected':''}>Nunca</option><option value="date"${end==='date'?' selected':''}>Em uma data</option><option value="count"${end==='count'?' selected':''}>Após ocorrências</option></select></div>
        <div class="form-group" id="recurrenceEndValue"${end==='never'?' style="display:none"':''}><label class="form-label" id="recurrenceEndLabel">${end==='count'?'Quantidade':'Última data'}</label><input class="form-input" id="f-event-until" type="${end==='count'?'number':'date'}" min="${end==='count'?'1':start}" value="${end==='count'?(recurrence.count||10):(recurrence.until||start)}"></div>
      </div>
    </div>`;
}

function syncRecurrenceForm() {
  const frequency = document.getElementById('f-event-frequency')?.value;
  const end = document.getElementById('f-event-end')?.value;
  const weekdays = document.getElementById('recurrenceWeekdays');
  if (weekdays) weekdays.style.display = frequency === 'weekly' ? '' : 'none';
  const wrap = document.getElementById('recurrenceEndValue');
  const input = document.getElementById('f-event-until');
  const label = document.getElementById('recurrenceEndLabel');
  if (!wrap || !input || !label) return;
  wrap.style.display = end === 'never' ? 'none' : '';
  label.textContent = end === 'count' ? 'Quantidade' : 'Última data';
  input.type = end === 'count' ? 'number' : 'date';
  input.min = end === 'count' ? '1' : (document.getElementById('f-event-start')?.value || '');
  if (end === 'count' && !Number(input.value)) input.value = 10;
  if (end === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(input.value)) input.value = document.getElementById('f-event-start')?.value || localDateString(new Date());
}

function readRecurringEventForm(existing = {}) {
  const title = document.getElementById('f-event-title').value.trim();
  const due = document.getElementById('f-event-start').value;
  const time = document.getElementById('f-event-time').value;
  const frequency = document.getElementById('f-event-frequency').value;
  const end = document.getElementById('f-event-end').value;
  const weekdays = [...document.querySelectorAll('input[name="event-weekday"]:checked')].map(input => Number(input.value));
  if (!title || !due || !time) { toast('Preencha nome, data e horário.', 'error'); return null; }
  if (frequency === 'weekly' && !weekdays.length) { toast('Selecione ao menos um dia da semana.', 'error'); return null; }
  const untilValue = document.getElementById('f-event-until').value;
  if (end === 'date' && (!untilValue || untilValue < due)) { toast('A data final deve ser posterior à inicial.', 'error'); return null; }
  return {
    ...existing, kind: 'event', title, due, time,
    duration: Number(document.getElementById('f-event-duration').value) || 60,
    project: document.getElementById('f-event-project').value,
    priority: existing.priority || 'Média', col: 'calendar',
    recurrence: {
      frequency,
      interval: Math.max(Number(document.getElementById('f-event-interval').value) || 1, 1),
      weekdays: frequency === 'weekly' ? weekdays : [], end,
      until: end === 'date' ? untilValue : '',
      count: end === 'count' ? Math.max(Number(untilValue) || 1, 1) : null
    }
  };
}

function newRecurringEvent(startDate = localDateString(new Date())) {
  openModal('Novo Evento Recorrente', recurringEventForm({ due: startDate }), () => {
    const event = readRecurringEventForm({ id: uid(), owner_id: currentUserId, owner_name: currentUserName });
    if (!event) return false;
    S.tasks.unshift(event);
    saveTasks(); renderAgenda(); renderDashboard(); toast('Evento recorrente criado!');
  });
}

function editRecurringEvent(id) {
  const event = S.tasks.find(item => item.id === id && isRecurringEvent(item));
  if (!event) return;
  openModal('Editar Série Recorrente', recurringEventForm(event), () => {
    const updated = readRecurringEventForm(event);
    if (!updated) return false;
    Object.assign(event, updated);
    saveTasks(); renderAgenda(); toast('Série recorrente atualizada!');
  });
}

function deleteRecurringEvent(id) {
  openConfirm(() => {
    S.tasks = S.tasks.filter(item => item.id !== id);
    saveTasks(); renderAgenda(); toast('Série recorrente excluída.', 'info');
  });
}

function setAgendaMode(mode) {
  _agendaMode = mode;
  renderAgenda();
}

function renderRecurringEvents() {
  const events = S.tasks.filter(isRecurringEvent).sort((a, b) => `${a.time || ''}${a.title}`.localeCompare(`${b.time || ''}${b.title}`));
  if (!events.length) return `<div class="empty-state recurring-empty"><div class="empty-icon"><i class='bx bx-repeat'></i></div><div class="empty-title">Nenhum evento recorrente</div><div class="empty-sub">Cadastre reuniões, compromissos e rotinas que se repetem.</div><button class="btn-primary" onclick="newRecurringEvent()"><i class='bx bx-plus'></i> Criar primeiro evento</button></div>`;
  return `<div class="recurring-list">${events.map(event => {
    const next = nextEventOccurrence(event);
    return `<article class="recurring-card"><div class="recurring-icon"><i class='bx bx-repeat'></i></div><div class="recurring-content"><div class="recurring-title-row"><h3>${escHtml(event.title)}</h3><span class="recurring-time">${escHtml(event.time || '—')}</span></div><p>${escHtml(recurrenceLabel(event))}</p><div class="recurring-meta">${event.project ? `<span class="focus-proj">${escHtml(event.project)}</span>` : ''}<span><i class='bx bx-time-five'></i> ${event.duration || 60} min</span><span><i class='bx bx-calendar-check'></i> ${next ? `Próxima: ${fmtDate(next)}` : 'Série encerrada'}</span></div></div><div class="recurring-actions"><button class="btn-icon green" title="Editar série" onclick="editRecurringEvent('${event.id}')"><i class='bx bx-edit-alt'></i></button><button class="btn-icon danger" title="Excluir série" onclick="deleteRecurringEvent('${event.id}')"><i class='bx bx-trash'></i></button></div></article>`;
  }).join('')}</div>`;
}

function renderAgenda() {
  const today = localDateString(new Date());
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
    const dayTasks = agendaItemsForDate(ds).filter(t => t.col !== 'done' || isRecurringEvent(t));
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
    const selTasks = agendaItemsForDate(sel).filter(t => t.col !== 'done' || isRecurringEvent(t));
    const doneTasks = agendaItemsForDate(sel).filter(t => t.col === 'done' && !isRecurringEvent(t));

    const taskRows = selTasks.length
      ? selTasks.map(t => `
          <div class="cal-task-item" onclick="${isRecurringEvent(t) ? `editRecurringEvent('${t.id}')` : `editTask('${t.id}')`}">
            <span class="prio prio-${t.priority==='Alta'?'high':t.priority==='Média'?'medium':'low'}">${t.priority}</span>
            <span class="cal-task-title">${escHtml(t.title)}</span>
            ${isRecurringEvent(t) ? `<span class="event-time"><i class='bx bx-time-five'></i>${escHtml(t.time || '')}</span><span class="recurring-badge"><i class='bx bx-repeat'></i> Recorrente</span>` : ''}
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
    <div class="agenda-toolbar">
      <div class="agenda-tabs">
        <button class="agenda-tab${_agendaMode==='calendar'?' active':''}" onclick="setAgendaMode('calendar')"><i class='bx bx-calendar'></i> Calendário</button>
        <button class="agenda-tab${_agendaMode==='recurring'?' active':''}" onclick="setAgendaMode('recurring')"><i class='bx bx-repeat'></i> Recorrentes <span>${S.tasks.filter(isRecurringEvent).length}</span></button>
      </div>
      <button class="btn-primary" onclick="newRecurringEvent(_calSelected || localDateString(new Date()))"><i class='bx bx-plus'></i> Evento recorrente</button>
    </div>
    ${_agendaMode === 'recurring' ? renderRecurringEvents() : `
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
    ${dayPanel}`}`;
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
  _calSelected = localDateString(now);
  renderAgenda();
}

/* ===== NOTIFICATIONS ===== */
function buildNotifications() {
  const today = new Date().toISOString().slice(0, 10);
  const notifs = [];
  const preferences = appSettings.notifications;
  if (!preferences.enabled) return notifs;

  const overdue = S.tasks.filter(t => t.kind !== 'event' && t.col !== 'done' && t.due && t.due < today);
  if (preferences.overdueTasks && overdue.length) notifs.push({
    icon: 'bx-error-circle', color: 'red',
    title: `${overdue.length} tarefa${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}`,
    desc: overdue.slice(0, 2).map(t => t.title).join(', ') + (overdue.length > 2 ? ` +${overdue.length - 2}` : ''),
    section: 'tasks'
  });

  const dueToday = S.tasks.filter(t => t.kind !== 'event' && t.col !== 'done' && t.due === today);
  if (preferences.todayTasks && dueToday.length) notifs.push({
    icon: 'bx-calendar-check', color: 'amber',
    title: `${dueToday.length} tarefa${dueToday.length > 1 ? 's' : ''} para hoje`,
    desc: dueToday.slice(0, 2).map(t => t.title).join(', ') + (dueToday.length > 2 ? ` +${dueToday.length - 2}` : ''),
    section: 'tasks'
  });

  const pendingHabits = S.habits.filter(h => !h.completions.includes(today));
  if (preferences.pendingHabits && pendingHabits.length) notifs.push({
    icon: 'bx-calendar-x', color: 'blue',
    title: `${pendingHabits.length} hábito${pendingHabits.length > 1 ? 's' : ''} pendente${pendingHabits.length > 1 ? 's' : ''} hoje`,
    desc: pendingHabits.slice(0, 2).map(h => h.name).join(', ') + (pendingHabits.length > 2 ? ` +${pendingHabits.length - 2}` : ''),
    section: 'habits'
  });

  const atRisk = S.goals.filter(g => g.status === 'Em risco');
  if (preferences.atRiskGoals && atRisk.length) notifs.push({
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

  if (!appSettings.notifications.enabled) {
    list.innerHTML = `<div class="notif-empty"><i class='bx bx-bell-off'></i><p>Notificações desativadas</p><button class="panel-action" type="button" onclick="closeNotifPanel();openSettings('notifications')">Configurar alertas</button></div>`;
    return;
  }

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
      closeMobileNavigation();
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
    if (isMobileLayout()) openMobileNavigation();
    else document.getElementById('sidebar').classList.toggle('collapsed');
  });
  document.getElementById('mobileMoreBtn')?.addEventListener('click', openMobileNavigation);
  document.getElementById('mobileNavBackdrop')?.addEventListener('click', closeMobileNavigation);
  document.getElementById('mobileSearchBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleMobileSearch();
  });
  window.addEventListener('resize', () => {
    if (!isMobileLayout()) { closeMobileNavigation(); toggleMobileSearch(false); }
  });

  // Primary action button
  document.getElementById('primaryBtn').addEventListener('click', primaryAction);
  document.getElementById('captureBtn').addEventListener('click', () => openInboxCapture());

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
    if (e.key === 'Escape') { closeModal(); closeConfirm(); closeMobileNavigation(); toggleMobileSearch(false); }
    const isTyping = e.target?.matches?.('input, textarea, select, [contenteditable="true"]');
    const hasOverlayOpen = document.getElementById('modalOverlay')?.classList.contains('open') ||
      document.getElementById('confirmOverlay')?.classList.contains('open');
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k' && !hasOverlayOpen) {
      e.preventDefault();
      openCommandCenter();
      return;
    }
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

  // Task list filters
  document.querySelectorAll('.task-filter').forEach(btn => {
    btn.addEventListener('click', () => setTaskFilter(btn.dataset.filter));
  });

  // Global search
  document.getElementById('globalSearch').addEventListener('input', globalSearchHandler);
  document.getElementById('globalSearch').addEventListener('focus', globalSearchHandler);
  document.getElementById('globalSearch').addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.target.value = '';
      globalSearchClose();
      if (S.section === 'tasks') renderTasks();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const results = [...document.querySelectorAll('#searchResults .search-result-item')];
      if (!results.length) return;
      e.preventDefault();
      const current = results.findIndex(item => item.classList.contains('command-active'));
      const next = e.key === 'ArrowDown' ? (current + 1) % results.length : (current <= 0 ? results.length - 1 : current - 1);
      results.forEach(item => item.classList.remove('command-active'));
      results[next].classList.add('command-active');
      results[next].scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') {
      const active = document.querySelector('#searchResults .search-result-item.command-active');
      if (active) { e.preventDefault(); active.click(); }
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
  loadSettings();
  loadInsightState();
  await loadProfiles();
  const existingData = await loadAll();
  ensureStudyPrograms();
  seedIfEmpty(existingData);
  seedV2(existingData);
  seedNotes(existingData);
  bindEvents();
  initSettings();
  initBackup();
  initJarvis();
  initInsights();
  initNotes();
  if (!projectRhythmInterval) {
    projectRhythmInterval = setInterval(() => {
      if (S.section === 'dashboard') renderProjectRhythm();
    }, 1000);
  }
  if (!insightInterval) insightInterval = setInterval(() => runAutomationCycle(), 15 * 60 * 1000);
  navigateTo('dashboard');
  setTimeout(() => runAutomationCycle(), 3600);
  setTimeout(() => {
    const loader = document.getElementById('loaderScreen');
    if (loader) { loader.classList.add('out'); setTimeout(() => loader.remove(), 580); }
  }, 3000);
}

/* ====================================================
   BUSCA GLOBAL
   ==================================================== */

const COMMAND_CENTER_ACTIONS = [
  { id: 'capture', title: 'Capturar na caixa de entrada', sub: 'Registrar qualquer coisa sem interromper o fluxo', icon: 'bx-edit-alt', keywords: 'capturar inbox entrada lembrar' },
  { id: 'plan-day', title: 'Planejar meu dia', sub: 'Definir intenção e três prioridades', icon: 'bx-sun', keywords: 'planejar hoje prioridades foco' },
  { id: 'jarvis-insights', title: 'Ver recomendações do Jarvis', sub: 'Prioridades, projetos parados e sinais do workspace', icon: 'bx-bot', keywords: 'jarvis insights recomendacoes projetos parados prioridades' },
  { id: 'customize-dashboard', title: 'Personalizar Dashboard', sub: 'Reordenar ou ocultar blocos', icon: 'bx-slider-alt', keywords: 'dashboard personalizar widgets organizar' },
  { id: 'new-task', title: 'Criar nova tarefa', sub: 'Adicionar uma tarefa completa', icon: 'bx-check-square', keywords: 'tarefa criar adicionar' },
  { id: 'new-note', title: 'Criar nota rápida', sub: 'Capturar diretamente como nota', icon: 'bx-note', keywords: 'nota criar escrever' },
  { id: 'new-idea', title: 'Registrar uma ideia', sub: 'Capturar diretamente como ideia', icon: 'bx-bulb', keywords: 'ideia criar registrar' },
  { id: 'new-transaction', title: 'Registrar lançamento financeiro', sub: 'Adicionar uma receita ou despesa', icon: 'bx-dollar-circle', keywords: 'financeiro gasto despesa receita transacao' },
  { id: 'new-subject', title: 'Criar nova matéria', sub: 'Adicionar uma matéria ao período acadêmico', icon: 'bx-book-open', keywords: 'estudos materia faculdade disciplina criar' },
  { id: 'go-settings', title: 'Abrir Configurações', sub: 'Gerenciar perfil, aparência, alertas, Jarvis e dados', icon: 'bx-cog', keywords: 'configuracoes preferencias perfil aparencia notificacoes backup jarvis' },
  { id: 'go-tasks', title: 'Ir para Tarefas', sub: 'Abrir sua lista de tarefas', icon: 'bx-list-check', keywords: 'navegar tarefas lista' },
  { id: 'go-agenda', title: 'Ir para Agenda', sub: 'Abrir calendário e recorrências', icon: 'bx-calendar', keywords: 'navegar agenda calendario' },
  { id: 'go-studies', title: 'Ir para Estudos', sub: 'Abrir a Central Acadêmica', icon: 'bx-book-reader', keywords: 'navegar estudos faculdade materias avaliacoes sessoes' }
];

function openCommandCenter() {
  if (isMobileLayout()) toggleMobileSearch(true);
  const input = document.getElementById('globalSearch');
  input.focus();
  input.select();
  globalSearchHandler();
}

function runCommand(command) {
  document.getElementById('globalSearch').value = '';
  globalSearchClose();
  const actions = {
    capture: () => openInboxCapture(),
    'plan-day': () => openDailyPlanner(),
    'jarvis-insights': () => { navigateTo('dashboard'); document.getElementById('jarvisInsightsList')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
    'customize-dashboard': () => { navigateTo('dashboard'); openDashboardCustomizer(); },
    'new-task': () => newTask(),
    'new-note': () => openInboxCapture('note'),
    'new-idea': () => openInboxCapture('idea'),
    'new-transaction': () => newTransaction(),
    'new-subject': () => { navigateTo('studies'); newSubject(); },
    'go-settings': () => openSettings('profile'),
    'go-tasks': () => navigateTo('tasks'),
    'go-agenda': () => navigateTo('agenda'),
    'go-studies': () => navigateTo('studies')
  };
  actions[command]?.();
}

function globalSearchClose() {
  const panel = document.getElementById('searchResults');
  if (panel) panel.classList.remove('open');
}

function globalSearchHandler() {
  const q     = (document.getElementById('globalSearch').value || '').trim().toLowerCase();
  const panel = document.getElementById('searchResults');
  if (!panel) return;

  if (S.section === 'tasks') renderTasks();
  const groups = [];

  const commands = COMMAND_CENTER_ACTIONS.filter(command => !q || `${command.title} ${command.sub} ${command.keywords}`.toLowerCase().includes(q)).slice(0, q ? 4 : 6);
  if (commands.length) groups.push({ label: q ? 'Comandos' : 'Ações rápidas', icon: 'bx-command', bg: '--accent-dim', color: '--accent', items: commands.map(command => ({ ...command, command: command.id })) });

  if (q.length >= 2) {
    const tasks = S.tasks.filter(t => t.kind !== 'event' && (
      t.title.toLowerCase().includes(q) || (t.project||'').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    )).slice(0, 4);
    if (tasks.length) groups.push({ label: 'Tarefas', icon: 'bx-check-square', bg: '--blue-dim', color: '--blue', section: 'tasks', items: tasks.map(t => ({ title: t.title, sub: t.project || 'Tarefa' })) });

    const inboxItems = S.inbox.filter(item => item.text.toLowerCase().includes(q)).slice(0, 3);
    if (inboxItems.length) groups.push({ label: 'Caixa de entrada', icon: 'bx-inbox', bg: '--accent-dim', color: '--accent', section: 'dashboard', items: inboxItems.map(item => ({ title: captureTitle(item.text), sub: item.project || 'Não organizado' })) });

    const recurringEvents = S.tasks.filter(event => isRecurringEvent(event) && (
      event.title.toLowerCase().includes(q) || (event.project || '').toLowerCase().includes(q)
    )).slice(0, 4);
    if (recurringEvents.length) groups.push({ label: 'Eventos recorrentes', icon: 'bx-repeat', bg: '--purple-dim', color: '--purple', section: 'agenda', items: recurringEvents.map(event => ({ title: event.title, sub: `${event.time || ''} · ${recurrenceLabel(event)}` })) });

    const projects = S.projects.filter(p => p.name.toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q)).slice(0, 3);
    if (projects.length) groups.push({ label: 'Projetos', icon: 'bx-folder-open', bg: '--amber-dim', color: '--amber', section: 'projects', items: projects.map(p => ({ title: p.name, sub: p.status })) });

    const ideas = S.ideas.filter(i => i.name.toLowerCase().includes(q) || (i.problem||'').toLowerCase().includes(q)).slice(0, 3);
    if (ideas.length) groups.push({ label: 'Ideias', icon: 'bx-bulb', bg: '--purple-dim', color: '--purple', section: 'ideas', items: ideas.map(i => ({ title: i.name, sub: i.status })) });

    const notes = S.notes.filter(n => n.type === 'note' && (n.name.toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q))).slice(0, 5);
    if (notes.length) groups.push({ label: 'Notas', icon: 'bx-notepad', bg: '--green-dim', color: '--green', section: 'notes', items: notes.map(n => {
      const folder = n.parentId ? S.notes.find(f => f.id === n.parentId) : null;
      return { title: n.name, sub: folder ? folder.name : 'Notas', noteId: n.id };
    })});

    const contacts = S.contacts.filter(c => c.name.toLowerCase().includes(q) || (c.company||'').toLowerCase().includes(q)).slice(0, 3);
    if (contacts.length) groups.push({ label: 'CRM', icon: 'bx-user-circle', bg: '--blue-dim', color: '--blue', section: 'crm', items: contacts.map(c => ({ title: c.name, sub: c.company || 'Contato' })) });

    const subjects = S.subjects.filter(subject => {
      const program = studyProgram(subject.programId);
      return `${subject.name} ${subject.code || ''} ${subject.professor || ''} ${program?.name || ''} ${program?.shortName || ''}`.toLowerCase().includes(q);
    }).slice(0, 4);
    const assessments = S.assessments.filter(item => `${item.title} ${item.type || ''}`.toLowerCase().includes(q)).slice(0, 4);
    if (subjects.length || assessments.length) groups.push({ label: 'Estudos', icon: 'bx-book-open', bg: '--purple-dim', color: '--purple', section: 'studies', items: [
      ...subjects.map(subject => ({ title: subject.name, sub: `${studyProgram(subject.programId)?.shortName || 'Sem curso'} · ${subject.code || subject.professor || 'Matéria'}` })),
      ...assessments.map(item => ({ title: item.title, sub: `${studySubject(item.subjectId)?.name || 'Avaliação'} · ${fmtDate(item.dueDate)}` }))
    ].slice(0, 5) });
  }

  if (!groups.length) {
    panel.innerHTML = `<div class="search-empty"><i class='bx bx-search-alt'></i>Nenhum resultado para "<strong>${escHtml(q)}</strong>"</div>`;
    panel.classList.add('open');
    return;
  }

  panel.innerHTML = groups.map((g, gi) => `
    ${gi > 0 ? '<hr class="search-divider">' : ''}
    <div class="search-group-label">${g.label}</div>
    ${g.items.map(item => `
      <div class="search-result-item" data-section="${g.section || ''}" data-note-id="${item.noteId || ''}" data-command="${item.command || ''}">
        <div class="search-result-icon" style="background:var(${g.bg});color:var(${g.color})">
          <i class='bx ${item.icon || g.icon}'></i>
        </div>
        <div class="search-result-text">
          <div class="search-result-title">${escHtml(item.title)}</div>
          <div class="search-result-sub">${escHtml(item.sub)}</div>
        </div>
      </div>`).join('')}`).join('');

  panel.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const { section, noteId, command } = el.dataset;
      if (command) { runCommand(command); return; }
      document.getElementById('globalSearch').value = '';
      navigateTo(section);
      if (section === 'notes' && noteId) setTimeout(() => notesOpenNote(noteId), 60);
      globalSearchClose();
    });
  });

  panel.querySelector('.search-result-item')?.classList.add('command-active');

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
      description: 'Lista tarefas com filtro opcional por status.',
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
      description: 'Cria uma nova tarefa na lista.',
      parameters: {
        type: 'object',
        properties: {
          title:    { type: 'string' },
          project:  { type: 'string' },
          priority: { type: 'string', enum: ['Alta','Média','Baixa'] },
          due:      { type: 'string', description: 'YYYY-MM-DD (opcional)' },
          col:      { type: 'string', enum: ['backlog','today','inprogress','done'] },
          description: { type: 'string' },
          estimated_minutes: { type: 'number' },
          blocked: { type: 'boolean' },
          recurrence: { type: 'string', enum: ['none','daily','weekly','monthly'] }
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
      name: 'list_recurring_events',
      description: 'Lista todas as séries de eventos recorrentes da agenda, incluindo regra, horário e próxima ocorrência.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_recurring_event',
      description: 'Cria um evento recorrente na agenda. Para reunião toda segunda, use frequency weekly e weekdays [1].',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' }, start_date: { type: 'string', description: 'YYYY-MM-DD' }, time: { type: 'string', description: 'HH:MM' },
          duration: { type: 'number', description: 'Duração em minutos' }, project: { type: 'string' },
          frequency: { type: 'string', enum: ['daily','weekly','monthly'] }, interval: { type: 'number', minimum: 1 },
          weekdays: { type: 'array', items: { type: 'number', minimum: 0, maximum: 6 }, description: '0=domingo, 1=segunda, ... 6=sábado' },
          end_type: { type: 'string', enum: ['never','date','count'] }, until: { type: 'string', description: 'YYYY-MM-DD' }, count: { type: 'number', minimum: 1 }
        },
        required: ['title','start_date','time','frequency']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_recurring_event',
      description: 'Atualiza uma série recorrente inteira pelo ID.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' }, title: { type: 'string' }, start_date: { type: 'string' }, time: { type: 'string' }, duration: { type: 'number' }, project: { type: 'string' },
          frequency: { type: 'string', enum: ['daily','weekly','monthly'] }, interval: { type: 'number', minimum: 1 }, weekdays: { type: 'array', items: { type: 'number' } },
          end_type: { type: 'string', enum: ['never','date','count'] }, until: { type: 'string' }, count: { type: 'number', minimum: 1 }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_recurring_event',
      description: 'Exclui uma série inteira de eventos recorrentes pelo ID.',
      parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
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
            enum: ['dashboard','jarvis','projects','tasks','habits','agenda','ideas','goals','crm','financial','review','prompts','notes','settings']
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
          date:    { type: 'string', description: 'YYYY-MM-DD, padrão hoje' },
          recurring: { type: 'boolean', description: 'Se true, cria uma série recorrente' },
          frequency: { type: 'string', enum: ['weekly','monthly','yearly'] },
          interval: { type: 'number', minimum: 1 },
          end_type: { type: 'string', enum: ['never','date'] },
          until: { type: 'string', description: 'YYYY-MM-DD quando end_type=date' }
        },
        required: ['type','desc','value']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_transactions',
      description: 'Lista lançamentos financeiros únicos e séries recorrentes.',
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
      name: 'update_transaction',
      description: 'Atualiza um lançamento financeiro ou uma série recorrente pelo ID.',
      parameters: { type: 'object', properties: { id: { type: 'string' }, type: { type: 'string', enum: ['Receita','Despesa'] }, desc: { type: 'string' }, value: { type: 'number' }, project: { type: 'string' }, date: { type: 'string' }, recurring: { type: 'boolean' }, frequency: { type: 'string', enum: ['weekly','monthly','yearly'] }, interval: { type: 'number', minimum: 1 }, end_type: { type: 'string', enum: ['never','date'] }, until: { type: 'string' } }, required: ['id'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_transaction',
      description: 'Exclui um lançamento financeiro ou uma série recorrente pelo ID.',
      parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_financial_forecast',
      description: 'Calcula entradas, saídas e saldo projetado mês a mês, considerando recorrências.',
      parameters: { type: 'object', properties: { months: { type: 'number', minimum: 1, maximum: 24 } }, required: [] }
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
  const today = localDateString(new Date());

  switch (name) {
    case 'get_summary': {
      const financialStart = S.transactions.map(item => item.date).filter(Boolean).sort()[0] || today;
      const financial = financialTotals(financialEntriesBetween(financialStart, today));
      return {
        tasks: {
          backlog:    S.tasks.filter(t => t.kind !== 'event' && t.col === 'backlog').length,
          today:      S.tasks.filter(t => t.kind !== 'event' && t.col === 'today').length,
          inprogress: S.tasks.filter(t => t.kind !== 'event' && t.col === 'inprogress').length,
          done:       S.tasks.filter(t => t.kind !== 'event' && t.col === 'done').length
        },
        recurringEvents: { total: S.tasks.filter(isRecurringEvent).length },
        projects: {
          total: S.projects.length,
          byStatus: S.projects.reduce((a,p) => { a[p.status] = (a[p.status]||0)+1; return a; }, {})
        },
        habits: { total: S.habits.length, completedToday: S.habits.filter(h => (h.completions||[]).includes(today)).length },
        goals:  { total: S.goals.length },
        financial: { ...financial, recurring: S.transactions.filter(isRecurringTransaction).length },
        ideas:    { total: S.ideas.length },
        contacts: { total: S.contacts.length }
      };
    }

    case 'list_tasks': {
      const col = args.col || 'all';
      const tasks = S.tasks.filter(t => t.kind !== 'event');
      const list = col === 'all' ? tasks : tasks.filter(t => t.col === col);
      return list.map(t => ({ id: t.id, title: t.title, project: t.project, priority: t.priority, due: t.due, col: t.col }));
    }

    case 'create_task': {
      const now = new Date().toISOString();
      const t = {
        id: uid(), title: args.title, description: args.description || '', project: args.project || '',
        priority: args.priority || 'Média', due: args.due || '', col: args.col || 'backlog',
        estimatedMinutes: Math.max(Number(args.estimated_minutes) || 0, 0), blocked: Boolean(args.blocked),
        recurrence: args.recurrence || 'none', subtasks: [], createdAt: now, updatedAt: now, owner_id: currentUserId, owner_name: currentUserName
      };
      S.tasks.push(t);
      saveTasks();
      renderTasks();
      renderDashboard();
      return { success: true, task: t };
    }

    case 'update_task': {
      const i = S.tasks.findIndex(t => t.id === args.id);
      if (i === -1) return { success: false, error: 'Tarefa não encontrada' };
      ['title','col','priority','due','project'].forEach(f => { if (args[f] !== undefined) S.tasks[i][f] = args[f]; });
      S.tasks[i].updatedAt = new Date().toISOString();
      saveTasks();
      renderTasks();
      renderDashboard();
      return { success: true, task: S.tasks[i] };
    }

    case 'delete_task': {
      const before = S.tasks.length;
      S.tasks = S.tasks.filter(t => t.id !== args.id);
      saveTasks();
      renderTasks();
      renderDashboard();
      return { success: S.tasks.length < before };
    }

    case 'list_recurring_events':
      return S.tasks.filter(isRecurringEvent).map(event => ({
        id: event.id, title: event.title, start_date: event.due, time: event.time,
        duration: event.duration, project: event.project, recurrence: event.recurrence,
        next_occurrence: nextEventOccurrence(event)
      }));

    case 'create_recurring_event': {
      if (!args.title || !args.start_date || !args.time || !args.frequency) return { success: false, error: 'title, start_date, time e frequency são obrigatórios' };
      const startDay = dateFromString(args.start_date).getDay();
      const event = {
        id: uid(), kind: 'event', title: args.title, due: args.start_date, time: args.time,
        duration: Math.max(Number(args.duration) || 60, 1), project: args.project || '', priority: 'Média', col: 'calendar',
        owner_id: currentUserId, owner_name: currentUserName,
        recurrence: {
          frequency: args.frequency, interval: Math.max(Number(args.interval) || 1, 1),
          weekdays: args.frequency === 'weekly' ? (args.weekdays?.length ? args.weekdays.map(Number) : [startDay]) : [],
          end: args.end_type || 'never', until: args.end_type === 'date' ? (args.until || '') : '',
          count: args.end_type === 'count' ? Math.max(Number(args.count) || 1, 1) : null
        }
      };
      S.tasks.unshift(event); saveTasks(); renderAgenda();
      return { success: true, event, next_occurrence: nextEventOccurrence(event) };
    }

    case 'update_recurring_event': {
      const event = S.tasks.find(item => item.id === args.id && isRecurringEvent(item));
      if (!event) return { success: false, error: 'Evento recorrente não encontrado' };
      if (args.title !== undefined) event.title = args.title;
      if (args.start_date !== undefined) event.due = args.start_date;
      if (args.time !== undefined) event.time = args.time;
      if (args.duration !== undefined) event.duration = Math.max(Number(args.duration) || 1, 1);
      if (args.project !== undefined) event.project = args.project;
      const recurrence = event.recurrence;
      if (args.frequency !== undefined) recurrence.frequency = args.frequency;
      if (args.interval !== undefined) recurrence.interval = Math.max(Number(args.interval) || 1, 1);
      if (args.weekdays !== undefined) recurrence.weekdays = args.weekdays.map(Number);
      if (args.end_type !== undefined) recurrence.end = args.end_type;
      if (args.until !== undefined) recurrence.until = args.until;
      if (args.count !== undefined) recurrence.count = Math.max(Number(args.count) || 1, 1);
      saveTasks(); renderAgenda();
      return { success: true, event, next_occurrence: nextEventOccurrence(event) };
    }

    case 'delete_recurring_event': {
      const before = S.tasks.length;
      S.tasks = S.tasks.filter(item => !(item.id === args.id && isRecurringEvent(item)));
      saveTasks(); renderAgenda();
      return { success: S.tasks.length < before };
    }

    case 'list_projects':
      return S.projects.map(p => ({ id: p.id, name: p.name, desc: p.desc, status: p.status, priority: p.priority, progress: p.progress }));

    case 'create_project': {
      const now = new Date().toISOString();
      const p = { id: uid(), name: args.name, desc: args.desc||'', status: args.status||'Ideia', priority: args.priority||'Média', progress: args.progress||0, createdAt: now, updatedAt: now };
      S.projects.push(p);
      saveProjects();
      renderProjects(S.projectFilter);
      renderDashboard();
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
      if (!args.type || !args.desc || !Number(args.value) || Number(args.value) <= 0) return { success: false, error: 'type, desc e value positivo são obrigatórios' };
      const tx = { id: uid(), type: args.type, desc: args.desc, value: Number(args.value), project: args.project||'', date: args.date||today, owner_id: currentUserId, owner_name: currentUserName };
      if (args.recurring) {
        const recurrenceError = validateFinancialRecurrenceArgs(args, tx.date);
        if (recurrenceError) return { success: false, error: recurrenceError };
        tx.kind = 'recurring';
        tx.recurrence = { frequency: args.frequency || 'monthly', interval: Math.max(Number(args.interval) || 1, 1), end: args.end_type || 'never', until: args.end_type === 'date' ? (args.until || '') : '' };
      }
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
        .map(t => ({ id: t.id, type: t.type, desc: t.desc, value: t.value, project: t.project, date: t.date, recurring: isRecurringTransaction(t), recurrence: t.recurrence || null }));
    }

    case 'update_transaction': {
      const transaction = S.transactions.find(item => item.id === args.id);
      if (!transaction) return { success: false, error: 'Lançamento não encontrado' };
      if (args.value !== undefined && (!Number(args.value) || Number(args.value) <= 0)) return { success: false, error: 'value deve ser positivo' };
      ['type','desc','project','date'].forEach(field => { if (args[field] !== undefined) transaction[field] = args[field]; });
      if (args.value !== undefined) transaction.value = Number(args.value);
      if (args.recurring === false) { delete transaction.kind; delete transaction.recurrence; }
      else if (args.recurring === true || isRecurringTransaction(transaction)) {
        const recurrenceError = validateFinancialRecurrenceArgs({ frequency: args.frequency || transaction.recurrence?.frequency, end_type: args.end_type || transaction.recurrence?.end, until: args.until ?? transaction.recurrence?.until }, args.date || transaction.date);
        if (recurrenceError) return { success: false, error: recurrenceError };
        transaction.kind = 'recurring';
        transaction.recurrence ||= { frequency: 'monthly', interval: 1, end: 'never', until: '' };
        if (args.frequency !== undefined) transaction.recurrence.frequency = args.frequency;
        if (args.interval !== undefined) transaction.recurrence.interval = Math.max(Number(args.interval) || 1, 1);
        if (args.end_type !== undefined) transaction.recurrence.end = args.end_type;
        if (args.until !== undefined) transaction.recurrence.until = args.until;
      }
      saveTransactions(); renderFinancial();
      return { success: true, transaction };
    }

    case 'delete_transaction': {
      const before = S.transactions.length;
      S.transactions = S.transactions.filter(transaction => transaction.id !== args.id);
      saveTransactions(); renderFinancial();
      return { success: S.transactions.length < before };
    }

    case 'get_financial_forecast': {
      const months = Math.min(Math.max(Number(args.months) || 6, 1), 24);
      return Array.from({ length: months }, (_, offset) => {
        const range = financialMonthRange(offset);
        return { month: range.start.slice(0, 7), ...financialTotals(financialEntriesBetween(range.start, range.end)) };
      });
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
    .filter(t => t.kind !== 'event' && t.priority === 'Alta' && t.col !== 'done')
    .slice(0, 6)
    .map(t => `${t.title}${t.project ? ` - ${t.project}` : ''}`);
  const openFollowUps = S.contacts
    .filter(c => c.nextStep)
    .slice(0, 5)
    .map(c => `${c.name}: ${c.nextStep}`);
  const financialToday = localDateString(new Date());
  const financialStart = S.transactions.map(item => item.date).filter(Boolean).sort()[0] || financialToday;
  const financialRealized = financialTotals(financialEntriesBetween(financialStart, financialToday));
  const financialNext30 = financialTotals(financialEntriesBetween(addCalendarDays(financialToday, 1), addCalendarDays(financialToday, 30)));
  const rhythm = getProjectRhythm();
  const timeSummary = getProjectTimeSummary(rhythm);
  const timeByProject = Object.entries(timeSummary.byProject)
    .sort((a, b) => b[1] - a[1])
    .map(([project, sec]) => `${project}: ${formatWorkTime(sec)}`)
    .join('; ');
  const currentInsights = generateInsights().slice(0, 6).map(insight => `${insight.title}: ${insight.message}`);

  return [
    `Projetos: ${S.projects.length}. Ativos: ${activeProjects.join('; ') || 'nenhum'}.`,
    `Tarefas abertas: ${S.tasks.filter(t => t.kind !== 'event' && t.col !== 'done').length}. Prioridades: ${priorityTasks.join('; ') || 'nenhuma'}.`,
    `Eventos recorrentes: ${S.tasks.filter(isRecurringEvent).map(event => `${event.title} (${recurrenceLabel(event)}, ${event.time || 'sem horário'})`).join('; ') || 'nenhum'}.`,
    `Ideias: ${S.ideas.length}. CRM: ${S.contacts.length} contatos. Follow-ups: ${openFollowUps.join('; ') || 'nenhum'}.`,
    `Financeiro realizado: entradas ${fmtCurrency(financialRealized.income)}, saidas ${fmtCurrency(financialRealized.expense)}, saldo ${fmtCurrency(financialRealized.balance)}. Recorrencias: ${S.transactions.filter(isRecurringTransaction).length}. Fluxo previsto em 30 dias: ${fmtCurrency(financialNext30.balance)}.`,
    `Ritmo dos projetos hoje: ${timeByProject || 'nenhum tempo registrado'}. Projeto atual: ${rhythm.timer?.project || rhythm.activeProject || 'nenhum'}.`,
    `Sinais proativos do Jarvis: ${currentInsights.join('; ') || 'nenhum sinal urgente'}.`,
    `Notas: ${S.notes.filter(n => n.type === 'note').length}. Secao atual: ${sectionMeta[S.section]?.label || S.section}.`
  ].join('\n');
}

function jarvisBuildSystemPrompt() {
  return `Voce e o Jarvis, assistente pessoal de ${currentUserName} integrado ao Motion Hub.

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
- Gerencie compromissos que se repetem com as ferramentas de eventos recorrentes. Interprete dias da semana como 0=domingo, 1=segunda, ... 6=sabado e use a data inicial mais proxima coerente com o pedido.
- No financeiro, diferencie valores realizados de projeções. Use recurring=true para receitas ou despesas que se repetem e get_financial_forecast para analisar os próximos meses. Você pode criar, listar, atualizar e excluir lançamentos.
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

/* ===== JARVIS LOCAL BRAIN ===== */
function jarvisLocalDate(text) {
  const normalized = jarvisNormalize(text);
  const today = localDateString(new Date());
  if (/depois de amanha/.test(normalized)) return addCalendarDays(today, 2);
  if (/\bamanha\b/.test(normalized)) return addCalendarDays(today, 1);
  if (/\bhoje\b/.test(normalized)) return today;

  const explicit = String(text).match(/\b(\d{1,2})[\/]([0-1]?\d)(?:[\/](\d{2,4}))?\b/);
  if (explicit) {
    const year = explicit[3] ? (explicit[3].length === 2 ? `20${explicit[3]}` : explicit[3]) : String(new Date().getFullYear());
    return `${year}-${String(explicit[2]).padStart(2, '0')}-${String(explicit[1]).padStart(2, '0')}`;
  }

  const weekdays = { domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6 };
  const weekday = Object.entries(weekdays).find(([name]) => new RegExp(`\\b${name}(?:-feira)?\\b`).test(normalized));
  if (weekday) {
    const now = new Date();
    let offset = (weekday[1] - now.getDay() + 7) % 7;
    if (offset === 0 && !normalized.includes('hoje')) offset = 7;
    return addCalendarDays(today, offset);
  }
  return '';
}

function jarvisLocalProject(text) {
  const normalized = jarvisNormalize(text);
  return S.projects.find(project => normalized.includes(jarvisNormalize(project.name)))?.name || '';
}

function jarvisLocalPriority(text) {
  const normalized = jarvisNormalize(text);
  if (/\b(alta|urgente|prioritaria)\b/.test(normalized)) return 'Alta';
  if (/\bbaixa\b/.test(normalized)) return 'Baixa';
  return 'Média';
}

function jarvisLocalRecurrence(text) {
  const normalized = jarvisNormalize(text);
  if (/todo dia|todos os dias|diari/.test(normalized)) return 'daily';
  if (/toda semana|semanal/.test(normalized)) return 'weekly';
  if (/todo mes|mensal/.test(normalized)) return 'monthly';
  return 'none';
}

function jarvisLocalTaskTitle(text, project = '') {
  let title = String(text || '').trim()
    .replace(/^(por favor[, ]*)?(crie|criar|adicione|adicionar|registre|registrar)\s+(uma\s+)?(nova\s+)?tarefa\s*/i, '')
    .replace(/^\s*para\s+/i, '')
    .replace(/\b(de\s+)?(alta|m[eé]dia|baixa)\s+prioridade\b/ig, '')
    .replace(/\b(com\s+prioridade\s+)(alta|m[eé]dia|baixa)\b/ig, '')
    .replace(/\b(para\s+)?(hoje|amanh[ãa]|depois de amanh[ãa])\b/ig, '')
    .replace(/\b(no|para o)\s+projeto\s+[^,.]+/ig, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s*para\s+/i, '')
    .replace(/^[,:;\-\s]+|[,:;\-\s.]+$/g, '')
    .trim();
  if (project) title = title.replace(new RegExp(`\\s+(?:no|para o)\\s+${project}$`, 'i'), '').trim();
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function jarvisFindTask(query, { includeDone = false } = {}) {
  const normalized = jarvisNormalize(query)
    .replace(/\b(a|o|uma|um|tarefa|de|do|da|para|como|marque|marcar|conclua|concluir|finalize|finalizar|feito|concluida)\b/g, ' ')
    .replace(/\s+/g, ' ').trim();
  if (!normalized) return { matches: [] };
  const words = normalized.split(' ').filter(word => word.length > 2);
  const matches = S.tasks.filter(task => task.kind !== 'event' && (includeDone || task.col !== 'done')).map(task => {
    const title = jarvisNormalize(task.title);
    const score = title.includes(normalized) || normalized.includes(title) ? 100 : words.reduce((sum, word) => sum + (title.includes(word) ? 1 : 0), 0);
    return { task, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  const bestScore = matches[0]?.score || 0;
  return { matches: matches.filter(item => item.score === bestScore).map(item => item.task) };
}

function jarvisLocalMoney(text) {
  const match = String(text).match(/(?:R\$\s*)?(\d+(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)/i);
  if (!match) return 0;
  const raw = match[1];
  return Number(raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw);
}

function jarvisLocalTransactionDescription(text) {
  const afterWith = String(text).match(/\b(?:com|em|para)\s+(.+?)(?:\s+(?:hoje|amanh[ãa]|no projeto).*)?$/i)?.[1];
  if (afterWith) return afterWith.trim().replace(/[.]+$/, '');
  return String(text).replace(/^(registre|registrar|adicione|adicionar)\s+(uma\s+)?(despesa|receita|gasto)\s*/i, '')
    .replace(/(?:de\s+)?R?\$?\s*\d+(?:[.,]\d+)?/i, '').trim() || 'Lançamento via Jarvis';
}

function jarvisLocalTaskList(col = 'all') {
  const labels = { all: 'Tarefas abertas', today: 'Tarefas de hoje', backlog: 'Backlog', inprogress: 'Em andamento', done: 'Concluídas' };
  let tasks = S.tasks.filter(task => task.kind !== 'event');
  if (col === 'all') tasks = tasks.filter(task => task.col !== 'done');
  else tasks = tasks.filter(task => task.col === col);
  tasks.sort((a, b) => Number(b.priority === 'Alta') - Number(a.priority === 'Alta') || (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31'));
  if (!tasks.length) return `**${labels[col]}:** nenhuma.`;
  return `**${labels[col]} (${tasks.length}):**\n${tasks.slice(0, 10).map(task => `- ${task.title}${task.project ? ` · ${task.project}` : ''}${task.due ? ` · ${fmtDate(task.due)}` : ''}${task.blocked ? ' · bloqueada' : ''}`).join('\n')}`;
}

function jarvisLocalDaySummary() {
  const today = localDateString(new Date());
  const dueToday = S.tasks.filter(task => task.kind !== 'event' && task.col !== 'done' && (task.due === today || task.col === 'today'));
  const overdue = S.tasks.filter(task => task.kind !== 'event' && task.col !== 'done' && task.due && task.due < today);
  const events = agendaItemsForDate(today).filter(item => item.kind === 'event');
  const pendingHabits = S.habits.filter(habit => !(habit.completions || []).includes(today));
  const plan = currentDailyPlan();
  const lines = [
    `**Seu dia agora:**`,
    `- ${dueToday.length} tarefa${dueToday.length === 1 ? '' : 's'} para hoje`,
    `- ${overdue.length} atrasada${overdue.length === 1 ? '' : 's'}`,
    `- ${events.length} compromisso${events.length === 1 ? '' : 's'} na agenda`,
    `- ${pendingHabits.length} hábito${pendingHabits.length === 1 ? '' : 's'} pendente${pendingHabits.length === 1 ? '' : 's'}`
  ];
  if (plan?.taskIds?.length) {
    const planned = plan.taskIds.map(id => S.tasks.find(task => task.id === id)).filter(Boolean);
    lines.push(`\n**Prioridades planejadas:**\n${planned.map(task => `- ${task.col === 'done' ? '✓' : '○'} ${task.title}`).join('\n')}`);
  } else if (dueToday.length) {
    lines.push(`\n**Comece por:** ${dueToday.sort((a,b) => Number(b.priority === 'Alta') - Number(a.priority === 'Alta'))[0].title}.`);
  }
  return lines.join('\n');
}

function jarvisAutoPlanDay() {
  const today = localDateString(new Date());
  const candidates = S.tasks.filter(task => task.kind !== 'event' && task.col !== 'done').sort((a, b) => {
    const rank = task => task.due && task.due < today ? 0 : task.col === 'today' || task.due === today ? 1 : task.priority === 'Alta' ? 2 : 3;
    return rank(a) - rank(b) || (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31');
  }).slice(0, 3);
  if (!candidates.length) return 'Você não tem tarefas pendentes para montar o plano de hoje.';
  const intention = `Avançar ${candidates[0].project || 'nas prioridades mais importantes'}`;
  const plan = { date: today, intention, taskIds: candidates.map(task => task.id), updatedAt: new Date().toISOString() };
  const index = S.dailyPlans.findIndex(item => item.date === today);
  if (index >= 0) S.dailyPlans[index] = plan; else S.dailyPlans.unshift(plan);
  saveDailyPlans(); renderDashboard();
  return `Planejamento criado com estas prioridades:\n${candidates.map((task, index) => `${index + 1}. **${task.title}**${task.project ? ` · ${task.project}` : ''}`).join('\n')}\n\nVocê pode ajustá-lo no Dashboard.`;
}

async function jarvisTryLocal(text, { fallback = false } = {}) {
  const normalized = jarvisNormalize(text).replace(/[?!]+$/g, '').trim();
  const starts = pattern => pattern.test(normalized);

  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|jarvis)$/.test(normalized)) {
    return { handled: true, response: `Olá, **${currentUserName}**! O cérebro local está ativo. Posso operar tarefas, agenda, hábitos, projetos, financeiro, planejamento diário e navegação mesmo sem o Groq.` };
  }

  if (/^(ajuda|comandos|o que voce consegue fazer|o que voce faz)$/.test(normalized) || normalized.includes('modo local')) {
    return { handled: true, response: '**Cérebro local disponível sem limites:**\n- Consultar, criar e concluir tarefas\n- Resumir ou planejar seu dia\n- Capturar itens na caixa de entrada\n- Consultar projetos, metas, hábitos e financeiro\n- Registrar receitas e despesas\n- Navegar pelo Motion Hub\n\nPara análises abertas, criatividade e conversas gerais, uso o Groq quando estiver disponível.' };
  }

  if (/(o que voce (percebeu|recomenda|sugere)|insights?|recomendacoes|projetos?\s+(?:\S+\s+)?parados?|minhas prioridades)/.test(normalized)) {
    const insights = generateInsights().filter(insight => !/projetos?\s+(?:\S+\s+)?parados?/.test(normalized) || insight.type === 'stale-project').slice(0, 6);
    return { handled: true, response: insights.length
      ? `**O que merece sua atenção agora:**\n${insights.map(insight => `- **${insight.title}:** ${insight.message}`).join('\n')}\n\nVocê pode agir nessas recomendações pelo Dashboard.`
      : 'Não encontrei nenhum sinal importante nesse momento. Seu workspace parece em dia.' };
  }

  if (starts(/^(capture|capturar|anote|anotar|guarde|guardar)\b/) && /(caixa|entrada|inbox|lembrete|capture|anote)/.test(normalized)) {
    const content = String(text).replace(/^(capture|capturar|anote|anotar|guarde|guardar)(\s+(na|no)\s+(caixa de entrada|inbox))?\s*[:,-]?\s*/i, '').trim();
    if (!content) return { handled: true, response: 'O que você quer que eu guarde na caixa de entrada?' };
    S.inbox.unshift({ id: uid(), text: content, project: jarvisLocalProject(text), createdAt: new Date().toISOString(), owner_id: currentUserId, owner_name: currentUserName });
    saveInbox(); renderDashboard();
    return { handled: true, response: `Guardei **${captureTitle(content)}** na caixa de entrada.` };
  }

  if (/planej(e|ar|a)|monte.*(meu )?dia|defina.*prioridades/.test(normalized) && /dia|hoje|prioridades/.test(normalized)) {
    return { handled: true, response: jarvisAutoPlanDay() };
  }

  if (starts(/^(crie|criar|adicione|adicionar|registre|registrar)\b/) && /\btarefa\b/.test(normalized)) {
    const project = jarvisLocalProject(text);
    const title = jarvisLocalTaskTitle(text, project);
    if (!title) return { handled: true, response: 'Qual é o título da tarefa que você quer criar?' };
    const due = jarvisLocalDate(text);
    const recurrence = jarvisLocalRecurrence(text);
    const result = await jarvisRunTool('create_task', { title, project, priority: jarvisLocalPriority(text), due, col: due === localDateString(new Date()) ? 'today' : 'backlog', recurrence });
    return { handled: true, response: `Tarefa criada: **${result.task.title}**${project ? ` em ${project}` : ''}${due ? `, para ${fmtDate(due)}` : ''}, prioridade ${result.task.priority.toLowerCase()}${recurrence !== 'none' ? ' e recorrente' : ''}.` };
  }

  if (starts(/^(marque|marcar|conclua|concluir|finalize|finalizar)\b/) && /(tarefa|como concluida|como feita)/.test(normalized)) {
    const found = jarvisFindTask(text);
    if (!found.matches.length) return { handled: true, response: 'Não encontrei uma tarefa pendente com esse nome.' };
    if (found.matches.length > 1) return { handled: true, response: `Encontrei mais de uma possibilidade:\n${found.matches.slice(0,5).map(task => `- ${task.title}`).join('\n')}\n\nDiga um trecho mais específico.` };
    toggleTaskDone(found.matches[0].id);
    return { handled: true, response: `Marquei **${found.matches[0].title}** como concluída.` };
  }

  const sectionMap = { dashboard: 'dashboard', inicio: 'dashboard', projetos: 'projects', tarefas: 'tasks', habitos: 'habits', agenda: 'agenda', estudos: 'studies', materias: 'studies', faculdade: 'studies', ideias: 'ideas', metas: 'goals', crm: 'crm', financeiro: 'financial', financas: 'financial', notas: 'notes', jarvis: 'jarvis', configuracoes: 'settings', automacoes: 'settings' };
  if (starts(/^(abra|abrir|va para|ir para|mostre a tela|navegue para)\b/)) {
    const target = Object.entries(sectionMap).find(([label]) => normalized.includes(label));
    if (target) { if (target[0] === 'automacoes') openSettings('automations'); else navigateTo(target[1]); return { handled: true, response: `Abri **${target[0] === 'automacoes' ? 'Automações' : sectionMeta[target[1]].label}**.` }; }
  }

  if (starts(/^(registre|registrar|adicione|adicionar)\b/) && /\b(despesa|gasto|receita)\b/.test(normalized)) {
    const value = jarvisLocalMoney(text);
    if (!value) return { handled: true, response: 'Qual é o valor do lançamento?' };
    const type = /receita/.test(normalized) ? 'Receita' : 'Despesa';
    const desc = jarvisLocalTransactionDescription(text);
    await jarvisRunTool('add_transaction', { type, desc, value, project: jarvisLocalProject(text), date: jarvisLocalDate(text) || localDateString(new Date()) });
    return { handled: true, response: `${type} registrada: **${desc}**, no valor de **${fmtCurrency(value)}**.` };
  }

  if (/quanto (eu )?(gastei|recebi)|resumo financeiro|meu saldo|como estao minhas financas/.test(normalized)) {
    const today = localDateString(new Date());
    const monthStart = `${today.slice(0, 7)}-01`;
    const totals = financialTotals(financialEntriesBetween(monthStart, today));
    return { handled: true, response: `**Financeiro deste mês:**\n- Receitas: ${fmtCurrency(totals.income)}\n- Despesas: ${fmtCurrency(totals.expense)}\n- Saldo: **${fmtCurrency(totals.balance)}**` };
  }

  if (/resum.*(dia|hoje|motion hub)|como esta (meu )?dia|o que tenho (para )?hoje|minha rotina hoje/.test(normalized)) {
    return { handled: true, response: jarvisLocalDaySummary() };
  }

  if (/tarefas/.test(normalized) && /(liste|listar|mostre|mostrar|quais|tenho|pendentes|backlog|andamento|concluidas|hoje)/.test(normalized)) {
    const col = /backlog/.test(normalized) ? 'backlog' : /andamento/.test(normalized) ? 'inprogress' : /concluid/.test(normalized) ? 'done' : /hoje/.test(normalized) ? 'today' : 'all';
    return { handled: true, response: jarvisLocalTaskList(col) };
  }

  if (/(meus|liste|listar|mostre|quais).*projetos|projetos ativos/.test(normalized) && !/(analise|avalie|sugira|estrateg|proximo passo)/.test(normalized)) {
    const projects = S.projects.filter(project => project.status !== 'Pausado');
    return { handled: true, response: projects.length ? `**Projetos:**\n${projects.map(project => `- ${project.name} · ${project.status} · ${project.progress || 0}%`).join('\n')}` : 'Nenhum projeto ativo.' };
  }

  if (/(minhas|liste|listar|mostre|quais).*metas|metas em risco/.test(normalized) && !/(analise|avalie|sugira|estrateg|proximo passo)/.test(normalized)) {
    const goals = normalized.includes('risco') ? S.goals.filter(goal => goal.status === 'Em risco' || goal.status === 'Atrasado') : S.goals;
    return { handled: true, response: goals.length ? `**Metas:**\n${goals.map(goal => `- ${goal.objective} · ${goal.status}`).join('\n')}` : 'Nenhuma meta encontrada nesse filtro.' };
  }

  if (/(meus|liste|listar|mostre|quais).*habitos|habitos (de )?hoje/.test(normalized) && !/(analise|avalie|sugira|estrateg)/.test(normalized)) {
    const today = localDateString(new Date());
    return { handled: true, response: `**Hábitos de hoje:**\n${S.habits.map(habit => `- ${(habit.completions || []).includes(today) ? '✓' : '○'} ${habit.name}`).join('\n') || '- Nenhum hábito cadastrado'}` };
  }

  if (/caixa de entrada|inbox/.test(normalized) && /(mostre|liste|listar|o que tem|itens)/.test(normalized)) {
    return { handled: true, response: S.inbox.length ? `**Caixa de entrada (${S.inbox.length}):**\n${S.inbox.slice(0,10).map(item => `- ${captureTitle(item.text)}`).join('\n')}` : 'Sua caixa de entrada está vazia.' };
  }

  if (fallback) {
    return { handled: true, response: 'O Groq não está disponível agora. Meu **cérebro local** continua funcionando para tarefas, planejamento diário, caixa de entrada, projetos, hábitos, metas, financeiro e navegação.\n\nTente, por exemplo: `planeje meu dia`, `crie uma tarefa para amanhã` ou `quanto gastei este mês`.' };
  }

  return { handled: false };
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
  const cleanMessages = messages.map(({ brain, ...message }) => message);

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
      }, ...cleanMessages],
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
  const cleanMessages = messages.map(({ brain, ...message }) => message);
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: JARVIS_MODEL,
      messages: cleanMessages,
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

  input.value = '';
  input.style.height = 'auto';
  jarvisMessages.push({ role: 'user', content: text });
  jarvisAppendMsg('user', text);
  jarvisSetBusy(true);

  try {
    const local = await jarvisTryLocal(text);
    if (local.handled) {
      const reply = { role: 'assistant', content: local.response, brain: 'local' };
      jarvisMessages.push(reply);
      jarvisSetBusy(false);
      jarvisSetBrainStatus('local');
      jarvisAppendMsg('assistant', reply.content, 'local');
      return;
    }

    const key = localStorage.getItem(JARVIS_KEY_STORE);
    if (!key) {
      const fallback = await jarvisTryLocal(text, { fallback: true });
      const reply = { role: 'assistant', content: fallback.response, brain: 'fallback' };
      jarvisMessages.push(reply);
      jarvisSetBusy(false);
      jarvisSetBrainStatus('fallback');
      jarvisAppendMsg('assistant', reply.content, 'fallback');
      return;
    }

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
    reply.brain = 'groq';
    jarvisMessages.push(reply);
    jarvisSetBusy(false);
    jarvisSetBrainStatus('groq');
    jarvisAppendMsg('assistant', reply.content || '…', 'groq');
  } catch (err) {
    const fallback = await jarvisTryLocal(text, { fallback: true });
    const reply = { role: 'assistant', content: fallback.response, brain: 'local' };
    jarvisMessages.push(reply);
    jarvisSetBusy(false);
    jarvisSetBrainStatus('fallback');
    jarvisAppendMsg('assistant', reply.content, 'fallback');
  }
}

function jarvisAppendMsg(role, content, brain = '') {
  ['jarvisMsgList', 'jarvisPageMsgList'].forEach(listId => {
    const list = document.getElementById(listId);
    if (!list) return;
    const div = document.createElement('div');
    div.className = `jarvis-msg jarvis-msg-${role}`;
    if (role === 'user') {
      div.innerHTML = `<div class="jarvis-bubble">${jarvisEsc(content)}</div>`;
    } else if (role === 'assistant') {
      const brainLabel = brain === 'groq' ? 'Groq' : brain === 'fallback' ? 'Local · contingência' : brain === 'local' ? 'Local' : '';
      div.innerHTML = `<div class="jarvis-avatar-sm"><i class='bx bx-bot'></i></div><div class="jarvis-bubble">${brainLabel ? `<span class="jarvis-brain-badge ${brain}"><i class='bx ${brain === 'groq' ? 'bx-cloud' : 'bx-code-alt'}'></i>${brainLabel}</span>` : ''}${jarvisMd(content)}</div>`;
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
    .forEach(msg => jarvisAppendMsg(msg.role, msg.content || '', msg.brain || ''));
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
  jarvisOpen = false;
  document.getElementById('jarvisPanel')?.classList.remove('open');
  document.getElementById('jarvisBtn')?.classList.remove('active');
  openSettings('jarvis');
}

function jarvisGreet() {
  if (jarvisGreeted) return;
  jarvisGreeted = true;
  jarvisAppendMsg('assistant', `Olá, **${currentUserName}**! Agora opero com dois cérebros: o **local**, rápido e sem limites para ações no Hub, e o **Groq** para análises e conversas mais abertas.`);
}

function jarvisSetBrainStatus(mode = 'hybrid') {
  const status = document.getElementById('jarvisBrainStatus');
  if (!status) return;
  const labels = { hybrid: 'Híbrido', local: 'Cérebro local', groq: 'Groq', fallback: 'Local · contingência' };
  status.textContent = labels[mode] || labels.hybrid;
  status.parentElement?.classList.toggle('local-mode', mode === 'local' || mode === 'fallback');
  status.parentElement?.classList.toggle('groq-mode', mode === 'groq');
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
      jarvisAppendMsg('assistant', `Olá, **${currentUserName}**! Agora opero com dois cérebros: o **local**, rápido e sem limites para ações no Hub, e o **Groq** para análises e conversas mais abertas.`);
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
