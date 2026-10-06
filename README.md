# Pathfinder AI

*Find your path into AI.*

A cartoonish, first-person 3D browser world where you **walk** the AI Developer / AI Engineer roadmap instead of reading it. Each roadmap phase is a floating island. The trunk (programming, math, ML fundamentals) leads to a fork, where the Developer and Engineer paths split, and both paths meet again at the Summit.

> **Status:** Phases 1–2 of 5 are done: the world and movement, plus all the roadmap content. Walk up to a landmark to read its phase, collect Skill Gems (one per topic, 268 in all), track the projects you've built in the Skill Passport, and fast-travel between islands. Mini-games, badges and the final landmark art come in later phases. See [status.md](status.md) and [docs/plan/](docs/plan/).

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
| Skill Passport | P | 📖 button |
| Close a panel | Esc or ✕ | ✕ |

Skill Gems are collected by walking into them. If you fall off an island, you respawn on the last island you stood on. Progress (gems, projects, visited islands) is saved in `localStorage`.

**Debug flags:** `?debug` shows FPS, an island/landmark/checkpoint readout and the `window.__aiQuest` test hook (with landmark and gem positions). `?physics` draws the colliders.

## Stack

Next.js (App Router, TypeScript, Tailwind) · `@react-three/fiber` · `@react-three/drei` · `@react-three/rapier` · `zustand`. All art is procedural (low-poly primitives, toon shading, outlines). There's no backend and no external assets.

## Layout

```
app/              page.tsx loads the game client-only (ssr: false)
components/       Game.tsx, world/ (islands, bridges, signs, scenery, gems, mentors, clouds),
                  player/ (controller, input, touch), ui/ (HUD, phase panel, passport, minimap, toasts)
data/             roadmap.ts (all roadmap content), world.ts (island positions + bridges)
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
