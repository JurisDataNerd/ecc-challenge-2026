# Game experience verification

Completed 2026-09-30 in `C:/ecc-future-quest`, branch `workspace/all-stages-playable`. All six overhaul tickets are resolved. The implementation is in this workspace.

## Acceptance audit

| Requirement | Result and evidence |
| --- | --- |
| Public landing, clear Login and Try demo | Passed. Actual visitor entry exercised; `01-landing-desktop.png`, `01-landing-mobile.png`, `06-demo-checks.json`. |
| Invitation-only email/password authentication | Passed against ECC staging. Synthetic invitation activated without sending email. Public signup rejected by server. `02-schema-contract.json`, `06-invite-checks.json`; setup in `auth-setup.md`. |
| Recovery, login errors, session restore, logout, protected entry | Passed. Recovery success remains visible; recovered password authenticated through UI and SDK. Reused invitation/recovery links disabled. `06-recovery-checks.json`; earlier neutral reset and mismatch checks recorded in ticket 02. Synthetic accounts and temporary service credentials deleted. |
| New introduction; returning participants continue | Passed in real authenticated and built visitor journeys. Reload restored the expedition and completed introduction. No staff picker for authenticated participants. `06-invite-checks.json`, `06-production-checks.json`. |
| Demo opens L1/L2/L3 and isolates participant progress | Passed. Six demo quiz attempts remained separate from the fresh signed-in account's zero attempts. All maps played and all stages completed. `06-demo-checks.json`, `06-all-stages-complete.png`. |
| URLs, Back, reload, stage switching | Passed. Back returned from stage to expedition; Passport and drafts survived reload. Stage changes did not retain old dialogs. Route validation includes unknown paths and locked-stage redirects. `scripts/check-experience.ts`, `scripts/check-journey-browser.mjs`. |
| Objectives, first-entry controls, Pause and explicit board action | Passed. Saved stage introductions, single objective HUD, Pause instructions/resume/return. Board contact did not open tasks; E and actual touch taps did. `05-stage-intro-desktop.png`, `05-stage-intro-landscape.png`, `05-pause-desktop.png`, `06-stage*-touch-board.png`. |
| Consistent keyboard/touch movement, diagonal speed, paused input | Passed on all maps. Real CDP key and touch events moved players, stopped at scenery, stopped while paused/tasks/portrait were active, and resumed afterward. Pure checks cover normalization, sliding, bounds, and delta cap. `05-stage1-input.json`, `05-stage2-input.json`, `05-stage3-input.json`. |
| Collision, traversable intended paths, player/camera/depth consistency | Passed. Shared scene/control implementation; map-pixel flood fill proves every board reachable, L2 ladder usable, and L3 bridge reaches the west bank. Wall/house/tree keyboard collision boundaries exercised. `04-map-checks.json`, `scripts/check-map-browser.js`, `src/game/terrain.ts`. Fixed footprints remain specific to the current map images. |
| Quest content without combat/automatic task opening | Passed. All six quizzes and three missions available. Wrong-answer retry earned no duplicate XP. L3 retains pitch/slide/90-day deliverables. Reviewed quality produced 150 total simulated XP and three milestones. Legacy competing combat scene deleted. `06-demo-checks.json`, `06-all-stages-complete.png`. |
| Draft, evidence, submitted, revision, review, completion | Passed. Local file bytes restore from IndexedDB; editable drafts save automatically; invalid submitted URLs rejected. L1 requested revision/resubmission/acceptance recorded in ticket 05. L2/L3 link drafts reloaded and accepted through the actual UI in ticket 06. `05-revision-desktop.png`, `05-mission-desktop.png`, `06-demo-checks.json`; focused storage checks. |
| Readability, focus, mobile layouts, errors/loading | Passed browser inspection. Paper/forest UI with Geist body text; native dialogs contain focus and Escape returns focus to game. Touch board dialogs fit 844Ã—390 with no horizontal overflow. Portrait guidance occupies full 390px width and keeps return available. Storage/callback failures have visible guidance; saved corruption is retained. `05-stage*-portrait.png`, `06-stage*-touch-board.png`; focused checks. |
| Individual Passport and honest simulation labels | Passed. Track, personal goals, XP and all stage milestones shown. No Guild or peer features. Authentication is real; learning values stay marked simulation. `06-all-stages-complete.png`. |
| Build and no page exceptions in final flows | Passed `rtk proxy bun run build`, `bun scripts/check-auth-boundaries.ts`, `bun scripts/check-experience.ts`. Built preview rendered every map, with Pause/return and no development diagnostics. Fresh demo/invite/recovery/production runs recorded zero Runtime page exceptions in `06-*-checks.json`. |
| Remaining ECC/backend scope tracked accurately | Original gamification 01 remains `ready-for-human`; original 07 remains `needs-info`. Auth setup is now available, but authoritative learning contracts and owner are still pending. |

## Reproduce

Run the root development server on localhost:5173 and open it using agent-browser. Supply its local CDP URL through `FQ_BROWSER_CDP`.

```powershell
bun scripts/check-auth-boundaries.ts
bun scripts/check-experience.ts
rtk proxy bun run build
bun scripts/check-journey-browser.mjs demo
```

The demo lifecycle check completes a new introduction if necessary, completes outstanding missions, and verifies existing accepted results. It is repeatable in the QA browser. Open each `/demo/stage/1`, `/2`, `/3`, then run `bun scripts/check-game-browser.mjs` separately. This sends trusted keyboard and touch events. Run `scripts/check-map-browser.js` through browser eval to inspect real map pixels and reachability.

For a fresh built visitor journey, start the root preview at localhost:4173 and run `bun scripts/check-journey-browser.mjs production`. Authentication lifecycle uses the staging-only helper's `prepare`, `recovery`, `verify-login`, and `cleanup` modes with a private synthetic fixture, followed by the matching browser runner modes. Never track the fixture or service credential.

## Practical limits

Touch was verified with Chromium's actual touch emulation, not physical phones; no Safari/hardware compatibility claim. Collision footprints are checked for the current baked map assets, not arbitrary future maps. Phaser still produces the existing large-chunk build warning; build succeeds. This is staging authentication and locally simulated learning, not a production deployment or completion of original gamification ticket 07. No real participant invitations or database migrations were made.
