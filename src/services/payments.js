export const PAYMENT_STATUS = {
  IDLE:    'idle',
  WORKING: 'working',
  SUCCESS: 'success',
  FAILED:  'failed',
};

export async function processPayment({ kind, amount, meta = {} }) {
  await new Promise((r) => setTimeout(r, 900));

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
