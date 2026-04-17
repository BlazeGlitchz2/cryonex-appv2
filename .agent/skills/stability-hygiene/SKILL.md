---
name: stability-hygiene
description: Stability-first engineering principles and "Quiet Rebuild" checklist for MVPs. Focuses on preventing "wobbly" systems through simplicity, resilience, and disciplined workflows.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Stability & Hygiene

> **Philosophy:** The goal is not perfection. The goal is to stop surprises. Calm-the-chaos before adding "glitter".

---

## 📋 The Quiet Rebuild Checklist

Follow these 10 principles to stabilize a "wobbly" MVP.

### 1. Data Model Simplicity (Paper Exercise)
- **Rule:** Draw your data model on one sheet of paper.
- **Action:** If you need more than one page, you have two models pretending to be one. Merge them before they "divorce" later.

### 2. User Journey Network Audit
- **Rule:** Max 5 backend calls per simple user journey.
- **Action:** Open the browser network tab, follow a journey (e.g., signup), and count calls. Eliminate hidden latency.

### 3. Error Tracking & Logging
- **Rule:** "If the last exception is older than 24 hours, you aren't logging."
- **Action:** Catch every unhandled rejection. Log it. Review it every morning.

### 4. Branching Strategy (Experiment Branch)
- **Rule:** `main` stays deployable at all times.
- **Action:** Push new/risky features to an `experiment` branch. Literally comment out imports of features that aren't ready for investors yet.

### 5. The Deploy Ritual (PR-First Workflow)
- **Protocol:** **"branch, commit, pull request, agent review, merge, smoke check"**
- **Action:** NEVER push directly to main. 
  1. Create the `experiment` or `feature` branch.
  2. Push the branch to origin.
  3. Create a GitHub Pull Request via UI or CLI.
  4. TRIGGER MULTI-AGENT REVIEW: Call `/orchestrate` or directly tag the Code Review, Security, and Architecture agents to rigorously review the PR.
  5. Address all agent-identified issues.
  6. ONLY after passing agent review, merge the PR into `main`.

### 6. Real Data Staging
- **Rule:** Staging with fake rows is "theater".
- **Action:** Copy production data to a second database weekly. Try a deploy against it to find nulls and duplicates you forgot about.

### 7. Slow Query Indexing
- **Rule:** Measure and index the slowest query in Step 2.
- **Action:** If query time drops by 8ms, keep going. Small wins stack when users double.

### 8. Friday Retro
- **Protocol:** 30-minute self-audit every Friday.
- **Agenda:** What broke? What almost broke? What felt sketchy?
- **Action:** Jot **3 action items** (not 10). Finish them before adding new features.

### 9. External Service Resilience
- **Rule:** Assume every external service (Stripe, AWS, APIs) will be down for an hour.
- **Action:** Map the impact. If "users can't sign up," wrap the call in a queue or cache.

### 10. Documentation of Complexity
- **Rule:** Admit the parts you don't understand.
- **Action:** Paste scariest functions into a doc. Explain them like you would to a junior dev. Gaps show up immediately—those are the spots to patch.

---

## 🛠️ Automated Checks

Run the stability audit regularly:

| Script | Purpose |
|--------|---------|
| `scripts/stability_audit.py` | Scans for unhandled errors and complex untyped/undocumented code. |
| `/orchestrate review` | (Socratic Command) Mandates multi-agent code review for any Pull Request. |

---

## 🔗 Related Skills

- **`architecture`**: For data model design.
- **`database-design`**: For query optimization and indexing.
- **`deployment-procedures`**: For staging and ritual execution.
- **`clean-code`**: For documentation and error handling.

---

> **Remember:** Once the fires are smaller, you can think about proper architecture. Stop the bleeding first.
