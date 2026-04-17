# Study Workspace Gistr Hybrid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a visibly Gistr-inspired, notebook-first study workspace with a quieter persistent copilot rail and light mode as the default experience.

**Architecture:** Keep the existing `docId`/`materialId` flow and Convex data sources, but replace the desktop workspace shell with a notebook-centric composition. Reuse current study generators as notebook sections and quick actions, while introducing a lighter workspace surface kit and a source rail. Preserve mobile behavior for this pass while avoiding regressions.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind v4, Zustand, Convex, Framer Motion, Vitest, Testing Library

---

### Task 1: Light Theme Default Behavior

**Files:**
- Modify: `src/lib/stores/theme-store.ts`
- Create: `src/lib/stores/theme-store.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it, beforeEach, vi } from "vitest";

describe("getStoredAppearance", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to light when no preference is stored", async () => {
    const mod = await import("./theme-store");
    expect(mod.getStoredAppearance()).toBe("light");
  });

  it("preserves an explicit persisted dark appearance", async () => {
    window.localStorage.setItem(
      "cryonex-theme-storage",
      JSON.stringify({ state: { appearance: "dark" } }),
    );
    const mod = await import("./theme-store");
    expect(mod.getStoredAppearance()).toBe("dark");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/stores/theme-store.test.ts`
Expected: FAIL because `getStoredAppearance` is not exported.

- [ ] **Step 3: Write minimal implementation**

Export `getStoredAppearance` from `src/lib/stores/theme-store.ts` and keep the no-storage default as `"light"` for first load.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/stores/theme-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/theme-store.ts src/lib/stores/theme-store.test.ts
git commit -m "test: lock light theme default behavior"
```

### Task 2: Notebook Section Model

**Files:**
- Create: `src/components/study/workspace/study-workspace-sections.ts`
- Create: `src/components/study/workspace/study-workspace-sections.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { buildStudyWorkspaceSections } from "./study-workspace-sections";

describe("buildStudyWorkspaceSections", () => {
  it("returns overview, notes, tools, and evidence sections in notebook order", () => {
    const sections = buildStudyWorkspaceSections({
      summary: "Summary",
      transcriptText: "Cell biology transcript",
      flashcardCount: 3,
      quizCount: 2,
    });

    expect(sections.map((section) => section.id)).toEqual([
      "overview",
      "key-ideas",
      "notes",
      "study-tools",
      "evidence",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/study/workspace/study-workspace-sections.test.ts`
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create a pure helper that builds ordered notebook section metadata from workspace data so UI rendering stays predictable and testable.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/study/workspace/study-workspace-sections.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/study/workspace/study-workspace-sections.ts src/components/study/workspace/study-workspace-sections.test.ts
git commit -m "feat: add study notebook section model"
```

### Task 3: Desktop Workspace Shell Redesign

**Files:**
- Create: `src/components/study/workspace/StudyNotebookCanvas.tsx`
- Create: `src/components/study/workspace/StudySourceRail.tsx`
- Create: `src/components/study/workspace/StudyCopilotRail.tsx`
- Modify: `src/components/study/StudyWorkspaceLayout.tsx`
- Modify: `src/pages/StudyWorkspace.tsx`

- [ ] **Step 1: Write the failing component test**

```ts
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudyNotebookCanvas } from "./StudyNotebookCanvas";

describe("StudyNotebookCanvas", () => {
  it("renders notebook section headings and tool preview labels", () => {
    render(
      <StudyNotebookCanvas
        title="Biology Notes"
        sections={[
          { id: "overview", title: "Overview", content: "Summary" },
          { id: "study-tools", title: "Study Tools", content: "Flashcards" },
        ]}
      />,
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Study Tools")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/study/workspace/StudyNotebookCanvas.test.tsx`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Write minimal implementation**

Build a light, editorial notebook canvas plus source and copilot rails. Update `StudyWorkspaceLayout` and `StudyWorkspace.tsx` so desktop lands in the notebook-first shell, keeps the chat persistent on the right, and moves flashcards/quizzes/maps/gaps into contextual actions and notebook previews instead of primary navigation.

- [ ] **Step 4: Run targeted tests and app checks**

Run:
- `npm test -- src/components/study/workspace/StudyNotebookCanvas.test.tsx`
- `npm test -- src/components/study/workspace/study-workspace-sections.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/study/StudyWorkspaceLayout.tsx src/pages/StudyWorkspace.tsx src/components/study/workspace
git commit -m "feat: redesign desktop study workspace shell"
```

### Task 4: Notebook Styling and Notes Presentation

**Files:**
- Modify: `src/components/study/StudyNotes.tsx`
- Modify: `src/index.css`
- Modify: `src/components/study/StudyWorkspaceNextSteps.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudyNotes } from "./StudyNotes";

describe("StudyNotes", () => {
  it("shows notebook-style helper copy when rendered with generated content", () => {
    render(<StudyNotes content={"# Title"} title="Biology" />);
    expect(screen.getByText(/Notebook/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/study/StudyNotes.test.tsx`
Expected: FAIL because the new helper copy and test file do not exist.

- [ ] **Step 3: Write minimal implementation**

Restyle notes and workspace support surfaces toward a lighter notebook look, add workspace-specific CSS tokens/classes in `src/index.css`, and simplify the top action bar so it supports the notebook experience instead of feeling like a tab launcher.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/study/StudyNotes.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/study/StudyNotes.tsx src/components/study/StudyWorkspaceNextSteps.tsx src/index.css src/components/study/StudyNotes.test.tsx
git commit -m "feat: apply notebook workspace styling"
```

### Task 5: Verification

**Files:**
- Verify only

- [ ] **Step 1: Run unit tests**

Run: `npm test -- --runInBand`
Expected: PASS or a precise list of failures to address.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: exit code 0

- [ ] **Step 3: Review visual diff**

Run:
- `git diff -- src/pages/StudyWorkspace.tsx`
- `git diff -- src/components/study/StudyWorkspaceLayout.tsx`
- `git diff -- src/index.css`

Expected: confirms notebook-first, light-default implementation rather than unrelated churn.

- [ ] **Step 4: Commit final fixes**

```bash
git add src docs/superpowers/plans/2026-04-17-study-workspace-gistr-hybrid-plan.md
git commit -m "feat: ship gistr-inspired study workspace redesign"
```
