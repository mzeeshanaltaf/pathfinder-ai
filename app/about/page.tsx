import type { Metadata } from 'next';
import Link from 'next/link';
import { CAREER_PATHS } from '@/data/roadmap';
import { LANDING_STATS } from '@/lib/landing';
import { AUTHOR, CONTENT_UPDATED, READING_VIEWPORT, SITE_NAME, SITE_URL, SOURCE_REPO, formatDate, roadmapHref } from '@/lib/seo';

const title = `About ${SITE_NAME}: How the AI Roadmaps Are Made`;
const description =
  'Who builds Pathfinder AI, where its AI Developer, AI Engineer and AI FDE roadmaps come from, and how your progress stays private on your device.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: { title, description, url: '/about', siteName: SITE_NAME, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport = READING_VIEWPORT;

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: title,
    description,
    url: `${SITE_URL}/about`,
    dateModified: CONTENT_UPDATED,
    about: { '@id': `${SITE_URL}/#organization` },
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url, sameAs: [AUTHOR.github] },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
    ],
  },
];

const H2 = 'mt-10 text-2xl font-extrabold';

export default function AboutPage() {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-linear-to-b from-sky-100 via-sky-50 to-violet-100 text-[#3d3452]">
      <article className="mx-auto max-w-3xl px-4 py-8 leading-relaxed sm:py-12">
        <nav aria-label="Breadcrumb" className="text-sm font-semibold text-[#3d3452]/70">
          <Link href="/" className="underline">
            {SITE_NAME}
          </Link>{' '}
          / About
        </nav>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">About {SITE_NAME}</h1>
        <p className="mt-3 text-lg">
          {SITE_NAME} turns AI career roadmaps into a small 3D world you can walk through in the browser. Each phase of a roadmap is a
          floating island. You collect a Skill Gem for every topic, play a short challenge on each island, and track the projects you
          build in a Skill Passport.
        </p>

        <h2 className={H2}>The roadmaps</h2>
        <p className="mt-3">
          There are {CAREER_PATHS.length} career paths, {LANDING_STATS.islands} islands and {LANDING_STATS.gems} topics in all. Every
          path starts from the same foundations (programming, maths and machine learning), splits at the Fork, and meets again at the
          Summit:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          {CAREER_PATHS.map((p) => (
            <li key={p.id}>
              <Link href={roadmapHref(p)} className="font-bold underline">
                {p.label} roadmap
              </Link>
              : {p.definition}
            </li>
          ))}
        </ul>

        <h2 className={H2}>How the roadmaps were made</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            The AI Developer and AI Engineer paths follow a written roadmap that compares the two roles phase by phase: topics,
            durations, projects and a skill comparison.
          </li>
          <li>
            Some topics were added later from a ten-part AI Developer / AI Engineer roadmap infographic series (programming, AI/ML
            foundations, generative AI, LLM applications, RAG, agents, orchestration, evaluation, observability and security). Only
            topics the original didn&apos;t already cover were added. The AI Developer&apos;s AI Observability phase comes from it.
          </li>
          <li>
            The AI Forward Deployed Engineer path follows its own roadmap. It shares the foundations and the AI Developer&apos;s LLM,
            prompting, RAG and agent phases, then adds the field skills: customer discovery, enterprise integration, deployment, field
            evaluation, security and go-live.
          </li>
          <li>
            Each topic has a one or two sentence plain-English explanation, written for this site, and the topics in each phase are
            grouped into short category cards. Durations and timelines are rough estimates and will vary from person to person.
          </li>
        </ul>
        <p className="mt-3 text-sm font-semibold text-[#3d3452]/70">
          Last updated <time dateTime={CONTENT_UPDATED}>{formatDate(CONTENT_UPDATED)}</time>.
        </p>

        <h2 className={H2}>Who builds it</h2>
        <p className="mt-3">
          {SITE_NAME} is built by{' '}
          <a href={AUTHOR.url} className="font-bold underline" rel="author">
            {AUTHOR.name}
          </a>
          . The source code is open on{' '}
          <a href={SOURCE_REPO} className="font-bold underline">
            GitHub
          </a>
          .
        </p>

        <h2 className={H2}>Your data</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>There are no accounts and nothing to sign up for.</li>
          <li>Your progress (gems, badges, projects, settings) is saved in your browser&apos;s local storage, on your device only.</li>
          <li>Page visits are counted with self-hosted, cookieless analytics. No ads and no tracking cookies.</li>
        </ul>

        <h2 className={H2}>Feedback</h2>
        <p className="mt-3">
          Found a mistake in a roadmap, or want another AI career path added?{' '}
          <a href={`${SOURCE_REPO}/issues`} className="font-bold underline">
            Open an issue on GitHub
          </a>
          .
        </p>

        <p className="mt-10 mb-8">
          <Link
            href="/play"
            className="inline-block rounded-full border-4 border-[#3d3452] bg-[#8b74cf] px-6 py-3 text-lg font-extrabold text-white"
          >
            Start exploring →
          </Link>
        </p>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  );
}
