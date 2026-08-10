import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BASE_URL } from '../constants/apiConstants';

window.Pusher = Pusher;

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
    key: import.meta.env.VITE_PUSHER_APP_KEY || 'b639deeddd4986f367ac',
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
