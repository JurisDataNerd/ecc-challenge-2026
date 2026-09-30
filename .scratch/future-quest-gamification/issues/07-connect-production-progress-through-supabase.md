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

- Confirmed integration contracts for quiz attempts, accepted missions, final rubric results, selection decisions, and scheduled stage openings.
- A production owner for the XP ledger and stage-access decision.
- Confirmation that the current Supabase schema/services expose those authoritative sources. The existing helper inspected for this plan only handles file uploads.

## Sequence

This is a later phase. Keep the first playable prototype on mock data until the needed contracts are available.

## Comments

Repository review on 2026-09-30 confirmed that the PRD schema is logical and not migration-ready, the app helper only uploads to Supabase Storage, and this checkout has no Supabase CLI/configuration, migrations, or configured Supabase/database environment. The authoritative attempt, final-review, selection, and schedule contracts and a production owner are still missing, so this remains deferred and `needs-info`.

Update after the 2026-09-30 game experience overhaul: Supabase CLI/configuration and ignored client environment are now available; real invited participant authentication is connected to ECC staging. Schema-only inspection found profiles, enrollments, quests, stages, activity_ledger, submissions, and assignment tables. The historical configuration gap above is closed. Authoritative attempts, final review, selection/schedule contracts, staff identity mapping, and a production owner are still unconfirmed. Learning state remains explicitly simulated, so this ticket stays needs-info. See ../../game-experience-overhaul/verification.md.
