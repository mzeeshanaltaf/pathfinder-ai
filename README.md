# Pathfinder AI

*Find your path into AI.*

A cartoonish, first-person 3D browser world where you **walk** the AI Developer / AI Engineer roadmap instead of reading it. Each roadmap phase is a floating island. The trunk (programming, math, ML fundamentals) leads to a fork, where the Developer and Engineer paths split, and both paths meet again at the Summit.

> **Status:** Phase 1 of 5 (world and movement) is done. Roadmap content, skill gems, mini-games and landmarks come in later phases. See [status.md](status.md) and [docs/plan/](docs/plan/).

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

If you fall off an island, you respawn on the last island you stood on. Progress is saved in `localStorage`.

**Debug flags:** `?debug` shows FPS, an island/checkpoint readout and the `window.__aiQuest` test hook. `?physics` draws the colliders.

## Stack

Next.js (App Router, TypeScript, Tailwind) · `@react-three/fiber` · `@react-three/drei` · `@react-three/rapier` · `zustand`. All art is procedural (low-poly primitives, toon shading, outlines). There's no backend and no external assets.

## Layout

```
app/              page.tsx loads the game client-only (ssr: false)
components/       Game.tsx, world/ (islands, bridges, scenery, clouds), player/ (controller, input, touch), ui/
data/             roadmap.ts (content contracts), world.ts (island positions + bridges)
lib/              palette, toon gradient, seeded random, world-layout helpers
store/            progress.ts (persisted), ui.ts
docs/             roadmap source doc + per-phase plans
```

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint
```
