# Cryonex Premium Mobile UI Research Direction

Date: 2026-05-26
Status: research and design direction, no implementation yet

## Scope

This document translates the provided dark premium mobile references into an original Cryonex direction. It is grounded in the current app rather than treating the prompt as a generic social or shopping app brief.

Discovered app context:

- App name: Cryonex.
- Product: AI study workspace for students and learners.
- Core jobs: import source material, chat with grounded AI, generate summaries, flashcards, quizzes, study plans, notes, and focused review loops.
- Platform: React 19, TypeScript, Vite, Tailwind v4, Radix/shadcn primitives, Framer Motion, Convex, Capacitor iOS/Android.
- Current mobile surfaces: mobile onboarding, mobile home, study dashboard, study workspace, chat composer, mobile bottom nav, quick capture.

Before any coding, the only missing input worth confirming is current app screenshots from the exact screens to redesign. The repo gives enough product and tech context, but screenshots will prevent us from polishing the wrong state.

## Research Notes

Important timing note: as of 2026-05-26, Apple Design Awards 2026 public material appears to be finalists/feature pages rather than final winners. Treat Apple 2026 references as finalists unless Apple has announced winners after this date.

Useful source families:

- Apple Design Awards and App Store editorial examples for craft, restraint, accessibility, and motion.
- Current Apple Human Interface Guidelines for iOS layout, depth, materials, onboarding restraint, and platform feel.
- Google Material 3 Expressive for emotion, motion, shape contrast, and clear hierarchy on mobile.
- Webby, Awwwards, CSS Design Awards, Mobbin, Page Flows, Refero, Godly, Lapa Ninja, Dribbble, and Behance for pattern scanning, not copying.
- Official product pages for current AI assistant, shopping assistant, study, social map, and onboarding patterns.

## 20 Reference Examples

### 1. ChatGPT Mobile

- Source link: https://openai.com/chatgpt/download/
- What makes the UX good: fast entry, clear voice/text modality, low-friction assistant access, strong trust in the input surface.
- Visual patterns worth adapting: centered assistant state, subtle waveform/listening feedback, compact prompt starters, high-contrast composer.
- Interaction patterns worth adapting: one-tap voice, attachment-first input, recent task continuation, progressive disclosure of tools.
- What not to copy: OpenAI identity, orb treatment, exact composer chrome, model picker language.

### 2. Claude Mobile

- Source link: https://claude.ai/download
- What makes the UX good: calm reading experience, long-form answer legibility, project/file context feels serious rather than flashy.
- Visual patterns worth adapting: warmer neutral surfaces, restrained assistant branding, readable message rhythm.
- Interaction patterns worth adapting: file-aware conversation setup, continuation across devices, artifact-like outputs.
- What not to copy: Claude brand palette, exact message layout, artifact terminology.

### 3. Google Gemini Mobile

- Source link: https://gemini.google.com/app
- What makes the UX good: multimodal assistant entry is simple and recognizably mobile-native.
- Visual patterns worth adapting: compact assistant prompt area, image/mic entry, lightweight result cards.
- Interaction patterns worth adapting: ask by text, camera, voice, and context; action suggestions after answers.
- What not to copy: Google gradient identity, Gemini sparkle mark, exact chip styling.

### 4. Perplexity

- Source link: https://www.perplexity.ai/
- What makes the UX good: search feels conversational while sources remain visible.
- Visual patterns worth adapting: source cards, answer sections, related follow-up prompts.
- Interaction patterns worth adapting: question first, cited response, branch into follow-up, save/share answer.
- What not to copy: exact answer page layout, Pro badges, source card visuals.

### 5. NotebookLM

- Source link: https://notebooklm.google/
- What makes the UX good: source-first AI, notebook mental model, trustworthy grounding.
- Visual patterns worth adapting: source shelf, notebook/canvas structure, generated study assets near source context.
- Interaction patterns worth adapting: upload source, ask within scope, generate summaries/questions/audio-style study aids.
- What not to copy: Google notebook branding, exact source panel, Audio Overview naming.

### 6. Khanmigo

- Source link: https://www.khanacademy.org/khan-labs
- What makes the UX good: tutoring posture is supportive and pedagogical, not just answer dumping.
- Visual patterns worth adapting: coach tone, step-by-step scaffolding, lesson-aware prompts.
- Interaction patterns worth adapting: Socratic hints, practice checks, student-safe guardrails.
- What not to copy: Khan Academy character or teaching copy.

### 7. StudyFetch

- Source link: https://www.studyfetch.com/
- What makes the UX good: students understand the value immediately: upload material, generate study tools.
- Visual patterns worth adapting: source-to-tools flow, quick transformation cards, study-mode clarity.
- Interaction patterns worth adapting: import, convert, practice, review in a short loop.
- What not to copy: mascot, exact product claims, specific layout of study tool cards.

### 8. Knowt

- Source link: https://knowt.com/
- What makes the UX good: familiar student mental model around notes, flashcards, and quizzes.
- Visual patterns worth adapting: lightweight study set cards, progress surfaces, fast resume affordances.
- Interaction patterns worth adapting: create from notes, revise with flashcards, quiz yourself, track weak areas.
- What not to copy: Quizlet-like card arrangement, brand color system, exact navigation.

### 9. Tiimo

- Source link: https://www.tiimoapp.com/
- What makes the UX good: friendly planning and neurodiversity-aware scheduling with low anxiety.
- Visual patterns worth adapting: gentle onboarding, clear daily plan, friendly microcopy, calm progress cues.
- Interaction patterns worth adapting: personalize first, show a manageable day, let users adjust pace.
- What not to copy: illustration style, calendar treatment, accessibility positioning.

### 10. Structured

- Source link: https://structured.app/
- What makes the UX good: polished time-based planning with strong hierarchy and low visual clutter.
- Visual patterns worth adapting: timeline blocks, small status chips, compact task continuity.
- Interaction patterns worth adapting: next-step timeline, reminders, daily review.
- What not to copy: exact timeline UI, icon language, brand palette.

### 11. The Way

- Source link: https://www.thewayapp.com/
- What makes the UX good: premium onboarding and guided flow feel warm, personal, and focused.
- Visual patterns worth adapting: cinematic dark mode, soft glow, simple screen-by-screen progression.
- Interaction patterns worth adapting: short guided questions, gradual commitment, calming transitions.
- What not to copy: meditation framing, visual assets, brand-specific spiritual tone.

### 12. Duolingo

- Source link: https://www.duolingo.com/
- What makes the UX good: onboarding gets users into a first win quickly and makes progress tangible.
- Visual patterns worth adapting: small streak/progress cues, friendly choices, bite-sized setup.
- Interaction patterns worth adapting: goals, level placement, instant first exercise.
- What not to copy: mascot, gamified world map, green identity, reward sounds.

### 13. Headspace

- Source link: https://www.headspace.com/
- What makes the UX good: onboarding translates user intent into a recommended path without making setup feel heavy.
- Visual patterns worth adapting: warm gradients, calm cards, clear emotional states.
- Interaction patterns worth adapting: ask the goal, personalize the plan, offer a daily routine.
- What not to copy: illustration system, wellbeing content framing.

### 14. Snap Map

- Source link: https://map.snapchat.com/
- What makes the UX good: social presence is spatial, playful, and glanceable.
- Visual patterns worth adapting: floating avatars, clustered social nodes, spatial discovery.
- Interaction patterns worth adapting: friend/activity nodes, lightweight presence, tap for detail.
- What not to copy: Bitmoji avatars, Snap map affordances, live location assumptions.

### 15. Life360

- Source link: https://www.life360.com/
- What makes the UX good: map UI balances location, status, safety, and quick actions.
- Visual patterns worth adapting: compact status cards over map-like surfaces, trusted-group visualization.
- Interaction patterns worth adapting: circles/groups, status summaries, alerts as small cards.
- What not to copy: family safety positioning, real-time tracking patterns unless Cryonex explicitly needs them.

### 16. Apple Find My

- Source link: https://www.apple.com/icloud/find-my/
- What makes the UX good: location and people/device context are simple, privacy-forward, and native.
- Visual patterns worth adapting: people/device segmentation, clean list/map pairing, precise empty states.
- Interaction patterns worth adapting: permission clarity, find/share actions, map plus details.
- What not to copy: Apple iconography, native app layout, device-finding interaction model.

### 17. Partiful

- Source link: https://partiful.com/
- What makes the UX good: social planning feels friendly, expressive, and lightweight.
- Visual patterns worth adapting: event/community cards, approachable tone, shareable flows.
- Interaction patterns worth adapting: invite loops, RSVP-like commitment, group updates.
- What not to copy: party branding, illustration/meme style, exact card language.

### 18. Beli

- Source link: https://beliapp.com/
- What makes the UX good: personal recommendations and social discovery are mapped, ranked, and saved.
- Visual patterns worth adapting: social recommendation cards, saved places/materials, map/list hybrid.
- Interaction patterns worth adapting: save, rank, recommend, discover through trusted peers.
- What not to copy: restaurant-specific map/list model, brand style.

### 19. Amazon Rufus

- Source link: https://www.aboutamazon.com/news/retail/amazon-rufus
- What makes the UX good: shopping assistant sits inside decision flow rather than becoming a separate chatbot.
- Visual patterns worth adapting: assistant panel over results, product comparison cards, refined filters.
- Interaction patterns worth adapting: ask, compare, narrow, add to cart. In Cryonex, adapt this as ask, compare, select source, add to study plan.
- What not to copy: commerce language, purchase funnel, Amazon-specific cards.

### 20. Klarna AI Shopping Assistant

- Source link: https://www.klarna.com/international/press/klarna-brings-shopping-to-chatgpt/
- What makes the UX good: guided shopping narrows intent through conversation and visual product results.
- Visual patterns worth adapting: color/attribute filters, ranked results, conversational refinement.
- Interaction patterns worth adapting: natural-language search, saved preferences, cart-like selected bundle. In Cryonex, this becomes a selected study pack or review queue.
- What not to copy: shopping checkout patterns, Klarna brand styling, payment-led framing.

## Reusable Design Patterns

1. Source constellation onboarding

Use the floating node language from the references, but make nodes represent notes, PDFs, lectures, links, subjects, and study goals instead of friends or products. This gives Cryonex the premium spatial feel without pretending to be a social map app.

2. Warm assistant focus field

The first mobile action should feel like entering a focused study request. A dark surface, amber edge light, microphone/scan/upload controls, and 3 to 5 study-intent chips can make the AI feel immediate without clutter.

3. Study pack assembly, not shopping

Adapt AI-commerce patterns into a learning flow: "I need a 25-minute biology review" yields a bundle of source cards, quiz cards, flashcards, and weak-topic drills. The selected items go into a study queue rather than a cart.

4. Native bottom action rhythm

Keep the bottom dock and composer sacred. Primary mobile actions should be thumb-reachable: capture source, ask AI, resume study, review queue. Avoid top-heavy hero layouts once the user is inside the app.

5. Glass with restraint

Use glass for the highest-level shell, modal onboarding, and active assistant surfaces. Use solid or lightly translucent panels for dense reading, quizzes, notes, and long answers. Heavy blur everywhere will hurt readability and mobile performance.

6. Social presence as study presence

If social nodes are used, make them "class circles", "shared packs", or "study partners" with clear privacy boundaries. Do not imply live location tracking unless that becomes a deliberate product feature.

7. Microinteractions as state clarity

Use motion to show listening, scanning, generating, completing, and saving. Avoid constant ambient animation. Cryonex already has Framer Motion and haptics, so the design should standardize motion tokens rather than add new animation stacks.

## Safe Adaptation For Cryonex

Recommended direction: premium dark study copilot with warm-gold focus lighting.

This should evolve the current Cryonex dark/cyan cosmic system instead of replacing it. Keep cyan for AI/source verification and system focus. Introduce amber/gold as the emotional "study momentum" accent for onboarding, primary CTAs, active study queues, and success moments.

Do:

- Use original Cryonex study metaphors: source orbit, study lane, review queue, knowledge map, focus sprint.
- Reuse existing mobile architecture and route split.
- Tokenize warm surfaces in CSS before spreading hard-coded amber styles.
- Keep source grounding visible in AI answers.
- Make every premium effect serve a state: selected, active, listening, generating, complete.

Do not:

- Copy the provided phone layouts exactly.
- Add floating avatars that look like a friend map unless they represent study collaborators.
- Turn Cryonex into an AI shopping UI; borrow comparison/refinement mechanics only.
- Put glass cards inside glass cards.
- Use glow around all content. Reserve glow for active or primary moments.

## Design Principles

1. Source-first magic

The user should always know what material Cryonex is using. The premium layer should make sources feel alive, not hidden.

2. Calm before cinematic

The first impression can be cinematic, but study screens must stay readable, fast, and calm.

3. One obvious next move

Each mobile screen should have one dominant action and two to four supporting actions.

4. AI as a study partner

The assistant should guide, ask, compare, quiz, and summarize. It should not become decorative scenery.

5. Premium means precise

Use fewer colors, sharper hierarchy, consistent spacing, strong contrast, and purposeful motion.

## Color Palette

Core:

- Void: `#030010` for native launch and deepest background.
- Night: `#07030F` for app background.
- Ink panel: `#100A18` for primary surfaces.
- Graphite panel: `#17121F` for dense readable panels.
- Line: `rgba(255,255,255,0.10)` for borders.
- Text primary: `#F8F5EE`.
- Text secondary: `#B9B0A3`.
- Text muted: `#7E756B`.

Accents:

- Cryonex cyan: `#06B6D4` for AI verification, source-grounding, focus rings, links.
- Warm gold: `#F5B544` for primary study momentum.
- Ember orange: `#F97316` for strong CTAs and active generation.
- Rose glow: `#D9468F` only for limited assistant-listening aura.
- Emerald: `#34D399` for complete/saved/success.
- Red: `#F87171` for destructive/error states.

Gradient guidance:

- Primary CTA: `linear-gradient(135deg, #F5B544, #F97316)`.
- Assistant listening aura: black base plus subtle `#F5B544`, `#D9468F`, and `#06B6D4` radial highlights.
- Avoid purple-blue dominance. Cryonex already has enough cold cosmic weight.

## Typography Guidance

- Continue with Plus Jakarta Sans/Sora and Arabic fallbacks already in the app.
- Use Sora or Plus Jakarta Sans semibold for screen titles.
- Use Atkinson Hyperlegible where reading density matters: AI answers, study notes, quiz explanations.
- Reduce tiny uppercase labels. Keep them for metadata only and improve contrast.
- Avoid negative tracking for compact mobile panels.
- Keep Arabic support central. Test long Arabic labels in buttons, chips, and onboarding choices.

## Component List

- Premium mobile onboarding shell.
- Source orbit visual: original animated study nodes.
- Study intent chips: summarize, quiz, flashcards, explain, focus sprint.
- Warm CTA button with pressed/haptic state.
- Assistant focus composer with scan/upload/mic controls.
- Source cards with trust/status badges.
- Study pack queue, adapted from cart patterns.
- AI answer card with citations/sources and save-to-notebook action.
- Review queue bottom sheet.
- Knowledge map preview, using subject/source nodes rather than social map copying.
- Study circle card for future social/collaboration features.
- Native bottom nav and quick capture bar polish.
- Motion tokens for listen, scan, generate, complete, error, save.
- Accessibility wrappers for icon buttons, selectable cards, and upload zones.

## Screen-by-Screen Recommendations

### First-run mobile onboarding

Use 3 to 4 screens, not more. Make the visuals original:

1. "Start with your sources" with source nodes orbiting a study focus.
2. "Ask inside the material" with assistant glow and source cards.
3. "Turn answers into practice" with quiz/flashcard/review queue cards.
4. "Pick up where you left off" with dashboard continuation.

The CTA should stay bottom-fixed, thumb-reachable, and warm gold. Skip should remain available and accessible.

### Full onboarding/profile setup

Keep the existing curriculum/personalization intent, but make selections behave like proper radio/segmented controls. Visually, use warm selected states for personal goals and cyan selected states for source/AI verification.

### Mobile home

Replace generic hero weight with a "Today in Cryonex" study cockpit:

- top greeting and compact streak/readiness signal
- source continuation card
- assistant focus field
- 3 quick actions: capture, quiz, focus sprint
- review queue preview

### Capture/import

Make capture feel like the start of a premium study session. Scanning should show a warm rim light and clear states: ready, scanning, extracting, routed to workspace.

### Chat/assistant

Use a bottom-first composer. Messages should prioritize readability. AI output should include source chips and actions: save, quiz me, simplify, add to review queue.

### Study workspace

Preserve the previous source-first notebook strategy. Warm-gold should not dominate the notebook. Use it for the active lane and next action. Use cyan for source-grounding and citations.

### Library

Use saved source clusters, not decorative cards. Each source should expose status: ready, summarized, quiz available, weak topics found, needs review.

### Social/study circles

If social nodes are introduced, start with non-location collaboration: shared study packs, class circles, recent partner activity, and privacy-first invitations.

## Accessibility Notes

- Minimum target size: 44px CSS equivalent for mobile controls.
- All icon-only buttons need accessible labels.
- Selectable cards need `aria-pressed`, radio semantics, or native input wrappers.
- Upload cards should be buttons or labels, not clickable divs.
- Respect `prefers-reduced-motion` and the app's performance store.
- Maintain contrast above WCAG AA for text. Low-opacity labels like `text-white/36` should be raised for important content.
- Do not rely on color alone for source status, errors, completion, or selected states.
- Avoid long text inside narrow buttons. Let labels wrap or shorten.
- Test Arabic and English layouts for onboarding and dashboard chips.

## Implementation Risks

- Current styling has overlapping surface systems: `deepshi-panel`, `couture-panel`, `cyber-tactile-card`, `mobile-premium-surface`, and `mobile-native-button`.
- Many chat and onboarding colors are hard-coded cyan/purple/slate.
- Heavy blur/glass can hurt iOS WebKit and Android WebView performance.
- The app already has many dirty working tree changes, so implementation should be narrow and staged carefully.
- Reduced motion is not consistently wired through mobile onboarding/dashboard/workspace.
- Premium visuals can easily reduce readability if applied to dense study content.

## QA Checklist

- Mobile onboarding fits iPhone SE width, modern iPhone, Android phone, and tablet widths.
- CTA, skip, carousel dots, close buttons, and selectable cards are keyboard/screen-reader reachable.
- Safe areas work on native iOS and Android.
- Bottom nav and composer do not overlap with keyboard or onboarding CTAs.
- Text does not overflow in English or Arabic.
- Reduced motion removes nonessential transitions and ambient animation.
- Glass fallback remains readable when `backdrop-filter` is unavailable.
- Dark and light theme behavior is intentional, even if this direction is dark-first.
- Chat answers remain readable during streaming.
- Study workspace source context stays visible after redesign.
- Upload/capture states are understandable without animation.
- Performance is checked on a low-end Android target or simulated throttling.

## Recommended Implementation Order

1. Confirm screenshots and exact surfaces for first implementation slice.
2. Add or normalize warm-gold mobile design tokens in `src/index.css`.
3. Update mobile onboarding as the first visual proof.
4. Apply the same token system to mobile home and quick assistant entry.
5. Polish chat composer and source-grounded answer cards.
6. Only then extend the direction into study dashboard/workspace.

## Source Links

- Apple Design Awards: https://developer.apple.com/design/awards/
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Material Design 3: https://m3.material.io/
- Material 3 Expressive: https://m3.material.io/blog/building-with-m3-expressive
- The Webby Awards: https://winners.webbyawards.com/
- Awwwards: https://www.awwwards.com/
- CSS Design Awards: https://www.cssdesignawards.com/
- Mobbin: https://mobbin.com/
- Page Flows: https://pageflows.com/
- Refero: https://refero.design/
- Godly: https://godly.website/
- Lapa Ninja: https://www.lapa.ninja/
- Dribbble: https://dribbble.com/
- Behance: https://www.behance.net/
