import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PhaseId } from '@/data/roadmap';
import { DEFAULT_SPAWN_ISLAND, ISLAND_BY_ID } from '@/data/world';
import { localDateKey, nextStreak } from '@/lib/progress';

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
  /** `best` (Phase 5): longest streak so far; it unlocks Byte's hats. */
  streak: { count: number; lastVisitDate: string; best: number };
  onboardingDone: boolean;
  settings: Settings;
  /** Phase 5: achievement id → ISO date unlocked. */
  achievements: Record<string, string>;
  /** Phase 5: name typed for the certificate (stored locally only). */
  playerName: string;
  /** Phase 5: Byte's hat (an id from BYTE_HATS). */
  byteHat: string;
  /** Phase 5: the Summit celebration has played once. */
  finaleSeen: boolean;
}

interface ProgressActions {
  /** Player is standing on an island: move the checkpoint there and mark it visited. */
  reachIsland: (id: PhaseId) => void;
  /** Returns true if the gem was newly collected. */
  collectGem: (id: string) => boolean;
  setProjectBuilt: (projectId: string, built: boolean) => void;
  /** Record a mini-game result, keeping the best stars. Returns the previous best (0 if none). */
  awardBadge: (id: PhaseId, stars: 1 | 2 | 3) => { prevStars: 0 | 1 | 2 | 3; best: 1 | 2 | 3 };
  /** Count today's visit. Returns the streak before and after (equal if already counted today). */
  touchStreak: () => { before: number; after: number };
  unlockAchievements: (ids: string[]) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setPlayerName: (name: string) => void;
  setByteHat: (id: string) => void;
  completeOnboarding: () => void;
  setFinaleSeen: () => void;
  /** Wipe everything except settings. */
  resetProgress: () => void;
}

export type ProgressState = ProgressData & ProgressActions;

export const PROGRESS_VERSION = 2;

const defaults = (): ProgressData => ({
  gems: {},
  badges: {},
  projects: {},
  visited: {},
  lastIsland: DEFAULT_SPAWN_ISLAND,
  checkpoint: [...ISLAND_BY_ID[DEFAULT_SPAWN_ISLAND].position],
  streak: { count: 0, lastVisitDate: '', best: 0 },
  onboardingDone: false,
  settings: { muted: false, sensitivity: 1, invertY: false, quality: 'auto' },
  achievements: {},
  playerName: '',
  byteHat: 'none',
  finaleSeen: false,
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
      collectGem: (id) => {
        if (get().gems[id]) return false;
        set((s) => ({ gems: { ...s.gems, [id]: true } }));
        return true;
      },
      setProjectBuilt: (projectId, built) => set((s) => ({ projects: { ...s.projects, [projectId]: built } })),
      awardBadge: (id, stars) => {
        const prev = get().badges[id];
        if (prev && prev.stars >= stars) return { prevStars: prev.stars, best: prev.stars };
        set((s) => ({ badges: { ...s.badges, [id]: { stars, completedAt: new Date().toISOString() } } }));
        return { prevStars: prev?.stars ?? 0, best: stars };
      },
      touchStreak: () => {
        const before = get().streak;
        const after = nextStreak(before, localDateKey());
        if (after !== before) set({ streak: after });
        return { before: before.count, after: after.count };
      },
      unlockAchievements: (ids) => {
        if (!ids.length) return;
        const at = new Date().toISOString();
        set((s) => ({ achievements: { ...s.achievements, ...Object.fromEntries(ids.map((id) => [id, at])) } }));
      },
      setSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),
      setPlayerName: (playerName) => set({ playerName: playerName.slice(0, 40) }),
      setByteHat: (byteHat) => set({ byteHat }),
      completeOnboarding: () => set({ onboardingDone: true }),
      setFinaleSeen: () => set({ finaleSeen: true }),
      resetProgress: () => set({ ...defaults(), settings: get().settings }),
    }),
    {
      name: 'pathfinder-ai-progress',
      version: PROGRESS_VERSION,
      storage: createJSONStorage(() => localStorage),
      // v1 → v2 only added fields; `merge` fills them from the defaults. The best streak starts at the current one.
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<ProgressData>;
        if (version < 2 && p.streak) p.streak = { ...p.streak, best: p.streak.best ?? p.streak.count ?? 0 };
        return p as ProgressData;
      },
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
        achievements: s.achievements,
        playerName: s.playerName,
        byteHat: s.byteHat,
        finaleSeen: s.finaleSeen,
      }),
    },
  ),
);
