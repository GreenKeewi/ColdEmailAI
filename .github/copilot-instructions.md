<!-- .github/copilot-instructions.md -->
# Copilot / AI agent instructions — ColdEmail.AI (concise)

This file contains targeted, repo-specific guidance for AI coding agents to be immediately productive.

- Repo type: Next.js 14 (App Router) fullstack app with server components and server-only API routes under `src/app/api`.
- Auth: Clerk for user sessions (server-side via `@clerk/nextjs/server`).
- DB & storage: Supabase (client `supabase` and server `supabaseAdmin` in `src/lib/supabase.ts`).
- AI providers: OpenAI or Anthropic. Code paths: `src/lib/ai.ts` and `docs/ai-prompts.md`.
- Email integrations: Gmail OAuth (server helpers in `src/lib/gmail.ts`, routes under `src/app/api/auth/gmail`), SendGrid helper in `src/lib/sendgrid.ts` and webhook at `/api/webhooks/sendgrid`.

Essential patterns and conventions
- Server vs client: Anything under `src/app/api/**` and `src/lib/**` is server-side. Use `supabaseAdmin` for privileged DB writes and `supabase` (anon) for browser interactions.
- Auth checks: Use `auth()` or `auth as clerkAuth()` from `@clerk/nextjs/server` (see `src/lib/auth.ts`). API routes rely on Clerk server auth — return 401/404 via `NextResponse` where appropriate.
-- Env-driven behavior: AI provider selected with `AI_PROVIDER` env var. Supported values: `openai`, `anthropic`, and `github` (development). Required secrets are listed in `.env.example` (Gmail, Clerk, Supabase, OPENAI/ANTHROPIC, SENDGRID, ENCRYPTION_KEY). For GitHub models set `GITHUB_MODELS_KEY` and optionally `GITHUB_MODELS_API_URL` / `GITHUB_MODEL_NAME`.
- Token storage: Gmail refresh tokens are encrypted (AES-256-GCM) and stored in `settings.gmail_refresh_token` (see `src/lib/gmail.ts` + `src/lib/encryption.ts`). Don't leak plaintext tokens.
- Email sending flow:
  - Gmail: `getGmailAuthUrl(userId)` -> OAuth callback `src/app/api/auth/gmail/callback/route.ts` -> `storeGmailTokens` persists encrypted token.
  - Sending: `sendGmailEmail(userId, to, subject, body)` returns Gmail message id. For fallback, `sendSendGridEmail(params)` returns SendGrid message id.
- Tracking: SendGrid tracking helpers `generateTrackingPixel` and `wrapLinksForTracking` are used before sending. Tracking endpoints are under `src/app/api/track` (e.g., `/api/track/open/:id`).

Developer workflows (explicit)
- Local dev: copy `.env.example` to `.env.local`, fill values. Start dev server:
  - npm install
  - cp .env.example .env.local
  - npm run dev
- Migrations: SQL files are in `migrations/` — run manually in Supabase SQL editor or `npx supabase db push` if you use the CLI. There's a helper script `npm run migrate` that prints info.
- Tests & lint: `npm test` (Jest), `npm run lint`.
- Background jobs: project includes `bullmq` and `ioredis` in dependencies. REDIS_URL may be required for job workers.

Code edit and review tips (practical examples)
- When modifying auth flows, update both `src/lib/auth.ts` and any API routes that call `auth()` (search for `clerk/nextjs/server`).
- To change AI prompts, edit `src/lib/ai.ts` and `docs/ai-prompts.md`. Keep prompt templates and token usage small and test with a single lead via the preview endpoint (`POST /api/campaigns/:id/preview`).
- When adding new server-side DB writes, prefer `supabaseAdmin` to avoid RLS issues (see types in `src/lib/supabase.ts`).
- For Gmail OAuth fixes, confirm redirect URL matches `GMAIL_REDIRECT_URI` in `.env.local` and Google Console; check `src/app/api/auth/gmail/route.ts` and `callback/route.ts` for flow.

Where to look for examples
- OAuth + token storage: `src/lib/gmail.ts` and `src/app/api/auth/gmail/*` routes.
- Email sending & tracking: `src/lib/gmail.ts`, `src/lib/sendgrid.ts`, and `/api/webhooks/sendgrid` (see docs and routes in `src/app/api`).
- DB shapes & types: `src/lib/supabase.ts` (Database type definitions) and `migrations/` SQL.
- AI & prompts: `src/lib/ai.ts` and `docs/ai-prompts.md`.

Safety and non-functional notes
- Secrets: never output or commit plain API keys or `ENCRYPTION_KEY`. Use values from `.env.local` only.
- Sensitive operations: token encryption/decryption is centralized in `src/lib/encryption.ts`. Reuse it rather than duplicating crypto logic.
- Production deploy: Vercel env vars must match `.env.example` keys; update Google OAuth redirect URIs to production domain.

If anything in this summary is unclear or you want me to expand sections (examples, common PR changes, or small code edits), tell me which area and I will iterate.
