# Phase 4: Concept Simulations (Bespoke Mini-games)

> Read [CLAUDE.md](../../CLAUDE.md) and [status.md](../../status.md) first. Requires Phase 3 (host, registry, `MiniGameProps`, `data/minigames.ts`).

## Goal
Replace the temporary engine-based games with **hands-on simulations that make the core concept click**. This is the app's main "aha" content. Each sim runs 30–90 seconds, has a clear win condition that maps to 1–3 stars, and ends with a recap tied to topic bites.

## Implementation notes
- Each sim is one file in `components/minigames/sims/`, registered in `registry.ts`. Update the phase's entry in `data/minigames.ts` (id, title, howTo, config, recapTopicIds).
- Render with SVG or a 2D `<canvas>` inside the overlay (no second R3F canvas unless there's a clear benefit). Animate with `requestAnimationFrame` + refs.
- All controls are sliders, buttons or tap/drag with pointer events, and must work at 375px width.
- Use the toon/pastel look: thick outlines and rounded shapes consistent with the panels.
- **Do 1–2 sims per sub-task and verify each before moving on.** If the session runs long, record which sims are done in status.md; the rest can carry over.

## Sims (PhaseId → sim)
1. **`math-mountain` → `gradient-descent`:** a 1D (optionally 2D contour) loss curve with a ball. The player picks a learning rate and presses Step/Run. Too high oscillates or diverges, too low crawls. Win: reach the global minimum within N steps. Stars by step count. Bonus: a "chain rule" hint card.
2. **`ml-meadow` → `curve-fit`:** noisy points + a polynomial-degree slider. Live train vs validation error bars. Win: pick a degree where validation error is lowest. Show labels "Underfitting" / "Overfitting". Teaches bias/variance and regularisation.
3. **`dev-llm-lighthouse` → `temperature`:** a sentence prefix with a next-token probability bar chart (a fixed hand-made distribution). Temperature and top-p sliders reshape the bars live, and "Sample ×10" shows outputs. Tasks: "make it deterministic", "make it creative but sane", "cause a hallucination-like oddity". Stars by tasks completed.
4. **`dev-rag-library` → `chunk-retrieve`:**
   - Step 1: tap to place chunk boundaries in a short document (feedback on chunks that are too big or too small).
   - Step 2: a query arrives; pick the top-3 chunks that answer it (similarity scores revealed after).
   - Step 3: the "answer + citations" card is assembled.

   Stars by chunk quality + retrieval precision.
5. **`dev-shield-fort` → `injection-defense`:** inputs fly toward the fort. Swipe or tap to block malicious ones (prompt injection, jailbreak, data-leak requests, tool abuse) and let safe ones through. Speed ramps up. Config `difficulty: 'normal' | 'hard'`. Each miss shows a "why" card.
6. **`eng-security-citadel` → `injection-defense` (hard):** adds indirect injection (hidden in retrieved docs), exfiltration and excessive-agency items.
7. **`eng-neural-garden` → `perceptron`:** 2D points of two colours. Weight sliders w1, w2 and bias b move a decision line. Win: separate them (an accuracy meter). A second round shows non-separable XOR data and a "you need a hidden layer" reveal, which teaches why deep learning exists.
8. **`eng-transformer-tower` → `attention-beams`:** a sentence like "The robot picked up the ball because **it** was light". Tap the word the highlighted token attends to most, and beams of varying thickness animate (hand-authored attention weights). 4–5 rounds include a causal-mask round (future tokens greyed out). Ends with "how the next token is generated" as an animated autoregressive loop.
9. **`eng-model-forge` → `fit-the-gpu`:** a GPU memory bar (e.g. 24 GB) and a model (e.g. 13B params). Toggle full FT / LoRA / QLoRA and FP16 / INT8 / 4-bit quantisation, and see memory and a quality meter change (use simplified, clearly labelled illustrative numbers). Win: fit within memory while keeping quality above a threshold. 3 scenarios.
10. **`eng-deep-archive` → `rank-it`:** a query + 6 retrieved results with hidden relevance grades. Drag to reorder, with live Recall@3, MRR and NDCG gauges. Win: NDCG ≥ threshold. Stars by NDCG. Teaches what reranking buys you.
11. **`eng-gpu-plant` → `batching`:** requests arrive on a timeline. Pick a batch size / max-wait and run, with live throughput, p95 latency and GPU utilisation gauges. Win: maximise throughput while p95 stays under the SLA. Show the "Latency ↓ Cost ↓ GPU util ↑ Throughput ↑" scoreboard from the doc.
12. **`eng-mlops-conveyor` → `drift-watch`:** a live monitoring dashboard (accuracy line + input-distribution histogram vs baseline). When drift appears, the player must hit "Trigger retraining" at the right time (too early wastes cost, too late loses accuracy). Then they order the retraining loop steps (Data → Training → Evaluation → Model Registry → Deployment → Monitoring → Feedback).
13. **`summit` → `final-assembly`:** an interactive version of the doc's production architecture diagram. Drag components (Frontend, API Layer, AI Orchestration, Agents, RAG, Tools, LLM API, Vector DB, PostgreSQL, Evaluation/Tracing, Monitoring) into the layered slots. Completing it shows the "You've reached the Summit" moment (the certificate itself comes in Phase 5).

## Acceptance criteria
- All 13 phase assignments (12 distinct sims; `injection-defense` is shared) are registered and assigned. No phase still uses a temporary config (except where status.md records a deliberate carry-over).
- Each sim is winnable, gives 1–3 stars, has a "How to play" intro and a recap, and works with mouse and touch at 375px width.
- Illustrative numbers (GPU memory, attention weights, probabilities) are labelled "illustrative" in the UI.
- `npm run build` passes; the sims are lazy chunks.
