'use client';

import { useState } from 'react';
import { CAREER_PATHS, DEFINITIONS, type CareerPath } from '@/data/roadmap';
import { isCoarsePointer } from '@/lib/device';
import { hatColor } from '@/lib/progress';
import { TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import ByteAvatar from './ByteAvatar';
import { RoadmapPageLink } from './RoadmapPageLinks';
import { INK, resumeExplore } from './kit';
import Sheet, { PillButton } from './Sheet';
import { TUTORIAL_STEPS } from './TutorialTracker';

const DESKTOP_KEYS: [string, string][] = [
  ['W / S  ↑ / ↓', 'Walk forward / back'],
  ['A / D  ← / →', 'Turn left / right'],
  ['Space', 'Jump'],
  ['Shift', 'Sprint'],
  ['E', 'Explore a landmark / play a Challenge'],
  ['P', 'Skill Passport'],
  ['M', 'Sound on / off'],
  ['Esc', 'Close a panel or card'],
  ['H', 'Show / hide the controls hint'],
];

const TOUCH_CONTROLS: [string, string][] = [
  ['🕹', 'Drag anywhere on the screen: up / down walks, left / right turns (push to the edge to sprint)'],
  ['JUMP', 'Jump'],
  ['E', 'Explore a landmark / play a Challenge (it pulses when one is near)'],
  ['📖', 'Skill Passport'],
];

/** Byte's speech bubble. */
function Bubble({ children }: { children: React.ReactNode }) {
  const hat = useProgress((s) => hatColor(s.byteHat));
  return (
    <div className="flex items-start gap-3">
      <ByteAvatar size={72} hat={hat} className="shrink-0" />
      <div
        className="relative min-w-0 flex-1 rounded-2xl border-[3px] bg-white px-3 py-2 text-[15px] leading-snug font-semibold"
        style={{ borderColor: INK }}
      >
        <div className="text-[11px] font-extrabold tracking-wide uppercase" style={{ color: TRACK_COLORS.meta.dark }}>
          Byte
        </div>
        {children}
      </div>
    </div>
  );
}

function CareerCard({ path }: { path: CareerPath }) {
  const c = TRACK_COLORS[path.id];
  return (
    <div className="rounded-2xl border-[3px] px-3 py-2" style={{ borderColor: INK, background: c.light }}>
      <div className="text-sm font-extrabold">
        {path.emoji} {path.label}
      </div>
      <p className="text-sm">{path.definition}</p>
      <p className="mt-1 text-sm font-bold italic" style={{ color: c.dark }}>
        “{path.quote}”
      </p>
      <RoadmapPageLink path={path} className="mt-1 inline-block text-sm" />
    </div>
  );
}

/** First visit only: Byte introduces the careers, the controls, then starts the First Steps tutorial. */
export default function Onboarding() {
  const open = useUi((s) => s.mode === 'menu' && s.menu === 'onboarding');
  if (!open) return null;
  return <OnboardingFlow />;
}

function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [touch] = useState(isCoarsePointer);

  const finish = (tutorial: boolean) => {
    useProgress.getState().completeOnboarding();
    if (tutorial) useUi.getState().setTutorial({ look: false, jump: false, passport: false });
    resumeExplore();
  };

  const dots = (
    <div className="flex items-center justify-center gap-1.5 pb-1" aria-label={`Step ${step + 1} of 3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: INK, background: i === step ? INK : 'transparent' }} />
      ))}
    </div>
  );

  let body: React.ReactNode;
  let footer: React.ReactNode;
  if (step === 0) {
    body = (
      <div className="flex flex-col gap-3">
        <Bubble>Hi, I&apos;m Byte, your guide! This world maps careers in AI. Here they are in one line each:</Bubble>
        {CAREER_PATHS.map((p) => (
          <CareerCard key={p.id} path={p} />
        ))}
        <p className="text-sm font-semibold opacity-80">
          {DEFINITIONS.shared} You don&apos;t have to choose yet: every island is open from the start.
        </p>
      </div>
    );
    footer = (
      <>
        <PillButton onClick={() => finish(false)} className="flex-1">
          Skip intro
        </PillButton>
        <PillButton onClick={() => setStep(1)} color={TRACK_COLORS.meta.base} className="flex-1">
          Next ▶
        </PillButton>
      </>
    );
  } else if (step === 1) {
    const rows = touch ? TOUCH_CONTROLS : DESKTOP_KEYS;
    body = (
      <div className="flex flex-col gap-3">
        <Bubble>{touch ? 'You are on a touch screen, so here is how to get around:' : 'Here is how to get around with the keyboard:'}</Bubble>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 rounded-2xl border-[3px] bg-white p-3" style={{ borderColor: INK }}>
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="inline-block min-w-10 rounded-lg border-2 px-1.5 py-0.5 text-center text-xs font-black" style={{ borderColor: INK, background: TRACK_COLORS.meta.light }}>
                  {k}
                </kbd>
              </dt>
              <dd className="text-sm font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm font-semibold opacity-80">
          🧭 The compass at the top always points to a good next island. 🎈 Balloon docks (and the Passport) fly you anywhere.
        </p>
      </div>
    );
    footer = (
      <>
        <PillButton onClick={() => setStep(0)} className="flex-1">
          ◀ Back
        </PillButton>
        <PillButton onClick={() => setStep(2)} color={TRACK_COLORS.meta.base} className="flex-1">
          Next ▶
        </PillButton>
      </>
    );
  } else {
    body = (
      <div className="flex flex-col gap-3">
        <Bubble>Three quick checks and your first badge is yours. Then follow the compass across the bridge to Code Village!</Bubble>
        <ol className="flex flex-col gap-2">
          {TUTORIAL_STEPS(touch).map((s, i) => (
            <li key={s.key} className="flex items-center gap-3 rounded-2xl border-[3px] bg-white px-3 py-2 text-sm font-bold" style={{ borderColor: INK }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-base" style={{ borderColor: INK, background: TRACK_COLORS.meta.light }} aria-hidden>
                {s.icon}
              </span>
              <span>
                {i + 1}. {s.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
    footer = (
      <>
        <PillButton onClick={() => finish(false)} className="flex-1">
          Skip tutorial
        </PillButton>
        <PillButton onClick={() => finish(true)} color="#7fd99a" className="flex-1">
          Let&apos;s go! ▶
        </PillButton>
      </>
    );
  }

  return (
    <Sheet
      label="Welcome to Pathfinder AI"
      title={
        <span className="flex flex-col">
          <span>Welcome to Pathfinder AI</span>
          <span className="text-xs font-bold opacity-70">Find your path into AI.</span>
        </span>
      }
      icon={<span className="text-2xl" aria-hidden>🏝</span>}
      footer={
        <div className="flex w-full flex-col gap-2">
          {dots}
          <div className="flex w-full flex-wrap gap-2">{footer}</div>
        </div>
      }
    >
      {body}
    </Sheet>
  );
}
