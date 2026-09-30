# Expedition navigation and returning player flow

Status: resolved
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


## Answer

Implemented versioned, validated browser progress scoped separately to demo and each authenticated user. Native IndexedDB stores local evidence files; a reload restores fresh blob URLs. Damaged progress is retained with a visible error instead of overwritten. Navigation uses /demo or /play with intro, expedition, Passport, and separate stage URLs. Demo staff routes stay within /demo; participant staff deep links return to expedition. Completed introduction is skipped. Added next-stage action and personal goals in Passport, and aligned navigation styling with the landing.

Evidence: `bun scripts/check-experience.ts` passed; production build passed. Browser confirmed introduction skip, stage reload, stage return, Back to the previous stage, Passport reload, demo mentor/participant switching, and no horizontal overflow at 390px. Stored draft summary and attachment bytes were restored after reload through the same storage helpers used by the app. Screenshots in ../evidence/03-*.png. Interaction/UI review continues in tickets 05?06.
