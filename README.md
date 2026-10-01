# Ten to One Youth Club

Website for the Ten to One Youth Club, built with React, Vite, and plain CSS. The Join and Contact forms use a small Node API for inquiry handling.

## Requirements

- Node.js 24 or newer (the API uses Node's built-in SQLite module)
- npm

## Local Development

```sh
npm install
```

Copy `.env.example` to `.env`, then set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. The sender address must be verified with Resend. `CONTACT_TO_EMAIL` defaults to `tentoone00@gmail.com`.

On PowerShell, create the local environment file with:

```powershell
Copy-Item .env.example .env
```

Start the frontend and API together:

```sh
npm run dev
```

The Vite server proxies `/api` requests to the local API on port 3001. Set `API_TARGET` if the API runs elsewhere.

## Forms and API

Both forms post to `POST /api/inquiries`. Supported request types are membership, project contribution, partnership/resources, and general contact. Valid submissions are stored in SQLite and emailed through Resend, with the submitter's address set as the reply-to. The API includes validation, consent enforcement, a honeypot, and a per-IP rate limit. It does not process monetary donations.

If email delivery fails, the request remains stored with its delivery status and the form reports that it was not emailed. The local database is created under `data/` by default and is ignored by Git.

## Checks

```sh
npm test
npm run lint
npm run build
node scripts/check-contrast.mjs
```

## Deployment

Build the frontend with `npm run build`, then run the API with `NODE_ENV=production npm start`. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `ALLOWED_ORIGIN`, `DATABASE_PATH`, and `TRUST_PROXY_HOPS` in the host's environment settings. Keep API credentials server-side; never use a `VITE_` variable for secrets.

The API requires a Node host with persistent disk storage for SQLite and is intended to run as a single instance. Ephemeral serverless filesystems or multiple API instances require moving inquiry storage to a managed database.
