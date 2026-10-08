# Phase 8: Category Cards, Roadmap Additions & the Watchtower

**Goal:** close the gaps found by comparing the roadmap with a ten-part "AI Developer / AI Engineer Roadmap" infographic series (01 Programming & Software Engineering … 10 AI Security & Guardrails), show topics as categorised cards like the infographics, and add an AI Observability island.

## User decisions (2026-10-08)
1. Add the missing topics to `docs/AI Engineer-Developer.md` first, marked **➕ Addition**, then to the data.
2. Add a trimmed core of about 30 topics, not everything from the infographics. Items that are examples rather than concepts (tool types such as APIs or Files, accuracy and relevance, escalation and intervention) go into bites instead.
3. Observability gets a **new island**, not a group folded into existing islands.
4. Topic groups become **category cards** with an emoji and a one-line blurb (two new optional fields on `TopicGroup`).

## Scope
### A. Content (doc first, then `data/roadmap.ts`)
32 added topics, by island:
- Code Village: cloud fundamentals
- LLM Lighthouse: open models, model selection, multimodal models
- Prompt Workshop: context engineering
- RAG Library: parsing & OCR, vector databases, metadata filtering, grounding
- Agent HQ: ReAct, workflow patterns, MCP primitives
- App Factory: model routing, semantic caching, LLM gateways, cost optimization
- Shield Fort: agent task success, tool-call accuracy, trajectory evaluation, indirect prompt injection, input & output guardrails, least privilege
- Deep Archive: corrective RAG, multimodal RAG
- Clockwork Keep: supervisor agents, checkpointing, episodic & semantic memory
- MLOps Conveyor: LLM tracing
- Security Citadel: guardrails, agent sandboxing, MCP security, AI red teaming

### B. Category cards
- `TopicGroup.emoji?` and `TopicGroup.blurb?` (additive). The `g()` helper takes `(emoji, title, blurb, ...topics)`.
- Every phase's groups get an emoji and a blurb. Islands with one flat list are split into categories in the spirit of the infographics (e.g. RAG: Ingestion · Retrieval · Answer & check).
- `TopicGroupView` draws a card: a tinted header (emoji, title, blurb, gems found) over the chips or list. Tints cycle through `CATEGORY_TINTS`. The island guide shows the cards two-up from `sm`. The print view and the `/roadmaps/<slug>` pages show the emoji and blurb in the group heading.

### C. The Watchtower (`dev-watchtower`, Dev P10 AI Observability)
- Developer track, after Shield Fort: Shield Fort → Watchtower → Summit.
- 11 topics in 4 categories (Traces, Metrics, Logs, OpenTelemetry), platform chips (LangSmith, Langfuse, Arize Phoenix, cloud), the infographic's flow as a diagram, mentor Argus. No project (the infographics name none).
- Landmark `watchtower`: a wooden lookout tower with a sweeping spyglass, a pulsing lamp and a floating "Live trace" board whose spans fill in one request at a time.
- Challenge: `sort-bins` "Trace, Metric or Log?" (3 bins, 9 signals).
- Job-ready: the Developer's last timeline step (Production AI Applications) includes it.

## Acceptance
- tsc, lint and build pass; the dev content checks pass (unique ids, recap topics, sort-bins items).
- Every island places its pedestal, dock and all gems; both new bridges are walkable end to end.
- Cards render in the island guide, the Roadmap tab, print and the SEO pages; no horizontal overflow at 375 px.
