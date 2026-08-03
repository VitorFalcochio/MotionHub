const DEFAULT_SUPABASE_URL = 'https://zwqcbwiegcndwvqprcdt.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_DQg6Q79FXornM4XKlKGkJw_OQjUGEvz';

const collections = [
  'projects',
  'tasks',
  'ideas',
  'contacts',
  'transactions',
  'docs',
  'habits',
  'goals',
  'reviews',
  'notes'
];

export const toolSchemas = {
  get_summary: { description: 'Resumo geral do Hub.', args: {} },
  list_tasks: { description: 'Lista tarefas.', args: { col: 'all | backlog | today | inprogress | done' } },
  create_task: { description: 'Cria tarefa.', args: { title: 'string', col: 'backlog | today | inprogress | done', project: 'string?', priority: 'Alta | Media | Baixa?', due: 'YYYY-MM-DD?' } },
  update_task: { description: 'Atualiza tarefa.', args: { id: 'string', title: 'string?', col: 'string?', priority: 'string?', due: 'YYYY-MM-DD?', project: 'string?' } },
  delete_task: { description: 'Exclui tarefa.', args: { id: 'string' } },
  list_recurring_events: { description: 'Lista series de eventos recorrentes da agenda.', args: {} },
  create_recurring_event: { description: 'Cria evento recorrente.', args: { title: 'string', start_date: 'YYYY-MM-DD', time: 'HH:MM', duration: 'number?', project: 'string?', frequency: 'daily | weekly | monthly', interval: 'number?', weekdays: 'number[]? (0=domingo)', end_type: 'never | date | count?', until: 'YYYY-MM-DD?', count: 'number?' } },
  update_recurring_event: { description: 'Atualiza uma serie recorrente inteira.', args: { id: 'string', title: 'string?', start_date: 'YYYY-MM-DD?', time: 'HH:MM?', duration: 'number?', project: 'string?', frequency: 'daily | weekly | monthly?', interval: 'number?', weekdays: 'number[]?', end_type: 'never | date | count?', until: 'YYYY-MM-DD?', count: 'number?' } },
  delete_recurring_event: { description: 'Exclui uma serie recorrente inteira.', args: { id: 'string' } },
  list_projects: { description: 'Lista projetos.', args: {} },
  create_project: { description: 'Cria projeto.', args: { name: 'string', desc: 'string?', status: 'string?', priority: 'string?', progress: 'number?' } },
  list_habits: { description: 'Lista habitos.', args: {} },
  check_habit: { description: 'Marca/desmarca habito hoje.', args: { id: 'string', done: 'boolean' } },
  list_goals: { description: 'Lista OKRs.', args: {} },
  create_idea: { description: 'Cria ideia.', args: { name: 'string', problem: 'string?', audience: 'string?', monetization: 'string?', potential: 'string?', status: 'string?', notes: 'string?' } },
  list_contacts: { description: 'Lista CRM.', args: {} },
  add_transaction: { description: 'Cria lancamento financeiro unico ou recorrente.', args: { type: 'Receita | Despesa', desc: 'string', value: 'number', project: 'string?', date: 'YYYY-MM-DD?', recurring: 'boolean?', frequency: 'weekly | monthly | yearly?', interval: 'number?', end_type: 'never | date?', until: 'YYYY-MM-DD?' } },
  list_transactions: { description: 'Lista lancamentos unicos e recorrentes.', args: { limit: 'number?' } },
  update_transaction: { description: 'Atualiza lancamento ou serie recorrente.', args: { id: 'string', type: 'Receita | Despesa?', desc: 'string?', value: 'number?', project: 'string?', date: 'YYYY-MM-DD?', recurring: 'boolean?', frequency: 'weekly | monthly | yearly?', interval: 'number?', end_type: 'never | date?', until: 'YYYY-MM-DD?' } },
  delete_transaction: { description: 'Exclui lancamento ou serie recorrente.', args: { id: 'string' } },
  get_financial_forecast: { description: 'Projeta entradas, saidas e saldo por mes.', args: { months: 'number? (1-24)' } },
  list_notes: { description: 'Lista notas e pastas.', args: {} },
  search_notes: { description: 'Busca notas.', args: { query: 'string' } },
  read_note: { description: 'Le uma nota.', args: { id: 'string' } },
  create_note: { description: 'Cria nota.', args: { name: 'string', content: 'string?', folder_name: 'string?' } }
};

let auth = {
  accessToken: '',
  userId: '',
  expiresAt: 0
};

export function getConfig() {
  return {
    apiToken: process.env.HUB_API_TOKEN || '',
    email: process.env.HUB_EMAIL || '',
    password: process.env.HUB_PASSWORD || '',
    supabaseUrl: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY || DEFAULT_SUPABASE_KEY
  };
}

export function isAuthorized(authorizationHeader) {
  const token = getConfig().apiToken;
  if (!token) return true;
  return authorizationHeader === `Bearer ${token}`;
}

export async function runTool(name, args = {}) {
  if (!toolSchemas[name]) return { success: false, error: `Ferramenta desconhecida: ${name}` };

  const data = await loadData();
  const today = todayInSaoPaulo();

  switch (name) {
    case 'get_summary': {
      const financialStart = data.transactions.map(item => item.date).filter(Boolean).sort()[0] || today;
      const financial = financialTotals(expandFinancialEntries(data.transactions, financialStart, today));
      return {
        tasks: countBy(data.tasks.filter(task => task.kind !== 'event'), 'col', ['backlog', 'today', 'inprogress', 'done']),
        recurringEvents: { total: data.tasks.filter(isRecurringEvent).length },
        projects: { total: data.projects.length, byStatus: countBy(data.projects, 'status') },
        habits: { total: data.habits.length, completedToday: data.habits.filter(h => (h.completions || []).includes(today)).length },
        goals: { total: data.goals.length },
        financial: { ...financial, recurring: data.transactions.filter(isRecurringTransaction).length },
        ideas: { total: data.ideas.length },
        contacts: { total: data.contacts.length }
      };
    }

    case 'list_tasks': {
      const col = args.col || 'all';
      const regularTasks = data.tasks.filter(task => task.kind !== 'event');
      const tasks = col === 'all' ? regularTasks : regularTasks.filter(t => t.col === col);
      return tasks.map(({ id, title, project, priority, due, col }) => ({ id, title, project, priority, due, col }));
    }

    case 'create_task': {
      if (!args.title) return { success: false, error: 'title e obrigatorio' };
      const task = { id: uid(), title: args.title, project: args.project || '', priority: args.priority || 'Media', due: args.due || '', col: args.col || 'backlog' };
      data.tasks.push(task);
      await saveData({ tasks: data.tasks });
      return { success: true, task };
    }

    case 'update_task': {
      const task = data.tasks.find(t => t.id === args.id);
      if (!task) return { success: false, error: 'Tarefa nao encontrada' };
      for (const field of ['title', 'col', 'priority', 'due', 'project']) {
        if (args[field] !== undefined) task[field] = args[field];
      }
      await saveData({ tasks: data.tasks });
      return { success: true, task };
    }

    case 'delete_task': {
      const before = data.tasks.length;
      data.tasks = data.tasks.filter(t => t.id !== args.id);
      await saveData({ tasks: data.tasks });
      return { success: data.tasks.length < before };
    }

    case 'list_recurring_events':
      return data.tasks.filter(isRecurringEvent).map(({ id, title, due, time, duration, project, recurrence }) => ({
        id, title, start_date: due, time, duration, project, recurrence
      }));

    case 'create_recurring_event': {
      const validationError = validateRecurringEventArgs(args, true);
      if (validationError) return { success: false, error: validationError };
      const startDay = dateFromString(args.start_date).getDay();
      const event = {
        id: uid(), kind: 'event', title: args.title, due: args.start_date, time: args.time,
        duration: Math.max(Number(args.duration) || 60, 1), project: args.project || '', priority: 'Média', col: 'calendar',
        recurrence: {
          frequency: args.frequency,
          interval: Math.max(Number(args.interval) || 1, 1),
          weekdays: args.frequency === 'weekly' ? normalizeWeekdays(args.weekdays, startDay) : [],
          end: args.end_type || 'never',
          until: args.end_type === 'date' ? (args.until || '') : '',
          count: args.end_type === 'count' ? Math.max(Number(args.count) || 1, 1) : null
        }
      };
      data.tasks.unshift(event);
      await saveData({ tasks: data.tasks });
      return { success: true, event };
    }

    case 'update_recurring_event': {
      const event = data.tasks.find(item => item.id === args.id && isRecurringEvent(item));
      if (!event) return { success: false, error: 'Evento recorrente nao encontrado' };
      const validationError = validateRecurringEventArgs(args, false);
      if (validationError) return { success: false, error: validationError };
      if (args.title !== undefined) event.title = args.title;
      if (args.start_date !== undefined) event.due = args.start_date;
      if (args.time !== undefined) event.time = args.time;
      if (args.duration !== undefined) event.duration = Math.max(Number(args.duration) || 1, 1);
      if (args.project !== undefined) event.project = args.project;
      if (args.frequency !== undefined) event.recurrence.frequency = args.frequency;
      if (args.interval !== undefined) event.recurrence.interval = Math.max(Number(args.interval) || 1, 1);
      if (args.weekdays !== undefined) event.recurrence.weekdays = normalizeWeekdays(args.weekdays, dateFromString(event.due).getDay());
      if (args.end_type !== undefined) event.recurrence.end = args.end_type;
      if (args.until !== undefined) event.recurrence.until = args.until;
      if (args.count !== undefined) event.recurrence.count = Math.max(Number(args.count) || 1, 1);
      await saveData({ tasks: data.tasks });
      return { success: true, event };
    }

    case 'delete_recurring_event': {
      const before = data.tasks.length;
      data.tasks = data.tasks.filter(item => !(item.id === args.id && isRecurringEvent(item)));
      await saveData({ tasks: data.tasks });
      return { success: data.tasks.length < before };
    }

    case 'list_projects':
      return data.projects.map(({ id, name, desc, status, priority, progress, createdAt }) => ({ id, name, desc, status, priority, progress, createdAt }));

    case 'create_project': {
      if (!args.name) return { success: false, error: 'name e obrigatorio' };
      const project = { id: uid(), name: args.name, desc: args.desc || '', status: args.status || 'Ideia', priority: args.priority || 'Media', progress: Number(args.progress || 0), createdAt: today };
      data.projects.push(project);
      await saveData({ projects: data.projects });
      return { success: true, project };
    }

    case 'list_habits':
      return data.habits.map(h => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        category: h.category,
        completedToday: (h.completions || []).includes(today),
        totalCompletions: (h.completions || []).length
      }));

    case 'check_habit': {
      const habit = data.habits.find(h => h.id === args.id);
      if (!habit) return { success: false, error: 'Habito nao encontrado' };
      habit.completions ||= [];
      if (args.done && !habit.completions.includes(today)) habit.completions.push(today);
      if (!args.done) habit.completions = habit.completions.filter(date => date !== today);
      await saveData({ habits: data.habits });
      return { success: true, name: habit.name, completedToday: Boolean(args.done) };
    }

    case 'list_goals':
      return data.goals.map(({ id, objective, quarter, status, keyResults }) => ({ id, objective, quarter, status, keyResults }));

    case 'create_idea': {
      if (!args.name) return { success: false, error: 'name e obrigatorio' };
      const idea = { id: uid(), name: args.name, problem: args.problem || '', audience: args.audience || '', monetization: args.monetization || '', potential: args.potential || 'Medio', status: args.status || 'Em analise', notes: args.notes || '' };
      data.ideas.push(idea);
      await saveData({ ideas: data.ideas });
      return { success: true, idea };
    }

    case 'list_contacts':
      return data.contacts.map(({ id, name, type, company, contact, status, nextStep, notes }) => ({ id, name, type, company, contact, status, nextStep, notes }));

    case 'add_transaction': {
      if (!args.type || !args.desc || !Number(args.value) || Number(args.value) <= 0) return { success: false, error: 'type, desc e value positivo sao obrigatorios' };
      const transaction = { id: uid(), type: args.type, desc: args.desc, value: Number(args.value), project: args.project || '', date: args.date || today };
      if (args.recurring) {
        const error = validateFinancialRecurrence(args, transaction.date);
        if (error) return { success: false, error };
        transaction.kind = 'recurring';
        transaction.recurrence = { frequency: args.frequency || 'monthly', interval: Math.max(Number(args.interval) || 1, 1), end: args.end_type || 'never', until: args.end_type === 'date' ? args.until : '' };
      }
      data.transactions.push(transaction);
      await saveData({ transactions: data.transactions });
      return { success: true, transaction };
    }

    case 'list_transactions': {
      const limit = Math.min(Math.max(Number(args.limit) || 30, 1), 200);
      return [...data.transactions].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, limit).map(transaction => ({
        id: transaction.id, type: transaction.type, desc: transaction.desc, value: transaction.value,
        project: transaction.project, date: transaction.date, recurring: isRecurringTransaction(transaction), recurrence: transaction.recurrence || null
      }));
    }

    case 'update_transaction': {
      const transaction = data.transactions.find(item => item.id === args.id);
      if (!transaction) return { success: false, error: 'Lancamento nao encontrado' };
      if (args.value !== undefined && (!Number(args.value) || Number(args.value) <= 0)) return { success: false, error: 'value deve ser positivo' };
      for (const field of ['type', 'desc', 'project', 'date']) if (args[field] !== undefined) transaction[field] = args[field];
      if (args.value !== undefined) transaction.value = Number(args.value);
      if (args.recurring === false) {
        delete transaction.kind;
        delete transaction.recurrence;
      } else if (args.recurring === true || isRecurringTransaction(transaction)) {
        const merged = { ...transaction.recurrence, ...args, start_date: transaction.date };
        const error = validateFinancialRecurrence(merged, transaction.date);
        if (error) return { success: false, error };
        transaction.kind = 'recurring';
        transaction.recurrence ||= { frequency: 'monthly', interval: 1, end: 'never', until: '' };
        if (args.frequency !== undefined) transaction.recurrence.frequency = args.frequency;
        if (args.interval !== undefined) transaction.recurrence.interval = Math.max(Number(args.interval) || 1, 1);
        if (args.end_type !== undefined) transaction.recurrence.end = args.end_type;
        if (args.until !== undefined) transaction.recurrence.until = args.until;
      }
      await saveData({ transactions: data.transactions });
      return { success: true, transaction };
    }

    case 'delete_transaction': {
      const before = data.transactions.length;
      data.transactions = data.transactions.filter(transaction => transaction.id !== args.id);
      await saveData({ transactions: data.transactions });
      return { success: data.transactions.length < before };
    }

    case 'get_financial_forecast': {
      const months = Math.min(Math.max(Number(args.months) || 6, 1), 24);
      return Array.from({ length: months }, (_, offset) => {
        const range = financialMonthRange(offset);
        return { month: range.start.slice(0, 7), ...financialTotals(expandFinancialEntries(data.transactions, range.start, range.end)) };
      });
    }

    case 'list_notes': {
      const folders = data.notes.filter(n => n.type === 'folder').map(folder => ({
        id: folder.id,
        name: folder.name,
        notes: data.notes.filter(n => n.type === 'note' && n.parentId === folder.id).map(n => ({ id: n.id, name: n.name, updatedAt: n.updatedAt }))
      }));
      const rootNotes = data.notes.filter(n => n.type === 'note' && !n.parentId).map(n => ({ id: n.id, name: n.name, updatedAt: n.updatedAt }));
      return { folders, rootNotes };
    }

    case 'search_notes': {
      const query = String(args.query || '').toLowerCase();
      return data.notes
        .filter(n => n.type === 'note' && (n.name.toLowerCase().includes(query) || String(n.content || '').toLowerCase().includes(query)))
        .map(n => {
          const folder = n.parentId ? data.notes.find(f => f.id === n.parentId) : null;
          const index = String(n.content || '').toLowerCase().indexOf(query);
          const excerpt = index >= 0 ? `...${String(n.content || '').slice(Math.max(0, index - 40), index + 80)}...` : '';
          return { id: n.id, name: n.name, folder: folder?.name || null, excerpt };
        });
    }

    case 'read_note': {
      const note = data.notes.find(n => n.id === args.id && n.type === 'note');
      if (!note) return { success: false, error: 'Nota nao encontrada' };
      return { id: note.id, name: note.name, content: note.content, updatedAt: note.updatedAt };
    }

    case 'create_note': {
      if (!args.name) return { success: false, error: 'name e obrigatorio' };
      let parentId = null;
      if (args.folder_name) {
        const folder = data.notes.find(n => n.type === 'folder' && n.name.toLowerCase() === String(args.folder_name).toLowerCase());
        if (folder) parentId = folder.id;
      }
      const note = { id: uid(), type: 'note', name: args.name, content: args.content || '', parentId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      data.notes.push(note);
      await saveData({ notes: data.notes });
      return { success: true, note: { id: note.id, name: note.name, folder: args.folder_name || null } };
    }
  }
}

const WORKSPACE_ID = 'main';

export async function loadData() {
  await ensureSession();
  const data = await supabase(`/rest/v1/app_data?workspace_id=eq.${encodeURIComponent(WORKSPACE_ID)}&select=*`, {
    headers: { Prefer: 'return=representation' }
  });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    const inserted = await supabase('/rest/v1/app_data', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ workspace_id: WORKSPACE_ID })
    });
    return normalizeData(Array.isArray(inserted) ? inserted[0] : inserted);
  }
  return normalizeData(row);
}

async function saveData(updates) {
  await ensureSession();
  return supabase('/rest/v1/app_data', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ workspace_id: WORKSPACE_ID, ...updates }),
    searchParams: { on_conflict: 'workspace_id' }
  });
}

function normalizeData(row = {}) {
  const data = { ...row };
  for (const key of collections) data[key] = Array.isArray(data[key]) ? data[key] : [];
  return data;
}

async function ensureSession() {
  const config = getConfig();
  if (!config.email || !config.password) throw new Error('Configure HUB_EMAIL e HUB_PASSWORD');
  if (auth.accessToken && Date.now() < auth.expiresAt - 60_000) return;

  const result = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: config.supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: config.email, password: config.password })
  });

  if (!result.ok) {
    const error = await result.text();
    throw new Error(`Falha ao autenticar no Supabase: ${error}`);
  }

  const session = await result.json();
  auth = {
    accessToken: session.access_token,
    userId: session.user?.id,
    expiresAt: Date.now() + Number(session.expires_in || 3600) * 1000
  };
}

async function supabase(path, options = {}) {
  const config = getConfig();
  const url = new URL(path, config.supabaseUrl);
  for (const [key, value] of Object.entries(options.searchParams || {})) {
    url.searchParams.set(key, value);
  }

  const result = await fetch(url, {
    ...options,
    headers: {
      apikey: config.supabaseKey,
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!result.ok) {
    const error = await result.text();
    throw new Error(`Erro Supabase ${result.status}: ${error}`);
  }

  if (result.status === 204) return null;
  return result.json();
}

function countBy(items, field, defaults = []) {
  const result = Object.fromEntries(defaults.map(key => [key, 0]));
  for (const item of items) result[item[field]] = (result[item[field]] || 0) + 1;
  return result;
}

function isRecurringEvent(item) {
  return item?.kind === 'event' && Boolean(item?.recurrence?.frequency);
}

function dateFromString(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  return new Date(year, month - 1, day);
}

function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addCalendarDays(value, amount) {
  const date = dateFromString(value);
  date.setDate(date.getDate() + amount);
  return localDateString(date);
}

function isRecurringTransaction(transaction) {
  return transaction?.kind === 'recurring' && Boolean(transaction?.recurrence?.frequency);
}

function transactionOccursOn(transaction, dateString) {
  if (!isRecurringTransaction(transaction)) return false;
  const start = dateFromString(transaction.date);
  const date = dateFromString(dateString);
  if (!transaction.date || Number.isNaN(start.getTime()) || date < start) return false;
  const recurrence = transaction.recurrence;
  if (recurrence.end === 'date' && recurrence.until && dateString > recurrence.until) return false;
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

function expandFinancialEntries(transactions, from, to) {
  const entries = transactions.filter(transaction => !isRecurringTransaction(transaction) && transaction.date >= from && transaction.date <= to);
  for (const transaction of transactions.filter(isRecurringTransaction)) {
    const start = transaction.date > from ? transaction.date : from;
    for (let cursor = start; cursor <= to; cursor = addCalendarDays(cursor, 1)) {
      if (transactionOccursOn(transaction, cursor)) entries.push({ ...transaction, date: cursor, seriesId: transaction.id });
      if (transaction.recurrence.end === 'date' && transaction.recurrence.until && cursor > transaction.recurrence.until) break;
    }
  }
  return entries;
}

function financialTotals(entries) {
  const income = entries.filter(item => item.type === 'Receita').reduce((sum, item) => sum + Number(item.value || 0), 0);
  const expense = entries.filter(item => item.type === 'Despesa').reduce((sum, item) => sum + Number(item.value || 0), 0);
  return { income, expense, balance: income - expense };
}

function financialMonthRange(offset = 0) {
  const [year, month] = todayInSaoPaulo().split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return { start: localDateString(date), end: localDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0)) };
}

function todayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function validateFinancialRecurrence(args, startDate) {
  const frequency = args.frequency || 'monthly';
  const end = args.end_type || args.end || 'never';
  if (!['weekly', 'monthly', 'yearly'].includes(frequency)) return 'frequency invalida';
  if (!['never', 'date'].includes(end)) return 'end_type invalido';
  if (end === 'date') {
    const until = args.until || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) return 'until e obrigatorio em YYYY-MM-DD quando end_type=date';
    if (until < startDate) return 'until deve ser igual ou posterior a date';
  }
  return '';
}

function normalizeWeekdays(values, fallback) {
  const days = Array.isArray(values) ? values.map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6) : [];
  return [...new Set(days.length ? days : [fallback])];
}

function validateRecurringEventArgs(args, creating) {
  if (creating && (!args.title || !args.start_date || !args.time || !args.frequency)) return 'title, start_date, time e frequency sao obrigatorios';
  if (args.start_date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(args.start_date))) return 'start_date deve usar YYYY-MM-DD';
  if (args.time !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(args.time))) return 'time deve usar HH:MM';
  if (args.frequency !== undefined && !['daily', 'weekly', 'monthly'].includes(args.frequency)) return 'frequency invalida';
  if (args.end_type !== undefined && !['never', 'date', 'count'].includes(args.end_type)) return 'end_type invalido';
  if (args.end_type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(args.until || ''))) return 'until e obrigatorio em YYYY-MM-DD quando end_type=date';
  if (args.end_type === 'count' && (!Number.isFinite(Number(args.count)) || Number(args.count) < 1)) return 'count deve ser maior que zero quando end_type=count';
  if (args.end_type === 'date' && args.start_date && args.until < args.start_date) return 'until deve ser igual ou posterior a start_date';
  if (args.weekdays !== undefined && (!Array.isArray(args.weekdays) || args.weekdays.some(day => !Number.isInteger(Number(day)) || Number(day) < 0 || Number(day) > 6))) return 'weekdays deve conter dias entre 0 e 6';
  return '';
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
