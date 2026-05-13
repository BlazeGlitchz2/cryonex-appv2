# Security Audit Report

Date: 2026-05-13

## Executive Summary

I completed a repository-grounded security audit of the web app and desktop app surfaces that were available in this workspace. I fixed the concrete browser-side URL handling issue that allowed untrusted URLs from shared content and AI/source metadata to flow into `href` and `window.open`, and I enabled a baseline CSP for the Tauri desktop app where CSP had been fully disabled.

Live dependency advisory checks via `npm audit` could not run in this environment because outbound registry access is blocked, so package-vulnerability coverage in this run is limited to static repo inspection and lockfile/code review.

## Fixed Findings

### High

#### SEC-001: Untrusted URLs were used directly in browser navigation sinks

Impact: attacker-controlled `javascript:` or other unsafe schemes could execute in the browser when users opened shared resources or AI/source-generated links.

Evidence before fix:

- [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/pages/SharedMaterial.tsx:199`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/pages/SharedMaterial.tsx:199) opened `(data as any).url` directly with `window.open(...)`.
- [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/source-preview.tsx:239`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/source-preview.tsx:239) and [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/source-preview.tsx:250`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/source-preview.tsx:250) rendered source URLs into anchors.
- [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/sources.tsx:43`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/sources.tsx:43), [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/inline-citation.tsx:33`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/inline-citation.tsx:33), [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/chat/MobileMarkdownRenderer.tsx:180`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/chat/MobileMarkdownRenderer.tsx:180), and [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/message.tsx:535`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/components/ui/message.tsx:535) all accepted dynamic URLs without protocol allowlisting.

Fix:

- Added centralized URL validation in [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/lib/safe-url.ts:1`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/src/lib/safe-url.ts:1) that only permits `http:` and `https:`.
- Updated the affected components to use sanitized URLs or render inert fallbacks when the URL is unsafe.

### Medium

#### SEC-002: Tauri desktop app disabled CSP entirely

Impact: any renderer XSS in the desktop app would have had fewer browser-layer mitigations before reaching native Tauri commands.

Evidence before fix:

- [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/tauri.conf.json:21`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/tauri.conf.json:21) previously set `"csp": null`.

Fix:

- Replaced the null CSP with a restrictive baseline policy in [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/tauri.conf.json:21`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/tauri.conf.json:21).

## Remaining Risks Requiring Human Intervention

1. The desktop app still exposes native Tauri commands in [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/src/lib.rs:24`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/src/lib.rs:24) and [`/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/src/lib.rs:47`](/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app/src-tauri/src/lib.rs:47). The current `install_program` implementation is only a stub, but before any real installer/download behavior ships it needs an explicit allowlist, signature verification, and command execution review.

## Verification

- `npm run build` in `/Users/hamzaahmad/Downloads/cryonex-appv2-main`
- `pnpm build` in `/Users/hamzaahmad/Downloads/cryonex-appv2-main/desktop-app`
