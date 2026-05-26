CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mother', 'health_worker', 'doctor_admin', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  pregnancy_week INTEGER NOT NULL,
  village TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  assigned_worker TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  systolic INTEGER,
  diastolic INTEGER,
  hemoglobin NUMERIC(4,1),
  temperature NUMERIC(4,1),
  pulse INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  symptom TEXT NOT NULL,
  severity TEXT DEFAULT 'reported',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  score INTEGER NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Green', 'Yellow', 'Orange', 'Red')),
  reasons JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  patient_name TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  source_url TEXT,
  version TEXT,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guideline_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  pregnancy_stage TEXT NOT NULL,
  severity TEXT NOT NULL,
  related_symptoms TEXT[] NOT NULL,
  related_conditions TEXT[] NOT NULL,
  language TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  summary TEXT NOT NULL,
  retrieved_chunks JSONB DEFAULT '[]',
  graph_path JSONB DEFAULT '[]',
  risk_score INTEGER,
  disclaimer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ocr_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  filename TEXT NOT NULL,
  extracted_fields JSONB NOT NULL,
  engine TEXT NOT NULL DEFAULT 'placeholder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offline_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  queue_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  PRIMARY KEY (role, permission)
);

CREATE TABLE IF NOT EXISTS docs_settings (
  id TEXT PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  visibility_override BOOLEAN,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  updated_by TEXT NOT NULL DEFAULT 'system seed',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS docs_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS docs_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_label TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  published_by TEXT NOT NULL DEFAULT 'system seed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  github_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS docs_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO role_permissions (role, permission) VALUES
  ('mother', 'submit_intake'), ('mother', 'query_assistant'),
  ('health_worker', 'view_patients'), ('health_worker', 'manage_alerts'), ('health_worker', 'ocr_upload'),
  ('doctor_admin', 'view_patients'), ('doctor_admin', 'manage_alerts'), ('doctor_admin', 'view_audit'), ('doctor_admin', 'view_analytics'),
  ('admin', 'manage_docs'), ('super_admin', 'manage_docs')
ON CONFLICT DO NOTHING;

INSERT INTO docs_settings (id, is_enabled, visibility_override, start_at, end_at) VALUES
  ('public-docs', TRUE, NULL, '2026-06-10T00:00:00Z', '2026-06-14T23:59:59Z')
ON CONFLICT DO NOTHING;

INSERT INTO docs_sections (id, slug, title, category, summary, body, display_order, status) VALUES
 ('90000000-0000-4000-8000-000000000001', 'overview', 'Hero / Product Overview', 'Pitch', 'Earlier maternal emergency signals for frontline care teams.', '{"lead":"LifeLine AI helps health workers turn symptoms, vitals, and scanned records into transparent, cited escalation guidance in low-bandwidth settings.","bullets":["Maternal emergency prediction support","Cited Contextual RAG plus Graph RAG explanations","Offline-ready escalation and audit trail"]}', 1, 'published'),
 ('90000000-0000-4000-8000-000000000002', 'problem', 'Problem', 'Pitch', 'Danger signs can be missed where records, specialists, and connectivity are limited.', '{"bullets":["Warning signals are scattered across symptoms and vitals","Rural connectivity interrupts digital workflows","Unexplained AI output cannot earn clinical trust"]}', 2, 'published'),
 ('90000000-0000-4000-8000-000000000003', 'solution', 'Solution', 'Pitch', 'Traceable decision support built around a human care team.', '{"bullets":["OCR ingestion with verification","Risk scores linked to evidence","Health worker alert dashboard"]}', 3, 'published'),
 ('90000000-0000-4000-8000-000000000004', 'why-now', 'Why Now', 'Pitch', 'Local AI and interoperable data systems make responsible deployment practical.', '{"bullets":["Affordable local LLM inference protects sensitive workflows","pgvector and Neo4j enable explainable hybrid retrieval","Digital community health programs need resilient escalation tools"]}', 4, 'published'),
 ('90000000-0000-4000-8000-000000000005', 'demo-flow', 'Product Demo Flow', 'Pitch', 'A two-minute path from intake to accountable escalation.', '{"steps":["Enter symptoms and vitals or verify OCR extraction","Risk engine identifies danger indicators without issuing diagnosis","Contextual RAG retrieves citations and Graph RAG explains the path","Urgent alerts require human review","Audit log preserves provenance"]}', 5, 'published'),
 ('90000000-0000-4000-8000-000000000006', 'market', 'Market Opportunity', 'Pitch', 'Maternal health systems need trusted clinical workflow support.', '{"bullets":["Public health programs and NGOs","Facility-to-community referral coordination","Anonymized quality analytics"]}', 6, 'published'),
 ('90000000-0000-4000-8000-000000000007', 'business-model', 'Business Model', 'Pitch', 'Deployment and support without paid AI dependence.', '{"bullets":["Institutional deployment services","Training and guideline configuration","Local inference avoids a required paid API"]}', 7, 'published'),
 ('90000000-0000-4000-8000-000000000008', 'traction', 'Traction / Current Status', 'Pitch', 'Deployable MVP with end-to-end traceability.', '{"bullets":["Synthetic seeded workflows","RAG, Graph RAG, OCR simulation, alerts and audits connected","Docker Compose deployment"]}', 8, 'published'),
 ('90000000-0000-4000-8000-000000000009', 'competition', 'Competition', 'Pitch', 'More accountable than generic chat and more adaptive than static forms.', '{"matrix":[["Capability","Static checklists","General AI chat","LifeLine AI"],["Cited guidance","Limited","Variable","Built in"],["Graph explainability","No","No","Yes"],["Offline workflow","Partial","No","Designed in"],["Human escalation + audit","Manual","Variable","Built in"]]}', 9, 'published'),
 ('90000000-0000-4000-8000-000000000010', 'advantage', 'Unique Advantage', 'Pitch', 'Clinical accountability is part of the product architecture.', '{"bullets":["Contextual RAG with clinical metadata","Neo4j symptom-to-action paths","Human-in-loop escalation and auditing"]}', 10, 'published'),
 ('90000000-0000-4000-8000-000000000011', 'go-to-market', 'Go-To-Market', 'Pitch', 'Start with supervised pilots and measured escalation workflows.', '{"steps":["Partner with maternal programs","Validate guidelines with clinicians","Pilot with trained workers","Measure timeliness and alert review"]}', 11, 'published'),
 ('90000000-0000-4000-8000-000000000012', 'team', 'Team', 'Pitch', 'Builders and reviewers behind LifeLine AI.', '{"lead":"The showcase team directory is managed by administrators."}', 12, 'published'),
 ('90000000-0000-4000-8000-000000000013', 'vision', 'Vision', 'Pitch', 'A trusted early-warning layer for every frontline maternal care team.', '{"lead":"Locally operated decision support that helps care teams recognize danger sooner while protecting privacy and respecting clinical authority."}', 13, 'published'),
 ('90000000-0000-4000-8000-000000000014', 'feature-matrix', 'Feature Matrix', 'Product', 'What is implemented today and designed next.', '{"matrix":[["Feature","MVP status","Traceability"],["Maternal risk flags","Live","Score and reasons logged"],["Contextual RAG","Live demo","Citations retained"],["Graph RAG","Live demo","Path displayed"],["OCR ingestion","Simulated","Verification required"],["Offline mode","Live simulation","Sync logged"],["Local LLM","Configurable","Provider surfaced"]]}', 14, 'published'),
 ('90000000-0000-4000-8000-000000000015', 'architecture', 'Architecture Diagram', 'Technical', 'Modular services keep prediction support grounded and observable.', '{"diagram":["User","Frontend","Backend API","Risk Engine","Contextual RAG","pgvector","Neo4j Graph RAG","Alert Dashboard","Audit Logs"]}', 15, 'published'),
 ('90000000-0000-4000-8000-000000000016', 'data-flow', 'Data Flow Diagram', 'Technical', 'Safety-relevant output is validated, retrieved, escalated, and audited.', '{"diagram":["Patient symptoms/vitals","Validation","Risk scoring","RAG retrieval","Graph traversal","Recommendation","Emergency alert","Dashboard","Audit log"]}', 16, 'published'),
 ('90000000-0000-4000-8000-000000000017', 'technology', 'Technology Stack', 'Technical', 'Deployable open technologies, with local AI support.', '{"bullets":["Next.js and Tailwind CSS frontend","Express role-gated API","PostgreSQL and pgvector","Neo4j Graph RAG pathways","Redis offline support","Ollama, llama.cpp, or vLLM support"]}', 17, 'published'),
 ('90000000-0000-4000-8000-000000000018', 'api', 'API Documentation', 'Technical', 'Live interfaces for docs and the product demonstration.', '{"endpoints":[["GET","/api/docs/public","Published public showcase"],["GET/POST","/api/docs/settings","Schedule and override"],["GET/POST/PUT/DELETE","/api/docs/sections","Authoring and ordering"],["POST","/api/docs/publish","Publish drafts"],["GET/POST","/api/docs/team","Team directory"],["GET","/api/docs/metrics","Anonymized totals"],["POST","/api/risk/analyze","Risk workflow"]]}', 18, 'published'),
 ('90000000-0000-4000-8000-000000000019', 'data-layer', 'Data Layer', 'Technical', 'Structured and vector-ready records with anonymized reporting.', '{"bullets":["PostgreSQL stores workflow and docs state","pgvector supports local embeddings","Semantic chunking enriches guidelines","Public metrics do not expose patient records"]}', 19, 'published'),
 ('90000000-0000-4000-8000-000000000020', 'ai-layer', 'AI Layer', 'Technical', 'Retrieval-grounded assistance rather than autonomous diagnosis.', '{"bullets":["Hybrid search pattern","Contextual RAG source citations","Neo4j Graph RAG explanations","Optional local LLM and deterministic fallback"]}', 20, 'published'),
 ('90000000-0000-4000-8000-000000000021', 'roadmap', 'Product Roadmap', 'Technical', 'From robust demonstration to governed clinical pilot.', '{"steps":["Now: traceable MVP with synthetic data","Next: reviewed localized guideline corpus","Pilot: authenticated RBAC, consent and monitoring","Scale: validated outcomes analysis"]}', 21, 'published'),
 ('90000000-0000-4000-8000-000000000022', 'scalability', 'Performance & Scalability', 'Technical', 'Designed for intermittent networks and independent services.', '{"bullets":["Cached guidance and offline synchronization","Vector and graph stores behind APIs","Stateless containers support scaling","Local inference controls latency"]}', 22, 'published'),
 ('90000000-0000-4000-8000-000000000023', 'security', 'Security & Responsible AI', 'Trust', 'Care teams remain accountable for every medical action.', '{"bullets":["AI is decision-support, not diagnosis","Source citations and Graph RAG explainability","Audit logs preserve provenance","Privacy protection and anonymized reporting","Human-in-loop escalation","Bias and limitation review before deployment"]}', 23, 'published'),
 ('90000000-0000-4000-8000-000000000024', 'metrics', 'Analytics / KPIs', 'Operations', 'Anonymized demonstration indicators update from system data.', '{"lead":"Counts report synthetic/demo activity only and disclose no patient identity."}', 24, 'published'),
 ('90000000-0000-4000-8000-000000000025', 'changelog', 'Changelog', 'Operations', 'Published product and showcase milestones.', '{"lead":"Updates are recorded as the demonstration evolves."}', 25, 'published')
ON CONFLICT DO NOTHING;

INSERT INTO team_members (id, full_name, role, email, image_url, github_url, linkedin_url, display_order) VALUES
 ('91000000-0000-4000-8000-000000000001', 'Dr. Farhana Sultana', 'Clinical Safety Advisor', 'farhana@lifeline.demo', '', '', 'https://www.linkedin.com/', 1),
 ('91000000-0000-4000-8000-000000000002', 'Nusrat Rahman', 'Community Health Workflow Lead', 'nusrat@lifeline.demo', '', 'https://github.com/', '', 2),
 ('91000000-0000-4000-8000-000000000003', 'Samir Hasan', 'AI and Platform Engineer', 'samir@lifeline.demo', '', 'https://github.com/', '', 3)
ON CONFLICT DO NOTHING;

INSERT INTO docs_versions (id, version_label, notes, published_by) VALUES
 ('93000000-0000-4000-8000-000000000001', 'Seed publication', 'Initial published showcase content.', 'system seed')
ON CONFLICT DO NOTHING;

INSERT INTO docs_changelog (id, version, title, details, published_at) VALUES
 ('92000000-0000-4000-8000-000000000001', '0.3.0', 'Public showcase and docs portal', 'Investor narrative, architecture, metrics, and controlled publishing added.', '2026-05-27T00:00:00Z'),
 ('92000000-0000-4000-8000-000000000002', '0.2.0', 'Traceable maternal risk workflow', 'Alert dashboard, citations, graph path, and audit views connected.', '2026-05-26T00:00:00Z'),
 ('92000000-0000-4000-8000-000000000003', '0.1.0', 'Deployable local-first MVP', 'Compose stack and synthetic demonstration dataset established.', '2026-05-25T00:00:00Z')
ON CONFLICT DO NOTHING;

INSERT INTO patients (id, name, age, pregnancy_week, village, phone, preferred_language, assigned_worker) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Ayesha Begum', 25, 34, 'Charpara', '01700000001', 'bn', 'Nusrat CHW'),
  ('22222222-2222-4222-8222-222222222222', 'Mariam Khatun', 30, 28, 'Sonapur', '01700000002', 'en', 'Nusrat CHW'),
  ('33333333-3333-4333-8333-333333333333', 'Rokeya Akter', 21, 19, 'Lakshmipur', '01700000003', 'bn', 'Rahim CHW'),
  ('44444444-4444-4444-8444-444444444444', 'Shila Rani', 32, 37, 'Dakkhinpara', '01700000004', 'en', 'Rahim CHW'),
  ('55555555-5555-4555-8555-555555555555', 'Fatema Noor', 27, 31, 'Boro Bari', '01700000005', 'bn', 'Nusrat CHW')
ON CONFLICT DO NOTHING;

INSERT INTO vitals (patient_id, systolic, diastolic, hemoglobin, temperature, pulse) VALUES
  ('11111111-1111-4111-8111-111111111111', 150, 96, 10.8, 37.0, 94),
  ('22222222-2222-4222-8222-222222222222', 116, 75, 9.2, 36.9, 82),
  ('33333333-3333-4333-8333-333333333333', 110, 72, 11.4, 37.2, 80),
  ('44444444-4444-4444-8444-444444444444', 120, 78, 10.4, 38.2, 98),
  ('55555555-5555-4555-8555-555555555555', 118, 76, 11.0, 36.8, 78);

INSERT INTO symptoms (patient_id, symptom) VALUES
  ('11111111-1111-4111-8111-111111111111', 'headache'),
  ('11111111-1111-4111-8111-111111111111', 'swelling'),
  ('22222222-2222-4222-8222-222222222222', 'dizziness'),
  ('44444444-4444-4444-8444-444444444444', 'abdominal pain'),
  ('55555555-5555-4555-8555-555555555555', 'fatigue');

INSERT INTO risk_scores (patient_id, score, severity, reasons, recommendations) VALUES
  ('11111111-1111-4111-8111-111111111111', 94, 'Red', '["High blood pressure with headache and swelling indicates preeclampsia danger signs"]', '["Immediate referral and human review"]'),
  ('22222222-2222-4222-8222-222222222222', 55, 'Yellow', '["Low hemoglobin with dizziness suggests anemia warning"]', '["Clinical evaluation and nutrition counseling"]'),
  ('33333333-3333-4333-8333-333333333333', 12, 'Green', '["No emergency rule triggered"]', '["Continue scheduled antenatal care"]'),
  ('44444444-4444-4444-8444-444444444444', 75, 'Orange', '["Fever with abdominal pain requires urgent evaluation"]', '["Same-day evaluation"]'),
  ('55555555-5555-4555-8555-555555555555', 25, 'Green', '["Monitor non-specific fatigue"]', '["Routine follow-up"]');

INSERT INTO document_sources (title, publisher, source_url, version) VALUES
  ('Maternal emergency referral field guide', 'LifeLine curated demo from public guidance', 'https://www.who.int/health-topics/maternal-health', 'demo-2026'),
  ('Antenatal danger signs quick reference', 'LifeLine clinical review placeholder', 'local://guidelines/danger-signs', 'demo-2026');

INSERT INTO guideline_chunks (source, title, category, pregnancy_stage, severity, related_symptoms, related_conditions, language, chunk_text, embedding) VALUES
 ('WHO maternal health (demo excerpt)', 'Vaginal bleeding danger sign', 'emergency', 'any', 'Red', ARRAY['bleeding'], ARRAY['hemorrhage'], 'en', 'Vaginal bleeding during pregnancy is a danger sign requiring rapid assessment and referral according to local emergency protocol.', '[0.9,0.8,0.2,0.1,0.3,0.1,0.2,0.7]'),
 ('WHO maternal health (demo excerpt)', 'Bleeding warning', 'emergency', 'any', 'Red', ARRAY['bleeding'], ARRAY['hemorrhage'], 'bn', 'গর্ভাবস্থায় রক্তপাত বিপদের লক্ষণ। দ্রুত স্বাস্থ্যকেন্দ্রে রেফার করুন।', '[0.9,0.8,0.2,0.1,0.3,0.1,0.2,0.7]'),
 ('Maternal hypertension field guide', 'Preeclampsia danger signs', 'hypertension', 'third trimester', 'Red', ARRAY['headache','swelling'], ARRAY['hypertension','preeclampsia'], 'en', 'Blood pressure at or above 140/90 with severe headache or swelling needs urgent assessment for preeclampsia and referral.', '[0.8,0.2,0.9,0.8,0.1,0.4,0.2,0.6]'),
 ('Maternal hypertension field guide', 'উচ্চ রক্তচাপ সতর্কতা', 'hypertension', 'third trimester', 'Red', ARRAY['headache','swelling'], ARRAY['preeclampsia'], 'bn', 'রক্তচাপ ১৪০/৯০ বা তার বেশি এবং মাথাব্যথা বা ফোলা থাকলে জরুরি পরীক্ষা ও রেফারেল প্রয়োজন।', '[0.8,0.2,0.9,0.8,0.1,0.4,0.2,0.6]'),
 ('Antenatal nutrition guide', 'Anemia screening', 'anemia', 'any', 'Yellow', ARRAY['dizziness','fatigue'], ARRAY['anemia'], 'en', 'Hemoglobin below 10 g/dL warrants clinical review, nutrition counseling, iron adherence check, and follow-up testing.', '[0.1,0.6,0.2,0.4,0.9,0.3,0.2,0.1]'),
 ('Antenatal nutrition guide', 'রক্তস্বল্পতা সহায়তা', 'anemia', 'any', 'Yellow', ARRAY['dizziness'], ARRAY['anemia'], 'bn', 'হিমোগ্লোবিন ১০-এর কম হলে স্বাস্থ্যকর্মীর মূল্যায়ন, পুষ্টি পরামর্শ এবং ফলোআপ প্রয়োজন।', '[0.1,0.6,0.2,0.4,0.9,0.3,0.2,0.1]'),
 ('Obstetric triage protocol', 'Severe abdominal pain', 'pain', 'any', 'Orange', ARRAY['severe abdominal pain','abdominal pain'], ARRAY['obstetric emergency'], 'en', 'Severe abdominal pain in pregnancy requires urgent clinical evaluation; escalate immediately when pain is severe or persistent.', '[0.5,0.4,0.7,0.2,0.1,0.9,0.6,0.2]'),
 ('Obstetric triage protocol', 'Fever and pain', 'infection', 'any', 'Orange', ARRAY['fever','abdominal pain'], ARRAY['infection'], 'en', 'Fever combined with abdominal pain should receive same-day urgent assessment for possible infection or obstetric complication.', '[0.3,0.8,0.4,0.7,0.1,0.8,0.3,0.4]'),
 ('Birth preparedness handbook', 'Emergency transport', 'referral', 'third trimester', 'Red', ARRAY['bleeding','headache','swelling'], ARRAY['emergency referral'], 'en', 'Activate transport, alert the receiving facility, and ensure a trained worker reviews all high-risk referrals.', '[0.8,0.7,0.5,0.8,0.1,0.4,0.9,0.8]'),
 ('Community antenatal guide', 'Routine monitoring', 'routine', 'any', 'Green', ARRAY['fatigue'], ARRAY['routine care'], 'bn', 'বিপদের লক্ষণ না থাকলে নির্ধারিত প্রসবপূর্ব পরীক্ষা চালিয়ে যান এবং নতুন লক্ষণ জানাবেন।', '[0.1,0.1,0.2,0.2,0.3,0.2,0.1,0.1]');

INSERT INTO alerts (patient_id, patient_name, severity, message, status, requires_human_review) VALUES
 ('11111111-1111-4111-8111-111111111111', 'Ayesha Begum', 'Red', 'Possible preeclampsia danger signs: referral review required.', 'Open', TRUE),
 ('22222222-2222-4222-8222-222222222222', 'Mariam Khatun', 'Yellow', 'Anemia follow-up recommended.', 'Acknowledged', FALSE),
 ('44444444-4444-4444-8444-444444444444', 'Shila Rani', 'Orange', 'Urgent fever and pain evaluation.', 'Open', TRUE),
 ('55555555-5555-4555-8555-555555555555', 'Fatema Noor', 'Green', 'Routine ANC follow-up.', 'Closed', FALSE),
 ('33333333-3333-4333-8333-333333333333', 'Rokeya Akter', 'Green', 'No danger signs detected.', 'Closed', FALSE);

INSERT INTO audit_logs (event_type, actor_role, patient_id, summary, retrieved_chunks, graph_path, risk_score, disclaimer) VALUES
 ('risk_analysis', 'health_worker', '11111111-1111-4111-8111-111111111111', 'Red alert generated for elevated BP and headache.', '["Preeclampsia danger signs"]', '["Headache","Hypertension","Preeclampsia","Emergency Referral"]', 94, 'Decision-support only; clinical review required.'),
 ('assistant_query', 'mother', '22222222-2222-4222-8222-222222222222', 'Retrieved anemia guidance.', '["Anemia screening"]', '["Low Hemoglobin","Anemia","Nutrition Counseling"]', 55, 'Decision-support only; clinical review required.'),
 ('ocr_extract', 'health_worker', NULL, 'Structured fields extracted from antenatal card placeholder.', '[]', '[]', NULL, 'Verify extracted data before care decisions.'),
 ('offline_sync', 'health_worker', NULL, 'Offline symptom event synced.', '[]', '[]', NULL, 'Decision-support only; clinical review required.'),
 ('alert_review', 'doctor_admin', '44444444-4444-4444-8444-444444444444', 'Orange alert awaiting same-day evaluation.', '["Fever and pain"]', '["Fever","Urgent Evaluation"]', 75, 'Decision-support only; clinical review required.');
