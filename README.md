
## Live Inquiries

The Join and Contact forms post to the Node API at `/api/inquiries`. The API validates requests, stores them in SQLite, and emails the team using Resend. It requires Node 24 or newer for the built-in SQLite module.

1. Copy `.env.example` to `.env`.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. The sender address must be verified in Resend; `CONTACT_TO_EMAIL` defaults to `tentoone00@gmail.com`.
3. Keep `.env` private. Do not put provider credentials in frontend variables or commit them.
4. Run `npm run dev` to start the Vite frontend and API together. Run `npm test` for API tests.
5. For deployment, build with `npm run build`, then run `npm start` with `NODE_ENV=production`. Use a Node host with persistent disk storage for `DATABASE_PATH`; SQLite data is stored locally and does not suit ephemeral filesystems or multiple API instances.

Set `ALLOWED_ORIGIN` to the exact deployed site origin and `TRUST_PROXY_HOPS` to the number of trusted reverse proxies in front of the app. The API records inquiry details only after submission, stores email delivery status, and applies a honeypot and per-IP rate limit. Monetary donations are not processed by these forms.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
