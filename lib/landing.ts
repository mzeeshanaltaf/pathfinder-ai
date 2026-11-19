import { CAREER_PATHS, PHASE_IDS, allGemIds, getPhase, shortPathLabel, trackPhases, type PathId, type PhaseId } from '@/data/roadmap';
import { MINIGAMES, quizWeights, type QuizConfig } from '@/data/minigames';
import { TRACK_COLORS } from '@/lib/palette';
import { roadmapHref } from '@/lib/seo';

/**
 * Server-side view models for the landing page (app/page.tsx). Everything is derived from the
 * roadmap registry so a new career path shows up without touching the page. The results are
 * plain serializable objects, which keeps the big data modules out of the client bundle.
 */

export interface LandingStop {
  id: PhaseId;
  title: string;
  /** Walked by this path but owned by another one (`sharedPhases`). */
  shared: boolean;
  /** Light colour of the island's own track. */
  tint: string;
}

export interface LandingPath {
  id: PathId;
  label: string;
  shortLabel: string;
  quote: string;
  definition: string;
  excellentAt: string[];
  total: string;
  islandsNote: string;
  timeline: { when: string; what: string }[];
  stops: LandingStop[];
  href: string;
  colors: { base: string; light: string; dark: string };
}

export interface LandingQuiz {
  questions: { q: string; options: { text: string; weights: Partial<Record<PathId, number>> }[] }[];
  /** Points a path needs (alone in the lead) to be suggested. */
  minToWin: number;
  /** Most points one path can collect. */
  maxPoints: number;
  /** The Fork quiz's fallback outcome, shown when no path leads. */
  fallback: { title: string; text: string };
}

const title = (id: PhaseId) => getPhase(id).title;
const stop = (id: PhaseId, shared = false): LandingStop => ({ id, title: title(id), shared, tint: TRACK_COLORS[getPhase(id).track].light });

export function landingPaths(): LandingPath[] {
  return CAREER_PATHS.map((p) => {
    const shared = p.sharedPhases ?? [];
    const own = trackPhases(p.id).map((ph) => ph.id);
    return {
      id: p.id,
      label: p.label,
      shortLabel: shortPathLabel(p),
      quote: p.quote,
      definition: p.definition,
      excellentAt: p.excellentAt,
      total: p.timeline.total,
      islandsNote: shared.length ? `${shared.length} shared + ${own.length} own islands` : `${own.length} islands after the Fork`,
      timeline: p.timeline.steps,
      stops: [...shared.map((id) => stop(id, true)), ...own.map((id) => stop(id))],
      href: roadmapHref(p),
      colors: TRACK_COLORS[p.id],
    };
  });
}

/** Islands every path walks before the Fork, and the shared destination. */
export function landingTrunk() {
  return {
    before: (['harbor', ...trackPhases('common').map((p) => p.id), 'fork'] as PhaseId[]).map((id) => stop(id)),
    summit: stop('summit'),
  };
}

export type LandingTrunk = ReturnType<typeof landingTrunk>;

/** Island titles by id, for "Continue from …" (small enough to send to the client). */
export function islandTitles(): Record<string, string> {
  return Object.fromEntries(PHASE_IDS.map((id) => [id, title(id)]));
}

export const LANDING_STATS = {
  islands: PHASE_IDS.length,
  gems: allGemIds.length,
  challenges: Object.keys(MINIGAMES).length,
};

/** How many of the Fork quiz's questions the landing page asks. */
const LANDING_QUESTION_COUNT = 3;

/**
 * A short version of the Fork's personality quiz. It keeps the first questions in which every path
 * has an option of its own, and scales the game's winning threshold to the shorter quiz.
 */
export function landingQuiz(): LandingQuiz {
  const config = MINIGAMES.fork.config as QuizConfig;
  const ownsAnOption = (q: QuizConfig['questions'][number], id: PathId) =>
    q.options.some((o) => {
      const w = quizWeights(o.weight);
      return (w[id] ?? 0) > 0 && Object.keys(w).length === 1;
    });
  const picked = config.questions.filter((q) => CAREER_PATHS.every((p) => ownsAnOption(q, p.id))).slice(0, LANDING_QUESTION_COUNT);

  const questions = picked.map((q) => ({ q: q.q, options: q.options.map((o) => ({ text: o.text, weights: quizWeights(o.weight) })) }));
  const maxFor = (qs: QuizConfig['questions']) =>
    Math.max(...CAREER_PATHS.map((p) => qs.reduce((sum, q) => sum + Math.max(0, ...q.options.map((o) => quizWeights(o.weight)[p.id] ?? 0)), 0)));

  const outcomes = config.outcomes ?? [];
  const gameMin = Math.max(1, ...outcomes.filter((o) => o.track !== 'meta').map((o) => o.min ?? 1));
  const gameMax = maxFor(config.questions);
  const maxPoints = maxFor(picked);
  const meta = outcomes.find((o) => o.track === 'meta');

  return {
    questions,
    minToWin: Math.max(1, Math.ceil((gameMin * maxPoints) / gameMax)),
    maxPoints,
    // Outcome titles start with emoji; the landing page drops them.
    fallback: {
      title: (meta?.title ?? 'Try each side first').replace(/^[^\p{L}]+/u, ''),
      text: meta?.text ?? 'Walk the trunk, then visit a few islands on each path before you choose.',
    },
  };
}
