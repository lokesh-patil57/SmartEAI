<div >
  <br />
      <img src="client/public/SmrtEAI.avif" alt="Project Banner">
  <br />
 </div>

## Google OAuth setup

- Add your Google web client ID to `client/.env` as `VITE_GOOGLE_CLIENT_ID`.
- Add the same client ID to `server/.env` as `GOOGLE_CLIENT_ID`.
- Optional: set `GOOGLE_CLIENT_IDS` on the server with a comma-separated list if you use different client IDs across environments.
- In Google Cloud Console, add your frontend origin (for example `http://localhost:5173`) under Authorized JavaScript origins.
- Restart both the client and server after updating environment variables.
