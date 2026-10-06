# Pathfinder AI

*Find your path into AI.*

A cartoonish, first-person 3D browser world where you **walk** the AI Developer / AI Engineer roadmap instead of reading it. Each roadmap phase is a floating island. The trunk (programming, math, ML fundamentals) leads to a fork, where the Developer and Engineer paths split, and both paths meet again at the Summit.

> **Status:** Phases 1–3 of 5 are done: the world and movement, all the roadmap content, and a mini-game on every island. Walk up to a landmark to read its phase, collect Skill Gems (one per topic, 268 in all), play each island's challenge to earn a 1–3 star badge, track the projects you've built in the Skill Passport, and fast-travel between islands. Bespoke concept simulations and the final landmark art come in later phases. See [status.md](status.md) and [docs/plan/](docs/plan/).

## Play

```bash
npm install
npm run dev        # http://localhost:3000
```

| | Desktop | Mobile |
|---|---|---|
| Move | WASD / arrows | Left-half joystick |
| Look | Mouse (click to lock, Esc to release) | Drag on the right half |
| Jump | Space | Jump button |
| Sprint | Shift | Push the stick to the rim |
| Explore a landmark | E (when prompted) | E button or the "Tap to explore" pill |
| Play a mini-game | E at the ★ Challenge pedestal | E button or the "Tap to play" pill |
| Skill Passport | P | 📖 button |
| Close a panel or game | Esc or ✕ | ✕ |

Skill Gems are collected by walking into them. Each island has a ★ Challenge pedestal beside its landmark (the panel's Challenge tab starts it too). The mini-games are ordering pipelines, sorting cards into bins and quizzes, plus a short tutorial at the Harbor. Every answer comes with an explanation, and your best stars are kept as the island's badge. If you fall off an island, you respawn on the last island you stood on. Progress (gems, badges, projects, visited islands) is saved in `localStorage`.

**Debug flags:** `?debug` shows FPS, an island/landmark/checkpoint readout and the `window.__aiQuest` test hook (with landmark, pedestal and gem positions, plus the mini-game configs). `?physics` draws the colliders.

## Stack

Next.js (App Router, TypeScript, Tailwind) · `@react-three/fiber` · `@react-three/drei` · `@react-three/rapier` · `zustand`. All art is procedural (low-poly primitives, toon shading, outlines). There's no backend and no external assets.

## Layout

```
app/              page.tsx loads the game client-only (ssr: false)
components/       Game.tsx, world/ (islands, bridges, signs, scenery, gems, mentors, pedestals, clouds),
                  player/ (controller, input, touch), ui/ (HUD, phase panel, passport, minimap, toasts),
                  minigames/ (host, lazy registry, PipelineOrder / SortBins / Quiz engines, tutorial)
data/             roadmap.ts (all roadmap content), world.ts (island positions + bridges),
                  minigames.ts (one mini-game config per island)
lib/              palette, toon gradient, seeded random, world layout (landmarks, mentors, signs, gem spawns)
store/            progress.ts (persisted), ui.ts
docs/             roadmap source doc + per-phase plans
```

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint
```
