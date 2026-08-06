const ABBREVIATIONS = new Map([
  ['vc', 'voce'], ['vcs', 'voces'], ['tb', 'tambem'], ['tbm', 'tambem'],
  ['blz', 'beleza'], ['obg', 'obrigado'], ['vlw', 'valeu'], ['q', 'que'],
  ['pq', 'porque'], ['msg', 'mensagem'], ['hj', 'hoje'], ['agr', 'agora'],
  ['nd', 'nada'], ['pf', 'por favor'], ['pfv', 'por favor']
]);

function stripAccents(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function reduceElongation(word) {
  if (/^(www|http)/i.test(word)) return word;
  return word.replace(/([a-zA-ZÀ-ÿ])\1{2,}/g, '$1');
}

export class InputNormalizer {
  normalize(input) {
    const raw = String(input ?? '').trim();
    const cleaned = raw
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/([!?.,])\1+/g, '$1')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(reduceElongation)
      .join(' ')
      .trim();
    const comparison = stripAccents(cleaned.toLocaleLowerCase('pt-BR'))
      .replace(/[^a-z0-9@._:/+\-\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(token => ABBREVIATIONS.get(token) || token)
      .join(' ');

    return { raw, text: cleaned, comparison, tokens: comparison.split(' ').filter(Boolean) };
  }
}
