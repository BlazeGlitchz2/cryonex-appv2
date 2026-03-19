# QA Breaker Report

Run: `cryonex-polish-20260319`
Agent: `qa-breaker`

## Scope Tested
- Desktop dashboard at `http://127.0.0.1:4174/study/dashboard`
- Mobile width `390x844`
- Empty-state dashboard behavior
- First-load onboarding / tutorial overlays
- Clickability of primary actions
- Console/network noise

## Findings

### 1. Mobile onboarding can block the main dashboard on first load
- Severity: high
- Repro: load the study dashboard on a narrow viewport before the onboarding has been dismissed.
- Result: primary actions like `Start focus` and `Upload material` are initially tap-blocked by a full-screen fixed onboarding overlay.
- Evidence:
  - `src/components/onboarding/MobileOnboarding.tsx:75-184` renders a `fixed inset-0 z-[9999] md:hidden` overlay with a `Skip` button.
  - In browser automation, clicking the primary dashboard actions on mobile repeatedly failed with pointer-event interception from the overlay.
- Notes:
  - The overlay is dismissible via `Skip`, but it still creates a hostile first-run experience because it sits above the entire app and blocks the workflow until users discover it.

### 2. Multiple onboarding/tutorial layers stack on top of each other
- Severity: medium
- Repro: open the dashboard on mobile and inspect fixed layers.
- Result: there is both the mobile onboarding overlay and a separate `OnboardingTour` layer focused on `Global Search`.
- Evidence:
  - `src/components/AppLayout.tsx:233-289` mounts `MobileOnboarding` on mobile and `OnboardingTour` globally.
  - `src/components/onboarding/OnboardingTour.tsx:199-325` creates a fixed spotlight/tooltip overlay with another opt-out control.
- Notes:
  - This makes the product feel more like a guided demo than a finished workspace on first entry, especially on small screens.

### 3. External asset strategy is noisy and generates console warnings
- Severity: low to medium
- Repro: load the dashboard and inspect console/network logs.
- Result: the app emits preload warnings for the logo asset and makes blocked external requests to Fluidplayer/CDN resources.
- Evidence:
  - `src/lib/utils/cdn-optimizer.ts:163-183` preloads `/assets/cryonex-logo-official.png`.
  - `index.html:51-52` loads `fluidplayer.min.css` and `fluidplayer.min.js` globally.
  - Console warnings reported the logo preload was not used quickly after load, and network logs showed ORB-blocked requests for Fluidplayer CSS and the CDN logo asset.
- Notes:
  - This does not break the dashboard outright, but it contributes to a brittle, less premium feel.

## Positive Checks
- No horizontal overflow at `390x844` on the tested dashboard route.
- Core dashboard content rendered and the empty state was coherent once overlays were dismissed.

## Recommendation
- Prioritize simplifying or delaying first-run overlays on mobile.
- Reduce stacked tutorial surfaces so only one guided layer can appear at a time.
- Clean up preload / third-party asset loading so the console stays quiet on first paint.
