# Team: build the separate L3 scene and include final pitch

Status: ready-for-human

Implementation: complete; merged into `origin/main` in PR #1 (`a36e533`); post-merge browser-verified on 2026-09-30.

Owner: Team
Spec: `../spec.md`

## Goal

Deliver the team-owned L3 scene and place the existing main-app final-pitch work within L3.

## Acceptance criteria

- L3 is a separate scene entered from the Expedition map, not a connected zone inside L1 or L2.
- The Expedition map only opens L3 when the mock or production access state says the Participant is eligible.
- Include final-pitch work as an L3 quest; do not add a fourth bootcamp stage.
- Include L3 quests for the selected Program track; the team supplies the remaining task content and scene details.
- Keep the same individual controls and explicit Quest board interaction used in L1.
- Returning to the Expedition map preserves the Participant's stage and task state.
- Do not add Guild, peer-help, multiplayer, combat, or XP-for-movement mechanics.

## Implementation record

- Connected the team-pushed L3 map and Pitch quests from `origin/main` as a separate playable scene.
- Added the final-pitch mission to L3; V1 has no fourth bootcamp stage.
- Browser E2E verified the L3 scene, final-pitch board entry, review flow, and scheduled-opening gate. Screenshots are linked in the PR description.

## Sequence

Start after issue 02 establishes stage navigation. Coordinate scene conventions with issues 03 and 04.
