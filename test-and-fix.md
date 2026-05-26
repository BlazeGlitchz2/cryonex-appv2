# Plan: Cryonex Test and Fix Suite

## Overview
This plan specifies the end-to-end verification, stress testing, and issue resolution for the Cryonex application. We are focusing on Simulated Mobile + Web priority using the live Convex Sandbox backend.

## Project Type
- **MOBILE & WEB**: Hybrid hybrid-native wrapper (Capacitor 8) and Web app (React 19 + Vite 6 + Tailwind v4 + Convex).

## Success Criteria
1. **Zero High/Critical Audits**: All checklist and security scan blockers are resolved.
2. **Comprehensive Test Suite**: All 126+ standard unit/integration tests and newly implemented **Stress Tests** pass cleanly in Vitest.
3. **Responsive UI & UX Compliance**: Visual and accessibility flaws (touch targets, contrast) corrected app-wide.
4. **Stable Production Build**: Production builds successfully compilation checks without warnings or errors.

## Tech Stack
- React 19 / Vite 6 / TypeScript 5.8
- Tailwind CSS v4
- Capacitor 8 (Android & iOS wrappers)
- Vitest 4 (Unit & Integration testing)
- Playwright (E2E Web & simulated mobile testing)
- Convex Auth & Backend

## File Structure (Planned Changes)
- `src/lib/services/stress-testing.test.ts` [NEW]: Contains automated stress, load, and concurrency simulations.
- `src/components/...` [MODIFIED]: Visual updates to ensure premium responsiveness, contrast compliance, and tap sizes.

## Task Breakdown

### Task 1: Environment Setup and Branching
- **Agent**: `orchestrator`
- **Skills**: `stability-hygiene`
- **Priority**: P0
- **Dependencies**: None
- **INPUT**: Current git repository status.
- **OUTPUT**: Switched to `experiment/comprehensive-testing-and-fixing` branch.
- **VERIFY**: Run `git branch` and verify the active branch name.

### Task 2: Automated Diagnostic Scanning
- **Agent**: `security-auditor` / `frontend-specialist`
- **Skills**: `vulnerability-scanner`, `frontend-design`
- **Priority**: P0
- **Dependencies**: Task 1
- **INPUT**: Current codebase files.
- **OUTPUT**: Complete logs of `checklist.py`, `ux_audit.py`, and `security_scan.py`.
- **VERIFY**: Check the logs of each runner.

### Task 3: Implement Custom Feature Stress Tests
- **Agent**: `test-engineer`
- **Skills**: `testing-patterns`, `clean-code`
- **Priority**: P1
- **Dependencies**: Task 1
- **INPUT**: Existing Vitest testing architecture.
- **OUTPUT**: New file `src/lib/services/stress-testing.test.ts` covering concurrent state changes, theme transitions, and connection toggles.
- **VERIFY**: Run `npx vitest run stress-testing.test.ts` and confirm all stress assertions pass.

### Task 4: Fix Visual, Accessibility, and General Code Issues
- **Agent**: `frontend-specialist` / `debugger`
- **Skills**: `frontend-design`, `systematic-debugging`, `tailwind-patterns`
- **Priority**: P1
- **Dependencies**: Task 2, Task 3
- **INPUT**: Diagnostic scanning outputs and UX Audit logs.
- **OUTPUT**: Cleaned-up components with fixed tap target sizes, appropriate contrast, no banned purple colors, and correct typography hierarchy.
- **VERIFY**: Re-run the UX audit script and check that findings are cleared.

### Task 5: Build and Run Production Smoke Tests
- **Agent**: `devops-engineer` / `qa-automation-engineer`
- **Skills**: `deployment-procedures`, `webapp-testing`
- **Priority**: P2
- **Dependencies**: Task 4
- **INPUT**: Cleaned codebase.
- **OUTPUT**: Successful production bundle in `dist/` and passing Playwright specs.
- **VERIFY**: Run `npm run build` and `npx playwright test`.

---

## Phase X: Final Verification Checklist
- [ ] No purple/violet hex codes in modified files
- [ ] Socratic Gate was respected
- [ ] Security Scan passes cleanly
- [ ] UX Audit passes cleanly
- [ ] Vitest Suite (including stress tests) passes 100%
- [ ] Production build succeeds without errors
