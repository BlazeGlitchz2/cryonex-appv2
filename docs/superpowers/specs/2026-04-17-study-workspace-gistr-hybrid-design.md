# Study Workspace Redesign: Gistr-Inspired Hybrid Notebook

Date: 2026-04-17
Status: Proposed
Owner: Codex

## Summary

Cryonex should redesign the study workspace to feel much closer to Gistr's calm, source-first notebook experience while remaining more capable. The workspace should stop feeling like a tabbed tool launcher and start feeling like a living study notebook with a quiet, always-available AI copilot.

The winning direction is a hybrid of:

- notebook-first reading, notes, and synthesis in the center
- persistent but visually secondary source-grounded AI on the right
- current Cryonex study generators reframed as contextual tools rather than the main navigation model

This redesign must also make light mode the default theme for the workspace and, ideally, the broader app shell.

## Goals

- Make the workspace feel immediately comparable to Gistr in clarity, calmness, and source-first thinking.
- Keep Cryonex stronger than Gistr by preserving flashcards, quizzes, maps, gaps, and occlusion workflows.
- Reduce the sense of "many tools competing for attention" in the current desktop workspace.
- Land users in a useful notebook immediately, even before every generated asset is ready.
- Preserve the existing `docId` and `materialId` routing and Convex data model wherever possible.

## Non-Goals

- Rebuild all study-generation logic from scratch.
- Change the upload, sharing, or pack schema in phase one.
- Ship full multi-user collaboration in this pass.
- Expand the brand system into a fully general multi-theme engine in this pass.
- Depend on external BioRender tooling for initial release behavior.

## Product Thesis

The study workspace should feel like a smart notebook built around a source, not a dashboard built around features.

The source and notebook are the primary surfaces.
The copilot is ever-present, but quieter than the source.
Generated study tools are nearby, but should no longer replace the notebook as the main experience.

## User Experience Principles

1. Source first
The user should always understand what document they are studying and where notebook content came from.

2. Notebook as default
Opening a study document should always land in the notebook canvas, not in a feature tab.

3. AI as assistant, not scenery
AI should remain highly available, but should not dominate the layout, color, or hierarchy.

4. Light by default
The workspace should feel like paper, annotation, and study flow first. Dark mode remains supported, but is not the default entry state.

5. Progressive readiness
Users should be able to begin reading, annotating, and asking questions immediately while generated sections stream in.

6. Stronger than Gistr
Cryonex should keep advanced study workflows, but surface them at the moment they are useful instead of making them the main frame.

## Information Architecture

### Desktop Layout

The desktop workspace should use a three-zone layout:

- Left rail
  - document identity
  - source outline or section jump list
  - compact workspace navigation
  - study status indicators

- Center notebook canvas
  - the default workspace surface
  - summary, notes, highlights, AI insertions, and generated blocks
  - focus mode capable

- Right copilot rail
  - source-grounded Q&A
  - follow-up prompts
  - recommended actions
  - quick conversion actions such as create flashcards or quiz from selection

### Mobile Layout

Mobile should preserve the same mental model:

- notebook canvas remains the default landing surface
- copilot opens in a bottom sheet or stacked panel
- source outline and tools collapse into compact menus and sheets

Mobile chrome can differ, but the conceptual model must match desktop so users are not relearning the app.

## Notebook Model

The notebook should become the main study surface for a `docId`.

Phase one does not need a full Notion-like custom block editor. Instead, it should introduce a composed notebook surface that renders structured sections in a notebook layout and allows the user to:

- read generated summary content
- view and edit notes
- pin AI answers into the notebook
- jump from notebook content back to source evidence
- trigger generation actions from notebook context

Initial notebook sections:

- Overview
  - AI summary
  - source metadata
  - readiness/progress state

- Key Ideas
  - extracted concepts
  - optionally concept-map preview cards

- Notes
  - user-authored or persisted notebook notes

- Study Tools
  - flashcards preview
  - quiz preview
  - map preview
  - knowledge gaps preview

- Evidence
  - source grounding snippets
  - source-linked highlights

These should feel like one composed notebook, not separate tabs disguised as sections.

## Interaction Model

### Default Entry

When a user opens `/study/workspace/:docId`, the app should always show the notebook canvas first.

If generation is incomplete:

- render notebook skeleton sections immediately
- show which sections are ready, loading, or not yet generated
- let the user chat with the source immediately
- let the user add notes immediately

### Copilot Behavior

The copilot rail should remain visible on desktop but should be visually quieter than it is now.

It should support:

- source-grounded chat
- inline suggested prompts
- follow-up threading
- turning answers into notebook entries
- actions such as "make flashcards from this answer"

The right rail should not visually outweigh the notebook.

### Study Tool Access

Current tools should be reframed:

- flashcards: compact preview in notebook, full experience in drawer/sheet/detail panel
- quizzes: compact preview in notebook, full experience in drawer/sheet/detail panel
- concept map: preview card in notebook, expanded visualization on demand
- knowledge gaps: progress module in notebook, detailed view on demand
- image occlusion: tool action launched from relevant visual study content

This preserves capability while improving hierarchy.

### Focus Mode

The notebook should support a focused reading/writing mode where one or both side rails collapse.

Focus mode should:

- enlarge the notebook width
- reduce chrome
- keep a fast way to reopen copilot and source navigation

## Visual System

### Direction

The visual direction should be a hybrid:

- primarily calm, editorial, notebook-like, and light
- with restrained Cryonex depth, glow, and motion accents

This is intentionally not a direct Gistr clone and not a continuation of the current heavy cosmic glass aesthetic.

### Core Changes

- Light theme becomes default.
- Workspace surfaces shift toward paper and neutral editorial tones.
- Cyan/blue Cryonex accents are reserved for focus, AI, active states, and key actions.
- Blur and glass effects are reduced significantly in the workspace.
- Borders become softer and more structural.
- Typography favors readability and hierarchy over spectacle.

### Surface Rules

- The notebook canvas should feel like the main sheet.
- The left rail should be quiet and structural.
- The right rail should feel assistive, not promotional.
- Cards should be used sparingly; the center should read like a composed document.
- Motion should emphasize section readiness, rail transitions, and insertion of AI results into the notebook.

## Theme Behavior

Light theme should be the default app theme for new and returning users unless they have explicitly chosen a different preference.

Requirements:

- update theme store default mode to light
- ensure first-load chrome, workspace shell, and notebook surfaces render correctly in light mode
- preserve dark mode support
- ensure mobile and desktop defaults are aligned

## Data and State Strategy

The redesign should preserve current core routing and Convex identities:

- `docId` remains the workspace route key
- `materialId` remains the content-generation anchor
- existing summary, flashcard, quiz, map, pack, and study session data remain usable

Phase one should avoid a disruptive schema rewrite. Instead:

- reuse current generated assets as notebook sections
- improve `studyNotes` integration so notes are actually notebook-backed rather than mostly display-only
- standardize both upload and intent-routing flows to open notebook immediately and stream content readiness into it

## Component Strategy

### New or Reworked Components

- `StudyWorkspaceShell`
  - top-level hybrid shell
  - manages rail visibility, focus mode, and responsive structure

- `StudyNotebookCanvas`
  - renders notebook sections in order
  - owns skeleton and readiness states

- `StudyNotebookSection`
  - shared section wrapper for overview, notes, tools, and evidence

- `StudyCopilotRail`
  - quieter replacement for current always-on chat panel

- `StudySourceRail`
  - document identity, outline, and quick jumps

- `StudyToolDrawer`
  - reusable container for expanded flashcards/quizzes/maps/gaps

### Existing Components to Reuse or Adapt

- `PDFChat`
- `StudyNotes`
- `StudyFlashcards`
- `StudyQuizzes`
- `StudyConceptMap`
- `KnowledgeGapDashboard`
- `SourceGroundingPanel`
- `StudyWorkspaceNextSteps`
- `StudyWorkspaceLayout`

The intent should be adaptation before replacement where possible.

## Data Flow

Target flow:

1. user uploads or routes from study intent
2. app ensures material/workspace identity
3. app opens notebook immediately
4. notebook renders source identity plus planned section skeletons
5. summary and notebook-ready content stream in
6. secondary study tools become available as previews and expandable actions
7. user can ask AI, pin answers, and continue studying without changing screens

This resolves the current mismatch between upload behavior and intent-router behavior.

## Error Handling

The redesigned workspace should degrade gracefully.

Requirements:

- if source content is missing, show a recoverable notebook empty state
- if generated assets fail, notebook still remains usable for source reading, notes, and chat
- if copilot fails, notebook and source rails remain functional
- if a specific tool fails, mark that section unavailable without breaking the notebook
- loading states should be section-level wherever possible, not full-page blockers

## Accessibility and Performance

Requirements:

- preserve readable contrast in light mode
- support keyboard navigation across notebook and rails
- keep motion subtle and respect reduced-motion preferences
- avoid introducing heavy visual effects into routine workspace surfaces
- lazy-load heavy study tools until invoked
- keep chat and notebook responsive while background generation runs

## Testing Strategy

### Product Verification

- opening a doc lands in notebook by default
- light mode is default on first load
- existing dark mode toggle still works
- chat remains source-grounded and usable
- flashcards/quizzes/maps still open successfully from their new entry points
- upload and intent-router flows now feel consistent

### Technical Verification

- unit tests for theme default behavior and workspace routing state
- integration tests for notebook-first entry and rail behavior
- regression tests for flashcard, quiz, and note access
- manual responsive checks for desktop and mobile workspace layouts

## Rollout Plan

Phase 1:

- light theme default
- new workspace surface palette
- notebook-first desktop shell
- quieter persistent copilot rail

Phase 2:

- notebook-backed notes improvements
- contextual tool drawers and previews
- consistent progressive loading for upload and intent-router flows

Phase 3:

- mobile parity polish
- richer visual study modules and simulations where appropriate
- shared notebook evolution from current pack/share model

## Risks

- The current workspace styling is heavily hardcoded and dark/glass biased, so visual cleanup will touch more than one file.
- Existing users may rely on explicit tabs, so tool discoverability must remain strong.
- If notebook sections are only visual wrappers around old components, the redesign may look better without feeling better.
- Light mode default can expose styling regressions across unrelated surfaces if applied too broadly without guardrails.

## Recommendation

Implement the redesign as a notebook-first hybrid shell that keeps a persistent but quieter copilot, uses light theme by default, and preserves existing Cryonex study power through contextual tool access.

This is the closest path to "Gistr, but better" without throwing away the current product's differentiators or backend model.
