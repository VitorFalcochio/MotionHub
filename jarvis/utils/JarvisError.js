export class JarvisError extends Error {
  constructor(message, { code = 'unknown', recoverable = true, userMessage = '', cause = null } = {}) {
    super(message, { cause });
    this.name = 'JarvisError';
    this.code = code;
    this.recoverable = recoverable;
    this.userMessage = userMessage || message;
  }
}

export function abortIfNeeded(signal) {
  if (signal?.aborted) throw new DOMException('Operação cancelada.', 'AbortError');
}
