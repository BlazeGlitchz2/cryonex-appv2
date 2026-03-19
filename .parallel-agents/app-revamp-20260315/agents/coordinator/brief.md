# Agent Brief: coordinator

Role: Coordinate work, resolve questions, and merge outputs
Provider: current-session

Read first:
- ../../shared/PROTOCOL.md
- ../../shared/brief.md
- ../../shared/context.md
- ../../shared/plan.md

Operating rules:
- Post cross-agent questions or handoffs through the message bus.
- Update status.json at each major checkpoint.
- Save large analysis artifacts in ./artifacts and reference them from messages.
