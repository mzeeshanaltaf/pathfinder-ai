import { CAREER_PATHS, shortPathLabel } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { pathSlug, SITE_NAME } from '@/lib/seo';
import { shareCard, SHARE_SIZE } from '@/lib/shareCard';

export const alt = 'An AI career roadmap on Pathfinder AI: skills, projects and a timeline, free to explore as a 3D game.';
export const size = SHARE_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return CAREER_PATHS.map((p) => ({ path: pathSlug(p.label) }));
}

/** Share card per career path, in the path's colour. */
export default async function Image({ params }: { params: Promise<{ path: string }> }) {
  const slug = (await params).path;
  const p = CAREER_PATHS.find((c) => pathSlug(c.label) === slug) ?? CAREER_PATHS[0];
  const label = shortPathLabel(p);
  return shareCard({
    eyebrow: `${SITE_NAME} · Free roadmap`,
    title: `${label} Roadmap`,
    compact: label.length > 8,
    tagline: `${p.timeline.total} · step by step`,
    body: `${p.definition} Skills, projects and a timeline.`,
    cta: 'See the roadmap →',
    accent: TRACK_COLORS[p.id].dark,
  });
}
