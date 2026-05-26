# Production Environment Checklist

## Before Deployment

- [ ] Repository contains no real patient data, secrets, or `.env` files.
- [ ] Supabase is initialized once with `database/init.sql`.
- [ ] Neo4j Aura credentials are saved privately.
- [ ] `LLM_PROVIDER=mock` remains configured unless a controlled local-runtime deployment is intentionally supported.
- [ ] Clinical safety disclaimer remains present on user-facing guidance.

## Render Backend

- [ ] Root blueprint `render.yaml` is applied and service health path is `/api/health`.
- [ ] `DATABASE_URL` points to Supabase and `DATABASE_SSL=true`.
- [ ] `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD` point to Aura.
- [ ] `JWT_SECRET` is long, random, and private.
- [ ] `DOCS_ADMIN_EMAIL` and `DOCS_ADMIN_PASSWORD` are private values.
- [ ] `ALLOW_DEMO_ROLE_HEADER=false`.
- [ ] `ENABLE_DEMO_ACCOUNTS=false` and `ALLOW_PRIVILEGED_SELF_REGISTRATION=false`.
- [ ] `CORS_ORIGINS` contains only deployed frontend origins.
- [ ] `/api/health` returns `status: ok`.

## Vercel Frontend

- [ ] Vercel root directory is `frontend/`.
- [ ] `NEXT_PUBLIC_API_URL` is the deployed Render HTTPS URL.
- [ ] `NEXT_PUBLIC_ENABLE_DEMO_ROLE_HEADER=false`.
- [ ] `/`, `/docs`, `/auth`, and `/admin/docs` render on mobile and desktop.

## Public Showcase Verification

- [ ] Docs admin can sign in with the private Render credentials.
- [ ] `/docs` is either within its scheduled window or explicitly set to **Visible now**.
- [ ] Public `/docs` exposes aggregate metrics only.
- [ ] Risk outputs display citations, graph explanations, audit traceability, and human-review language.
- [ ] Emergency guidance remains decision support and never presents a diagnosis.

## Demo Day

- [ ] Wake the Render free instance by loading `/api/health`.
- [ ] Check the public frontend URL in a private browsing window.
- [ ] Run the intake-to-alert-to-audit demonstration using synthetic data only.
- [ ] Verify `/docs` before sharing the link.
