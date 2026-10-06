# Phase 1: Scaffold & World Movement

> Read [CLAUDE.md](../../CLAUDE.md) and [status.md](../../status.md) first.

## Goal
A running Next.js app where the player can walk in first person across all floating islands and bridges, on desktop and mobile. Fall off and you respawn. No roadmap content yet: islands use placeholder landmarks.

## Scope

### 1. Project scaffold
- The repo root already contains `CLAUDE.md`, `status.md` and `docs/`, so `create-next-app` will refuse to scaffold there (it flags the non-allowlisted files). **Workaround:** scaffold into a temp subfolder, e.g. `npx create-next-app@latest _scaffold --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm`, then move its contents (including dotfiles) to the root and delete `_scaffold`.
- Install `three @react-three/fiber @react-three/drei @react-three/rapier zustand` and dev dependency `@types/three`. Check that the R3F major version supports the installed React version (R3F v9 ↔ React 19).
- `git init` with a sensible `.gitignore`. Only commit when the user asks.
- Remove the boilerplate page content. Set the page title "Pathfinder AI".

### 2. App shell
- `app/page.tsx`: `"use client"` + `dynamic(() => import('@/components/Game'), { ssr: false })`, with a simple full-screen loading fallback.
- `app/globals.css`: full-viewport canvas, `overscroll-behavior: none`, `touch-action: none` on the canvas container, no page scroll.

### 3. Scene
- `components/Game.tsx`:
  - `<Canvas shadows dpr={[1, 1.75]} camera={{ fov: 70 }}>`
  - `<Physics>`, drei `<Sky>` (warm, high sun), soft hemisphere light + one shadow-casting directional light, fog for depth
  - a few drei `<Clouds>` / `<Cloud>` below and around the islands
- `lib/palette.ts` (track colours + neutrals) and `lib/toon.ts` (a cached 3–4 step gradient `DataTexture` for `MeshToonMaterial`).

### 4. World data and geometry
- `data/world.ts`:
  - `IslandDef[]` for **all 20 PhaseIds** in CLAUDE.md, plus `BridgeDef[]`
  - Layout: trunk Harbor → Code Village → Math Mountain → ML Meadow → Fork along −Z, ~40–50 units apart
  - The Developer chain (6 islands) arcs to −X and the Engineer chain (8 islands) to +X; both connect to Summit
  - Vary island heights slightly so it feels hand-made
- `components/world/Island.tsx`: a chunky low-poly floating island (flattened cylinder/dodecahedron top with grass colour, inverted rocky cone underneath, a few dangling rocks), toon material + `Outlines`. Give it a rapier fixed collider (cylinder for the walkable top).
- `components/world/Bridge.tsx`: planks between island edges (computed from positions and radii), side ropes on posts, fixed colliders on the planks. Add invisible low side walls so players don't trivially fall off while learning controls.
- `components/world/Landmark.tsx`: a placeholder per island (coloured pillar + floating `Text` label of the island name). Phase 5 replaces these.
- `components/world/Scenery.tsx`: instanced trees, rocks and flowers scattered on islands (seeded random so the layout is stable).

### 5. Player
- `components/player/Player.tsx`: a rapier `KinematicCharacterController` capsule (height ~1.7, eye height ~1.6), gravity, jump, max slope, autostep for planks, and a camera attached at eye height.
- `components/player/useInput.ts`: one unified input state (move vector, look delta, jump, interact) from:
  - **desktop:** drei `KeyboardControls` (WASD/arrows, Space, E, Shift = sprint) + pointer-locked mouse look
  - **mobile:** see `MobileControls`
- `components/player/MobileControls.tsx` (rendered outside the Canvas when `matchMedia('(pointer: coarse)')`):
  - left half: virtual joystick
  - right half: drag-to-look
  - buttons: Jump and Interact (interact is a no-op for now)
- **Respawn:** if `y < -30`, fade to white, then teleport to the last checkpoint (the centre of the last island stood on). Update the checkpoint whenever the player is within an island's radius.
- **Desktop UX:** click to start (a "Click to explore" overlay); Esc releases pointer lock and shows the overlay again.

### 6. State stubs
- `store/ui.ts` with `mode` (default `'explore'`) and `nearbyPhaseId` (for now just the island the player is standing on).
- `store/progress.ts` with the full persisted shape from CLAUDE.md, but only `checkpoint`/`lastIsland`/`visited` wired up in this phase.

### 7. Debug HUD (temporary)
A small corner readout of the current island id and FPS (drei `<Stats>` behind `?debug`).

## Out of scope
Roadmap content, gems, panels, mini-games, final landmark art, audio.

## Acceptance criteria
- `npm run build` passes, and the console shows no hydration warnings.
- Desktop: click to lock the pointer, then WASD, mouse look, jump and sprint all work. The player can walk Harbor → Fork → each path → Summit across bridges.
- Mobile (DevTools device emulation + a real phone if available): joystick movement, drag look and the jump button all work, and the page doesn't scroll or zoom.
- Falling off any island respawns the player on the last island.
- Reloading the page spawns the player at the persisted last island.
- ~60 fps on desktop with the full world loaded.

## Verification
Run `npm run dev`, then drive the app in a browser and check each acceptance item. Also emulate a 375×812 touch device.
