/** Cartoon logo: a floating island with a forked path, a summit star and a hot-air balloon. */
export default function Logo({ size = 120, className = '' }: { size?: number; className?: string }) {
  const INK = '#3d3452';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      {/* Balloon */}
      <g className="animate-[float_3s_ease-in-out_infinite]">
        <path d="M86 14c10 0 17 8 17 17 0 9-8 15-12 21h-10c-4-6-12-12-12-21 0-9 7-17 17-17z" fill="#82bdf2" stroke={INK} strokeWidth="3" />
        <path d="M86 14c-4 6-5 25 0 38M86 14c4 6 5 25 0 38" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.8" />
        <rect x="81" y="56" width="10" height="7" rx="2" fill="#e9c79a" stroke={INK} strokeWidth="2.5" />
        <path d="M82 52l0 4M90 52l0 4" stroke={INK} strokeWidth="2" />
      </g>
      {/* Island */}
      <path d="M14 74h76l-10 12-14 16-12 8-10-8-16-14z" fill="#b4abc4" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M12 68c0-4 3-6 7-6h66c4 0 7 2 7 6v4c0 3-2 5-5 5H17c-3 0-5-2-5-5z" fill="#8ad466" stroke={INK} strokeWidth="3.5" />
      {/* Forked path: trunk, then green (Developer) and blue (Engineer) */}
      <path d="M52 76l0-10" stroke="#ffc078" strokeWidth="5" strokeLinecap="round" />
      <path d="M52 66l-14-6" stroke="#45b06a" strokeWidth="5" strokeLinecap="round" />
      <path d="M52 66l14-6" stroke="#4b8fd6" strokeWidth="5" strokeLinecap="round" />
      {/* Summit star */}
      <path d="M52 28l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#ffc93c" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M52 59v-2" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
