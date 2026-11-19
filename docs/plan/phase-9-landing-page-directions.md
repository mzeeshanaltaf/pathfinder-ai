# Pathfinder AI: 6 landing page directions (exploration only)

## Context
Pathfinder AI has no landing page. `/` loads the 3D game straight away (`app/page.tsx` → `GameLoader`, plus an sr-only SEO outline). The plan is to put a landing page at `/` and move the game to `/play`, but first the user wants **6 meaningfully different design directions** to compare, using refero.design and awwwards as inspiration. They should differ in layout, typography, negative space, nav, product presentation and section rhythm, not just colour. The full landing page is **not** built in this step and **the repo is not changed**.

User decisions:
- Delivery: **one private hosted comparison page** (claude.ai Artifact).
- Fidelity: **nav + hero + 3–4 sections** per direction, responsive at desktop and 375px.
- Product art: **real in-game screenshots** captured from the dev server.
- CTA target: **"Start exploring" → `/play`**. A secondary "Continue your journey" is shown for returning players.

## Brand constants (identical in all 6)
- Name: Pathfinder AI. Tagline: *Find your path into AI.* The copy stays career-agnostic and never assumes a fixed number of paths.
- Logo: the SVG from `components/ui/Logo.tsx` (island, forked path, summit star, balloon), inlined.
- Colours from `lib/palette.ts`: ink `#3d3452`, Developer green, Engineer blue, FDE coral, Common warm, Meta lavender (`TRACK_COLORS`, `GEM_COLORS`). Each direction may emphasise or mute them, but the track-to-colour mapping is fixed.
- Content comes from `data/roadmap.ts` (`CAREER_PATHS` labels, definitions, timelines, phase titles), `lib/seo.ts` (`SEO_DESCRIPTION`) and the CLAUDE.md world table (27 islands, a mini-game per island, Skill Gems, badges, Passport, certificate, streaks). No invented roadmap claims.

## The 6 directions
| # | Name | Hero composition | Type | Nav | Product presentation | Rhythm / restraint |
|---|---|---|---|---|---|---|
| 1 | **The Journey** (scrollytelling) | Full-bleed in-game shot as the hero. Headline sits low-left over a soft gradient. | Rounded display (Fredoka/Baloo), large | Floating centred pill | Sticky full-screen screenshot that swaps Harbor → Fork → paths → Summit as you scroll, with Byte speech bubbles | Immersive, one long continuous story. Expressive (4/5) |
| 2 | **Field Guide** (editorial) | Asymmetric. Huge serif headline left, one framed "plate" screenshot right, lots of white | Serif display (Fraunces / Instrument Serif) + Geist body, small caps | One thin top line of text links | Screenshots as captioned plates ("Fig. 3, The Fork") | Chapters I–IV, wide margins, hairline rules. Restrained (1/5) |
| 3 | **Transit Map** (systems) | The roadmap drawn as an SVG metro map: the trunk line forks into green, blue and coral lines that meet at the Summit station | Space Grotesk + mono labels | Vertical left rail with a section index | Selecting a station shows a small card with a screenshot crop; stats strip (islands, paths, mini-games) | Dense grid, information-led. Balanced (2/5) |
| 4 | **Night Sky Bento** (product/SaaS) | Centred medium headline over a dark navy sky with pastel glows; a tilted browser-frame screenshot below | Geist, tight tracking | Sticky glass bar, CTA on the right | Bento grid: Gems, Badges, Mini-games, Passport, Streak, Certificate, each with its own crop | Modern, even cadence, the only dark direction. Balanced (3/5) |
| 5 | **Sticker Book** (neo-brutalist playful) | Viewport-filling headline in chunky type with ink outlines and hard offset shadows that echo the game's toon outlines | Heavy grotesk/rounded, 12–18vw | Hamburger opening a full-screen menu | Screenshots as rotated "stickers" with thick borders; a marquee of topic names | Loud colour blocks, bold section breaks. Most expressive (5/5) |
| 6 | **Choose Your Path** (interactive fork) | Split hero: the headline above one panel per path (built from `CAREER_PATHS`). Tapping a panel expands it | Geist, medium scale, plain | Minimal: logo + "Play" | A 3-question inline path quiz updates the screenshots and copy below to fit the chosen path | Conversion-led and personal. Restrained-to-balanced (2/5) |

Every direction covers the same story: hero, how it works (walk, collect, play, build), the career paths, features/engagement, and a final CTA. Directions can put these in a different order or merge them.

## Implementation steps
1. **Load skills/guidance:** run `Artifact` `action: quickstart` (intent `design`) and follow what it returns. Load `artifact-design` (and `frontend-design` for taste) before writing any HTML.
2. **Pull real copy:** read `data/roadmap.ts` (CAREER_PATHS, phase titles/summaries, timelines), `data/minigames.ts` (titles) and `README.md`. Write the copy deck once in a shared JS object so the 6 pages say the same things.
3. **Capture screenshots** (scratchpad only, no repo changes):
   - `npm run dev` in the background.
   - Drive a browser (Claude-in-Chrome / built-in browser skill; fallback: `npx playwright` installed in the scratchpad). Seed localStorage `pathfinder-ai-progress` with `onboardingDone: true` and some gems/badges so the HUD and Passport look lived-in, then reload.
   - Shots, desktop 1600×1000 unless noted: Harbor wide establishing shot, Fork signpost and star bars, a landmark (Lighthouse or Launch Pad), a mini-game panel, the Passport map, the island guide with category cards, the Summit, and one phone portrait shot (390×844) with the joystick. Move between islands with balloon travel from the Passport. Hide the HUD for the hero shots if the game allows it.
   - Compress to WebP/JPEG (~150–250 KB each).
4. **Build the comparison artifact** in the scratchpad (`.../scratchpad/landing-concepts/`):
   - `index.html` is the viewer. A top bar has **Grid** (6 live thumbnails as scaled iframes with a name and a restraint dial each) and **1–6** tabs for a single full-width view. A **Desktop / Phone (375px)** frame toggle. A collapsible notes panel per direction describes the hero, type, nav, product presentation, rhythm and when to pick it. The last tab/mode is remembered in localStorage (wrapped in try/catch).
   - `d1.html` … `d6.html`: each a self-contained page with its own doctype, viewport meta, base styles, Google Fonts and vanilla JS only (scroll swaps, quiz, expanding panels, marquee). Each respects `prefers-reduced-motion`.
   - `img/*` screenshots published through `files`.
   - Publish once with `files` mapping `d1–d6.html` and `img/*`, icon `layout`.
5. **QA pass** before handing over: every direction at 1440px and 375px with no horizontal scroll, legible contrast on screenshot backgrounds, and the CTA visible above the fold.

## Verification
- Open the published artifact. In the grid view all 6 load, and each tab renders full width.
- Switching to Phone shows each direction at 375px with no horizontal overflow, and the nav collapses sensibly.
- Interactions work: the D1 scroll swaps, the D3 station cards, the D6 path panels and quiz.
- `git status` stays clean: nothing written to the repo, and the dev server is stopped afterwards.

## Out of scope (next step after the user picks a direction)
Building the real `/` landing page in Next.js, moving the game to `/play`, a returning-player redirect, and SEO/OG updates.
