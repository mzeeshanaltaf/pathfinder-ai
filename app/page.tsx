'use client';

import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/ui/LoadingScreen';

// The game uses window, WASM (rapier) and localStorage, so it must never be server-rendered.
const Game = dynamic(() => import('@/components/Game'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Page() {
  return <Game />;
}
