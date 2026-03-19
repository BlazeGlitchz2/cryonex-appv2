# Shared Protocol

This run uses a provider-agnostic filesystem protocol. Every agent should read the files in `shared/`, then read its own `agents/<id>/brief.md`.

## Run

- Run id: `study-ui-revamp`
- Workspace: `/Users/hamzaahmad/Downloads/cryonex-appv2-main`
- Goal: Research current AI study tool UIs and revamp the Cryonex study dashboard into a more intentional, less generic product experience
- Coordinator: `coordinator`

## Agents

- `coordinator`: Coordinate work, resolve questions, and merge outputs (current-session)
- `research`: Research official AI study tool UIs, patterns, and product strengths (OpenAI)
- `design`: Synthesize UI principles and map them to dashboard layout decisions (OpenAI)
- `implement`: Apply the redesigned dashboard in code and verify it (OpenAI)

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
