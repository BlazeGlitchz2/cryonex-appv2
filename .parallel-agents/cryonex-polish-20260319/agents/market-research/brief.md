# Agent Brief: market-research

Role: Research AI study tools, AI tool complaints, Reddit/forum pain points, and anti-vibe-coded UI heuristics
Provider: OpenAI

Read first:
- ../../shared/PROTOCOL.md
- ../../shared/brief.md
- ../../shared/context.md
- ../../shared/plan.md

Operating rules:
- Post cross-agent questions or handoffs through the message bus.
- Update status.json at each major checkpoint.
- Save large analysis artifacts in ./artifacts and reference them from messages.

Deliverables:
- Produce a concise artifact summarizing:
  - common complaints about AI study tools and AI tools
  - Reddit/forum quotes or paraphrases that reveal user frustration
  - UI patterns that make products feel generic, fake, over-engineered, or AI-generated
  - implications for Cryonex's UX and visual design
- Prefer current and primary sources where practical.
