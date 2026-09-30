# Game experience overhaul

Status: ready-for-agent

## Confirmed choices

The user accepted these recommendations on 2026-09-30:

- Public landing page with Login and Try demo entry points.
- Participant accounts access the program; the demo keeps all three stages playable.
- Preserve existing fantasy pixel assets. Rebuild surrounding screens with clear typography, consistent controls, and fewer decorative panels. Use pixel fonts for short game labels.
- Prioritize desktop while supporting mobile landscape. Movement and collision should feel consistent across all three stages.
- Entry flow: landing, login or demo, brief introduction, expedition map, selected stage.
- Stage entry clearly presents the objective, controls, and next interaction point.
- Continue development in C:/ecc-future-quest.

## Existing scope

V1 remains individual, with separate L1/L2/L3 scenes and no Guild. Official ECC rules and authoritative XP/access persistence remain pending. This overhaul improves entry, navigation, controls, collision, and interface clarity.

## Further confirmed choices

- Supabase email/password login with password reset.
- ECC invites participants; public visitors use the demo without an account.
- First stage entry offers a short introduction. A compact objective display and explicit quest-board prompt guide play. Controls and instructions can be reopened from Pause.
- Learning progress remains visibly simulated until the existing production persistence ticket is delivered; real authentication must not imply verified program progress.

## Next artifacts

See spec.md and issues/01 through issues/06 for the approved implementation sequence.

## Implementation progress

- Landing and invitation authentication are implemented (commits af920e7, af43264).
- Ticket 03 work in progress: browser routes for intro/expedition/stage/Passport/staff demo; versioned browser progress isolated by visitor or authenticated user ID; explicit storage failure notice; lighter navigation using the established landing palette.
- Remaining before ticket 03 acceptance: browser navigation/reload checks, deeper stored-data validation, durable attachment restoration, responsive visual inspection.
- Tickets 04–06 remain pending. Do not treat this log as final acceptance.
