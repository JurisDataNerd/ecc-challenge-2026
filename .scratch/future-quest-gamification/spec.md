# Spec: ECC Future Quest Gamification

Status: ready-for-human

Implementation: V1 prototype merged into `origin/main` in PR #1 (`a36e533`) on 2026-09-29. Post-merge browser verification was completed on 2026-09-30; see `verification.md`.

ECC formally approved the V1 rules on 2026-09-30; see issue 01 for the recorded sign-off.

## Problem

The current app presents learning activity and game progress in different places. The prototype should make each participant's bootcamp journey easier to follow while keeping stage access and XP tied to ECC's rules.

## Product decision

Use `origin/main` as the app base and adapt the existing `adian` Mixel world as bootcamp L1. Keep the app's React/Vite/Phaser 3 baseline. The Mixel source uses a newer Phaser version, so port its scene behavior and selected assets instead of replacing the app stack.

Future Base onboarding is a separate initial checkpoint before bootcamp L1. After onboarding, the participant uses an out-of-stage Expedition map to choose a stage. L1, L2, and L3 each load as separate scenes; they are not connected areas in one arena. The participant returns to the Expedition map to switch stages.

L1 is the existing Mixel game. The team owns the separate L2 and L3 scenes. L2 is Build; final-pitch work is part of L3, so V1 has three bootcamp stages and no separate Stage 4.

V1 is individual. The Future Passport shows only the participant's Program track, XP, and L1/L2/L3 milestones. Guild features, teammate progress, peer help, side quests, guild reputation, leaderboards, talent-pool social features, and the Impact/Opportunity/Readiness categories are out of scope.

## Participant flow

1. The Participant enters Future Base onboarding.
2. The Participant opens the Expedition map and sees the available and locked bootcamp stages.
3. Selecting an available stage loads its separate scene; the Participant can return to the Expedition map at any time.
4. A Quest board opens the existing quiz or mission screen after an explicit Interact action.
5. The Future Passport shows the assigned track, demo XP, and stage milestones.

## Requirements

- Use a consistent fantasy pixel-art style across the onboarding checkpoint, Expedition map, and separate stage scenes. Keep the existing Mixel source images unmodified and follow the bundled license.
- Preserve the existing Mixel movement feel: landscape play with a virtual analog on mobile and keyboard movement on desktop. Keep controls legible and usable.
- Each stage scene has its own map and stage content. Stage switching happens through the Expedition map outside the scene.
- Use the same stage navigation for Professional, Social Impact, and Business. Show quest content for the Participant's assigned Program track.
- Keep explicit Quest board interaction. Reaching a board shows an Interact action but does not open it automatically. Tasks with requested revisions remain marked as needing revision.
- Keep the existing quiz, mission, Mentor, and Admin screens as app scaffolding. Their client-side behavior in `main` is mock behavior, not a production source of truth.
- Stage 2 or 3 opens only when ECC has published the Participant's result and the scheduled opening time has arrived. A Participant who does not advance retains read-only access to previously available work.
- Grow the Participant's Personal base by one visible milestone for each completed bootcamp stage. It is a progress display and does not affect selection or access.
- The first playable prototype uses mock data. Clearly label mock XP, submission state, review outcome, and stage-access state as demo data.
- In the prototype, show XP as a nonspendable total and progress bar. Simulate the agreed rules: 10 XP once for a quiz's first valid submitted attempt, 20 XP once for a mission's first accepted submission, and a fixed 10 XP bonus after final Mentor review when evidence quality is at least 80% of the criterion's maximum. Revisions, retries, movement, and speed earn no XP. XP does not affect selection or stage access.
- Production persistence and verified XP/access are a later Supabase phase. Awards must then be idempotent and sourced from authoritative quiz, mission, review, selection, and schedule records.
- Do not carry over `main`'s combat, HP, boss-battle progression, arbitrary client XP rewards, or social screens as V1 game rules.

## Main app facts

`main` is a React 18, Vite 6, Phaser 3 app. Its `App.tsx` keeps participant XP and submissions in client state, starts with a mock XP total, and includes HP, boss-mission, leaderboard, and talent-pool paths. Its quiz and mission screens are useful prototype scaffolding; the current client handlers are not verified production workflows. The current `adian` game uses React 19, Vite 8, and Phaser 4. The integration should preserve `main`'s app baseline and adapt the L1 scene.

The current Supabase helper supports file uploads; it does not yet provide authoritative, duplicate-safe XP awards or stage-access decisions. Do not describe the first prototype's mock state as persistent or verified.

Read-only review of the restored `ecc-future-quest-staging` project on 2026-09-30 found an `activity_ledger` with uniqueness on `(enrollment_id, event_type, source_id)`, versioned submissions, and stage schedule fields. It has no dedicated quiz-attempt, final-review, or published-selection records, and no deployed gamification function. The ledger can prevent duplicate identical event/source awards, but the event/source mapping and authoritative review and selection workflows remain undefined; see issue 07.

## Delivery sequence

1. Create an isolated integration worktree from `origin/main` and retain this planning documentation. Even after fetching full history, `origin/main` and `adian` have no common merge base; do not merge the branch histories.
2. Selectively port the L1 scene/UI and Mixel assets into the main app; keep main's app entry, styles, package manifest, lockfile, and Phaser 3 baseline.
3. Add the onboarding entry and Expedition map navigation in the main app.
4. Connect L1 boards to the mock quiz and mission screens.
5. Have the team build separate L2 and L3 scenes; include final pitch in L3.
6. Add the individual Future Passport and clearly labelled mock XP, milestone, and access data.
7. Plan the Supabase integration after the authoritative data and workflow contracts are available.

See the implementation issues in `issues/` for ownership and acceptance criteria.

## Open items

- L2 and L3 use the maps and quest content already present in `origin/main`; additional team-authored changes can be reviewed separately.
- The production Supabase phase needs confirmed quiz, mission acceptance, final-review rubric, selection-result, and scheduled-opening data contracts.
