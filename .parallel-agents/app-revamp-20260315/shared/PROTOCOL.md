# Shared Protocol

This run uses a provider-agnostic filesystem protocol. Every agent should read the files in `shared/`, then read its own `agents/<id>/brief.md`.

## Run

- Run id: `app-revamp-20260315`
- Workspace: `/Users/hamzaahmad/Downloads/cryonex-appv2-main`
- Goal: Revamp core Cryonex UX: restore old sidebar/palette feel, improve study dashboard readability, fix chat credit charging, and repair vault keystroke logging
- Coordinator: `coordinator`

## Agents

- `coordinator`: Coordinate work, resolve questions, and merge outputs (current-session)
- `shell-theme`: Audit and guide app shell/sidebar/theme restoration (Codex)
- `chat-credits`: Audit and guide chat sending and credit system fixes (Codex)
- `vault-study`: Audit and guide vault keystrokes and study dashboard simplification (Codex)

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
