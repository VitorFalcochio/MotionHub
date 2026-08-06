const HIGH_RISK = new Set(['delete', 'publish', 'send', 'payment', 'permission']);
const MEDIUM_RISK = new Set(['bulk-update', 'share', 'automation-enable']);

export class ActionPolicy {
  apply(action) {
    const risk = HIGH_RISK.has(action.type) ? 'high' : MEDIUM_RISK.has(action.type) ? 'medium' : action.risk || 'low';
    return {
      ...action,
      risk,
      requiresConfirmation: risk !== 'low' || Boolean(action.requiresConfirmation),
      autoExecute: risk === 'low' && Boolean(action.autoExecute)
    };
  }
}
