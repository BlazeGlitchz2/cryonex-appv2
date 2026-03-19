# Shared Brief

Goal: Revamp Cryonex UI and reliability: restore old sidebar/palette, simplify study dashboard, fix credits/chat send flow, and repair vault keystroke logging

Success criteria:
- Restore the older purple-cyan glass/sidebar feel in the main app shell and keep it consistent across desktop and mobile.
- Make the study dashboard calmer and more dyslexia-friendly by reducing simultaneous emphasis, improving spacing, and clarifying hierarchy.
- Fix the broken `credits.charge` path so chat sends and study generation stop failing at runtime.
- Fix knowledge vault input logging so typing and pasting do not duplicate or corrupt text.
- Improve credit UI and chat rendering polish without breaking current app routing or Convex contracts.
- Respect existing user changes in unrelated files and avoid reverting work outside the touched scope.
