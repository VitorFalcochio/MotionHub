const DELEGATED_THINKING = /nao (sei|pensei|tenho ideia)|decida (por mim|voce)|pode escolher|me (ajude|guie)|comece por mim|sugira voce/;
const EXPLICIT_CHOICE = /quais (opcoes|caminhos|alternativas)|me de opcoes|mostre (as )?opcoes|(?:quero )?escolher entre|escolha entre|compare (as|os|estas|estes)|qual opcao/;
const VAGUE_OPTION = /^(vamos |quero |comecar|continuar|explorar|pensar|brainstorm|me ajude|proximo passo)/;

export class ConversationPolicy {
  decide({ input, intent, context, social, localResult }) {
    const interaction = context.interaction || {};
    const mustDeliver = Boolean(interaction.mustDeliver);
    const blockingQuestion = localResult?.status === 'needs_input' || this.looksLikeBlockingQuestion(localResult?.response);
    let strategy = 'answer';

    if (social) strategy = 'answer';
    else if (intent.name === 'system' && localResult?.response) strategy = blockingQuestion ? 'clarify' : 'act';
    else if (blockingQuestion) strategy = 'clarify';

    const delegatedThinking = DELEGATED_THINKING.test(input.comparison);
    const explicitChoiceRequest = EXPLICIT_CHOICE.test(input.comparison);
    const cooldown = Number(interaction.choiceCooldown || 0);

    return {
      strategy,
      answerFirst: true,
      mustDeliver,
      maxQuestions: mustDeliver && !blockingQuestion ? 0 : 1,
      allowChoices: !mustDeliver && cooldown === 0 && explicitChoiceRequest && !delegatedThinking,
      choiceReason: mustDeliver
        ? 'uma escolha anterior precisa gerar uma entrega concreta'
        : cooldown > 0
          ? 'seletor em período de resfriamento'
          : delegatedThinking
            ? 'o usuário delegou o trabalho de pensar ao Jarvis'
            : explicitChoiceRequest
              ? 'o usuário pediu alternativas materiais'
              : 'não existe pedido explícito por alternativas',
      delegatedThinking
    };
  }

  validateChoices(args = {}, interaction = {}) {
    const policy = interaction.currentPolicy || {};
    if (!policy.allowChoices || interaction.mustDeliver || interaction.choiceCooldown > 0 || interaction.choiceOffered) {
      return { allowed: false, reason: policy.choiceReason || 'a política exige uma resposta concreta agora' };
    }
    const options = (args.options || []).filter(option => option?.label && option?.prompt);
    if (options.length < 2 || options.length > 4) return { allowed: false, reason: 'o seletor precisa de duas a quatro decisões reais' };
    const normalized = options.map(option => this.normalize(option.label));
    if (normalized.some(label => VAGUE_OPTION.test(label))) return { allowed: false, reason: 'as opções descrevem etapas vagas em vez de decisões reais' };
    if (new Set(normalized).size !== normalized.length) return { allowed: false, reason: 'as opções não são materialmente diferentes' };
    return { allowed: true, reason: 'há alternativas materiais solicitadas pelo usuário' };
  }

  looksLikeBlockingQuestion(response = '') {
    return /(?:qual|quais|o que|onde|quando|quanto|confirma|pode informar)[^.!]{0,160}\?\s*$/i.test(String(response));
  }

  normalize(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
