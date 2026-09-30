# ECC Future Quest

An individual learning adventure for SIAP Impact 2026, built with React, TypeScript, Phaser, Vite, and Supabase authentication.

## Run locally

Install [Bun](https://bun.sh), then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Open **http://localhost:5173** and choose **Coba demo**. The demo works without an account and opens all three stages:

| Stage | Experience | Direct demo route |
| --- | --- | --- |
| L1 Discover | Mixel exploration world | `/demo/stage/1` |
| L2 Build | Team town map and prototype missions | `/demo/stage/2` |
| L3 Pitch | Team final-stage map and final pitch | `/demo/stage/3` |

Complete the short introduction before entering a stage. Return to the expedition map to switch stages.

## Participant login

Copy `.env.example` to `.env.local` and supply the authorized Supabase URL and public anon/publishable key. Restart Vite after changing these values.

Participant accounts use ECC invitations, email/password login, and password recovery. Public signup is disabled. Never put a service-role key in a `VITE_` variable. See [authentication setup](docs/authentication.md).

**Learning progress is simulated:** XP, mission review, and stage access are saved locally per visitor or authenticated account. Real authentication does not make these outcomes verified ECC results. Mentor/Admin workspaces are demo-only. Production learning integration remains pending.

## Controls

- **WASD / arrow keys:** move
- **E:** interact with a nearby quest board
- **Escape:** pause or close the active dialog
- **Mobile landscape:** touch joystick and interaction button

## Build

```sh
bun run build
bun run preview
```

## Repository

- `src/` — application, game scenes, navigation, and local progress
- `public/assets/` — game assets used by the application
- `supabase/config.toml` — local authentication configuration
- `scripts/` — asset utilities and focused verification checks
- `tools/` — optional map editor
- `docs/` — product reference, authentication, architecture, and asset licenses
- `CONTEXT.md` — shared product terminology

Local tickets, captures, recordings, downloads, and scratch notes are ignored by Git. Runtime assets and their [license documentation](docs/licenses/mixel/LICENSE.txt) remain tracked.

See the [product reference](docs/product-reference.md), [asset resources](docs/asset-resources.md), and [map editor guide](tools/README.md) for development context.
