import type { Metadata } from 'next';
import GameLoader from '@/components/GameLoader';
import { SITE_NAME } from '@/lib/seo';

// The game is client-only (WebGL, WASM, localStorage) and has no crawlable content of its own.
// The landing page at / carries the SEO copy, so this route stays out of the index.
export const metadata: Metadata = {
  title: `Play | ${SITE_NAME}`,
  alternates: { canonical: '/play' },
  robots: { index: false, follow: true },
};

export default function PlayPage() {
  return <GameLoader />;
}
