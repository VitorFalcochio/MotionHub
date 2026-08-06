const OPERATIONS = {
  create_task: { domain: 'tasks', label: 'Criar tarefa' },
  update_task: { domain: 'tasks', label: 'Atualizar tarefa' },
  complete_task: { domain: 'tasks', label: 'Concluir tarefa' },
  delete_task: { domain: 'tasks', label: 'Excluir tarefa', risk: 'high' },
  create_recurring_event: { domain: 'tasks', label: 'Criar evento recorrente' },
  update_recurring_event: { domain: 'tasks', label: 'Atualizar evento recorrente' },
  delete_recurring_event: { domain: 'tasks', label: 'Excluir evento recorrente', risk: 'high' },
  create_project: { domain: 'projects', label: 'Criar projeto' },
  check_habit: { domain: 'habits', label: 'Atualizar hábito' },
  create_goal: { domain: 'goals', label: 'Criar meta' },
  create_idea: { domain: 'ideas', label: 'Registrar ideia' },
  create_contact: { domain: 'contacts', label: 'Criar contato' },
  create_doc: { domain: 'docs', label: 'Criar documento' },
  create_note: { domain: 'notes', label: 'Criar nota' },
  capture_inbox: { domain: 'inbox', label: 'Capturar na caixa de entrada' },
  plan_day: { domain: 'dailyPlans', label: 'Organizar o dia' },
  add_transaction: { domain: 'transactions', label: 'Registrar lançamento', risk: 'high' },
  update_transaction: { domain: 'transactions', label: 'Atualizar lançamento', risk: 'high' },
  delete_transaction: { domain: 'transactions', label: 'Excluir lançamento', risk: 'high' }
};

export class OperationalPolicy {
  classify(name) {
    const operation = OPERATIONS[name];
    if (!operation) {
      return { name, mutation: false, domain: '', label: name.replace(/_/g, ' '), risk: 'none', reversible: false, requiresConfirmation: false };
    }
    const risk = operation.risk || 'low';
    return {
      name,
      ...operation,
      mutation: true,
      risk,
      reversible: true,
      requiresConfirmation: risk === 'high'
    };
  }
}
