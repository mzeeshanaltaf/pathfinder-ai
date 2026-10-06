/** Full-screen pastel loading card, shared by the page-level dynamic import and the in-game world load. */
export default function LoadingScreen({ fading = false }: { fading?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-sky-200 via-sky-100 to-violet-100 transition-opacity duration-500 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-3xl font-extrabold tracking-tight text-violet-900/80">Pathfinder AI</div>
      <div className="flex items-center gap-2 text-sm font-medium text-violet-900/60">
        <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-violet-400" />
        Floating the islands into place…
      </div>
    </div>
  );
}
