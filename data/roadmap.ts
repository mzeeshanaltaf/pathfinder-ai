// Roadmap content contracts. Phase 1 only defines the types and phase ids;
// the authored content (topics, bites, projects, mentors) arrives in Phase 2.

export type Track = 'meta' | 'common' | 'developer' | 'engineer';

export const PHASE_IDS = [
  'harbor',
  'code-village',
  'math-mountain',
  'ml-meadow',
  'fork',
  'dev-llm-lighthouse',
  'dev-prompt-workshop',
  'dev-rag-library',
  'dev-agent-hq',
  'dev-app-factory',
  'dev-shield-fort',
  'eng-neural-garden',
  'eng-transformer-tower',
  'eng-model-forge',
  'eng-deep-archive',
  'eng-clockwork-keep',
  'eng-gpu-plant',
  'eng-mlops-conveyor',
  'eng-security-citadel',
  'summit',
] as const;

export type PhaseId = (typeof PHASE_IDS)[number];

export interface Topic {
  id: string;
  label: string;
  /** 1–2 sentence plain-English explanation. */
  bite: string;
}

export interface TopicGroup {
  title: string;
  topics: Topic[];
}

export interface Project {
  id: string;
  title: string;
  /** Pipeline steps in doc order. */
  pipeline: string[];
}

export interface Phase {
  id: PhaseId;
  track: Track;
  docPhase?: number;
  title: string;
  subtitle: string;
  duration?: string;
  summary: string;
  groups: TopicGroup[];
  tools?: string[];
  antiPatterns?: string[];
  keyQuestion?: string;
  project?: Project;
  mentor: { name: string; lines: string[] };
}

/** Gem id = `${phaseId}:${topic.id}` */
export const gemId = (phaseId: PhaseId, topicId: string) => `${phaseId}:${topicId}`;
