---
status: proposed
---

# Use an expedition menu with separate stage scenes

## Context

The `adian` branch contains the existing Mixel participant world. The `main` branch contains the broader ECC Future Quest React/Vite app and a Phaser 3 game shell. The current `origin/main` ref is shallow, so Git cannot determine a merge base from the history available in this checkout. Their Phaser versions and game flows differ, so the Mixel world must be adapted into the app rather than merged as a whole replacement.

The client concept shows an onboarding checkpoint followed by bootcamp milestones. The user chose stage selection from outside the gameplay scenes. V1 is individual and excludes Guild and peer features.

## Decision

- Use `main` as the app base and adapt the existing `adian` Mixel world as bootcamp L1.
- Keep Future Base onboarding as a separate initial checkpoint before the bootcamp stages.
- Use an Expedition map as an out-of-stage menu. Selecting L1, L2, or L3 opens that stage's own scene; returning to the menu switches stages.
- Keep L2 and L3 team-owned. Include final-pitch work in L3 rather than creating a fourth stage.
- Keep V1 individual. Show only Program track, XP, and stage milestones in the Future Passport.
- Use mock data for the first playable prototype. Connect persistent, authoritative XP and stage access through Supabase in a later phase.

## Consequences

- Stage maps can have different layouts and content without implying one continuous world.
- The integration must adapt `adian`'s Phaser 4 scene behavior to `main`'s Phaser 3 app. Do not replace `main`'s React/Vite dependency baseline with `adian`'s package versions.
- Main's existing quiz, mission, and role screens are prototype scaffolding. Its client-side XP, HP, boss battles, leaderboard, and talent-pool paths are not production rules and must not be carried into V1 as-is.
- Build the integration in a separate worktree based on `origin/main` and selectively port the L1 scene/UI and Mixel assets from `adian`. Fetch full history before considering a branch merge; until ancestry is clear, do not merge the branch histories or replace main's app entry, styles, manifest, or lockfile with `adian` files.
- Mock XP and access states must be labelled as demo data. Production awards must come from authoritative reviewed events and must not affect selection scores.
- ECC sign-off on program rules remains open; this ADR records the selected prototype direction and remains proposed until that sign-off.

## Out of scope for V1

Guilds, shared real-time play, teammate progress, peer help, side quests, guild reputation, leaderboards, talent-pool social features, combat, HP, and a separate Stage 4.
