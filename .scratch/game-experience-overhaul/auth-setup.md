# Authentication setup and verified boundaries

Target: ECC staging, gzyqpvihvqgxttpshmde. Production is currently inactive and has no deployment origin available to configure. The active worktree contains .env.local with only client URL and anon key; it is ignored. .env.example documents the public variables.

Supabase config diff was inspected before pushing. Only three declared properties changed: invitation-only signup, local site URL, and exact local invitation/recovery/callback redirects on localhost and 127.0.0.1 ports 5173 and 4173. The existing 12-character password policy and all undeclared settings were preserved. See supabase/config.toml. Deployment must add the actual HTTPS origins before sending production account links; no guessed deployment hostname was added.

ECC can invite participant accounts through its Supabase Auth administration, using an approved /auth/accept-invite redirect. The client provides no signup method. Recovery uses /auth/reset-password. Both standard token fragments and token_hash callbacks are supported; callback credentials are stripped before asynchronous work. Password-link ownership and expiry are checked before displaying a writable setup form.

Authoritative membership/role provisioning remains a separate contract: the exposed schema has profiles and enrollments (see evidence/02-schema-contract.json), but this implementation does not assume profiles.id is an auth.users identity or trust user metadata as a staff role. Signed-in accounts receive participant-only UI. Mentor/Admin simulations are confined to the visitor demo. No database migration was needed for these boundaries.

Authentication is real. Learning progress, XP, submissions, reviews, and access are still simulated until original gamification ticket 07. Configuring auth must not automatically persist demo submissions to Supabase Storage.

Verification commands:

- bun scripts/check-auth-boundaries.ts
- node .scratch/game-experience-overhaul/auth-check.mjs smoke
- Staging lifecycle checks use prepare, recovery, verify-login, cleanup. They use a generated example.invalid account and generateLink rather than sending emails. A service credential must be supplied through SUPABASE_SERVICE_ROLE_KEY or the temporary credential file outside the workspace; it is never part of the app or evidence.

Browser evidence covers activation, invalid credentials, session reload, staff-picker absence, logout/protected access, password mismatch, recovery success, consumed link rejection, and neutral reset confirmation. A premature automatic redirect on the account page discarded recovery feedback; returning sessions now receive an explicit Continue action while normal login navigates on success.
