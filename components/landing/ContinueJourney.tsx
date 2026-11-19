'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { PROGRESS_STORAGE_KEY } from '@/lib/storageKeys';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function readProgress(): string | null {
  try {
    return localStorage.getItem(PROGRESS_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** The island a returning player last stood on, or null for a first visit (or unreadable storage). */
function lastIsland(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const state = JSON.parse(raw)?.state;
    return state?.onboardingDone && typeof state.lastIsland === 'string' ? state.lastIsland : null;
  } catch {
    return null;
  }
}

/**
 * "Continue from <island>" for players who already have saved progress. The server and the first
 * client render show `fallback`, so hydration always matches.
 */
export default function ContinueJourney({
  titles,
  className,
  fallback = null,
  location,
}: {
  titles: Record<string, string>;
  className: string;
  fallback?: ReactNode;
  location: string;
}) {
  const raw = useSyncExternalStore(subscribe, readProgress, () => null);
  const island = lastIsland(raw);
  if (!island) return fallback;
  return (
    <Link href="/play" className={className} data-umami-event="continue-journey" data-umami-event-location={location}>
      Continue from {titles[island] ?? 'where you left off'}
    </Link>
  );
}
