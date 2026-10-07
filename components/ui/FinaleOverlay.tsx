'use client';

import { useState } from 'react';
import {
  BUILD_ADVICE,
  CAREER_LADDER,
  CAREER_PATH_BY_ID,
  CAREER_PATHS,
  ENTRY_POINT_NOTE,
  PHASE_IDS,
  ROADMAP_SHAPE,
  TIMELINE_NOTE,
  TRACK_LABELS,
} from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { certificateSummary, hatColor, pathComplete, PATH_TRACKS } from '@/lib/progress';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import ByteAvatar from './ByteAvatar';
import { INK, resumeExplore } from './kit';
import { rungColor } from './roadmapParts';
import Sheet, { PillButton } from './Sheet';

/** One short note per rung, all taken from the roadmap doc. Each path's own rung is its definition. */
const RUNG_NOTES: Record<string, string> = {
  'Software Engineer': TIMELINE_NOTE.slice(TIMELINE_NOTE.indexOf('(') + 1, TIMELINE_NOTE.lastIndexOf(')')),
  'AI Fundamentals': ROADMAP_SHAPE.trunk.join(' → '),
  ...Object.fromEntries(CAREER_PATHS.map((p) => [p.ladderRung, p.definition])),
  'AI Apps': `“${CAREER_PATH_BY_ID.developer.quote}”`,
  'ML/DL': ROADMAP_SHAPE.branches.engineer.slice(1, 4).join(' → '),
  'AI Systems': `${ROADMAP_SHAPE.converge}: ${CAREER_PATH_BY_ID.engineer.goal}`,
};

export default function FinaleOverlay() {
  const open = useUi((s) => s.mode === 'menu' && s.menu === 'finale');
  if (!open) return null;
  return <FinaleCard />;
}

function FinaleCard() {
  const hat = useProgress((s) => hatColor(s.byteHat));
  // Subscribe to stable slices; derive the rest (selectors must not return fresh objects).
  const badges = useProgress((s) => s.badges);
  useProgress((s) => s.gems);
  useProgress((s) => s.projects);
  const summary = certificateSummary(useProgress.getState());
  const earned: Record<string, boolean> = {
    'Software Engineer': !!badges['code-village'],
    'AI Fundamentals': !!badges['math-mountain'] && !!badges['ml-meadow'],
    ...Object.fromEntries(CAREER_PATHS.map((p) => [p.ladderRung, pathComplete({ badges }, p.id)])),
  };
  const [climbed, setClimbed] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const done = climbed >= CAREER_LADDER.length;
  const pathText =
    summary.paths.length === PATH_TRACKS.length
      ? 'You completed every path!'
      : summary.paths.length > 0
        ? `You completed the ${summary.paths.map((t) => TRACK_LABELS[t]).join(' and the ')}.`
        : `You have ${summary.badges} of ${PHASE_IDS.length} badges.`;

  return (
    <Sheet
      label="You reached the Summit"
      title="You reached the Summit! 🎉"
      icon={<span className="text-2xl" aria-hidden>🏔</span>}
      tint="#fff1c4"
      onClose={resumeExplore}
      footer={
        <>
          <PillButton onClick={resumeExplore} className="flex-1">
            Keep exploring
          </PillButton>
          <PillButton onClick={() => useUi.getState().openMenu('certificate')} color="#ffc93c" className="flex-1">
            🎓 Get your certificate
          </PillButton>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <ByteAvatar size={72} hat={hat} className="shrink-0" />
        <div className="min-w-0 flex-1 rounded-2xl border-[3px] bg-white px-3 py-2 text-[15px] leading-snug font-semibold" style={{ borderColor: INK }}>
          <div className="text-[11px] font-extrabold tracking-wide uppercase" style={{ color: TRACK_COLORS.meta.dark }}>
            Byte
          </div>
          <p>
            Every layer of a production AI system, assembled: that&apos;s the Summit. {pathText} {summary.stars} stars, {summary.gems} gems.
          </p>
          <p className="mt-1.5">{ENTRY_POINT_NOTE}</p>
          <p className="mt-1.5 opacity-80">{BUILD_ADVICE}</p>
        </div>
      </div>

      <section className="mt-4" aria-label="Career ladder">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-xs font-extrabold tracking-wider uppercase opacity-60">The career ladder</h3>
          <span className="text-xs font-bold opacity-60">Tap a rung to read it</span>
        </div>
        <ol className="flex flex-col-reverse gap-0" aria-live="polite">
          {CAREER_LADDER.map((row, i) => {
            const shown = i < climbed;
            return (
              <li key={row.join('|')} className={`relative flex flex-col items-stretch ${shown ? 'animate-[drop-in_400ms_cubic-bezier(.2,1.4,.5,1)]' : ''}`}>
                {/* Rails */}
                <div className="flex min-h-14 items-center gap-2 border-x-[6px] px-2 py-1.5" style={{ borderColor: '#c99363' }}>
                  {shown ? (
                    row.map((label) => {
                      const ok = earned[label];
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setPicked(picked === label ? null : label)}
                          aria-pressed={picked === label}
                          className="relative min-h-11 min-w-0 flex-1 rounded-xl border-[3px] px-2 py-1 text-center text-sm leading-tight font-extrabold"
                          style={{ borderColor: INK, background: rungColor(label, '#ffffff'), boxShadow: picked === label ? `0 3px 0 ${INK}` : undefined }}
                        >
                          {label}
                          {ok && (
                            <span className="absolute -top-2 -right-1.5 rounded-full border-2 bg-[#7fd99a] px-1 text-[10px] font-black" style={{ borderColor: INK }} title="You've earned this rung">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <span className="flex-1 text-center text-sm font-bold opacity-30">?</span>
                  )}
                </div>
                {i < CAREER_LADDER.length - 1 && <div className="mx-1.5 h-2 border-x-[6px]" style={{ borderColor: '#c99363', background: 'repeating-linear-gradient(90deg, transparent 0 8px, #c9936340 8px 10px)' }} aria-hidden />}
              </li>
            );
          })}
        </ol>
        {picked && (
          <p className="mt-2 rounded-2xl border-[3px] bg-white px-3 py-2 text-sm font-semibold" style={{ borderColor: INK }}>
            <b>{picked}:</b> {RUNG_NOTES[picked] ?? 'The road ahead: keep building projects as you grow into it.'}
          </p>
        )}
        <div className="mt-2 flex justify-center">
          <PillButton onClick={() => setClimbed((n) => Math.min(CAREER_LADDER.length, n + 1))} disabled={done} color={TRACK_COLORS.meta.light}>
            {done ? 'Top of the ladder: AI Architect / Lead' : 'Climb ↑'}
          </PillButton>
        </div>
      </section>
    </Sheet>
  );
}
