# Invited participant authentication

Status: claimed
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
