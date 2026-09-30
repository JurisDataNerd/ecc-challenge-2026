# Landing page and playable demo entry

Status: resolved
Blocked by: none
Spec: ../spec.md

## Deliver

Apply frontend-design to establish the surrounding UI using existing fantasy pixel assets. Add a public landing page with concise program explanation, Login, and Try demo. Demo entry leads through a brief introduction to the existing expedition map; L1/L2/L3 remain playable. Add browser locations and working Back behavior using the simplest approach supported by the existing app.

## Acceptance

- First visit shows the landing page, not an unexplained onboarding form.
- Try demo works without Supabase configuration or an account.
- Login leads to a dedicated account screen, completed by ticket 02.
- Demo state is identifiable and separate from future signed-in state.
- Layout works on desktop and mobile; focus and accessible labels are usable.
- Existing stage and task entry continue to function. Save before/after screenshots and run the build.

## Implementation evidence

- Implemented public landing, /login account entry, /demo entry, and unknown-route recovery. ProgramApp is loaded only for demo entry.
- Native links provide browser locations and Back behavior. Demo is explicitly identified above the program UI; it requires no Supabase configuration.
- Desktop screenshot: ../evidence/01-landing-desktop.png. Mobile screenshot: ../evidence/01-landing-mobile.png. Demo map: ../evidence/01-demo-expedition.png.
- Before: ../../future-quest-gamification/verification/onboarding-current.png shows the prior direct-onboarding entry.
- Browser checked at 1365x900 and 390x844, without horizontal overflow on mobile. Entered L1, L2, and L3 and observed one rendered canvas for each; browser page errors were empty.
- bun run build passed. Login behavior is implemented in dependent ticket 02; demo persistence and stage URLs are delivered in 03.
