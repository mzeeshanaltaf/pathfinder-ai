// Roadmap content. Source of truth: docs/AI Engineer-Developer.md.
// Every topic, project, duration and diagram below comes from that doc; the only
// authored text is the topic `bite`s, the mentor lines and short summaries that
// paraphrase the doc's own guidance.

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
  /** Pipeline steps in doc order. A step containing " | " is a set of parallel boxes. */
  pipeline: string[];
}

/** A flow diagram from the doc that is not a project (e.g. the RAG pipeline). Same step format as `Project.pipeline`. */
export interface Diagram {
  title: string;
  steps: string[];
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
  /** Additive (Phase 2): flow diagrams shown in the Overview. */
  diagrams?: Diagram[];
}

/** Gem id = `${phaseId}:${topic.id}` */
export const gemId = (phaseId: PhaseId, topicId: string) => `${phaseId}:${topicId}`;

export const TRACK_LABELS: Record<Track, string> = {
  meta: 'Waypoint',
  common: 'Common foundation',
  developer: 'AI Developer path',
  engineer: 'AI Engineer path',
};

// ---------------------------------------------------------------------------
// Authoring helpers

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const t = (label: string, bite: string, id = slug(label)): Topic => ({ id, label, bite });
const g = (title: string, ...topics: Topic[]): TopicGroup => ({ title, topics });

// ---------------------------------------------------------------------------
// Phases

const PHASE_LIST: Phase[] = [
  // ------------------------------------------------------------------ Harbor
  {
    id: 'harbor',
    track: 'meta',
    title: 'Harbor',
    subtitle: 'Two paths into AI',
    summary:
      'This world maps two AI careers: the AI Developer and the AI Engineer. They share the first part of the roadmap, then diverge at the Fork and meet again at the Summit.',
    groups: [
      g(
        'Two careers',
        t('AI Developer', 'Builds applications using existing AI/ML models and APIs.'),
        t(
          'AI Engineer',
          'Understands the underlying ML/LLM technology and builds, optimizes, evaluates, and operates AI systems in production.',
        ),
        t(
          'Shared foundation',
          'Both paths start the same way: programming, mathematics and ML fundamentals. Then they diverge.',
        ),
        t(
          'Production AI systems',
          'Where both paths lead in the end: real AI systems running in production. That is the Summit at the far end of this world.',
        ),
      ),
    ],
    mentor: {
      name: 'Byte',
      lines: [
        "Hi, I'm Byte, your guide! Welcome to Pathfinder AI.",
        'An AI Developer builds apps using existing AI models and APIs.',
        'An AI Engineer goes deeper: building, optimizing, evaluating and running AI systems in production.',
        'Both paths share the first islands, then split at the Fork. Cross the bridge to Code Village to begin!',
        'Collect the glowing Skill Gems: each one is a topic. Press P (or tap 📖) for your Skill Passport.',
      ],
    },
  },

  // ------------------------------------------------------------ Code Village
  {
    id: 'code-village',
    track: 'common',
    docPhase: 1,
    title: 'Code Village',
    subtitle: 'Programming Fundamentals',
    duration: '1–2 months',
    summary:
      'Become comfortable with Python, everyday software-engineering tools and SQL. This establishes the foundation needed for everything that follows.',
    groups: [
      g(
        'Python',
        t('variables and data types', 'Named boxes that hold values such as numbers, text and lists. The type decides what you can do with a value.'),
        t('conditions', 'if / elif / else let a program choose what to do depending on whether something is true.'),
        t('loops', 'for and while repeat a block of code, for example once for every item in a list.'),
        t('functions', 'Named, reusable blocks of code that take inputs (arguments) and return a result.'),
        t('classes', 'Blueprints for objects that bundle data (attributes) together with behaviour (methods).'),
        t('inheritance', 'A class can extend another class, reusing its behaviour and adding or overriding parts of it.'),
        t('exceptions', 'Errors raised while code runs. try / except lets you catch them and recover gracefully.'),
        t('modules/packages', 'Code split across files (modules) and folders (packages) that you bring in with import.'),
        t('virtual environments', 'An isolated Python setup per project (e.g. venv), so each project keeps its own library versions.'),
        t('file handling', 'Opening, reading and writing files, ideally with `with open(...)` so they close automatically.'),
        t('JSON', "A text format for structured data. Python's json module turns it into dicts and lists and back again."),
        t('REST APIs', 'Web services you talk to over HTTP, using URLs for resources and methods like GET and POST.'),
        t('HTTP', 'The request/response protocol of the web: methods, URLs, headers, bodies and status codes like 200 or 404.'),
        t('async programming', 'async / await lets one program juggle many slow I/O tasks, like API calls, without waiting on each in turn.'),
        t('type hints', 'Annotations like `def f(x: int) -> str` that document types and let tools catch mistakes early.'),
        t('logging', 'Recording what a program does, with levels like INFO and ERROR, so you can debug it later.'),
        t('testing', "Writing code that checks your code (e.g. with pytest), so changes don't silently break things."),
      ),
      g(
        'Then',
        t('NumPy', "Fast arrays and maths on whole arrays at once. The base layer of Python's data and ML stack."),
        t('Pandas', 'DataFrames: spreadsheet-like tables in Python for loading, cleaning, filtering and grouping data.'),
        t('basic data visualization', 'Plotting data as lines, bars, scatters or histograms to spot patterns and problems at a glance.'),
      ),
      g(
        'Software engineering',
        t('Git/GitHub', 'Git tracks every change to your code; GitHub hosts repositories so you can share, review and collaborate.'),
        t('Linux command line', 'Navigating files, running programs and managing servers from a terminal. Most AI systems run on Linux.'),
        t('Docker fundamentals', 'Packaging an app and everything it needs into a container that runs the same way everywhere.'),
        t('environment variables', 'Settings handed to a program from outside (like API keys), so secrets and config stay out of the code.'),
        t('debugging', 'Finding out why code misbehaves: reading errors, using breakpoints and checking assumptions step by step.'),
        t('unit testing', 'Small automated tests that each check one function or class in isolation.'),
        t('API design', 'Choosing clear endpoints, inputs, outputs and error responses so others can use your service easily.'),
      ),
      g(
        'SQL',
        t('SELECT', 'Reads rows and columns from a table, optionally filtered with WHERE and sorted with ORDER BY.'),
        t('JOIN', 'Combines rows from two tables through a related column, e.g. orders with their customers.'),
        t('GROUP BY', 'Groups rows that share a value so you can aggregate them, e.g. total sales per country.'),
        t('subqueries', 'A query nested inside another query, whose result is used as a value or a table.'),
        t('CTEs', 'Common Table Expressions (WITH … AS) name a temporary result so complex queries read step by step.'),
        t('indexes', 'Lookup structures that make finding rows fast, at the cost of extra storage and slower writes.'),
        t('transactions', 'Group several changes so they all succeed or all fail together (BEGIN … COMMIT or ROLLBACK).'),
        t('basic PostgreSQL', 'A powerful open-source relational database and a common default for AI apps.'),
      ),
    ],
    project: { id: 'task-management-api', title: 'Task Management API', pipeline: ['Client', 'FastAPI', 'PostgreSQL', 'Docker'] },
    mentor: {
      name: 'Pip',
      lines: [
        'Welcome to Code Village! Every AI path starts with solid programming.',
        'Get comfortable with Python first, then NumPy, Pandas and some plotting.',
        'Git, Linux, Docker and SQL are everyday tools. Learn them early.',
        'Build the Task Management API: a client, FastAPI, PostgreSQL, all in Docker.',
        'This foundation is what everything else is built on.',
      ],
    },
  },

  // ----------------------------------------------------------- Math Mountain
  {
    id: 'math-mountain',
    track: 'common',
    docPhase: 2,
    title: 'Math Mountain',
    subtitle: 'Mathematics for AI',
    duration: '1–2 months',
    summary:
      "Don't try to become a mathematician. Learn enough mathematics to understand ML: linear algebra, probability, statistics and calculus. Most importantly, understand gradient descent intuitively.",
    keyQuestion: 'Why are embeddings represented as vectors?',
    groups: [
      g(
        'Linear Algebra',
        t('vectors', 'Ordered lists of numbers. In AI a vector can describe a data point or the meaning of a word.'),
        t('matrices', 'Grids of numbers. They hold datasets and the weights of neural-network layers.'),
        t('matrix multiplication', 'Combines two matrices by taking dot products of rows and columns. It is the core operation inside neural networks.'),
        t('dot product', 'Multiply two vectors element by element and add the results. A large value means they point the same way.'),
        t('transpose', 'Flips a matrix over its diagonal, turning rows into columns.'),
        t('norms', "Measures of a vector's length or size, such as the everyday Euclidean (L2) length."),
        t('eigenvalues/eigenvectors', 'Directions a matrix only stretches and never turns; the eigenvalue says by how much. Used in methods like PCA.'),
        t('vector spaces', 'Sets of vectors you can add and scale. Embeddings live in high-dimensional vector spaces where closeness means similarity.'),
      ),
      g(
        'Probability',
        t('probability', 'A number from 0 to 1 for how likely an event is.'),
        t('conditional probability', 'The probability of A given that B has happened, written P(A | B).'),
        t('Bayes theorem', 'Updates a belief with new evidence: P(A | B) = P(B | A) × P(A) / P(B).'),
        t('probability distributions', "Describe how likely each possible outcome is, e.g. a fair coin or the normal 'bell curve'."),
        t('expected value', 'The long-run average outcome, weighting each outcome by its probability.'),
        t('variance', 'How spread out outcomes are around the expected value.'),
      ),
      g(
        'Statistics',
        t('mean', 'The average: add up the values and divide by how many there are.'),
        t('median', 'The middle value once the data is sorted. Less thrown off by extreme outliers than the mean.'),
        t('standard deviation', 'The typical distance of values from the mean (the square root of the variance).'),
        t('correlation', 'How strongly two variables move together, from −1 to +1. Correlation is not causation.'),
        t('sampling', "Studying a subset to draw conclusions about the whole. Results are biased if the sample isn't representative."),
        t('distributions', "The shape of your data: where values cluster, how widely they spread and whether they're skewed."),
        t('confidence intervals', "A range that likely contains the true value, e.g. 'accuracy 82% ± 3% at 95% confidence'."),
        t('hypothesis testing', 'Checking whether an observed difference is real or could just be chance, e.g. with p-values.'),
      ),
      g(
        'Calculus',
        t('derivatives', 'The rate of change of a function: how much the output moves when the input is nudged.'),
        t('partial derivatives', 'The derivative with respect to one input while all the other inputs are held fixed.'),
        t('gradients', 'The vector of all partial derivatives. It points in the direction of steepest increase.'),
        t('chain rule', 'How to differentiate a function inside a function. Backpropagation is the chain rule applied layer by layer.'),
        t('optimization', "Finding the inputs that minimise a function, such as a model's loss. Gradient descent gets there by repeatedly stepping downhill."),
      ),
    ],
    mentor: {
      name: 'Sigma',
      lines: [
        "Don't try to become a mathematician!",
        'Learn just enough mathematics to understand ML.',
        'Especially ask yourself: why are embeddings represented as vectors?',
        'Most importantly, understand gradient descent intuitively: follow the slope downhill, one small step at a time.',
      ],
    },
  },

  // --------------------------------------------------------------- ML Meadow
  {
    id: 'ml-meadow',
    track: 'common',
    docPhase: 3,
    title: 'ML Meadow',
    subtitle: 'Machine Learning Fundamentals',
    duration: '2 months',
    summary:
      'Now introduce actual ML: supervised and unsupervised learning, the core concepts, and how to evaluate models. By the end you are familiar with traditional ML.',
    tools: ['NumPy', 'Pandas', 'Matplotlib', 'Scikit-learn'],
    groups: [
      g(
        'Supervised learning',
        t('regression', 'Predicting a number, such as a house price, from input features.'),
        t('classification', "Predicting a category, such as 'will churn' vs 'will stay', or spam vs not spam."),
        t('decision trees', 'A flowchart of yes/no questions about the features that ends in a prediction. Easy to interpret.'),
        t('random forests', 'Many decision trees, each trained on a random slice of the data, voting together for a sturdier prediction.'),
        t('gradient boosting', "Trees built one after another, each fixing the previous ones' mistakes (e.g. XGBoost). Very strong on tabular data."),
      ),
      g(
        'Unsupervised learning',
        t('clustering', 'Grouping similar items without any labels, e.g. customer segments with k-means.'),
        t('dimensionality reduction', 'Compressing many features into a few while keeping the important structure, e.g. PCA.'),
      ),
      g(
        'ML concepts',
        t('features', 'The input variables a model learns from, e.g. tenure, plan type and monthly bill.'),
        t('labels', 'The answers you want to predict, e.g. whether a customer churned.'),
        t('training', "Fitting the model's parameters to examples so its predictions match the labels."),
        t('validation', 'A held-out set used during development to tune settings and compare models.'),
        t('testing', 'A final, untouched set used once to estimate real-world performance.'),
        t('overfitting', 'The model memorises the training data, noise included, and does badly on new data.'),
        t('underfitting', 'The model is too simple to capture the pattern, so it does badly even on the training data.'),
        t('regularization', 'Penalising complexity (such as large weights) to reduce overfitting.'),
        t('bias/variance', 'The trade-off between errors from overly simple assumptions (bias) and from over-sensitivity to the training data (variance).'),
        t('feature engineering', "Creating or transforming inputs so patterns are easier to learn, e.g. 'days since last login'."),
      ),
      g(
        'Evaluation',
        t('accuracy', 'The share of predictions that are correct. Misleading when one class is much rarer than the other.'),
        t('precision', 'Of everything predicted positive, the share that really was positive.'),
        t('recall', 'Of all the real positives, the share the model found.'),
        t('F1', 'The harmonic mean of precision and recall: one score that balances both.'),
        t('ROC-AUC', 'How well a classifier ranks positives above negatives across all thresholds. 0.5 is random guessing, 1.0 is perfect.'),
        t('confusion matrix', 'A table of actual vs predicted classes, showing true and false positives and negatives.'),
        t('MAE', "Mean Absolute Error: the average size of regression errors, in the target's own units."),
        t('MSE', 'Mean Squared Error: the average of squared errors, so big misses are punished more.'),
        t('RMSE', "Root Mean Squared Error: the square root of MSE, back in the target's units."),
      ),
    ],
    project: {
      id: 'customer-churn-prediction',
      title: 'Customer Churn Prediction',
      pipeline: ['Dataset', 'Data Cleaning', 'Feature Engineering', 'Train Model', 'Evaluate', 'Save Model', 'FastAPI', 'Prediction API'],
    },
    mentor: {
      name: 'Sprout',
      lines: [
        'Welcome to ML Meadow! Now we grow actual machine learning.',
        'Start with supervised learning: regression and classification.',
        "Beware of overfitting: a great training score can fool you.",
        "Accuracy isn't everything. Check precision, recall and the confusion matrix too.",
        'Build the churn predictor, then serve it as a FastAPI prediction API.',
      ],
    },
  },

  // -------------------------------------------------------------------- Fork
  {
    id: 'fork',
    track: 'meta',
    title: 'The Fork',
    subtitle: 'From here the two paths diverge',
    summary:
      "The AI Developer path heads one way, the AI Engineer path the other. Compare them side by side, but you don't have to choose yet: every island stays open.",
    groups: [
      g(
        'Two goals',
        t(
          'AI Developer goal',
          "Build useful software products powered by AI. They don't necessarily need to train foundation models or deeply understand GPU optimization.",
        ),
        t(
          'AI Engineer goal',
          'Understand, build, optimize, evaluate, and operate AI/ML systems. The AI Engineer follows everything the Developer learns but goes significantly deeper.',
        ),
        t(
          'No need to choose yet',
          "Don't choose between the two at the beginning. Start building, then add deeper ML and systems knowledge over time.",
        ),
      ),
    ],
    mentor: {
      name: 'Compass',
      lines: [
        'Here the road splits: one bridge to the AI Developer path, one to the AI Engineer path. Follow the signs!',
        "AI Developer: 'I use AI models to build software.'",
        "AI Engineer: 'I understand AI models deeply enough to build and operate AI systems.'",
        "You don't have to choose now. Both paths meet again at the Summit.",
        'Open the comparison board to see where each path goes deeper.',
      ],
    },
  },

  // ======================================================= AI DEVELOPER PATH
  {
    id: 'dev-llm-lighthouse',
    track: 'developer',
    docPhase: 4,
    title: 'LLM Lighthouse',
    subtitle: 'LLM Fundamentals',
    duration: '1 month',
    summary:
      "Learn what LLMs are and how they behave. Understand the basic Transformer architecture conceptually, and learn the APIs of major providers. Don't focus on memorizing SDKs: understand the concepts.",
    tools: ['OpenAI API', 'Anthropic API', 'Google API'],
    groups: [
      g(
        'LLM concepts',
        t('what LLMs are', 'Large language models: neural networks trained on huge amounts of text to predict the next token, which lets them write, summarise and answer.'),
        t('tokens', 'The chunks of text an LLM reads and writes, often a word or part of a word. Usage and limits are counted in tokens.'),
        t('tokenization', "Splitting text into tokens from a fixed vocabulary and turning each one into a number the model can read."),
        t('embeddings', 'Vectors of numbers that capture meaning, so similar texts end up close together.'),
        t('context window', 'The maximum number of tokens a model can consider at once: your instructions, any documents, and its reply.'),
        t('inference', 'Running a trained model to get an output, as opposed to training it.'),
        t('temperature', 'Controls randomness when choosing the next token. Low is focused and repeatable; high is more varied and creative.'),
        t('top-p', 'Nucleus sampling: only choose from the smallest set of likely tokens whose probabilities add up to p.'),
        t('hallucination', 'When a model confidently states something false or made up. Validate anything important.'),
        t('model limitations', 'LLMs have knowledge cut-offs and limited context, can slip on exact maths or logic, and can be inconsistent.'),
      ),
    ],
    mentor: {
      name: 'Lumen',
      lines: [
        'Welcome to the LLM Lighthouse!',
        'Learn the core ideas: tokens, embeddings, the context window, temperature and top-p.',
        "Understand the Transformer conceptually. You don't need to build one on this path.",
        "Try the OpenAI, Anthropic and Google APIs, but don't memorize SDKs. Understand the concepts.",
        'And remember: LLMs can hallucinate.',
      ],
    },
  },
  {
    id: 'dev-prompt-workshop',
    track: 'developer',
    docPhase: 5,
    title: 'Prompt Workshop',
    subtitle: 'Prompt Engineering',
    duration: '2–3 weeks',
    summary:
      "Learn to instruct models reliably and get structured, validated outputs, and learn what doesn't work.",
    antiPatterns: [
      'endlessly making prompts longer',
      'putting business logic entirely inside prompts',
      'trusting LLM output without validation',
    ],
    groups: [
      g(
        'Prompting',
        t('system instructions', "Top-level instructions that set the model's role, rules and tone for the whole conversation."),
        t('user prompts', "The end user's message: the specific request the model should answer."),
        t('few-shot prompting', 'Including a few worked examples in the prompt so the model follows the pattern.'),
        t('structured outputs', 'Asking the model to answer in a fixed, machine-readable shape (like JSON) that your code can rely on.'),
        t('JSON Schema', 'A standard way to describe the shape of JSON: fields, types and required keys. Many LLM APIs accept one to constrain outputs.'),
        t('Pydantic', 'A Python library that defines data models with type hints and validates data against them. Ideal for checking LLM output.'),
        t('prompt templates', 'Reusable prompts with placeholders (like {question}) that your code fills in.'),
        t('prompt versioning', 'Tracking prompt changes like code, so you can compare versions, test them and roll back.'),
      ),
    ],
    project: {
      id: 'ai-customer-support-assistant',
      title: 'AI Customer Support Assistant',
      pipeline: ['User', 'LLM', 'Structured Response', 'Business Logic', 'Response'],
    },
    mentor: {
      name: 'Quill',
      lines: [
        'Welcome to the Prompt Workshop!',
        'Use system instructions, few-shot examples and structured outputs.',
        'Validate LLM output with JSON Schema or Pydantic. Never trust it blindly.',
        "Longer and longer prompts don't help. Neither does putting all your business logic in a prompt.",
        'Build a support assistant: the LLM gives a structured response, your business logic decides.',
      ],
    },
  },
  {
    id: 'dev-rag-library',
    track: 'developer',
    docPhase: 6,
    title: 'RAG Library',
    subtitle: 'Retrieval-Augmented Generation',
    duration: '1–2 months',
    summary:
      "This should be one of the developer's most important skills: find the right pieces of your own documents and give them to the LLM, so it answers from your data.",
    tools: ['PostgreSQL + pgvector', 'Qdrant', 'Elasticsearch/OpenSearch'],
    diagrams: [
      {
        title: 'The RAG pipeline',
        steps: ['Documents', 'Parsing', 'Chunking', 'Embeddings', 'Vector Database', 'Retrieval', 'LLM', 'Answer'],
      },
    ],
    groups: [
      g(
        'RAG',
        t('embeddings', 'Each chunk and each question is turned into a vector, so meaning can be compared with maths.'),
        t('vector search', 'Finding the stored vectors closest to the question vector: the most similar chunks.'),
        t('chunking', 'Splitting documents into smaller passages that fit the context window and can be retrieved on their own.'),
        t('metadata', 'Extra info stored with each chunk (source, date, permissions) for filtering and citations.'),
        t('similarity search', 'Ranking items by a similarity score, such as the cosine similarity between vectors.'),
        t('hybrid search', 'Combining keyword search with vector search to catch both exact terms and meaning.'),
        t('reranking', 'A second, more precise model reorders the top results before they reach the LLM.'),
        t('citations', 'Showing which source each part of the answer came from, so users can check it.'),
        t('retrieval evaluation', 'Measuring whether the right chunks are found, using test questions with known answers.'),
      ),
    ],
    project: {
      id: 'company-knowledge-assistant',
      title: 'Company Knowledge Assistant',
      pipeline: ['Admin', 'Upload Documents', 'Ingestion', 'Vector DB', 'User Chat', 'Retrieval', 'LLM', 'Answer + Citations'],
    },
    mentor: {
      name: 'Dewey',
      lines: [
        "Welcome to the RAG Library! This is one of a developer's most important skills.",
        'Documents → parsing → chunking → embeddings → vector database → retrieval → LLM → answer.',
        'Good chunking and metadata make or break retrieval.',
        'Always show citations so people can trust the answer.',
        'Try PostgreSQL with pgvector, Qdrant, or Elasticsearch/OpenSearch.',
      ],
    },
  },
  {
    id: 'dev-agent-hq',
    track: 'developer',
    docPhase: 7,
    title: 'Agent HQ',
    subtitle: 'AI Agents',
    duration: '1–2 months',
    summary: 'Let LLMs take actions: call tools, loop, plan, remember and ask a human when it matters. Then learn the main agent frameworks and MCP.',
    groups: [
      g(
        'Agent building blocks',
        t('tool calling', 'Letting an LLM decide to use external tools (search, databases, APIs) and read back their results.'),
        t('function calling', 'The API mechanism behind tool calling: the model returns a function name plus JSON arguments, and your code runs it.'),
        t('agent loops', 'Think, act, observe, repeat: the model keeps calling tools until it decides the task is done.'),
        t('state', "Everything the agent tracks during a task: the goal, steps taken, tool results and what's left to do."),
        t('memory', 'What an agent remembers: short-term (this conversation) and long-term (stored facts it can recall later).'),
        t('planning', 'Breaking a goal into steps before or while acting.'),
        t('routing', 'Sending each request to the right tool, prompt, model or sub-agent.'),
        t('retries', 'Trying a failed step again, with limits and backoff, because tools and models sometimes fail.'),
        t('human approval', 'Pausing so a person can approve risky actions, like sending an email or spending money.'),
      ),
      g(
        'Then learn',
        t('LangGraph', 'A framework for building agents as graphs of steps with explicit state, branches and loops.'),
        t('OpenAI Agents SDK', "OpenAI's lightweight framework for agents with tools, handoffs between agents, and guardrails."),
        t('MCP', 'Model Context Protocol: an open standard for connecting AI apps to tools and data sources through one common interface.'),
      ),
    ],
    project: {
      id: 'ai-research-agent',
      title: 'AI Research Agent',
      pipeline: ['User', 'Planner', 'Web Search | RAG Agent', 'Research Agent', 'Report'],
    },
    mentor: {
      name: 'Relay',
      lines: [
        'Welcome to Agent HQ! Here LLMs learn to take action.',
        'Master tool calling, agent loops, state and memory.',
        'Add retries and human approval before anything risky.',
        'Then try LangGraph, the OpenAI Agents SDK and MCP.',
        'Build a research agent: a planner sends work to web search and a RAG agent, then writes a report.',
      ],
    },
  },
  {
    id: 'dev-app-factory',
    track: 'developer',
    docPhase: 8,
    title: 'App Factory',
    subtitle: 'AI Application Engineering',
    duration: '1–2 months',
    summary: 'Turn AI features into a real product: fast, reliable, secure and ready for many users.',
    groups: [
      g(
        'Application engineering',
        t('streaming responses', 'Sending tokens to the user as they are generated, so replies start appearing instantly.'),
        t('async processing', 'Handling many requests at once without blocking while waiting on LLMs, databases or APIs.'),
        t('background jobs', 'Running slow work (like ingesting documents) in a queue outside the request, then reporting when done.'),
        t('caching', 'Storing results (e.g. in Redis) so repeated requests are faster and cheaper.'),
        t('rate limiting', 'Capping how many requests each user can make, to protect your service and your LLM bill.'),
        t('authentication', 'Verifying who a user is, e.g. with a login or a token.'),
        t('authorization', 'Deciding what an authenticated user is allowed to do or see.'),
        t('multi-tenancy', "One app serving many customer organisations while keeping each one's data separate."),
        t('API design', 'Clear, versioned endpoints with well-defined request and response shapes for your AI features.'),
        t('error handling', 'Catching failures (timeouts, bad model output, provider outages) and responding gracefully, with fallbacks.'),
      ),
    ],
    project: {
      id: 'production-ai-saas',
      title: 'Production AI SaaS',
      pipeline: ['Next.js', 'FastAPI', 'AI Orchestration', 'LLM', 'PostgreSQL', 'pgvector', 'Redis'],
    },
    mentor: {
      name: 'Rivet',
      lines: [
        'Welcome to the App Factory, where demos become products!',
        'Stream responses so users see answers right away.',
        'Move slow work to background jobs, and cache what you can.',
        'Authentication, authorization and multi-tenancy keep customers safe and separate.',
        'Build a production AI SaaS: Next.js, FastAPI, orchestration, an LLM, PostgreSQL with pgvector, and Redis.',
      ],
    },
  },
  {
    id: 'dev-shield-fort',
    track: 'developer',
    docPhase: 9,
    title: 'Shield Fort',
    subtitle: 'AI Evaluation & Security',
    summary: 'Even an AI Developer needs this: measure whether your AI actually works, and defend it against attacks.',
    groups: [
      g(
        'Evaluation',
        t('test datasets', 'A fixed set of example inputs with expected outputs, used to score your AI system repeatably.'),
        t('LLM-as-a-judge', 'Using an LLM to grade outputs against a rubric, so evaluation scales beyond manual review.'),
        t('hallucination testing', 'Checking whether answers contain claims the sources or facts do not support.'),
        t('RAG evaluation', 'Scoring retrieval (were the right chunks found?) and generation (is the answer faithful and relevant?).'),
        t('regression testing', 'Re-running your evals after every prompt, model or code change to catch anything that got worse.'),
      ),
      g(
        'Security',
        t('prompt injection', 'Malicious instructions hidden in the input that try to override your system instructions.'),
        t('jailbreaks', 'Prompts crafted to trick a model into ignoring its safety rules.'),
        t('sensitive data leakage', "The model revealing private data, such as another user's details, secrets or the system prompt."),
        t('tool abuse', 'Tricking an agent into misusing its tools, e.g. deleting data or sending unwanted messages.'),
        t('authorization', 'Making sure the AI and its tools can only reach what the current user is allowed to reach.'),
        t('tenant isolation', "Ensuring one customer's data never shows up in another customer's results or prompts."),
      ),
    ],
    mentor: {
      name: 'Aegis',
      lines: [
        'Welcome to Shield Fort. Even an AI Developer needs this!',
        'Build test datasets and run evals after every change.',
        'LLM-as-a-judge helps evaluation scale, but check the judge too.',
        'Assume prompt injection will happen. Limit what tools can do and who they act for.',
        "Keep every tenant's data isolated.",
      ],
    },
  },

  // ======================================================== AI ENGINEER PATH
  {
    id: 'eng-neural-garden',
    track: 'engineer',
    docPhase: 4,
    title: 'Neural Garden',
    subtitle: 'Deep Learning',
    duration: '2–3 months',
    summary: 'Learn how neural networks work and how to train them. PyTorch should be your primary deep-learning framework.',
    tools: ['PyTorch'],
    groups: [
      g(
        'Neural networks',
        t('neural networks', 'Layers of simple connected units (neurons) whose weights are learned from data.'),
        t('perceptrons', 'The simplest neuron: a weighted sum of inputs plus a bias, passed through a step to make a yes/no decision.'),
        t('activation functions', 'Non-linear functions (ReLU, sigmoid, tanh) applied after each layer so networks can learn complex patterns.'),
        t('loss functions', 'A score of how wrong the predictions are (e.g. cross-entropy or MSE). Training tries to minimise it.'),
        t('forward propagation', 'Passing inputs through the layers, one after another, to produce a prediction.'),
        t('backpropagation', 'Working backwards from the loss with the chain rule to find how much each weight contributed to the error.'),
        t('gradient descent', 'Nudging every weight a small step against its gradient to reduce the loss, over and over.'),
        t('optimizers', 'Algorithms that decide how to update weights from their gradients, such as SGD or Adam.'),
        t('regularization', 'Techniques like weight decay that keep a network from overfitting.'),
        t('batch normalization', "Normalising a layer's inputs over each mini-batch to make training faster and more stable."),
        t('dropout', "Randomly switching off neurons during training so the network can't rely on any single one."),
      ),
      g(
        'Then',
        t('CNN', 'Convolutional neural networks slide small learned filters over images to detect edges, textures and objects.'),
        t('RNN', 'Recurrent neural networks read sequences one step at a time, carrying a hidden state forward.'),
        t('LSTM', 'An RNN with gates that decide what to remember and what to forget, so it copes with longer sequences.'),
        t('attention', 'Lets a model weigh which parts of the input matter most for each output. The key idea behind Transformers.'),
      ),
    ],
    project: {
      id: 'image-classification-system',
      title: 'Image Classification System',
      pipeline: ['Images', 'Preprocessing', 'CNN', 'Training', 'Evaluation', 'Inference API'],
    },
    mentor: {
      name: 'Synapse',
      lines: [
        'Welcome to the Neural Garden! Here networks grow.',
        'Start with perceptrons, activations and loss functions.',
        'Backpropagation is just the chain rule, applied layer by layer.',
        'Make PyTorch your primary deep-learning framework.',
        'Build an image classifier: preprocessing, a CNN, training, evaluation and an inference API.',
      ],
    },
  },
  {
    id: 'eng-transformer-tower',
    track: 'engineer',
    docPhase: 5,
    title: 'Transformer Tower',
    subtitle: 'Transformers',
    duration: '1–2 months',
    summary:
      "This is a critical stage. Understand the Transformer architecture well enough to explain how an LLM generates the next token, without simply saying 'The API does it.'",
    keyQuestion: 'How does an LLM generate the next token?',
    diagrams: [
      {
        title: 'Transformer architecture',
        steps: ['Input', 'Tokenizer', 'Embeddings', 'Positional Information', 'Self Attention', 'Feed Forward', 'Normalization', 'Output'],
      },
    ],
    groups: [
      g(
        'Transformers',
        t('attention', 'Each token scores how relevant every other token is and blends their information according to those scores.'),
        t('self-attention', 'Attention where a sequence attends to itself, so every token can pull context from every other token.'),
        t('multi-head attention', 'Several attention heads run in parallel, each free to focus on different relationships in the text.'),
        t('positional encoding', 'Information added to the embeddings so the model knows the order of tokens, which attention alone ignores.'),
        t('encoder', 'The part that reads the whole input at once to build rich representations (e.g. BERT).'),
        t('decoder', 'The part that generates output tokens one at a time. GPT-style LLMs are decoder-only.'),
        t('causal attention', 'Masked attention in which each token can only see earlier tokens, never future ones.'),
        t('autoregressive generation', 'Producing text one token at a time, feeding each new token back in to predict the next one.'),
      ),
    ],
    mentor: {
      name: 'Attn',
      lines: [
        'Welcome to Transformer Tower. This is a critical stage!',
        'Input → tokenizer → embeddings → positions → self-attention → feed forward → normalization → output.',
        'Self-attention lets every token look at every other token.',
        "Can you explain how an LLM generates the next token, without saying 'the API does it'?",
      ],
    },
  },
  {
    id: 'eng-model-forge',
    track: 'engineer',
    docPhase: 6,
    title: 'Model Forge',
    subtitle: 'LLMs & Foundation Models',
    summary: 'Learn how foundation models are trained, adapted and compressed, and what drives their speed and cost at inference time.',
    tools: ['Hugging Face Transformers', 'Hugging Face Datasets', 'Hugging Face Tokenizers', 'Hugging Face PEFT'],
    groups: [
      g(
        'Training & adapting',
        t('pretraining', 'Training a model from scratch on massive amounts of text to predict the next token. This is where its general knowledge comes from.'),
        t('supervised fine-tuning', 'Further training a pretrained model on curated input → output examples to teach it a task or style.'),
        t('instruction tuning', 'Fine-tuning on many instruction–response pairs so the model follows instructions instead of just continuing text.'),
        t('RLHF', 'Reinforcement Learning from Human Feedback: people rank outputs, a reward model learns their preferences, and the LLM is tuned towards them.'),
        t('preference optimization', "Methods such as DPO that tune a model directly on 'preferred vs rejected' answer pairs, without a separate reward model."),
        t('LoRA', 'Low-Rank Adaptation: freeze the model and train small add-on matrices, which makes fine-tuning far cheaper.'),
        t('QLoRA', 'LoRA on top of a 4-bit quantized base model, so large models can be fine-tuned on a single GPU.'),
        t('quantization', 'Storing weights with fewer bits (e.g. 4 or 8 instead of 16) to cut memory and speed up inference, at a small quality cost.'),
        t('distillation', "Training a small 'student' model to imitate a large 'teacher', keeping much of the quality at a lower cost."),
      ),
      g(
        'Understand',
        t('model parameters', 'The learned weights. Their count (e.g. 7B) drives capability, memory needs and cost.'),
        t('context length', 'How many tokens the model can attend to at once. Longer contexts cost more memory and compute.'),
        t('inference', 'Generating output: one pass over the whole prompt, then one decoding step for every new token.'),
        t('KV cache', "Keeps the attention keys and values of earlier tokens, so each new token doesn't recompute them."),
        t('batching', 'Processing several requests together to keep the GPU busy and raise total throughput.'),
        t('token throughput', 'How many tokens per second the system produces across all users.'),
        t('latency', 'How long a single user waits, e.g. the time to the first token and the time to the full reply.'),
      ),
    ],
    mentor: {
      name: 'Anvil',
      lines: [
        'Welcome to the Model Forge, where models are made!',
        'Pretraining builds knowledge; fine-tuning, instruction tuning and RLHF shape behaviour.',
        'LoRA and QLoRA make fine-tuning affordable.',
        'Know your KV cache, batching, throughput and latency.',
        'Learn the Hugging Face stack: Transformers, Datasets, Tokenizers and PEFT.',
      ],
    },
  },
  {
    id: 'eng-deep-archive',
    track: 'engineer',
    docPhase: 7,
    title: 'Deep Archive',
    subtitle: 'Advanced RAG',
    summary: 'The AI Engineer should go considerably deeper than the AI Developer: stronger retrieval, advanced architectures and rigorous evaluation.',
    groups: [
      g(
        'Retrieval',
        t('dense retrieval', 'Searching with embedding vectors that capture meaning, so paraphrases still match.'),
        t('sparse retrieval', 'Keyword-based search over word counts (like BM25). Great for exact terms, names and codes.'),
        t('hybrid retrieval', 'Running dense and sparse retrieval together and merging the results for the best of both.'),
        t('BM25', 'A classic keyword-ranking formula that scores documents by how often, and how rarely elsewhere, the query words appear.'),
        t('reranking', 'A stronger model rescores the top candidates by reading the query and each passage together.'),
        t('query expansion', 'Adding synonyms or related terms to the query so more relevant documents match.'),
        t('query rewriting', 'Using an LLM to rephrase a vague or conversational question into a better search query.'),
      ),
      g(
        'Advanced architectures',
        t('parent-child retrieval', 'Search small, precise chunks, but hand the LLM their larger parent section for full context.'),
        t('hierarchical retrieval', 'Searching in levels: first find the right document or section, then the best passages inside it.'),
        t('multi-hop retrieval', 'Answering questions that need several lookups, using what one retrieval finds to drive the next.'),
        t('graph RAG', 'Building a knowledge graph of entities and relationships from documents, and retrieving through it.'),
        t('agentic RAG', "An agent decides when, where and how to retrieve, and searches again if the results aren't good enough."),
        t('contextual retrieval', "Adding a short note about each chunk's surrounding document before indexing it, so chunks aren't misread out of context."),
      ),
      g(
        'Evaluation',
        t('Recall@K', 'Of all the relevant documents, the fraction that appear in the top K results.'),
        t('Precision@K', 'Of the top K results, the fraction that are relevant.'),
        t('MRR', 'Mean Reciprocal Rank: rewards putting the first relevant result near the top (1 for first place, ½ for second, and so on).'),
        t('NDCG', 'Normalized Discounted Cumulative Gain: scores the whole ranking, giving more credit to relevant results placed higher.'),
        t('answer faithfulness', 'Whether every claim in the answer is supported by the retrieved context.'),
        t('context relevance', 'Whether the retrieved context is actually relevant to the question.'),
        t('groundedness', "How firmly the answer is anchored in the provided sources rather than the model's own guesses."),
      ),
    ],
    mentor: {
      name: 'Ledger',
      lines: [
        'Welcome to the Deep Archive. Here we go considerably deeper than basic RAG.',
        'Dense, sparse or hybrid? Know when BM25 wins.',
        'Rerank, expand and rewrite queries to find what matters.',
        'Measure retrieval with Recall@K, MRR and NDCG, and answers with faithfulness and groundedness.',
      ],
    },
  },
  {
    id: 'eng-clockwork-keep',
    track: 'engineer',
    docPhase: 8,
    title: 'Clockwork Keep',
    subtitle: 'Agent Architecture',
    summary: 'Go beyond using an agent framework. Understand how agents actually work: the loop of planning, executing, using tools and updating state.',
    diagrams: [{ title: 'The agent loop', steps: ['Planner', 'Executor', 'Tools', 'State', '↻ back to Planner'] }],
    groups: [
      g(
        'Agent internals',
        t('agent state', "The structured record of an agent's progress (goal, plan, tool results, messages) that every step reads and updates."),
        t('planning', 'Breaking a goal into steps, and revising the plan as results come in.'),
        t('tool selection', 'How an agent picks the right tool for each step, and why clear tool names and descriptions matter.'),
        t('reflection', 'The agent critiques its own output or progress and corrects course.'),
        t('retries', 'Recovering from failed tool calls or bad outputs with limited, smarter re-attempts.'),
        t('state machines', 'Modelling an agent as explicit states and transitions, which makes its behaviour predictable and testable.'),
        t('multi-agent systems', 'Several specialised agents that hand off work or collaborate, e.g. a planner directing several workers.'),
        t('human-in-the-loop', 'Points where a person reviews, approves or corrects the agent before it continues.'),
        t('long-running agents', 'Agents that work for minutes or days, which need checkpoints, persistence and resumable state.'),
        t('agent memory', 'How an agent stores and recalls information across steps and sessions, short-term and long-term.'),
      ),
    ],
    mentor: {
      name: 'Tock',
      lines: [
        'Tick, tock! Welcome to Clockwork Keep.',
        'Go beyond the framework: understand how agents actually work.',
        'Planner → executor → tools → state, and round again.',
        'State machines and human-in-the-loop keep agents predictable.',
      ],
    },
  },
  {
    id: 'eng-gpu-plant',
    track: 'engineer',
    docPhase: 9,
    title: 'GPU Plant',
    subtitle: 'Model Serving & Inference',
    summary: 'This is one of the major differences from an AI Developer: serving models yourself, efficiently, on GPUs.',
    tools: ['vLLM', 'Hugging Face', 'Ollama', 'TensorRT-LLM'],
    diagrams: [
      { title: 'Serving path', steps: ['User Requests', 'Load Balancer', 'Inference Server', 'GPU', 'LLM'] },
      { title: 'Optimize for', steps: ['Latency ↓ | Cost ↓', 'GPU utilization ↑ | Throughput ↑'] },
    ],
    groups: [
      g(
        'Serving',
        t('GPU fundamentals', 'GPUs run thousands of simple cores in parallel, which suits the matrix maths at the heart of neural networks.'),
        t('CUDA concepts', "NVIDIA's platform for GPU programming: kernels, threads and blocks, and moving data between CPU and GPU memory."),
        t('GPU memory', "VRAM must hold the model weights, the KV cache and activations. It's usually what limits which models you can serve."),
        t('inference optimization', 'Making generation faster and cheaper, e.g. with better kernels, caching, batching and quantization.'),
        t('batching', 'Serving many requests together. Continuous batching adds and removes requests on the fly to keep the GPU busy.'),
        t('quantization', 'Lower-precision weights so a model fits in less GPU memory and runs faster.'),
        t('model parallelism', "Splitting one model across several GPUs when it's too big for one."),
        t('distributed inference', 'Serving across multiple GPUs or machines, with replicas and load balancing, to handle more traffic.'),
      ),
    ],
    mentor: {
      name: 'Volt',
      lines: [
        'Welcome to the GPU Plant! This is one of the big differences from an AI Developer.',
        'GPU memory decides what you can serve: weights, KV cache and all.',
        'Batching and quantization squeeze more out of every GPU.',
        'Aim for: latency down, cost down, GPU utilization up, throughput up.',
        'Get hands-on with vLLM, Hugging Face, Ollama and TensorRT-LLM.',
      ],
    },
  },
  {
    id: 'eng-mlops-conveyor',
    track: 'engineer',
    docPhase: 10,
    title: 'MLOps Conveyor',
    subtitle: 'MLOps / LLMOps',
    summary: 'Run models as a reliable production process: versioned, tracked, deployed, monitored and continuously improved.',
    tools: ['MLflow', 'Langfuse', 'OpenTelemetry', 'Prometheus', 'Grafana'],
    diagrams: [
      {
        title: 'The model lifecycle',
        steps: ['Data', 'Training', 'Evaluation', 'Model Registry', 'Deployment', 'Monitoring', 'Feedback', 'Retraining'],
      },
    ],
    groups: [
      g(
        'Operations',
        t('model versioning', 'Tracking each model version together with the exact code, data and settings that produced it.'),
        t('experiment tracking', 'Logging the parameters, metrics and outputs of every training run so results can be compared and reproduced.'),
        t('model registry', 'A central catalogue of approved model versions and their stage, such as staging or production.'),
        t('data pipelines', 'Automated steps that collect, clean and transform data for training and evaluation.'),
        t('model deployment', 'Releasing a model to real traffic safely, e.g. to a small share of users first.'),
        t('monitoring', 'Watching latency, errors, cost and quality in production, with dashboards and alerts.'),
        t('drift detection', 'Noticing when live data or model behaviour moves away from what the model was trained and tested on.'),
        t('evaluation pipelines', 'Automated evals that run on every new model or prompt before, and after, it ships.'),
      ),
    ],
    mentor: {
      name: 'Loop',
      lines: [
        'Welcome to the MLOps Conveyor. Models never stand still!',
        'Data → training → evaluation → registry → deployment → monitoring → feedback → retraining.',
        'Track every experiment and version every model.',
        'Watch for drift: the world changes, and your model must keep up.',
        'Useful tools: MLflow, Langfuse, OpenTelemetry, Prometheus and Grafana.',
      ],
    },
  },
  {
    id: 'eng-security-citadel',
    track: 'engineer',
    docPhase: 11,
    title: 'Security Citadel',
    subtitle: 'AI Security',
    summary: 'A deep dive into how AI systems are attacked, and the controls enterprise AI needs.',
    groups: [
      g(
        'Deep dive',
        t('prompt injection', 'Instructions smuggled into input that hijack the model. Defend in layers, never with the prompt alone.'),
        t('indirect prompt injection', 'Malicious instructions hidden in content the AI reads (web pages, emails, documents) rather than typed by the user.'),
        t('model extraction', "Querying a model many times to copy its behaviour, or to steal its weights or hidden prompts."),
        t('data poisoning', 'Planting bad data in training or retrieval sources to corrupt what the model learns or finds.'),
        t('adversarial attacks', 'Inputs subtly altered to fool a model, like invisible noise that makes an image classifier see the wrong object.'),
        t('jailbreaks', 'Techniques that get a model to bypass its safety training, e.g. role-play or disguised requests.'),
        t('tool abuse', 'Manipulating an agent into calling its tools in harmful ways.'),
        t('excessive agency', 'Giving an AI more permissions, tools or autonomy than its task needs, which magnifies any mistake or attack.'),
        t('data exfiltration', 'Sneaking sensitive data out through the AI, e.g. hidden inside a link or a tool call.'),
        t('model supply-chain security', 'Trusting only verified models, datasets and libraries, because downloaded weights or packages can be tampered with.'),
      ),
      g(
        'Enterprise AI',
        t('RBAC', 'Role-Based Access Control: permissions granted by role, such as admin, editor or viewer.'),
        t('ABAC', 'Attribute-Based Access Control: rules based on attributes of the user, the resource and the context, like department or region.'),
        t('RLS', 'Row-Level Security: the database itself filters which rows each user can read, e.g. in PostgreSQL.'),
        t('tenant isolation', "Strict separation of each customer's data, indexes and prompts in a multi-tenant AI system."),
        t('audit logging', 'Recording who did what and when, including AI and tool actions, for investigations and compliance.'),
        t('secrets management', 'Keeping API keys and credentials in a secure secret store, never in code or prompts.'),
        t('encryption', 'Protecting data in transit and at rest, so intercepted or stolen data is unreadable.'),
      ),
    ],
    mentor: {
      name: 'Warden',
      lines: [
        'Halt! Welcome to the Security Citadel.',
        'Prompt injection can arrive indirectly, hidden in a web page or a document.',
        'Avoid excessive agency: give AI only the access its task needs.',
        'Enterprise AI needs RBAC, ABAC, row-level security, audit logs and proper secrets management.',
      ],
    },
  },

  // ------------------------------------------------------------------ Summit
  {
    id: 'summit',
    track: 'meta',
    docPhase: 12,
    title: 'The Summit',
    subtitle: 'Production AI Architecture',
    summary: 'Finally, combine everything. Both paths converge here, on production AI systems.',
    diagrams: [
      {
        title: 'Production AI architecture',
        steps: [
          'Frontend',
          'API Layer',
          'AI Orchestration',
          'Agents | RAG | Tools',
          'LLM API | Vector DB | PostgreSQL',
          'Evaluation/Tracing',
          'Monitoring',
        ],
      },
    ],
    groups: [
      g(
        'Production AI architecture',
        t('Frontend', 'The user-facing app where people chat, upload files and see results.'),
        t('API Layer', 'The backend that authenticates users, validates requests and exposes your AI features.'),
        t('AI Orchestration', 'The coordinating layer that decides which agents, retrieval and tools handle each request.'),
        t('Agents', 'Components that plan and act with tools to complete multi-step tasks.'),
        t('RAG', 'Retrieval that grounds answers in your own documents.'),
        t('Tools', 'External actions and APIs the system can call, like search, databases or business systems.'),
        t('LLM API', 'The language model that generates responses, hosted by a provider or served yourself.'),
        t('Vector DB', 'Stores embeddings for semantic search over your knowledge.'),
        t('PostgreSQL', 'The relational database for users, app data and conversation history.'),
        t('Evaluation/Tracing', 'Recording every step of each request and scoring quality, so you can debug and improve.'),
        t('Monitoring', 'Dashboards and alerts on latency, cost, errors and quality in production.'),
      ),
    ],
    project: {
      id: 'ai-platform',
      title: 'AI Platform',
      pipeline: [
        'Register Models',
        'Create Prompts',
        'Create RAG Pipelines',
        'Create Agents',
        'Run Evaluations',
        'Monitor Production',
        'Track Cost',
      ],
    },
    mentor: {
      name: 'Apex',
      lines: [
        'You made it to the Summit! Here, everything combines.',
        'Frontend, API, orchestration, agents, RAG, tools, LLMs, databases, evaluation and monitoring: one system.',
        'Projects matter more than completing a calendar schedule.',
        'AI Developer is an excellent entry point. You can grow into an AI Engineer step by step.',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Meta content (Harbor, Fork, Summit)

/** Top-of-doc roadmap shape: a trunk, two branches, one destination. */
export const ROADMAP_SHAPE = {
  trunk: ['Software Engineering', 'Python + SQL + APIs', 'AI / ML Fundamentals'],
  developer: ['LLM APIs', 'Prompting', 'RAG', 'Agents', 'AI Apps', 'Integration'],
  engineer: [
    'Mathematics',
    'Machine Learning',
    'Deep Learning',
    'Transformers',
    'Model Training',
    'Model Fine-tuning',
    'AI Infrastructure',
  ],
  converge: 'Production AI Systems',
};

export const DEFINITIONS = {
  developer: 'Builds applications using existing AI/ML models and APIs.',
  engineer:
    'Understands the underlying ML/LLM technology and builds, optimizes, evaluates, and operates AI systems in production.',
  shared: 'They share the first part of the roadmap, then diverge.',
};

export const TRACK_GOALS = {
  developer: 'Build useful software products powered by AI.',
  engineer: 'Understand, build, optimize, evaluate, and operate AI/ML systems.',
};

export type Stars = 1 | 2 | 3 | 4 | 5;

export interface ComparisonRow {
  area: string;
  dev: Stars;
  eng: Stars;
}

export const COMPARISON: ComparisonRow[] = [
  { area: 'Python', dev: 4, eng: 5 },
  { area: 'Software Engineering', dev: 4, eng: 5 },
  { area: 'SQL', dev: 3, eng: 4 },
  { area: 'Mathematics', dev: 2, eng: 5 },
  { area: 'Statistics', dev: 2, eng: 4 },
  { area: 'ML', dev: 3, eng: 5 },
  { area: 'Deep Learning', dev: 2, eng: 5 },
  { area: 'PyTorch', dev: 2, eng: 5 },
  { area: 'Transformers', dev: 3, eng: 5 },
  { area: 'LLM APIs', dev: 5, eng: 5 },
  { area: 'Prompt Engineering', dev: 4, eng: 4 },
  { area: 'RAG', dev: 5, eng: 5 },
  { area: 'Agents', dev: 5, eng: 5 },
  { area: 'Fine-tuning', dev: 2, eng: 4 },
  { area: 'Model Training', dev: 1, eng: 4 },
  { area: 'Model Serving', dev: 2, eng: 5 },
  { area: 'MLOps', dev: 2, eng: 5 },
  { area: 'AI Evaluation', dev: 3, eng: 5 },
  { area: 'AI Security', dev: 3, eng: 5 },
  { area: 'Product Development', dev: 5, eng: 4 },
  { area: 'Research', dev: 2, eng: 4 },
];

/** "The Most Important Difference". */
export const DIFFERENCE = {
  developer: {
    quote: 'I use AI models to build software.',
    excellentAt: ['APIs', 'LLMs', 'RAG', 'Agents', 'Product Development'],
  },
  engineer: {
    quote: 'I understand AI models deeply enough to build and operate AI systems.',
    excellentAt: ['ML', 'Deep Learning', 'Transformers', 'LLMs', 'RAG', 'Agents', 'Evaluation', 'Infrastructure'],
  },
};

export const DEVELOPER_FINAL_SKILLS = {
  foundation: ['Python', 'SQL', 'FastAPI', 'Git', 'Docker'],
  ai: [
    'LLM APIs',
    'Prompt Engineering',
    'Structured Outputs',
    'RAG',
    'Vector Databases',
    'Agents',
    'Tool Calling',
    'MCP',
    'AI Evaluation',
    'AI Security',
    'Cloud Deployment',
  ],
  challenge: 'We need an AI assistant that answers questions about our company documents.',
  outcome: 'and turning it into a working production application.',
};

export interface Timeline {
  /** A career path (any track except the shared 'meta' / 'common'). */
  track: Exclude<Track, 'meta' | 'common'>;
  total: string;
  steps: { when: string; what: string }[];
  note?: string;
}

export const TIMELINES: Timeline[] = [
  {
    track: 'developer',
    total: '~9–12 months',
    steps: [
      { when: 'Months 1–2', what: 'Python + SQL + APIs' },
      { when: 'Months 3–4', what: 'ML Fundamentals' },
      { when: 'Month 5', what: 'LLMs + Prompting' },
      { when: 'Months 6–7', what: 'RAG' },
      { when: 'Months 8–9', what: 'Agents' },
      { when: 'Months 10–12', what: 'Production AI Applications' },
    ],
    note: 'With consistent project work: ready to apply for AI Developer / LLM Developer / Generative AI Developer roles.',
  },
  {
    track: 'engineer',
    total: '~12–18 months',
    steps: [
      { when: 'Months 1–2', what: 'Software + Python' },
      { when: 'Months 3–4', what: 'Math + ML' },
      { when: 'Months 5–7', what: 'Deep Learning + PyTorch' },
      { when: 'Months 8–9', what: 'Transformers + LLMs' },
      { when: 'Months 10–11', what: 'RAG + Agents' },
      { when: 'Months 12–13', what: 'Fine-tuning + Model Optimization' },
      { when: 'Months 14–15', what: 'MLOps + Model Serving' },
      { when: 'Months 16–18', what: 'Production AI Systems' },
    ],
  },
];

export const TIMELINE_NOTE =
  'The timelines are approximate; projects matter more than completing a calendar schedule. (Timelines assume basic software-engineering knowledge.)';

export interface BuildProject {
  number: number;
  level: string;
  title: string;
  description: string;
  pipeline?: string[];
  /** Island where this project lives, if it is one of the phase projects (or a phase's subject). */
  phaseId?: PhaseId;
  /** progress.projects key shared with that phase's "I built this" toggle. */
  projectId: string;
}

/** "What Should They Build?" — the project-driven ladder. */
export const BUILD_PROJECTS: BuildProject[] = [
  {
    number: 1,
    level: 'Beginner',
    title: 'ML Prediction',
    description: 'Customer churn / house price prediction.',
    phaseId: 'ml-meadow',
    projectId: 'customer-churn-prediction',
  },
  {
    number: 2,
    level: 'Intermediate',
    title: 'Computer Vision',
    description: 'Image classification.',
    phaseId: 'eng-neural-garden',
    projectId: 'image-classification-system',
  },
  {
    number: 3,
    level: 'Intermediate',
    title: 'LLM Application',
    description: 'AI customer-support chatbot.',
    phaseId: 'dev-prompt-workshop',
    projectId: 'ai-customer-support-assistant',
  },
  {
    number: 4,
    level: 'Intermediate+',
    title: 'RAG',
    description: 'Company knowledge-base assistant.',
    phaseId: 'dev-rag-library',
    projectId: 'company-knowledge-assistant',
  },
  {
    number: 5,
    level: 'Advanced',
    title: 'AI Agent',
    description: 'Research / data-analysis agent with tools.',
    phaseId: 'dev-agent-hq',
    projectId: 'ai-research-agent',
  },
  {
    number: 6,
    level: 'Advanced',
    title: 'Fine-Tuning',
    description: 'Fine-tune an open-source model using LoRA/QLoRA.',
    phaseId: 'eng-model-forge',
    projectId: 'fine-tuning-lora',
  },
  {
    number: 7,
    level: 'Advanced',
    title: 'Production AI',
    description: 'Complete SaaS.',
    pipeline: [
      'Next.js',
      'FastAPI',
      'PostgreSQL',
      'pgvector',
      'Redis',
      'LLM',
      'RAG',
      'Agents',
      'Evaluation',
      'Observability',
      'Docker',
      'Cloud',
    ],
    projectId: 'production-ai-complete-saas',
  },
  {
    number: 8,
    level: 'Expert-level',
    title: 'AI Platform',
    description: 'An internal platform where other developers can register models, create prompts, RAG pipelines and agents, run evaluations, monitor production and track cost.',
    phaseId: 'summit',
    projectId: 'ai-platform',
  },
];

export const BUILD_ADVICE = 'Prefer a project-driven roadmap rather than completing dozens of courses.';

/** "One Important Recommendation" progression, top to bottom. Rows with several entries are parallel. */
export const CAREER_LADDER: string[][] = [
  ['Software Engineer'],
  ['AI Fundamentals'],
  ['AI Developer', 'AI Engineer'],
  ['AI Apps', 'ML/DL', 'AI Systems'],
  ['Senior AI Engineer'],
  ['AI Architect / Lead'],
];

export const ENTRY_POINT_NOTE =
  'In practice, AI Developer is an excellent entry point, while you progressively acquire the deeper ML, deep-learning, model-serving and systems knowledge needed to become an AI Engineer.';

// ---------------------------------------------------------------------------
// Lookups & helpers

export const PHASES = Object.fromEntries(PHASE_LIST.map((p) => [p.id, p])) as Record<PhaseId, Phase>;

export const getPhase = (id: PhaseId): Phase => PHASES[id];

export const gemsForPhase = (id: PhaseId): string[] =>
  PHASES[id].groups.flatMap((grp) => grp.topics.map((tp) => gemId(id, tp.id)));

export const allGemIds: string[] = PHASE_IDS.flatMap(gemsForPhase);

export const trackPhases = (track: Track): Phase[] => PHASE_LIST.filter((p) => p.track === track);

/** Topic lookup by gem id (for toasts). */
const TOPIC_BY_GEM = new Map<string, { phase: Phase; topic: Topic }>(
  PHASE_LIST.flatMap((phase) => phase.groups.flatMap((grp) => grp.topics.map((topic) => [gemId(phase.id, topic.id), { phase, topic }] as const))),
);

export const topicForGem = (id: string) => TOPIC_BY_GEM.get(id);

// Content sanity checks (dev only): every phase authored once, gem ids unique.
if (process.env.NODE_ENV !== 'production') {
  if (PHASE_LIST.length !== PHASE_IDS.length || PHASE_IDS.some((id) => !PHASES[id])) {
    throw new Error('roadmap: every PhaseId needs exactly one Phase');
  }
  if (TOPIC_BY_GEM.size !== allGemIds.length) {
    throw new Error('roadmap: duplicate topic ids within a phase');
  }
}
