# Consistent movement, collision, and pause across maps

Status: resolved
Blocked by: none
Spec: ../spec.md

## Deliver

Trace both GameWorld/ArenaScene and PhaserGame/WorldScene. Reuse the existing L1 conventions across L2/L3 instead of maintaining competing control behavior. Add collision footprints for scenery/water on each map and consistent player/camera/depth behavior. Fix paused-scene resume and block keyboard, joystick, and pointer movement during modals/pause.

## Acceptance

- WASD/arrows, E, Escape, and mobile joystick/actions behave consistently across L1/L2/L3.
- Diagonal speed matches axial speed; no default click-to-move competes with input.
- Trees, buildings, walls, and water block movement while intended routes and boards remain reachable.
- Closing tasks reliably resumes the scene. Opening any task/pause stops all movement input.
- Player proportions, camera, and object occlusion are coherent on each map.
- Add focused runnable regressions for the pause/input bug and collision boundary behavior. Verify movement in browser, including actual touch input.


## Answer

Reused GameWorld/ArenaScene for all three maps. Shared movement normalizes combined input and blocks it centrally while paused. Keyboard, joystick, blur, and interaction use the same pause boundary. Escape opens/resumes pause. Removed unused WorldScene/PhaserGame combat and click-to-move code. Player scale, camera resize behavior, and depth sorting now match across scenes. Added fixed scenery footprints, water checks, foreground canopies, traversable ladder landings, and a rendered L3 bridge connecting the isolated island to the west bank.

Evidence: `bun scripts/check-experience.ts` passes pause, normalization, slide, wall/tree/building/water/bridge boundary checks. `scripts/check-map-browser.js` checks actual map pixels and flood-fill reachability to all boards, the L2 upper ladder landing, and L3 west bank (04-map-checks.json). `scripts/check-game-browser.mjs` passed genuine CDP keyboard collision and touchscreen joystick/held-touch pause/resume checks in L1/L2/L3 (04-stage*-input.json). Production build passed. Stage/pause UI presentation is completed by ticket 05.
