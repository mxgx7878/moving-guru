# Moving Guru — Member Portal

The web portal for **Moving Guru**, a marketplace connecting fitness/movement
instructors with studios. It provides separate, role-aware experiences for
**Instructors**, **Studios**, and **Admins** — including dashboards, job
listings and applications, messaging, reviews, subscriptions, and Stripe-based
payments.

Built as a single-page application with **React + Vite**.

---

## Tech Stack

| Area | Library |
| --- | --- |
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| State management | Redux Toolkit + React Redux |
| Forms & validation | React Hook Form + Yup |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Realtime | Laravel Echo + Pusher |
| Payments | Stripe (`@stripe/react-stripe-js`) |
| Charts | Recharts |
| Notifications | Sonner (toasts) |
| Icons | Lucide React |

---

## Prerequisites

- **Node.js 18 or newer** (Vite 5 requires Node 18+; Node 20 LTS recommended)
- **npm** (ships with Node)

Check your versions:

```bash
node -v
npm -v
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root. All variables are optional for the
app to boot, but the ones below are required for **payments** and **realtime
messaging** to work correctly:

```bash
# Stripe — required for checkout / payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# Pusher — required for realtime chat & notifications
VITE_PUSHER_APP_KEY=your_pusher_key
VITE_PUSHER_APP_CLUSTER=ap1
```

> **Note:** All variables must be prefixed with `VITE_` — Vite only exposes
> prefixed variables to the client. Never put secret/server keys here; only use
> publishable (public) keys.

#### Backend API URL

The backend API base URL is defined in
[`src/constants/apiConstants.js`](src/constants/apiConstants.js):

```js
export const BASE_URL = 'https://movingguru.co/moving-guru-backend/public/api';
```

To point the portal at a different backend (e.g. a local API), edit this value.

### 3. Start the development server

```bash
npm run dev
```

Vite prints a local URL (default **http://localhost:5173**). Open it in your
browser — the app hot-reloads as you edit files.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally to verify it |
| `npm run lint` | Run ESLint across the project |

### Production build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the built app locally
```

---

## Project Structure

```
moving-guru/
├── index.html                # App entry HTML
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind theme & tokens
├── postcss.config.js         # PostCSS (Tailwind/Autoprefixer)
├── vercel.json               # SPA rewrites for Vercel hosting
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Root component & route definitions
    ├── assets/               # Images / logos
    ├── components/           # Reusable UI (ui, layout, feedback, gates)
    ├── config/               # Axios, Pusher/Echo, portal config
    ├── constants/            # API, theme, and domain constants
    ├── data/                 # Static data (countries, disciplines)
    ├── features/             # Feature modules (jobs, billing, chat, …)
    ├── hooks/                # Custom React hooks
    ├── pages/                # Route pages (public, admin, studio, instructor)
    ├── services/             # Stripe / payments helpers
    ├── store/                # Redux store, slices, and actions
    ├── styles/               # Global CSS
    └── utils/                # Formatters, validators, helpers
```

---

## Deployment

The project includes a [`vercel.json`](vercel.json) with SPA rewrites, so it
deploys to **Vercel** out of the box:

1. Import the repository into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build` — Output directory: `dist`.
4. Add the environment variables from the [setup section](#2-configure-environment-variables)
   in the Vercel project settings.

The `vercel.json` rewrite ensures client-side routes resolve correctly on
refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Any static host works too — build with `npm run build` and serve the `dist/`
folder, ensuring all routes fall back to `index.html`.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Blank page / API errors | Confirm `BASE_URL` in `src/constants/apiConstants.js` points to a reachable backend. |
| Payments not loading | Set a valid `VITE_STRIPE_PUBLISHABLE_KEY` and restart the dev server. |
| Realtime chat not updating | Set `VITE_PUSHER_APP_KEY` / `VITE_PUSHER_APP_CLUSTER` to match the backend's Pusher app. |
| Env changes not applied | Restart `npm run dev` — Vite reads `.env` at startup. |
| Routes 404 on refresh in production | Ensure your host rewrites all paths to `index.html` (see `vercel.json`). |
