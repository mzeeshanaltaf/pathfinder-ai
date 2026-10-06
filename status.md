# Project Status: Pathfinder AI

> Update this file at the end of every session. See the session workflow in [CLAUDE.md](CLAUDE.md).

**Next up:** Phase 4 ([phase-4-concept-simulations.md](docs/plan/phase-4-concept-simulations.md))
**Last updated:** 2026-10-06 (Phase 3 session)

## Phase overview
| # | Phase | Status | Session date |
|---|---|---|---|
| 1 | [Scaffold & World Movement](docs/plan/phase-1-scaffold-and-world-movement.md) | ✅ Done | 2026-10-06 |
| 2 | [Roadmap Content & Interaction](docs/plan/phase-2-roadmap-content-and-interaction.md) | ✅ Done | 2026-10-06 |
| 3 | [Mini-game Framework](docs/plan/phase-3-minigame-framework.md) | ✅ Done | 2026-10-06 |
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
- [x] `data/roadmap.ts`: all 20 phases authored from the doc (+ bites, mentors, fork/summit meta)
- [x] Proximity detection + InteractPrompt (desktop + mobile)
- [x] PhasePanel (overview / topics / project + "I built this" / challenge slot); fork + summit layouts
- [x] Skill Gems (instanced) + GemToast + persistence
- [x] Mentor NPCs with speech bubbles
- [x] HUD, Passport (skill tree + travel), Minimap
- [x] Bridge-head signage
- [x] Content spot-check vs the doc; acceptance verified; build passes

### Phase 3: Mini-game Framework
- [x] MiniGameHost (intro / result / recap), lazy registry, `data/minigames.ts`
- [x] PipelineOrder, SortBins, Quiz engines (mouse + touch)
- [x] Final configs: code-village, fork, prompt-workshop, agent-hq, app-factory, clockwork-keep, harbor tutorial
- [x] Temporary configs for the 13 sim phases
- [x] Badge award + celebration + Passport stamps
- [x] Acceptance verified; build passes

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
- 2026-10-06 (Phase 2): **Contract changes (additive, except one semantic change):**
  - `ui.nearbyPhaseId` now means "close enough to the landmark to interact" (within `INTERACT_RADIUS` 6.5 m × landmark scale). The island the player stands on moved to the new `ui.currentIsland`.
  - `store/ui.ts` also gained `toastQueue`, `openPanel(id)`, `closeOverlay()`, `pushToast` / `shiftToast`, `setCurrentIsland`. `store/progress.ts` gained `collectGem(id)` (returns true if new) and `setProjectBuilt(projectId, built)`.
  - `Phase.diagrams?: { title; steps[] }[]` holds the doc's non-project flows (RAG pipeline, Transformer architecture, agent loop, serving path + "optimize for", MLOps lifecycle, P12 architecture). Pipeline/diagram steps containing `" | "` render as parallel boxes (e.g. the research agent's `Web Search | RAG Agent`).
  - `data/roadmap.ts` also exports the meta content: `ROADMAP_SHAPE`, `DEFINITIONS`, `TRACK_GOALS`, `COMPARISON` (`{ area, dev, eng }`), `DIFFERENCE`, `DEVELOPER_FINAL_SKILLS`, `TIMELINES`, `TIMELINE_NOTE`, `BUILD_PROJECTS`, `BUILD_ADVICE`, `CAREER_LADDER`, `ENTRY_POINT_NOTE`, `TRACK_LABELS`, `PHASES`, `topicForGem()`.
  - `ISLAND_LABELS` was removed; titles come from `Phase.title`. `ISLAND_TRACK` is now derived from the roadmap content.
- 2026-10-06 (Phase 2): Gem spawns, landmark/mentor positions and sign layouts live in `lib/worldLayout.ts` (`getGemSpawns`, `landmarkPosition`, `mentorPosition`, `SIGN_LAYOUTS`), not `data/world.ts`. They are derived geometry, and putting them in `data/world.ts` would create a circular import with `lib/worldLayout.ts`.
- 2026-10-06 (Phase 2): **Content mapping decisions:**
  - Tool / technology lists (P3 Tools, Dev P4 provider APIs, Dev P6 technologies, Eng P4 PyTorch, Eng P6 Hugging Face, Eng P9, Eng P10) are `Phase.tools` chips, not gems. Gems are concepts, and this avoids duplicate NumPy/Pandas gems across P1 and P3.
  - Topics that the doc repeats in several phases (embeddings, reranking, batching, quantization, prompt injection, …) are separate gems per phase, as in the doc. Each phase's bite is written for its own context.
  - Meta gems: Harbor 4 (the two definitions, shared foundation, production AI systems), Fork 3 (the two goals, "don't choose yet"), Summit 11 (the Eng P12 architecture components). Total: **268 gems**.
  - Summit `project` = Project 8 "AI Platform". The 8 "What should they build?" projects share their `progress.projects` key with the matching phase project (1→churn, 2→image classifier, 3→support assistant, 4→knowledge assistant, 5→research agent, 8→AI platform). Projects 6 (fine-tuning) and 7 (complete SaaS) have their own keys. Passport counts only the 8 phase projects.
  - The doc only has an explicit *Developer* final skill set. For the Engineer, the Summit shows the doc's "excellent at" list from "The Most Important Difference".
- 2026-10-06 (Phase 2): The E key is now event-driven (a `keydown` sets the one-shot `touchState.interact`) instead of a polled edge, because a quick tap (down and up within one frame) was being missed.
- 2026-10-06 (Phase 2): First-time players (no gems, ≤1 island visited, onboarding not done) spawn facing Byte, so the greeting is seen. drei `Html` hides bubbles whose anchor is behind the camera. Everyone else spawns facing −Z as before.
- 2026-10-06 (Phase 2): Gem toasts pause and hide while a panel or the Passport is open, so they never cover overlays. A backlog advances every 1.5 s instead of every 3 s.
- 2026-10-06 (Phase 3): **Contract changes (all additive):**
  - `store/ui.ts`: `nearbyChallenge` (the Challenge pedestal in range; it takes priority over `nearbyPhaseId` for the E prompt and key), `miniGameResult` (a finished run → the host shows its result screen), `tutorial` (Harbor checklist state), plus `openMiniGame(id)`, `showMiniGameResult(r)`, `clearMiniGameResult()`, `setTutorial()`. `closeOverlay()` also clears `miniGameResult`.
  - `store/progress.ts`: `awardBadge(id, stars)` keeps the best stars (`completedAt` = when that best was set) and returns `{ prevStars, best }`. No persisted-shape change, so `version` stays 1.
  - `MiniGameProps` lives in `components/minigames/types.ts`. `MiniGameId` is currently `'tutorial' | 'pipeline-order' | 'sort-bins' | 'quiz'`; Phase 4 widens the union and adds registry loaders.
  - `data/minigames.ts`: `MiniGameDef = { id, title, howTo, config, recapTopicIds }` as planned. Engine configs gained optional extras: PipelineOrder `distractorWhy` + `explain`; SortBins `seconds`; Quiz `outcomes` (weight ranges → result for personality mode).
  - `data/world.ts`: `CHALLENGE_RADIUS` (2.4 m). `lib/worldLayout.ts`: `challengePosition(def)`. `playerState.ts`: `playerEvents.jumps`.
- 2026-10-06 (Phase 3): Challenge pedestals sit beside each landmark, opposite the mentor (`challengePosition` tries angles until clear of the mentor, trees, rocks, signs and walkways). Gems now also avoid the pedestal, so **gem positions shifted slightly** on most islands. Gem ids are unchanged, so saved progress is unaffected.
- 2026-10-06 (Phase 3): Scoring: PipelineOrder 1st try = 3★, 2nd = 2★, else 1★ (score 100/75/50/25). SortBins and graded Quiz: ≥ 90% = 3★, ≥ 70% = 2★, else 1★ (score = % correct). Personality quiz and tutorial always award 3★ (no right answers).
- 2026-10-06 (Phase 3): PipelineOrder, after a wrong check: correct cards lock 🔒 and wrong ones return to the tray, so every attempt converges. Distractors explain why they don't belong. Loop mode accepts any rotation of the cycle (the offset is fixed once a card locks).
- 2026-10-06 (Phase 3): The Harbor tutorial runs *in the world*: "Let's go!" closes the overlay and `components/ui/TutorialTracker.tsx` ticks off look (≥ 1 rad of turning in total), jump and Passport. When all three are done it calls `finishMiniGame`, which reopens the host on the result screen. The checklist isn't persisted (a reload cancels it).
- 2026-10-06 (Phase 3): Exit paths: ✕ / "Back to island" → `resumeExplore()` (re-locks immediately, since it runs from a click). Esc → `closeOverlay()`, then "Click to explore" re-locks. The backdrop does **not** close a game, so a stray tap can't lose progress.
- 2026-10-06 (Phase 3): Content: the plan names "Calculator" as a Tool Router bin. It isn't in the doc, but it is the plan's own choice, and the items apply the doc's tool-calling idea (LLMs slip on exact maths). Deep Archive uses 4 of the doc's 7 metrics (Recall@K, Precision@K, MRR, faithfulness) to stay within the 2–4 bin limit.

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

### Phase 2 session (2026-10-06)
**What exists**
- **Content:** `data/roadmap.ts` has all 20 phases and 268 topics with bites, plus mentors, projects, durations, tools, anti-patterns, key questions, diagrams and the meta exports (see the Decisions log). Helpers: `getPhase`, `allGemIds`, `gemsForPhase`, `trackPhases`, `topicForGem`. A dev-only check throws if a PhaseId is missing or topic ids collide within a phase.
- **Proximity / interact:** `Player.tsx` checks every landmark per frame (`LANDMARKS`) and writes `ui.nearbyPhaseId` only on change. E (keydown) or the mobile E button → `ui.openPanel(id)` → `mode='panel'` and pointer lock released. `components/ui/InteractPrompt.tsx` shows "Press E…" on desktop and a tappable "Tap to explore…" pill on touch; the mobile E button pulses when near.
- **Phase Panel:** `components/ui/PhasePanel.tsx`.
  - Tabs per phase: regular = Overview / Topics / Project (if any) / Challenge. Harbor = definitions + roadmap shape. Fork = Compare (animated dual bars + quotes). Summit = Overview / Skill sets / Timelines / What to build (8-project ladder + career ladder) / Topics / Challenge.
  - Esc closes (then "Click to explore" relocks). ✕ / backdrop closes and relocks immediately (`resumeExplore()` in `components/ui/kit.tsx`).
  - The Challenge tab is a disabled "Play mini-game" slot plus an empty `BadgeStamp`.
- **Gems:** `components/world/SkillGem.tsx` draws one instanced mesh (+ Outlines) for all 268 gems, culling disabled. Gems bob and spin within 120 m, and a distance pickup (1.4 m from body centre) runs in the same frame loop → `progress.collectGem` + `ui.pushToast`. Collected gems get a zero-scale matrix. `GemToast.tsx` shows the queue head.
- **Mentors:** `components/world/Mentor.tsx` has 20 capsule robots (shared geometry), each with a small collider. They face the player within 11 m and show a drei `Html` bubble within 7.5 m (Byte: 14 m for first-timers), cycling lines every 4.5 s. Bubbles use `zIndexRange [5,0]` so they stay under every overlay.
- **Signs:** `components/world/BridgeSigns.tsx` places 40 signs (instanced boards + posts, troika Text), one at each bridge end. Each shows the destination title plus the phase subtitle, or "AI Developer path" / "AI Engineer path" at the Fork. The ▲ chevron is a mesh because the font may lack arrow glyphs.
- **HUD / Passport / Minimap:** `HUD.tsx` (island + track badge, 💎 and 🏅 counts, 📖 button; global P / Esc keys). `Passport.tsx` (3-column skill tree + Summit, gem rings, badge slots, project ticks, detail card with "Travel here" / "Read about it"). `Minimap.tsx` (static SVG; a rAF loop moves the player arrow from `playerPose`).
- **Player plumbing:** `components/player/playerState.ts` holds `playerPose` (written per frame) and `requestTravel(id)`. Travel reuses the respawn fade and lands at the island centre facing its landmark.
- **Debug:** `window.__aiQuest.world` now also has `landmarks` and `gems`. DebugHud moved to bottom-left and shows both island and near-landmark.

**Verification** (Playwright + local Chrome against `next start`; scripts in this session's scratchpad: `p2-desktop.mjs`, `p2-mobile.mjs`)
- Desktop, 42/42 passing:
  - prompt → E → correct panel for **all 20 landmarks**; lock released; no movement in panel
  - chips + bite; "I built this" persists; Esc → overlay → relock; ✕ relocks directly
  - gem pickup + toast + queue (+4) + drain; HUD, panel and Passport counts agree (5/35, 5/268, 1/8 projects)
  - Passport travel; Fork 21 comparison rows; Summit 8 project toggles + career ladder
  - reload keeps gems and projects; 60 fps
- Mobile 375×812 touch, 21/21 passing: E button + tap pill open panels; zero horizontal overflow on every panel tab, Fork, all Summit tabs and the Passport; touch-scrolls panel body; gem pickup; 📖 → Passport → travel.
- Content spot-check: a node script confirmed every phase/topic count and that all gems, mentors and signs land on their islands (gem spacing ≥ 2.8 m).

**Tips for Phase 3**
- Wire the Challenge tab in `PhasePanel.tsx` (`Challenge` component). `BadgeStamp` already renders `progress.badges[id].stars`, and the Passport's small stamps read the same field.
- Mini-game configs can reuse `Phase.project.pipeline` and `Phase.diagrams[].steps` (strip `" | "` parallel markers, or treat them as one step).
- `ui.setMode('minigame')` already releases pointer lock. Use `resumeExplore()` from `components/ui/kit.tsx` when returning from a click.

### Phase 3 session (2026-10-06)
**What exists**
- **Data:** `data/minigames.ts` has `MINIGAMES: Record<PhaseId, MiniGameDef>` for all 20 phases (types for every engine config live here too). Pipelines reuse `Phase.project.pipeline` / `Phase.diagrams[].steps` where the doc has them. A dev-only check throws if a recap topic id is missing, a sort item has no `why` or unknown bin, a distractor has no `why`, or a graded question doesn't have exactly one correct option.
- **Framework (`components/minigames/`):**
  - `MiniGameHost.tsx`: overlay at z-40, shown while `mode === 'minigame'`. Title bar (track badge, phase · Challenge, game title, ✕) → intro card (How to play, best stars, Start) → the lazy game in `<Suspense>` → result screen (stars pop in one by one, score, badge stamp + confetti when new or improved, otherwise "Your best is still…", "What you learned" with 1–3 topic bites + a link to the island guide, Retry / Back to island).
  - `registry.ts`: `React.lazy` loaders per `MiniGameId` plus `preloadMiniGame()` (called when the intro mounts).
  - `complete.ts`: `finishMiniGame()` (awardBadge → showMiniGameResult), `starsForAccuracy`, `shuffle`.
  - `kit.tsx`: `GameButton`, `Feedback`, `ProgressDots` and `useDragDrop`. That is a pointer-events tap-or-drag hook: under 6 px of movement counts as a tap; otherwise a ghost follows the pointer and the drop target is found via `elementFromPoint(...).closest('[data-drop]')`. Keyboard Enter/Space counts as a tap.
  - Engines: `PipelineOrder.tsx` (slots + tray, tap or drag in, tap or drag out, drag between slots to swap), `SortBins.tsx` (one card at a time, tap a bin or drag onto it, optional rAF timer bar; correct answers auto-advance after 2.6 s except the last), `Quiz.tsx` (graded + personality), `Tutorial.tsx`.
- **World:** `components/world/ChallengePedestal.tsx` adds 20 pedestals (stone base, track-coloured column, spinning extruded star: gold once earned, label "Challenge · n/3 stars"), each with a collider. `Player.tsx` checks pedestal proximity (`CHALLENGE_RADIUS`) after landmarks; E opens the game. `InteractPrompt` shows "Press E to play ★ …" or "Tap to play ★ …". The mobile E button pulses for either.
- **Wiring:** the PhasePanel Challenge tab shows the game title + how-to + "Play mini-game" / "Play again" + best stars. HUD hides during games, and Esc exits them. The Passport stamps and the HUD 🏅 count already read `progress.badges`, so they update live. Game chunks: verified separate (`next build` output; the network log shows none load at startup, and each loads on first open).
- **Debug:** `window.__aiQuest` also exposes `world.challenges` and `minigames` (the configs, used by the auto-solving tests).

**Verification** (Playwright + local Chrome against `next start`; scripts in this session's scratchpad: `p3-desktop.mjs`, `p3-mobile.mjs`)
- Desktop, 47/47 passing:
  - no game chunk at startup; the pedestal prompt + E opens the game; lock released; no movement during a game
  - PipelineOrder solved first try → 3★ + "New badge earned"; Retry with a mouse-dragged distractor + slot swap → feedback + distractor why + lock → 2★, and the best (3★) is kept in storage
  - Back to island → explore + re-locked + movement works; Panel → Play; Esc exits → click relocks
  - Agent HQ timer runs out ("Time's up") → 10/12 → 2★
  - Harbor tutorial: mouse look + Space + P → result screen + badge
  - **all 20 phases** opened from their pedestals, auto-solved to the result screen, and persisted: HUD 🏅 20/20, Passport shows 20 stamps, badges survive a reload
- Mobile 375×812 touch, 19/19 passing:
  - tap pill opens the game; touch drag (CDP touch events) into a pipeline slot and onto a sort bin; taps for everything else
  - no horizontal overflow on the intro, pipeline, result, sort, quiz or outcome screens
  - Back to island restores the touch controls; the touch tutorial works (drag-look, JUMP button, 📖)
- Console: only the two known library warnings.

**Tips for Phase 4**
- Swap a temporary game by changing `id` / `config` (and maybe `howTo` / `recapTopicIds`) in `MINIGAMES[phaseId]`, adding the id to `MiniGameId`, and adding a loader in `registry.ts`. The host, badges, pedestal and recap need no changes.
- Bespoke sims receive `MiniGameProps<C>`: call `onComplete({ score, stars })` once at the end. The host handles the result, Retry (remounts the game with a new `key`) and exit. Use `GameButton` / `Feedback` / `useDragDrop` from `kit.tsx` for a consistent look.
- `starsForAccuracy()` gives the shared 90 / 70 % thresholds. The test harness in `p3-desktop.mjs` auto-solves by engine id; Phase 4 sims need their own solver (or a `?debug` win hook).

## Known issues
- Two console warnings come from library internals and can't be fixed from our code: `THREE.Clock` deprecated (R3F) and "deprecated parameters for the initialization function" (rapier-compat WASM init).
- Shadows only cover ±40 m around the player. Distant islands show no cast shadows (by design, for performance).
- Island labels are small at long range (the Phase 2 bridge signs help up close).
- Speech bubbles are drei `Html`: they are not occluded by geometry (a bubble can show through a landmark), and they hide when their anchor is behind the camera.
- The mentor icon in panels is an emoji (🤖), so it looks different on each platform. Phase 5 could swap in a small SVG of the robot.
- Gem pickup is a distance check against the body centre, so gems can also be grabbed through a thin obstacle. All gems are placed ≥ 1 m from trees, rocks, signs, mentors and landmarks, so this is unlikely in practice.
- Still only tested in Chromium (desktop + mobile emulation), not on a real phone or iOS Safari.
- `README.md` is still the create-next-app boilerplate. It gets rewritten in Phase 5.
- Git: each phase is committed once its session ends (commit only when the user asks). Remote: `origin` → github.com/mzeeshanaltaf/pathfinder-ai.
- The jump is a polled key state, so a synthetic key press that goes down and up within one frame is missed. Real presses are fine; automated tests must hold Space for about 100 ms.
- During the Harbor tutorial, the "Tap to play ★ First Steps" prompt still shows at the pedestal. Re-opening it just shows the intro again (harmless).
- The gem toast queue pauses during mini-games, so a toast collected just before opening a game shows again afterwards.
- The pedestal label uses the troika font. The ★ glyph is drawn only in HTML, never in 3D text (Geist may lack it).
