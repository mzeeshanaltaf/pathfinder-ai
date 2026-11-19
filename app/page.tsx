import type { Viewport } from 'next';
import { Instrument_Sans } from 'next/font/google';
import Link from 'next/link';
import ChoosePath from '@/components/landing/ChoosePath';
import ContinueJourney from '@/components/landing/ContinueJourney';
import Logo from '@/components/ui/Logo';
import { CAREER_PATHS } from '@/data/roadmap';
import { LANDING_STATS, islandTitles, landingPaths, landingQuiz, landingTrunk } from '@/lib/landing';
import { SEO_DESCRIPTION, SITE_NAME, SITE_URL, roadmapHref } from '@/lib/seo';

const instrument = Instrument_Sans({ subsets: ['latin'], display: 'swap' });

// The game locks zoom; a reading page must not.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

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

const focusRing = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#8b74cf]';
const primaryBtn = `inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#1f1c2c] px-6 font-semibold text-white transition-colors hover:bg-[#3a3452] ${focusRing}`;
const secondaryBtn = `inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#e3e2ea] bg-white px-5 font-semibold text-[#1f1c2c] transition-colors hover:border-[#b8b4c8] ${focusRing}`;
const SOFT = 'text-[#5f5a72]';

/** "A, B and C" */
const listOf = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function LandingPage() {
  const paths = landingPaths();
  const titles = islandTitles();

  const features = [
    {
      title: `${LANDING_STATS.gems} Skill Gems`,
      text: 'Every topic on every roadmap, each with a short plain-English explanation.',
      icon: (
        <>
          <path d="M12 2l4 6-4 14-4-14z" />
          <path d="M8 8h8" />
        </>
      ),
    },
    {
      title: `${LANDING_STATS.challenges} island challenges`,
      text: 'One short mini-game per island. Earn up to three stars for each badge.',
      icon: (
        <>
          <rect x="3" y="6" width="18" height="12" rx="4" />
          <path d="M8 10v4M6 12h4M15 11h.01M17 13h.01" />
        </>
      ),
    },
    {
      title: 'A Skill Passport',
      text: 'Badges, built projects, streaks and a certificate when you reach the Summit.',
      icon: (
        <>
          <path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4z" />
          <path d="M8 9h8M8 13h5" />
        </>
      ),
    },
  ];

  return (
    <div className={`site-page ${instrument.className} min-h-full bg-white text-[#1f1c2c] antialiased`}>
      <div className="mx-auto max-w-300 px-4 sm:px-6">
        <header className="flex items-center justify-between gap-3 py-5">
          <Link href="/" className={`flex items-center gap-2.5 rounded-lg text-[17px] font-semibold ${focusRing}`}>
            <Logo size={34} />
            {SITE_NAME}
          </Link>
          <nav aria-label="Main" className="flex items-center gap-5 text-[15px] font-medium">
            <a href="#quiz" className={`hidden rounded hover:underline hover:underline-offset-4 sm:inline ${focusRing}`}>
              Path quiz
            </a>
            <Link href="/play" className={`${primaryBtn} min-h-11 px-5 text-[15px]`} data-umami-event="start-exploring" data-umami-event-location="nav">
              Play
            </Link>
          </nav>
        </header>

        <section className="pt-10 pb-2 sm:pt-14">
          <h1 className="max-w-[15em] text-[clamp(40px,5vw,64px)] leading-[1.02] font-semibold tracking-tight text-balance">
            Which AI career is yours? Walk it before you choose.
          </h1>
          <p className={`mt-4 max-w-[36em] text-lg leading-relaxed ${SOFT}`}>
            {SITE_NAME} turns the {listOf(paths.map((p) => p.label))} roadmaps into a browser game of floating islands. Open a path to preview
            it, or take the quiz below. Every island stays open, whatever you pick.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/play" className={primaryBtn} data-umami-event="start-exploring" data-umami-event-location="hero">
              Start exploring
              <Arrow />
            </Link>
            <ContinueJourney
              titles={titles}
              location="hero"
              className={secondaryBtn}
              fallback={
                <a href="#quiz" className={secondaryBtn}>
                  Take the path quiz
                </a>
              }
            />
          </div>
          <p className={`mt-4 text-sm ${SOFT}`}>Free · No account · Saved on your device · Keyboard or phone joystick</p>
        </section>
      </div>

      <ChoosePath paths={paths} quiz={landingQuiz()} trunk={landingTrunk()} />

      <div className="mx-auto max-w-300 px-4 sm:px-6">
        <section aria-label="What every path includes" className="grid gap-7 border-t border-[#e3e2ea] pt-14 pb-20 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {f.icon}
              </svg>
              <h3 className="mt-3 mb-1.5 text-[19px] font-semibold">{f.title}</h3>
              <p className={`leading-relaxed ${SOFT}`}>{f.text}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-7 rounded-3xl bg-[#1f1c2c] px-6 py-8 text-white sm:px-14 sm:py-14">
          <div>
            <h2 className="text-[clamp(30px,3.4vw,44px)] leading-[1.08] font-semibold tracking-tight text-balance">Start at the Harbor. Decide at the Fork.</h2>
            <p className="mt-2 text-[#cfc9e6]">
              {LANDING_STATS.islands} islands, {CAREER_PATHS.length} career paths, one Summit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/play"
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-white px-6 font-semibold text-[#1f1c2c] transition-colors hover:bg-[#ece9f6] ${focusRing}`}
              data-umami-event="start-exploring"
              data-umami-event-location="final"
            >
              Start exploring
              <Arrow />
            </Link>
            <ContinueJourney
              titles={titles}
              location="final"
              className={`inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#4a4463] px-5 font-semibold text-white transition-colors hover:bg-white/10 ${focusRing}`}
            />
          </div>
        </section>

        <footer className={`flex flex-wrap justify-between gap-3 py-7 text-[13px] ${SOFT}`}>
          <span>
            {SITE_NAME} · Find your path into AI. Free, no account, saved on your device.
          </span>
          <nav aria-label="Roadmaps" className="flex flex-wrap gap-x-4 gap-y-1">
            {CAREER_PATHS.map((p) => (
              <Link key={p.id} href={roadmapHref(p)} className={`rounded underline-offset-4 hover:underline ${focusRing}`}>
                {p.label} roadmap
              </Link>
            ))}
          </nav>
        </footer>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </div>
  );
}
