## Screenshots
(screenshots/homepage.jpeg)

# LifeLine AI

LifeLine AI is a fully free, local-first demonstration of an AI-powered maternal health emergency risk assistant. It uses open-source/self-hosted components only and is designed for seeded demo workflows, not real patient care.

Safety disclaimer shown in the app and API:

> This system is a decision-support prototype and does not replace doctors.

## What The Demo Does

1. Upload a prescription/report image, PDF, or seeded text sample.
2. Extract text with local Tesseract OCR for images, local PDF text extraction for PDFs, or seeded fallback text for reliable offline demos.
3. Extract structured fields with a deterministic local parser, with optional Ollama or Groq-assisted OCR field extraction when configured.
4. Classify risk as `Green`, `Yellow`, `Orange`, or `Red` using transparent decision-support rules.
5. Retrieve relevant local WHO/DGHS-style maternal guidance samples.
6. Show a Graph RAG pathway such as `headache/swelling/high BP -> hypertension -> preeclampsia risk -> emergency referral`.
7. Generate local nutrition decision-support meal plans from pregnancy week, symptoms, hemoglobin/BP, budget, food preference, allergies, Bangladesh food CSV data, and maternal nutrition guideline RAG.
8. Display a healthcare-worker dashboard with patient summary, risk level, explanation, recommendations, Bangla explanation, citations, and review queue.

No OpenAI, Claude, Gemini, Pinecone, paid OCR, paid SMS, or paid cloud API is required. Groq support is optional and disabled unless you provide your own API key.

## Free Local Stack

| Layer | Implementation |
| --- | --- |
| Frontend | Next.js multi-page app + Tailwind CSS |
| Backend | FastAPI |
| OCR | Tesseract OCR via `pytesseract`; `pypdf` for PDF text |
| LLM reasoning | Deterministic fallback by default; optional Ollama local runtime or Groq OpenAI-compatible API for OCR, Assistant, and Nutrition |
| RAG | Local JSON WHO/DGHS sample chunks with keyword and metadata retrieval |
| Nutrition AI | Local rules + Bangladesh food CSV + maternal nutrition markdown RAG; optional Ollama note only |
| Vector DB path | PostgreSQL + pgvector service is included for local extension work |
| Graph RAG | In-memory NetworkX-style fallback path; Neo4j Community service is included for local extension work |
| Database | Seeded local files plus PostgreSQL container for demo evolution |
| Charts | Chart.js / react-chartjs-2 |
| Deployment | Docker Compose local deployment only |

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

- Demo dashboard: `http://localhost:3000`
- Backend health: `http://localhost:4000/api/health`
- Neo4j browser: `http://localhost:7474` using `neo4j` / `lifeline_graph_password` unless changed

To reset local demo volumes:

```bash
docker compose down -v
```

Use this only for local synthetic/demo data. Never seed real patient data into this repository.

## Demo Samples

Bundled records are available both in the UI and under `samples/`:

- `samples/sample-red-preeclampsia.txt`
- `samples/sample-yellow-anemia.txt`
- `samples/sample-green-routine.txt`

The API also bundles local guidance files under `backend/data/`:

- `guidance.json`: WHO/DGHS-style sample maternal guidance chunks in English and Bangla
- `sample_records.json`: text records used by OCR fallback and the UI

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service status, free-stack confirmation, disclaimer |
| GET | `/api/samples` | Seeded sample records |
| POST | `/api/ocr/extract` | Upload image/PDF/text and return OCR text plus fields |
| POST | `/api/nutrition/plan` | Local risk-aware maternal nutrition plan and Bangla explanation |
| POST | `/api/llm/extract` | Structured extraction from OCR text |
| POST | `/api/risk/classify` | Risk classification only |
| POST | `/api/rag/retrieve` | Local RAG retrieval only |
| POST | `/api/graph/reason` | Graph reasoning only |
| POST | `/api/demo/analyze` | End-to-end text analysis |
| GET | `/api/dashboard` | Seeded dashboard and offline-first notes |
| GET | `/api/docs/public` | Public documentation/showcase page data |
| GET/POST | `/api/docs/settings` | Docs admin visibility controls |
| GET/POST/PUT/DELETE | `/api/docs/sections` | Docs admin section editor |
| GET | `/api/analytics` | Healthcare analytics page data |
| GET | `/api/audit-logs` | Responsible AI audit page data |
| POST | `/api/assistant/query` | Grounded assistant page response |

## Local Development

Install dependencies once:

```powershell
pip install -r backend/requirements.txt
npm --prefix frontend install
```

Start both the FastAPI backend and Next.js frontend:

```powershell
npm run dev
```

Or run them separately:

```powershell
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 4000 --reload
npm --prefix frontend run dev
```

Optional local LLM:

```powershell
ollama pull llama3.1:8b
$env:LLM_PROVIDER="ollama"
$env:OLLAMA_BASE_URL="http://localhost:11434"
$env:OLLAMA_MODEL="llama3.1:8b"
```

Optional Groq OCR, Assistant, and Nutrition reasoning:

```powershell
$env:LLM_PROVIDER="groq"
$env:GROQ_API_KEY="your-groq-api-key"
$env:GROQ_MODEL="llama-3.1-8b-instant"
```

The deterministic parser remains the safety-first default so the demo works offline after dependencies and images are built.

## Offline-First Notes

- Guidance and sample records are stored in the repository.
- Risk rules, retrieval, graph reasoning, and Bangla explanation run locally.
- OCR runs with bundled Tesseract inside the backend container.
- Ollama is optional and self-hosted; Groq is optional when an API key is configured. Unavailable LLM calls fall back safely.
- No paid SMS provider is used. Any emergency alert is a dashboard/review artifact only.
- Risk output is traceable through structured fields, rule reasons, retrieved citations, graph path, and disclaimer.

## Responsible AI

LifeLine AI does not diagnose. `Red` and `Orange` outputs mean the prototype found configured danger signs that need human review. All guidance files are demonstration samples and require clinical and language validation before any real-world use.

Treat real patient data as sensitive. Do not commit real records, images, prescriptions, reports, names, phone numbers, or addresses.
