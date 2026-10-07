# Phase 6: Third-Person Explorer, Keyboard Steering & Full Roadmap

> Read [CLAUDE.md](../../CLAUDE.md) and [status.md](../../status.md) first. Requires Phases 1–5.

## Goal
Play-testing after Phase 5 raised seven issues:
1. Mouse-look (pointer lock) moves the view. The view should move only with WASD / arrow keys.
2. There is no visible player. The user wants a character with the camera behind it.
3. Gem toasts disappear after 3 s. They should stay until closed with ✕, and a new gem should replace the old card.
4. Passport tiles show only the island name ("Code Village"). They should also show the subject ("Programming Fundamentals").
5. Passport → "Read about it" opens the PhasePanel, but there's no way back to the Passport.
6. There's no single view of a whole career roadmap.
7. The code still assumes exactly two career paths in about a dozen places. Adding e.g. "AI Forward Deployed Engineer" should mostly be a data change.

**User decisions** (made in the planning session):
- Tank controls: W/↑ forward, S/↓ back, A/← and D/→ turn. No pointer lock at all.
- Mobile: joystick only (stick Y walks, stick X turns). Drag-to-look is removed.
- Character: a low-poly "explorer kid" with procedural animation.
- Roadmap: a 📜 HUD button plus a Passport tab, with a "Print / Save as PDF" button.

This changes CLAUDE.md "Locked decisions" (first person → third person; pointer lock removed) and some core contracts. Both files get updated at the end of the session.

**Session setup:** add a Phase 6 row to the CLAUDE.md phase table and to `status.md`, then work in this order: G → A+B → C → D+E → F → docs.

---

## G. Career-path registry (do first; the Roadmap view builds on it)
Goal: adding a path = data in `data/` + `lib/palette.ts` + world layout, with TypeScript errors pointing at every place that still needs an entry.

**`data/roadmap.ts`**
- `export const PATH_IDS = ['developer', 'engineer'] as const; export type PathId = typeof PATH_IDS[number];` then `Track = 'meta' | 'common' | PathId`.
- New `CAREER_PATHS: CareerPath[]`, in order. Each entry has: `id`, `label` ("AI Developer"), `pathLabel` ("AI Developer path"), `emoji` (🟢/🔵), `definition`, `goal`, `quote`, `excellentAt`, `finalSkills?`, `timeline` (moved from `TIMELINES`), `ladderRung` (the `CAREER_LADDER` rung it earns). Add a `CAREER_PATH_BY_ID` lookup.
- Fold `DEFINITIONS.{developer,engineer}`, `TRACK_GOALS`, `DIFFERENCE`, `DEVELOPER_FINAL_SKILLS` and `TIMELINES` into it. Keep `DEFINITIONS.shared` and `ROADMAP_SHAPE` as meta exports. Derive `TRACK_LABELS` for path tracks from `pathLabel`.
- `ComparisonRow` → `{ area; stars: Partial<Record<PathId, Stars>> }`. A path missing from a row renders "—".
- Extend the existing dev-only check: every `PathId` has a `CareerPath`, at least one phase and a timeline.
- Copy: Harbor subtitle "Two paths into AI" → "Your paths into AI". Fork "From here the two paths diverge" → "From here the paths diverge". While doing this, grep the UI for "two paths" / "both paths" / "two careers" and fix each one.

**Consumers to switch to `CAREER_PATHS` / `PATH_IDS`** (replace hardcoded `'developer' | 'engineer'`):
- `lib/progress.ts`: `PATH_TRACKS = PATH_IDS`, `PathTrack = PathId`. `TIMELINE_PHASES` stays a `Record<PathId, …>`, which makes the compiler demand an entry for a new path. Add a dev check that the step count matches the timeline.
- `components/ui/Passport.tsx`: build `COLUMNS` from trunk + `CAREER_PATHS`. Grid columns come from the count. With more than 3 columns at under 640 px, the trunk becomes a row above and the path columns wrap 2 per row (no horizontal scroll at 375 px).
- `components/ui/Onboarding.tsx`: `CareerCard` maps over the paths.
- `components/ui/PhasePanel.tsx`: the Fork Compare cards and star bars (one bar per path), Summit skill sets (`finalSkills ?? excellentAt`) and timeline labels (`emoji + label`).
- `components/ui/FinaleOverlay.tsx`: the `earned` map comes from `ladderRung` + `pathComplete`. Rung notes come from registry quotes and goals.
- `components/world/BalloonTravel.tsx`: tracks come from `Object.keys(TRACK_COLORS)`.
- `components/world/landmarks/Signpost.tsx`: one arm per path, angled towards that path's first island (computed from `data/world.ts`). The bars become per-path.
- `data/world.ts`: derive `BRIDGE_SIGN_SUBTITLES` from fork → first island of each path.
- `data/minigames.ts`: the Fork personality quiz stays 2-way content; type its `track` as `Track`. README notes that a new path needs the quiz re-authored.
- `lib/palette.ts`: unchanged shape. `Record<Track, …>` already forces colours for a new path.

**README** "Adding a roadmap or a new career path": rewrite as a checklist that matches the above.

---

## A. Keyboard-only steering, no pointer lock
- **`components/player/useInput.ts`**: remove the `mousemove` listener, `mouseState`, `lookDX/DY` and `lookY`. `InputFrame` becomes `{ moveY, turn, sprint, jump, interact }`. `turn` = (right − left keys) + `touchState.moveX`; `moveY` = (forward − back) + `touchState.moveY`. Rename the controls `left/right` → `turnLeft/turnRight` (same keys).
- **`components/player/Player.tsx`**:
  - `active = ui.mode === 'explore'` (drop `pointerLocked || isTouch`).
  - Yaw: `yaw -= turn * TURN_SPEED (~2.4 rad/s) * sensitivity * dt`, eased so a tap nudges and a hold turns smoothly.
  - Move along the facing direction. Walking backwards uses 0.6× speed. No strafe, no pitch.
- **Remove pointer lock everywhere**:
  - `ui.pointerLocked` / `setPointerLocked`, the `pointerlockchange` effect in `components/Game.tsx`, and `exitPointerLock` in `store/ui.ts` `setMode`.
  - `requestGameLock` in `resumeExplore()` (`components/ui/kit.tsx`): `resumeExplore` now just closes the overlay. Delete `lib/pointerLock.ts`.
  - The `InteractPrompt` visibility condition and the `DebugHud` lock line.
- **`components/ui/StartOverlay.tsx`**: delete it. Replace it with a small desktop `ControlsHint` pill at the bottom centre ("WASD / Arrows move & turn · Space jump · Shift sprint · E interact · P passport"). It hides after about 8 s of movement and comes back via the HUD ⌨ button or the H key.
  - Check that `lib/audio.ts` unlocks on `keydown` as well as pointer/click, since there's no longer a "click to start".
- **`components/player/MobileControls.tsx`**:
  - Remove the right-half drag-look zone.
  - The joystick zone becomes the whole screen behind the buttons (they already `stopPropagation`).
  - Stick X turns and stick Y walks; sprint still triggers at the rim.
- **Settings** (`components/ui/Settings.tsx`): relabel "Sensitivity" → "Turn speed" and hide "Invert Y". Keep `settings.invertY` in the persisted shape, so `version` stays 2 and no migration is needed.
- **Tutorial / copy**:
  - `TutorialTracker.tsx`: the step becomes "Turn around: A/D or ←/→" (touch: "push the stick left or right"). The yaw-accumulation logic is unchanged.
  - Also update the Onboarding controls card and README controls.

## B. Third-person camera + explorer avatar
- **New `components/player/Avatar.tsx`** (forwardRef group):
  - Built from primitives with `mergeParts` + `vertexToon` + `Outlines`: head with a hair cap, torso, scarf, backpack, and 2 arms + 2 legs in pivot groups. About 5–6 draws.
  - The scarf and backpack trim use `TRACK_COLORS` of `ui.currentIsland` (falling back to meta).
  - Exposes `update(dt, { speed, grounded, sprint, vy })`. That gives a walk cycle (limb swing scaled by speed, bigger when sprinting), an idle breathing bob, a jump/fall pose and landing squash. Everything uses refs only, with no React state per frame.
  - `castShadow`.
- **`Player.tsx` camera rig** (replaces the eye-height camera):
  - `target = feet + (0, 1.45, 0)`.
  - `desired = target − forward × 4.2 + up × 1.6`. Look at `target + forward × 2` (a fixed slight downward tilt).
  - Exponential damping (position ~10/s, so the yaw lags a little and turns feel smooth).
  - **Occlusion:** cast a rapier ray (`world.castRay`, excluding the player collider and sensors) from `target` to `desired`. On a hit, pull the camera to the hit distance − 0.3 m, with a minimum of 0.8 m. Under 1.2 m, hide the avatar so it never fills the screen.
  - Avatar group position = feet. Avatar yaw eases toward `look.yaw`.
  - `playerControl.teleport` sets a `snapCamera` flag so the camera doesn't sweep across the map.
  - After a cinematic ends, the rig damps from wherever the cinematic left the camera, so there's no snap.
- **Cinematics**:
  - Hide the avatar while `cinematic.kind === 'balloon'`. The flight already starts from the camera position: check where `BalloonTravel.tsx` reads its start pose.
  - Finale: the avatar stays visible on the plaza.
  - Check every `playerControl.face(yaw, pitch)` caller. Pitch is now ignored.
- `playerPose.yaw` keeps meaning "facing", so the Compass, Minimap and the "spawn facing Byte" logic are unchanged. Proximity checks and gem pickup are unchanged (body centre).

## C. Sticky gem card with ✕
- **`store/ui.ts`**: replace `toastQueue` / `pushToast` / `shiftToast` with `gemCard: string | null`, `showGemCard(id)` (replaces any open card) and `closeGemCard()`. Update the caller in `components/world/SkillGem.tsx`.
- **`components/ui/GemToast.tsx`**: no timers and no queue.
  - `pointer-events-auto` card with the full bite (drop `line-clamp-2`) and a line with the island title + gems found/total.
  - A ✕ button (≥ 40 px target, uses the existing `CloseButton` from `kit.tsx`).
  - `key={id}` so a replacement animates in.
  - Hidden, but kept, while `mode !== 'explore'`; it reappears afterwards.
  - Esc in explore mode closes it (wired in the HUD's existing global key handler).
  - Keep the current mobile/desktop placement so it doesn't cover the minimap or the tutorial tracker.
- This also removes the known issue "toast queue pauses during mini-games".

## D. Passport tiles show the subject
- `Passport.tsx` `Node`: under `phase.title`, add `phase.subtitle` (`text-[10px] sm:text-[11px] opacity-70 line-clamp-2`). Check at 375 px that 3-column tiles don't overflow.

## E. "Back to Passport" from the island guide
- **`store/ui.ts`**:
  - Add `panelFrom: 'passport' | null`. `openPanel(id, from?)` sets it.
  - Lift the Passport's `tab` and `selected` from local `useState` into the store: `passportTab`, `passportSelected`.
  - `openPassport(tab?)` resets the selection to `currentIsland` (used by P, 📖, docks and the tutorial).
  - `backToPassport()` returns to `mode: 'passport'` and keeps the tab and selection.
  - `closeOverlay()` clears `panelFrom`.
- **`PhasePanel.tsx`**:
  - When `panelFrom === 'passport'`, show a "← Passport" pill at the start of the header.
  - Esc and backdrop go back one level (`backToPassport`). ✕ still closes everything.
  - Check the HUD's global Esc/P handler for ordering.
- The Passport Map tab's "Read about it" and the new Roadmap tab's "Open island guide" both call `openPanel(id, 'passport')`.

## F. Full roadmap view + print
- **New Passport tab "📜 Roadmap"** (`components/ui/RoadmapTab.tsx`), plus a 📜 HUD button (`components/ui/HUD.tsx`) that calls `openPassport('roadmap')`.
- **Path picker:** a segmented control generated from `CAREER_PATHS`. It defaults to `preferredPath()` from `lib/progress.ts`.
- **Header:** goal, definition, `timeline.total`, and the timeline steps as a compact strip.
- **Phase sections, in walking order:** Common foundation (Code Village → ML Meadow, Fork), then the path's phases (`PATH_PHASES`), then the Summit. Each section is collapsible, with "Expand all / Collapse all" at the top. A section contains:
  - "Phase N · Title: Subtitle · duration", gem count and badge
  - topic groups with every topic + bite. Collected gems show ✓; the others show normally (the whole roadmap is always readable).
  - tools chips, the key question and anti-patterns
  - the project with its pipeline (`Flow` from `kit.tsx`)
  - buttons "📜 Island guide" (back-navigable) and "🎈 Fly here"
- **Reuse:** move PhasePanel's topic-group, chips and tool rendering into shared components (in `kit.tsx` or a new `components/ui/roadmapParts.tsx`) and use them in both views.
- **Print / Save as PDF:**
  - The button renders `<RoadmapPrint path=…/>` through a portal into `#print-root`, then calls `window.print()`. The browser dialog offers "Save as PDF", and there's no pop-up window.
  - `RoadmapPrint` is a plain, ink-on-white document: Logo, "Pathfinder AI · {label} roadmap", date, sections fully expanded, ✓ marks for progress.
  - `app/globals.css` `@media print`: undo the scroll lock on `html`/`body`, hide `#game`, show `#print-root`, add page-break rules per phase.
- All content comes from `data/roadmap.ts`; no new roadmap text is authored.

---

## Docs (end of session)
- **CLAUDE.md**:
  - Locked decisions: third person, keyboard tank steering, no pointer lock, joystick-only mobile.
  - Conventions: "Input gating" no longer mentions pointer lock.
  - Contracts: `Track`/`PathId`/`CAREER_PATHS`; `ui` changes (`pointerLocked` removed; `gemCard`, `panelFrom`, `passportTab`/`passportSelected`, `openPassport`, `backToPassport`; the `cinematic` comment).
  - Directory list: `Avatar`, `RoadmapTab`, `ControlsHint`.
- **status.md**: Phase 6 checklist, decisions log (e.g. `invertY` kept but unused, comparison stars are `Partial`), handoff notes, known issues. Close the gem-queue known issue.
- **README**: controls, features, and the new-career-path checklist.

## Acceptance criteria / verification
- `npm run lint` and `npm run build` are clean. Run `tsc` after G before moving on.
- **Playwright + local Chrome** against `next start` (same approach as earlier phases; scripts in the session scratchpad), desktop and 375×812 touch:
  - Controls and camera:
    - moving the mouse never changes the yaw
    - W/S/A/D and the arrows move and turn; Space and Shift work
    - no "Click to explore"; HUD buttons are clickable straight away
    - joystick X turns and Y walks; no drag-look
  - Camera and avatar:
    - the camera stays behind the avatar
    - walking up to a landmark wall pulls the camera in and never through it
    - the avatar animates (walk/idle/jump)
    - balloon flight + landing blend smoothly; respawn after a fall snaps correctly
  - Gem card: collect a gem → the card persists past 5 s; ✕ closes it; collecting a second gem replaces the first; a panel open → the card is hidden → it reappears after closing.
  - Passport and Roadmap navigation:
    - tiles show subtitles with no overflow at 375 px
    - Map → select LLM Lighthouse → Read about it → "← Passport" returns with LLM Lighthouse still selected; Esc does the same; ✕ closes all
    - 📜 HUD button → Roadmap tab: switching paths; all phases/topics present (count matches `gemsForPhase` totals for the path); Island guide → back works
    - Print: emulate `print` media and check `#print-root` is visible with every phase, then generate a PDF with `page.pdf()` and check its page count is > 1
  - Regressions: the Harbor tutorial completes with the new turn step; all 20 mini-games still open from their pedestals (rerun the Phase 4/5 `t-all` pattern); 60 fps with the whole world in view (avatar adds about 6 draws).
- **Multi-path smoke test** (temporary, not committed):
  - Locally add a dummy third `PathId` with 2 placeholder islands, a palette entry, a timeline and `TIMELINE_PHASES`.
  - Confirm it compiles. Confirm Passport, Fork Compare + Signpost, Onboarding, Roadmap tab, Finale, BalloonTravel and compass all show 3 paths with no layout overflow at 375 px.
  - Then revert. Any spot that needed a code change goes back into G.
