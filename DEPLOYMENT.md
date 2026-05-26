# LifeLine AI Production Deployment

This deployment is optimized for a stable public hackathon demonstration:

| Component | Target | Folder / Source |
| --- | --- | --- |
| Frontend | Vercel | `frontend/` |
| Backend API | Render | `backend/` through root `render.yaml` |
| PostgreSQL + pgvector | Supabase | Run `database/init.sql` once |
| Graph RAG | Neo4j Aura Free | Configure Aura connection variables on Render |

LifeLine AI is decision-support software, not a diagnostic system. Use synthetic demonstration data only unless a governed clinical deployment has been approved.

## Deployment Order

### 1. Push To GitHub

Create a GitHub repository, then from the repository root run:

```powershell
git init
git add .
git commit -m "Prepare LifeLine AI for production deployment"
git branch -M main
git remote add origin https://github.com/<account>/<repository>.git
git push -u origin main
```

Do not commit `.env` files or real patient data.

### 2. Create Supabase PostgreSQL

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run [`database/init.sql`](database/init.sql) once to create `pgvector` tables, docs tables, and synthetic demonstration seeds.
4. Copy the pooled PostgreSQL connection string for Render.

Required Render values:

```env
DATABASE_URL=postgresql://...
DATABASE_SSL=true
```

The seeded records are synthetic demo data. Do not replace them with patient records for a public showcase.

### 3. Create Neo4j Aura Free

1. Create an Aura Free instance.
2. Save the generated password securely.
3. Add these Render environment variables:

```env
NEO4J_URI=neo4j+s://<instance>.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=<private-aura-password>
```

The backend seeds the demonstration graph with idempotent `MERGE` statements on startup. If Aura is temporarily unavailable, the API continues with its traced local graph fallback.

### 4. Deploy Backend To Render

Use **New > Blueprint** in Render and connect the GitHub repository. Render reads [`render.yaml`](render.yaml).

Backend deployment folder:

```text
backend/
```

Build and start commands configured by the blueprint:

```bash
npm ci --omit=dev && npm run build
npm run start
```

Set these Render environment values:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase pooled Postgres URL |
| `DATABASE_SSL` | `true` |
| `NEO4J_URI` | Aura `neo4j+s://...` URI |
| `NEO4J_USER` | `neo4j` |
| `NEO4J_PASSWORD` | Aura password |
| `JWT_SECRET` | Long generated secret; blueprint can generate it |
| `DOCS_ADMIN_EMAIL` | Private docs administrator email |
| `DOCS_ADMIN_PASSWORD` | Strong private password |
| `DOCS_SUPER_ADMIN_EMAIL`, `DOCS_SUPER_ADMIN_PASSWORD` | Optional private second administrator |
| `CORS_ORIGINS` | Add the Vercel production URL after step 5 |
| `ALLOW_VERCEL_PREVIEWS` | `false`; set `true` only while testing previews |
| `ALLOW_DEMO_ROLE_HEADER` | `false` for production |
| `ENABLE_DEMO_ACCOUNTS` | `false` for production |
| `ALLOW_PRIVILEGED_SELF_REGISTRATION` | `false` for production |
| `LLM_PROVIDER` | `mock` for the reliable no-paid-API demo |

Optional values:

```env
REDIS_URL=
```

Redis is not required for the stable hosted demo. Confirm the API after deployment:

```text
https://<render-service>.onrender.com/api/health
```

Expected health response includes `"status":"ok"` and reports whether database and graph connections are live or using a safe demonstration fallback.

#### Synthetic-Only Judging Mode

Secure production defaults require authenticated protected workflows. For a public hackathon walkthrough using only the seeded fictional records, you may deliberately enable the visible worker/audit demonstration:

```env
# Render, synthetic demonstration only
ALLOW_DEMO_ROLE_HEADER=true
ENABLE_DEMO_ACCOUNTS=true
ALLOW_PRIVILEGED_SELF_REGISTRATION=false

# Vercel, synthetic demonstration only
NEXT_PUBLIC_ENABLE_DEMO_ROLE_HEADER=true
```

Never use this mode with real patient data or a clinical deployment.

### 5. Deploy Frontend To Vercel

Import the same GitHub repository into Vercel and set:

```text
Root Directory: frontend
Framework Preset: Next.js
Build Command: npm run build
```

Add Vercel environment variables:

```env
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com
NEXT_PUBLIC_ENABLE_DEMO_ROLE_HEADER=false
```

After Vercel assigns the production URL, return to Render and set:

```env
CORS_ORIGINS=https://<vercel-project>.vercel.app
```

Redeploy the Render service after changing CORS. For a custom frontend domain, include it as a comma-separated additional origin.

### 6. Publish The Public Docs Page

The default scheduled showcase window is:

```text
June 10, 2026 00:00 UTC through June 14, 2026 23:59:59 UTC
```

To show `/docs` before or after that window:

1. Open `https://<vercel-project>.vercel.app/auth`.
2. Sign in using `DOCS_ADMIN_EMAIL` and `DOCS_ADMIN_PASSWORD` configured on Render.
3. Open `/admin/docs`.
4. Choose **Visible now** and select **Save visibility**.
5. Verify `https://<vercel-project>.vercel.app/docs`.

## Production Environment Checklist

See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for the release checklist.

## Reliability Choices

- `LLM_PROVIDER=mock` is intentionally deterministic, grounded, and requires no paid API.
- Neo4j and PostgreSQL failures surface in `/api/health`; safe demo fallbacks keep the showcase usable while services restart.
- Public docs metrics are anonymous aggregates only.
- Admin docs controls require JWT authentication and do not accept the demo-role header.
- Known local demo clinical accounts and privileged public role registration are disabled in production.
- The safety disclaimer remains visible on guidance surfaces.

## Troubleshooting

### Frontend loads but API calls fail

Check `NEXT_PUBLIC_API_URL` on Vercel and `CORS_ORIGINS` on Render. Both must use the deployed HTTPS URLs without a trailing slash requirement.

### Browser reports a CORS error

Add the exact Vercel production URL to `CORS_ORIGINS` and redeploy Render. For temporary Vercel preview testing only, set `ALLOW_VERCEL_PREVIEWS=true`.

### `/docs` shows Not Available

This is expected outside the publication schedule. Sign in as the privately configured docs admin and turn on the immediate visibility override from `/admin/docs`.

### `/admin/docs` says administrator access is required

Production does not use the public demo admin password. Sign in with the private `DOCS_ADMIN_EMAIL` and `DOCS_ADMIN_PASSWORD` configured in Render.

### API health reports `"database":"fallback"`

Confirm the Supabase connection string, set `DATABASE_SSL=true`, and run `database/init.sql` once in Supabase SQL Editor.

### API health reports `"graph":"fallback"`

Check the Aura URI uses `neo4j+s://`, and confirm the username/password in Render. The demo remains usable with local graph explanations while Aura is unavailable.

### Render free service is waking up

The first API request can be delayed after inactivity on free hosting. Open `/api/health` before presenting, then reload the frontend.

### Docker validation locally

With Docker installed:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

If a prior demo volume predates the docs tables, use `docker compose down -v` only for local synthetic data, then start again.
