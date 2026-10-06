/** True on touch-first devices (phones/tablets). Client-only: the game is never server-rendered. */
export function isCoarsePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

/** `?debug` in the URL enables the debug HUD + FPS stats; `?physics` draws colliders. */
export function hasQueryFlag(flag: string): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has(flag);
}
