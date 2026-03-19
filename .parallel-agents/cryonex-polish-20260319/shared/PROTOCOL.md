# Shared Protocol

This run uses a provider-agnostic filesystem protocol. Every agent should read the files in `shared/`, then read its own `agents/<id>/brief.md`.

## Run

- Run id: `cryonex-polish-20260319`
- Workspace: `/Users/hamzaahmad/Downloads/cryonex-appv2-main`
- Goal: Research AI tool market pain points, identify what makes products feel AI-made/vibe-coded, audit Cryonex for polish gaps, and upgrade the app toward a world-class human-crafted feel across platforms
- Coordinator: `coordinator`

## Agents

- `coordinator`: Coordinate work, resolve questions, and merge outputs (current-session)
- `market-research`: Research AI study tools, AI tool complaints, Reddit/forum pain points, and anti-vibe-coded UI heuristics (OpenAI)
- `startup-research`: Research what makes AI startups succeed vs fail with product, distribution, trust, and retention patterns (OpenAI)
- `ui-audit`: Audit the current Cryonex UI and identify flaws that make it feel unpolished or AI-generated (OpenAI)
- `qa-breaker`: Run extreme test scenarios against the app and surface functional or UX breakage (OpenAI)

## Files

- `shared/brief.md`: stable goal and success criteria
- `shared/context.md`: evolving findings and constraints
- `shared/decisions.md`: accepted decisions
- `shared/plan.md`: owners and dependencies
- `bus/messages.jsonl`: append-only global event stream
- `agents/<id>/status.json`: current agent status
- `agents/<id>/inbox.jsonl`: messages addressed to that agent
- `agents/<id>/outbox.jsonl`: messages sent by that agent

## Message Rules

- Post cross-agent questions, handoffs, risks, and results through the message bus.
- Keep each message short and include file paths when relevant.
- Copy final decisions into `shared/decisions.md`.
- If blocked, update `status.json` and send a `risk` or `question` message with a concrete ask.
