# Connect verified progress and stage access through Supabase

Status: needs-info

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
