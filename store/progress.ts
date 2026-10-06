import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PhaseId } from '@/data/roadmap';
import { DEFAULT_SPAWN_ISLAND, ISLAND_BY_ID } from '@/data/world';

export interface Badge {
  stars: 1 | 2 | 3;
  completedAt: string;
}

export interface Settings {
  muted: boolean;
  sensitivity: number;
  invertY: boolean;
  quality: 'auto' | 'low' | 'high';
}

export interface ProgressData {
  gems: Record<string, true>;
  badges: Partial<Record<PhaseId, Badge>>;
  projects: Record<string, boolean>;
  visited: Partial<Record<PhaseId, true>>;
  lastIsland: PhaseId;
  checkpoint: [number, number, number];
  streak: { count: number; lastVisitDate: string };
  onboardingDone: boolean;
  settings: Settings;
}

interface ProgressActions {
  /** Player is standing on an island: move the checkpoint there and mark it visited. */
  reachIsland: (id: PhaseId) => void;
}

export type ProgressState = ProgressData & ProgressActions;

export const PROGRESS_VERSION = 1;

const defaults = (): ProgressData => ({
  gems: {},
  badges: {},
  projects: {},
  visited: {},
  lastIsland: DEFAULT_SPAWN_ISLAND,
  checkpoint: [...ISLAND_BY_ID[DEFAULT_SPAWN_ISLAND].position],
  streak: { count: 0, lastVisitDate: '' },
  onboardingDone: false,
  settings: { muted: false, sensitivity: 1, invertY: false, quality: 'auto' },
});

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...defaults(),
      reachIsland: (id) => {
        const s = get();
        if (s.lastIsland === id && s.visited[id]) return;
        set({
          lastIsland: id,
          checkpoint: [...ISLAND_BY_ID[id].position],
          visited: s.visited[id] ? s.visited : { ...s.visited, [id]: true },
        });
      },
    }),
    {
      name: 'pathfinder-ai-progress',
      version: PROGRESS_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Future versions add migrations here; unknown/missing fields fall back to defaults in `merge`.
      migrate: (persisted) => persisted as ProgressData,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressData>;
        const merged: ProgressState = {
          ...current,
          ...p,
          settings: { ...current.settings, ...p.settings },
          streak: { ...current.streak, ...p.streak },
        };
        // Guard against stale ids (e.g. a renamed island) in saved data.
        if (!ISLAND_BY_ID[merged.lastIsland]) merged.lastIsland = DEFAULT_SPAWN_ISLAND;
        return merged;
      },
      partialize: (s): ProgressData => ({
        gems: s.gems,
        badges: s.badges,
        projects: s.projects,
        visited: s.visited,
        lastIsland: s.lastIsland,
        checkpoint: s.checkpoint,
        streak: s.streak,
        onboardingDone: s.onboardingDone,
        settings: s.settings,
      }),
    },
  ),
);
