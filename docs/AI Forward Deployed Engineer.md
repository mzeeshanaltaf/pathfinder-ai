
> **AI Forward Deployed Engineer (AI FDE):** embeds with customers and turns general-purpose AI models into working production systems inside their business.

The AI FDE shares the common foundation with the other paths, and most of the AI Developer's LLM phases. Then it adds the field skills: discovery, integration, deployment, evaluation in the field, enterprise security and owning the rollout to go-live.

# AI Forward Deployed Engineer Roadmap

```text
                         SOFTWARE ENGINEERING
                                  │
                                  ▼
                         PYTHON + SQL + APIs
                                  │
                                  ▼
                         AI / ML FUNDAMENTALS
                                  │
                                  ▼
                 LLM APIs · PROMPTING · RAG · AGENTS + MCP
                   (shared with the AI Developer path)
                                  │
                                  ▼
                        CUSTOMER DISCOVERY
                                  │
                                  ▼
                      ENTERPRISE INTEGRATION
                                  │
                                  ▼
                         CLOUD DEPLOYMENT
                                  │
                                  ▼
                   FIELD EVALUATION & OBSERVABILITY
                                  │
                                  ▼
                   ENTERPRISE SECURITY & COMPLIANCE
                                  │
                                  ▼
                   ROLLOUT, ADOPTION & FEEDBACK
                                  │
                                  ▼
                         PRODUCTION AI SYSTEMS
```

---

# What an AI FDE does

An AI FDE embeds with enterprise customers and turns a general-purpose model into a working production system.

* **The work:** discovery and scoping, integrating with messy enterprise systems and data, deploying into the customer's cloud, building evals, guardrails and observability, owning the rollout to go-live, and feeding recurring needs back to the product team.
* **How it differs from neighbouring roles:**
  * An AI Engineer focuses on platforms and models.
  * A solutions or sales engineer demos and validates.
  * A consultant leaves after making recommendations.
  * The FDE writes production code and stays through adoption.
* **Who hires them:** AI labs such as Anthropic and OpenAI post FDE roles (Python, production LLM experience with prompting, agents and evals, MCP servers, 25–50 % travel). Palantir originated the role.
* **What postings ask for:** Python (~89 %), prompt engineering, RAG, cloud (AWS/GCP/Azure), Docker and Kubernetes. About 90 % of postings stress direct client work.

> “I make AI work inside real customers' businesses.”

---

# Part 1 — Common Foundation

Same as the AI Developer and AI Engineer paths: see Phases 1–3 of [AI Engineer-Developer.md](AI%20Engineer-Developer.md).

* Phase 1 — Programming Fundamentals (Python, software engineering, SQL; Task Management API)
* Phase 2 — Mathematics for AI
* Phase 3 — Machine Learning Fundamentals (Customer Churn Prediction)

---

# Part 2 — Shared with the AI Developer path

The AI FDE builds with existing models, like the AI Developer. Take these four phases from the AI Developer path in [AI Engineer-Developer.md](AI%20Engineer-Developer.md):

* Phase 4 — LLM Fundamentals
* Phase 5 — Prompt Engineering (AI Customer Support Assistant)
* Phase 6 — Retrieval-Augmented Generation (Company Knowledge Assistant)
* Phase 7 — AI Agents, including MCP (AI Research Agent)

MCP matters even more for an FDE: MCP servers are how a customer's internal tools get connected to the model.

---

# Part 3 — AI FDE Path

## Phase 8 — Customer Discovery & Scoping

**Duration: ~1 month**

Before writing code, find out what the customer actually needs, and agree what success looks like.

Learn:

* stakeholder interviews
* asking good questions (the Mom Test)
* workflow mapping
* problem statements
* success metrics / ROI
* constraints (data, security, latency, budget)
* use-case prioritization
* MVP scoping
* build vs buy
* managing expectations

What doesn't work:

* building before you understand the workflow
* promising accuracy you haven't measured
* scoping a whole platform instead of one workflow

Key question:

> What does success look like for this customer, in numbers?

### Project

**Discovery Brief**

```text
Stakeholder Interviews
   ↓
Workflow Map
   ↓
Problem Statement
   ↓
Success Metrics
   ↓
Scoped MVP
```

---

## Phase 9 — Enterprise Data & Integration

**Duration: ~1 month**

Real customers have old systems, messy data and strict access rules. The model is the easy part.

Learn:

* reading unfamiliar API docs
* OAuth2 / JWT
* SSO (SAML / OIDC)
* webhooks
* ETL / ELT
* messy data cleaning
* document ingestion (PDF / OCR)
* CRM / ticketing systems
* data warehouses
* idempotency & retries
* MCP servers for internal tools

Tools:

* Postman
* Airflow
* dbt
* MCP SDKs

### Project

**Enterprise Support Agent**

```text
Ticket
   ↓
Webhook
   ↓
Agent
   ↓
Knowledge Base | CRM Lookup
   ↓
Draft Reply
   ↓
Human Approval
   ↓
Ticket Update
```

---

## Phase 10 — Deployment & Cloud

**Duration: ~1 month**

Ship into the customer's environment, which is often their own cloud account, their own network, or no internet at all.

Learn:

* Docker
* Kubernetes basics
* AWS / Azure / GCP
* IAM
* networking (VPC, private endpoints, TLS)
* infrastructure as code
* CI/CD
* staging → production
* VPC / on-prem / air-gapped deployments
* cloud model endpoints (Bedrock / Azure OpenAI / Vertex)
* cost control

Tools:

* Terraform
* GitHub Actions
* Helm
* AWS Bedrock
* Azure OpenAI
* Google Vertex AI

### Project

**Deploy into a Customer Cloud**

```text
Git Push
   ↓
CI Tests
   ↓
Container Image
   ↓
Registry
   ↓
Terraform
   ↓
Staging
   ↓
Smoke Tests
   ↓
Production
```

---

## Phase 11 — Field Evaluation & Observability

**Duration: ~1 month**

Prove it works on the customer's real tasks, and find out fast when it stops working.

Learn:

* golden datasets from real tasks
* LLM-as-judge
* offline vs online evals
* A/B tests
* tracing (OpenTelemetry, Langfuse / LangSmith)
* latency & cost tracking
* guardrails
* fallbacks & timeouts
* debugging non-deterministic output
* regressions after model upgrades
* postmortems

Tools:

* Langfuse
* LangSmith
* OpenTelemetry

### Project

**Customer Eval Harness**

```text
Real Tasks
   ↓
Golden Dataset
   ↓
Run Pipeline
   ↓
Rules | LLM-as-Judge
   ↓
Scorecard
   ↓
Regression Gate
```

---

## Phase 12 — Enterprise Security & Compliance

**Duration: ~1 month**

Enterprise customers say yes only after their security team does.

Learn:

* PII detection & redaction
* encryption
* secrets management
* RBAC
* tenant isolation
* data residency & retention
* SOC 2 / GDPR / HIPAA
* audit logs
* OWASP Top 10 for LLMs
* security reviews & questionnaires

Tools:

* Microsoft Presidio
* HashiCorp Vault
* Cloud KMS

### Project

**Document-Processing Workflow**

```text
PDF Upload
   ↓
Parsing
   ↓
PII Redaction
   ↓
Structured Extraction
   ↓
Validation
   ↓
Human Review
   ↓
System of Record
```

---

## Phase 13 — Rollout, Adoption & Feedback

**Duration: ~1 month**

A system nobody uses has failed. The FDE stays until the customer's team owns it, and brings what they learned back to the product.

Learn:

* demos & pilots
* go-live plans
* user training
* runbooks & docs
* handoff to the customer team
* change management
* adoption & ROI measurement
* architecture decision records
* technical writing
* field → product feedback
* reusable components

What doesn't work:

* throwing the system over the wall at go-live
* measuring success by demos instead of adoption

### Project

**Client Case Study**

Build a portfolio of 2–3 deployed case studies, each with a postmortem.

```text
Problem
   ↓
Architecture
   ↓
Decisions (ADRs)
   ↓
Evals
   ↓
Latency | Cost | Accuracy
   ↓
Postmortem
```

---

# Side-by-Side Comparison

Stars for the AI Developer and AI Engineer come from [AI Engineer-Developer.md](AI%20Engineer-Developer.md). The last three rows are new to this roadmap.

| Area                   | AI Developer | AI Engineer | AI FDE |
| ---------------------- | -----------: | ----------: | -----: |
| Python                 |         ★★★★ |       ★★★★★ |   ★★★★ |
| Software Engineering   |         ★★★★ |       ★★★★★ |   ★★★★ |
| SQL                    |          ★★★ |        ★★★★ |   ★★★★ |
| Mathematics            |           ★★ |       ★★★★★ |     ★★ |
| Statistics             |           ★★ |        ★★★★ |     ★★ |
| ML                     |          ★★★ |       ★★★★★ |    ★★★ |
| Deep Learning          |           ★★ |       ★★★★★ |     ★★ |
| PyTorch                |           ★★ |       ★★★★★ |      ★ |
| Transformers           |          ★★★ |       ★★★★★ |    ★★★ |
| LLM APIs               |        ★★★★★ |       ★★★★★ |  ★★★★★ |
| Prompt Engineering     |         ★★★★ |        ★★★★ |  ★★★★★ |
| RAG                    |        ★★★★★ |       ★★★★★ |  ★★★★★ |
| Agents                 |        ★★★★★ |       ★★★★★ |  ★★★★★ |
| Fine-tuning            |           ★★ |        ★★★★ |     ★★ |
| Model Training         |            ★ |        ★★★★ |      ★ |
| Model Serving          |           ★★ |       ★★★★★ |    ★★★ |
| MLOps                  |           ★★ |       ★★★★★ |    ★★★ |
| AI Evaluation          |          ★★★ |       ★★★★★ |   ★★★★ |
| AI Security            |          ★★★ |       ★★★★★ |   ★★★★ |
| Product Development    |        ★★★★★ |        ★★★★ |   ★★★★ |
| Research               |           ★★ |        ★★★★ |      ★ |
| Customer Communication |          ★★★ |          ★★ |  ★★★★★ |
| Enterprise Integration |          ★★★ |         ★★★ |  ★★★★★ |
| Cloud Deployment       |          ★★★ |        ★★★★ |  ★★★★★ |

---

# Final AI FDE Skill Set

```text
Python + SQL + APIs + Git + Docker + Cloud
                  +
LLM APIs
Prompt Engineering
RAG
Agents
MCP
Enterprise Integration
Cloud Deployment
Evals & Observability
Security & Compliance
Customer Discovery
Technical Writing
```

Capable of taking:

> “Our support team is drowning in tickets. Can AI help, inside our own systems and our own cloud?”

from the first discovery call to a live, measured rollout.

The AI FDE is excellent at:

* Customer Discovery
* LLMs
* RAG
* Agents
* Integration
* Deployment
* Evaluation

---

# Timeline

**~10–12 months**

| When        | What                              |
| ----------- | --------------------------------- |
| Months 1–2  | Python + SQL + APIs               |
| Month 3     | ML Fundamentals                   |
| Months 4–5  | LLMs + Prompting + RAG            |
| Month 6     | Agents + MCP                      |
| Month 7     | Customer Discovery                |
| Month 8     | Enterprise Integration            |
| Month 9     | Deployment & Cloud                |
| Month 10    | Field Evals & Observability       |
| Month 11    | Enterprise Security & Compliance  |
| Month 12    | Go-live + case-study portfolio    |

With 2–3 deployed case studies (with postmortems) in your portfolio: ready to apply for AI Forward Deployed Engineer / AI Solutions Engineer roles.

---

# Career Ladder

The AI FDE is a third rung beside the AI Developer and the AI Engineer:

```text
Software Engineer
        ↓
AI Fundamentals
        ↓
AI Developer · AI Engineer · AI FDE
        ↓
AI Apps · ML/DL · AI Systems · AI Solutions
        ↓
Senior AI Engineer
        ↓
AI Architect / Lead
```

The FDE grows into **AI Solutions**: leading enterprise deployments and shaping reusable solutions from what the field keeps asking for.

---

# Sources

* KDnuggets, “7 Steps to Become a Forward Deployed Engineer in 2026”
* fde.academy, FDE roadmap
* Paraform, AI Forward Deployed Engineer guides
* Alexey Grigorev, “What AI FDEs do”
* Wikipedia, “Forward Deployed Engineer”
* Anthropic and OpenAI Forward Deployed Engineer job postings
