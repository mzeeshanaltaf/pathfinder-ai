# Phase 5: Polish, Engagement & Finale

> Read [CLAUDE.md](../../CLAUDE.md) and [status.md](../../status.md) first. Requires Phases 1–4.

## Goal
Turn the working prototype into something learners *want* to return to: unique cartoon landmarks, onboarding, retention loops, a satisfying finale, sound, and a final performance and mobile pass.

## Scope

### 1. Landmark art (replace the Phase 1 placeholders)
Build each landmark in `components/world/landmarks/<Name>.tsx` from procedural low-poly primitives with toon material + outlines, plus a small idle animation:

| Landmark | Look and idle animation |
|---|---|
| Harbor | Dock, boat, signpost |
| Code Village | Workshop houses with a smoking chimney, a giant floating `{ }` |
| Math Mountain | Stepped mountain with a ball rolling in a valley, floating Σ ∫ symbols |
| ML Meadow | Barn, sorting fences, a scatter plot made of hay bales |
| Fork | Big crossroads signpost with green and blue arms |
| LLM Lighthouse | Rotating beam made of token blocks |
| Prompt Workshop | Craft shop with floating speech bubbles |
| RAG Library | Book towers with glowing chunks flying between them |
| Agent HQ | Control tower with orbiting tool icons |
| App Factory | Conveyors of boxes and a big gear |
| Shield Fort | Walls with a shimmering shield dome |
| Neural Garden | Trees whose branches are neuron graphs pulsing with light |
| Transformer Tower | Stacked layer floors with attention beams between windows |
| Model Forge | Anvil with sparks, glowing model ingot |
| Deep Archive | Deep stacks of cabinets, a rotating ranking podium |
| Clockwork Keep | Visible interlocking gears in a loop |
| GPU Power Plant | Cooling towers with GPU chips glowing |
| MLOps Conveyor | Looping conveyor with model crates |
| Security Citadel | Tall walls with a keyhole gate and patrol drones |
| Summit | Plaza with a holographic 3D version of the production architecture diagram |

Keep the draw-call count reasonable: merge static geometry where possible and instance repeats.

### 2. Onboarding (`components/ui/Onboarding.tsx`)
- **First visit only** (`progress.onboardingDone`):
  - Byte greets the player at the Harbor and explains the two careers in one line each (the doc's quotes)
  - shows the controls for the detected device
  - points the compass at Code Village
- The `harbor` tutorial mini-game becomes part of this flow.

### 3. Retention and guidance loops
- **Suggested next:** a function in `lib/progress.ts`. It returns the first common phase without a badge; after the trunk, it returns the next phase on the path the player has most progress in, defaulting to the Developer path as the doc recommends.
- **Compass:** a HUD arrow pointing to the suggested next island, with its distance.
- **Lit bridges:** a bridge glows (emissive + floating particles) once its `from` phase has a badge. This is visual only, never a lock.
- **Daily streak:** update `progress.streak` on load (consecutive local dates). HUD flame counter; 3/7/30-day milestones award cosmetic hat colours for Byte.
- **Welcome back card:** on returning visits, show "Last time you were at RAG Library, 9/12 gems." with buttons **Continue** (fast travel) / **Explore freely**.
- **Hot-air balloon fast travel:** replaces the instant Passport teleport with a short balloon flight animation (skippable) at each island's dock.
- **Job-ready meter** (in the Passport): estimated months remaining per path. Use the doc's durations and timelines, weighting badges and "I built this" projects (projects weigh most: "projects matter more than completing a calendar schedule").
- **Achievements:** a small set, e.g.
  - "First Gem"
  - "Crossed the Fork"
  - "Both Paths Explored"
  - "All Common Badges"
  - "3★ Perfectionist (5 phases)"
  - "Builder (3 projects marked built)"
  - "Summit Reached"

  Show a toast + a list in the Passport.

### 4. Finale (`summit`)
- Reaching the Summit with the `final-assembly` badge triggers a short celebration: fireworks particles, camera pan around the holographic architecture, and Byte's speech about the career ladder.
- `components/ui/Certificate.tsx`: a printable/downloadable certificate (render to a canvas → PNG download) showing the player's name (typed in, stored locally), path(s) completed, badge count and stars.
- Show the doc's career ladder (Software Engineer → AI Fundamentals → AI Developer / AI Engineer → Senior AI Engineer → AI Architect/Lead) as a final interactive ladder.

### 5. Audio (`lib/audio.ts`)
- Light SFX via the Web Audio API or tiny bundled clips: footstep ticks, gem chime, badge fanfare, UI clicks, wind ambience.
- Unlock on the first user gesture. Respect `settings.muted` (toggle in the HUD and Settings).

### 6. Settings (`components/ui/Settings.tsx`)
Mouse/touch sensitivity, invert Y, quality (auto/low/high), mute, and **Reset progress** (with a confirm dialog).

### 7. Performance and mobile pass
- drei `PerformanceMonitor` → reduce dpr, shadows off, fewer clouds/scenery on `low`.
- Audit draw calls (`renderer.info`) and memoise geometries/materials.
- Real-device check if possible.
- Loading screen with progress (drei `useProgress`) and a cartoon logo.
- Remove the Phase 1 debug HUD (or keep it behind `?debug`).

### 8. Meta
- App metadata: title, description, Open Graph image, favicon.
- `README.md`: what the app is, how to run it, and how to add a new roadmap via `data/`.

## Acceptance criteria
- Every island has a distinct, animated landmark. No placeholders remain.
- A new user (cleared localStorage) gets onboarding. A returning user gets the welcome-back card, and the streak increments on a new day.
- The compass, lit bridges, balloon travel, job-ready meter and achievements all work and persist.
- The Summit finale and certificate download work.
- Sound can be muted, and the setting persists.
- ~60 fps desktop. On mobile emulation with 4× CPU throttle, the quality auto-drops and stays usable.
- `npm run build` and `npm run lint` pass. The console is clean.
