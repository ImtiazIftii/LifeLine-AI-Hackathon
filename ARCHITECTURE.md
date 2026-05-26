# Architecture

## Design Goal

LifeLine AI prioritizes an explainable, offline-capable demonstration path: intake to danger-sign scoring, cited context, graph explanation, health worker alert, and audit trace. Clinical decisions remain with qualified people.

## Runtime Topology

```text
Next.js UI :3000
   |
Express API :4000 ---- Redis :6379 (cache-ready / future queues)
   |       |
PostgreSQL + pgvector :5432     Neo4j :7687
```

Docker Compose brings up PostgreSQL with seed SQL, Redis, Neo4j, the API, and the UI. Backend startup writes the Neo4j seed graph using idempotent `MERGE` operations.

## Modules

| Module | Responsibility |
| --- | --- |
| `riskService.js` | Deterministic clinical danger-sign rules and severity levels |
| `ragService.js` | Query rewriting, metadata/keyword search, vector placeholder, citations |
| `chunkingService.js` | Heading/topic/symptom/stage/severity-aware guideline chunks |
| `graphService.js` | Neo4j seeding and stable risk-action path explanations |
| `server.js` | Validated HTTP endpoints, role gates, audit actions, OCR/offline mocks |

## Core Sequence

1. Intake submits demographics, symptoms, and vitals.
2. API stores the patient and applies rules for `Green`, `Yellow`, `Orange`, or `Red`.
3. Retrieval rewrites the query, ranks language-aware guideline chunks, and returns citations.
4. Graph RAG maps matched symptoms or values to a risk/action explanation.
5. Orange/Red output creates an alert marked `requires_human_review`.
6. Audit logging persists score, citations, path, actor role, and disclaimer.

## Storage Model

PostgreSQL owns records, vitals, symptoms, scores, alerts, document metadata, chunks, audits, OCR records, offline cache, and permissions. `guideline_chunks.embedding vector(8)` demonstrates the pgvector contract; production should use a local embedding model with an appropriate dimension and vector index.

Neo4j models `Symptom`, `Condition`, `Risk`, `EmergencyAction`, and `Guideline` nodes connected through `RELATED_TO`, `INCREASES_RISK_OF`, `REQUIRES`, and `SUPPORTED_BY`. Redis is available for cached chunk sets, token throttling, and queued sync events in a scaled deployment.

## Deployment Evolution

- Vercel can host `frontend/` with `NEXT_PUBLIC_API_URL` pointing at the API.
- Render can build `backend/` via `render.yaml`, using managed PostgreSQL/Redis and a hosted or private Neo4j service.
- A production identity provider should replace the visible demonstration role header.
- Local embeddings and an approved clinical knowledge ingestion pipeline should replace retrieval placeholders.
