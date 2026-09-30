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
- Confirmed integration contracts for quiz attempts, accepted missions, final rubric results, selection decisions, and scheduled stage openings.
- Confirmation of the authoritative status semantics and data source. The staging schema has submission versions and stage schedule fields, but no dedicated quiz-attempt, final-review, published-selection, or XP-ledger tables. The existing app helper only uploads files to Supabase Storage.

## Sequence

This is a later phase. Keep the first playable prototype on mock data until the needed contracts are available.

## Comments

Repository and Supabase review on 2026-09-30: the user authorized use of the existing project. The staging project was resumed in Supabase Studio; `npx supabase projects list` now reports it as `ACTIVE_HEALTHY`. The production project remains `INACTIVE`. A read-only schema visualizer review showed public tables `profiles`, `paths`, `stages`, `enrollments`, `quests`, `submissions`, `submission_versions`, `audit_logs`, and `mentor_assignments`. `stages` has open/review/cutoff timestamps; `quests` has kind and max-attempt fields; `submissions` and `submission_versions` carry workflow/version state. There are no dedicated quiz-attempt, review/rubric, published-selection, or XP-ledger tables. Submission versions may hold retries, but the authoritative rules for first valid quiz attempts, mission acceptance, final review, published results, and access decisions are not defined. The app helper still only handles Storage uploads. No application schema, database records, or production project were changed. Production access/ownership and the missing workflow contracts remain open, so implementation is deferred and status stays `needs-info`.
