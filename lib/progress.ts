// Derived progress: what to do next, how close to job-ready, achievements, streaks.
// Pure functions over the persisted ProgressData (no store access here).

import {
  BUILD_PROJECTS,
  gemsForPhase,
  getPhase,
  PHASE_IDS,
  TIMELINES,
  trackPhases,
  type PhaseId,
  type Track,
} from '@/data/roadmap';
import type { ProgressData } from '@/store/progress';

/** A career path (every track except the shared ones). A new path is a new Track value plus its data. */
export type PathTrack = Exclude<Track, 'meta' | 'common'>;

/** Career paths in default order: the doc recommends AI Developer as the entry point. */
export const PATH_TRACKS: PathTrack[] = ['developer', 'engineer'];

/** The shared trunk, in walking order (the Harbor tutorial is part of onboarding, not the trunk). */
export const TRUNK: PhaseId[] = ['code-village', 'math-mountain', 'ml-meadow', 'fork'];

export const PATH_PHASES = Object.fromEntries(PATH_TRACKS.map((t) => [t, trackPhases(t).map((p) => p.id)])) as Record<PathTrack, PhaseId[]>;

const gemFraction = (p: Pick<ProgressData, 'gems'>, id: PhaseId) => {
  const ids = gemsForPhase(id);
  return ids.length ? ids.reduce((n, g) => n + (p.gems[g] ? 1 : 0), 0) / ids.length : 0;
};

/** Progress on one path: badges count most, gems break ties. */
export function pathScore(p: Pick<ProgressData, 'gems' | 'badges'>, track: PathTrack): number {
  return PATH_PHASES[track].reduce((n, id) => n + (p.badges[id] ? 10 : 0) + gemFraction(p, id), 0);
}

/** Paths by progress, most first; ties keep the default order (Developer first, as the doc recommends). */
export function pathsByProgress(p: Pick<ProgressData, 'gems' | 'badges'>): PathTrack[] {
  return [...PATH_TRACKS].sort((a, b) => pathScore(p, b) - pathScore(p, a));
}

/** The path the player leans towards. */
export const preferredPath = (p: Pick<ProgressData, 'gems' | 'badges'>): PathTrack => pathsByProgress(p)[0];

export const pathComplete = (p: Pick<ProgressData, 'badges'>, track: PathTrack) =>
  PATH_PHASES[track].every((id) => !!p.badges[id]);

/**
 * Suggested next island: the first trunk phase without a badge; then the next phase on the
 * path with the most progress (Developer by default); then the Summit; then the other paths.
 * Null once every badge is earned.
 */
export function suggestedNext(p: Pick<ProgressData, 'gems' | 'badges'>): PhaseId | null {
  for (const id of TRUNK) if (!p.badges[id]) return id;
  const [first, ...others] = pathsByProgress(p);
  const next = (track: PathTrack) => PATH_PHASES[track].find((id) => !p.badges[id]) ?? null;
  const onPath = next(first);
  if (onPath) return onPath;
  if (!p.badges.summit) return 'summit';
  for (const t of others) {
    const id = next(t);
    if (id) return id;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Job-ready meter

/** Which islands teach each step of the doc's timelines (same order as TIMELINES[track].steps). */
const TIMELINE_PHASES: Record<PathTrack, PhaseId[][]> = {
  developer: [
    ['code-village'],
    ['math-mountain', 'ml-meadow'],
    ['dev-llm-lighthouse', 'dev-prompt-workshop'],
    ['dev-rag-library'],
    ['dev-agent-hq'],
    ['dev-app-factory', 'dev-shield-fort', 'summit'],
  ],
  engineer: [
    ['code-village'],
    ['math-mountain', 'ml-meadow'],
    ['eng-neural-garden'],
    ['eng-transformer-tower', 'eng-model-forge'],
    ['eng-deep-archive', 'eng-clockwork-keep'],
    ['eng-model-forge', 'eng-gpu-plant'],
    ['eng-gpu-plant', 'eng-mlops-conveyor'],
    ['eng-security-citadel', 'summit'],
  ],
};

/** "Production AI: Complete SaaS" has no island of its own; it belongs to the final step of both paths. */
const FINAL_STEP_EXTRA_PROJECTS = BUILD_PROJECTS.filter((b) => !b.phaseId).map((b) => b.projectId);

/** "Months 1–2" → 2, "Month 5" → 1, "Months 16–18" → 3. */
function monthsIn(when: string): number {
  const m = when.match(/(\d+)\s*[–-]\s*(\d+)/);
  return m ? Number(m[2]) - Number(m[1]) + 1 : 1;
}

/** "~9–12 months" → [9, 12]. */
function totalRange(total: string): [number, number] {
  const m = total.match(/(\d+)\s*[–-]\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [12, 12];
}

export interface JobReadyStep {
  what: string;
  months: number;
  /** 0–1 completion of this step. */
  done: number;
  projects: { id: string; built: boolean }[];
}

export interface JobReadyEstimate {
  track: PathTrack;
  /** 0–1 overall readiness. */
  ready: number;
  /** Months remaining, scaled to the doc's range (e.g. ~9–12 months for a fresh start). */
  monthsLeft: [number, number];
  steps: JobReadyStep[];
}

/** Weight of "I built this" projects in a step that has any: projects matter more than the calendar. */
const PROJECT_WEIGHT = 0.65;

export function jobReady(p: Pick<ProgressData, 'gems' | 'badges' | 'projects'>, track: PathTrack): JobReadyEstimate {
  const timeline = TIMELINES.find((t) => t.track === track)!;
  const groups = TIMELINE_PHASES[track];
  const steps: JobReadyStep[] = timeline.steps.map((step, i) => {
    const phases = groups[i] ?? [];
    const knowledge = phases.length
      ? phases.reduce((n, id) => n + 0.5 * gemFraction(p, id) + 0.5 * ((p.badges[id]?.stars ?? 0) / 3), 0) / phases.length
      : 0;
    const projectIds = [
      ...phases.flatMap((id) => {
        const own = getPhase(id).project?.id;
        const extra = BUILD_PROJECTS.filter((b) => b.phaseId === id).map((b) => b.projectId);
        return own ? [own, ...extra] : extra;
      }),
      ...(i === timeline.steps.length - 1 ? FINAL_STEP_EXTRA_PROJECTS : []),
    ];
    const projects = [...new Set(projectIds)].map((id) => ({ id, built: !!p.projects[id] }));
    const built = projects.length ? projects.filter((x) => x.built).length / projects.length : 0;
    const done = projects.length ? (1 - PROJECT_WEIGHT) * knowledge + PROJECT_WEIGHT * built : knowledge;
    return { what: step.what, months: monthsIn(step.when), done, projects };
  });
  const total = steps.reduce((n, s) => n + s.months, 0);
  const left = steps.reduce((n, s) => n + s.months * (1 - s.done), 0) / total;
  const [lo, hi] = totalRange(timeline.total);
  return {
    track,
    ready: 1 - left,
    monthsLeft: [Math.round(left * lo * 10) / 10, Math.round(left * hi * 10) / 10],
    steps,
  };
}

if (process.env.NODE_ENV !== 'production') {
  for (const t of TIMELINES) {
    if (TIMELINE_PHASES[t.track].length !== t.steps.length) throw new Error(`jobReady: ${t.track} timeline step count mismatch`);
  }
}

// ---------------------------------------------------------------------------
// Achievements

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  text: string;
  check: (p: ProgressData) => boolean;
}

const badgeCount = (p: ProgressData) => PHASE_IDS.filter((id) => p.badges[id]).length;
const builtCount = (p: ProgressData) => Object.values(p.projects).filter(Boolean).length;
const gemCount = (p: ProgressData) => Object.keys(p.gems).length;
const visitedAny = (p: ProgressData, ids: PhaseId[]) => ids.some((id) => p.visited[id]);
const badgeAny = (p: ProgressData, ids: PhaseId[]) => ids.some((id) => p.badges[id]);

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-gem', icon: '💎', title: 'First Gem', text: 'Collect your first Skill Gem.', check: (p) => gemCount(p) >= 1 },
  {
    id: 'crossed-fork',
    icon: '🪧',
    title: 'Crossed the Fork',
    text: 'Step onto an island past the Fork.',
    check: (p) => visitedAny(p, PATH_TRACKS.flatMap((t) => PATH_PHASES[t])),
  },
  {
    id: 'both-paths',
    icon: '🔀',
    title: 'Both Paths Explored',
    text: 'Earn a badge on the Developer path and on the Engineer path.',
    check: (p) => PATH_TRACKS.every((t) => badgeAny(p, PATH_PHASES[t])),
  },
  {
    id: 'common-badges',
    icon: '🧱',
    title: 'All Common Badges',
    text: 'Earn the Code Village, Math Mountain and ML Meadow badges.',
    check: (p) => trackPhases('common').every((ph) => p.badges[ph.id]),
  },
  {
    id: 'perfectionist',
    icon: '🌟',
    title: '3★ Perfectionist',
    text: 'Earn 3 stars on 5 different islands.',
    check: (p) => PHASE_IDS.filter((id) => p.badges[id]?.stars === 3).length >= 5,
  },
  { id: 'builder', icon: '🛠', title: 'Builder', text: 'Mark 3 projects as built.', check: (p) => builtCount(p) >= 3 },
  { id: 'gem-hoarder', icon: '👑', title: 'Gem Hoarder', text: 'Collect 100 Skill Gems.', check: (p) => gemCount(p) >= 100 },
  { id: 'on-a-roll', icon: '🔥', title: 'On a Roll', text: 'Visit 3 days in a row.', check: (p) => p.streak.best >= 3 },
  {
    id: 'island-hopper',
    icon: '🗺',
    title: 'Island Hopper',
    text: 'Set foot on all 20 islands.',
    check: (p) => PHASE_IDS.every((id) => p.visited[id]),
  },
  { id: 'summit', icon: '🏔', title: 'Summit Reached', text: 'Reach the Summit.', check: (p) => !!p.visited.summit },
  {
    id: 'all-badges',
    icon: '🏆',
    title: 'Pathfinder',
    text: 'Earn every badge in the world.',
    check: (p) => badgeCount(p) === PHASE_IDS.length,
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<string, AchievementDef>;

/** Achievements whose condition holds but that aren't unlocked yet. */
export const newAchievements = (p: ProgressData) => ACHIEVEMENTS.filter((a) => !p.achievements[a.id] && a.check(p));

// ---------------------------------------------------------------------------
// Daily streak + Byte's hats

/** Local calendar date as YYYY-MM-DD. */
export function localDateKey(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return localDateKey(new Date(y, m - 1, d - 1));
}

/** The streak after a visit on `today` (consecutive local dates; a gap restarts at 1). */
export function nextStreak(streak: ProgressData['streak'], today = localDateKey()): ProgressData['streak'] {
  if (streak.lastVisitDate === today) return streak;
  const count = streak.lastVisitDate === previousDay(today) ? streak.count + 1 : 1;
  return { count, lastVisitDate: today, best: Math.max(streak.best, count) };
}

export const STREAK_MILESTONES = [3, 7, 30] as const;

export interface ByteHat {
  id: string;
  label: string;
  color: string | null;
  /** Best streak (days) that unlocks it. */
  days: number;
}

export const BYTE_HATS: ByteHat[] = [
  { id: 'none', label: 'No hat', color: null, days: 0 },
  { id: 'sunny', label: 'Sunny Yellow', color: '#ffc93c', days: 3 },
  { id: 'berry', label: 'Berry Pink', color: '#ff7eb6', days: 7 },
  { id: 'galaxy', label: 'Galaxy Purple', color: '#7b5cff', days: 30 },
];

export const hatUnlocked = (hat: ByteHat, bestStreak: number) => bestStreak >= hat.days;
export const hatColor = (id: string) => BYTE_HATS.find((h) => h.id === id)?.color ?? null;

// ---------------------------------------------------------------------------
// Certificate helpers

export interface CertificateSummary {
  paths: PathTrack[];
  badges: number;
  stars: number;
  gems: number;
  projects: number;
}

export function certificateSummary(p: ProgressData): CertificateSummary {
  return {
    paths: PATH_TRACKS.filter((t) => pathComplete(p, t)),
    badges: badgeCount(p),
    stars: PHASE_IDS.reduce((n, id) => n + (p.badges[id]?.stars ?? 0), 0),
    gems: gemCount(p),
    projects: builtCount(p),
  };
}

/** True when the player has any progress worth welcoming back. */
export const hasProgress = (p: ProgressData) => gemCount(p) > 0 || badgeCount(p) > 0 || Object.keys(p.visited).length > 1;
