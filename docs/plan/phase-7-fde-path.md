# Plan: HUD subtitle + AI Forward Deployed Engineer (AI FDE) career path

## Context
1. **HUD subtitle.** The top-left pill in `components/ui/HUD.tsx` shows the island's `phase.title` ("App Factory") and its `TrackBadge` ("AI Developer path"). The user also wants the phase subtitle ("AI Application Engineering").
2. **Third career path.** The app was built to grow beyond two careers: Phase 6 added the `CAREER_PATHS` registry and a README checklist. The user wants an **AI Forward Deployed Engineer (AI FDE)** path that overlaps heavily with the AI Developer roadmap.

User decisions (from the planning questions):
- FDE gets **its own branch of 6 new islands** and **shares the 4 Developer islands LLM → Agents** with no duplicated content.
- **New unique landmarks** for the new islands.
- Challenges use the **existing engines** (PipelineOrder / SortBins / Quiz) with new authored content.

This is a large change, so it runs as **Phase 7** under the session workflow in CLAUDE.md. Step 0 adds `docs/plan/phase-7-fde-path.md` (this plan) and a Phase 7 row in status.md and the CLAUDE.md table.

## Research summary (what an AI FDE is)
An AI FDE embeds with enterprise customers and turns a general-purpose model into a working production system.
- **The work:** discovery and scoping, integrating with messy enterprise systems and data, deploying into the customer's cloud, building evals, guardrails and observability, owning the rollout to go-live, and feeding recurring needs back to the product team.
- **How it differs from neighbouring roles:**
  - An AI Engineer focuses on platforms and models.
  - A solutions or sales engineer demos and validates.
  - A consultant leaves after making recommendations.
  - The FDE writes production code and stays through adoption.
- **Who hires them:** Anthropic and OpenAI have FDE job postings (Python, LLM production experience with prompting, agents and evals, MCP servers, 25–50 % travel). Palantir originated the role.
- **What postings ask for:** Python (~89 %), prompt engineering, RAG, cloud (AWS/GCP/Azure), Docker and Kubernetes. About 90 % of postings stress direct client work.
- **Typical roadmap:** fundamentals → APIs, data and integration → deploy and operate → applied AI → enterprise security → customer discovery → portfolio of 2–3 deployed case studies with postmortems. That takes about 12 months.

Sources: KDnuggets "7 Steps to Become an FDE in 2026", fde.academy roadmap, Paraform AI-FDE guides, Alexey Grigorev "What AI FDEs do", Wikipedia "Forward Deployed Engineer", the Anthropic and OpenAI FDE postings.

## Proposed FDE roadmap (becomes the new source doc)
New file **`docs/AI Forward Deployed Engineer.md`**, in the same format as `docs/AI Engineer-Developer.md`. It is the content source of truth for the FDE path and lists the sources above. The roadmap shape is the common trunk (Phases 1–3), then the shared Developer phases 4–7, then the FDE's own phases 8–13, then the Summit.

**Shared with the AI Developer path:** Dev P4 LLM Fundamentals, P5 Prompt Engineering, P6 RAG, P7 Agents (including MCP).

Own islands. Phase ids are stable; durations are about 1 month each.

| # | `PhaseId` | Island / subtitle | Topics (gems, ~10 each) | Project (pipeline) | Challenge (engine) | Landmark |
|---|---|---|---|---|---|---|
| 8 | `fde-discovery-camp` | Discovery Camp: *Customer Discovery & Scoping* | stakeholder interviews, asking good questions (Mom Test), workflow mapping, problem statements, success metrics / ROI, constraints (data, security, latency, budget), use-case prioritisation, MVP scoping, build vs buy, managing expectations | Discovery Brief: Interviews → Workflow Map → Problem Statement → Success Metrics → Scoped MVP | `quiz` graded "Ask Better Questions" | `field-camp`: tent, map table, flickering campfire |
| 9 | `fde-integration-docks` | Integration Docks: *Enterprise Data & Integration* | reading unfamiliar API docs, OAuth2 / JWT, SSO (SAML / OIDC), webhooks, ETL / ELT, messy data cleaning, document ingestion (PDF / OCR), CRM / ticketing systems, data warehouses, idempotency & retries, MCP servers for internal tools | Enterprise Support Agent: Ticket → Webhook → Agent → Knowledge Base \| CRM Lookup → Draft Reply → Human Approval → Ticket Update | `sort-bins` "Connect It" (REST API / Webhook / Batch ETL / MCP server) | `pipe-docks`: crane, crates, pipes with moving packets |
| 10 | `fde-launch-pad` | Launch Pad: *Deployment & Cloud* | Docker, Kubernetes basics, AWS / Azure / GCP, IAM, networking (VPC, private endpoints, TLS), infrastructure as code, CI/CD, staging → production, VPC / on-prem / air-gapped deployments, cloud model endpoints (Bedrock / Azure OpenAI / Vertex), cost control | Deploy into a Customer Cloud: Git Push → CI Tests → Container Image → Registry → Terraform → Staging → Smoke Tests → Production | `pipeline-order` "Ship to Production" (with distractors) | `launch-pad`: rocket on a gantry, blinking lights, vapour |
| 11 | `fde-proving-grounds` | Proving Grounds: *Field Evaluation & Observability* | golden datasets from real tasks, LLM-as-judge, offline vs online evals, A/B tests, tracing (OpenTelemetry, Langfuse / LangSmith), latency & cost tracking, guardrails, fallbacks & timeouts, debugging non-deterministic output, regressions after model upgrades, postmortems | Customer Eval Harness: Real Tasks → Golden Dataset → Run Pipeline → Rules \| LLM-as-Judge → Scorecard → Regression Gate | `sort-bins` timed "Triage the Incident" (Prompt / Retrieval / Integration / Infrastructure) | `observatory`: dome, rotating telescope, bobbing scoreboard |
| 12 | `fde-trust-vault` | Trust Vault: *Enterprise Security & Compliance* | PII detection & redaction, encryption, secrets management, RBAC, tenant isolation, data residency & retention, SOC 2 / GDPR / HIPAA, audit logs, OWASP Top 10 for LLMs, security reviews & questionnaires | Document-Processing Workflow: PDF Upload → Parsing → PII Redaction → Structured Extraction → Validation → Human Review → System of Record | `sort-bins` "Data Checkpoint" (Allow / Redact / Block) | `vault`: vault door with a spinning dial, glowing lock |
| 13 | `fde-go-live-beacon` | Go-Live Beacon: *Rollout, Adoption & Feedback* | demos & pilots, go-live plans, user training, runbooks & docs, handoff to the customer team, change management, adoption & ROI measurement, architecture decision records, technical writing, field → product feedback, reusable components | Client Case Study: Problem → Architecture → Decisions (ADRs) → Evals → Latency \| Cost \| Accuracy → Postmortem | `pipeline-order` "Go-Live Plan" | `beacon`: mast with expanding signal rings and a flag |

`CareerPath` entry:
- `id: 'fde'`, `label: 'AI Forward Deployed Engineer'`, new optional `shortLabel: 'AI FDE'`, `pathLabel: 'AI FDE path'`, emoji 🔴.
- Coral palette, distinct from meta lavender and common orange.
- definition / goal / quote ("I make AI work inside real customers' businesses"), `excellentAt`, and `finalSkills`.
- Timeline **~10–12 months**, 10 steps: Python+SQL+APIs · ML Fundamentals · LLMs+Prompting+RAG · Agents+MCP · Discovery · Integration · Deployment · Evals · Security · Go-live + case-study portfolio.
- Career ladder: `ladderRung: 'AI FDE'` (added to the rung row beside AI Developer / AI Engineer), `ladderBranches: ['AI Solutions']`.

## Implementation steps

### 0. Docs first
- Write `docs/AI Forward Deployed Engineer.md` (content above, plus comparison stars, timeline and sources).
- Write `docs/plan/phase-7-fde-path.md`.
- Add a status.md Phase 7 row and checklist.
- Update CLAUDE.md: the second source-of-truth doc, the 6 new world-map rows, `PATH_IDS` including `'fde'`, and the `sharedPhases` contract.

### 1. HUD subtitle (`components/ui/HUD.tsx` ~line 103)
Under the title, add `<div className="truncate text-xs font-bold opacity-70 sm:text-sm">{phase.subtitle}</div>`, before the `TrackBadge`. The pill already truncates within `max-w-[calc(50vw-12px)]`. Meta islands show their subtitle too (e.g. "From here the paths diverge").

### 2. Data model: shared phases (`data/roadmap.ts`, `lib/progress.ts`)
- `CareerPath` gains `sharedPhases?: PhaseId[]` (another path's phases this roadmap includes, in walking order, before its own) and `shortLabel?: string`.
- `PATH_PHASES[id] = [...(sharedPhases ?? []), ...trackPhases(id).map(p => p.id)]` (`lib/progress.ts:28`). With no other changes, this makes these work for FDE: `pathScore`, `pathComplete`, `suggestedNext` (the compass), `crossed-fork` and the Roadmap tab.
- `roadmapSections(path)` inserts a section "Shared with the AI Developer path" (track of the owning path) before the path's own section.
- The `both-paths` achievement checks each path's **own** phases (`trackPhases`), so a shared Developer badge doesn't count for FDE.
- The "Island Hopper" text uses `PHASE_IDS.length` instead of "20".
- New helper `pathsIncluding(phaseId)`. PhasePanel shows an extra small `TrackBadge` "Also on: AI FDE path" on shared islands. In the Passport, the FDE column header notes "+ 4 shared AI Developer islands".
- Dev check: every `sharedPhases` id exists and belongs to another path.
- `pathStart` stays on the path's own first island, so the Fork arm and bridge sign point to Discovery Camp.

### 3. Content (`data/roadmap.ts`)
- `PATH_IDS` += `'fde'`. `PHASE_IDS` += the 6 ids (after the engineer block, before `summit`).
- Six `Phase` objects (`docPhase` 8–13, groups, tools, project, mentor with 4–5 lines and a new name each).
- The `CareerPath` entry, `ROADMAP_SHAPE.branches.fde` and `CAREER_LADDER` rows.
- `COMPARISON`: add `fde` stars to every row, plus 3 new rows rated for all three paths: Customer Communication, Enterprise Integration, Cloud Deployment. These ratings come from the new doc; record them in the status.md Decisions log as an authored addition.
- Meta copy:
  - Harbor: summary, a new "AI Forward Deployed Engineer" topic gem, and Byte's lines.
  - Fork: summary, an "AI FDE goal" gem, and Compass's lines.
  - Summit: the mentor line.
  - `app/layout.tsx` and `app/opengraph-image.tsx` descriptions.
- `lib/palette.ts`: `TRACK_COLORS.fde` and `GEM_COLORS.fde` (coral).

### 4. World (`data/world.ts`)
- `LandmarkType` += `field-camp | pipe-docks | launch-pad | observatory | vault | beacon`.
- Six `island(...)` entries running down the free middle corridor (x ≈ 0) between the Fork (z −180) and the Summit (z −410), zig-zagging. Starting points: (0,3,−217) · (−14,3.5,−248) · (12,4.5,−279) · (−12,5,−310) · (12,5.5,−341) · (−8,6,−372), radius 11.
- `BRIDGES`: add a `chain(['fork', …6 fde…, 'summit'])`.
- A node layout-check script (scratchpad) confirms:
  - bridge gaps are ≥ 8 m
  - islands are ≥ 20 m from Developer / Engineer islands
  - `challengePosition` / `dockPosition` don't throw on the Fork (now 4 bridges) or the Summit (now 3)
- Gem positions on the Fork and Summit shift; gem ids are unchanged.

### 5. Landmarks (`components/world/landmarks/`)
- Six new files, about 100 lines each. Follow `Lighthouse.tsx` / `Fort.tsx`:
  - module-scope `const F = TRACK_COLORS.fde`
  - `Static` / `mergeParts` for the static body
  - animated materials at module scope
  - small moving details inside `<Near>`
  - `useLandmarkFrame` for idle animation
- Register each in `landmarks/index.ts` with a label height and colliders.
- `Signpost.tsx` already draws N arms and N bars. Widen its fixed collider (`index.ts:69`) to fit the wider 3-bar chart, and check that the 4 Fork bridges don't hit the arms.

### 6. Challenges (`data/minigames.ts`, `components/minigames/engines/Quiz.tsx`)
- Six `MINIGAMES` entries using the existing `quiz` / `sortBins` / `pipeline` helpers. Each SortBins item has a `why`; each distractor has a `why`; `recapTopicIds` point at the new topics. The existing dev checks validate them.
- **Fork personality quiz → 3 paths.** Change `QuizOption.weight` to `number | Partial<Record<PathId, number>>`:
  - `Quiz.tsx` sums a per-path vector.
  - `pickOutcome` picks the path outcome with the highest total, and falls back to the `meta` "start as a Developer" outcome on a tie or a low total.
  - Re-author the 6 questions with an FDE-leaning option each (customer-facing, integration, shipping in messy environments).
  - Update the `explain` strings with the FDE stars, and add the `ai-fde-goal` recap id.

### 7. UI touch-ups for 3 paths (from the survey)
- `FinaleOverlay.tsx:29–31, 48–49`: replace the hardcoded rung notes (`developer.quote`, `engineer.goal`) with a lookup driven by `CAREER_PATHS` (`ladderRung` → quote, `ladderBranches` → goal). Rung rows get `flex-wrap`, and buttons use `shortLabel ?? label`.
- `RoadmapTab.tsx` picker and the `lib/certificate.ts` path chips use `shortLabel ?? label`.
- `PhasePanel.tsx` HarborOverview: generalise the 2-path "↙ ↘" arrows and the `grid-cols-2` to N branches. The Summit card tint stays `CAREER_PATHS[0]`.
- `Passport.tsx` Job-ready grid: `sm:grid-cols-2 lg:grid-cols-3`.
- README: the path count, gem count, island count, and the FDE in the intro list.

### 8. Close the session
Update status.md (checklist, Decisions log, handoff notes, known issues, Next up) and README.

## Critical files
`components/ui/HUD.tsx`, `data/roadmap.ts`, `lib/progress.ts`, `data/world.ts`, `lib/palette.ts`, `data/minigames.ts`, `components/minigames/engines/Quiz.tsx`, `components/world/landmarks/{index.ts, Signpost.tsx, + 6 new}`, `components/ui/{PhasePanel, Passport, RoadmapTab, FinaleOverlay}.tsx`, `lib/certificate.ts`, `app/layout.tsx`, `app/opengraph-image.tsx`, the new `docs/AI Forward Deployed Engineer.md`, `docs/plan/phase-7-fde-path.md`, CLAUDE.md, status.md, README.md.

Reuse: `trackPhases`, `PATH_PHASES`, `roadmapSections`, `pathStart`, the `chain()` bridge helper, `island()`, landmark `kit.tsx` (`Static`, `Near`, `Caption`, `useLandmarkFrame`), `lib/landmarkKit.ts` builders, and the minigame helpers `pipeline` / `sortBins` / `quiz`.

## Verification
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass. Dev-mode content checks in `roadmap.ts`, `progress.ts`, `minigames.ts` and `sims.ts` don't throw.
- The node layout-check script passes: bridge gaps, island clearance, and pedestal / dock / gem placement on all 26 islands.
- Playwright + local Chrome against `next start`, following the pattern of earlier phases' scratchpad scripts:
  - HUD pill on App Factory reads "App Factory / AI Application Engineering / AI Developer path"; screenshot at desktop and 375 px.
  - Walk Fork → all 6 FDE bridges → Summit in both directions without falling.
  - Each new landmark opens its panel with E; each pedestal opens its Challenge and auto-solves to a badge.
  - The Fork quiz can end on each of the 3 path outcomes and the fallback.
  - Roadmap tab → AI FDE shows trunk → shared Developer section → FDE section → Summit, and prints.
  - Job-ready shows 3 meters; the compass follows FDE when FDE leads; a shared island shows "Also on: AI FDE path".
  - The finale ladder shows the AI FDE rung; the certificate lists the completed FDE path.
  - No horizontal overflow at 375 px on the HUD, Passport (all tabs), Fork compare tab, Summit tabs, finale and Roadmap tab.
  - Screenshots of the 6 new landmarks. Draw calls stay in the Phase 6 range, at about 60 fps.
- Existing saves load unchanged: no store version bump, and the new phase ids just add keys.
