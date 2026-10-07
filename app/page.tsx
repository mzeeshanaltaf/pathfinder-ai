import Link from 'next/link';
import GameLoader from '@/components/GameLoader';
import { CAREER_PATHS, trackPhases } from '@/data/roadmap';
import { SEO_DESCRIPTION, SITE_NAME, SITE_URL, roadmapHref } from '@/lib/seo';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SEO_DESCRIPTION,
  applicationCategory: 'EducationalApplication',
  genre: 'Education',
  operatingSystem: 'Any (modern web browser)',
  inLanguage: 'en',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

/**
 * The game itself is client-only (WebGL, WASM, localStorage), so crawlers would otherwise see just a
 * loading screen. This server-rendered outline of the same roadmap content gives them (and screen
 * readers) real HTML: one h1, a section per career path and the phases on it.
 */
export default function Page() {
  const common = trackPhases('common');
  return (
    <>
      <GameLoader />
      <main className="sr-only">
        <h1>Pathfinder AI: find your path into AI</h1>
        <p>{SEO_DESCRIPTION}</p>

        <section>
          <h2>Common foundations</h2>
          <ul>
            {common.map((p) => (
              <li key={p.id}>
                <h3>{p.title}</h3>
                <p>{p.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        {CAREER_PATHS.map((path) => (
          <section key={path.id}>
            <h2>
              <Link href={roadmapHref(path)}>{path.label} roadmap</Link>
            </h2>
            <p>{path.definition}</p>
            <p>{path.goal}</p>
            <p>Timeline: {path.timeline.total}</p>
            <ul>
              {trackPhases(path.id).map((p) => (
                <li key={p.id}>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2>How it works</h2>
          <p>
            Walk a cartoon world of floating islands in your browser. Each island is a roadmap phase: collect Skill Gems for the
            topics, play a short mini-game to earn a badge, track real-world projects and fill your Skill Passport on the way to the
            Summit. Progress is saved on your device. No account needed.
          </p>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}
