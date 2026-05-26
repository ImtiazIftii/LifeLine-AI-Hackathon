# LifeLine AI

LifeLine AI is a deployable hackathon MVP for maternal emergency decision support in low-connectivity settings. It combines deterministic emergency risk rules, contextual retrieval over cited guideline chunks, Neo4j graph explanations, OCR ingestion simulation, offline queuing, and a health worker review dashboard. It does **not** diagnose patients or act autonomously.

## Demo Flow

1. Open `http://localhost:3000/intake` and submit the prefilled example: BP `150/96`, headache, and swelling.
2. The rule service assigns `Red` severity and a risk score, retrieves cited hypertension guidance, and explains `Headache -> Hypertension -> Preeclampsia -> Emergency Referral`.
3. A Red alert is added to the health worker dashboard and marked for human review.
4. Open `/audit` to show the risk score, retrieved context, graph path, role, and safety disclaimer captured for accountability.
5. Demonstrate `/offline`, `/ocr`, `/assistant`, `/analytics`, `/provenance`, and the English/Bangla toggle.
6. Sign in as `admin@lifeline.demo`, open `/admin/docs`, select **Visible now**, and save visibility to publish the investor/technical showcase immediately; then open `/docs`.

## Architecture

| Layer | Implementation |
| --- | --- |
| UI | Next.js App Router, Tailwind CSS, Chart.js; Vercel-ready |
| API | Node.js/Express modular services; Render-ready |
| Records and vectors | PostgreSQL 16 with `pgvector`; 10 metadata-rich seeded chunks |
| Graph RAG | Neo4j Community with maternal danger-path seed graph and local fallback |
| Cache/offline | Redis plus simulated offline event queue and SMS fallback |
| AI runtime | Retrieval-template fallback by default; configuration for Ollama, llama.cpp, and vLLM |
| OCR | Upload and structured extraction placeholder for Tesseract/EasyOCR integration |
| Automation | Example n8n, Airflow, LangGraph, and Prefect workflows |
| Analytics export | Anonymized CSV demo module with Parquet/lakehouse evolution guidance |

More detail is in [ARCHITECTURE.md](ARCHITECTURE.md).

## Production Deployment

Recommended hosted deployment:

| Service | Target | Deploy folder |
| --- | --- | --- |
| Frontend | Vercel | `frontend/` |
| Backend | Render | `backend/` via root `render.yaml` |
| Database | Supabase/PostgreSQL with pgvector | Run `database/init.sql` once |
| Graph database | Neo4j Aura Free | Set Aura connection environment variables |

Deployment configuration is included in `frontend/vercel.json`, `render.yaml`, `.env.example`, `frontend/.env.example`, and `backend/.env.example`. Use [DEPLOYMENT.md](DEPLOYMENT.md) for exact commands and environment variables, and [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) before publishing a public URL.

Production defaults disable the visible demo-role header, known clinical demo accounts, and privileged public role registration. Docs editing requires private Admin/Super Admin sign-in credentials supplied as Render environment variables. Do not publish the local `Demo123!` docs admin password in a deployed environment.

For a public judging walkthrough using seeded fictional records only, [DEPLOYMENT.md](DEPLOYMENT.md) documents an explicit synthetic-demo mode that restores frictionless health worker screens. It must never be enabled with real patient data.

## Quick Start

Requirements: Docker Desktop or Docker Engine with Compose.

```bash
cp .env.example .env
docker compose up --build
```

On PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Public showcase/documentation: `http://localhost:3000/docs`
- Docs administration: `http://localhost:3000/admin/docs`
- Backend health: `http://localhost:4000/api/health`
- Neo4j browser: `http://localhost:7474` using `neo4j` / `lifeline_graph_password` unless changed in `.env`

Stop services with `docker compose down`. To reset seeded persistent data during development, run `docker compose down -v` intentionally.

### Local UI/API Development

To run the frontend and backend directly without Docker:

```powershell
npm --prefix backend install
npm --prefix frontend install
npm run dev
```

This starts the UI at `http://localhost:3000` and API at `http://localhost:4000`. Without Docker services or a configured `.env`, the API intentionally uses its in-memory seeded demo fallback; run with Compose to exercise PostgreSQL, Neo4j, and Redis together.

### Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Mother | `mother@lifeline.demo` | `Demo123!` |
| Health Worker | `worker@lifeline.demo` | `Demo123!` |
| Doctor/Admin | `doctor@lifeline.demo` | `Demo123!` |
| Docs Admin | `admin@lifeline.demo` | `Demo123!` |
| Docs Super Admin | `superadmin@lifeline.demo` | `Demo123!` |

Clinical demo pages use an explicitly marked demo-role header to keep judging friction low. Docs administration already requires a signed-in Admin/Super Admin JWT; production must require authenticated sessions for every protected workflow.

## Public Docs Showcase

`/docs` is a YC-style presentation, technical documentation portal, and live aggregate dashboard. It includes the product narrative, system and data-flow SVG diagrams, API documentation, responsible AI commitments, team cards, roadmap, metrics, and changelog. Search, mobile navigation, printable PDF export, Markdown export, and link sharing are included.

Public availability follows the seeded schedule of **June 10, 2026 00:00 UTC through June 14, 2026 23:59:59 UTC**. Outside that window the page returns a controlled **Not Available** state. Sign in with the seeded Docs Admin or Docs Super Admin account before managing `/admin/docs` to:

- override visibility ON or OFF immediately, or return to scheduled publication;
- edit section-based structured content, save drafts, publish, and reorder sections;
- add team profiles with optional picture and social links; and
- view the publication version history placeholder.

The docs dashboard returns aggregate synthetic/demo counts only; it does not expose patient identity or record-level data. The same clinical safety disclaimer remains visible: AI output is decision-support guidance, not a medical diagnosis, and urgent symptoms require qualified healthcare review.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a role-bearing user |
| POST | `/api/auth/login` | Sign in and issue JWT |
| POST / GET / GET | `/api/patients`, `/api/patients`, `/api/patients/:id` | Intake and care registry |
| POST | `/api/risk/analyze` | Rule scoring, RAG retrieval, graph path, alert, audit |
| POST | `/api/assistant/query` | Cited decision-support response |
| POST | `/api/ocr/extract` | Mock structured OCR extraction |
| GET | `/api/graph/risk-path?symptoms=headache,swelling` | Seeded graph explanation |
| POST / GET | `/api/alerts`, `/api/alerts` | Referral alert workflow |
| GET | `/api/analytics` | Screening and severity analytics |
| GET | `/api/audit-logs` | Doctor/admin accountability view |
| GET | `/api/provenance` | Sources, pipeline, model limitations |
| POST | `/api/rag/chunk` | Semantic chunking demonstration |
| POST | `/api/offline/queue`, `/api/offline/sync` | Connectivity simulation |
| GET | `/api/docs/public` | Scheduled published showcase payload |
| GET / POST | `/api/docs/settings` | Token-authenticated admin visibility and schedule |
| GET / POST / PUT / DELETE | `/api/docs/sections`, `/api/docs/sections/:id` | Token-authenticated admin authoring |
| POST | `/api/docs/publish` | Token-authenticated admin publication and version recording |
| GET / POST | `/api/docs/team` | Visible public team directory / admin creation |
| GET | `/api/docs/metrics` | Visible anonymized docs dashboard totals |

## Seed Data

`database/init.sql` installs `pgvector`, creates the required clinical/demo tables, and seeds five patients, five risk scores, five alerts, five audit logs, two document sources, and ten guideline chunks in Bangla and English. It also creates `docs_sections`, `docs_settings`, `docs_versions`, `team_members`, and `docs_changelog`, seeded with 25 showcase sections and publication metadata. The API carries matching fallback docs content so a UI demonstration remains available if an optional service is starting or disconnected. Neo4j is seeded at backend startup with symptom, condition, risk, emergency action, and guideline nodes plus more than eight relationships.

When upgrading an already initialized local Docker database from an earlier version of this MVP, intentionally run `docker compose down -v` before `docker compose up --build` to apply the newly seeded docs tables. This removes only the local demo volume and must not be used for real patient data.

## Local AI and Retrieval

No paid API is required. `LLM_PROVIDER=mock` uses a deterministic, cited response template. The assistant adapter can call a locally running Ollama, llama.cpp, or vLLM service when configured as described in [LOCAL_LLM.md](LOCAL_LLM.md), and safely falls back when unavailable. Hybrid retrieval currently demonstrates keyword and metadata relevance with a deterministic vector-similarity placeholder while the PostgreSQL schema includes a real `vector(8)` embedding column for replacement with local embeddings.

## Responsible AI

Every assistant and risk response displays:

> This is decision-support guidance, not a medical diagnosis. For emergency symptoms, contact a qualified healthcare provider immediately.

Red and Orange results create alerts requiring human review. The audit design retains risk outcome, citations, graph path, role, and disclaimer. The MVP contains synthetic/demo patient information only; deployment with real records requires consent, privacy review, encryption, authenticated RBAC enforcement, clinical validation of content and rules, and local emergency workflow approval. See [RESPONSIBLE_AI.md](RESPONSIBLE_AI.md) and [DATA_PROVENANCE.md](DATA_PROVENANCE.md).

## Limitations

- Risk scoring is transparent rule logic for demonstration and is not a validated clinical prediction model.
- OCR returns structured example fields rather than executing Tesseract/EasyOCR.
- Vector similarity is represented by a deterministic fallback until local embeddings are connected.
- Graph traversal is seeded in Neo4j, while API explanation uses equivalent local paths for reliable offline demonstration.
- Bangla content is illustrative and requires clinical/language review before care use.
- n8n, Airflow, LangGraph, and Prefect files are integration examples and are not launched by Compose.

## Hackathon Presentation Script

“A pregnant mother in a low-connectivity village reports headache and swelling. Her community worker enters BP of 150 over 96. LifeLine instantly flags a Red danger signal, but does not diagnose: it cites the guidance that elevated BP with these symptoms needs urgent assessment. The graph explains the reasoning path from headache to preeclampsia concern to emergency referral. On the worker dashboard, a new alert demands human review. In the audit trail, judges can see exactly which source chunk and pathway informed that signal. When connectivity fails, the same emergency rules and cached guidance log the event and prepare an SMS fallback. This is local-first, transparent decision support built to help care teams act earlier, responsibly.”

## Repository Map

```text
frontend/       Next.js/Tailwind interface
backend/        Express API and decision-support services
database/       PostgreSQL/pgvector schema and demo seeds
workflows/      Automation integration examples
lakehouse/      Anonymized analytics export example
```
