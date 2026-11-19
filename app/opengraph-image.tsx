import { shareCard, SHARE_SIZE } from '@/lib/shareCard';

export const alt = 'Pathfinder AI: find your path into AI. Walk AI career roadmaps across a world of floating islands.';
export const size = SHARE_SIZE;
export const contentType = 'image/png';

/** Social share card for the site, generated at build time. */
export default function Image() {
  return shareCard({
    title: 'Pathfinder AI',
    tagline: 'Find your path into AI.',
    body: 'Walk the AI Developer, AI Engineer and AI FDE roadmaps across a world of floating islands. Collect skills, play challenges, reach the Summit.',
    cta: 'Start exploring free →',
  });
}
