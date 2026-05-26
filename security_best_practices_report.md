# Security Audit Report

## Executive Summary

I audited the React/Vite frontend and Convex backend with emphasis on authentication, authorization, storage access, redirect handling, backend configuration exposure, and secret handling in repo-tracked configuration. The current tree already contained some prior security fixes; during this run I verified them and closed two additional high-impact issues:

1. `chatWithPDF` could read a private study document by raw `docId` because it bypassed the access-checked query path.
2. Repo-tracked `.env` and `.env.local` files contained live credentials and tokens that should never remain committed.

Build verification passed with `npm run build`.

## Fixed Findings

### SEC-001

- Rule ID: REACT-CONFIG-001 / backend authz
- Severity: High
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/study.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/study.ts:1755), [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyMutations.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyMutations.ts:345)
- Evidence: both `generateUploadUrl` handlers returned `ctx.storage.generateUploadUrl()` without first requiring an authenticated user.
- Impact: anonymous users could obtain write-capable upload URLs and abuse Convex storage for unowned uploads, quota exhaustion, or staging untrusted content.
- Fix: both handlers now require an authenticated study user before minting the upload URL.
- Mitigation: keep storage ownership enforcement in downstream mutations and monitor storage growth for prior abuse.
- False positive notes: none; the handlers were directly callable mutations.

### SEC-002

- Rule ID: REACT-CONFIG-001
- Severity: Medium
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/keys.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/keys.ts:5)
- Evidence: `getProviderStatus` exposed backend provider configuration metadata without checking authentication.
- Impact: unauthenticated users could learn which AI providers and environment key names are active, which increases attack-surface mapping and targeted abuse attempts.
- Fix: the query now requires an authenticated user before returning provider status.
- Mitigation: if this page should become admin-only later, tighten the query to `requireAdmin`.
- False positive notes: the query did not expose raw secrets, but it still leaked operational configuration.

### SEC-003

- Rule ID: JS-XSS-001 / navigation hardening
- Severity: Medium
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/pages/NotesIndex.tsx`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/pages/NotesIndex.tsx:42)
- Evidence: a same-origin `message` event could set `window.location.href = event.data.url` directly.
- Impact: any compromised same-origin context could force navigation to unexpected in-app routes, including auth-related paths and crafted query strings.
- Fix: the redirect now passes through `sanitizeRedirectTarget(...)` and uses the normalized safe path.
- Mitigation: keep `postMessage` contracts narrow and validate message shape strictly if this flow grows.
- False positive notes: the existing same-origin check reduced severity, but the URL payload was still insufficiently constrained.

### SEC-004

- Rule ID: secure baseline browser policy
- Severity: Low
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/index.html`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/index.html:45)
- Evidence: the document used `no-referrer-when-downgrade`, which still leaks full referrers on many cross-origin HTTPS requests.
- Impact: external services can receive more navigation context than necessary.
- Fix: the policy is now `strict-origin-when-cross-origin`.
- Mitigation: if analytics and ads do not require origin referrers, move further to `no-referrer`.
- False positive notes: this is defense-in-depth, not a primary exploit path.

### SEC-005

- Rule ID: REACT-CONFIG-001 / backend authz
- Severity: Medium
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyRuntime.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyRuntime.ts:23), [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyRuntime.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyRuntime.ts:54)
- Evidence: `getPipelineReadiness` and `getCopilotStatus` returned provider-readiness and copilot configuration details without authenticating the caller.
- Impact: unauthenticated callers could inventory OCR, generation, and copilot backends, which helps targeted abuse and infrastructure fingerprinting.
- Fix: both actions now require an authenticated user.
- Mitigation: if only staff need this operational visibility, reduce further to admin-only access.
- False positive notes: these actions did not leak raw secrets, but they did expose sensitive backend capability state.

### SEC-006

- Rule ID: backend authorization / least privilege
- Severity: High
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyRuntime.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/studyRuntime.ts:73)
- Evidence: `create21stToken` accepted `args.agent` and used it as `agent: agentSlug` when minting the token.
- Impact: an authenticated user could mint a short-lived token for an arbitrary 21st agent reachable by the shared backend API key, expanding access beyond the intended study copilot.
- Fix: token minting is now pinned to `AGENT_21ST_STUDY_COPILOT`, and mismatched caller-supplied slugs are rejected.
- Mitigation: if multiple agents must be supported later, move to an explicit server-side allowlist instead of raw caller input.
- False positive notes: severity depends on what other agents the backing 21st account can access, but the privilege-expansion path was real.

### SEC-007

- Rule ID: backend object-level authorization
- Severity: High
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/autoGenerate.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/autoGenerate.ts:747), [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/autoGenerate.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/autoGenerate.ts:1230)
- Evidence: `generateAllAssets` and `generateQuiz` loaded `internal.study.getMaterial` by caller-supplied `materialId` but did not verify that the authenticated user owned that record.
- Impact: any authenticated user who learned another material ID could generate derived study assets or quizzes from another user’s private material, disclosing source content and consuming paid model capacity.
- Fix: both actions now require auth and reject materials whose `userId` does not match the current user.
- Mitigation: keep internal material lookups behind owner checks whenever an action takes raw IDs from the client.
- False positive notes: the issue depends on ID discovery, but Convex IDs often circulate through logs, URLs, and client state during normal app use.

### SEC-008

- Rule ID: backend object-level authorization
- Severity: High
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/knowledgeGaps.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/knowledgeGaps.ts:120)
- Evidence: `generateTargetedReview` read `internal.study.getMaterial` from a caller-supplied `materialId` and sent `material.content` to OpenRouter without authenticating the caller or checking ownership.
- Impact: an attacker could exfiltrate another user’s study material into model prompts and receive a derived summary/review back, turning a private-content leak into a direct remote disclosure path.
- Fix: the action now requires an authenticated user and enforces `material.userId === user._id`.
- Mitigation: apply the same owner-check pattern to any future action that accepts raw material IDs.
- False positive notes: none; this was a direct authorization gap on a paid external-call path.

### SEC-009

- Rule ID: backend abuse prevention
- Severity: Medium
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/autoGenerate.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/autoGenerate.ts:1330)
- Evidence: `improveSummary` accepted arbitrary caller input and used AI generation without authenticating the caller.
- Impact: unauthenticated traffic could consume shared model credits and backend capacity through a public action surface.
- Fix: the action now requires an authenticated user before invoking model generation.
- Mitigation: for high-volume workloads, also consider per-user quotas and rate limiting in addition to auth.
- False positive notes: this was primarily an abuse/cost exposure, not a cross-user data leak.

### SEC-010

- Rule ID: backend object-level authorization
- Severity: High
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/pdfChat.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/pdfChat.ts:95), [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/pdfChat.ts`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/convex/pdfChat.ts:364)
- Evidence: `chatWithPDF` loaded `internal.studyQuery.getDocumentInternal` from caller-supplied `docId`, then returned grounded answers and a storage-backed `pdfUrl` without applying the access checks used by `studyQuery.getDocument`.
- Impact: any authenticated user who learned another document ID could extract private study content and retrieve a signed file URL for that document.
- Fix: the action now calls `api.studyQuery.getDocument`, which enforces owner/share/school visibility checks before allowing access.
- Mitigation: keep raw internal document lookups off any client-reachable action unless the action performs its own object-level authorization first.
- False positive notes: none; this was a direct authorization bypass on a document retrieval path.

### SEC-011

- Rule ID: REACT-CONFIG-001 / secret management
- Severity: Critical
- Location: [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/.env`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/.env:1), [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/.env.local`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/.env.local:1)
- Evidence: tracked env files contained non-public API keys, passwords, and an OIDC token.
- Impact: anyone with repository or workspace access could use those credentials directly; if they were ever pushed or shared earlier, exposure persists even after local redaction.
- Fix: the tracked files were sanitized so secret-valued entries are now blank.
- Mitigation: move secrets to an untracked local secret source and keep only placeholders in tracked files.
- False positive notes: remediation in git history is not automatic; previously exposed credentials must still be rotated.

## Residual Risk Requiring Human Verification

1. Previously committed credentials still require human rotation and, if the repository was pushed/shared, git history cleanup. Local redaction does not invalidate already exposed tokens.
2. Runtime security headers are not fully visible from repo code. `Content-Security-Policy` with `frame-ancestors`, `X-Frame-Options`, and any edge-level `Permissions-Policy` still need deployment-path verification, because the static HTML shell cannot enforce all of them by itself.
