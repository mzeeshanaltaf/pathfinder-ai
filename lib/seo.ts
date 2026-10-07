export const SITE_NAME = 'Pathfinder AI';

/** Absolute site origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL when deploying. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export const SEO_TITLE = 'Pathfinder AI: AI Developer, AI Engineer & AI FDE Roadmaps';

/** 140 characters: stays inside the ~160 char snippet limit. */
export const SEO_DESCRIPTION =
  'Explore AI Developer, AI Engineer and AI Forward Deployed Engineer roadmaps as a 3D game. Collect skills, play challenges, build projects.';

/** URL slug for a career path's static roadmap page, e.g. "AI Developer" -> "ai-developer". */
export const pathSlug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Site path of a career path's static roadmap page, e.g. "/roadmaps/ai-developer". */
export const roadmapHref = (path: { label: string }) => `/roadmaps/${pathSlug(path.label)}`;
