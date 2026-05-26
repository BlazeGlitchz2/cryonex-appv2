# Premium Mobile Desktop UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a medium-high visual polish pass to Cryonex desktop and mobile UI without changing the product idea, while fixing visible accessibility and mobile interaction bugs in the touched surfaces.

**Architecture:** Add shared warm-premium UI tokens/classes in `src/index.css`, then consume them in existing mobile onboarding/home and desktop/mobile shared surfaces. Keep the current routes and product model intact: Cryonex remains a source-first AI study workspace, not a social map or shopping app.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind v4, Framer Motion, Radix/shadcn primitives, lucide icons, Vitest, Browser plugin QA.

---

## File Structure

- Modify `src/index.css`: warm-gold premium tokens, surface utilities, responsive visual polish, reduced-motion support.
- Modify `src/components/onboarding/MobileOnboarding.tsx`: premium source-orbit onboarding visual, accessible close/skip/dots, reduced-motion aware transitions.
- Modify `src/pages/MobileHome.tsx`: mobile home cockpit polish using existing data and actions.
- Modify `src/components/mobile/MobileDesktopSurface.tsx`: shared desktop/mobile surface shell polish that affects desktop and mobile screens safely.
- Add/modify tests near touched behavior where practical: onboarding slide/accessibility assertions and mobile surface smoke coverage.

## Task 1: Baseline Tests And Bug Reproduction

**Files:**

- Test: `src/components/onboarding/MobileOnboarding.test.tsx`
- Test: existing tests around mobile shell/home if available.

- [ ] **Step 1: Inspect existing onboarding test coverage**

Run: `sed -n '1,260p' src/components/onboarding/MobileOnboarding.test.tsx`

Expected: Identify whether tests cover skip/CTA/dots/accessibility.

- [ ] **Step 2: Add failing tests for accessible controls**

Add assertions that visible mobile onboarding controls expose accessible names for skip, close behavior, next/open actions, and slide dots.

- [ ] **Step 3: Run the focused test and confirm failure**

Run: `npm test -- src/components/onboarding/MobileOnboarding.test.tsx --runInBand`

Expected: FAIL before implementation if aria labels are missing or test command shows the repo-specific Vitest syntax needs adjustment.

## Task 2: Warm Premium Token Layer

**Files:**

- Modify: `src/index.css`

- [ ] **Step 1: Add CSS variables**

Add warm premium variables under `:root` without removing existing cyan/cosmic tokens:

```css
--premium-bg: #030010;
--premium-bg-2: #08030f;
--premium-surface: rgba(16, 10, 24, 0.78);
--premium-surface-solid: #100a18;
--premium-surface-strong: rgba(23, 18, 31, 0.92);
--premium-border: rgba(255, 255, 255, 0.1);
--premium-border-warm: rgba(245, 181, 68, 0.28);
--premium-gold: #f5b544;
--premium-ember: #f97316;
--premium-cyan: #06b6d4;
--premium-text: #f8f5ee;
--premium-muted: #b9b0a3;
```

- [ ] **Step 2: Add shared utility classes**

Add reusable `.premium-study-shell`, `.premium-study-panel`, `.premium-study-card`, `.premium-study-cta`, `.premium-source-orbit`, and reduced-motion rules.

- [ ] **Step 3: Verify CSS compiles**

Run: `npm run build`

Expected: CSS/Tailwind compilation succeeds or only unrelated pre-existing errors remain.

## Task 3: Mobile Onboarding Polish And Bugs

**Files:**

- Modify: `src/components/onboarding/MobileOnboarding.tsx`

- [ ] **Step 1: Use warm premium tokens**

Replace one-off heavy gradient/glow layers with the new premium classes and keep slide-specific accents.

- [ ] **Step 2: Add original source-orbit visual**

Use existing slide data to render source/study nodes. Do not copy avatar/social layouts from references.

- [ ] **Step 3: Fix accessibility bugs**

Add `aria-label` to close/skip and carousel dot controls, `aria-current` on active dots, and clear button names for next/open actions.

- [ ] **Step 4: Respect reduced motion**

Gate nonessential transition intensity with `window.matchMedia("(prefers-reduced-motion: reduce)")`.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/components/onboarding/MobileOnboarding.test.tsx`

Expected: PASS.

## Task 4: Mobile Home And Shared Surface Polish

**Files:**

- Modify: `src/pages/MobileHome.tsx`
- Modify: `src/components/mobile/MobileDesktopSurface.tsx`

- [ ] **Step 1: Polish shared shell**

Apply premium background, warmer border lighting, readable surface contrast, and restrained depth.

- [ ] **Step 2: Polish mobile home cockpit**

Keep the same actions and route behavior, but improve hierarchy: source-first greeting, warm primary CTA, premium quick-action cards, and clearer suggestion cards.

- [ ] **Step 3: Fix interaction semantics**

Ensure button labels and clickable action cards are real buttons with stable accessible names. Preserve haptics and navigation.

- [ ] **Step 4: Run targeted tests**

Run relevant mobile/home tests discovered in Task 1.

Expected: PASS or document unrelated pre-existing failures.

## Task 5: Rendered QA

**Files:**

- No source files unless QA finds issues in touched surfaces.

- [ ] **Step 1: Start dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite serves locally.

- [ ] **Step 2: Browser desktop check**

Use Browser plugin on a desktop viewport. Target flow: app loads -> first meaningful public/mobile route renders -> no error overlay or console errors from touched code.

- [ ] **Step 3: Browser mobile check**

Use Browser plugin on a mobile viewport. Target flow: mobile-sized app route renders -> onboarding/home surfaces fit -> primary controls visible and not overlapped.

- [ ] **Step 4: Final verification**

Run: `npm run build` and focused tests again.

Expected: No new failures from this slice.
