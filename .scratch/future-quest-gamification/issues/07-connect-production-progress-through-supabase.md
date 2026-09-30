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

- Confirm the production project and owner for the XP ledger and stage-access decision. The user authorized using `ecc-future-quest-staging` (`gzyqpvihvqgxttpshmde`), which is now active; `ecc-future-quest-production` (`ksosknxddshnrtczxtmd`) still reports `INACTIVE`.
- Confirm what `submission_status.validated` means for quiz validity and mission acceptance, and which ID identifies the once-only award source.
- Identify the authoritative final review/rubric and published stage-selection records. The staging schema has no dedicated tables for these workflows; stage rows do have `opens_at` and `selection_cutoff_at`.
- Confirm the server-side writer/owner for `activity_ledger`. It has a unique key on `(enrollment_id, event_type, source_id)` and a participant read-own policy, but no gamification function or deployed Edge Function.
- The existing app helper only uploads files to Supabase Storage.

## Sequence

This is a later phase. Keep the first playable prototype on mock data until the needed contracts are available.

## Comments

Repository and Supabase review on 2026-09-30: the user authorized use of the existing project. The staging project was resumed in Supabase Studio; `npx supabase projects list` now reports it as `ACTIVE_HEALTHY`. The production project remains `INACTIVE`. Read-only metadata queries found public tables `activity_ledger`, `audit_logs`, `enrollments`, `jury_assignments`, `mentor_assignments`, `paths`, `profiles`, `quests`, `stages`, `submission_versions`, and `submissions`. `activity_ledger` stores `event_type`, `source_id`, `points`, and optional `reversal_of`, with uniqueness on `(enrollment_id, event_type, source_id)`; RLS lets participants read their own ledger rows. This can prevent duplicate identical event/source awards, but the contract does not define which stable source ID or event type to use for each approved award. Enums are `submission_status` (`draft`, `submitted`, `changes_requested`, `validated`), `quest_kind` (`quiz`, `mission`), and enrollment states (`active`, `eliminated`, `finalist`, `withdrawn`, `disqualified`). `stages` includes `opens_at`, `review_due_at`, and `selection_cutoff_at`; `quests` includes `max_attempts`; versioned submissions have JSON payloads and workflow state. No dedicated quiz-attempt, final-review/rubric, or published-selection records were found. The public database functions are unrelated account/session helpers, there are no public triggers, and `npx supabase functions list --project-ref gzyqpvihvqgxttpshmde` returned no deployed Edge Functions. The app helper still only uploads files to Storage. No database schema or records were changed; only the user-authorized staging resume was applied. Production ownership and the missing workflow/status contracts remain open, so implementation is deferred and status stays `needs-info`.
