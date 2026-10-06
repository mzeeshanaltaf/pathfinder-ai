import { isCoarsePointer } from '@/lib/device';

/**
 * Lock the pointer to the game canvas (desktop only). Must be called from a user gesture
 * (click / tap). If the browser refuses (e.g. Chrome's ~1 s cooldown after Esc), the
 * "Click to explore" overlay stays up and the next click tries again.
 */
export function requestGameLock() {
  if (isCoarsePointer()) return;
  const canvas = document.querySelector<HTMLCanvasElement>('#game canvas');
  if (!canvas) return;
  try {
    const result = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
    result?.catch?.(() => {});
  } catch {
    /* ignore */
  }
}
