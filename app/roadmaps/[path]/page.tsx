import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CAREER_PATHS, COMPARISON, getPhase, shortPathLabel, trackPhases, type CareerPath } from '@/data/roadmap';
import { SITE_NAME, SITE_URL, pathSlug, roadmapHref } from '@/lib/seo';

const bySlug = (slug: string) => CAREER_PATHS.find((p) => pathSlug(p.label) === slug);

export const dynamicParams = false;

export function generateStaticParams() {
  return CAREER_PATHS.map((p) => ({ path: pathSlug(p.label) }));
}

/** Keeps meta descriptions inside the ~160 character snippet limit, cutting on a word boundary. */
function clip(text: string, max = 158) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

const descriptionFor = (p: CareerPath) => clip(`${p.label} roadmap: skills, projects and a ${p.timeline.total} timeline. ${p.definition}`);

export async function generateMetadata({ params }: PageProps<'/roadmaps/[path]'>): Promise<Metadata> {
  const path = bySlug((await params).path);
  if (!path) return {};
  const title = `${shortPathLabel(path)} Roadmap: Skills, Projects & Timeline | ${SITE_NAME}`;
  const description = descriptionFor(path);
  const url = `/roadmaps/${pathSlug(path.label)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', locale: 'en_US' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function RoadmapPage({ params }: PageProps<'/roadmaps/[path]'>) {
  const slug = (await params).path;
  const path = bySlug(slug);
  if (!path) notFound();

  const phases = [...(path.sharedPhases ?? []), ...trackPhases(path.id).map((p) => p.id)].map(getPhase);
  const common = trackPhases('common');
  const others = CAREER_PATHS.filter((p) => p.id !== path.id);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: `${path.label} roadmap`, item: `${SITE_URL}/roadmaps/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: `${path.label} roadmap`,
      description: descriptionFor(path),
      url: `${SITE_URL}/roadmaps/${slug}`,
      provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      isAccessibleForFree: true,
    },
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-sky-100 via-sky-50 to-violet-100 text-[#3d3452]">
      <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-sm font-semibold text-[#3d3452]/70">
          <Link href="/" className="underline">
            {SITE_NAME}
          </Link>{' '}
          / {path.label} roadmap
        </nav>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {path.emoji} {path.label} Roadmap
        </h1>
        <p className="mt-3 text-lg">{path.definition}</p>
        <p className="mt-1 text-lg">
          <strong>Goal:</strong> {path.goal}
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full border-4 border-[#3d3452] bg-[#8b74cf] px-6 py-3 text-lg font-extrabold text-white"
        >
          Walk this roadmap in 3D →
        </Link>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">What an {shortPathLabel(path)} is excellent at</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {path.excellentAt.map((s) => (
              <li key={s} className="rounded-full border-2 border-[#3d3452] bg-white px-3 py-1 text-sm font-bold">
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 italic">“{path.quote}”</p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Timeline: {path.timeline.total}</h2>
          <ol className="mt-3 space-y-1">
            {path.timeline.steps.map((s) => (
              <li key={s.when}>
                <strong>{s.when}:</strong> {s.what}
              </li>
            ))}
          </ol>
          {path.timeline.note && <p className="mt-2 text-sm">{path.timeline.note}</p>}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Foundations every path shares</h2>
          <ul className="mt-3 space-y-4">
            {common.map((p) => (
              <PhaseBlock key={p.id} phase={p} />
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">The {path.label} path, phase by phase</h2>
          <ul className="mt-3 space-y-4">
            {phases.map((p) => (
              <PhaseBlock key={p.id} phase={p} />
            ))}
          </ul>
        </section>

        {path.finalSkills && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold">Final skill set</h2>
            <p className="mt-3">
              <strong>Foundation:</strong> {path.finalSkills.foundation.join(', ')}
            </p>
            <p className="mt-1">
              <strong>AI:</strong> {path.finalSkills.ai.join(', ')}
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">How the paths compare</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <caption className="sr-only">Skill depth by career path, out of 5 stars</caption>
              <thead>
                <tr>
                  <th scope="col" className="border-b-2 border-[#3d3452] py-2 pr-3">
                    Skill area
                  </th>
                  {CAREER_PATHS.map((p) => (
                    <th key={p.id} scope="col" className="border-b-2 border-[#3d3452] py-2 pr-3">
                      {shortPathLabel(p)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((r) => (
                  <tr key={r.area}>
                    <th scope="row" className="border-b border-[#3d3452]/20 py-1.5 pr-3 font-semibold">
                      {r.area}
                    </th>
                    {CAREER_PATHS.map((p) => (
                      <td key={p.id} className="border-b border-[#3d3452]/20 py-1.5 pr-3">
                        {r.stars[p.id] ? `${r.stars[p.id]}/5` : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 mb-8">
          <h2 className="text-2xl font-extrabold">Explore other roadmaps</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            {others.map((p) => (
              <li key={p.id}>
                <Link href={roadmapHref(p)} className="underline font-bold">
                  {p.emoji} {p.label} roadmap
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  );
}

function PhaseBlock({ phase }: { phase: ReturnType<typeof getPhase> }) {
  return (
    <li className="rounded-2xl border-[3px] border-[#3d3452] bg-white/80 p-4">
      <h3 className="text-xl font-extrabold">{phase.title}</h3>
      <p className="text-sm font-semibold text-[#3d3452]/70">
        {phase.subtitle}
        {phase.duration ? ` · ${phase.duration}` : ''}
      </p>
      <p className="mt-2">{phase.summary}</p>
      {phase.groups.map((g) => (
        <div key={g.title} className="mt-2">
          <h4 className="font-bold">{g.title}</h4>
          <p className="text-sm">{g.topics.map((t) => t.label).join(' · ')}</p>
        </div>
      ))}
      {phase.project && (
        <p className="mt-2 text-sm">
          <strong>Project:</strong> {phase.project.title} ({phase.project.pipeline.join(' → ')})
        </p>
      )}
      {phase.tools && phase.tools.length > 0 && (
        <p className="mt-1 text-sm">
          <strong>Tools:</strong> {phase.tools.join(', ')}
        </p>
      )}
    </li>
  );
}
