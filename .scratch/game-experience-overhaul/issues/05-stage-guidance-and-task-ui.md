# Stage guidance, quest interaction, and task UI

Status: resolved
Blocked by: 03, 04
Spec: ../spec.md

## Deliver

Apply the UI direction to the stage HUD, first-entry introduction, objective display, explicit quest-board interaction, Pause, and quiz/mission screens. Use emil-design-eng for restrained interaction polish. Retain existing V1 individual, non-combat content; replace automatic contact-triggered tasks with explicit interaction.

## Acceptance

- A first-time player understands the objective, movement, and next interaction point.
- Only explicit interaction opens the quest board; touching NPCs does not launch tasks.
- Pause exposes resume, controls/instructions, and expedition return with clear focus behavior.
- Quiz, mission, revision, review, and completion states clearly explain the next action.
- L3 retains final pitch; exiting tasks preserves track/stage context.
- Mobile controls and HUD do not obscure play or task actions. Portrait has an actionable orientation message.
- Simulation labels are accurate and concise; arbitrary combat rewards/HP are absent from V1 progression.


## Answer

Added per-stage first-entry objectives, controls, and the board location; introduction completion is persisted. During play a compact stage bar and one current objective update from quiz/mission/review state. Pause includes controls, instructions, resume, and expedition return. Native dialogs contain focus, support Escape, and return focus to the game. Task navigation retains stage/track context; browser stage changes unmount old dialogs. Quiz feedback requires explicit retry before changing an answer. Mission edits save automatically, evidence remains local, and draft/submitted/revision/reviewed states provide clear actions. Mentor demo review now uses the same readable dialog and requires specific written feedback rather than invented default observations.

Mobile landscape has edge controls and a two-column introduction; portrait shows guidance and blocks movement while retaining expedition return. Existing L3 final-pitch content is retained. No combat or HP controls remain. Interaction review is recorded in ../design.md using the frontend-design and emil-design-eng guidance.

Evidence: build and scripts/check-experience.ts passed; genuine touch/pause checks repeated for all stages with the new dialogs (05-stage*-input.json). L3 additionally verifies portrait visibility and movement suppression. Browser L1 lifecycle passed quiz, submitted mission, requested revision, resubmission, accepted 100/100 review, 40 simulated XP, and Passport milestone. Native dialog screenshots are 05-stage-intro*, 05-pause-desktop, 05-quiz-desktop, 05-mission-desktop, 05-revision-desktop, 05-passport-completion, and 05-stage*-touch-hud/portrait. Full cross-flow audit is ticket 06.
