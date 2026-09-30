# Participant authentication

## Client setup

Copy root `.env.example` to `.env.local`, supply the authorized Supabase URL and public anon/publishable key, and restart the development server. These are client configuration values; service credentials must never be exposed through `VITE_` variables.

The current integration uses the authorized ECC staging project. Root `supabase/config.toml` declares invitation-only signup, a 12-character password policy, and exact local callback URLs on localhost/127.0.0.1 ports 5173 and 4173. Before deploying, configure the actual HTTPS site origin and callback URLs in the appropriate project.

## Account flow

ECC creates invitations through Supabase Auth administration with `/auth/accept-invite` as the redirect. Participants set a password, then enter their individual journey. Recovery redirects to `/auth/reset-password`; normal login is `/login`.

Callbacks support Supabase token fragments, token hashes, and authorization codes. Credentials are removed from the browser address immediately. Password setup requires a valid session and an unexpired link belonging to that account. Reused links cannot change a password.

Public signup is disabled. Authenticated participants cannot grant themselves staff access. Mentor and Admin simulations exist only under `/demo`; production staff authorization requires an authoritative identity and membership contract.

## Learning state

Authentication is real; XP, submissions, reviews, selection, and schedules remain simulated. Progress is stored locally in separate demo and participant scopes; file evidence uses browser IndexedDB. No simulated submission is uploaded to Supabase Storage.

The existing schema includes profiles, enrollments, activity ledger, quests, stages, versioned submissions, and assignment tables. Authoritative review/selection workflows, award source IDs, role mapping, and ownership still need confirmation before production progress integration. No database migration is implied by this auth setup.

## Verification utilities

Focused local checks are `scripts/check-auth-boundaries.ts` and `scripts/check-experience.ts`. Browser checks use the existing agent-browser session's local CDP URL through `FQ_BROWSER_CDP`; see `scripts/check-game-browser.mjs` and `scripts/check-journey-browser.mjs`.

The staging-only helper `scripts/check-staging-auth.mjs` supports `smoke`, `prepare`, `recovery`, `verify-login`, and `cleanup`. Lifecycle checks create a synthetic `example.invalid` account through `generateLink`, without sending email. They require privately supplied administrative credentials and create ignored fixtures under `.scratch/`. Always finish with `cleanup`. Never use real participant accounts for development verification or commit fixture credentials.
