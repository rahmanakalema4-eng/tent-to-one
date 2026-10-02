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

The site can be deployed to Netlify as a static site. `netlify.toml` sets the build command to `npm run build`, publishes `dist`, and selects Node.js 24 for the build. The join and contact forms are registered with Netlify Forms and submit there in production; local development continues to use the Express API.

After the first deploy, open the site's Forms area in Netlify and confirm that `join-inquiry` and `contact-inquiry` are listed. Add an email notification for each form and set the destination to the Ten to One inbox. Submit a test from the deployed site and confirm it appears in Netlify and arrives by email. Netlify form submissions are managed in the Netlify dashboard, so the deployed static site does not need SQLite, a persistent disk, or the Resend API key.

For local development, the Express API still uses SQLite and Resend. Keep local secrets in `.env`; never put API credentials in frontend variables such as `VITE_*`.
