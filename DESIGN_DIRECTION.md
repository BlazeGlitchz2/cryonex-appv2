# Cryonex interface direction

Reference: the repository's original onboarding in `src/pages/Onboarding.tsx` and the `cryonex-couture-shell`, `couture-panel`, `deepshi-panel`, and `tactile-button` rules in `src/index.css`.

## Identity

- Use `/assets/cryonex-logo-official.png` with its original proportions. Keep the existing Cryonex wordmark and remove invented marks and registration symbols.
- Cosmic base: `#050218`. Raised plum surface: `#100a18`. Soft ink: `#b9b0a3`.
- Main action: the original amber/ember material, `#ffd29a` to `#ff8a2a` to `#d85b13`, with dark text `#160804`.
- Cyan `#06b6d4` remains a secondary study/source signal. Avoid painting every navigation item and heading bright blue.
- Light appearance uses neutral ivory surfaces and dark plum text, retaining warm controls and the official logo on a dark tile.

## Type and layout

Keep the existing Plus Jakarta Sans family and Arabic fallbacks. Use clear task names and readable secondary copy. Restrict uppercase micro labels to genuine study metadata; remove motivational marketing labels from functional screens.

Login retains a recognizable Cryonex study setup panel next to the sign-in form. The panel explains the actual workflow: bring a source, understand it, then practice recall. The form remains the most obvious interactive area.

```text
Desktop: [official logo + study workflow panel] [sign-in/code form]
Phone:   [official logo] [sign-in/code form] [guest preview]
App:     [stable navigation] [task heading + useful content]
```

Use the original embossed panel material at major grouping boundaries. Tool rows and document content remain quieter, with fewer nested cards. Match onboarding's 24–32px panel radii, 12–16px controls, and restrained inset highlights. Respect existing saved theme preference.

## Critique of the previous pass

The previous pass substituted a drawn logo, flattened the original warm panel material, and introduced repeated blue pills and generic motivational copy. This correction restores the established materials and uses direct study/task copy. UI/UX Pro Max guidance is used for interaction, accessibility, and responsive checks; its suggested generic blue palette and alternative fonts do not override the existing brand.

## Components retrieved through the configured catalog MCP

- Segmented Tabs by micka_design, demo 26923: https://21st.dev/@micka_design/components/tabs-base. The active sliding surface is adapted into `AccountModeSwitch` with native buttons, keyboard navigation, pending-state disabling, and reduced-motion support. Existing Framer Motion is sufficient; the catalog's additional primitive and context packages are unnecessary for two equal-width options.
- Login by ephraimduncan, demo 2428: https://21st.dev/@ephraimduncan/components/login-2. Its social/email form hierarchy was reviewed while keeping Cryonex's existing passwordless provider contracts, redirects, and guest flow.

Both code bundles were successfully retrieved on September 27, 2026 through the configured MCP. The account's two included daily retrievals were used; no subscription or purchase was made.

## Verification

Browser checks covered desktop and phone layouts, both appearances, account switching with the keyboard, workspace search, collection forms, and the real guest study route. The phone header uses the same official logo. The announcement now has reachable 44px dismissal controls and a defined position on mobile web. Reduced-motion emulation disables auth transitions.

Observed defects repaired: formatted code paste truncation, invalid-email focus, an unauthenticated Integrations query and its unhandled server errors, duplicate focus-session starts, restarting an existing focus session, clipped phone landing navigation, and the announcement outside the phone viewport.

Regression coverage includes authentication validation, failure/retry behavior, code paste, provider status errors, the actual reactive query hook with skipped authentication, and focus start guards. Browser verification used guest preview and read-only page fixtures; it did not exercise live email/Google delivery or authenticated saves. The temporary fixtures were removed after review. Completion evidence is recorded in `GATES.md`.
