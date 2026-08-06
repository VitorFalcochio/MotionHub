const GROUPS = [
  {
    id: 'greeting',
    patterns: [/^(oi|ola|e ai|fala|salve|bom dia|boa tarde|boa noite)( jarvis)?[.!?]?$/],
    starts: ['Olá', 'Oi', 'Estou por aqui', 'Pronto para ajudar'],
    ends: ['O que vamos resolver?', 'Em que posso trabalhar com você?', 'Qual é a prioridade agora?', 'Por onde começamos?']
  },
  {
    id: 'wellbeing',
    patterns: [/^(tudo bem|como voce esta|como vai|ta tudo bem)( por ai)?[.!?]?$/],
    starts: ['Tudo certo por aqui', 'Estou funcionando normalmente', 'Tudo em ordem'],
    ends: ['E com você?', 'Como posso ajudar agora?', 'Qual assunto está na sua cabeça?']
  },
  {
    id: 'thanks',
    patterns: [/^(obrigado|obrigada|valeu|agradecido|muito obrigado)( jarvis)?[.!?]?$/],
    starts: ['Por nada', 'Disponha', 'Pode contar comigo', 'Fechado'],
    ends: ['Seguimos.', 'Quando precisar, estou aqui.', 'Vamos para o próximo passo.', 'É só chamar.']
  },
  {
    id: 'farewell',
    patterns: [/^(tchau|ate mais|ate logo|falou|vou nessa|boa noite)( jarvis)?[.!?]?$/],
    starts: ['Até mais', 'Combinado', 'Falou', 'Nos vemos'],
    ends: ['Bom trabalho por aí.', 'Retomamos quando quiser.', 'Até a próxima.', 'Deixo tudo pronto para a volta.']
  },
  {
    id: 'identity',
    patterns: [/^(quem e voce|o que voce e|se apresente)[.!?]?$/],
    starts: ['Sou o Jarvis do Motion Hub', 'Eu sou o assistente do seu Motion Hub'],
    ends: ['Uso um cérebro local para contexto e ações, recorrendo ao Groq apenas em tarefas complexas.', 'Organizo contexto, conhecimento e skills locais antes de consultar o Groq.']
  },
  {
    id: 'confirmation',
    patterns: [/^(sim|certo|ok|beleza|perfeito|confirmo|pode ser|combinado)[.!?]?$/],
    starts: ['Certo', 'Entendido', 'Combinado', 'Perfeito'],
    ends: ['Vou manter isso no contexto.', 'Seguimos com esse caminho.', 'Pode mandar o próximo passo.']
  },
  {
    id: 'negative',
    patterns: [/^(nao|negativo|deixa|cancela|melhor nao|agora nao)[.!?]?$/],
    starts: ['Entendido', 'Tudo bem', 'Certo'],
    ends: ['Não vou seguir com isso.', 'Descarto esse caminho.', 'Fico aguardando outra direção.']
  }
];

export class SocialEngine {
  constructor(random = Math.random) {
    this.random = random;
    this.lastByGroup = new Map();
  }

  match(input) {
    const group = GROUPS.find(item => item.patterns.some(pattern => pattern.test(input.comparison)));
    if (!group) return null;
    const transitions = ['', 'Certo.', 'Vamos lá.'];
    const combinations = group.starts.flatMap(start => group.ends.flatMap(end =>
      transitions.map(transition => `${start}. ${transition ? `${transition} ` : ''}${end}`)
    ));
    const previous = this.lastByGroup.get(group.id);
    const available = combinations.filter(item => item !== previous);
    const response = available[Math.floor(this.random() * available.length)] || combinations[0];
    this.lastByGroup.set(group.id, response);
    return { type: group.id, response, confidence: 1 };
  }
}
