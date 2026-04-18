# Core Mobile Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the phone study/chat path feel more native by unifying keyboard-safe-area-composer spacing and reducing heavy touch-surface visual weight.

**Architecture:** Keep the current phone-first route structure, but replace hardcoded chat shell offsets with one shared mobile viewport/composer spacing model. Apply the model first to the assistant/chat path, then trim touch-heavy visual treatments that most affect perceived smoothness.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Framer Motion, Tailwind utility classes, Capacitor mobile shell hooks

---

### Task 1: Shared mobile viewport spacing helpers

**Files:**
- Modify: `src/lib/mobile-shell.ts`
- Test: `src/lib/mobile-shell.test.ts`

- [ ] **Step 1: Write the failing test**

Add a helper-focused test that proves phone bottom spacing changes correctly for dock-visible, dock-hidden, and keyboard-visible cases.

```ts
it("derives phone bottom insets from dock and keyboard state", () => {
  expect(
    getPhoneBottomInset({
      dockVisible: true,
      keyboardHeight: 0,
      keyboardVisible: false,
      safeAreaBottom: 12,
    }),
  ).toBe(96);

  expect(
    getPhoneBottomInset({
      dockVisible: false,
      keyboardHeight: 0,
      keyboardVisible: false,
      safeAreaBottom: 12,
    }),
  ).toBe(28);

  expect(
    getPhoneBottomInset({
      dockVisible: true,
      keyboardHeight: 318,
      keyboardVisible: true,
      safeAreaBottom: 12,
    }),
  ).toBe(330);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: FAIL because `getPhoneBottomInset` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add a focused exported helper in `src/lib/mobile-shell.ts`.

```ts
export interface PhoneBottomInsetArgs {
  safeAreaBottom: number;
  dockVisible: boolean;
  keyboardVisible: boolean;
  keyboardHeight: number;
}

export function getPhoneBottomInset({
  safeAreaBottom,
  dockVisible,
  keyboardVisible,
  keyboardHeight,
}: PhoneBottomInsetArgs) {
  if (keyboardVisible && keyboardHeight > 0) {
    return keyboardHeight + safeAreaBottom;
  }

  return safeAreaBottom + (dockVisible ? 84 : 16);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mobile-shell.ts src/lib/mobile-shell.test.ts
git commit -m "feat: add shared phone bottom inset helper"
```

### Task 2: Composer padding model for the chat surface

**Files:**
- Modify: `src/hooks/use-input-padding.ts`
- Modify: `src/pages/App.tsx`
- Test: `src/lib/mobile-shell.test.ts`

- [ ] **Step 1: Write the failing test**

Add a helper-level test for message-list padding that combines composer height and shared bottom inset.

```ts
it("builds message list padding from composer height and phone inset", () => {
  expect(
    getComposerScrollPadding({
      composerHeight: 72,
      phoneBottomInset: 96,
      extraClearance: 12,
    }),
  ).toBe(180);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: FAIL because `getComposerScrollPadding` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Add the helper to `src/lib/mobile-shell.ts`, then consume it from `use-input-padding.ts` and `App.tsx`.

```ts
export function getComposerScrollPadding({
  composerHeight,
  phoneBottomInset,
  extraClearance = 12,
}: {
  composerHeight: number;
  phoneBottomInset: number;
  extraClearance?: number;
}) {
  return composerHeight + phoneBottomInset + extraClearance;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mobile-shell.ts src/hooks/use-input-padding.ts src/pages/App.tsx src/lib/mobile-shell.test.ts
git commit -m "feat: unify phone composer and scroll padding"
```

### Task 3: Replace hardcoded phone composer offsets

**Files:**
- Modify: `src/components/chat/ChatInputArea.tsx`
- Modify: `src/pages/App.tsx`
- Modify: `src/index.css`
- Test: `src/lib/mobile-shell.test.ts`

- [ ] **Step 1: Write the failing test**

Add a focused regression test for the composer class/spacing helper if extracted, or for the helper values that feed it.

```ts
it("keeps keyboard spacing independent from dock spacing", () => {
  const keyboardInset = getPhoneBottomInset({
    safeAreaBottom: 0,
    dockVisible: true,
    keyboardVisible: true,
    keyboardHeight: 260,
  });

  const dockInset = getPhoneBottomInset({
    safeAreaBottom: 0,
    dockVisible: true,
    keyboardVisible: false,
    keyboardHeight: 0,
  });

  expect(keyboardInset).toBe(260);
  expect(dockInset).toBe(84);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: FAIL until the helper behavior matches this contract.

- [ ] **Step 3: Write minimal implementation**

Use shared CSS variables/styles in `ChatInputArea.tsx` instead of fixed `bottom-[calc(...)]` values, and feed those values from `App.tsx`.

```ts
style={
  useTouchShell && !isHero
    ? { bottom: "var(--phone-composer-bottom, 0px)" }
    : undefined
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/ChatInputArea.tsx src/pages/App.tsx src/index.css src/lib/mobile-shell.test.ts
git commit -m "refactor: remove hardcoded phone composer offsets"
```

### Task 4: Reduce touch-heavy visual weight on the chat lane

**Files:**
- Modify: `src/pages/App.tsx`
- Modify: `src/components/chat/ChatInputArea.tsx`
- Modify: `src/index.css`
- Test: `src/lib/mobile-shell.test.ts`

- [ ] **Step 1: Write the failing test**

Add a helper-level test for any extracted touch-surface mode helper, or if no helper is needed, skip unit creation and treat the build as the verification boundary for this cosmetic task.

```ts
it("preserves helper behavior after touch-shell polish changes", () => {
  expect(
    getComposerScrollPadding({
      composerHeight: 60,
      phoneBottomInset: 84,
    }),
  ).toBe(156);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: FAIL until helper expectations and implementation are aligned.

- [ ] **Step 3: Write minimal implementation**

Reduce blur/shadow/background intensity on phone touch surfaces in the assistant/chat lane without changing the route structure.

```ts
const touchShellSurfaceClass = useTouchShell
  ? "border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] shadow-[0_12px_36px_rgba(4,2,18,0.22)]"
  : "...existing desktop/tablet treatment...";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/App.tsx src/components/chat/ChatInputArea.tsx src/index.css src/lib/mobile-shell.test.ts
git commit -m "style: lighten touch shell visuals for phone chat"
```

### Task 5: Verify the first slice

**Files:**
- Modify: `.gitignore`
- Verify: `docs/superpowers/specs/2026-04-18-core-mobile-polish-design.md`
- Verify: `docs/superpowers/plans/2026-04-18-core-mobile-polish-plan.md`

- [ ] **Step 1: Add brainstorm artifacts to gitignore**

```gitignore
.superpowers/
```

- [ ] **Step 2: Run targeted tests**

Run: `npm test src/lib/mobile-shell.test.ts`
Expected: PASS

- [ ] **Step 3: Run mobile-related hook tests**

Run: `npm test src/hooks/use-mobile.test.tsx`
Expected: PASS

- [ ] **Step 4: Run full build verification**

Run: `npm run build`
Expected: PASS, or a clear report of any remaining pre-existing failures

- [ ] **Step 5: Commit**

```bash
git add .gitignore docs/superpowers/specs/2026-04-18-core-mobile-polish-design.md docs/superpowers/plans/2026-04-18-core-mobile-polish-plan.md
git commit -m "docs: capture first mobile polish slice"
```
