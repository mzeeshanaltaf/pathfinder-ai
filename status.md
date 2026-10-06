# Project Status: Pathfinder AI

> Update this file at the end of every session. See the session workflow in [CLAUDE.md](CLAUDE.md).

**Next up:** Phase 2 ([phase-2-roadmap-content-and-interaction.md](docs/plan/phase-2-roadmap-content-and-interaction.md))
**Last updated:** 2026-10-06 (Phase 1 session)

## Phase overview
| # | Phase | Status | Session date |
|---|---|---|---|
| 1 | [Scaffold & World Movement](docs/plan/phase-1-scaffold-and-world-movement.md) | ✅ Done | 2026-10-06 |
| 2 | [Roadmap Content & Interaction](docs/plan/phase-2-roadmap-content-and-interaction.md) | ⬜ Not started | |
| 3 | [Mini-game Framework](docs/plan/phase-3-minigame-framework.md) | ⬜ Not started | |
| 4 | [Concept Simulations](docs/plan/phase-4-concept-simulations.md) | ⬜ Not started | |
| 5 | [Polish, Engagement & Finale](docs/plan/phase-5-polish-engagement-and-finale.md) | ⬜ Not started | |

Status legend: ⬜ Not started · 🟨 In progress · ✅ Done · ⚠️ Done with carry-overs

## Phase checklists

### Phase 1: Scaffold & World Movement
- [x] Next.js scaffold at the repo root (via a temp folder), dependencies installed, git initialised
- [x] `app/page.tsx` dynamic import with `ssr:false`; full-screen canvas CSS
- [x] Scene: sky, lights, fog, clouds, palette + toon gradient
- [x] `data/world.ts` with all 20 islands + bridges
- [x] Island, Bridge, placeholder Landmark, instanced Scenery
- [x] Player controller (rapier KCC): walk, look, jump, sprint
- [x] Mobile controls: joystick, drag-look, jump/interact buttons
- [x] Fall respawn + persisted checkpoint / lastIsland / visited
- [x] `store/ui.ts`, `store/progress.ts` stubs (full shape)
- [x] Acceptance criteria verified, `npm run build` passes

### Phase 2: Roadmap Content & Interaction
- [ ] `data/roadmap.ts`: all 20 phases authored from the doc (+ bites, mentors, fork/summit meta)
- [ ] Proximity detection + InteractPrompt (desktop + mobile)
- [ ] PhasePanel (overview / topics / project + "I built this" / challenge slot); fork + summit layouts
- [ ] Skill Gems (instanced) + GemToast + persistence
- [ ] Mentor NPCs with speech bubbles
- [ ] HUD, Passport (skill tree + travel), Minimap
- [ ] Bridge-head signage
- [ ] Content spot-check vs the doc; acceptance verified; build passes

### Phase 3: Mini-game Framework
- [ ] MiniGameHost (intro / result / recap), lazy registry, `data/minigames.ts`
- [ ] PipelineOrder, SortBins, Quiz engines (mouse + touch)
- [ ] Final configs: code-village, fork, prompt-workshop, agent-hq, app-factory, clockwork-keep, harbor tutorial
- [ ] Temporary configs for the 13 sim phases
- [ ] Badge award + celebration + Passport stamps
- [ ] Acceptance verified; build passes

### Phase 4: Concept Simulations
- [ ] gradient-descent (math-mountain)
- [ ] curve-fit (ml-meadow)
- [ ] temperature (dev-llm-lighthouse)
- [ ] chunk-retrieve (dev-rag-library)
- [ ] injection-defense normal (dev-shield-fort) + hard (eng-security-citadel)
- [ ] perceptron (eng-neural-garden)
- [ ] attention-beams (eng-transformer-tower)
- [ ] fit-the-gpu (eng-model-forge)
- [ ] rank-it (eng-deep-archive)
- [ ] batching (eng-gpu-plant)
- [ ] drift-watch (eng-mlops-conveyor)
- [ ] final-assembly (summit)
- [ ] Acceptance verified; build passes

### Phase 5: Polish, Engagement & Finale
- [ ] 20 unique animated landmarks
- [ ] Onboarding with Byte
- [ ] Suggested-next + compass, lit bridges, streak, welcome-back card
- [ ] Balloon fast travel, job-ready meter, achievements
- [ ] Summit finale + certificate PNG + career ladder
- [ ] Audio + mute; Settings incl. reset progress
- [ ] Performance / mobile pass, loading screen, metadata, README
- [ ] Acceptance verified; build + lint pass

## Decisions log
Record any deviation from the plan or from the CLAUDE.md contracts here (date, decision, reason).

- 2026-10-06: Theme = floating island village. Interactivity = explore + mini-games. Stack = Next.js + R3F. Persistence = localStorage. Devices = desktop + mobile. (User-confirmed in the planning session.)
- 2026-10-06: Roadmap source doc moved to `docs/AI Engineer-Developer.md`.
- 2026-10-06: App renamed from "AI Quest Islands" to **Pathfinder AI** with the tagline **"Find your path into AI."** The tagline is deliberately career-agnostic so future paths (e.g. Forward Deployed Engineer) can be added without rebranding.
  - Updated: page title, LoadingScreen, StartOverlay, `package.json` / `package-lock.json` name (`pathfinder-ai`), and the localStorage key `ai-quest-progress` → `pathfinder-ai-progress` (resets any local dev progress).
  - Use the new name in all new UI and docs (Certificate, OG metadata, README).
- 2026-10-06 (Phase 1): Versions: Next 16.3 (Turbopack), React 19.2, R3F 9.8, drei 10.7, rapier 2.2, three 0.186, zustand 5. Next 16 ships its docs in `node_modules/next/dist/docs/`; `AGENTS.md` (kept at the root) tells agents to read them. While `AGENTS.md` exists, `next dev` only rewrites that file and leaves `CLAUDE.md` alone.
- 2026-10-06 (Phase 1): The scaffold temp folder was `ai-quest-islands/`, not `_scaffold`, because npm rejects names that start with `_`.
- 2026-10-06 (Phase 1): `<Physics timeStep="vary">` runs one physics step per rendered frame, which keeps the kinematic character controller in sync with the camera at any refresh rate. Movement uses a frame `dt` clamped to 1/20 s.
- 2026-10-06 (Phase 1): Spawn and respawn use the *current* position of `lastIsland` from `data/world.ts`. The persisted `checkpoint` is only a fallback. This way, moving islands in later phases never strands a saved player.
- 2026-10-06 (Phase 1): Nothing is fetched from a CDN at runtime. The label font is `public/fonts/Geist-Regular.ttf` (OFL, copied from Next), and the cloud sprite is drawn on a canvas (`lib/cloudTexture.ts`) instead of drei's default githack URL.
- 2026-10-06 (Phase 1): Additive contract extensions (nothing existing changed): `PHASE_IDS` array + `gemId()` in `data/roadmap.ts`; `LandmarkType` union, `ISLAND_TRACK`, placeholder `ISLAND_LABELS`, `ISLAND_BY_ID`, `RESPAWN_Y` in `data/world.ts`; `pointerLocked`, `fading`, `worldReady` in `store/ui.ts`.
- 2026-10-06 (Phase 1): Bridge side walls are 1.2 m, below the ~1.4 m jump apex. Players can jump off on purpose but never walk off by accident.

## Handoff notes
Each session appends a short block: what was built, key files, anything half-done, and tips for the next session.

### Planning session (2026-10-06)
- Only planning docs exist: `CLAUDE.md`, `status.md`, `docs/plan/phase-1..5`, `docs/AI Engineer-Developer.md`. No code yet.
- Phase 1 must scaffold Next.js via a temp folder, because `create-next-app` refuses a non-empty directory containing `CLAUDE.md` / `status.md`.

### Phase 1 session (2026-10-06)
**What exists**
- `app/page.tsx` loads `components/Game.tsx` with `ssr:false`, using `components/ui/LoadingScreen.tsx` as the fallback. `app/layout.tsx` sets the metadata and a no-zoom viewport, and `globals.css` locks scroll, overscroll and touch-action.
- `components/Game.tsx` contains: KeyboardControls → Canvas (PCF shadows, dpr ≤ 1.75 + PerformanceMonitor) → Sky, fog, hemisphere light, and `SunLight` (the one shadow caster, which follows the camera with a ±40 shadow box) → `<Physics timeStep="vary">` with `World`, `Player`, `WorldReady`. The HTML overlays sit outside the Canvas: MobileControls *or* StartOverlay, then FadeOverlay, LoadingScreen, DebugHud.
- **World:** `data/world.ts` holds the 20 islands and 20 bridges. All geometry derives from it via `lib/worldLayout.ts` (bridge frames, `landmarkOffset` (the landmark faces away from every bridge), seeded `scatterOnIsland` (keeps the centre and bridge walkways clear), `islandAt`).
  - `Island.tsx`: one merged, vertex-coloured, flat-shaded mesh per island (grass cap, dirt band, jittered rock cone, dangling rocks) + Outlines + a cylinder collider.
  - `Bridge.tsx`: all bridges batched (instanced planks, beams and posts; one merged rope mesh). Each bridge has a deck collider plus two invisible side walls.
  - `Scenery.tsx`: instanced trees, pines, rocks and flowers, with tree and rock colliders in a single fixed body.
  - `Landmark.tsx`: a placeholder pillar + Billboard label, behind a `switch (def.landmark)` that Phase 5 fills in.
  - `ToonInstances.tsx`: the shared instanced toon helper.
  - `Clouds.tsx`: drei Clouds plus a hazy void disc at y = −70.
- **Player:** `components/player/Player.tsx` uses a rapier KCC capsule (1.7 m tall, eye at 1.6 m), autostep and snap-to-ground, coyote time + a jump buffer, and sprint. It tracks islands (`ui.nearbyPhaseId` + `progress.reachIsland`, written only when the island changes) and handles fall respawn (y < −30 → white fade → teleport to the centre of the last island).
  - `useInput.ts`: a single per-frame reader that merges drei keyboard, pointer-locked mouse and `touchState`.
  - `MobileControls.tsx`: floating joystick (left half), drag-look (right half), Jump and E buttons. Uses pointer events per zone, so multi-touch works, and writes to the DOM directly (no React re-render per move).
- **Input gating:** movement and look run only when `ui.mode === 'explore'` and (pointer is locked, or the device is touch). `ui.setMode(non-explore)` calls `exitPointerLock()`.
- **Stores:** `store/progress.ts` has the full persisted shape (key `pathfinder-ai-progress`, `version: 1`, `migrate`, a deep-ish `merge`, `partialize`). Only `reachIsland` → `lastIsland` / `checkpoint` / `visited` is wired up. `store/ui.ts` is not persisted.

**Debug / testing**
- `?debug` shows drei Stats (FPS) and a corner HUD (island, checkpoint, visited, mode), and exposes `window.__aiQuest` with `state()`, `teleport(x, feetY, z)`, `setLook(yaw, pitch)` and `world`. `?physics` draws the collider wireframes.
- Verified with Playwright + local Chrome (real GPU, headless) against both dev and `next start`:
  - **Desktop:** pointer lock, WASD, strafe, mouse look, jump (apex 1.42 m), sprint (1.7× walk). All 20 bridges walked in **both** directions without dropping below deck height. Fall → fade → respawn on the last island. Reload → spawn at the persisted island. Esc → overlay returns and input stops.
  - **Mobile (375×812 touch emulation):** joystick, drag-look, simultaneous move + look, Jump button, E no-op, a bridge crossed with the stick. Pinch/drag cause no scroll or zoom (`visualViewport.scale` stays 1, no overflow).
  - **Performance:** steady 60 fps (vsync cap) with the whole world in view; worst frame ~18 ms.
  - **Console:** no hydration warnings and no errors.
- Not tested on a real phone, and not on iOS Safari (only Chromium mobile emulation).

**Tips for Phase 2**
- Proximity: `ui.nearbyPhaseId` currently means "standing on the island". Phase 2 can redefine it as "near the landmark" (landmark world position = island position + `landmarkOffset(def)`).
- The E key / Interact button already produce `input.interact` (edge-triggered) in `Player`'s frame loop, but nothing consumes it yet.
- Replace `ISLAND_LABELS` with `Phase.title` once `data/roadmap.ts` has content.
- Gem spawn points: `scatterOnIsland(def, n, 'gems', spacing, { avoid: [...] })` gives stable positions that keep walkways clear.

## Known issues
- Two console warnings come from library internals and can't be fixed from our code: `THREE.Clock` deprecated (R3F) and "deprecated parameters for the initialization function" (rapier-compat WASM init).
- Shadows only cover ±40 m around the player. Distant islands show no cast shadows (by design, for performance).
- Island labels are small at long range. Phase 2 bridge-head signage should help.
- `README.md` is still the create-next-app boilerplate. It gets rewritten in Phase 5.
- No commits yet: git is initialised, but nothing is committed (the plan says commit only when the user asks).
