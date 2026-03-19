# Agent Brief: ui-audit

Role: Audit the current Cryonex UI and identify flaws that make it feel unpolished or AI-generated
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
- Inspect the current codebase and identify where the UI likely feels inconsistent, noisy, shallow, or "vibe coded".
- Focus on information hierarchy, spacing systems, typography, color usage, animation discipline, empty states, and interaction credibility.
- Name the specific files and components that most need attention.
