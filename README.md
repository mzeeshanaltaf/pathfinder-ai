# Pathfinder AI

*Find your path into AI.*

Pathfinder AI is a cartoon, first-person 3D world in the browser. Instead of reading an AI career roadmap, you **walk** it. Each roadmap phase is a floating island with its own animated landmark:

- A shared trunk covers programming, maths and ML fundamentals.
- At the Fork, the **AI Developer** path (green) and the **AI Engineer** path (blue) split.
- Both paths meet again at the Summit, where a hologram shows a production AI architecture.

On every island you can:

- **Collect Skill Gems.** There is one per topic, 268 in all, and each comes with a plain-English explanation.
- **Read the phase.** Walk up to the landmark and press E.
- **Play its Challenge.** Each island has a mini-game or concept simulation that awards a 1–3 star badge.
- **Mark projects "I built this"** to track the portfolio projects you've built.

Your **Skill Passport** gathers all of this in one place:

- a map of every island
- a job-ready meter for each path
- your achievements
- a certificate once you reach the Summit

Every island is open from the start. The compass, lit bridges and a "next stop" suggestion guide you, but nothing is locked. The content comes from [docs/AI Engineer-Developer.md](docs/AI%20Engineer-Developer.md).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
```

Requires Node 20+. Nothing is fetched at runtime: there's no backend and no accounts. All art is procedural, and progress is saved in `localStorage`. To set absolute Open Graph URLs when deploying, set `NEXT_PUBLIC_SITE_URL`.

## Controls

| | Desktop | Touch |
|---|---|---|
| Move | WASD / arrows | Drag on the left half (floating joystick) |
| Look | Mouse (click to lock, Esc to release) | Drag on the right half |
| Jump / sprint | Space / Shift | JUMP button / push the stick to the rim |
| Explore a landmark, play a Challenge, fly from a balloon dock | E | E button or the tap pill |
| Skill Passport | P | 📖 |
| Sound on/off | M | 🔊 |
| Settings | ⚙️ | ⚙️ |
| Skip a balloon flight or the finale | Space / Enter / Esc | Skip button |

## What's in the world

- **20 islands, 20 landmarks.** Every island has a landmark with an idle animation that shows the topic, for example:
  - a lighthouse sweeping a beam of token blocks
  - a library where retrieved chunks fly into an answer orb
  - a transformer tower with attention beams
  - the agent-loop gears of the Clockwork Keep
  - the Summit's holographic architecture
- **Mini-games.** Pipelines, sorting and quizzes, plus 12 hands-on simulations (gradient descent, curve fitting, temperature, chunking, attention, GPU memory, batching, drift…).
- **Guidance.** A compass points to the suggested next island and its distance. Bridges glow once you've earned the badge for the island they lead from. The minimap rings your next stop.
- **Hot-air balloons.** Each island has a balloon dock, and the Passport's "Fly here" button lifts you into a short, skippable flight.
- **Coming back.** Byte greets first-time players with an onboarding tour that ends in the Harbor tutorial. Returning players get a welcome-back card. A daily streak unlocks hats for Byte at 3, 7 and 30 days. There are 11 achievements.
- **Job-ready meter.** Estimates the months left on each path from the doc's timelines. Built projects weigh most: *projects matter more than completing a calendar schedule*.
- **Finale.** Reaching the Summit with its badge plays a short celebration: fireworks and a fly-around of the hologram. Then comes an interactive career ladder and a certificate you can download as a PNG or print.
- **Settings.** Look sensitivity, invert Y, graphics quality (auto/low/high), sound, Byte's hat, the name on your certificate, and Reset progress (asks to confirm).

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
components/player/   kinematic character controller, input, touch controls, shared player state
components/ui/       HUD, compass, Passport, phase panel, onboarding, welcome back, settings,
                     finale card, certificate, toasts, loading screen
components/minigames/ host, lazy registry, engines, sims/
data/                roadmap.ts (content), world.ts (islands + bridges), minigames.ts, sims.ts
lib/                 progress.ts (suggested next, job-ready, achievements, streak), audio.ts,
                     certificate.ts, landmarkKit.ts, materials.ts, worldLayout.ts, palette…
store/               progress.ts (persisted, versioned), ui.ts
docs/                roadmap source doc + per-phase plans; status.md tracks progress
```

## Adding a roadmap or a new career path

The world is data-driven, so most of the work is in `data/`:

1. **Content (`data/roadmap.ts`)**
   - Add the phase ids to `PHASE_IDS`.
   - Add a `Phase` for each id: track, title, summary, topic groups with short bites, project, mentor lines.
   - For a new career path, also add a `Track` value and a `TRACK_LABELS` entry.
2. **Colours (`lib/palette.ts`)**: a new track needs `TRACK_COLORS` and `GEM_COLORS` entries.
3. **World (`data/world.ts`)**
   - Add an `island(...)` per phase, with a position, radius and `LandmarkType`.
   - Chain the islands with `BRIDGES`.
   - Landmarks, mentors, Challenge pedestals, balloon docks, signs and Skill Gems are placed automatically by `lib/worldLayout.ts`.
4. **Landmark (`components/world/landmarks/`)**: reuse an existing `LandmarkType`, or add a component and register it in `landmarks/index.ts` with its label height and colliders.
5. **Challenge (`data/minigames.ts`)**: give each phase a mini-game. It can be an engine config (pipeline order, sort bins, quiz) or one of the simulations in `data/sims.ts`.
6. **Guidance (`lib/progress.ts`)**
   - Add the path to `PATH_TRACKS`.
   - Map its timeline steps to islands in `TIMELINE_PHASES`, so the compass and the job-ready meter include it.
   - The new path also needs a `TIMELINES` entry in `data/roadmap.ts`.

Saved progress is keyed by stable phase ids. If ids are ever renamed, bump `PROGRESS_VERSION` in `store/progress.ts` and migrate.
