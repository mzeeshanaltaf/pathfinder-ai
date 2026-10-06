'use client';

import { requestGameLock } from '@/lib/pointerLock';
import { useUi } from '@/store/ui';

/** Desktop "Click to explore" card. Shown whenever pointer lock is off (e.g. after Esc). */
export default function StartOverlay() {
  const visible = useUi((s) => !s.pointerLocked && s.mode === 'explore' && s.worldReady);

  if (!visible) return null;

  return (
    <div
      onClick={requestGameLock}
      className="fixed inset-0 z-20 flex cursor-pointer items-center justify-center bg-violet-950/25 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-sm rounded-3xl border-4 border-white bg-white/90 p-6 text-center shadow-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-violet-900">Pathfinder AI</h1>
        <p className="mt-1 text-sm text-violet-900/70">Find your path into AI.</p>
        <div className="mt-5 rounded-2xl bg-violet-500 px-5 py-3 text-lg font-bold text-white shadow-md">
          Click to explore
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-left text-sm text-violet-900/80">
          <dt className="font-semibold">WASD / Arrows</dt>
          <dd>Move</dd>
          <dt className="font-semibold">Mouse</dt>
          <dd>Look</dd>
          <dt className="font-semibold">Space</dt>
          <dd>Jump</dd>
          <dt className="font-semibold">Shift</dt>
          <dd>Sprint</dd>
          <dt className="font-semibold">E</dt>
          <dd>Explore a landmark</dd>
          <dt className="font-semibold">P</dt>
          <dd>Skill Passport</dd>
          <dt className="font-semibold">Esc</dt>
          <dd>Pause / free the mouse</dd>
        </dl>
      </div>
    </div>
  );
}
