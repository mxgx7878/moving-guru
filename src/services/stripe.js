import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export function loadStripeOnce() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
             || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}