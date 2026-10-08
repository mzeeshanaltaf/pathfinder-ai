
> **AI Developer:** builds applications using existing AI/ML models and APIs.

> **AI Engineer:** understands the underlying ML/LLM technology and builds, optimizes, evaluates, and operates AI systems in production.

They share the first part of the roadmap, then diverge.

> **➕ Additions (October 2026).** Lists headed **➕ Addition** were added after the original roadmap was written. They come from a ten-part "AI Developer / AI Engineer Roadmap" infographic series (01 Programming & Software Engineering, 02 AI/ML Foundation, 03 Generative AI, 04 LLM Application Engineering, 05 RAG Engineering, 06 AI Agents, 07 Agent Orchestration, 08 AI Evaluation Engineering, 09 AI Observability, 10 AI Security & Guardrails). Only topics the original didn't already cover were added, trimmed to a core set. The series also adds a new AI Developer phase: **Phase 10: AI Observability**. Everything not marked as an addition is the original text.

# AI Developer vs AI Engineer Roadmap

```text
                         SOFTWARE ENGINEERING
                                  │
                                  ▼
                         PYTHON + SQL + APIs
                                  │
                                  ▼
                         AI / ML FUNDAMENTALS
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
              AI DEVELOPER                 AI ENGINEER
                    │                           │
                    ▼                           ▼
             LLM APIs                    Mathematics
             Prompting                  Machine Learning
             RAG                        Deep Learning
             Agents                    Transformers
             AI Apps                   Model Training
             Integration               Model Fine-tuning
                    │                    AI Infrastructure
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                         PRODUCTION AI SYSTEMS
```

---

# Part 1 — Common Foundation

Both paths should start here.

## Phase 1 — Programming Fundamentals

**Duration: 1–2 months**

The person should become comfortable with:

### Python

Learn:

* variables and data types
* conditions
* loops
* functions
* classes
* inheritance
* exceptions
* modules/packages
* virtual environments
* file handling
* JSON
* REST APIs
* HTTP
* async programming
* type hints
* logging
* testing

Then:

* NumPy
* Pandas
* basic data visualization

### Software engineering

Learn:

* Git/GitHub
* Linux command line
* Docker fundamentals
* environment variables
* debugging
* unit testing
* API design

**➕ Addition:**

* cloud fundamentals

### SQL

Learn:

* SELECT
* JOIN
* GROUP BY
* subqueries
* CTEs
* indexes
* transactions
* basic PostgreSQL

### Project

Build:

**Task Management API**

```text
Client
   ↓
FastAPI
   ↓
PostgreSQL
   ↓
Docker
```

This establishes the foundation needed for everything that follows.

---

# Phase 2 — Mathematics for AI

**Duration: 1–2 months**

Don't try to become a mathematician.

Learn enough mathematics to understand ML.

## Linear Algebra

Learn:

* vectors
* matrices
* matrix multiplication
* dot product
* transpose
* norms
* eigenvalues/eigenvectors
* vector spaces

Especially understand:

> Why are embeddings represented as vectors?

---

## Probability

Learn:

* probability
* conditional probability
* Bayes theorem
* probability distributions
* expected value
* variance

---

## Statistics

Learn:

* mean
* median
* standard deviation
* correlation
* sampling
* distributions
* confidence intervals
* hypothesis testing

---

## Calculus

Learn:

* derivatives
* partial derivatives
* gradients
* chain rule
* optimization

Most importantly:

> Understand gradient descent intuitively.

---

# Phase 3 — Machine Learning Fundamentals

**Duration: 2 months**

Now introduce actual ML.

Learn:

### Supervised learning

* regression
* classification
* decision trees
* random forests
* gradient boosting

### Unsupervised learning

* clustering
* dimensionality reduction

### ML concepts

Understand:

* features
* labels
* training
* validation
* testing
* overfitting
* underfitting
* regularization
* bias/variance
* feature engineering

### Evaluation

Learn:

* accuracy
* precision
* recall
* F1
* ROC-AUC
* confusion matrix
* MAE
* MSE
* RMSE

### Tools

* NumPy
* Pandas
* Matplotlib
* Scikit-learn

### Project

Build:

**Customer Churn Prediction**

```text
Dataset
   ↓
Data Cleaning
   ↓
Feature Engineering
   ↓
Train Model
   ↓
Evaluate
   ↓
Save Model
   ↓
FastAPI
   ↓
Prediction API
```

At this point the person has become familiar with traditional ML.

---

# From Here the Two Paths Diverge

---

# 🟢 AI DEVELOPER ROADMAP

An AI Developer's primary goal is:

> **Build useful software products powered by AI.**

They don't necessarily need to train foundation models or deeply understand GPU optimization.

---

# AI Developer — Phase 4

## LLM Fundamentals

**Duration: 1 month**

Learn:

* what LLMs are
* tokens
* tokenization
* embeddings
* context window
* inference
* temperature
* top-p
* hallucination
* model limitations

**➕ Addition:**

* open models
* model selection
* multimodal models (vision, audio, speech, documents)

Understand the basic Transformer architecture conceptually.

Learn APIs from major providers such as:

* OpenAI
* Anthropic
* Google

Don't focus on memorizing SDKs. Understand the concepts.

---

# AI Developer — Phase 5

## Prompt Engineering

**Duration: 2–3 weeks**

Learn:

* system instructions
* user prompts
* few-shot prompting
* structured outputs
* JSON Schema
* Pydantic
* prompt templates
* prompt versioning

**➕ Addition:**

* context engineering

Also learn what **doesn't** work:

* endlessly making prompts longer
* putting business logic entirely inside prompts
* trusting LLM output without validation

### Project

Build:

**AI Customer Support Assistant**

```text
User
 ↓
LLM
 ↓
Structured Response
 ↓
Business Logic
 ↓
Response
```

---

# AI Developer — Phase 6

## RAG

**Duration: 1–2 months**

This should be one of the developer's most important skills.

Learn:

```text
Documents
   ↓
Parsing
   ↓
Chunking
   ↓
Embeddings
   ↓
Vector Database
   ↓
Retrieval
   ↓
LLM
   ↓
Answer
```

Learn:

* embeddings
* vector search
* chunking
* metadata
* similarity search
* hybrid search
* reranking
* citations
* retrieval evaluation

**➕ Addition:**

* parsing & OCR
* vector databases
* metadata filtering
* grounding

Technologies:

* PostgreSQL + pgvector
* Qdrant
* Elasticsearch/OpenSearch

### Project

Build:

**Company Knowledge Assistant**

```text
Admin
 ↓
Upload Documents
 ↓
Ingestion
 ↓
Vector DB
 ↓
User Chat
 ↓
Retrieval
 ↓
LLM
 ↓
Answer + Citations
```

---

# AI Developer — Phase 7

## AI Agents

**Duration: 1–2 months**

Learn:

* tool calling
* function calling
* agent loops
* state
* memory
* planning
* routing
* retries
* human approval

**➕ Addition:**

* ReAct
* workflow patterns (sequential, parallel, conditional, event-driven)

Then learn:

* LangGraph
* OpenAI Agents SDK
* MCP

**➕ Addition:**

* MCP primitives (tools, resources, prompts)

### Project

Build:

**AI Research Agent**

```text
User
 ↓
Planner
 ↓
 ┌───────────┐
 │           │
Web        RAG
Search     Agent
 │           │
 └─────┬─────┘
       ↓
  Research Agent
       ↓
     Report
```

---

# AI Developer — Phase 8

## AI Application Engineering

**Duration: 1–2 months**

Learn:

* streaming responses
* async processing
* background jobs
* caching
* rate limiting
* authentication
* authorization
* multi-tenancy
* API design
* error handling

**➕ Addition:**

* model routing
* semantic caching
* LLM gateways
* cost optimization

Build:

**Production AI SaaS**

For example:

```text
Next.js
   ↓
FastAPI
   ↓
AI Orchestration
   ↓
LLM
   ↓
PostgreSQL
   ↓
pgvector
   ↓
Redis
```

---

# AI Developer — Phase 9

## AI Evaluation & Security

Even an AI Developer needs this.

Learn:

### Evaluation

* test datasets
* LLM-as-a-judge
* hallucination testing
* RAG evaluation
* regression testing

**➕ Addition (agent evaluation):**

* agent task success
* tool-call accuracy
* trajectory evaluation

### Security

* prompt injection
* jailbreaks
* sensitive data leakage
* tool abuse
* authorization
* tenant isolation

**➕ Addition:**

* indirect prompt injection
* input & output guardrails
* least privilege

---

# AI Developer — Phase 10 (➕ Addition)

## AI Observability

You can't fix what you can't see. Go from a black box to full visibility.

Learn:

### Traces

* traces & spans
* LLM & tool call tracing
* retrieval tracing

### Metrics

* latency
* token usage & cost
* success & failure rates

### Logs

* error & request logs
* tool logs
* audit logs

### OpenTelemetry

* OpenTelemetry
* GenAI semantic conventions

Platforms:

* LangSmith
* Langfuse
* Arize Phoenix
* Cloud observability (AWS / Azure / GCP)

Understand:

```text
Traces  |  Metrics  |  Logs
            ↓
      OpenTelemetry
            ↓
LangSmith | Langfuse | Arize Phoenix | Cloud
```

---

# AI Developer Final Skill Set

By the end:

```text
Python
SQL
FastAPI
Git
Docker
     +
LLM APIs
Prompt Engineering
Structured Outputs
RAG
Vector Databases
Agents
Tool Calling
MCP
AI Evaluation
AI Security
Cloud Deployment
```

The person should be capable of taking:

> "We need an AI assistant that answers questions about our company documents."

and turning it into a **working production application**.

---

# 🔵 AI ENGINEER ROADMAP

The AI Engineer follows everything above but goes significantly deeper.

Their goal is:

> **Understand, build, optimize, evaluate, and operate AI/ML systems.**

---

# AI Engineer — Phase 4

## Deep Learning

**Duration: 2–3 months**

Learn:

* neural networks
* perceptrons
* activation functions
* loss functions
* forward propagation
* backpropagation
* gradient descent
* optimizers
* regularization
* batch normalization
* dropout

Then:

* CNN
* RNN
* LSTM
* attention

### Framework

**PyTorch**

This should be the primary deep-learning framework.

### Project

Build:

**Image Classification System**

```text
Images
 ↓
Preprocessing
 ↓
CNN
 ↓
Training
 ↓
Evaluation
 ↓
Inference API
```

---

# AI Engineer — Phase 5

## Transformers

**Duration: 1–2 months**

This is a critical stage.

Understand:

### Transformer architecture

```text
Input
 ↓
Tokenizer
 ↓
Embeddings
 ↓
Positional Information
 ↓
Self Attention
 ↓
Feed Forward
 ↓
Normalization
 ↓
Output
```

Learn:

* attention
* self-attention
* multi-head attention
* positional encoding
* encoder
* decoder
* causal attention
* autoregressive generation

The person should be able to explain:

> **How does an LLM generate the next token?**

without simply saying:

> "The API does it."

---

# AI Engineer — Phase 6

## LLMs & Foundation Models

Learn:

* pretraining
* supervised fine-tuning
* instruction tuning
* RLHF
* preference optimization
* LoRA
* QLoRA
* quantization
* distillation

Understand:

* model parameters
* context length
* inference
* KV cache
* batching
* token throughput
* latency

Learn Hugging Face:

* Transformers
* Datasets
* Tokenizers
* PEFT

---

# AI Engineer — Phase 7

## Advanced RAG

The AI Engineer should go considerably deeper than the AI Developer.

Learn:

### Retrieval

* dense retrieval
* sparse retrieval
* hybrid retrieval
* BM25
* reranking
* query expansion
* query rewriting

### Advanced architectures

* parent-child retrieval
* hierarchical retrieval
* multi-hop retrieval
* graph RAG
* agentic RAG
* contextual retrieval

### Evaluation

Learn:

* Recall@K
* Precision@K
* MRR
* NDCG
* answer faithfulness
* context relevance
* groundedness

**➕ Addition:**

* corrective RAG
* multimodal RAG

---

# AI Engineer — Phase 8

## Agent Architecture

Go beyond using an agent framework.

Understand how agents actually work.

Learn:

```text
                    ┌─────────────┐
                    │   Planner   │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │   Executor  │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │    Tools    │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │    State    │
                    └──────┬──────┘
                           │
                           └────→ Planner
```

Understand:

* agent state
* planning
* tool selection
* reflection
* retries
* state machines
* multi-agent systems
* human-in-the-loop
* long-running agents
* agent memory

**➕ Addition:**

* supervisor agents
* checkpointing
* episodic & semantic memory

---

# AI Engineer — Phase 9

## Model Serving & Inference

This is one of the major differences from an AI Developer.

Learn:

* GPU fundamentals
* CUDA concepts
* GPU memory
* inference optimization
* batching
* quantization
* model parallelism
* distributed inference

Technologies:

* vLLM
* Hugging Face
* Ollama
* TensorRT-LLM

Understand:

```text
User Requests
      ↓
Load Balancer
      ↓
Inference Server
      ↓
GPU
      ↓
LLM
```

And how to optimize:

```text
Latency ↓
Cost ↓
GPU utilization ↑
Throughput ↑
```

---

# AI Engineer — Phase 10

## MLOps / LLMOps

Learn:

* model versioning
* experiment tracking
* model registry
* data pipelines
* model deployment
* monitoring
* drift detection
* evaluation pipelines

**➕ Addition:**

* LLM tracing

Tools:

* MLflow
* Langfuse
* OpenTelemetry
* Prometheus
* Grafana

Understand:

```text
Data
 ↓
Training
 ↓
Evaluation
 ↓
Model Registry
 ↓
Deployment
 ↓
Monitoring
 ↓
Feedback
 ↓
Retraining
```

---

# AI Engineer — Phase 11

## AI Security

Deep dive into:

* prompt injection
* indirect prompt injection
* model extraction
* data poisoning
* adversarial attacks
* jailbreaks
* tool abuse
* excessive agency
* data exfiltration
* model supply-chain security

For enterprise AI:

* RBAC
* ABAC
* RLS
* tenant isolation
* audit logging
* secrets management
* encryption

**➕ Addition (guardrails):**

* guardrails
* agent sandboxing
* MCP security
* AI red teaming

---

# AI Engineer — Phase 12

## Production AI Architecture

Finally, combine everything.

Build systems like:

```text
                         ┌──────────────┐
                         │   Frontend   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │   API Layer  │
                         └──────┬───────┘
                                │
                    ┌───────────▼───────────┐
                    │   AI Orchestration    │
                    └───────────┬───────────┘
                                │
             ┌──────────────────┼─────────────────┐
             │                  │                 │
             ▼                  ▼                 ▼
          Agents              RAG              Tools
             │                  │                 │
             └──────────────────┼─────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
              LLM API       Vector DB      PostgreSQL
                 │
                 ▼
          Evaluation/Tracing
                 │
                 ▼
             Monitoring
```

---

# Side-by-Side Comparison

| Area                 | AI Developer | AI Engineer |
| -------------------- | ------------ | ----------- |
| Python               | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐       |
| Software Engineering | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐       |
| SQL                  | ⭐⭐⭐          | ⭐⭐⭐⭐        |
| Mathematics          | ⭐⭐           | ⭐⭐⭐⭐⭐       |
| Statistics           | ⭐⭐           | ⭐⭐⭐⭐        |
| ML                   | ⭐⭐⭐          | ⭐⭐⭐⭐⭐       |
| Deep Learning        | ⭐⭐           | ⭐⭐⭐⭐⭐       |
| PyTorch              | ⭐⭐           | ⭐⭐⭐⭐⭐       |
| Transformers         | ⭐⭐⭐          | ⭐⭐⭐⭐⭐       |
| LLM APIs             | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐       |
| Prompt Engineering   | ⭐⭐⭐⭐         | ⭐⭐⭐⭐        |
| RAG                  | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐       |
| Agents               | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐       |
| Fine-tuning          | ⭐⭐           | ⭐⭐⭐⭐        |
| Model Training       | ⭐            | ⭐⭐⭐⭐        |
| Model Serving        | ⭐⭐           | ⭐⭐⭐⭐⭐       |
| MLOps                | ⭐⭐           | ⭐⭐⭐⭐⭐       |
| AI Evaluation        | ⭐⭐⭐          | ⭐⭐⭐⭐⭐       |
| AI Security          | ⭐⭐⭐          | ⭐⭐⭐⭐⭐       |
| Product Development  | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐        |
| Research             | ⭐⭐           | ⭐⭐⭐⭐        |

---

# Recommended Timeline

For someone starting with **basic software engineering knowledge**:

### AI Developer

**~9–12 months**

```text
Months 1–2
Python + SQL + APIs
       ↓
Months 3–4
ML Fundamentals
       ↓
Month 5
LLMs + Prompting
       ↓
Months 6–7
RAG
       ↓
Months 8–9
Agents
       ↓
Months 10–12
Production AI Applications
```

With consistent project work, they should be capable of applying for **AI Developer / LLM Developer / Generative AI Developer** roles.

---

### AI Engineer

**~12–18 months**

```text
Months 1–2
Software + Python
       ↓
Months 3–4
Math + ML
       ↓
Months 5–7
Deep Learning + PyTorch
       ↓
Months 8–9
Transformers + LLMs
       ↓
Months 10–11
RAG + Agents
       ↓
Months 12–13
Fine-tuning + Model Optimization
       ↓
Months 14–15
MLOps + Model Serving
       ↓
Months 16–18
Production AI Systems
```

The timelines are approximate; **projects matter more than completing a calendar schedule**.

---

# What Should They Build?

I would strongly recommend a **project-driven roadmap** rather than completing dozens of courses.

### Beginner

**Project 1 — ML Prediction**

Customer churn / house price prediction.

### Intermediate

**Project 2 — Computer Vision**

Image classification.

### Intermediate

**Project 3 — LLM Application**

AI customer-support chatbot.

### Intermediate+

**Project 4 — RAG**

Company knowledge-base assistant.

### Advanced

**Project 5 — AI Agent**

Research / data-analysis agent with tools.

### Advanced

**Project 6 — Fine-Tuning**

Fine-tune an open-source model using LoRA/QLoRA.

### Advanced

**Project 7 — Production AI**

Complete SaaS:

```text
Next.js
    +
FastAPI
    +
PostgreSQL
    +
pgvector
    +
Redis
    +
LLM
    +
RAG
    +
Agents
    +
Evaluation
    +
Observability
    +
Docker
    +
Cloud
```

### Expert-level

**Project 8 — AI Platform**

Build an internal platform where other developers can:

```text
Register Models
       ↓
Create Prompts
       ↓
Create RAG Pipelines
       ↓
Create Agents
       ↓
Run Evaluations
       ↓
Monitor Production
       ↓
Track Cost
```

---

# The Most Important Difference

I'd explain the two careers to the person this way:

### AI Developer

> **"I use AI models to build software."**

They should be excellent at:

**APIs + LLMs + RAG + Agents + Product Development**

---

### AI Engineer

> **"I understand AI models deeply enough to build and operate AI systems."**

They should be excellent at:

**ML + Deep Learning + Transformers + LLMs + RAG + Agents + Evaluation + Infrastructure**

---

## One Important Recommendation

I would **not** make the person choose between the two at the beginning.

Follow this progression:

```text
                    Software Engineer
                           │
                           ▼
                    AI Fundamentals
                           │
                           ▼
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
            AI Developer       AI Engineer
                  │                 │
                  │       ┌─────────┴─────────┐
                  │       │                   │
                  ▼       ▼                   ▼
             AI Apps    ML/DL            AI Systems
                  │       │                   │
                  └───────┴───────────────────┘
                          │
                          ▼
                   Senior AI Engineer
                          │
                          ▼
                  AI Architect / Lead
```

In practice, **AI Developer is an excellent entry point**, while the person can progressively acquire the deeper ML, deep-learning, model-serving, and systems knowledge needed to become an **AI Engineer**.

If this is being used as an actual **career/training roadmap for someone**, I would structure it into **Beginner → Intermediate → Advanced → Job-ready**, with specific courses, books, technologies, and **10–15 portfolio projects at each stage** rather than treating it purely as a list of topics.
