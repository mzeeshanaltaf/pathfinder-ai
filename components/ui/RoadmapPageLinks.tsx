'use client';

import { CAREER_PATHS, shortPathLabel, type CareerPath } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { roadmapHref } from '@/lib/seo';
import { INK } from './kit';

/**
 * Links to the static, readable roadmap pages (/roadmaps/<slug>). They open in a new tab so the
 * game keeps running; progress lives in localStorage either way.
 */
export function RoadmapPageLink({ path, children, className = '' }: { path: CareerPath; children?: React.ReactNode; className?: string }) {
  return (
    <a
      href={roadmapHref(path)}
      target="_blank"
      rel="noopener"
      className={`font-extrabold underline decoration-2 underline-offset-2 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children ?? `Read the ${shortPathLabel(path)} roadmap`} ↗
    </a>
  );
}

/** One chip per career path, for cards that introduce every path at once. */
export default function RoadmapPageLinks({ title = 'Prefer reading? Open a roadmap as a page:' }: { title?: string }) {
  return (
    <nav aria-label="Roadmap pages" className="rounded-2xl border-[3px] bg-white px-3 py-2" style={{ borderColor: INK }}>
      <p className="text-xs font-extrabold opacity-70">{title}</p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {CAREER_PATHS.map((p) => (
          <li key={p.id}>
            <a
              href={roadmapHref(p)}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-9 items-center rounded-full border-[3px] px-3 text-xs font-extrabold active:translate-y-0.5 sm:text-sm"
              style={{ borderColor: INK, background: TRACK_COLORS[p.id].light, boxShadow: `0 2px 0 ${INK}` }}
            >
              {p.emoji} {shortPathLabel(p)} ↗
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
