# Shared Protocol

This run uses a provider-agnostic filesystem protocol. Every agent should read the files in `shared/`, then read its own `agents/<id>/brief.md`.

## Run

- Run id: `ui-reliability-revamp`
- Workspace: `/Users/hamzaahmad/Downloads/cryonex-appv2-main`
- Goal: Revamp Cryonex UI and reliability: restore old sidebar/palette, simplify study dashboard, fix credits/chat send flow, and repair vault keystroke logging
- Coordinator: `coordinator`

## Agents

- `coordinator`: Coordinate work, resolve questions, and merge outputs (current-session)
- `ui`: Trace old sidebar/palette and propose/implement restoration (Codex)
- `dashboard`: Improve study dashboard readability, accessibility, and motion (Codex)
- `reliability`: Fix credits/chat/vault reliability regressions (Codex)

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
