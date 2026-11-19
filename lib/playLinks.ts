import type { PathId } from '@/data/roadmap';

/** Query parameter that tells the game which career path the player picked before starting (e.g. on the landing page). */
export const PLAY_PATH_PARAM = 'path';

/** Link to the game, optionally with a chosen path (`/play?path=engineer`). Type-only imports keep this client-safe. */
export const playHref = (path?: PathId | null) => (path ? `/play?${PLAY_PATH_PARAM}=${encodeURIComponent(path)}` : '/play');
