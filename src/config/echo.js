import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BASE_URL } from '../constants/apiConstants';

// laravel-echo's pusher connector expects Pusher on window.
window.Pusher = Pusher;

/**
 * Echo singleton.
 * -----------------------------------------------------------------
 * One socket connection per logged-in session. initEcho(token) is
 * idempotent for the same token; if the token changes (re-login as
 * someone else) the old connection is torn down and rebuilt so the
 * private-channel auth uses the fresh Bearer token.
 *
 * Private channels are authorised against POST
 * `${BASE_URL}/broadcasting/auth` which is guarded by auth:sanctum
 * on the backend (see bootstrap/app.php).
 */
let echoInstance = null;
let echoToken = null;

export function initEcho(token) {
  if (!token) return null;
  if (echoInstance && echoToken === token) return echoInstance;

  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  echoToken = token;
  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: true,
    authEndpoint: `${BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
}

export function getEcho() {
  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    echoToken = null;
  }
}