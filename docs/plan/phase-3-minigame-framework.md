# Phase 3: Mini-game Framework

> Read [CLAUDE.md](../../CLAUDE.md) and [status.md](../../status.md) first. Requires Phase 2.

## Goal
Every phase is playable end-to-end. A shared mini-game host, three reusable game engines, and a config for every phase let players earn **badges with 1–3 stars**. Phases whose bespoke sim comes in Phase 4 get a temporary engine-based game, so nothing is left empty.

## Scope

### 1. Host and registry
- `components/minigames/MiniGameHost.tsx`: renders when `ui.mode === 'minigame'`.
  - **Chrome:** a full-screen overlay with a title bar (phase name, mini-game name), a one-paragraph "How to play" intro card with a Start button, and an exit button.
  - **Result screen:** stars animate in, score and a "What you learned" recap linking to 1–3 topic bites. Buttons: Retry / Back to island.
- `components/minigames/registry.ts`: `Record<MiniGameId, React.LazyExoticComponent<ComponentType<MiniGameProps<any>>>>`, using `React.lazy` so games code-split.
- `data/minigames.ts`: `Record<PhaseId, { id: MiniGameId; title: string; howTo: string; config: unknown; recapTopicIds: string[] }>`.
- **Wiring:** enable the "Play mini-game" button in PhasePanel; also add a Challenge pedestal object near each landmark that opens the game directly.
- **Badges:** on `onComplete`, write `progress.badges[phaseId] = { stars, completedAt }`, keeping the best stars. Show a badge-earned celebration (confetti burst + stamp animation) and update the Passport stamp and HUD.

### 2. Reusable engines (all touch and mouse friendly; drag via pointer events, not HTML5 DnD)
- **`PipelineOrder`:** shuffled step cards; the player arranges them into the correct order, then checks. Stars by attempts (1st try = 3★). Config: `{ steps: string[]; distractors?: string[]; loop?: boolean }`.
- **`SortBins`:** items drop in one at a time, and the player taps/drags each into one of 2–4 bins. Optional timer. Stars by accuracy. Config: `{ bins: {id, label}[]; items: {text, bin, why}[]; timed?: boolean }`. Each wrong answer shows its `why`, so it teaches.
- **`Quiz`:** multiple choice with instant feedback + explanation. Optional "personality" mode with no right answers, mapped to an outcome. Config: `{ questions: {q, options: {text, correct?, weight?}[], explain}[]; mode: 'graded' | 'personality' }`.

### 3. Per-phase configs (`data/minigames.ts`)
**Final assignments (built in this phase):**
- `code-village` → PipelineOrder: Client → FastAPI → PostgreSQL → Docker (+ distractors like "Redis", "LLM")
- `fork` → Quiz (personality): "Which path fits you?" Map to Developer / Engineer / "Start as Developer, grow into Engineer" (the doc's recommendation).
- `dev-prompt-workshop` → SortBins "Prompt Fixer": good practice vs anti-pattern. Items come from the doc: few-shot, structured outputs, endlessly longer prompts, business logic in prompts, trusting output without validation, etc.
- `dev-agent-hq` → SortBins "Tool Router": tasks → Web Search / RAG / Calculator / Ask Human (human approval)
- `dev-app-factory` → PipelineOrder: Next.js → FastAPI → AI Orchestration → LLM → PostgreSQL → pgvector → Redis
- `eng-clockwork-keep` → PipelineOrder with `loop: true`: Planner → Executor → Tools → State → (back to Planner)

**Temporary configs (Phase 4 replaces them with bespoke sims; keep the same PhaseIds):**

| Phase | Temporary game |
|---|---|
| `math-mountain` | Quiz on the key concepts |
| `ml-meadow` | SortBins precision vs recall vs overfitting scenarios |
| `dev-llm-lighthouse` | Quiz |
| `dev-rag-library` | PipelineOrder RAG flow |
| `dev-shield-fort` | SortBins safe vs malicious input |
| `eng-neural-garden` | PipelineOrder Image Classification System |
| `eng-transformer-tower` | PipelineOrder Transformer architecture |
| `eng-model-forge` | SortBins pretraining / SFT / RLHF / LoRA definitions |
| `eng-deep-archive` | SortBins metric → what it measures |
| `eng-gpu-plant` | PipelineOrder serving flow |
| `eng-mlops-conveyor` | PipelineOrder MLOps loop |
| `eng-security-citadel` | SortBins hard |
| `summit` | PipelineOrder production architecture |

- `harbor` → a `tutorial` mini-game: a 3-step guided check (look around, jump, open the Passport) that awards the first badge.

### 4. Content rule
All mini-game items must come from, or be directly implied by, the doc. Every graded item needs an explanation.

## Out of scope
Bespoke simulations (Phase 4), sound effects (Phase 5).

## Acceptance criteria
- Every one of the 20 phases opens a working mini-game that can be completed, awards 1–3 stars and persists the badge (best score kept).
- Engines work with mouse and touch at 375px width. Keyboard Esc exits a game cleanly.
- Exiting or finishing returns to explore with movement working (pointer lock re-acquired on click).
- Games are lazy-loaded (check the network tab / build output).
- `npm run build` passes.
