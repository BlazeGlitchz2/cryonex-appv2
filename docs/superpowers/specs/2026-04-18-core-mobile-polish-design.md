# Core Mobile Polish Design

**Date:** 2026-04-18

**Scope:** First release slice for phone-first mobile polish on iPhone and Android. This slice targets study/chat-heavy flows and only includes shell changes that directly improve perceived smoothness there.

## Goal

Make the phone experience feel more native and flowy by stabilizing keyboard/composer behavior, reducing layout jumpiness, and trimming heavy visual layers in the most-used study/chat paths.

## Non-Goals

- No tablet/iPad-first redesign in this slice.
- No full offline native LLM hardening in this slice.
- No broad routing rewrite for the whole app shell.
- No native store/release packaging work beyond build verification.

## Approved Visual Direction

The approved direction is `Native Focused`:

- lighter layers over heavy glass
- shorter motion instead of dramatic motion
- stable bottom composer and dock behavior
- premium look without touch-performance drag

## Current Constraints

- The phone chat path in [src/pages/App.tsx](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/pages/App.tsx) currently combines a fixed, body-portal composer with separate scroll padding compensation.
- Keyboard visibility is inferred in [src/components/AppLayout.tsx](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/AppLayout.tsx) and written to CSS vars in [src/lib/mobile-shell.ts](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/lib/mobile-shell.ts), but chat layout does not consume that shared model.
- Touch surfaces still rely on blur and layered overlays that are heavier than necessary for native webviews.

## Architecture

This slice keeps the existing phone-specific routes and introduces a shared mobile viewport/composer model instead of adding more route-specific offsets. The main idea is to make the phone chat surface consume a single source of truth for:

- safe-area bottom inset
- native keyboard height
- mobile dock visibility
- composer height

That shared model will drive both:

- the fixed composer placement
- the scrollable content bottom padding

This removes the current mismatch where the composer and message list each estimate space differently.

## Components and File Responsibilities

- [src/lib/mobile-shell.ts](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/lib/mobile-shell.ts)
  - remains the source of route chrome and keyboard state primitives
  - gains shared helper logic for effective mobile viewport spacing
- [src/components/AppLayout.tsx](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/AppLayout.tsx)
  - stays responsible for shell-level phone header/dock visibility
  - stops duplicating spacing assumptions that should belong to the shared viewport model
- [src/pages/App.tsx](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/pages/App.tsx)
  - becomes the first consumer of the shared mobile viewport/composer model
  - stops hardcoding extra touch-shell padding values
- [src/hooks/use-input-padding.ts](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/hooks/use-input-padding.ts)
  - shifts from “composer height plus a magic number” to “measured composer height plus shared shell insets”
- [src/components/chat/ChatInputArea.tsx](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/chat/ChatInputArea.tsx)
  - keeps rendering responsibility for the composer
  - switches fixed bottom placement to shared CSS vars/class usage rather than route-local constants
- [src/index.css](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/index.css)
  - receives the minimal CSS variables and touch-shell utility styles needed for consistent phone composer behavior
  - reduces blur/layer intensity for touch-focused surfaces in this slice

## Data and Layout Flow

1. Native/mobile shell code updates keyboard visibility and `--native-keyboard-height`.
2. Shared mobile-shell spacing helpers derive the effective phone bottom inset from:
   - safe area
   - dock visibility
   - keyboard visibility and height
3. Chat composer positioning uses the shared inset.
4. Message list bottom padding uses the same inset plus measured composer height.
5. Visual treatment on touch devices uses lighter overlays and shorter transitions to reduce perceived lag.

## Behavior Changes

### Chat and Study/Assistant Flow

- The message list should no longer “fight” the fixed composer when the keyboard opens.
- The last assistant response should sit above the composer consistently on phone.
- Composer motion should feel anchored instead of floaty when keyboard state changes.
- Empty-state and active-chat layouts should share the same bottom spacing rules.

### Shell Feel

- Phone routes in this slice keep their current information architecture.
- Motion stays present, but shorter and calmer.
- Heavy glass/blur density is reduced on touch surfaces involved in study/chat work.

## Error Handling

- If keyboard metrics are missing, spacing falls back to safe-area-based defaults.
- If the composer cannot be measured yet, the message list uses a safe fallback bottom padding that preserves usability.
- Changes in route chrome must not break existing immersive workspace behavior.

## Testing Strategy

### Unit Tests

- add tests for shared mobile spacing helpers in [src/lib/mobile-shell.test.ts](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/lib/mobile-shell.test.ts)
- add tests for composer padding calculation in a new focused test around the viewport/composer helper

### Build Verification

- run targeted vitest coverage for the new helpers
- run the project build to verify this slice does not regress the shared web bundle

## Risks

- The repo already has unrelated local changes; this slice must avoid disturbing them.
- The build may still fail on pre-existing issues outside mobile polish work.
- Some visual smoothness wins will depend on real-device QA beyond unit tests.

## Release Boundary

This slice is complete when:

- phone chat/composer spacing is driven by one shared model
- touch-shell surfaces are visually lighter in the study/chat path
- targeted tests pass
- build status is reported with fresh evidence

## Notes

- `.superpowers/` should be added to `.gitignore` to avoid committing brainstorm artifacts.
