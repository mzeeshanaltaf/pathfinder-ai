# Pathfinder AI

**Tagline:** *Find your path into AI.*

Branding stays career-agnostic. v1 covers the AI Developer and AI Engineer paths, but the app should grow into other AI career paths (e.g. Forward Deployed Engineer). Keep names, copy and the `Track` / data model free of assumptions that only two paths exist.

A cartoonish, first-person 3D browser world where learners *walk* the AI Developer / AI Engineer roadmap instead of reading a document. Each roadmap phase is a floating island with a landmark. Learners collect **Skill Gems** (topics), play a short **mini-game** per phase to earn a **badge**, track real-world **projects**, and watch their **Skill Passport** fill up. The aim is engagement: give learners reasons to come back.

## Session workflow (read first)
The project is built in phases, **one phase per Claude Code session**.

1. **Start of session:** read [status.md](status.md), then the plan file for the current phase in [docs/plan/](docs/plan/). Skim earlier phases' "Handoff notes" in status.md.
2. **During the session:** implement only that phase's scope. If you must deviate from the plan or the contracts below, record it under "Decisions log" in status.md.
3. **End of session:** update [status.md](status.md):
   - tick the phase checklist and set the phase status
   - add handoff notes (what exists, where, anything half-done)
   - list known issues
   - set the "Next up" pointer

   Update this file only if a project-wide convention or contract changed.

| Phase | Plan file |
|---|---|
| 1 | [phase-1-scaffold-and-world-movement.md](docs/plan/phase-1-scaffold-and-world-movement.md) |
| 2 | [phase-2-roadmap-content-and-interaction.md](docs/plan/phase-2-roadmap-content-and-interaction.md) |
| 3 | [phase-3-minigame-framework.md](docs/plan/phase-3-minigame-framework.md) |
| 4 | [phase-4-concept-simulations.md](docs/plan/phase-4-concept-simulations.md) |
| 5 | [phase-5-polish-engagement-and-finale.md](docs/plan/phase-5-polish-engagement-and-finale.md) |

**Content source of truth:** [docs/AI Engineer-Developer.md](docs/AI%20Engineer-Developer.md). All topics, durations, projects, comparison stars and timelines come from it. Don't invent roadmap content. Short explanatory "bites" for topics are the only authored additions.

## Locked decisions
- **Theme:** floating island village in a pastel cartoon sky. Islands are joined by plank/rope bridges.
- **View:** first person. Desktop uses WASD + mouse (pointer lock). Mobile uses a touch joystick plus drag-to-look, and is a first-class target.
- **Interactivity:** explore, with a mini-game per phase. Mini-games are HTML overlay panels (the game pauses and pointer lock is released).
- **Stack:** Next.js (App Router, TypeScript, Tailwind) + `@react-three/fiber` + `@react-three/drei` + `@react-three/rapier` + `zustand`.
- **Persistence:** localStorage only (zustand `persist`). No backend and no accounts.
- **No hard locks:** every island is reachable from the start. Progress guides through lit bridges, a compass and a "suggested next", never through gates. This follows the doc's advice not to force the Developer/Engineer choice early.
- **Procedural art:** low-poly primitives + `MeshToonMaterial` + drei `Outlines`. No external model downloads (CC0 assets may be added later, but are not required).
- **Data-driven:** world layout and content live in `data/`, so new roadmaps could be added without engine changes.

## World map (stable IDs, used everywhere)
The layout mirrors the roadmap's shape: a trunk, then a fork, then two paths that converge.

The trunk runs along −Z from the Harbor to the Fork. The Developer path (🟢 green) branches to −X and the Engineer path (🔵 blue) to +X. Both converge at the Summit further along −Z.

| `PhaseId` | Track | Doc section | Landmark | Mini-game id (final) |
|---|---|---|---|---|
| `harbor` | meta | Intro + definitions | Dock + guide robot "Byte" | `tutorial` |
| `code-village` | common | Phase 1 Programming + Task API project | Workshop houses | `pipeline-order` |
| `math-mountain` | common | Phase 2 Mathematics | Mountain with valleys | `gradient-descent` |
| `ml-meadow` | common | Phase 3 ML Fundamentals + Churn project | Farm with barns | `curve-fit` |
| `fork` | meta | Divergence + side-by-side comparison | Crossroads signpost + 3D star bars | `quiz` (path-fit) |
| `dev-llm-lighthouse` | developer | Dev P4 LLM Fundamentals | Lighthouse | `temperature` |
| `dev-prompt-workshop` | developer | Dev P5 Prompt Engineering + Support bot | Craft shop | `sort-bins` (prompt fixer) |
| `dev-rag-library` | developer | Dev P6 RAG + Knowledge assistant | Library | `chunk-retrieve` |
| `dev-agent-hq` | developer | Dev P7 Agents + Research agent | Control tower | `sort-bins` (tool router) |
| `dev-app-factory` | developer | Dev P8 App Engineering + AI SaaS | Factory | `pipeline-order` (SaaS stack) |
| `dev-shield-fort` | developer | Dev P9 Evaluation & Security | Fort | `injection-defense` |
| `eng-neural-garden` | engineer | Eng P4 Deep Learning + Image classifier | Glowing neuron trees | `perceptron` |
| `eng-transformer-tower` | engineer | Eng P5 Transformers | Tall tower | `attention-beams` |
| `eng-model-forge` | engineer | Eng P6 LLMs & Foundation Models | Forge | `fit-the-gpu` |
| `eng-deep-archive` | engineer | Eng P7 Advanced RAG | Archive | `rank-it` |
| `eng-clockwork-keep` | engineer | Eng P8 Agent Architecture | Gear tower | `pipeline-order` (agent loop) |
| `eng-gpu-plant` | engineer | Eng P9 Model Serving & Inference | Power plant | `batching` |
| `eng-mlops-conveyor` | engineer | Eng P10 MLOps / LLMOps | Conveyor factory | `drift-watch` |
| `eng-security-citadel` | engineer | Eng P11 AI Security | Citadel | `injection-defense` (hard) |
| `summit` | meta | Eng P12 + final skill sets, timeline, career ladder, projects list | Summit plaza + 3D architecture | `final-assembly` |

## Directory structure (target)
```
app/                 layout.tsx, page.tsx (dynamic import, ssr:false), globals.css
components/Game.tsx  Canvas + Physics + lights + sky + World + Player; HUD mounted outside Canvas
components/world/    Island, Bridge, Landmark (switch on type), landmarks/*, SkillGem, Mentor, QuestBoard, CompareBoard, Clouds, Ocean/void
components/player/   Player (rapier kinematic character controller), useInput, MobileControls
components/ui/       HUD, InteractPrompt, PhasePanel, GemToast, Passport, Minimap, Onboarding, Settings, Certificate
components/minigames/ registry.ts, MiniGameHost.tsx, engines (PipelineOrder, SortBins, Quiz) + bespoke sims
data/roadmap.ts      typed roadmap content (phases, topics + bites, projects, comparison, timelines)
data/world.ts        island positions, sizes, landmark type, bridges, spawn/checkpoints, interaction radii
lib/worldLayout.ts   derived geometry: bridge frames, landmark/mentor positions, sign layouts, seeded gem spawns
data/minigames.ts    per-phase mini-game id + config
store/progress.ts    persisted (localStorage) progress
store/ui.ts          non-persisted UI/game mode
lib/                 helpers (palette, toon gradient texture, math)
```

## Core contracts (keep stable across phases)
```ts
// data/roadmap.ts
export type Track = 'meta' | 'common' | 'developer' | 'engineer';
export type PhaseId = 'harbor' | 'code-village' | /* ...all ids in the table above */ 'summit';
export interface Topic { id: string; label: string; bite: string }            // bite = 1–2 sentence plain-English explanation
export interface TopicGroup { title: string; topics: Topic[] }
export interface Project { id: string; title: string; pipeline: string[] }    // pipeline steps in doc order
export interface Phase {
  id: PhaseId; track: Track; docPhase?: number; title: string; subtitle: string;
  duration?: string; summary: string; groups: TopicGroup[];
  tools?: string[]; antiPatterns?: string[]; keyQuestion?: string;
  project?: Project; mentor: { name: string; lines: string[] };
  diagrams?: { title: string; steps: string[] }[];                            // non-project flows from the doc
}
// Pipeline / diagram steps containing " | " are parallel boxes (e.g. 'Web Search | RAG Agent').
// Meta content (comparison, timelines, build ladder, career ladder…) is exported alongside PHASES.
// Gem id = `${phaseId}:${topic.id}`

// data/world.ts
export interface IslandDef { id: PhaseId; position: [number, number, number]; radius: number; landmark: LandmarkType; color: string }
export interface BridgeDef { from: PhaseId; to: PhaseId }

// store/progress.ts  (zustand persist, key 'pathfinder-ai-progress', has `version` + migrate)
gems: Record<string, true>; badges: Partial<Record<PhaseId, { stars: 1|2|3; completedAt: string }>>;
projects: Record<string, boolean>; visited: Partial<Record<PhaseId, true>>;
lastIsland: PhaseId; checkpoint: [number, number, number];
streak: { count: number; lastVisitDate: string }; onboardingDone: boolean;
settings: { muted: boolean; sensitivity: number; invertY: boolean; quality: 'auto'|'low'|'high' };

// store/ui.ts (not persisted)
mode: 'explore' | 'panel' | 'minigame' | 'passport' | 'menu';
nearbyPhaseId: PhaseId | null;   // landmark within interact range (drives the E prompt)
currentIsland: PhaseId | null;   // island the player is standing on (HUD)
activePhaseId: PhaseId | null;

// components/minigames
export interface MiniGameProps<C = unknown> {
  phaseId: PhaseId; config: C;
  onComplete: (r: { score: number; stars: 1 | 2 | 3 }) => void;
  onExit: () => void;
}
```

## Conventions & gotchas
- **SSR off for the game.** `app/page.tsx` is a client component that loads `components/Game` via `next/dynamic(..., { ssr: false })`. The game uses `window`, pointer lock, WASM (rapier) and localStorage. Skipping this causes hydration mismatch and dead UI.
- **Input gating.** Player movement and look only run while `ui.mode === 'explore'`. Opening any panel calls `document.exitPointerLock()`. Closing it returns to explore, and on desktop pointer lock is re-requested on the next click.
- **No React state in `useFrame`.** Use refs for per-frame values. Write to zustand only on discrete events (gem collected, entered island radius).
- **Mobile parity.** Every interaction needs a touch path: the Interact button, panels with big tap targets, no hover-only UI. Overlays must not scroll horizontally at 375px width.
- **Performance budget:** ~60 fps on a mid laptop. Clamp dpr to [1, 1.75] and use drei `PerformanceMonitor` to drop quality. Instance repeated props (trees, rocks, gems). Use one shadow-casting directional light.
- **Palette:** pastel, defined once in `lib/palette.ts`. Developer = green family, Engineer = blue family, Common = warm yellow/orange, Meta = lavender.
- **File writing:** use the Write/Edit tools, never shell heredocs (they mis-parse on this Windows machine).
- **Shell:** Windows; PowerShell is primary, and Git Bash is available.

## Commands
```
npm run dev      # local dev server
npm run build    # production build (must pass at the end of every phase)
npm run lint
```
