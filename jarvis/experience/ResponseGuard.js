export class ResponseGuard {
  validate(content, conversation = {}) {
    const text = String(content || '').trim();
    const textWithoutUrls = text.replace(/https?:\/\/\S+/gi, '');
    const questionCount = (textWithoutUrls.match(/(?<=\S)\?(?=\s|$|["')\]])/g) || []).length;
    const maxQuestions = Number.isFinite(conversation.maxQuestions) ? conversation.maxQuestions : 1;
    const metaOnly = /^(escolha|qual caminho|como (voce )?quer|por onde (quer|comecamos)|vamos (explorar|comecar))/i.test(this.normalize(text));
    const missingDelivery = Boolean(conversation.mustDeliver) && (text.length < 120 || metaOnly);
    const reasons = [];
    if (questionCount > maxQuestions) reasons.push(`contém ${questionCount} perguntas; o máximo é ${maxQuestions}`);
    if (missingDelivery) reasons.push('não contém uma entrega concreta após a escolha do usuário');
    if (metaOnly) reasons.push('devolve ao usuário a decisão de como começar');
    return { valid: reasons.length === 0, reasons, questionCount, maxQuestions };
  }

  repairInstruction(validation, conversation = {}) {
    return `Reescreva a resposta anterior em português brasileiro. Comece entregando conteúdo concreto, use suposições razoáveis e não mencione esta instrução. ${conversation.mustDeliver ? 'O usuário já escolheu um caminho: produza a primeira versão agora. ' : ''}Faça no máximo ${validation.maxQuestions} pergunta${validation.maxQuestions === 1 ? '' : 's'}. Não ofereça formas de começar e não use listas de opções vagas.`;
  }

  normalize(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
