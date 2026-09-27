# Gates: Cryonex brand and interface repair

OWNS: src/components/**, src/pages/**, src/styles/**, src/hooks/use-focus-session-controller.ts, src/hooks/use-focus-session-controller.test.ts, src/lib/mobile-personalization.ts, src/main.tsx, scripts/verify-ui-brand.mjs, GATES.md, DESIGN_DIRECTION.md

Scope: Restore the original Cryonex identity and onboarding materials across the redesigned interface, use the configured 21st MCP for suitable components, and repair observed interface defects without losing existing flows.

- [x] G1: Brand surfaces render the repository's official logo rather than an invented mark.
  CHECK: node scripts/verify-ui-brand.mjs
  EXPECT: CRYONEX_BRAND_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=fc918145b9412f6150368aedcfe53b82ac5586abefc1d1d9f4594a9426d86066; exit=0; EXPECT=matched; output-sha256=909b3219bba2b755c51ba8a1150a384eb549ace3055da2314025018924c9a736; output-bytes=23; shell=/bin/sh; cwd=/Users/hamzaahmad/Downloads/cryonex-appv2-main; path=8ad39bd9f0a3/31 entries

- [x] G2: Login, navigation, collections, and study use the original plum, amber, tactile panel styling in dark mode and readable corresponding light surfaces.
  EVIDENCE: Original onboarding materials in src/index.css retained; shared refresh.css restores the cosmic base, plum panels, and original three-stop amber actions. Visually inspected login-brand-restored-dark.png, login-brand-restored-light.png, both login-brand-phone images, library-brand-dark.png, library-brand-light.png, study-brand-dark.png, study-brand-light.png, and both study-brand-phone images in output/playwright/. Official logo loads in desktop and phone navigation.

- [x] G3: The configured 21st MCP is queried for relevant interface components and any adopted component is adapted to Cryonex's identity.
  EVIDENCE: Authenticated the configured 21st MCP, listed its catalog tools, searched login, segmented tabs, and sidebar navigation, and retrieved demos 2428 and 26923. Catalog response artifacts are in output/playwright/21st-*.json. The segmented control is adapted in AccountModeSwitch with source attribution, keyboard support, pending-state disabling, reduced motion, and Cryonex materials. DESIGN_DIRECTION.md records both component sources.

- [x] G4: Login validation, code verification, connection status failures, focus session starts, guest navigation, and existing interface regressions pass the automated test suite.
  CHECK: npm run test -- --run --reporter=json --outputFile=output/playwright/ui-regression-report.json
  EXPECT: JSON report written to
  EVIDENCE: automatic-evidence=v1; definition-sha256=64e3c543b614ed4190853cbdaa66c8d38f206ec9fc3aff6cd115f45a4240ae9e; exit=0; EXPECT=matched; output-sha256=dd39cc23ceb00d3133ee57bb23379b7c1863b1c66f395aba0c02a176b9676a0b; output-bytes=231; shell=/bin/sh; cwd=/Users/hamzaahmad/Downloads/cryonex-appv2-main; path=8ad39bd9f0a3/31 entries

- [x] G5: The complete production application compiles and bundles successfully.
  CHECK: npm run build
  EXPECT: built in
  EVIDENCE: automatic-evidence=v1; definition-sha256=46d72eccd628b28a4b0e974e69890ad856bb5d28a16876531804fc540a571513; exit=0; EXPECT=matched; output-sha256=d946c3000efe319351ec7a01a140bccea206aaf752b8c6d3940de6dbf97a41c2; output-bytes=19652; shell=/bin/sh; cwd=/Users/hamzaahmad/Downloads/cryonex-appv2-main; path=8ad39bd9f0a3/31 entries

- [x] G6: Desktop and phone browser checks show readable, unclipped screens with keyboard access and working navigation, theme switching, forms, and study interactions.
  EVIDENCE: Real browser checks at 1200px and 375px confirmed matching scroll widths, loaded official logos, and readable light/dark screens; landing header also checked at 320px. Account switch arrow/Home keys update selection and focus. Invalid email focuses auth-email; global search opens Projects with Enter; project validation retains the form; Library opens/closes its dialog, validates title, searches, clears search, and switches views. Actual guest route opens from login and navigates Summary, Flashcards, and Quizzes; focus start shows the sign-in requirement without a mutation error. Phone tool drawer selects Summary. Announcement controls are 44px and inside the viewport, and dismissal persists seen. Reduced-motion emulation confirms auth transitions are disabled. Live provider delivery and authenticated saves are outside these browser checks.

- [x] G7: The change set has no whitespace errors.
  CHECK: git diff --check
  EXPECT: /^$/
  EVIDENCE: automatic-evidence=v1; definition-sha256=484e82411377bb68b697f5efb881f7a6acafb5df09ddde7f2966343a46239551; exit=0; EXPECT=matched; output-sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855; output-bytes=0; shell=/bin/sh; cwd=/Users/hamzaahmad/Downloads/cryonex-appv2-main; path=8ad39bd9f0a3/31 entries

- [x] G8: Unrelated existing edits and files are preserved.
  EVIDENCE: Reviewed the final diff and original dirty-file inventory. Existing .env.example, index.html, nanoclaw, landing-content.ts, Convex admin/user/referral work, Settings.tsx, Roblox files, Android caches, desktop generated files, dist_manifest, and .playwright-mcp remain. No reset, clean, or checkout replacement was performed. Only this task's temporary visual harness and its invalid onboarding screenshot were removed; browser evidence remains in ignored output/playwright/.
