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
  list_projects: { description: 'Lista projetos.', args: {} },
  create_project: { description: 'Cria projeto.', args: { name: 'string', desc: 'string?', status: 'string?', priority: 'string?', progress: 'number?' } },
  list_habits: { description: 'Lista habitos.', args: {} },
  check_habit: { description: 'Marca/desmarca habito hoje.', args: { id: 'string', done: 'boolean' } },
  list_goals: { description: 'Lista OKRs.', args: {} },
  create_idea: { description: 'Cria ideia.', args: { name: 'string', problem: 'string?', audience: 'string?', monetization: 'string?', potential: 'string?', status: 'string?', notes: 'string?' } },
  list_contacts: { description: 'Lista CRM.', args: {} },
  add_transaction: { description: 'Cria lancamento financeiro.', args: { type: 'Receita | Despesa', desc: 'string', value: 'number', project: 'string?', date: 'YYYY-MM-DD?' } },
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
  const today = new Date().toISOString().slice(0, 10);

  switch (name) {
    case 'get_summary': {
      const income = data.transactions.filter(t => t.type === 'Receita').reduce((sum, t) => sum + Number(t.value || 0), 0);
      const expense = data.transactions.filter(t => t.type === 'Despesa').reduce((sum, t) => sum + Number(t.value || 0), 0);
      return {
        tasks: countBy(data.tasks, 'col', ['backlog', 'today', 'inprogress', 'done']),
        projects: { total: data.projects.length, byStatus: countBy(data.projects, 'status') },
        habits: { total: data.habits.length, completedToday: data.habits.filter(h => (h.completions || []).includes(today)).length },
        goals: { total: data.goals.length },
        financial: { income, expense, balance: income - expense },
        ideas: { total: data.ideas.length },
        contacts: { total: data.contacts.length }
      };
    }

    case 'list_tasks': {
      const col = args.col || 'all';
      const tasks = col === 'all' ? data.tasks : data.tasks.filter(t => t.col === col);
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
      if (!args.type || !args.desc || args.value === undefined) return { success: false, error: 'type, desc e value sao obrigatorios' };
      const transaction = { id: uid(), type: args.type, desc: args.desc, value: Number(args.value), project: args.project || '', date: args.date || today };
      data.transactions.push(transaction);
      await saveData({ transactions: data.transactions });
      return { success: true, transaction };
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

export async function loadData() {
  await ensureSession();
  const data = await supabase(`/rest/v1/app_data?user_id=eq.${encodeURIComponent(auth.userId)}&select=*`, {
    headers: { Prefer: 'return=representation' }
  });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    const inserted = await supabase('/rest/v1/app_data', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: auth.userId })
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
    body: JSON.stringify({ user_id: auth.userId, ...updates }),
    searchParams: { on_conflict: 'user_id' }
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

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
