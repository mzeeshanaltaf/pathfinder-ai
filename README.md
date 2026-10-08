# Pathfinder AI

*Find your path into AI.*

Pathfinder AI is a cartoon 3D world in the browser. Instead of reading an AI career roadmap, you **walk** it as a little explorer, with the camera behind you. Each roadmap phase is a floating island with its own animated landmark:

- A shared trunk covers programming, maths and ML fundamentals.
- At the Fork, three career paths split: the **AI Developer** (green), the **AI Engineer** (blue) and the **AI Forward Deployed Engineer** (coral). The AI FDE also walks the Developer's LLM, prompting, RAG and agent islands, then adds its own field skills: discovery, integration, deployment, evals, security and go-live.
- The paths meet again at the Summit, where a hologram shows a production AI architecture.

On every island you can:

- **Collect Skill Gems.** There is one per topic, 377 in all, and each comes with a plain-English explanation. Topics are grouped into category cards (an emoji, a title and a one-line blurb), like the roadmap infographics.
- **Read the phase.** Walk up to the landmark and press E.
- **Play its Challenge.** Each island has a mini-game or concept simulation that awards a 1–3 star badge.
- **Mark projects "I built this"** to track the portfolio projects you've built.

Your **Skill Passport** gathers all of this in one place:

- a map of every island
- the **full roadmap** of a career path, phase by phase, which you can print or save as a PDF
- a job-ready meter for each path
- your achievements
- a certificate once you reach the Summit

Every island is open from the start. The compass, lit bridges and a "next stop" suggestion guide you, but nothing is locked. The content comes from [docs/AI Engineer-Developer.md](docs/AI%20Engineer-Developer.md) and [docs/AI Forward Deployed Engineer.md](docs/AI%20Forward%20Deployed%20Engineer.md). Lists marked **➕ Addition** in the first doc, and its Phase 10 (AI Observability), were added later from a ten-part AI Developer / AI Engineer roadmap infographic series.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
```

Requires Node 20+. Nothing is fetched at runtime: there's no backend and no accounts. All art is procedural, and progress is saved in `localStorage`. To set the canonical, sitemap, robots and Open Graph URLs when deploying, set `NEXT_PUBLIC_SITE_URL` (build time, no trailing slash). SEO: the home page ships a server-rendered outline of the roadmaps, and each career path gets a static page at `/roadmaps/<slug>` (generated from `CAREER_PATHS`, see `lib/seo.ts`). In the game, those pages are linked from the intro's career cards, the Welcome back card and the Passport's Roadmap tab.

## Controls

The view moves only with the keyboard or the stick: there is no mouse-look and no pointer lock, so the HUD buttons always work with the mouse.

| | Desktop | Touch |
|---|---|---|
| Walk forward / back | W S or ↑ ↓ | Push the stick up / down (it appears wherever you touch) |
| Turn left / right | A D or ← → | Push the stick left / right |
| Jump / sprint | Space / Shift | JUMP button / push the stick to the rim |
| Explore a landmark, play a Challenge, fly from a balloon dock | E | E button or the tap pill |
| Skill Passport / full roadmap | P / 📜 | 📖 / 📜 |
| Close a panel or the gem card | Esc (from an island guide opened in the Passport, Esc goes back to the Passport) | ✕ |
| Controls hint | H or ⌨ | |
| Sound on/off | M | 🔊 |
| Settings | ⚙️ | ⚙️ |
| Skip a balloon flight or the finale | Space / Enter / Esc | Skip button |

## What's in the world

- **27 islands, 27 landmarks.** Every island has a landmark with an idle animation that shows the topic, for example:
  - a lighthouse sweeping a beam of token blocks
  - a library where retrieved chunks fly into an answer orb
  - a transformer tower with attention beams
  - the agent-loop gears of the Clockwork Keep
  - a crane and data packets flowing through the Integration Docks' pipes
  - the Go-Live Beacon sending out signal rings
  - the Watchtower (AI Observability) with its sweeping spyglass and a live trace filling in span by span
  - the Summit's holographic architecture
- **Mini-games.** Pipelines, sorting and quizzes, plus 12 hands-on simulations (gradient descent, curve fitting, temperature, chunking, attention, GPU memory, batching, drift…). The Fork's "Which path fits you?" quiz suggests one of the three paths.
- **Guidance.** A compass points to the suggested next island and its distance. Bridges glow once you've earned the badge for the island they lead from. The minimap rings your next stop.
- **Hot-air balloons.** Each island has a balloon dock, and the Passport's "Fly here" button lifts you into a short, skippable flight.
- **Coming back.** Byte greets first-time players with an onboarding tour that ends in the Harbor tutorial. Returning players get a welcome-back card. A daily streak unlocks hats for Byte at 3, 7 and 30 days. There are 11 achievements.
- **Gem cards.** Each gem you pick up shows a card with its explanation. It stays until you close it (✕ or Esc), and the next gem replaces it.
- **Full roadmap.** The 📜 button (or the Passport's Roadmap tab) lists every phase, topic, tool and project of a path, with your progress ticked. Each phase links to its island guide and a balloon ride. *Print / Save as PDF* prints a plain ink-on-white version through the browser's print dialog.
- **Job-ready meter.** Estimates the months left on each path from the doc's timelines. Built projects weigh most: *projects matter more than completing a calendar schedule*.
- **Finale.** Reaching the Summit with its badge plays a short celebration: fireworks and a fly-around of the hologram. Then comes an interactive career ladder and a certificate you can download as a PNG or print.
- **Settings.** Turn speed, graphics quality (auto/low/high), sound, Byte's hat, the name on your certificate, and Reset progress (asks to confirm).

**Performance.** Static landmark parts are merged into one mesh each. Repeated props are instanced. Small details, captions, signs, mentors and pedestals are hidden when far away. drei's `PerformanceMonitor` lowers the quality on slow devices: first the pixel ratio, then shadows, half the clouds and the flowers. Phones start one tier down.

**Debug flags.** `?debug` shows FPS, a readout (island, mode, quality tier, draw calls, triangles) and the `window.__aiQuest` test hook. `?physics` draws the colliders.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind 4) · `@react-three/fiber` · `@react-three/drei` · `@react-three/rapier` · `zustand`. The game is loaded client-only (`next/dynamic` with `ssr: false`).

## Project layout

```
app/                 layout (metadata), page (client-only game), icon.svg, opengraph-image.tsx
components/Game.tsx  Canvas, physics, lights, sky, directors + every HTML overlay
components/world/    islands, bridges (+ LitBridges), signs, scenery, gems, mentors, pedestals,
                     balloon docks + BalloonTravel, Finale (fireworks + fly-around), clouds
components/world/landmarks/
                     one file per landmark + kit (merged static meshes, captions, culling) + index (registry)
components/player/   kinematic character controller + third-person camera rig, Avatar (explorer kid),
                     input (keyboard tank steering), touch joystick, shared player state
components/ui/       HUD, compass, controls hint, Passport (+ RoadmapTab, RoadmapPrint), phase panel,
                     roadmapParts (shared roadmap blocks), onboarding, welcome back, settings,
                     finale card, certificate, gem card + toasts, loading screen
components/minigames/ host, lazy registry, engines, sims/
data/                roadmap.ts (content + CAREER_PATHS registry), world.ts (islands + bridges), minigames.ts, sims.ts
lib/                 progress.ts (suggested next, job-ready, achievements, streak), audio.ts,
                     certificate.ts, landmarkKit.ts, materials.ts, worldLayout.ts, palette…
store/               progress.ts (persisted, versioned), ui.ts
docs/                roadmap source docs + per-phase plans; status.md tracks progress
```

## Adding a roadmap or a new career path

The world is data-driven. Career paths live in one registry, and TypeScript points at every place that still needs an entry for a new path. The AI Forward Deployed Engineer was added this way in Phase 7.

**Checklist for a new career path:**

1. **`data/roadmap.ts`**
   - [ ] Add the id to `PATH_IDS`. This extends `PathId` and `Track`.
   - [ ] Add its phase ids to `PHASE_IDS`, and a `Phase` for each with `track` set to the new id (title, subtitle, summary, topic groups with bites, tools, project, mentor lines).
   - [ ] Add a `CareerPath` to `CAREER_PATHS`: `label`, optional `shortLabel` (for pickers, signpost arms and certificate chips), `pathLabel`, `emoji`, `definition`, `goal`, `quote`, `excellentAt`, optional `finalSkills`, `timeline`, and the `ladderRung` it earns in `CAREER_LADDER` (plus optional `ladderBranches`).
   - [ ] If the path overlaps another path, list those islands in `sharedPhases` instead of duplicating them. They count towards the new path's progress, appear in its Roadmap as a "Shared with…" section, and show an "Also on:" badge in their island guide.
   - [ ] Add its branch to `ROADMAP_SHAPE.branches`.
   - [ ] Optionally add its stars to the `COMPARISON` rows. `stars` is per path; a path missing from a row shows "—".
   - A dev-only check fails if a path has no `CareerPath`, no phases, no timeline steps, an unknown ladder rung, or a shared phase that isn't another path's.
2. **`lib/palette.ts`**: `TRACK_COLORS` and `GEM_COLORS` entries (the compiler asks for them).
3. **`data/world.ts`**: an `island(...)` per phase (position, radius, `LandmarkType`) and a `BRIDGES` chain from `'fork'` through the path to `'summit'`.
   - The Fork's bridge sign and signpost arm are derived from the path's first island.
   - Landmarks, mentors, pedestals, docks, signs and gems are placed by `lib/worldLayout.ts`.
4. **Landmarks** (`components/world/landmarks/`): reuse a `LandmarkType`, or add a component and register it in `landmarks/index.ts`.
5. **`data/minigames.ts`**: a Challenge per new phase. `MINIGAMES` is a `Record<PhaseId, …>`, so the compiler asks. The Fork's personality quiz scores each path separately: give the new path an option in each question (`weight: { newPath: 2 }`). Its outcome is generated from the registry, and a dev check requires one.
6. **`lib/progress.ts`**: map each timeline step to islands in `TIMELINE_PHASES`. It is a `Record<PathId, …>`, and a dev check compares the step count.

Everything else picks the path up from the registry: the compass, the job-ready meter, achievements, the Passport columns, the Roadmap tab, the Fork comparison, the Summit tabs, the onboarding cards, the finale ladder, the certificate and the balloons.

Mentor lines (Byte, Compass at the Fork) and the Harbor / Fork / Summit summaries are authored text. Update them if they should mention the new path.

**A new phase on an existing path** needs a phase id and `Phase` (step 1), an island (step 3), a landmark (step 4), a Challenge (step 5) and its `TIMELINE_PHASES` mapping.

Saved progress is keyed by stable phase ids. If ids are ever renamed, bump the version in `store/progress.ts` and migrate.
