// Stubbed payment gateway. Every call resolves after a short delay, simulating
// a successful charge. When Stripe / whichever processor is wired up, replace
// the body of processPayment() — callers stay the same.

export const PAYMENT_STATUS = {
  IDLE:    'idle',
  WORKING: 'working',
  SUCCESS: 'success',
  FAILED:  'failed',
};

/**
 * Process a payment for a given reason + amount (USD).
 *
 * @param {Object} opts
 * @param {'grow_post'|'grow_boost'} opts.kind - what the payment is for
 * @param {number} opts.amount - USD, major units
 * @param {Object} [opts.meta]  - free-form metadata (post id, duration, etc.)
 * @returns {Promise<{ ok: true, receipt: string } | { ok: false, error: string }>}
 */
export async function processPayment({ kind, amount, meta = {} }) {
  // TODO: swap this block for the real Stripe (or other) PaymentIntent call.
  // For now, simulate a ~1s processing delay and return success.
  await new Promise((r) => setTimeout(r, 900));

  // Very light dev-mode check so missing args surface quickly.
  if (!kind || !amount || amount < 0) {
    return { ok: false, error: 'Invalid payment request.' };
  }

  return {
    ok: true,
    receipt: `STUB_${kind.toUpperCase()}_${Date.now()}`,
    kind,
    amount,
    meta,
  };
}