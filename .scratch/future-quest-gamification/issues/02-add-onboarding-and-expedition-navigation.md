# Add onboarding and Expedition map navigation in the main app

Status: ready-for-human

Implementation: complete; merged into `origin/main` in PR #1 (`a36e533`); post-merge browser-verified on 2026-09-30.

Spec: `../spec.md`

## Goal

Use `origin/main` as the app base and route the Participant from separate Future Base onboarding to an out-of-stage Expedition map, then into an available stage scene.

## Acceptance criteria

- Build in a separate worktree based on `origin/main`; retain its React/Vite/Phaser 3 baseline.
- The full branch histories have no common merge base. Do not merge the branch histories; selectively port the Mixel L1 files in issue 03.
- Future Base onboarding is a separate initial checkpoint before bootcamp L1.
- The Expedition map is outside gameplay scenes and lists L1, L2, and L3 with available or locked state.
- Selecting a stage loads its own scene; returning to the Expedition map lets the Participant choose another stage.
- L2/L3 may use clearly marked placeholders until their team-owned scene tickets are delivered.
- Keep Participant V1 individual and preserve the existing Mentor/Admin role workspaces.
- Do not bring combat, HP, boss-battle rewards, Guild, leaderboards, or talent-pool social features into the Participant V1 flow.

## Implementation record

- Added separate Future Base onboarding, the out-of-scene Expedition map, and return-to-map stage switching.
- Kept the Participant flow individual and retained Mentor/Admin workspaces.
- Browser E2E verified onboarding, locked and unlocked stages, and entry to separate scenes. Screenshots are linked in the PR description.

## Sequence

Start on an integration branch from `origin/main`. Scene implementations are delivered by issues 03–05.
