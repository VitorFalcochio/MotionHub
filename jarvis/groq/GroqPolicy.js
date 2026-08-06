const COMPLEX_MARKERS = /analise profundamente|detalhad[oa]|complet[oa]|compare varias|estrategia completa|alta escala|enterprise|documento|artigo|proposta comercial|copy longa/;

export class GroqPolicy {
  evaluate({ input, intent, localResult }) {
    if (localResult?.needsGroq) return { useGroq: true, reason: localResult.groqReason || 'skill solicitou especialização' };
    if (input.text.length > 900 || input.tokens.length > 140) return { useGroq: true, reason: 'entrada extensa' };
    if (COMPLEX_MARKERS.test(input.comparison)) return { useGroq: true, reason: 'análise complexa solicitada' };
    if (!localResult && intent.confidence < 0.5) return { useGroq: true, reason: 'intenção aberta sem resposta local confiável' };
    return { useGroq: false, reason: 'resolvido pelo cérebro local' };
  }
}
