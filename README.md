<div >
  <br />
      <img src="client/public/SmrtEAI.avif" alt="Project Banner">
  <br />
 </div>

## Local setup

- Client env: copy `client/.env.example` to `client/.env`.
- Server env: copy `server/.env.example` to `server/.env`.
- Install dependencies in each app and start both services.

## Deploy frontend on Vercel

1. Import this repository in Vercel.
2. Set **Root Directory** to `client`.
3. Keep build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
4. Add environment variables in Vercel project settings:
  - `VITE_API_BASE=https://<your-render-service>.onrender.com`
  - `VITE_GOOGLE_CLIENT_ID=<your-google-web-client-id>`
5. Redeploy.

`client/vercel.json` is included to rewrite all SPA routes to `index.html`.

## Deploy backend on Render

### Option A: Blueprint (recommended)

1. In Render, create a new **Blueprint** from this repo.
2. Render will pick up `render.yaml` and create service `smarteai-server`.
3. Set secret env vars when prompted:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `GEMINI_API_KEY`
  - `GOOGLE_CLIENT_ID`
  - `CORS_ORIGIN` (your Vercel URL, comma-separated if multiple)

### Option B: Manual Web Service

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

## Google OAuth setup

- Add your Google web client ID to Vercel (`VITE_GOOGLE_CLIENT_ID`) and Render (`GOOGLE_CLIENT_ID`).
- Optional: use `GOOGLE_CLIENT_IDS` on server with comma-separated IDs for multi-env setups.
- In Google Cloud Console, add Authorized JavaScript origins:
  - local: `http://localhost:5173`
  - production: `https://<your-vercel-domain>`

## Environment templates

- `client/.env.example`
- `server/.env.example`

Copy these files and set real values per environment.
