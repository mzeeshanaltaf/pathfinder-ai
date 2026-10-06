# Phase 2: Roadmap Content & Interaction

> Read [CLAUDE.md](../../CLAUDE.md) and [status.md](../../status.md) first. Requires Phase 1.

## Goal
The world becomes the roadmap. Every island carries its real content from the doc. Walking up to a landmark lets the player open a Phase Panel. Skill Gems can be collected. Progress persists and shows in a HUD, the Skill Passport and a minimap.

## Scope

### 1. Content: `data/roadmap.ts`
Author the typed content (contracts in CLAUDE.md) **strictly from [docs/AI Engineer-Developer.md](../AI%20Engineer-Developer.md)**:
- **One `Phase` per PhaseId:** title, subtitle, duration, summary, topic groups (one group per doc sub-heading: e.g. Python / Then / Software engineering / SQL; Linear Algebra / Probability / ...), tools, anti-patterns (Dev P5), key question (e.g. "Why are embeddings represented as vectors?", "How does an LLM generate the next token?"), and the project with its pipeline steps.
- **Topic bites:** every topic gets a 1–2 sentence plain-English `bite` (the only authored text, so keep it accurate and beginner-friendly).
- **Mentor:** a name and 3–5 short, friendly, in-character dialogue lines that paraphrase the doc's guidance (e.g. "Don't try to become a mathematician...").
- **Meta content:**
  - `harbor`: the Developer vs Engineer definitions, plus "They share the first part, then diverge"
  - `fork`: the full side-by-side comparison table as data (`{ area, dev: 1-5, eng: 1-5 }[]`) and the two "most important difference" quotes
  - `summit`: Eng P12 architecture, both final skill sets, both timelines, the 8 "What should they build?" projects, the career ladder (Software Engineer → … → AI Architect/Lead), and "AI Developer is an excellent entry point"
- Export helpers: `getPhase(id)`, `allGemIds`, `gemsForPhase(id)`, `trackPhases(track)`.

### 2. Proximity and interaction
- Each landmark gets an interaction sensor (rapier sensor collider or a distance check in one `useFrame` loop). Entering it sets `ui.nearbyPhaseId`.
- `components/ui/InteractPrompt.tsx`: "Press E to explore Code Village" (desktop) / an Interact button highlight (mobile).
- Interacting sets `mode='panel'` and `activePhaseId`, and exits pointer lock.

### 3. Phase Panel: `components/ui/PhasePanel.tsx`
A large cartoon-styled overlay (rounded, thick outline, track-coloured header). Tabs or sections:
1. **Overview:** summary, duration, mentor quote, key question
2. **Topics:** groups with each topic as a chip, collected gems highlighted, tap a chip to see its bite
3. **Project:** pipeline rendered as a vertical flow of steps, plus an **"I built this"** toggle → `progress.projects`
4. **Challenge:** a disabled "Play mini-game" button (wired in Phase 3)

Special layouts:
- **`fork`:** the comparison table as animated dual bars (green Dev vs blue Eng) + the two quotes
- **`summit`:** final skill sets, timelines and the project ladder

Close with Esc / an ✕ button → back to explore.

### 4. Skill Gems
- `data/world.ts`: generate gem spawn points per island (ring/scatter around the landmark, seeded, on the walkable surface). There is one gem per topic.
- `components/world/SkillGem.tsx`: an instanced, bobbing, spinning faceted gem in the track colour, collected on touch (distance check). Collected gems are not rendered.
- `components/ui/GemToast.tsx`: a non-blocking toast "💎 Embeddings: vectors that capture meaning…" with a 3 s auto-dismiss. Queue toasts when several are collected quickly.

### 5. Mentors
`components/world/Mentor.tsx`: a cute capsule-robot NPC (procedural: rounded body, screen face, antenna, idle bob) at each landmark. It faces the player when they're near and shows a speech bubble (drei `Html`) cycling its `lines`. `harbor` has "Byte", the guide, who greets first-time players.

### 6. HUD and progress UI
- `components/ui/HUD.tsx`: top-left current island + track badge; top-right gem count / total and badge count; a button to open the Passport (key P).
- `components/ui/Passport.tsx` (`mode='passport'`): a book-like overlay showing three columns (Common trunk → Developer / Engineer) as a skill tree. Each phase node shows its gem progress ring, badge stamp (Phase 3+) and project tick. Clicking a node shows a "Travel" button (teleport to that island; the free fast-travel is fine for now, and Phase 5 replaces it with the balloon).
- `components/ui/Minimap.tsx`: a small top-down SVG of island positions and bridges + the player dot and heading. Visited islands are filled and unvisited ones are outlined.

### 7. Island signage
Add a floating drei `Text` sign at each bridge head naming the destination island (and "→ AI Developer path" / "→ AI Engineer path" at the Fork).

## Out of scope
Mini-games and badges (only the visual slots), final landmark art, onboarding, audio.

## Acceptance criteria
- Every topic, project and duration in the doc appears in exactly one phase, with no invented roadmap items. Spot-check against the doc section by section.
- Walking to any landmark shows the prompt, and E (or the mobile Interact button) opens the correct panel. Esc/✕ returns to movement with no stuck pointer lock.
- Gems collect on touch, show a toast and persist across reloads. Counts in the HUD, panel and Passport agree.
- "I built this" toggles persist.
- Passport travel and the minimap work, and the panels are usable at 375px width.
- `npm run build` passes.
