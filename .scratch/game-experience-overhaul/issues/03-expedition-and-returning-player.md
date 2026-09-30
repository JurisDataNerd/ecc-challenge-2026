# Expedition navigation and returning player flow

Status: claimed
Blocked by: 01, 02
Spec: ../spec.md

## Deliver

Connect landing/auth/demo entry to ParticipantJourney. Redesign introduction, expedition, and Passport with one consistent hierarchy. Show the next action and understandable stage summaries. Save and restore demo introduction/progress with versioned local state; clear or isolate it when switching sessions. Use confirmed participant records only where available; simulated learning values remain labeled.

## Acceptance

- Visitor, newly invited participant, and returning participant have clear entry paths.
- Completed introduction is skipped on subsequent visits.
- Browser Back, reload, stage return, and logout produce coherent screens.
- Demo opens all stages. Production learning gates remain explicitly deferred rather than fabricated.
- Staff demo navigation is confined to demo access until authoritative roles exist.
- Passport keeps individual track, XP, and milestones without Guild features.
