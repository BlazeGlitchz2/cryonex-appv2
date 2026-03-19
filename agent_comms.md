# Agent Communication: Cryonex UI Overhaul — Deepshi.ai Design System

> **Date**: 2026-03-19
> **Author**: Frontend Specialist Agent
> **For**: All AI Agents working on Cryonex

## Design Language: "Cosmic Utility" (Deepshi.ai Clone)

### Key Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| **Primary Accent** | `#D244FF` | Send buttons, active states, CTA elements |
| **Background** | `#050218` | App-wide base background |
| **Card Surface** | `#0a0625` | Sidebar bg, cards, panels |
| **Border** | `rgba(255,255,255,0.06)` | All borders — keep very subtle |
| **Glass BG** | `rgba(10, 6, 37, 0.85)` | Translucent panels |
| **Star-field** | `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1.35px)` at `28px` spacing | Background texture |

### Typography
- **Primary Font**: `Sora` (loaded from Google Fonts)
- **Weights**: 300-800
- **Body**: 14-16px, `text-white/70` for secondary text

### Border Radius
- **Buttons/Chips**: `rounded-full` (9999px)
- **Cards/Panels**: `rounded-2xl` (1rem) to `rounded-[1.75rem]`
- **Input containers**: `rounded-[2rem]`
- **Sidebar**: `rounded-[1.75rem]`

### Special Utilities
- **`.gradient-border`**: Deepshi's signature glow edge. Apply to any element that needs a subtle purple→white gradient stroke. It uses `::before` pseudo-element with mask-composite.
- **`.glass-panel`**: Updated to deep indigo translucency.

### Rules for New Components
1. **NO sharp corners** (no `rounded-sm`, `rounded-md` unless inside small UI elements)
2. **NO red accents** (`#f87171` is removed — use `#D244FF`)
3. **All interactive elements** should be `rounded-full`
4. **Borders** should be `border-white/[0.06]` — very subtle
5. **Backgrounds** should always use the deep indigo palette, never pure black
6. **Use `gradient-border` class** on input containers, chips, and call-to-action cards

## Latest Screenshot Diff

Compared:
- Cryonex: `.playwright-cli/page-2026-03-19T10-34-38-148Z.png`
- Deepshi: `.playwright-cli/page-2026-03-19T10-24-04-625Z.png`

Top remaining mismatches:
1. The sidebar is still the wrong object. Deepshi has a full, information-rich rail with search, text nav, and account context; Cryonex still reads like a slim icon dock with much less hierarchy.
2. The top composition is less intentional. Deepshi balances brand, flow selector, upgrade CTA, and auth actions in one clean header; Cryonex leaves the upper frame feeling more empty and less editorial.
3. The composer is not as singular. Deepshi uses one centered, capsule-like input system with secondary actions tucked into the same visual unit; Cryonex still feels like a rectangular form plus a separate toolbar.
4. The action chips are weaker and more fragmented. Deepshi’s chips are brighter, more premium, and more tightly grouped around the prompt; Cryonex’s pills feel more utilitarian and less like one unified composer.
5. The hero typography still lacks the same polish. Deepshi’s headline/subhead rhythm is cleaner and more open, while Cryonex’s supporting copy feels denser and more app-like.
6. The background treatment is less refined. Deepshi uses a spacious starfield with subtle glow and atmospheric depth; Cryonex’s dotted grid reads more mechanical and less cinematic.
7. The bottom edge feels unfinished. Deepshi has a deliberate lower-left identity block and a floating bottom-right action; Cryonex has a cookie banner that interrupts the composition and weakens the premium feel.

## Latest Coordination Notes

Latest pass compared:
- Cryonex: `output/playwright/cryonex-app-pass5.png`
- Deepshi: `.playwright-cli/page-2026-03-19T11-58-55-499Z.png`

What changed:
1. The assistant shell now uses a softer nebula-like background, lighter star density, and a floating support affordance closer to Deepshi.
2. The sidebar was widened and flattened, with a clearer nav-first hierarchy, a Deepshi-like guest footer, and a quieter assistant-home history state.
3. The composer was rebuilt into a more unified rounded control with integrated upload, mic, send, and a tighter secondary chip row.
4. The top utility row now keeps the upgrade CTA on laptop widths and feels less dashboard-heavy.

Remaining visual gaps:
1. Cryonex still uses its own capability chips and sidebar destinations, so the information architecture cannot match Deepshi one-to-one without product-level tradeoffs.
2. The hero type and subtitle are closer, but still slightly denser than Deepshi’s airier center stack.
3. The background is much improved, but Deepshi still has subtler atmospheric texture and less visible regularity.
