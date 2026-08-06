export class LocalBrain {
  async reason({ input, intent, knowledge, skill, runtime }) {
    if (skill) return skill;
    if (knowledge) return { response: knowledge.response, source: 'knowledge' };

    const local = runtime.hub?.execute
      ? await runtime.hub.execute({ type: 'legacy-command', text: input.text })
      : await runtime.localExecutor?.(input.text);
    if (local?.handled) return { response: local.response, source: 'local' };

    if (/^(que horas sao|qual a hora|horas)[?]?$/.test(input.comparison)) {
      return { response: `Agora são **${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}**.`, source: 'local' };
    }
    if (/^(que dia e hoje|qual a data de hoje|data de hoje)[?]?$/.test(input.comparison)) {
      return { response: `Hoje é **${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}**.`, source: 'local' };
    }

    if (/modo (programador|arquiteto|professor|designer|negocios|pesquisador)/.test(input.comparison)) {
      const labels = { programmer: 'Programador', architect: 'Arquiteto', teacher: 'Professor', designer: 'Designer', business: 'Negócios', researcher: 'Pesquisador' };
      return { response: `Modo **${labels[runtime.mode?.name] || runtime.mode?.name || 'geral'}** ativo nesta conversa. Vou adaptar profundidade, representação e próximos passos ao trabalho atual.`, source: 'local' };
    }

    const calculation = input.comparison.match(/^(?:quanto e|calcule|calcular)?\s*(-?\d+(?:[.,]\d+)?)\s*([+\-*/x])\s*(-?\d+(?:[.,]\d+)?)[?]?$/);
    if (calculation) {
      const left = Number(calculation[1].replace(',', '.'));
      const right = Number(calculation[3].replace(',', '.'));
      const operations = { '+': () => left + right, '-': () => left - right, '*': () => left * right, 'x': () => left * right, '/': () => right === 0 ? NaN : left / right };
      const result = operations[calculation[2]]();
      return { response: Number.isFinite(result) ? `O resultado é **${result.toLocaleString('pt-BR')}**.` : 'Não é possível dividir por zero.', source: 'local' };
    }

    if (intent.name === 'search') {
      return { response: 'Essa solicitação depende de informação externa e atual. Posso encaminhá-la para pesquisa web quando a integração estiver disponível.', source: 'local', needsGroq: false };
    }
    return null;
  }
}
