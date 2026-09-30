# Invited participant authentication

Status: resolved
Blocked by: 01
Spec: ../spec.md

## Deliver

Use the authorized ECC Supabase CLI project to establish the existing auth configuration and membership contract. Reuse src/lib/supabase.ts where appropriate. Implement email/password login, invitation acceptance/password setup, reset request and recovery, session restoration, and logout. Supply a safe environment example with variable names only.

## Acceptance

- No public self-registration. Invalid credentials, expired links, loading, and recovery success have clear UI states.
- Reload restores the session; logout clears authenticated UI and prevents back navigation exposing restricted views.
- Account redirects are explicitly configured for local development and reviewed deployment origins.
- Client uses only publishable/anon credentials. Staff authorization never comes from a user-editable role dropdown.
- Existing database/profile assumptions are inspected before any migration; document missing contracts concretely.
- Verify auth using an authorized development account or local setup; do not send invitations to other people.
- Keep verified learning persistence deferred to original gamification ticket 07.

## Implementation evidence

- Added real staging email/password auth, one-use invitation/recovery callbacks, password setup, reset request, restored sessions, logout, protected participant entry, and explicit continuing-session action.
- Configured only staging auth site URL, exact callback redirects, and invitation-only signup after inspecting config diff. Existing password policy and undeclared settings remain unchanged. See ../auth-setup.md and root supabase/config.toml.
- Participant accounts cannot select staff roles. Existing profiles/enrollments were inspected without reading participant records; no identity/role mapping or migration was invented. Staff simulations remain inside demo access.
- Browser exercised a generated example.invalid account: invitation activation, invalid credentials, correct login, reload, logout and protected-route rejection, password mismatch, recovery update and success guidance, login with recovered password, consumed-link rejection, and neutral reset confirmation. No email invitations were sent. Synthetic account and temporary service credential were deleted.
- Fixed account redirects that raced session updates. Login now waits for its successful session before entering the protected route; recovery feedback remains on Login.
- Evidence: ../evidence/02-login-desktop.png, 02-login-mobile.png, 02-recovery-success.png, 02-participant-session.png, and 02-schema-contract.json.
- bun scripts/check-auth-boundaries.ts passed; staging server rejected direct public signup; final bun run build passed.
