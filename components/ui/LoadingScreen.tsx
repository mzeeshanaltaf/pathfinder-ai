import Logo from './Logo';

/**
 * Full-screen pastel loading card, shared by the page-level dynamic import (no progress yet)
 * and the in-game world load (`progress` 0–100 + a stage line).
 */
export default function LoadingScreen({ fading = false, progress, stage }: { fading?: boolean; progress?: number; stage?: string }) {
  const known = typeof progress === 'number';
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-200 via-sky-100 to-violet-100 px-6 transition-opacity duration-500 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="progressbar"
      aria-label="Loading Pathfinder AI"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={known ? Math.round(progress) : undefined}
    >
      <Logo size={128} />
      <div className="text-center">
        <div className="text-3xl font-extrabold tracking-tight text-[#3d3452]">Pathfinder AI</div>
        <div className="text-sm font-semibold text-[#3d3452]/60">Find your path into AI.</div>
      </div>
      <div className="h-4 w-64 max-w-full overflow-hidden rounded-full border-[3px] border-[#3d3452] bg-white">
        {known ? (
          <div className="h-full rounded-full bg-[#b9a3ee] transition-[width] duration-300" style={{ width: `${Math.max(4, Math.min(100, progress))}%` }} />
        ) : (
          <div className="h-full w-1/3 animate-[loading-slide_1.2s_ease-in-out_infinite] rounded-full bg-[#b9a3ee]" />
        )}
      </div>
      <div className="text-sm font-semibold text-[#3d3452]/60">{stage ?? 'Floating the islands into place…'}</div>
    </div>
  );
}
