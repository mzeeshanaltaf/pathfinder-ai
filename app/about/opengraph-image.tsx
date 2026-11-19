// The About page sets its own `openGraph`, which drops the root share image, so it re-uses the site card here.
import Image from '../opengraph-image';
import { SHARE_SIZE } from '@/lib/shareCard';

export const alt = 'Pathfinder AI: find your path into AI. Walk AI career roadmaps across a world of floating islands.';
export const size = SHARE_SIZE;
export const contentType = 'image/png';

export default Image;
