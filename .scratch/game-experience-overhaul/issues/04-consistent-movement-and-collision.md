# Consistent movement, collision, and pause across maps

Status: ready-for-agent
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
