const MODES = [
  { name: 'programmer', intents: ['coding', 'backend', 'frontend', 'database', 'debug'], patterns: [/codigo|programar|implementar|debug|erro|teste/] },
  { name: 'architect', intents: ['architecture'], patterns: [/arquitetura|sistema|trade.?off|escalavel/] },
  { name: 'teacher', intents: ['study', 'knowledge'], patterns: [/me ensine|aprender|estudar|explique/] },
  { name: 'designer', intents: ['canvas', 'design'], patterns: [/ux|interface|design|jornada|visual/] },
  { name: 'business', intents: ['business', 'roadmap', 'planner'], patterns: [/negocio|mercado|mvp|monetiz|produto/] },
  { name: 'researcher', intents: ['search'], patterns: [/pesquis|fontes|dados atuais|mercado/] }
];

export class ModeEngine {
  infer(input, intent, context) {
    const explicit = input.comparison.match(/modo (programador|arquiteto|professor|designer|negocios|pesquisador)/)?.[1];
    const aliases = { programador: 'programmer', arquiteto: 'architect', professor: 'teacher', designer: 'designer', negocios: 'business', pesquisador: 'researcher' };
    if (explicit) return { name: aliases[explicit], explicit: true, reason: 'solicitado pelo usuário' };
    const match = MODES.find(mode => mode.intents.includes(intent.name) || mode.patterns.some(pattern => pattern.test(input.comparison)));
    return {
      name: match?.name || context.mode || 'general',
      explicit: false,
      reason: match ? `inferido pela intenção ${intent.name}` : 'modo geral'
    };
  }
}
