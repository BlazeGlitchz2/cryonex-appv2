# Shared Protocol

This run uses a provider-agnostic filesystem protocol. Every agent should read the files in `shared/`, then read its own `agents/<id>/brief.md`.

## Run

- Run id: `ui-revamp-20260315`
- Workspace: `/Users/hamzaahmad/Downloads/cryonex-appv2-main`
- Goal: Revamp Cryonex UI and core UX systems: restore older sidebar/palette, improve credits/chat/knowledge vault/study dashboard, and fix chat credit charging regression
- Coordinator: `lead`

## Agents

- `lead`: Coordinate work, resolve questions, and merge outputs (Codex)
- `ui-systems`: Audit sidebar, palette, motion, and study dashboard accessibility (Codex)
- `core-flows`: Audit credits, chat send flow, and knowledge vault keystroke capture (Codex)

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
