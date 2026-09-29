# Team: build the separate L2 Build scene

Status: ready-for-human

Implementation: complete; ready for review.

Owner: Team
Spec: `../spec.md`

## Goal

Deliver L2 as a team-owned stage with its own scene and map.

## Acceptance criteria

- L2 is a separate scene entered from the Expedition map, not a connected zone inside L1.
- The Expedition map only opens L2 when the mock or production access state says the Participant is eligible.
- Include L2's Build quests for the selected Program track; the team supplies the task content and scene details.
- Keep the same individual controls and explicit Quest board interaction used in L1.
- Returning to the Expedition map preserves the Participant's stage and task state.
- Do not add Guild, peer-help, multiplayer, combat, or XP-for-movement mechanics.

## Implementation record

- Connected the team-pushed L2 town map and Build quests from `origin/main` as a separate playable scene.
- Reused the track-aware Quest board and mock mission/review flow.
- Browser E2E verified the L2 scene, board interaction, review queue, and scheduled-opening gate. Screenshots are linked in the PR description.

## Sequence

Start after issue 02 establishes stage navigation and coordinate scene conventions with the L1 implementation in issue 03.
