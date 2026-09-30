# Game experience overhaul

Status: resolved

## Outcome

A visitor understands Future Quest and can choose Login or Try demo. A participant can sign in through an ECC invitation, reach the expedition map, understand the current objective, and play any demo stage with predictable controls and believable collision.

Implement in C:/ecc-future-quest. Preserve the existing individual V1 scope, separate L1/L2/L3 maps, existing pixel assets, and L3 final pitch. ECC rule approval and authoritative learning persistence remain in the original gamification tickets 01 and 07.

## Approved experience

- Public landing page explains the program journey and presents Login and Try demo.
- ECC invitations establish participant accounts. Use Supabase email/password authentication, invitation acceptance, password reset, session restore, and logout. Do not provide public self-registration.
- Entry: landing, login or demo, short introduction when needed, expedition map, selected stage. Returning participants skip completed introduction.
- Demo access opens all three stages without an account. Keep demo data separate from authenticated sessions and identify simulated learning values wherever displayed.
- Provide meaningful browser locations and Back behavior for landing, account flows, expedition, and stage. Reload must not silently reset navigation or discard saved demo progress.
- Before play, show the stage objective and controls. During play, display one current objective and an explicit interaction prompt near the quest board. Pause offers controls, instructions, resume, and return to expedition.
- Retain fantasy pixel world assets. Redesign the surrounding interface with clear typography, restrained decoration, consistent components, and a useful hierarchy. Pixel fonts are for short game labels. Use the frontend-design skill during UI implementation.
- Desktop is the primary target; mobile landscape supports the same actions through touch controls. Use WASD/arrows for movement, E for interaction, and Escape for pause. Remove click-to-move as a competing default. Normalize diagonal speed and prevent movement when a modal or pause is open.
- Use consistent player proportions, camera behavior, depth, movement, and interaction conventions across all maps. Reuse existing gameplay code where it satisfies these requirements.
- Solid scenery and water block movement. Map-specific collision footprints must match visible objects and leave intended paths traversable. Show a helpful orientation message on mobile portrait.
- Retain explicit quest-board interaction. Contact with characters or scenery never opens a task automatically. Existing quiz/mission content remains available without combat or HP progression, following the existing V1 spec.
- Preserve individual Passport with track, XP, and stage milestones. Surface simulation labels without flooding each screen with implementation terminology.

## Authentication boundaries

Discover the authorized ECC Supabase project through the existing CLI before configuring authentication. Never expose service credentials in the client. Supabase sessions establish identity; staff access requires an authoritative role/membership contract, never a participant-controlled dropdown. If the existing schema cannot supply staff authorization, keep staff demos explicitly within the demo experience while recording the missing contract. Avoid changes to the remote schema until the needed migration is concrete and reviewed against existing data.

Authentication does not complete the pending verified XP, reviews, selection, or schedule integration. Clearly describe those values as simulated until original ticket 07 is delivered. Real invitations must not be sent to people as part of development verification.

## Findings from the current code

- App.tsx enters onboarding directly and keeps navigation in React state. No landing, login, session handling, or URL navigation exists.
- The workspace dropdown permits unrestricted staff switching.
- src/lib/supabase.ts currently supports uploads only. Expected client variables are VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY; root configuration is absent.
- L1 uses GameWorld/ArenaScene with E, a joystick, normalized movement, and map collision checks.
- L2/L3 use PhaserGame/WorldScene with Space and click-to-move, without joystick or scenery collision. Boss contact opens a task automatically.
- PhaserGame's pause/resume guard can leave a paused scene stopped. L1 still receives joystick movement while modal input is suppressed.

## Completion evidence

Exercise visitor demo entry, invitation/login/reset/logout, returning sessions, browser Back/reload, stage switching, and quest modal resume. Check all three maps for visible obstacle boundaries, diagonal movement, keyboard/touch consistency, and paused input. Provide screenshots of the landing, login, expedition, stage HUD, and pause screen. Run the existing production build. Add focused regression checks for shared movement/pause/auth boundaries when implementation warrants them.

## Delivery

Tickets in issues/ declare blocking edges. Start with 01 for the complete public demo entry path. Work 04 independently of the authentication path, then join navigation and gameplay in 05. Complete 06 before calling this overhaul delivered.
