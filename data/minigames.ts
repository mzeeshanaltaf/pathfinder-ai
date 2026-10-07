// Mini-game per phase. Source of truth for every item: docs/AI Engineer-Developer.md.
// Items are either taken from the doc or are scenarios that apply one of its topics;
// every graded item carries a short explanation so a wrong answer still teaches.
//
// Seven phases use the reusable engines (pipeline-order, sort-bins, quiz, tutorial). The other
// thirteen use the bespoke concept simulations; their configs and content live in data/sims.ts.

import { CAREER_PATH_BY_ID, ENTRY_POINT_NOTE, PHASES, type PhaseId, type Track } from '@/data/roadmap';
import {
  ATTENTION_BEAMS,
  BATCHING,
  CHUNK_RETRIEVE,
  CURVE_FIT,
  DRIFT_WATCH,
  FINAL_ASSEMBLY,
  FIT_THE_GPU,
  GRADIENT_DESCENT,
  INJECTION_HARD,
  INJECTION_NORMAL,
  PERCEPTRON,
  RANK_IT,
  TEMPERATURE,
} from '@/data/sims';

/** Engines built in Phase 3. */
export type EngineId = 'tutorial' | 'pipeline-order' | 'sort-bins' | 'quiz';
/** Bespoke concept simulations built in Phase 4 (components/minigames/sims/). */
export type SimId =
  | 'gradient-descent'
  | 'curve-fit'
  | 'temperature'
  | 'chunk-retrieve'
  | 'injection-defense'
  | 'perceptron'
  | 'attention-beams'
  | 'fit-the-gpu'
  | 'rank-it'
  | 'batching'
  | 'drift-watch'
  | 'final-assembly';
export type MiniGameId = EngineId | SimId;

export interface PipelineOrderConfig {
  /** Steps in the correct order. A step containing " | " is one card of parallel parts. */
  steps: string[];
  /** Cards that don't belong in the pipeline. */
  distractors?: string[];
  /** Why each distractor doesn't belong (keyed by distractor text). */
  distractorWhy?: Record<string, string>;
  /** The last step feeds back into the first; any rotation of the cycle is accepted. */
  loop?: boolean;
  /** Shown once the pipeline is correct. */
  explain: string;
}

export interface SortBinsConfig {
  bins: { id: string; label: string }[];
  items: { text: string; bin: string; why: string }[];
  timed?: boolean;
  /** Seconds per item when timed (default 15). */
  seconds?: number;
}

export interface QuizOption {
  text: string;
  correct?: boolean;
  /** Personality mode: score added when picked (negative = Developer, positive = Engineer). */
  weight?: number;
}

export interface QuizOutcome {
  /** Picked when the total weight is within [min, max] (either bound optional). */
  min?: number;
  max?: number;
  title: string;
  text: string;
  track: Track;
}

export interface QuizConfig {
  questions: { q: string; options: QuizOption[]; explain: string }[];
  mode: 'graded' | 'personality';
  outcomes?: QuizOutcome[];
}

export type TutorialConfig = Record<string, never>;

export interface MiniGameDef<C = unknown> {
  id: MiniGameId;
  title: string;
  /** One-paragraph "How to play". */
  howTo: string;
  config: C;
  /** 1–3 topic ids (from the same phase) shown as "What you learned". */
  recapTopicIds: string[];
}

const pipeline = (title: string, howTo: string, config: PipelineOrderConfig, recapTopicIds: string[]): MiniGameDef<PipelineOrderConfig> => ({
  id: 'pipeline-order',
  title,
  howTo,
  config,
  recapTopicIds,
});
const sortBins = (title: string, howTo: string, config: SortBinsConfig, recapTopicIds: string[]): MiniGameDef<SortBinsConfig> => ({
  id: 'sort-bins',
  title,
  howTo,
  config,
  recapTopicIds,
});
const quiz = (title: string, howTo: string, config: QuizConfig, recapTopicIds: string[]): MiniGameDef<QuizConfig> => ({
  id: 'quiz',
  title,
  howTo,
  config,
  recapTopicIds,
});

const sim = <C>(id: SimId, title: string, howTo: string, config: C, recapTopicIds: string[]): MiniGameDef<C> => ({
  id,
  title,
  howTo,
  config,
  recapTopicIds,
});

const PIPELINE_HOWTO =
  'Tap the cards in the tray to drop them into the pipeline, or drag them into a slot. Tap a placed card to send it back. Not every card belongs! When every slot is filled, press Check. Correct steps lock in place. Solve it on the first try for 3 stars.';

export const MINIGAMES: Record<PhaseId, MiniGameDef> = {
  // ------------------------------------------------------------------ Harbor
  harbor: {
    id: 'tutorial',
    title: 'First Steps',
    howTo:
      'Byte wants to check that you know your way around before you set off. Turn around, jump once, then open your Skill Passport. Do all three to earn your very first badge.',
    config: {},
    recapTopicIds: ['shared-foundation', 'production-ai-systems'],
  },

  // ------------------------------------------------------------ Code Village
  'code-village': pipeline(
    'Ship the Task API',
    PIPELINE_HOWTO,
    {
      steps: PHASES['code-village'].project!.pipeline,
      distractors: ['Redis', 'LLM'],
      distractorWhy: {
        Redis: 'Redis caching comes later, in the AI Developer path\'s Production AI SaaS. The Task API doesn\'t need it.',
        LLM: 'There\'s no AI in this first project. It is about solid foundations: an API, a database and a container.',
      },
      explain: 'A client calls your FastAPI app, which stores tasks in PostgreSQL, and Docker packages it all so it runs the same everywhere.',
    },
    ['rest-apis', 'basic-postgresql', 'docker-fundamentals'],
  ),

  // ------------------------------------------------------------ Math Mountain
  'math-mountain': sim(
    'gradient-descent',
    'Roll to the Bottom',
    'Training a model means walking downhill on its loss. Pick a learning rate (the step size), then press Step or Run. Each step moves the ball by −learning rate × slope. Too small crawls, too big bounces or flies off. Reach the deepest valley in both rounds using as few steps as you can (10 or fewer in total for 3 stars).',
    GRADIENT_DESCENT,
    ['gradients', 'optimization', 'chain-rule'],
  ),

  // ------------------------------------------------------------ ML Meadow
  'ml-meadow': sim(
    'curve-fit',
    'Fit the Field',
    'Fit a curve to the filled training points by choosing the polynomial degree, then watch the error bars. Hollow points are held-out validation data the model never trains on. Lock in the degree with the lowest validation error. Then tame a wiggly degree-9 curve with regularisation. Get both right first time for 3 stars.',
    CURVE_FIT,
    ['overfitting', 'underfitting', 'bias-variance'],
  ),

  // ------------------------------------------------------------ The Fork
  fork: quiz(
    'Which path fits you?',
    "There are no wrong answers here. Pick whatever sounds most like you, and see which path suits you best. Remember the doc's advice: you don't have to choose yet.",
    {
      mode: 'personality',
      questions: [
        {
          q: 'What excites you most?',
          options: [
            { text: 'Shipping a product that people actually use', weight: -2 },
            { text: 'Understanding how the models work inside', weight: 2 },
            { text: 'Honestly, both', weight: 0 },
          ],
          explain: 'Product Development: AI Developer ★★★★★, AI Engineer ★★★★. Deep Learning: AI Developer ★★, AI Engineer ★★★★★.',
        },
        {
          q: 'A new model has just been released. What do you do first?',
          options: [
            { text: 'Try its API in a quick app idea', weight: -2 },
            { text: 'Read how it was trained and evaluated', weight: 2 },
            { text: 'A bit of both', weight: 0 },
          ],
          explain: 'AI Developers build with existing models and APIs. AI Engineers understand the underlying ML/LLM technology.',
        },
        {
          q: 'How do you feel about mathematics?',
          options: [
            { text: "I'd rather keep it light", weight: -2 },
            { text: 'I enjoy it and want to go deep', weight: 2 },
            { text: "I'll learn what I need, when I need it", weight: 0 },
          ],
          explain: 'Mathematics: AI Developer ★★, AI Engineer ★★★★★. Both still need enough maths to understand ML.',
        },
        {
          q: 'Which project sounds the most fun?',
          options: [
            { text: 'A production AI SaaS with streaming, auth and caching', weight: -2 },
            { text: 'Fine-tuning an open-source model with LoRA', weight: 2 },
            { text: 'A research agent that uses tools', weight: 0 },
          ],
          explain: 'Fine-tuning: AI Developer ★★, AI Engineer ★★★★. Agents: ★★★★★ for both paths.',
        },
        {
          q: 'Your dream problem at work?',
          options: [
            { text: '"We need an AI assistant for our company documents." Make it real.', weight: -2 },
            { text: 'Serve twice as many users on the same GPUs', weight: 2 },
            { text: 'Not sure yet', weight: 0 },
          ],
          explain: 'Turning that assistant into a working production app is the AI Developer goal. Model Serving: AI Developer ★★, AI Engineer ★★★★★.',
        },
        {
          q: 'How soon do you want your first AI role?',
          options: [
            { text: 'As soon as I can', weight: -1 },
            { text: "I'm happy with a longer runway", weight: 1 },
            { text: "No rush, I'm exploring", weight: 0 },
          ],
          explain: 'Roughly 9–12 months for AI Developer and 12–18 months for AI Engineer. Projects matter more than the calendar.',
        },
      ],
      outcomes: [
        {
          max: -5,
          title: '🟢 AI Developer',
          text: `“${CAREER_PATH_BY_ID.developer.quote}” You'd be excellent at ${CAREER_PATH_BY_ID.developer.excellentAt.join(' + ')}.`,
          track: 'developer',
        },
        {
          min: 5,
          title: '🔵 AI Engineer',
          text: `“${CAREER_PATH_BY_ID.engineer.quote}” You'd be excellent at ${CAREER_PATH_BY_ID.engineer.excellentAt.join(' + ')}.`,
          track: 'engineer',
        },
        {
          title: '🟢→🔵 Start as a Developer, grow into an Engineer',
          text: ENTRY_POINT_NOTE,
          track: 'meta',
        },
      ],
    },
    ['ai-developer-goal', 'ai-engineer-goal', 'no-need-to-choose-yet'],
  ),

  // ------------------------------------------------------------ LLM Lighthouse
  'dev-llm-lighthouse': sim(
    'temperature',
    'Turn the Dial',
    'An LLM picks the next token from a probability distribution. Move the temperature and top-p sliders to reshape it, then press Sample ×10 to see what the model would write. Complete the three tasks before your samples run out: one star per task.',
    TEMPERATURE,
    ['temperature', 'top-p', 'hallucination'],
  ),

  // ------------------------------------------------------------ Prompt Workshop
  'dev-prompt-workshop': sortBins(
    'Prompt Fixer',
    'A teammate is sharing their prompting habits. Sort each one: good practice or anti-pattern? Tap the bin, or drag the card onto it. 90% correct earns 3 stars.',
    {
      bins: [
        { id: 'good', label: '✅ Good practice' },
        { id: 'bad', label: '🚫 Anti-pattern' },
      ],
      items: [
        {
          text: 'Show the model a few worked examples of the format you want.',
          bin: 'good',
          why: 'Few-shot prompting: a handful of examples is often the fastest way to get the pattern you want.',
        },
        {
          text: 'Ask for output that matches a JSON Schema.',
          bin: 'good',
          why: 'Structured outputs give your code a fixed, machine-readable shape it can rely on.',
        },
        {
          text: "Validate the model's JSON with Pydantic before using it.",
          bin: 'good',
          why: 'Never trust LLM output blindly. Pydantic checks the data against your model and catches bad responses.',
        },
        {
          text: 'Keep prompts in templates with placeholders like {question}.',
          bin: 'good',
          why: 'Prompt templates make prompts reusable and keep user input separate from your instructions.',
        },
        {
          text: 'Version your prompts so you can compare them and roll back.',
          bin: 'good',
          why: 'Prompt versioning treats prompts like code: tracked, tested and reversible.',
        },
        {
          text: "Put the assistant's role and rules in the system instructions.",
          bin: 'good',
          why: 'System instructions set the role, rules and tone for the whole conversation.',
        },
        {
          text: 'Results are bad, so keep adding more and more text to the prompt.',
          bin: 'bad',
          why: 'Endlessly making prompts longer is one of the doc\'s "what doesn\'t work" items. Fix the structure, examples or code instead.',
        },
        {
          text: 'Calculate refunds and discounts inside the prompt instead of in code.',
          bin: 'bad',
          why: "Business logic doesn't belong entirely inside prompts. Let the LLM return structured data, and let code apply the rules.",
        },
        {
          text: "Write the LLM's answer straight into the customer database, unchecked.",
          bin: 'bad',
          why: 'Trusting LLM output without validation is an anti-pattern. Validate first, then act.',
        },
        {
          text: "Encode every one of the company's pricing rules as prompt instructions.",
          bin: 'bad',
          why: 'Pricing rules are business logic. Keep them in code, where they can be tested, and keep the prompt focused.',
        },
        {
          text: 'Assume the reply is always valid JSON, so skip error handling.',
          bin: 'bad',
          why: 'Models can return malformed or unexpected output. Parse, validate and handle failures.',
        },
        {
          text: 'A six-page prompt that grew one patch at a time.',
          bin: 'bad',
          why: 'Longer prompts are not better prompts. A huge, patched prompt is hard to test and version.',
        },
      ],
    },
    ['few-shot-prompting', 'structured-outputs', 'pydantic'],
  ),

  // ------------------------------------------------------------ RAG Library
  'dev-rag-library': sim(
    'chunk-retrieve',
    'Chunk & Retrieve',
    'Step 1: tap the gaps between sentences to cut the policy into chunks (each chunk should hold one topic). Step 2: a question arrives; pick the 3 chunks that answer it. Step 3: watch the answer and its citations come together. Stars for good chunks and precise retrieval.',
    CHUNK_RETRIEVE,
    ['chunking', 'similarity-search', 'citations'],
  ),

  // ------------------------------------------------------------ Agent HQ
  'dev-agent-hq': sortBins(
    'Tool Router',
    "You're the agent's router. For each request, pick the right tool: Web Search, RAG over company docs, the Calculator, or Ask a Human for approval. You have 15 seconds per request. 90% correct earns 3 stars.",
    {
      bins: [
        { id: 'web', label: '🌐 Web Search' },
        { id: 'rag', label: '📚 RAG' },
        { id: 'calc', label: '🧮 Calculator' },
        { id: 'human', label: '🙋 Ask Human' },
      ],
      timed: true,
      seconds: 15,
      items: [
        {
          text: 'What did the news say about our competitor this morning?',
          bin: 'web',
          why: "Fresh public information isn't in your documents or the model's training data. Search the web.",
        },
        {
          text: "What's the latest stable version of this open-source library?",
          bin: 'web',
          why: 'Release info changes constantly and lives on the public web.',
        },
        {
          text: "What's today's weather in Paris?",
          bin: 'web',
          why: 'Live, public data. The model has a knowledge cut-off; the web does not.',
        },
        {
          text: 'What does our internal refund policy say?',
          bin: 'rag',
          why: 'Private company documents are exactly what RAG retrieves from.',
        },
        {
          text: 'Summarise our Q3 planning doc.',
          bin: 'rag',
          why: 'An internal document: retrieve it from the knowledge base and let the LLM summarise it.',
        },
        {
          text: 'Which pages of the employee handbook mention remote work?',
          bin: 'rag',
          why: 'Searching your own documents and citing the pages is a RAG job.',
        },
        {
          text: 'What is 17.5% of 2,340?',
          bin: 'calc',
          why: 'LLMs can slip on exact maths. Tool calling hands the arithmetic to code that gets it right.',
        },
        {
          text: 'Add up these 48 invoice totals exactly.',
          bin: 'calc',
          why: 'Exact arithmetic over many numbers belongs in a tool, not in next-token prediction.',
        },
        {
          text: 'Compound interest on $5,000 at 4% for 7 years?',
          bin: 'calc',
          why: 'A precise formula: the calculator tool computes it; the LLM explains it.',
        },
        {
          text: "Refund $1,200 to a customer's card.",
          bin: 'human',
          why: 'Spending money is a risky action. Pause for human approval.',
        },
        {
          text: "Permanently delete a user's account.",
          bin: 'human',
          why: "Irreversible actions need a person to approve them first.",
        },
        {
          text: 'Email all 10,000 customers about a price change.',
          bin: 'human',
          why: 'Sending email at scale is high-risk and hard to undo. Get human approval.',
        },
      ],
    },
    ['tool-calling', 'routing', 'human-approval'],
  ),

  // ------------------------------------------------------------ App Factory
  'dev-app-factory': pipeline(
    'Assemble the AI SaaS',
    PIPELINE_HOWTO,
    {
      steps: PHASES['dev-app-factory'].project!.pipeline,
      distractors: ['Model Registry', 'Inference Server'],
      distractorWhy: {
        'Model Registry': 'A model registry is MLOps territory (AI Engineer path). This SaaS calls an existing LLM.',
        'Inference Server':
          "Self-hosting models on GPUs is model serving, an AI Engineer skill. An AI Developer doesn't need deep GPU optimisation.",
      },
      explain:
        'A Next.js frontend talks to a FastAPI backend. AI orchestration calls the LLM, PostgreSQL stores the app data, pgvector adds vector search, and Redis handles caching and background work.',
    },
    ['api-design', 'caching', 'multi-tenancy'],
  ),

  // ------------------------------------------------------------ Shield Fort
  'dev-shield-fort': sim(
    'injection-defense',
    'Hold the Gate',
    'Messages are marching towards your AI assistant. Tap a card (or swipe it away) to block it, or press Allow to let a safe one straight through. Block the attacks, let the safe ones in. Anything that reaches the gate gets in! It speeds up as you go. 90% correct earns 3 stars.',
    INJECTION_NORMAL,
    ['prompt-injection', 'jailbreaks', 'tenant-isolation'],
  ),

  // ------------------------------------------------------------ Neural Garden
  'eng-neural-garden': sim(
    'perceptron',
    'Draw the Line',
    'A perceptron splits the plane with one straight line: w1·x + w2·y + b = 0. Move the three sliders until every orange point is on the orange side and every blue point on the blue side. Do two gardens quickly, then face a tricky third one. Speed and a good guess earn the stars.',
    PERCEPTRON,
    ['perceptrons', 'activation-functions', 'neural-networks'],
  ),

  // ------------------------------------------------------------ Transformer Tower
  'eng-transformer-tower': sim(
    'attention-beams',
    'Follow the Beams',
    'In each sentence one word is highlighted. Tap the word you think it pays the most attention to, then watch the attention beams light up. 5 rounds, including one with a causal mask. Finally, watch how an LLM generates text one token at a time. 5 out of 5 for 3 stars.',
    ATTENTION_BEAMS,
    ['self-attention', 'causal-attention', 'autoregressive-generation'],
  ),

  // ------------------------------------------------------------ Model Forge
  'eng-model-forge': sim(
    'fit-the-gpu',
    'Fit the GPU',
    'Three jobs, each with a GPU memory limit and a quality bar. Choose the fine-tuning method (full, LoRA or QLoRA) and the precision (FP16, INT8 or 4-bit), watch the memory bar, then press Launch. Earn a star for each job you launch first time with the best quality that still fits.',
    FIT_THE_GPU,
    ['lora', 'qlora', 'quantization'],
  ),

  // ------------------------------------------------------------ Deep Archive
  'eng-deep-archive': sim(
    'rank-it',
    'Rerank the Archive',
    'A first-stage retriever found 6 passages for a query, in a so-so order. Be the reranker: read each passage and drag it (or use the arrows) into the best order. Recall@3, MRR and NDCG update live. Submit once NDCG reaches 0.80. Stars by your NDCG over two queries.',
    RANK_IT,
    ['reranking', 'mrr', 'ndcg'],
  ),

  // ------------------------------------------------------------ Clockwork Keep
  'eng-clockwork-keep': pipeline(
    'Wind the Agent Loop',
    'Arrange the gears of the agent loop. Tap the cards in the tray, or drag them into a slot. It is a loop, so the last step feeds back into the first. Not every card belongs! Press Check when every slot is filled. Solve it on the first try for 3 stars.',
    {
      steps: ['Planner', 'Executor', 'Tools', 'State'],
      distractors: ['Load Balancer', 'Model Registry', 'Tokenizer'],
      distractorWhy: {
        'Load Balancer': 'A load balancer belongs to model serving, not to the agent loop.',
        'Model Registry': 'A model registry is part of MLOps: it tracks model versions, not agent steps.',
        Tokenizer: "A tokenizer lives inside the LLM. It isn't a stage of the agent loop.",
      },
      loop: true,
      explain:
        'The planner decides the next step, the executor carries it out by calling tools, and the results update the state, which feeds back into the planner until the goal is met.',
    },
    ['agent-state', 'planning', 'tool-selection'],
  ),

  // ------------------------------------------------------------ GPU Plant
  'eng-gpu-plant': sim(
    'batching',
    'Rush Hour',
    'Traffic ramps up to a rush hour. Choose how many GPUs to rent, the max batch size and how long to wait for a batch to fill, then press Run. Serve every request with p95 latency under the 500 ms SLA. Do it on 1 GPU for 3 stars, 2 GPUs for 2.',
    BATCHING,
    ['batching', 'gpu-memory', 'inference-optimization'],
  ),

  // ------------------------------------------------------------ MLOps Conveyor
  'eng-mlops-conveyor': sim(
    'drift-watch',
    'Drift Watch',
    'Watch the live dashboard as days go by. When the incoming data drifts away from the training data, press Trigger retraining: too early wastes compute, too late lets accuracy fall below the 85% target. Then rebuild the retraining loop in the right order.',
    DRIFT_WATCH,
    ['drift-detection', 'monitoring', 'model-registry'],
  ),

  // ------------------------------------------------------------ Security Citadel
  'eng-security-citadel': sim(
    'injection-defense',
    'Citadel Siege',
    'The hard version of the Shield Fort, and faster. Inputs now arrive from web pages, retrieved documents, emails and your own agent\'s plans. Block indirect injections, data exfiltration and excessive agency, and let safe inputs and actions through. 90% correct earns 3 stars.',
    INJECTION_HARD,
    ['indirect-prompt-injection', 'data-exfiltration', 'excessive-agency'],
  ),

  // ------------------------------------------------------------ Summit
  summit: sim(
    'final-assembly',
    'Assemble the Platform',
    "Rebuild the doc's production AI architecture, layer by layer. Drag each component into its layer, or tap a component and then tap a slot. Tap a placed component to send it back. When every slot is full, press Check. Get it right first time for 3 stars.",
    FINAL_ASSEMBLY,
    ['ai-orchestration', 'evaluation-tracing', 'monitoring'],
  ),
};

// Dev-only sanity check: recap topics must exist, and every graded item must explain itself.
if (process.env.NODE_ENV !== 'production') {
  for (const [id, def] of Object.entries(MINIGAMES) as [PhaseId, MiniGameDef][]) {
    const topicIds = new Set(PHASES[id].groups.flatMap((g) => g.topics.map((t) => t.id)));
    for (const t of def.recapTopicIds) if (!topicIds.has(t)) throw new Error(`minigames: ${id} recap topic "${t}" not found`);
    if (def.id === 'sort-bins') {
      const c = def.config as SortBinsConfig;
      const bins = new Set(c.bins.map((b) => b.id));
      for (const it of c.items) if (!bins.has(it.bin) || !it.why) throw new Error(`minigames: ${id} bad item "${it.text}"`);
    }
    if (def.id === 'pipeline-order') {
      const c = def.config as PipelineOrderConfig;
      for (const d of c.distractors ?? []) if (!c.distractorWhy?.[d]) throw new Error(`minigames: ${id} distractor "${d}" has no why`);
    }
    if (def.id === 'quiz') {
      const c = def.config as QuizConfig;
      for (const q of c.questions)
        if (!q.explain || (c.mode === 'graded' && q.options.filter((o) => o.correct).length !== 1))
          throw new Error(`minigames: ${id} bad question "${q.q}"`);
    }
  }
}
