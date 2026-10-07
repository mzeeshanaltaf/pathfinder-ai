'use client';

import { requestTravel } from '@/components/player/playerState';
import { getPhase } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { hatColor, suggestedNext } from '@/lib/progress';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import ByteAvatar from './ByteAvatar';
import { INK, resumeExplore, usePhaseGems } from './kit';
import { sessionInfo } from './SessionManager';
import Sheet, { PillButton } from './Sheet';

/** Returning visits: where you left off, your streak, and a one-tap balloon to the suggested next island. */
export default function WelcomeBack() {
  const open = useUi((s) => s.mode === 'menu' && s.menu === 'welcome');
  if (!open) return null;
  return <WelcomeCard />;
}

function WelcomeCard() {
  const last = useProgress((s) => s.lastIsland);
  const name = useProgress((s) => s.playerName.trim());
  const streak = useProgress((s) => s.streak.count);
  const hat = useProgress((s) => hatColor(s.byteHat));
  const next = useProgress((s) => suggestedNext(s));
  const { found, total } = usePhaseGems(last);
  const lastPhase = getPhase(last);
  const nextPhase = next ? getPhase(next) : null;
  const goesSomewhere = !!next && next !== last;
  const grew = sessionInfo.streakAfter > sessionInfo.streakBefore && streak > 1;

  const go = () => {
    if (goesSomewhere) requestTravel(next);
    resumeExplore();
  };

  return (
    <Sheet
      label="Welcome back"
      title={`Welcome back${name ? `, ${name}` : ''}!`}
      icon={<span className="text-2xl" aria-hidden>👋</span>}
      footer={
        <>
          <PillButton onClick={resumeExplore} className="flex-1">
            Explore freely
          </PillButton>
          <PillButton onClick={go} color={nextPhase ? TRACK_COLORS[nextPhase.track].base : '#7fd99a'} className="flex-1">
            {goesSomewhere ? `🎈 Continue to ${nextPhase!.title}` : 'Continue ▶'}
          </PillButton>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <ByteAvatar size={72} hat={hat} className="shrink-0" />
        <div className="min-w-0 flex-1 rounded-2xl border-[3px] bg-white px-3 py-2" style={{ borderColor: INK }}>
          <p className="text-[15px] leading-snug font-semibold">
            Last time you were at <b>{lastPhase.title}</b>, {found}/{total} gems.
          </p>
          {nextPhase && (
            <p className="mt-1 text-sm font-semibold opacity-80">
              {goesSomewhere ? (
                <>
                  Next up: <b>{nextPhase.title}</b> ({nextPhase.subtitle}). Hop in the balloon and I&apos;ll fly you there.
                </>
              ) : (
                <>Its Challenge is still waiting for you. Find the ★ pedestal by the landmark!</>
              )}
            </p>
          )}
          {!nextPhase && <p className="mt-1 text-sm font-semibold opacity-80">Every badge is yours. Explore freely, or polish those stars!</p>}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border-[3px] px-3 py-2 text-sm font-extrabold" style={{ borderColor: INK, background: '#fff6d8' }}>
        <span className="text-xl" aria-hidden>
          🔥
        </span>
        {streak}-day streak{grew ? ' (+1 today!)' : ''}
        <span className="ml-auto text-xs font-bold opacity-60">Come back tomorrow to keep it going</span>
      </div>
    </Sheet>
  );
}
