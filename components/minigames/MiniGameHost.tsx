'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { CloseButton, INK, resumeExplore, SectionTitle, TrackBadge } from '@/components/ui/kit';
import { MINIGAMES, type MiniGameDef } from '@/data/minigames';
import { getPhase, type Phase, type PhaseId, type Topic } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi, type MiniGameResult } from '@/store/ui';
import { finishMiniGame } from './complete';
import { GameButton } from './kit';
import { MINIGAME_REGISTRY, preloadMiniGame } from './registry';
import type { MiniGameRun } from './types';

/** Full-screen mini-game overlay: intro card → game → result screen. Shown while `ui.mode === 'minigame'`. */
export default function MiniGameHost() {
  const mode = useUi((s) => s.mode);
  const id = useUi((s) => s.activePhaseId);
  if (mode !== 'minigame' || !id) return null;
  return <HostBody key={id} phaseId={id} />;
}

function HostBody({ phaseId }: { phaseId: PhaseId }) {
  const def = MINIGAMES[phaseId];
  const phase = getPhase(phaseId);
  const colors = TRACK_COLORS[phase.track];
  const result = useUi((s) => (s.miniGameResult?.phaseId === phaseId ? s.miniGameResult : null));
  const [stage, setStage] = useState<'intro' | 'playing'>('intro');
  const [run, setRun] = useState(0);
  const Game = MINIGAME_REGISTRY[def.id];

  useEffect(() => preloadMiniGame(def.id), [def.id]);

  const onComplete = useCallback((r: MiniGameRun) => finishMiniGame(phaseId, r), [phaseId]);
  const retry = () => {
    useUi.getState().clearMiniGameResult();
    setRun((n) => n + 1);
    setStage('playing');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-center bg-[#3d3452]/45 backdrop-blur-[3px] sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${def.title}: ${phase.title} mini-game`}
        className="flex h-full w-full max-w-2xl min-w-0 flex-col overflow-hidden bg-[#fffdf8] sm:h-auto sm:max-h-[92vh] sm:rounded-3xl sm:border-4"
        style={{ borderColor: INK, color: INK, boxShadow: `0 8px 0 ${INK}` }}
      >
        <header
          className="flex items-center gap-3 border-b-4 px-4 pt-[max(10px,env(safe-area-inset-top))] pb-2.5"
          style={{ background: colors.light, borderColor: INK }}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[3px] text-xl"
            style={{ borderColor: INK, background: '#ffc93c' }}
            aria-hidden
          >
            ★
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
              <TrackBadge track={phase.track} />
              <span className="truncate opacity-75">{phase.title} · Challenge</span>
            </div>
            <h2 className="mt-0.5 truncate text-xl leading-tight font-extrabold">{def.title}</h2>
          </div>
          <CloseButton onClick={resumeExplore} label="Exit mini-game" />
        </header>

        <div
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]"
          style={{ touchAction: 'pan-y' }}
        >
          {result ? (
            <ResultScreen key={`r${run}`} result={result} def={def} phase={phase} onRetry={retry} />
          ) : stage === 'intro' ? (
            <Intro def={def} phaseId={phaseId} onStart={() => setStage('playing')} />
          ) : (
            <Suspense fallback={<Loading />}>
              <Game key={run} phaseId={phaseId} config={def.config} onComplete={onComplete} onExit={resumeExplore} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-sm font-bold opacity-70">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#3d3452]/20 border-t-[#3d3452]" aria-hidden />
      Loading…
    </div>
  );
}

function Intro({ def, phaseId, onStart }: { def: MiniGameDef; phaseId: PhaseId; onStart: () => void }) {
  const badge = useProgress((s) => s.badges[phaseId]);
  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <div className="w-full max-w-md rounded-2xl border-[3px] bg-white p-4 text-left" style={{ borderColor: INK }}>
        <SectionTitle>How to play</SectionTitle>
        <p className="text-[15px] leading-relaxed font-semibold">{def.howTo}</p>
      </div>
      {badge ? (
        <p className="text-sm font-bold">
          Your best: <span className="text-amber-500">{'★'.repeat(badge.stars)}</span>
          <span className="opacity-30">{'★'.repeat(3 - badge.stars)}</span>
          {badge.stars < 3 ? ' · play again to upgrade your badge' : ' · perfect!'}
        </p>
      ) : (
        <p className="text-sm font-bold opacity-70">Finish to earn this island&apos;s badge (up to 3 stars).</p>
      )}
      <GameButton onClick={onStart} className="min-w-40 text-lg" color="#7fd99a">
        Start ▶
      </GameButton>
      <p className="text-xs font-bold opacity-50">Esc or ✕ exits at any time.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result

function ResultScreen({
  result,
  def,
  phase,
  onRetry,
}: {
  result: MiniGameResult;
  def: MiniGameDef;
  phase: Phase;
  onRetry: () => void;
}) {
  const { stars, best, prevStars, score } = result;
  const newBadge = prevStars === 0;
  const improved = !newBadge && stars > prevStars;
  const celebrate = newBadge || improved;
  const allTopics = phase.groups.flatMap((g) => g.topics);
  const recap = def.recapTopicIds.map((id) => allTopics.find((t) => t.id === id)).filter((t): t is Topic => !!t);
  const headline = stars === 3 ? 'Brilliant!' : stars === 2 ? 'Nice work!' : 'Challenge complete!';

  return (
    <div className="relative flex flex-col items-center gap-4 text-center">
      {celebrate && <Confetti />}
      <h3 className="text-2xl font-extrabold">{headline}</h3>
      <div className="flex items-end gap-1" aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            aria-hidden
            className={`leading-none ${i === 2 ? 'text-6xl' : 'text-5xl'} ${i <= stars ? 'animate-[star-pop_500ms_cubic-bezier(.2,1.6,.5,1)_both] text-[#ffc93c]' : 'text-[#3d3452]/15'}`}
            style={{ animationDelay: `${150 + i * 260}ms`, WebkitTextStroke: i <= stars ? `2px ${INK}` : undefined }}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-sm font-extrabold">Score {score}</p>

      {celebrate ? (
        <div className="flex items-center gap-3">
          <span
            className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-double animate-[stamp-in_600ms_cubic-bezier(.2,1.4,.5,1)_1.1s_both]"
            style={{ borderColor: '#d98e04', background: '#ffe9a8', color: '#9a5d00', boxShadow: `0 4px 0 ${INK}` }}
          >
            <span className="text-[10px] font-black tracking-wider uppercase">Badge</span>
            <span className="text-lg leading-none font-black">{'★'.repeat(best)}</span>
          </span>
          <div className="text-left">
            <div className="text-lg leading-tight font-extrabold">{newBadge ? 'New badge earned!' : 'Badge upgraded!'}</div>
            <div className="text-xs font-bold opacity-70">Stamped in your Skill Passport 📖</div>
          </div>
        </div>
      ) : (
        <p className="text-sm font-bold opacity-80">
          Your best is still {'★'.repeat(best)}. {best < 3 ? 'Beat it to upgrade your badge!' : 'A perfect badge!'}
        </p>
      )}

      {recap.length > 0 && (
        <section className="w-full max-w-md text-left">
          <SectionTitle>What you learned</SectionTitle>
          <ul className="flex flex-col gap-2">
            {recap.map((t) => (
              <li key={t.id} className="rounded-2xl border-[3px] px-3 py-2" style={{ borderColor: INK, background: TRACK_COLORS[phase.track].light }}>
                <div className="text-sm font-extrabold">{t.label}</div>
                <p className="text-sm">{t.bite}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => useUi.getState().openPanel(phase.id)}
            className="mt-2 text-xs font-extrabold underline underline-offset-2"
          >
            Read all of {phase.title}&apos;s topics →
          </button>
        </section>
      )}

      <div className="flex w-full max-w-md flex-wrap justify-center gap-2 pt-1">
        <GameButton onClick={onRetry} color="white" className="flex-1">
          ↻ Retry
        </GameButton>
        <GameButton onClick={resumeExplore} color="#7fd99a" className="flex-1">
          Back to island
        </GameButton>
      </div>
    </div>
  );
}

const CONFETTI_COLORS = ['#ffc93c', '#7fd99a', '#82bdf2', '#ff9eb8', '#b9a3ee', '#ffa940'];

/** One-shot CSS confetti burst from the top-centre of the result screen. */
function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 42 }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const d = 90 + Math.random() * 170;
      return {
        i,
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d * 0.7 + 60 + Math.random() * 90,
        rot: (Math.random() - 0.5) * 900,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: 6 + Math.random() * 6,
        delay: Math.random() * 120,
        round: Math.random() < 0.3,
      };
    }),
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      <div className="absolute top-16 left-1/2 h-0 w-0">
        {pieces.map((p) => (
          <span
            key={p.i}
            className="absolute block animate-[confetti_1400ms_cubic-bezier(.15,.7,.4,1)_both]"
            style={
              {
                width: p.w,
                height: p.round ? p.w : p.w * 1.6,
                borderRadius: p.round ? '50%' : 2,
                background: p.color,
                animationDelay: `${300 + p.delay}ms`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rot}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
