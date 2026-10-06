'use client';

import { RESPAWN_FADE_MS } from '@/components/player/Player';
import { useUi } from '@/store/ui';

/** White flash used for respawns. */
export default function FadeOverlay() {
  const fading = useUi((s) => s.fading);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 bg-white transition-opacity ease-in-out"
      style={{ opacity: fading ? 1 : 0, transitionDuration: `${RESPAWN_FADE_MS}ms` }}
    />
  );
}
