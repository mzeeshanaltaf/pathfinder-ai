'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useState, type CSSProperties } from 'react';
import type { PathId } from '@/data/roadmap';
import type { LandingPath, LandingQuiz, LandingTrunk } from '@/lib/landing';
import { playHref } from '@/lib/playLinks';
import { shotFor } from './shots';

const INK = '#1f1c2c';
const SOFT = '#5f5a72';
const LINE = '#e3e2ea';

/** A pastel track colour softened toward white, for large surfaces. */
const wash = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, white)`;

type Totals = Partial<Record<PathId, number>>;

function totalsFor(quiz: LandingQuiz, answers: number[]): Totals {
  const totals: Totals = {};
  answers.forEach((a, qi) => {
    if (a < 0) return;
    for (const [id, n] of Object.entries(quiz.questions[qi].options[a].weights) as [PathId, number][]) {
      totals[id] = (totals[id] ?? 0) + n;
    }
  });
  return totals;
}

/** Same rule as the Fork quiz's pickOutcome: one path alone in the lead with enough points, else none. */
function leaderOf(paths: LandingPath[], quiz: LandingQuiz, totals: Totals): PathId | null {
  const ranked = paths.map((p) => ({ id: p.id, n: totals[p.id] ?? 0 })).sort((a, b) => b.n - a.n);
  const [top, second] = ranked;
  if (!top || (second && second.n === top.n) || top.n < quiz.minToWin) return null;
  return top.id;
}

const focusRing = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#8b74cf]';
const primaryBtn = `inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-[#1f1c2c] px-6 py-2 text-center leading-snug font-semibold text-white transition-colors hover:bg-[#3a3452] ${focusRing}`;
const secondaryBtn = `inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#e3e2ea] bg-white px-5 py-2 text-center leading-snug font-semibold transition-colors hover:border-[#b8b4c8] ${focusRing}`;

/**
 * The interactive heart of the landing page: one panel per career path, a short version of the
 * Fork quiz, and the chosen path's route and timeline. All three follow the same selection.
 */
export default function ChoosePath({ paths, quiz, trunk }: { paths: LandingPath[]; quiz: LandingQuiz; trunk: LandingTrunk }) {
  const uid = useId();
  const [selected, setSelected] = useState<PathId>(paths[0].id);
  const [answers, setAnswers] = useState<number[]>(() => quiz.questions.map(() => -1));

  const byId = (id: PathId) => paths.find((p) => p.id === id) ?? paths[0];
  const sel = byId(selected);
  const totals = totalsFor(quiz, answers);
  const leader = leaderOf(paths, quiz, totals);
  const answered = answers.filter((a) => a >= 0).length;
  const shot = shotFor(sel.id);

  const choose = (qi: number, oi: number) => {
    const next = answers.map((a, i) => (i === qi ? oi : a));
    setAnswers(next);
    const lead = leaderOf(paths, quiz, totalsFor(quiz, next));
    if (lead) setSelected(lead);
  };

  const result = leader
    ? {
        kicker: 'Your best fit',
        title: byId(leader).label,
        body: `“${byId(leader).quote}” The route below now follows this path.`,
        cta: `Start on the ${byId(leader).shortLabel} path`,
      }
    : answered === 0
      ? { kicker: 'Your suggestion', title: 'Pick an answer to each question', body: 'Your best fit appears here, and the route below switches to it.', cta: 'Start exploring' }
      : answered < quiz.questions.length
        ? { kicker: 'Keep going', title: 'No clear leader yet', body: 'Answer the remaining questions to see a suggestion.', cta: 'Start exploring' }
        : { kicker: 'A bit of everything', title: quiz.fallback.title, body: `${quiz.fallback.text} Nothing is locked, so try islands on each side.`, cta: 'Start exploring' };

  return (
    <>
      {/* Path panels */}
      <div className="mx-auto max-w-300 px-4 sm:px-6">
        <div className="mt-10 flex flex-col gap-3.5 md:flex-row md:items-stretch">
          {paths.map((p) => {
            const open = p.id === selected;
            const pShot = shotFor(p.id);
            return (
              <div
                key={p.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-[20px] border transition-[flex-grow] duration-300 ease-out motion-reduce:transition-none md:flex-[var(--grow)_1_0%]"
                style={
                  {
                    '--grow': open ? 2.2 : 1,
                    background: wash(p.colors.light, open ? 45 : 30),
                    borderColor: open ? p.colors.dark : LINE,
                    boxShadow: open ? `0 0 0 1px ${p.colors.dark}` : undefined,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`${uid}-${p.id}`}
                  onClick={() => setSelected(p.id)}
                  className={`flex min-h-11 flex-col gap-2 rounded-[20px] p-6 text-left ${focusRing}`}
                >
                  <span className="flex items-center gap-2 text-[13px] font-semibold tracking-wide uppercase" style={{ color: SOFT }}>
                    <span aria-hidden className="size-2.5 rounded-full" style={{ background: p.colors.dark }} />
                    {p.total}
                  </span>
                  <span className="text-[26px] leading-tight font-semibold tracking-tight">{p.label}</span>
                  <q className="text-base leading-snug" style={{ color: SOFT }}>
                    {p.quote}
                  </q>
                </button>
                {open && (
                  <div id={`${uid}-${p.id}`} className="grid items-start gap-5 px-6 pb-6 lg:grid-cols-2">
                    <Image
                      src={pShot.src}
                      alt={pShot.alt}
                      placeholder="blur"
                      sizes="(min-width: 1024px) 340px, (min-width: 768px) 50vw, 100vw"
                      className="aspect-16/10 w-full rounded-xl object-cover"
                    />
                    <dl className="flex flex-col gap-3.5 text-[15px] leading-normal">
                      <div>
                        <dt className="text-xs font-semibold tracking-wider uppercase" style={{ color: SOFT }}>
                          What they do
                        </dt>
                        <dd>{p.definition}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-wider uppercase" style={{ color: SOFT }}>
                          Excellent at
                        </dt>
                        <dd>{p.excellentAt.join(', ')}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-wider uppercase" style={{ color: SOFT }}>
                          Timeline
                        </dt>
                        <dd>
                          {p.total} · {p.islandsNote}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz */}
      <section id="quiz" aria-labelledby={`${uid}-quiz`} className="mt-16 border-y bg-[#f5f5f8] py-16 sm:py-20" style={{ borderColor: LINE }}>
        <div className="mx-auto max-w-300 px-4 sm:px-6">
          <h2 id={`${uid}-quiz`} className="text-[clamp(30px,3.4vw,44px)] leading-[1.08] font-semibold tracking-tight text-balance">
            Not sure? Try the quiz from the Fork.
          </h2>
          <p className="mt-2.5 max-w-[36em] text-lg leading-relaxed" style={{ color: SOFT }}>
            {quiz.questions.length} questions from the quiz you meet at the Fork in the game. It suggests a place to start, nothing more.
          </p>
          <div
            className="mt-8 grid items-start gap-5 lg:grid-cols-[repeat(var(--qn),minmax(0,1fr))_minmax(0,0.9fr)]"
            style={{ '--qn': quiz.questions.length } as CSSProperties}
          >
            {quiz.questions.map((q, qi) => (
              <fieldset key={q.q} className="flex min-w-0 flex-col gap-2.5">
                <legend className="mb-2.5 text-[17px] leading-snug font-semibold">{q.q}</legend>
                {q.options.map((o, oi) => {
                  const on = answers[qi] === oi;
                  const path = (Object.keys(o.weights) as PathId[]).length === 1 ? byId(Object.keys(o.weights)[0] as PathId) : null;
                  const accent = path?.colors.dark ?? '#8b74cf';
                  return (
                    <button
                      key={o.text}
                      type="button"
                      aria-pressed={on}
                      onClick={() => choose(qi, oi)}
                      className={`min-h-11 rounded-[10px] border bg-white px-3.5 py-2.5 text-left text-[15px] leading-snug transition-colors hover:border-[#b8b4c8] ${focusRing}`}
                      style={
                        on
                          ? { borderColor: accent, background: wash(path?.colors.light ?? '#ddd2fa', 45), boxShadow: `0 0 0 1px ${accent}` }
                          : { borderColor: LINE }
                      }
                    >
                      {o.text}
                    </button>
                  );
                })}
              </fieldset>
            ))}

            <div className="flex flex-col gap-3.5 rounded-[18px] border bg-white p-6 lg:sticky lg:top-5" style={{ borderColor: LINE }}>
              <div aria-live="polite" className="flex flex-col gap-3.5">
                <span className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: SOFT }}>
                  {result.kicker}
                </span>
                <span className="text-2xl leading-tight font-semibold tracking-tight">{result.title}</span>
                <span className="text-[15px] leading-normal" style={{ color: SOFT }}>
                  {result.body}
                </span>
              </div>
              <ul className="flex flex-col gap-2" aria-label="Points per path">
                {paths.map((p) => {
                  const n = totals[p.id] ?? 0;
                  return (
                    <li key={p.id} className="grid grid-cols-[68px_minmax(0,1fr)_20px] items-center gap-2.5 text-[13px] tabular-nums">
                      <span className="truncate">{p.shortLabel.replace(/^AI /, '')}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-[#f0eff4]">
                        <span
                          className="block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                          style={{ width: `${(n / quiz.maxPoints) * 100}%`, background: p.colors.dark }}
                        />
                      </span>
                      <span className="text-right">{n}</span>
                    </li>
                  );
                })}
              </ul>
              <Link
                href={playHref(leader)}
                className={primaryBtn}
                data-umami-event="start-exploring"
                data-umami-event-location="quiz"
                data-umami-event-path={leader ?? 'none'}
              >
                {result.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Route */}
      <section aria-labelledby={`${uid}-route`} className="mx-auto max-w-300 px-4 pt-20 pb-10 sm:px-6 sm:pt-24">
        <span className="flex items-center gap-2 text-[13px] font-semibold tracking-wide uppercase" style={{ color: SOFT }}>
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: sel.colors.dark }} />
          Your route
        </span>
        <h2 id={`${uid}-route`} className="mt-2.5 text-[clamp(30px,3.4vw,44px)] leading-[1.08] font-semibold tracking-tight text-balance">
          The {sel.label} path, island by island.
        </h2>
        <ol className="mt-6 flex flex-wrap items-center gap-2" aria-label={`Islands on the ${sel.label} path`}>
          {[...trunk.before, ...sel.stops, trunk.summit].map((s, i, all) => (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-2 text-sm ${s.id === trunk.summit.id ? 'font-bold' : 'font-medium'}`}
                style={{ background: wash(s.tint, 60), borderColor: LINE }}
              >
                {s.title}
              </span>
              {i < all.length - 1 && (
                <span aria-hidden className="text-[#a5a1b6]">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        {sel.stops.some((s) => s.shared) && (
          <p className="mt-3 text-sm" style={{ color: SOFT }}>
            The first {sel.stops.filter((s) => s.shared).length} islands after the Fork are shared with another path.
          </p>
        )}
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Image
            key={sel.id}
            src={shot.src}
            alt={shot.alt}
            placeholder="blur"
            sizes="(min-width: 1024px) 640px, 100vw"
            className="w-full rounded-[18px] border"
            style={{ borderColor: LINE }}
          />
          <div>
            <ol className="flex flex-col">
              {sel.timeline.map((t) => (
                <li key={t.when} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-t py-3 text-[15px]" style={{ borderColor: LINE }}>
                  <span className="tabular-nums" style={{ color: SOFT }}>
                    {t.when}
                  </span>
                  <span>{t.what}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={playHref(sel.id)}
                className={primaryBtn}
                data-umami-event="start-exploring"
                data-umami-event-location="route"
                data-umami-event-path={sel.id}
              >
                Start on the {sel.shortLabel} path
              </Link>
              <Link href={sel.href} className={secondaryBtn} style={{ color: INK }}>
                Read the {sel.shortLabel} roadmap
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
