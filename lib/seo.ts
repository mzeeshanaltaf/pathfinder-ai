import type { Viewport } from 'next';
import type { CareerPath, PathId } from '@/data/roadmap';

export const SITE_NAME = 'Pathfinder AI';

/** Absolute site origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL when deploying. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export const SEO_TITLE = 'Pathfinder AI: AI Developer, AI Engineer & AI FDE Roadmaps';

/** 140 characters: stays inside the ~160 char snippet limit. */
export const SEO_DESCRIPTION =
  'Explore AI Developer, AI Engineer and AI Forward Deployed Engineer roadmaps as a 3D game. Collect skills, play challenges, build projects.';

/** Who builds the site: the About page byline and the Organization / Course schema. */
export const AUTHOR = { name: 'Muhammad Zeeshan Altaf', url: 'https://www.zeeshanai.cloud/', github: 'https://github.com/mzeeshanaltaf' };
export const SOURCE_REPO = 'https://github.com/mzeeshanaltaf/pathfinder-ai';

/** Sitemap lastmod for the content pages. Bump it when roadmap content (data/roadmap.ts) changes. */
export const CONTENT_UPDATED = '2026-11-19';

/** Reading pages (landing, roadmaps, about) must allow pinch-zoom; only the game locks it. */
export const READING_VIEWPORT: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

/** URL slug for a career path's static roadmap page, e.g. "AI Developer" -> "ai-developer". */
export const pathSlug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Site path of a career path's static roadmap page, e.g. "/roadmaps/ai-developer". */
export const roadmapHref = (path: { label: string }) => `/roadmaps/${pathSlug(path.label)}`;

/** "2026-11-19" -> "19 November 2026" (fixed locale and UTC, so it renders the same everywhere). */
export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** "~6–8 months" -> "~6–8 month" (as an adjective: "a ~6–8 month timeline"). */
export const timelineAdjective = (total: string) => total.replace(/\bmonths\b/, 'month');

/** Upper bound of a timeline as an ISO 8601 duration: "~12–14 months" -> "P14M" (Course schema workload). */
export function timelineDuration(total: string): string | undefined {
  const nums = total.match(/\d+/g);
  return nums ? `P${Math.max(...nums.map(Number))}M` : undefined;
}

/**
 * Per-path search copy. `name` is the phrase people search for (it leads the title); `focus` is the
 * skill list in the meta description. Paths without an entry fall back to their label and excellentAt.
 */
const ROADMAP_SEO: Partial<Record<PathId, { name?: string; focus: string }>> = {
  developer: { focus: 'Python, LLM APIs, prompt engineering, RAG, agents, evals and observability' },
  engineer: { focus: 'ML, deep learning, transformers, LLMs, advanced RAG, agents, model serving and MLOps' },
  fde: {
    name: 'AI Forward Deployed Engineer (FDE)',
    focus: 'customer discovery, integration, cloud deployment, evals and security',
  },
};

/** Cuts text to the ~160 character snippet limit on a word boundary (a safety net for new paths). */
function clip(text: string, max = 158) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

/** Title tag for a roadmap page, e.g. "AI Engineer Roadmap: Skills & Projects | Pathfinder AI". */
export function roadmapTitle(p: CareerPath) {
  const name = ROADMAP_SEO[p.id]?.name;
  return name ? `${name} Roadmap | ${SITE_NAME}` : `${p.label} Roadmap: Skills & Projects | ${SITE_NAME}`;
}

/** Meta description for a roadmap page: what it covers, then the timeline. */
export function roadmapDescription(p: CareerPath) {
  const focus = ROADMAP_SEO[p.id]?.focus ?? p.excellentAt.join(', ');
  return clip(`Free ${p.label} roadmap: ${focus}, with projects and a ${timelineAdjective(p.timeline.total)} timeline.`);
}
