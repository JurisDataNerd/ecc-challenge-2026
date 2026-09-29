# Port the existing Mixel world as bootcamp L1

Status: ready-for-agent

Spec: `../spec.md`

## Goal

Make the current `adian` Mixel game the separate L1 scene in the main app.

## Acceptance criteria

- Adapt the Mixel scene behavior to the main app's Phaser 3 version; do not replace the React/Vite/Phaser dependency baseline with `adian`'s versions.
- Port the needed L1 scene/UI and `public/assets/mixel` files selectively. Do not replace `src/main.tsx`, global styles, `package.json`, or the lockfile from `adian`.
- Preserve the selected Mixel 32x32 assets unmodified and follow their bundled license.
- Keep L1 as its own scene, entered from the Expedition map and exited back to that map.
- Preserve keyboard movement on desktop and the existing analog movement on mobile landscape screens.
- Keep movement, Quest boards, and task interactions individual and combat-free.
- Connect L1 boards to the existing quiz and mission screens as mock prototype flows. Preserve the selected track and task context when returning to L1.
- Do not use client XP totals or boss-battle state from `adian` or `main` as verified production progress.

## Sequence

Start after issue 02 provides the app navigation seam. The bundled asset/license details are recorded in `phaser-resources.md`.
