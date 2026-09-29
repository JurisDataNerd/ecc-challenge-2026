# Add the individual Future Passport and mock progress

Status: ready-for-human

Implementation: complete; merged into `origin/main` in PR #1 (`a36e533`); post-merge browser-verified on 2026-09-30.

Spec: `../spec.md`

## Goal

Present a participant's track, XP, and stage milestones using visibly labelled demo data.

## Acceptance criteria

- The Future Passport shows only the assigned Program track, XP total/progress, and L1/L2/L3 milestones.
- The Personal base gains one visible milestone for each completed bootcamp stage.
- Show a clear demo/mock label anywhere the prototype displays XP, submission/review state, or stage access.
- Simulate 10 XP once for the first valid quiz submission, 20 XP once for the first accepted mission submission, and one 10 XP quality bonus after final review at or above 80% of the rubric criterion maximum.
- Revisions, retries, movement, and speed add no XP. XP does not affect selection or stage access.
- Use mock published-result and scheduled-opening values to demonstrate stage locks and read-only access.
- Do not show Impact, Opportunity, or Readiness categories, Guild reputation, teammate progress, leaderboards, or social rewards.
- Do not describe local mock values as verified, authoritative, or persistent.

## Implementation record

- Added the individual Future Passport, stage milestones, and clearly labeled local demo values.
- Browser E2E verified 10 XP for a quiz's first submitted attempt, 20 XP on mission acceptance, no quality bonus at 7/10, and the bonus at the exact 8/10 threshold.
- Browser E2E verified results and scheduled opening are both required, and non-advancers see prior work in read-only mode. Screenshots are linked in the PR description.

## Sequence

Use the app's existing participant screen as prototype scaffolding. Replace its arbitrary client XP and boss rewards with the mock rules above.
