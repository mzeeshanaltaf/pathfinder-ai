# Project Status: Pathfinder AI

> Update this file at the end of every session. See the session workflow in [CLAUDE.md](CLAUDE.md).

**Next up:** All seven planned phases are done. Candidates for later work are under "Known issues" and in the Phase 7 handoff notes: a real-device pass (iOS Safari / Android), and a content review of the authored FDE roadmap (`docs/AI Forward Deployed Engineer.md`) by someone who works as an FDE.
**Last updated:** 2026-10-07 (Phase 7 session)

## Phase overview
| # | Phase | Status | Session date |
|---|---|---|---|
| 1 | [Scaffold & World Movement](docs/plan/phase-1-scaffold-and-world-movement.md) | ✅ Done | 2026-10-06 |
| 2 | [Roadmap Content & Interaction](docs/plan/phase-2-roadmap-content-and-interaction.md) | ✅ Done | 2026-10-06 |
| 3 | [Mini-game Framework](docs/plan/phase-3-minigame-framework.md) | ✅ Done | 2026-10-06 |
| 4 | [Concept Simulations](docs/plan/phase-4-concept-simulations.md) | ✅ Done | 2026-10-06 |
| 5 | [Polish, Engagement & Finale](docs/plan/phase-5-polish-engagement-and-finale.md) | ✅ Done | 2026-10-06 |
| 6 | [Third-Person Explorer, Keyboard Steering & Full Roadmap](docs/plan/phase-6-third-person-and-roadmap.md) | ✅ Done | 2026-10-07 |
| 7 | [HUD Subtitle + AI Forward Deployed Engineer Path](docs/plan/phase-7-fde-path.md) | ✅ Done | 2026-10-07 |

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
- [x] gradient-descent (math-mountain)
- [x] curve-fit (ml-meadow)
- [x] temperature (dev-llm-lighthouse)
- [x] chunk-retrieve (dev-rag-library)
- [x] injection-defense normal (dev-shield-fort) + hard (eng-security-citadel)
- [x] perceptron (eng-neural-garden)
- [x] attention-beams (eng-transformer-tower)
- [x] fit-the-gpu (eng-model-forge)
- [x] rank-it (eng-deep-archive)
- [x] batching (eng-gpu-plant)
- [x] drift-watch (eng-mlops-conveyor)
- [x] final-assembly (summit)
- [x] Acceptance verified; build passes

### Phase 5: Polish, Engagement & Finale
- [x] 20 unique animated landmarks
- [x] Onboarding with Byte
- [x] Suggested-next + compass, lit bridges, streak, welcome-back card
- [x] Balloon fast travel, job-ready meter, achievements
- [x] Summit finale + certificate PNG + career ladder
- [x] Audio + mute; Settings incl. reset progress
- [x] Performance / mobile pass, loading screen, metadata, README
- [x] Acceptance verified; build + lint pass

### Phase 6: Third-Person Explorer, Keyboard Steering & Full Roadmap
- [x] G. Career-path registry (`PATH_IDS`, `CAREER_PATHS`), consumers switched, path-count-free copy, README checklist
- [x] A. Keyboard tank steering; pointer lock and mouse-look removed; `ControlsHint`; joystick-only mobile; Settings "Turn speed"
- [x] B. Explorer avatar + third-person camera rig with occlusion; cinematics hide/show it
- [x] C. Sticky gem card with ✕ (replaces the toast queue)
- [x] D. Passport tiles show the subject
- [x] E. "← Passport" back navigation (tab + selection in the store)
- [x] F. Roadmap tab + 📜 HUD button + Print / Save as PDF
- [x] Multi-path smoke test (dummy 3rd path, then reverted)
- [x] Acceptance verified; tsc, lint and build pass; docs updated

### Phase 7: HUD Subtitle + AI Forward Deployed Engineer Path
- [x] 0. Docs: `docs/AI Forward Deployed Engineer.md`, plan file, status row + checklist, CLAUDE.md (second source doc, 6 world-map rows, `PATH_IDS`, `sharedPhases`)
- [x] 1. HUD pill shows the phase subtitle (phone HUD stack offsets moved down to fit)
- [x] 2. Shared phases: `CareerPath.sharedPhases` / `shortLabel`, `OWN_PHASES` / `PATH_PHASES`, `pathsIncluding`, "Shared with…" roadmap section, "Also on:" badge, Passport note, dev check
- [x] 3. Content: 6 FDE phases (64 gems), registry entry, branch, ladder rungs, comparison (FDE stars + 3 rows), Harbor / Fork / Summit copy, metadata, coral palette
- [x] 4. World: 6 islands down the middle corridor + bridge chain; layout check passes
- [x] 5. Six new landmarks (field camp, pipe docks, launch pad, observatory, vault, beacon); Signpost collider follows the chart width
- [x] 6. Six Challenges on the existing engines; Fork personality quiz re-authored for 3 paths (per-path weights)
- [x] 7. UI touch-ups for 3 paths (finale ladder, short labels, Harbor branches, job-ready grid, README)
- [x] 8. Acceptance verified; tsc, lint and build pass; docs updated

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

- 2026-10-06 (Phase 4): **Contract changes (all additive):**
  - `MiniGameId = EngineId | SimId` in `data/minigames.ts`. `SimId` lists the 12 sims. Loaders live in `registry.ts` (each sim is its own lazy chunk, 10–17 KB).
  - Sim **configs + content live in a new `data/sims.ts`** (types + `GRADIENT_DESCENT`, `CURVE_FIT`, …). `MINIGAMES` entries in `data/minigames.ts` still own `id` / `title` / `howTo` / `recapTopicIds` and reference those configs through a `sim()` helper. This keeps `minigames.ts` readable; the plan said to put configs in the entry itself. `data/sims.ts` has its own dev-only sanity check.
  - Shared sim UI in `components/minigames/sims/simKit.tsx` (`Slider`, `Segmented`, `Meter`, `Stat`, `SimCard`, `RoundHeader`, `HintCard`, `Illustrative`, `useRaf`, `starsFromPoints`). Slider styling is the `.sim-range` class in `globals.css`. New keyframes: `beam-in`, `pulse-dot`, `flow-down`.
  - `?debug` hook: `window.__aiQuest.openGame(phaseId)` opens a phase's mini-game intro directly (used by the sim tests).
- 2026-10-06 (Phase 4): **Sim design / scoring decisions:**
  - gradient-descent: 2 rounds (a bowl, then two valleys from x = −3.5). Discrete learning rates 0.01–1. Big LRs fall into the local minimum or diverge on round 2. Stars by total steps across all attempts (≤ 10 → 3★, ≤ 22 → 2★). The "chain rule" bonus is a collapsible hint card. Tuned numerically: best play is 0.45 then 0.1, for 5 steps.
  - curve-fit: fixed seeded dataset (12 train / 10 validation). Validation RMSE is lowest at degree 3. Round 2 tames degree 9 with ridge λ (target val RMSE ≤ 0.175). Stars: 0 wrong lock-ins → 3★, 1 → 2★.
  - temperature: 8 "Sample ×10" presses. "Creative but sane" requires ≥ 3 distinct words **and** zero probability left on the weird tokens (top-p must cut them). "Deterministic" requires only one token kept. Stars = tasks done (min 1).
  - chunk-retrieve: valid chunks hold one topic and 2–4 sentences, so the topic boundaries are the only valid chunking. Retrieval uses the canonical topic chunks. Score = ½ chunk quality (1 / 0.6 / 0.3 by check number, 0 if revealed after 3) + ½ precision@3.
  - injection-defense: one card at a time marches to the gate. Tap or swipe the card (or press Block / B / ←) to block; Allow / A / → lets it in, and so does reaching the gate. Misses pause with a "why" card. Speed ramps 9 → 5.5 s (normal) and 8 → 4.5 s (hard). Stars by accuracy. Items reuse the Phase 3 Shield Fort set. Hard mode adds source tags and indirect injection, exfiltration and excessive-agency items.
  - perceptron: 2 separable gardens + XOR. Stars: up to 2 points for time (both gardens ≤ 90 s → 2, ≤ 180 s → 1) + 1 for answering "No" to "can one line separate XOR?". The best single line on XOR is 9/12 (brute-force checked). The reveal shows the two-line hidden-layer solution and a small network diagram.
  - attention-beams: tap-to-guess, then a bertviz-style beam view (query on the left, tokens on the right). Round 5 is causal-masked. Ends with an animated attend → predict → append loop (skippable). Stars by accuracy (5/5 → 3★, 4/5 → 2★).
  - fit-the-gpu: illustrative memory model (bytes/param FP16 2 · INT8 1 · 4-bit 0.5; full FT adds gradients 2 + Adam 8; LoRA adds 0.1 GB per B params). Full FT is FP16-only, QLoRA is 4-bit-only, and LoRA uses FP16 or INT8. 3 jobs (7B / 24 GB tune, 13B / 24 GB tune, 13B / 16 GB serve at quality ≥ 97). A star for each job launched first time with the highest quality that fits.
  - rank-it: Recall@3 and MRR use binary relevance (grade ≥ 2). NDCG uses graded gains (2^g − 1). Gauges are live and Submit unlocks at NDCG ≥ 0.80. Stars by average NDCG over 2 queries (≥ 0.97 → 3★, ≥ 0.9 → 2★). Players can hill-climb to 1.0; that's accepted, since the point is feeling what each metric rewards.
  - batching: added a **GPUs-to-rent** knob (1–4) beside batch size / max wait, because without a cost dimension any batch ≥ 8 trivially "won". A deterministic seeded rush hour (8 → 60 → 30 req/s over 20 s, played back in 6.5 s). Win = p95 ≤ 500 ms and ≥ 98% served. Stars by the cheapest winning run (1 GPU → 3★, 2 → 2★, else 1★). GPU util = useful work / capacity. The doc's "Latency ↓ Cost ↓ GPU util ↑ Throughput ↑" scoreboard shows after each run.
  - drift-watch: drift starts on a random day (16–26). PSI on an 8-bin feature histogram; the alert at 0.2 **latches** once raised (noise around the threshold made it flicker). Accuracy lags drift by 6 days (labels arrive late). Triggering before the alert = wasted run; at the alert before accuracy breaches 85% = perfect. Stage 2 embeds the `PipelineOrder` engine (loop mode, the doc's lifecycle minus "Retraining"). Final stars = round((stage1 + stage2) / 2).
  - final-assembly: 7 layers from the Summit diagram; any order within a row. Tap-select then tap a slot, or drag. The tray is sticky so it stays reachable while the layers scroll. Stars by checks (like PipelineOrder). Ends with the "You've reached the Summit!" banner and data-flow pulses. The certificate is still Phase 5.

- 2026-10-06 (Phase 5): **Contract changes**
  - `store/progress.ts` is now **version 2**.
    - New fields: `achievements`, `playerName`, `byteHat`, `finaleSeen`, plus `streak.best`. The v1 → v2 migrate seeds `best` from `count`; `merge` fills the rest.
    - New actions: `touchStreak`, `unlockAchievements`, `setSetting`, `setPlayerName`, `setByteHat`, `completeOnboarding`, `setFinaleSeen`, `resetProgress` (keeps settings).
  - `store/ui.ts`:
    - New mode `'cinematic'`. `setMode('cinematic')` does *not* release pointer lock, so play resumes seamlessly after a flight.
    - New state: `menu` (which card `mode === 'menu'` shows), `cinematic`, `nearbyDock`, `notices` (+ `pushNotice` / `shiftNotice`), `perfTier`, `openMenu()`, `startCinematic()`.
    - `closeOverlay()` also clears `menu` and `cinematic`.
  - `components/player/playerState.ts`:
    - `requestTravel` is now consumed by `BalloonTravel`, not by the Player.
    - New `playerControl.teleport` / `face`, registered by the Player.
    - New `cinematicControl.skip`.
  - `data/world.ts`: `DOCK_INTERACT_RADIUS`. `data/roadmap.ts`: `Timeline.track` widened to any career-path track.
  - `lib/worldLayout.ts`: `landmarkYaw`, `landmarkClearance`, `dockPosition`, `DOCK_RADIUS`, `yawTowardsLandmark`.
- 2026-10-06 (Phase 5): **Layout change.** Landmarks have a bigger footprint:
  - `landmarkRadius` 1.3 → 1.9 m. Scenery keeps out to `landmarkClearance` (3.6 m) + 0.6, and gems to 3.6 m.
  - The Harbor pier also gets a clear corridor to the rim.
  - Mentors, pedestals, trees and **gem positions shifted** on every island. Gem ids are unchanged, so saves are unaffected.
  - Each island also got a balloon dock (gems and flowers avoid it).
- 2026-10-06 (Phase 5): Landmarks face the island centre (local +Z). Colliders are per landmark in `landmarks/index.ts`. The Harbor has no core collider: you can walk out on the pier, which has railings and an end rail.
- 2026-10-06 (Phase 5): **Suggested next** = first trunk badge missing (Code Village → Math Mountain → ML Meadow → Fork; the Harbor tutorial belongs to onboarding). Then the next phase on the path with the most progress (badges ×10 + gem fraction, ties → Developer). Then the Summit. Then the other path(s).
  - The compass points at the target island's **Challenge pedestal** once you stand on that island, because earning the badge is what moves the suggestion on.
  - Paths come from `PATH_TRACKS` (`PathTrack = Exclude<Track, 'meta' | 'common'>`), so a new career path is data plus a `TIMELINE_PHASES` row.
- 2026-10-06 (Phase 5): **Job-ready meter.**
  - Each timeline step of the doc maps to islands (`TIMELINE_PHASES` in `lib/progress.ts`).
  - Step completion = 35% knowledge (half gem fraction, half stars/3) + 65% "I built this" projects, if the step has any; otherwise knowledge only.
  - "Production AI: Complete SaaS" has no island, so it counts in the final step of both paths.
  - Months left = remaining fraction × the doc's range (9–12 / 12–18). Labelled as an illustrative estimate in the UI.
- 2026-10-06 (Phase 5): **Achievements** (11): the plan's 7 plus Gem Hoarder (100 gems), On a Roll (3-day streak), Island Hopper (all 20) and Pathfinder (all badges).
  - "Both Paths Explored" = a badge on every path. "All Common Badges" = the 3 `common`-track islands.
  - Existing saves unlock silently on load; new unlocks toast.
- 2026-10-06 (Phase 5): **Streak and hats.**
  - Consecutive local calendar dates. It is counted when the world loads and again when the tab becomes visible, so a tab left open past midnight still counts.
  - Hats unlock from the **best** streak: Sunny Yellow at 3 days, Berry Pink at 7, Galaxy Purple at 30. They are chosen in Settings and shown on Byte (3D) and in the SVG avatar.
- 2026-10-06 (Phase 5): **Welcome back.** "Continue" flies the balloon to the *suggested next* island, because the player already spawns at their last island.
- 2026-10-06 (Phase 5): **Balloon travel.** From the player's current eye position, a cubic curve rises to cruise height and lands on the destination dock (3.2–7 s, by distance), skippable.
  - Docks: E opens the Passport map.
  - `prefers-reduced-motion` → a quick fade instead of the flight.
- 2026-10-06 (Phase 5): **Finale.**
  - Triggers once (`finaleSeen`) when the player stands on the Summit with its badge, in explore mode.
  - 9 s fly-around of the hologram with fireworks (skippable), then the finale card (Byte + an interactive career ladder whose rung notes are doc text), then the certificate.
  - It can be replayed from the Summit panel or the Passport.
  - The certificate unlocks with the Summit badge.
- 2026-10-06 (Phase 5): **Audio** is synthesized with Web Audio: footsteps, gem chime, badge fanfare, achievement, UI clicks (any `<button>`), balloon whoosh, fireworks and a wind loop. It unlocks on the first gesture, suspends while the tab is hidden, and M toggles mute.
- 2026-10-06 (Phase 5): **Quality tiers.** 2 = full, 1 = dpr 1, 0 = no shadows, half the clouds (half the puffs), no flowers, fewer bridge motes, and landmarks animate within half the radius.
  - Settings can force low or high. Auto follows `PerformanceMonitor`. Touch devices start at tier 1.
  - Auto never climbs back from tier 0, because re-enabling shadows recompiles every material.
- 2026-10-06 (Phase 5): **Draw-call pass.** The worst view (Harbor looking down the trunk, the whole world visible) went from 978 to ~280–350 draws:
  - Mentors became one merged mesh each; pedestal stands became merged meshes.
  - Captions and pedestal labels hide beyond 60 m, sign faces beyond 55 m.
  - Small details are inside `<Near>` (90 m). Mentors and pedestals hide beyond 120 m.
- 2026-10-06 (Phase 5): `app/favicon.ico` (the create-next-app default) was replaced by `app/icon.svg`. `app/opengraph-image.tsx` renders the share card at build time with the bundled Geist font. `metadataBase` comes from `NEXT_PUBLIC_SITE_URL` (localhost fallback).
- 2026-10-07 (Phase 6): **Locked decisions changed** (user decisions from the planning session): third person instead of first person; keyboard tank steering; **no pointer lock**; joystick-only mobile (no drag-to-look). CLAUDE.md updated.
- 2026-10-07 (Phase 6): **Contract changes**
  - `data/roadmap.ts`: `PATH_IDS` / `PathId`; `Track = 'meta' | 'common' | PathId`; `CAREER_PATHS` + `CAREER_PATH_BY_ID` + `isPathTrack`. `DEFINITIONS.{developer,engineer}`, `TRACK_GOALS`, `DIFFERENCE`, `DEVELOPER_FINAL_SKILLS` and `TIMELINES` were folded into the registry and removed. `Timeline` lost its `track` field (it lives on its path). `TRACK_LABELS` derives path labels from `pathLabel`.
  - `ROADMAP_SHAPE.{developer,engineer}` → `ROADMAP_SHAPE.branches: Record<PathId, string[]>`, so the compiler asks a new path for its branch (a small deviation: the plan kept `ROADMAP_SHAPE` as-is).
  - `ComparisonRow` → `{ area; stars: Partial<Record<PathId, Stars>> }`. `Partial` so a new path doesn't have to rate every row; a missing value renders "—" (Fork panel) or a flat bar (Signpost).
  - `CareerPath` gained `ladderBranches?` beyond the plan's fields: the specialisation rungs (AI Apps; ML/DL, AI Systems) take the path's colour on both career ladders.
  - `lib/progress.ts`: `PATH_TRACKS = PATH_IDS`, `PathTrack = PathId`, new `roadmapSections(path)`. The "Both Paths Explored" achievement is now "All Paths Explored" (same id `both-paths`, so saves are unaffected).
  - `data/world.ts`: `pathStart(id)`; `BRIDGE_SIGN_SUBTITLES` is derived from the registry.
  - `store/ui.ts`: removed `pointerLocked` / `setPointerLocked` and the `exitPointerLock` in `setMode`; `toastQueue` / `pushToast` / `shiftToast` → `gemCard` / `showGemCard` / `closeGemCard`; new `panelFrom`, `passportTab`, `passportSelected`, `roadmapPath`, `openPanel(id, from?)`, `openPassport(tab?)`, `backToPassport()`, `setPassportTab`, `setPassportSelected`, `setRoadmapPath`. `openMenu`, `startCinematic` and `openMiniGame` also clear `panelFrom`.
  - `components/player/useInput.ts`: `InputFrame = { moveY, turn, sprint, jump, interact }`; controls `turnLeft` / `turnRight`; `touchState` lost `lookDX/DY`; `clearInput` removed.
  - `playerState.ts`: `teleport(x, feetY, z, yaw?, { snap? })` (snap defaults to true; the balloon landing passes `false` so the rig blends); `face(yaw)` (pitch is gone). `playerPose.yaw` = facing.
  - Deleted `lib/pointerLock.ts` and `components/ui/StartOverlay.tsx`.
- 2026-10-07 (Phase 6): **`settings.invertY` is kept in the persisted shape but unused**, and `settings.sensitivity` now scales the turn speed. So `version` stays 2 with no migration.
- 2026-10-07 (Phase 6): **Camera rig.** Target = feet + 1.45 m; ideal = target − forward × 4.2 + up × 1.6, looking at target + forward × 2. Position and look point are damped (10/s).
  - Occlusion casts a rapier ray from the target to the damped camera, excluding sensors and the player. A hit snaps the distance in (hit − 0.3 m, min 0.8 m); once clear it eases back out at 4/s. The avatar hides under 1.2 m.
  - The Player keeps tracking the camera during cinematics, so the rig damps out from wherever the cinematic left it. Spawn, respawn, the debug teleport and the reduced-motion fade landing snap instead.
- 2026-10-07 (Phase 6): **Steering.** Turn rate eases in and out (10/s), × 2.4 rad/s × the "Turn speed" setting. Walking back is 0.6× and never sprints. The avatar body eases towards the facing at 14/s.
- 2026-10-07 (Phase 6): **Avatar** = 6 meshes, each with an outline (body, track-coloured trim, 2 arms, 2 legs in pivot groups), so about 12 draws plus shadows, not the plan's ~6. Measured worst view: 311 draws at High quality (Phase 5: ~280–350), still 60 fps. The scarf colour follows `currentIsland ?? lastIsland`, not `currentIsland ?? meta`, so it doesn't flash lavender on every bridge.
- 2026-10-07 (Phase 6): **Passport while its island guide is open.** The Passport stays mounted but `invisible` behind a panel opened from it, so "← Passport" also keeps its scroll position and the Roadmap tab's open sections. `passportTab` / `passportSelected` live in the store as planned.
- 2026-10-07 (Phase 6): **Roadmap print.** `RoadmapPrint` is portalled into `#print-root` (a sibling of the app in `app/layout.tsx`) for as long as the Roadmap tab is open, and the button only calls `window.print()`. The plan rendered it on click. Keeping it mounted lets Ctrl+P work too, and `@media print` hides every other `<body>` child only while `#print-root` has content (`body:has(#print-root > *)`), so printing elsewhere still prints the screen. Each section (common trunk / path / Summit) starts a new page; phases flow within a section with their headings kept with their first lines.
- 2026-10-07 (Phase 6): **Controls hint.** Toggled by a window event (`toggleControlsHint()`), not store state. It auto-hides after 8 s of actual movement only the first time; reopened with H / ⌨ it stays until toggled off.
- 2026-10-07 (Phase 6): **Layout details.**
  - Phone HUD: 📖 and 📜 stack in a column (like 🔊 / ⚙️), so the right-hand group never reaches the island pill.
  - The Passport tab icons hide under 400 px, so all four tabs fit at 375 px.
  - The mobile gem card moves below the First Steps checklist while the tutorial runs.
  - The guide's "← Passport" pill sits in the header's badge row.
- 2026-10-07 (Phase 7): **Third career path: AI Forward Deployed Engineer** (user decisions from the planning session): its own branch of 6 islands, sharing the 4 Developer islands LLM → Agents with no duplicated content; new unique landmarks; Challenges on the existing engines.
  - **New source doc** `docs/AI Forward Deployed Engineer.md`, written from public research (sources listed in it). Its phase content, FDE comparison stars, the 3 new comparison rows (Customer Communication, Enterprise Integration, Cloud Deployment, rated for all three paths), timeline, final skill set and the "AI FDE" / "AI Solutions" ladder rungs are **authored additions**, not from the original doc.
- 2026-10-07 (Phase 7): **Contract changes (all additive; no store version bump)**
  - `data/roadmap.ts`: `PATH_IDS` gains `'fde'`; 6 phase ids before `summit`; `CareerPath.shortLabel?` + `shortPathLabel(p)`; `CareerPath.sharedPhases?` (dev check: each belongs to another path); `row()` takes FDE stars; `CAREER_LADDER` rows 3 and 4 gain `AI FDE` and `AI Solutions`.
  - `lib/progress.ts`: new `OWN_PHASES` (a path's own track) and `pathsIncluding(id)`. `PATH_PHASES` now = shared + own, so `pathScore`, `pathComplete`, `suggestedNext`, `crossed-fork` and the job-ready meter include shared islands. `both-paths` ("All Paths Explored") checks `OWN_PHASES`. `roadmapSections` inserts one "Shared with the …" section per owner path, coloured as the owner.
  - `data/minigames.ts`: `QuizWeight = number | Partial<Record<PathId, number>>`; `QuizOutcome.max` removed; exported `quizWeights` and `pickOutcome` (the clear leader with ≥ `min` points, default 1, else the `meta` fallback). Dev check: a personality quiz needs an outcome per path + `meta`.
  - `TrackBadge` gains `prefix` ("Also on:"). `Signpost` exports `CHART_HALF_WIDTH` for its collider.
- 2026-10-07 (Phase 7): **Layout.** FDE islands at (0,3,−217) · (−14,3.5,−248) · (12,4.5,−279) · (−12,5,−310) · (12,5.5,−341) · (−4,6,−370), radius 11. The last one moved from the plan's (−8,·,−372): that spot left a 7.8 m gap to the Summit and 19.7 m to Shield Fort. Rim gaps: bridges ≥ 9.2 m, FDE vs Developer / Engineer islands ≥ 20 m, no bridge passes within 2 m of another island, no bridges cross.
  - The Fork now has 4 bridges, so its **signpost moved** (landmark offset from −Z to the −X/+Z gap). The Fork's and Summit's mentor, pedestal, dock and **gem positions shifted**; gem ids are unchanged.
  - The Signpost's star bars swap "LLM APIs" (5/5/5) for "Customer Communication", so each path leads in at least one row.
- 2026-10-07 (Phase 7): **Fork quiz.** Each question has one option per path (+2) and one neutral option; the maths question's "keep it light" option gives Developer and FDE +1 each. Path outcomes need ≥ 5 points and a clear lead; ties and low totals get "Start as a Developer, grow into an Engineer". The recap shows the three path goals (replacing "No need to choose yet", which the outcome screen already says).
- 2026-10-07 (Phase 7): **Suggested next with shared islands.** The FDE path walks its shared Developer islands first, so after the trunk the compass still points to LLM Lighthouse. With equal progress on the shared islands, the tie goes to the Developer path (registry order); one FDE badge tips it to the FDE path.
- 2026-10-07 (Phase 7): **UI.** Finale rung notes come from the registry: a path's rung = definition + quote, its `ladderBranches` = "Grows out of the … path" + goal (the Phase 5 hand-picked notes for AI Apps / ML/DL / AI Systems are gone). Rung rows wrap 2 per row on phones. Short labels ("AI FDE") on the Roadmap picker, Passport columns, Harbor branches, signpost arms and certificate chips. The phone HUD stack (`.hud-compass`, `.hud-toast`, `.hud-tracker`, the tutorial gem card) moved down 16 px for the pill's subtitle line.
- 2026-10-07 (Phase 7): **Draw calls.** Worst view (Harbor, whole world, High) is 371 draws (Phase 6: 311), and the Fork looking down the FDE corridor is 324. Both hold 60 fps (worst frame 17 ms). Each new landmark is 4–7 draws from afar, in line with the existing ones.

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

### Phase 4 session (2026-10-06)
**What exists**
- 12 sims in `components/minigames/sims/`: `GradientDescent`, `CurveFit`, `Temperature`, `ChunkRetrieve`, `InjectionDefense`, `Perceptron`, `AttentionBeams`, `FitTheGpu`, `RankIt`, `Batching`, `DriftWatch`, `FinalAssembly`, plus `simKit.tsx`.
  - All are SVG or HTML inside the existing host overlay (no second canvas). Animation uses rAF + refs (`useRaf`) or short timers.
  - Every control is a native range input, a button, or pointer-event drag via `useDragDrop`.
- All 13 sim phases are assigned in `MINIGAMES`, and no temporary configs remain. The engines still serve code-village, fork, prompt-workshop, agent-hq, app-factory and clockwork-keep, plus the harbor tutorial. The graded-quiz mode is now unused, but the engine is kept.
- Illustrative numbers are tagged with the `Illustrative` pill: probabilities, similarity scores, attention weights, GPU memory and quality, batching cost and latency, and drift data ("Simulated data").
- Content: chunk-retrieve (travel policy doc), rank-it (2 queries × 6 passages), defense items and attention sentences are hand-authored in `data/sims.ts`. Every item applies a topic from the doc.

**Verification** (Playwright + local Chrome; scripts in this session's scratchpad: `h.mjs` helpers, `t-math`, `t-llm`, `t-defense`, `t-attn`, `t-rank`, `t-ops`, `t-all`; tuning scripts `tune-gd`, `tune-fit`, `tune-batch`)
- Each sim was played to completion on dev **and** on `next start`, desktop and 375×812 touch: 6 files, 109 checks. Wins, fail paths and star thresholds were checked (e.g. GD bounce / crawl / local-minimum / diverge, CF under/overfit labels, a RAG missing-citation answer, a GPU OOM and quality fail, a batching queue explosion and SLA miss, drift wasted-run → on-time).
- Mouse drag (rank-it handle, final-assembly tile) and CDP touch drag (rank-it, final-assembly, the temperature slider) both work. A tap or click on a moving defense card blocks it.
- `t-all` on production: every one of the 20 phases opens its intro and renders its game with no horizontal overflow (desktop + 375 px). Pedestal → E opens a sim and releases pointer lock. Only that sim's chunk loads on intro (12 separate chunks, none at startup).
- Badges persist via the existing host. `tsc`, `eslint .` and `npm run build` are clean. Console: only the two known library warnings.

**Tips for Phase 5**
- Every sim calls `onComplete` exactly once from a Finish button, so the result screen, badge and recap are unchanged host behaviour.
- Final-assembly's banner is where the Phase 5 Summit finale / certificate could hook in, e.g. by watching `progress.badges.summit`.
- Audio hooks: natural cue points are sim feedback moments (win / fail), the defense block / breach, and the drift alert.

### Phase 5 session (2026-10-06)
**What exists**
- **Landmarks:** `components/world/landmarks/` has one file per type and is wired through `index.ts` (body, label height, colliders) and `Landmark.tsx` (position, face-the-centre yaw, scale, colliders, label).
  - `kit.tsx` provides the shared pieces:
    - `Static` / `StaticGlow`: merged vertex-coloured meshes.
    - `useLandmarkFrame`: idle animation only within 140 m, or 70 m on low quality.
    - `Caption`: troika text, hidden beyond 60 m, `frontOnly` for translucent panels.
    - `Near`: distance culling for small details.
    - `useGeo`, `useHiddenInstances`, `useInstanceColors`.
  - Builders are in `lib/landmarkKit.ts` (`mergeParts`, `beam`, `slab`, `prism`, `extrude`, `strokeGlyph` for `{ }` and `∫`, `gearGeometry`, `transformParts`). Shared materials are in `lib/materials.ts`.
  - Content that comes from the doc:
    - the Fork star bars use `COMPARISON`
    - the Clockwork Keep gears are the agent-loop steps
    - the MLOps stations are the lifecycle steps
    - the Summit hologram is the Phase 12 architecture
- **World additions:**
  - `Balloons.tsx`: 20 docks merged into one mesh, 20 parked balloons as one instanced mesh tinted per track, plus colliders.
  - `BalloonTravel.tsx`: the flight director.
  - `LitBridges.tsx`: post-top lanterns and drifting motes; the lit planks themselves are tinted in `Bridge.tsx`.
  - `Finale.tsx`: the fly-around and a 324-particle firework pool.
  - Byte's hat is in `Mentor.tsx`.
- **UI:**
  - Overlays: `Compass` (HUD arrow + distance, the minimap rings the same target), `NoticeToast`, `Onboarding`, `WelcomeBack`, `Settings`, `FinaleOverlay`, `Certificate` (canvas drawing in `lib/certificate.ts`), `CinematicOverlay` (letterbox, caption, Skip).
  - `SessionManager` handles streak, achievements, the first card and the finale trigger.
  - Building blocks: `Sheet` (shared modal), `ByteAvatar` (SVG), `Logo` (also `app/icon.svg` and the OG image).
  - The Passport has Map / Job-ready / Awards tabs, and "Fly here" travels by balloon.
  - HUD additions: 🔥 streak, 🔊 mute, ⚙️ settings. Esc closes menus (except onboarding), M toggles mute.
  - The loading screen shows the logo and a progress bar.
- **Debug:**
  - `?debug` HUD now shows the quality tier, draw calls, triangles, geometries and programs.
  - `window.__aiQuest.world.docks` lists the dock positions.
  - `window.__aiQuestScene` exposes the scene (debug only).

**Verification** (Playwright + local Chrome, dev and `next start`; scripts in this session's scratchpad: `p5-smoke`, `p5-features`, `p5-overflow`, `p5-perf`, `p5-reduced`, `shots-landmarks`, `draws`, plus the Phase 4 `t-all`)
- `p5-smoke` (desktop + 375 px touch, 9/9 each):
  - a fresh save gets onboarding (doc quotes, device-specific controls, tutorial start)
  - the compass points to Code Village
  - streak 1, no overflow
- `p5-features` (desktop 33/33, touch 32/32):
  - welcome back + streak 2 → 3 with "+1 today" and the Sunny hat notice; Continue → balloon flight → lands on the Code Village dock
  - Passport "Fly here" + Space skip (≈ 0.3 s); dock prompt
  - First Gem and Summit achievements persist
  - Settings (hat, mute, sensitivity, quality persist; locked hat disabled; HUD mute state)
  - job-ready 9–12 months → 0% → 37% / 6–8 months after projects + badges; Awards tab
  - compass after the trunk → LLM Lighthouse, and → Model Forge when the Engineer path leads
  - finale auto-triggers → skip → career ladder climb + doc rung note → certificate (name persists, PNG downloaded, ~190 KB)
  - Reset (confirm) → onboarding again with settings kept
- `p5-overflow`: 13/13 overlays with no horizontal overflow at 375 px.
- `p5-reduced`: a reduced-motion fade lands on the dock.
- `t-all` regression: 28/28 desktop + 24/24 touch on production, so all 20 mini-games still open from their (moved) pedestals.
- **Performance** (production, local GPU):
  - Desktop, whole world in view: 60 fps, worst frame 17 ms, ~280 draws.
  - Mobile emulation + 4× CPU throttle: auto quality drops from tier 2 to tier 0 in ~6 s, then 60 fps.
- `npm run lint` and `npm run build` are clean. The console shows only the two known library warnings.
- All 20 landmarks were screenshotted and reviewed. The additive glows washed out to white against the sky, so the hologram, shield dome and attention beams now use normal blending.

**Not done / tips**
- No real-device test (iOS Safari or Android). The audio unlock path on iOS is unverified. (Pointer lock no longer exists, as of Phase 6.)
- The certificate's Print button opens a new window with the PNG and calls `print()`, so pop-up blockers may stop it. Download always works.
- The PhasePanel mentor quote still uses the 🤖 emoji; the new overlays use `ByteAvatar`.
- New career path: follow the "Adding a roadmap or a new career path" section in README.md.

### Phase 6 session (2026-10-07)
**What exists**
- **Registry** (`data/roadmap.ts`): `PATH_IDS`, `CAREER_PATHS` / `CAREER_PATH_BY_ID`, per-path `ROADMAP_SHAPE.branches` and `COMPARISON.stars`. A dev check runs on every path (CareerPath, phases, timeline, ladder rung).
  - Consumers loop over the registry: Passport columns, Onboarding cards, Harbor/Fork/Summit panels, FinaleOverlay ladder, Signpost arms + bars, BalloonTravel tints, Fork bridge signs, the job-ready meter, achievements.
  - The Fork personality quiz is still two-way content (README says to re-author it for a new path).
- **Steering** (`useInput.ts`, `Player.tsx`): keyboard tank controls, eased turning, no strafe or pitch.
  - `MobileControls.tsx`: one full-screen floating joystick (X turns, Y walks, rim sprints) + JUMP / E.
  - `ControlsHint.tsx`: desktop pill; H or the HUD ⌨ toggles it.
- **Third person** (`Avatar.tsx`, `Player.tsx`): the explorer kid, procedurally animated (walk cycle scaled by speed, idle breathing, jump/fall pose, landing squash), and the camera rig (see Decisions).
  - Avatar hidden during balloon flights and when the camera is pulled in under 1.2 m; visible in the finale.
- **Gem card** (`GemToast.tsx`): sticky, ✕ / Esc, full bite + "Island · n/total gems", replaced by the next gem, hidden (not cleared) outside explore mode.
- **Passport** (`Passport.tsx`): tiles show the subtitle; tabs Map / Roadmap / Job-ready / Awards; tab + selection in `store/ui.ts`.
  - "Read about it" and the Roadmap's "Island guide" open the PhasePanel with "← Passport". Esc / backdrop go back one level, ✕ closes all.
  - Over 3 columns, phones show the trunk as a 3-wide row and the paths 2 per row.
- **Roadmap** (`RoadmapTab.tsx`, `RoadmapPrint.tsx`, `roadmapParts.tsx`):
  - Layout: path picker (defaults to `preferredPath`), header (goal, definition, total, timeline strip), Expand / Collapse all.
  - Phase sections in walking order: summary, every topic + bite with ✓, tools, key question, anti-patterns, diagrams, project pipeline, Island guide / Fly here.
  - 📜 HUD button = `openPassport('roadmap')`.
  - Print / Save as PDF (see Decisions).
  - `roadmapParts.tsx` holds the blocks shared with PhasePanel (`Card`, `Chips`, `ToolsSection`, `KeyQuestion`, `AntiPatterns`, `TopicGroupView` chips/list, `rungColor`, `phaseHeading`).
- **Debug hook additions:**
  - `__aiQuest.state()` now has `camera`, `cameraDist`, `avatarVisible` and `avatar` (limb pose); `pitch` is gone.
  - `teleport(x, feetY, z, yaw?)`, `setLook(yaw)`, `openPanel(id)`.

**Verification** (Playwright + local Chrome against `next start`; scripts in this session's scratchpad: `p6-desktop.mjs`, `p6-mobile.mjs` (+ `--fresh`), `p6-flight-perf.mjs` (+ `--high`), `p6-3paths.mjs`, plus the Phase 5 `t-all.mjs`)
- `p6-desktop` (56/56):
  - controls: mouse never changes yaw; W/S/A/D + arrows, the eased tap, sprint, jump
  - camera + avatar: camera behind and above, walk-cycle leg swing, jump pose, camera lag then settle, a Code Village wall pulls the camera to 1.0 m (avatar hidden) and it eases back to 4.49 m, respawn snaps behind
  - gem card: persists > 5 s, ✕, replace, hidden under the Passport, Esc
  - Passport: subtitles; Read about it → ← Passport / Esc keep LLM Lighthouse selected; ✕ closes all
  - Roadmap: both paths list every phase in order, and topics = gems for the path (162 / 204); Island guide → back keeps the tab and the open section
  - print media shows only `#print-root` with every phase; `page.pdf()` = 10 pages
  - H toggles the hint; **all 20 pedestals open their game with E**
- `p6-mobile` 375×812 touch (24/24):
  - stick: up walks, sideways turns in place on either half (no drag-look); JUMP; camera behind
  - HUD buttons clear of the island pill; the gem card clear of the minimap
  - Passport map, guide header with the back pill, Roadmap (expanded, both paths), Job-ready, and every Harbor/Fork/Summit tab: no horizontal overflow
- `--fresh` (5/5): onboarding cards + touch copy, and the tutorial's stick-turn step completes First Steps.
- `p6-flight-perf` (5/5):
  - Balloon flight Harbor → Math Mountain: the avatar is hidden during the ride, and the landing blends (max camera step 0.48 m/frame) and settles at 4.49 m.
  - 60 fps (worst frame 17 ms) with the whole world in view: 280 draws on auto, 311 at High.
- `t-all` regression: 28/28 desktop, 24/24 touch.
- Multi-path smoke test (dummy `fde` path, 2 islands; dev server so the dev checks ran):
  - It compiled once `MINIGAMES` had entries for the new phases. Everything else was data: roadmap, palette, world, `TIMELINE_PHASES`.
  - 15/15 desktop + 15/15 touch + 2/2 onboarding: 4-column Passport (wraps at 375 px), Roadmap with 3 paths, 3 job-ready meters, Fork compare with 3 bars + "—", Summit timelines, Signpost with 3 arms, a balloon to the new island; no overflow.
  - Reverted from backups, and grep confirms no `fde` left. No code spot needed fixing.
- `tsc`, `npm run lint` and `npm run build` are clean. The console shows only the two known library warnings.

**Not done / tips**
- Still no real-device test (iOS Safari / Android). Tank controls on a real phone joystick are worth a feel check, as is the turn-rate default.
- The occlusion ray also hits trees and mentors, so in a grove the camera can dip in briefly. That is by design, but not tuned with real play.
- Mentor lines (Byte, Compass) and the Harbor / Fork / Summit summaries still describe two careers in places; they're authored content to revisit when a real third path lands.

### Phase 7 session (2026-10-07)
**What exists**
- **Content:** `docs/AI Forward Deployed Engineer.md` (new source doc) → 6 FDE phases in `data/roadmap.ts` (docPhase 8–13, 64 gems, projects, mentors Scout / Splice / Orbit / Gauge / Keystone / Flare), the `fde` `CareerPath` (shortLabel "AI FDE", coral 🔴, `sharedPhases` = Dev P4–P7, ~10–12 month timeline), its Roadmap branch, comparison stars and ladder rungs. Harbor, Fork and Summit copy now name all three careers (Byte and Compass each gained a line). Totals: 26 islands, 27 bridges, 334 gems, 14 phase projects.
- **Shared islands:** `PATH_PHASES` / `OWN_PHASES` / `pathsIncluding` in `lib/progress.ts`. The Roadmap tab and print show "Shared with the AI Developer path" before the FDE's own section; shared island guides carry an "Also on: AI FDE path" badge; the Passport's AI FDE column says "+ 4 shared AI Developer islands".
- **World:** `data/world.ts` (6 islands + chain). Landmarks in `components/world/landmarks/`: `FieldCamp`, `PipeDocks`, `LaunchPad`, `Observatory`, `Vault`, `Beacon`, registered in `index.ts`.
- **Challenges** (`data/minigames.ts`): Ask Better Questions (graded quiz), Connect It (sort-bins), Ship to Production (pipeline + 2 distractors), Triage the Incident (timed sort-bins), Data Checkpoint (sort-bins, 3 bins), Go-Live Plan (pipeline + 2 distractors). The Fork quiz is 3-way (`Quiz.tsx` sums per-path weights).
- **HUD:** the island pill shows the subtitle under the title.

**Verification** (Playwright + local Chrome against `next start`; scripts in this session's scratchpad: `layout-check.mjs` (node + jiti, imports the real modules so their dev checks run), `p7-desktop.mjs` (sections: hud, bridges, landmarks, challenges, quiz, passport, compass, finale, perf), `p7-mobile.mjs` (+ `--fresh`), `p7-hudbox.mjs`, plus the Phase 4–6 `t-all.mjs`, `p6-desktop.mjs`, `p6-mobile.mjs`)
- `layout-check`: all gaps and clearances, no bridge crossings, pedestals / docks / 334 gems placed on all 26 islands (tightest gem spacing 2.8 m).
- `p7-desktop` 54/54: HUD pill "App Factory / AI Application Engineering / AI Developer path"; all 14 bridge walks Fork ↔ FDE ↔ Summit without dropping; each new landmark's prompt + E opens its guide; each FDE pedestal + E → auto-solved → 3★ badge persisted; Fork quiz reaches all 3 path outcomes and the fallback; Roadmap (FDE) order + section headings, print doc, 14-page PDF; 3 job-ready meters; "Also on" badge; compass → Integration Docks when FDE leads, App Factory on a shared-island tie, LLM Lighthouse after the trunk; finale "You completed the AI FDE path." with the AI FDE rung ✓ and its notes; certificate chip "✓ AI FDE"; 60 fps.
- `p7-mobile` 16/16 + `--fresh` 2/2 at 375×812 touch: HUD pill → compass → gem card stack without overlap; no horizontal overflow on the Passport (all tabs, Roadmap FDE expanded), the Harbor / Fork / Summit / shared / FDE guides (every tab), the Fork quiz and two FDE games, the full finale ladder, onboarding (3 cards).
- Regressions: `t-all` 34/34 desktop + 30/30 touch (all 26 games open and render), `p6-desktop` 56/56 (its pedestal check now counts 26), `p6-mobile` 24/24.
- `tsc`, `npm run lint` and `npm run build` are clean. Console: only the two known library warnings.
- All six landmarks were screenshotted and reviewed.

**Not done / tips**
- The FDE roadmap is authored from public sources, not from the original doc. A review by a practising FDE would be worth it before treating it as authoritative.
- Still no real-device test (iOS Safari / Android).
- The FDE path has no `BUILD_PROJECTS` entries ("What to build" stays the original doc's 8-project ladder). Its six phase projects show on their islands, in the Roadmap and in the job-ready meter.

## Known issues
- Sim stars are generous by design where a meter is live (rank-it NDCG, perceptron accuracy, curve-fit bars): players can hill-climb. Stars mostly reward speed, first-try accuracy or efficiency.
- Drift-watch needs about 15–30 s of watching. There is Pause but no fast-forward.
- In automated touch tests, mixing a raw CDP touch drag with Playwright `tap()` straight afterwards occasionally dropped a tap. 30 rapid taps alone all registered, so the tests just pace their taps; this hasn't been seen with real input.
- Two console warnings come from library internals and can't be fixed from our code: `THREE.Clock` deprecated (R3F) and "deprecated parameters for the initialization function" (rapier-compat WASM init).
- Shadows only cover ±40 m around the player. Distant islands show no cast shadows (by design, for performance).
- Island labels are small at long range (the Phase 2 bridge signs help up close).
- Speech bubbles are drei `Html`: they are not occluded by geometry (a bubble can show through a landmark), and they hide when their anchor is behind the camera.
- The mentor icon in the Phase Panel is still an emoji (🤖), so it looks different on each platform. The Phase 5 overlays (onboarding, welcome back, finale, settings) use the SVG `ByteAvatar`.
- Gem pickup is a distance check against the body centre, so gems can also be grabbed through a thin obstacle. All gems are placed ≥ 1 m from trees, rocks, signs, mentors and landmarks, so this is unlikely in practice.
- Still only tested in Chromium (desktop + mobile emulation), not on a real phone or iOS Safari.
- Landmark colliders are boxes and cylinders, so a few decorations can be walked through: the Farm's pens and hay-bale plot, the Mountain's floating glyphs, the parked balloons' ropes. The main buildings are solid.
- Additive glows (lighthouse beam, token blocks, sparks) can look pale against the bright sky. The big translucent shapes switched to normal blending for that reason.
- The balloon flight is a fixed curve: it can pass through another island's landmark or a cloud on long routes. It is short, and Space skips it.
- In headless Chrome the HUD emoji (🔊 ⚙️ 🔥) render monochrome. Normal browsers show colour emoji.
- The Phase 2/3 test scripts in older scratchpads look for "Travel here" in the Passport; the button is now "🎈 Fly here".
- Git: each phase is committed once its session ends (commit only when the user asks). Remote: `origin` → github.com/mzeeshanaltaf/pathfinder-ai.
- The jump is a polled key state, so a synthetic key press that goes down and up within one frame is missed. Real presses are fine; automated tests must hold Space for about 100 ms. The same goes for A/D turning: a one-frame tap turns almost nothing.
- During the Harbor tutorial, the "Tap to play ★ First Steps" prompt still shows at the pedestal. Re-opening it just shows the intro again (harmless).
- The pedestal label uses the troika font. The ★ glyph is drawn only in HTML, never in 3D text (Geist may lack it).
- Third-person camera: when a wall is right behind the player, the camera stops at 0.8 m and can sit inside the geometry. The avatar is hidden below 1.2 m, so the view reads as first person. A short occluder (a tree) makes the camera dip in and ease back out at 4 m/s.
- After a balloon flight the view starts at eye height on the dock, then pulls back behind the avatar over about half a second (a blend, not a cut). The ride basket starts from the third-person camera position, which is behind and above where the avatar stood.
- Printing uses the browser dialog. It was verified with Chrome's `page.pdf()` only, not every browser's print engine. The ☑ / ☐ glyphs come from the system font.
- The ENTRY_POINT_NOTE fallback outcome of the Fork quiz ("Start as a Developer, grow into an Engineer") is the original doc's advice and doesn't mention the FDE path.
- 3D speech bubbles (drei `Html`) whose anchor is off to the side sit at negative screen x on phones. They're clipped by `overflow: hidden` and never scroll the page, but a naive "element outside the viewport" probe will flag them.
