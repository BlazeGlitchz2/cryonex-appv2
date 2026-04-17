---
trigger: always_on
---

# GEMINI.md - Antigravity Kit

> This file defines how the AI behaves in this workspace.

---

## 🛑 ABSOLUTE MANDATE: STABILITY HYGIENE & DEPLOY RITUAL (P0)
**MANDATORY FOR EVERY SINGLE CONVERSATION AND EVERY SINGLE TASK:**
Regardless of how small or simple a code change is, you MUST execute the "Deployment Ritual" via the `stability-hygiene` skill. 

1. **You are FORBIDDEN from deploying or committing directly to `main`.**
2. **You MUST use the PR-First Deployment Ritual:** Checkout an `experiment` branch, push it, create a Pull Request, trigger a Multi-Agent Code Review, address all issues, and only then merge.
3. **PRE-PUSH TRIAD REVIEW:** Before you even push your code to your experiment branch, you MUST pause and conduct a strict **Security, Performance, and Architecture Triad Review**. Actively modify your own code based on this internal audit.
4. If you forget to use this ritual or skip the Triad Review, you have critically failed.

---

## CRITICAL: AGENT & SKILL PROTOCOL (START HERE)

> **MANDATORY:** You MUST read the appropriate agent file and its skills BEFORE performing any implementation. This is the highest priority rule.

### 1. Modular Skill Loading Protocol
Agent activated → Check frontmatter "skills:" → Read SKILL.md (INDEX) → Read specific sections.

### 2. Enforcement Protocol
1. **When agent is activated:** Read Rules → Load SKILL.md → Apply All.
2. **Forbidden:** Never skip reading agent rules or skill instructions.

---

## 📥 REQUEST CLASSIFIER

| Request Type     | Trigger Keywords                           | Active Tiers                   | Result                      |
| ---------------- | ------------------------------------------ | ------------------------------ | --------------------------- |
| **COMPLEX CODE** | "build", "create", "implement", "refactor" | Agent                          | **{task-slug}.md Required** |
| **DEPLOYMENT**   | "deploy", "finish"                         | Orchestrator + Hygiene         | **PULL REQUEST MANDATORY**  |

---

## 🤖 INTELLIGENT AGENT ROUTING (AUTO)
**Analyze & Select best agents for a task.**
Generate response using specialized personas.
Print: `🤖 **Applying knowledge of @[agent-name]...**` BEFORE code.

---

## TIER 0: UNIVERSAL RULES
### 🧹 Clean Code (Global Mandatory)
- **Deployment Ritual:** **"branch, commit, pull request, agent review, merge, smoke check"**. DO NOT BYPASS.

## 🏁 Final Checklist Protocol
Trigger with "son kontrolleri yap", "final checks", or at the end of ANY workspace session.
Execute: `python .agent/scripts/checklist.py .`

### 🎭 Gemini Mode Mapping
| Mode     | Agent             | Behavior                                     |
| -------- | ----------------- | -------------------------------------------- |
| **plan** | `project-planner` | Multi-phase planning.                        |
| **edit** | `orchestrator`    | Execute using the PR-First Deploy workflow.  |
