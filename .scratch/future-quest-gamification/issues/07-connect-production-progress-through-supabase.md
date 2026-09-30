# Connect verified progress and stage access through Supabase

Status: needs-info

Implementation: deferred production phase; requires the contracts listed below.

Spec: `../spec.md`

## Goal

Replace prototype-only progress and access state with authoritative production data after the app's backend contracts are available.

## Acceptance criteria

- Quiz XP is awarded once from the first valid submitted attempt; mission XP once from the first accepted submission.
- The quality bonus is awarded once after final Mentor review when the evidence-quality criterion is at least 80% of its configured maximum.
- XP awards are duplicate-safe and never affect selection scores or stage access.
- A stage opens only after the published selection decision and scheduled opening time; non-advancers retain read-only access to previously available work.
- Future Passport and stage scenes read the same authoritative Participant state.
- Remove the prototype demo label only after the corresponding values are backed by production records.

## Needed

- Confirm which Supabase project is intended for production and provide active access. The authenticated CLI account currently lists `ecc-future-quest-staging` (`gzyqpvihvqgxttpshmde`) and `ecc-future-quest-production` (`ksosknxddshnrtczxtmd`); both report `INACTIVE`, and neither is named exactly `ecc`.
- Confirmed integration contracts for quiz attempts, accepted missions, final rubric results, selection decisions, and scheduled stage openings.
- A production owner for the XP ledger and stage-access decision.
- Confirmation that the current Supabase schema/services expose those authoritative sources. The existing helper inspected for this plan only handles file uploads.

## Sequence

This is a later phase. Keep the first playable prototype on mock data until the needed contracts are available.

## Comments

Repository and CLI review on 2026-09-30 found an authenticated Supabase CLI session via `npx supabase`, but no `supabase/` project configuration or migrations in this checkout. The CLI lists the two projects above and reports both as `INACTIVE`; only project metadata was inspected, and no remote schema inspection was attempted. The local SQL draft has submissions, reviews, selection runs/candidates, and stage `opens_at`, but it does not define quiz attempts or an XP ledger, and does not fully specify the acceptance/review/access workflows. The application helper only uploads files to Supabase Storage. Production project access, the remaining authoritative contracts, and the production owner are still missing, so implementation remains deferred and `needs-info`. No remote project was modified or reactivated.
