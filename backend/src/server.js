import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "redis";
import { v4 as uuid } from "uuid";
import { config, DISCLAIMER } from "./config.js";
import { initializeDatabase, isDatabaseReady, memory, tryQuery } from "./db.js";
import { analyzeRisk } from "./services/riskService.js";
import { retrieveGuidance } from "./services/ragService.js";
import { getRiskPath, initializeGraph, isGraphReady } from "./services/graphService.js";
import { semanticChunkDocument } from "./services/chunkingService.js";
import { extractOcrFields, generateAnswer } from "./services/llmService.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const demoUsers = {};

if (config.enableDemoAccounts) {
  Object.assign(demoUsers, {
    "mother@lifeline.demo": { password: "Demo123!", name: "Ayesha Begum", role: "mother" },
    "worker@lifeline.demo": { password: "Demo123!", name: "Nusrat CHW", role: "health_worker" },
    "doctor@lifeline.demo": { password: "Demo123!", name: "Dr. Sultana", role: "doctor_admin" }
  });
}

if (config.docsAdminEmail && config.docsAdminPassword) {
  demoUsers[config.docsAdminEmail.toLowerCase()] = { password: config.docsAdminPassword, name: "Docs Admin", role: "admin" };
} else if (config.nodeEnv !== "production") {
  demoUsers["admin@lifeline.demo"] = { password: "Demo123!", name: "Docs Admin", role: "admin" };
}
if (config.docsSuperAdminEmail && config.docsSuperAdminPassword) {
  demoUsers[config.docsSuperAdminEmail.toLowerCase()] = { password: config.docsSuperAdminPassword, name: "Docs Super Admin", role: "super_admin" };
} else if (config.nodeEnv !== "production") {
  demoUsers["superadmin@lifeline.demo"] = { password: "Demo123!", name: "Docs Super Admin", role: "super_admin" };
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (config.corsOrigins.includes(origin)) return true;
  if (config.allowVercelPreviews) {
    try {
      return new URL(origin).protocol === "https:" && new URL(origin).hostname.endsWith(".vercel.app");
    } catch {
      return false;
    }
  }
  return false;
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors({
  origin(origin, callback) {
    const allowed = isAllowedOrigin(origin);
    callback(allowed ? null : new Error("Origin not allowed by CORS policy."), allowed);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-demo-role"]
}));
app.use(express.json({ limit: "2mb" }));

function authenticatedRole(req) {
  const bearer = req.headers.authorization?.replace("Bearer ", "");
  if (bearer) {
    try {
      return jwt.verify(bearer, config.jwtSecret).role;
    } catch {
      return null;
    }
  }
  return null;
}

function authRole(req) {
  // Used by visible clinical demo pages; docs publishing uses tokens only.
  return authenticatedRole(req) || (config.allowDemoRoleHeader ? req.headers["x-demo-role"] : null) || null;
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = authRole(req);
    if (!role || !roles.includes(role)) return res.status(403).json({ error: "This role is not permitted for this resource." });
    req.role = role;
    next();
  };
}

function requireAuthenticatedRole(...roles) {
  return (req, res, next) => {
    const role = authenticatedRole(req);
    if (!role || !roles.includes(role)) return res.status(403).json({ error: "Authenticated administrator access is required." });
    req.role = role;
    next();
  };
}

const docsAdminRoles = ["admin", "super_admin"];

function isDocsAdmin(req) {
  return docsAdminRoles.includes(authenticatedRole(req));
}

function issueToken(user) {
  return jwt.sign({ email: user.email, name: user.name, role: user.role }, config.jwtSecret, { expiresIn: "12h" });
}

function docsAvailability(settings, now = new Date()) {
  if (settings.visibility_override === true) return { visible: true, reason: "Admin override: visible" };
  if (settings.visibility_override === false) return { visible: false, reason: "Admin override: hidden" };
  const startAt = new Date(settings.start_at);
  const endAt = new Date(settings.end_at);
  const inSchedule = now >= startAt && now <= endAt;
  return {
    visible: Boolean(settings.is_enabled) && inSchedule,
    reason: !settings.is_enabled ? "Public docs disabled" : inSchedule ? "Scheduled publication active" : "Outside scheduled publication window"
  };
}

async function getDocsSettings() {
  const result = await tryQuery("SELECT * FROM docs_settings WHERE id='public-docs' LIMIT 1");
  return result?.rows[0] || memory.docsSettings;
}

async function getDocsSections(publishedOnly = false) {
  const filter = publishedOnly ? "WHERE status='published'" : "";
  const result = await tryQuery(`SELECT * FROM docs_sections ${filter} ORDER BY display_order, title`);
  const sections = result?.rows || memory.docsSections;
  return publishedOnly ? sections.filter((section) => section.status === "published") : sections;
}

async function getDocsTeam() {
  const result = await tryQuery("SELECT * FROM team_members ORDER BY display_order, full_name");
  return result?.rows || memory.teamMembers;
}

async function getDocsChangelog() {
  const result = await tryQuery("SELECT * FROM docs_changelog ORDER BY published_at DESC LIMIT 20");
  return result?.rows || memory.docsChangelog;
}

async function getDocsMetrics() {
  const [usersResult, patientsResult, alertsResult, auditResult] = await Promise.all([
    tryQuery("SELECT COUNT(*)::int AS count FROM users"),
    tryQuery("SELECT COUNT(*)::int AS count FROM patients"),
    tryQuery("SELECT COUNT(*)::int AS count FROM alerts"),
    tryQuery("SELECT COUNT(*)::int AS count FROM audit_logs")
  ]);
  return {
    users: Math.max(usersResult?.rows[0]?.count ?? 0, Object.keys(demoUsers).length),
    patients_screened: patientsResult?.rows[0]?.count ?? memory.patients.length,
    alerts_generated: alertsResult?.rows[0]?.count ?? memory.alerts.length,
    audited_activities: auditResult?.rows[0]?.count ?? memory.auditLogs.length,
    documented_apis: 18,
    platform_features: 12,
    data_classification: "Anonymized aggregate demonstration metrics",
    updated_at: new Date().toISOString()
  };
}

async function recordAudit({ eventType, role = "mother", patientId = null, summary, chunks = [], graphPath = [], riskScore = null, disclaimer = DISCLAIMER }) {
  const log = { id: uuid(), event_type: eventType, actor_role: role, patient_id: patientId, summary, retrieved_chunks: chunks, graph_path: graphPath, risk_score: riskScore, disclaimer, created_at: new Date().toISOString() };
  memory.auditLogs.unshift(log);
  await tryQuery(
    "INSERT INTO audit_logs (id, event_type, actor_role, patient_id, summary, retrieved_chunks, graph_path, risk_score, disclaimer) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [log.id, eventType, role, patientId, summary, JSON.stringify(chunks), JSON.stringify(graphPath), riskScore, disclaimer]
  );
  return log;
}

app.get("/api/health", (_req, res) => res.json({
  status: "ok",
  service: "lifeline-api",
  environment: config.nodeEnv,
  database: isDatabaseReady() ? "connected" : "fallback",
  graph: isGraphReady() ? "connected" : "fallback",
  llm_provider: config.llmProvider,
  demo_role_header: config.allowDemoRoleHeader ? "enabled" : "disabled",
  demo_accounts: config.enableDemoAccounts ? "enabled" : "disabled",
  timestamp: new Date().toISOString()
}));

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role = "mother" } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: "Name, email, and password of at least 8 characters are required." });
  if (!["mother", "health_worker", "doctor_admin"].includes(role)) return res.status(400).json({ error: "Invalid role." });
  if (role !== "mother" && !config.allowPrivilegedSelfRegistration) return res.status(403).json({ error: "Health worker and doctor roles must be provisioned by an administrator." });
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await tryQuery(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role",
    [name, email.toLowerCase(), passwordHash, role]
  );
  const user = result?.rows[0] || { id: uuid(), name, email: email.toLowerCase(), role };
  res.status(201).json({ user, token: issueToken(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").toLowerCase();
  const password = String(req.body.password || "");
  const demo = demoUsers[email];
  if (demo && password === demo.password) {
    const user = { email, name: demo.name, role: demo.role };
    return res.json({ user, token: issueToken(user), demo: true });
  }
  const result = await tryQuery("SELECT name, email, password_hash, role FROM users WHERE email = $1", [email]);
  const user = result?.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Invalid login credentials." });
  res.json({ user: { name: user.name, email: user.email, role: user.role }, token: issueToken(user) });
});

app.post("/api/patients", async (req, res) => {
  const { name, age, pregnancy_week, village, phone = "", preferred_language = "en", assigned_worker = "Unassigned" } = req.body;
  if (!name || !age || !pregnancy_week || !village) return res.status(400).json({ error: "Patient name, age, pregnancy week, and village are required." });
  const id = uuid();
  const patient = { id, name, age: Number(age), pregnancy_week: Number(pregnancy_week), village, phone, preferred_language, assigned_worker };
  memory.patients.unshift(patient);
  await tryQuery(
    "INSERT INTO patients (id, name, age, pregnancy_week, village, phone, preferred_language, assigned_worker) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    [id, name, age, pregnancy_week, village, phone, preferred_language, assigned_worker]
  );
  res.status(201).json(patient);
});

app.get("/api/patients", requireRole("health_worker", "doctor_admin"), async (_req, res) => {
  const result = await tryQuery(
    "SELECT p.*, r.score, r.severity FROM patients p LEFT JOIN LATERAL (SELECT score, severity FROM risk_scores WHERE patient_id=p.id ORDER BY created_at DESC LIMIT 1) r ON TRUE ORDER BY p.created_at DESC"
  );
  res.json(result?.rows || memory.patients);
});

app.get("/api/patients/:id", requireRole("health_worker", "doctor_admin"), async (req, res) => {
  const result = await tryQuery("SELECT * FROM patients WHERE id=$1", [req.params.id]);
  const patient = result?.rows[0] || memory.patients.find((entry) => entry.id === req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found." });
  const details = await tryQuery(
    "SELECT (SELECT row_to_json(v) FROM vitals v WHERE patient_id=$1 ORDER BY recorded_at DESC LIMIT 1) AS vitals, (SELECT json_agg(s.symptom) FROM symptoms s WHERE patient_id=$1) AS symptoms, (SELECT row_to_json(r) FROM risk_scores r WHERE patient_id=$1 ORDER BY created_at DESC LIMIT 1) AS risk",
    [req.params.id]
  );
  res.json({ ...patient, ...(details?.rows[0] || { vitals: patient.vitals, symptoms: patient.symptoms, risk: { severity: patient.severity || "Green", score: patient.score || 0 } }) });
});

app.post("/api/risk/analyze", async (req, res) => {
  const { patient_id: patientId = null, patient_name: patientName = "New intake", symptoms = [], vitals = {}, language = "en" } = req.body;
  if (!Array.isArray(symptoms)) return res.status(400).json({ error: "Symptoms must be an array." });
  const risk = analyzeRisk({ symptoms, vitals });
  const retrieval = await retrieveGuidance({ query: symptoms.join(" "), symptoms, language, severity: risk.severity });
  const graph = getRiskPath([...symptoms, Number(vitals.hemoglobin) < 10 ? "low hemoglobin" : ""]);
  const memoryPatient = memory.patients.find((patient) => patient.id === patientId);
  if (memoryPatient) Object.assign(memoryPatient, { score: risk.score, severity: risk.severity, vitals, symptoms });
  if (patientId) {
    await tryQuery(
      "INSERT INTO vitals (patient_id, systolic, diastolic, hemoglobin, temperature) VALUES ($1,$2,$3,$4,$5)",
      [patientId, Number(vitals.systolic) || null, Number(vitals.diastolic) || null, Number(vitals.hemoglobin) || null, Number(vitals.temperature) || null]
    );
    for (const symptom of symptoms) {
      await tryQuery("INSERT INTO symptoms (patient_id, symptom) VALUES ($1,$2)", [patientId, symptom]);
    }
  }
  await tryQuery("INSERT INTO risk_scores (patient_id, score, severity, reasons, recommendations) VALUES ($1,$2,$3,$4,$5)", [patientId, risk.score, risk.severity, JSON.stringify(risk.reasons), JSON.stringify(risk.recommendations)]);
  if (risk.severity === "Red" || risk.severity === "Orange") {
    const alert = { id: uuid(), patient_id: patientId, patient_name: patientName, severity: risk.severity, message: risk.reasons[0], status: "Open", requires_human_review: true, created_at: new Date().toISOString() };
    memory.alerts.unshift(alert);
    await tryQuery("INSERT INTO alerts (id, patient_id, patient_name, severity, message, requires_human_review) VALUES ($1,$2,$3,$4,$5,$6)", [alert.id, patientId, patientName, alert.severity, alert.message, true]);
  }
  await recordAudit({ eventType: "risk_analysis", role: authRole(req) || "mother", patientId, summary: `${risk.severity} maternal risk decision-support result generated.`, chunks: retrieval.citations, graphPath: graph.path, riskScore: risk.score });
  res.json({ risk, retrieval, graph, alert_created: risk.severity === "Red" || risk.severity === "Orange", disclaimer: DISCLAIMER });
});

app.post("/api/assistant/query", async (req, res) => {
  const { query = "", symptoms = [], language = "en" } = req.body;
  if (!query.trim()) return res.status(400).json({ error: "A question is required." });
  const retrieval = await retrieveGuidance({ query, symptoms, language });
  const graph = getRiskPath(symptoms.length ? symptoms : query.split(/\s+/));
  const generated = await generateAnswer({ question: query, chunks: retrieval.chunks, language });
  await recordAudit({ eventType: "assistant_query", role: authRole(req) || "mother", summary: "Assistant returned cited guidance.", chunks: retrieval.citations, graphPath: graph.path });
  res.json({ answer: generated.text, retrieval, graph, provider: generated.provider, disclaimer: DISCLAIMER });
});

app.post("/api/ocr/extract", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Upload an image or PDF record." });
  const ocrText = req.file.mimetype === "text/plain"
    ? req.file.buffer.toString("utf8")
    : "Age 25. Pregnancy week 34. BP 146/94. Hb 9.4. Symptoms headache and swelling. Medicine iron supplement.";
  const fields = await extractOcrFields(ocrText);
  const extraction = {
    patient_age: fields.patient_age,
    pregnancy_week: fields.pregnancy_week,
    blood_pressure: fields.blood_pressure,
    hemoglobin: fields.hemoglobin,
    symptoms: fields.symptoms || [],
    medicines: fields.medicines || []
  };
  const record = { id: uuid(), filename: req.file.originalname, ocr_text: ocrText, extracted_fields: extraction, engine: "OCR placeholder with structured extraction", provider: fields.provider, verification_required: true };
  memory.ocrRecords.unshift(record);
  await tryQuery("INSERT INTO ocr_records (id, filename, extracted_fields, engine) VALUES ($1,$2,$3,$4)", [record.id, record.filename, JSON.stringify(extraction), record.engine]);
  await recordAudit({ eventType: "ocr_extract", role: authRole(req) || "health_worker", summary: "OCR placeholder extracted structured antenatal fields.", disclaimer: "Verify OCR fields against the source record before care decisions." });
  res.json({ ...record, disclaimer: DISCLAIMER });
});

app.get("/api/graph/risk-path", (req, res) => {
  const symptoms = String(req.query.symptoms || "").split(",").filter(Boolean);
  res.json({ graph: getRiskPath(symptoms), disclaimer: DISCLAIMER });
});

app.post("/api/alerts", requireRole("health_worker", "doctor_admin"), async (req, res) => {
  const alert = { id: uuid(), ...req.body, requires_human_review: req.body.severity === "Red", status: "Open", created_at: new Date().toISOString() };
  if (!alert.patient_name || !alert.severity || !alert.message) return res.status(400).json({ error: "Patient, severity, and message are required." });
  memory.alerts.unshift(alert);
  await tryQuery("INSERT INTO alerts (id, patient_name, severity, message, requires_human_review) VALUES ($1,$2,$3,$4,$5)", [alert.id, alert.patient_name, alert.severity, alert.message, alert.requires_human_review]);
  res.status(201).json(alert);
});

app.get("/api/alerts", requireRole("health_worker", "doctor_admin"), async (_req, res) => {
  const result = await tryQuery("SELECT * FROM alerts ORDER BY created_at DESC");
  res.json(result?.rows || memory.alerts);
});

app.get("/api/analytics", requireRole("health_worker", "doctor_admin"), async (_req, res) => {
  const results = await tryQuery("SELECT severity, COUNT(*)::int AS count FROM risk_scores GROUP BY severity");
  const risk_distribution = results?.rows || ["Green", "Yellow", "Orange", "Red"].map((severity) => ({ severity, count: memory.patients.filter((p) => p.severity === severity).length }));
  const patientCount = await tryQuery("SELECT COUNT(*)::int AS count FROM patients");
  const openAlerts = await tryQuery("SELECT COUNT(*)::int AS count FROM alerts WHERE status = 'Open'");
  res.json({ risk_distribution, active_alerts: openAlerts?.rows[0].count ?? memory.alerts.filter((item) => item.status === "Open").length, patients_screened: patientCount?.rows[0].count ?? memory.patients.length, referrals_today: risk_distribution.filter((entry) => entry.severity === "Red" || entry.severity === "Orange").reduce((sum, entry) => sum + Number(entry.count), 0), offline_sync_pending: memory.offlineQueue.length });
});

app.get("/api/audit-logs", requireRole("doctor_admin"), async (_req, res) => {
  const result = await tryQuery("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50");
  res.json(result?.rows || memory.auditLogs);
});

app.get("/api/provenance", (_req, res) => {
  res.json({
    sources: ["WHO maternal health public guidance (demo-derived summary)", "Local maternal hypertension field guide placeholder", "Community antenatal workflow demonstration"],
    pipeline: ["document ingestion", "semantic chunking", "metadata tagging", "hybrid retrieval", "graph explanation", "audit logging"],
    model_runtime: { configured_provider: config.llmProvider, supported: ["Ollama", "Groq", "llama.cpp", "vLLM"], fallback: "retrieval-template response" },
    limitations: ["Demo guideline text must be clinically validated before real-world use.", "Vector similarity is a deterministic placeholder in the MVP."],
    disclaimer: DISCLAIMER
  });
});

app.get("/api/docs/public", async (_req, res) => {
  const settings = await getDocsSettings();
  const availability = docsAvailability(settings);
  if (!availability.visible) {
    return res.status(403).json({
      error: "Not Available",
      reason: availability.reason,
      schedule: { start_at: settings.start_at, end_at: settings.end_at }
    });
  }
  const [sections, team, changelog, metrics] = await Promise.all([
    getDocsSections(true),
    getDocsTeam(),
    getDocsChangelog(),
    getDocsMetrics()
  ]);
  res.json({
    sections,
    team,
    changelog,
    metrics,
    publication: { status: availability.reason, start_at: settings.start_at, end_at: settings.end_at },
    disclaimer: DISCLAIMER
  });
});

app.get("/api/docs/settings", requireAuthenticatedRole(...docsAdminRoles), async (_req, res) => {
  const settings = await getDocsSettings();
  res.json({ ...settings, availability: docsAvailability(settings) });
});

app.post("/api/docs/settings", requireAuthenticatedRole(...docsAdminRoles), async (req, res) => {
  const current = await getDocsSettings();
  const visibilityOverride = req.body.visibility_override === undefined
    ? current.visibility_override
    : req.body.visibility_override === "" || req.body.visibility_override === null
      ? null
      : req.body.visibility_override === true || req.body.visibility_override === "true";
  const next = {
    ...current,
    is_enabled: req.body.is_enabled === undefined ? current.is_enabled : Boolean(req.body.is_enabled),
    visibility_override: visibilityOverride,
    start_at: req.body.start_at || current.start_at,
    end_at: req.body.end_at || current.end_at,
    updated_by: req.role,
    updated_at: new Date().toISOString()
  };
  if (new Date(next.start_at) >= new Date(next.end_at)) return res.status(400).json({ error: "The publication start must be before the end." });
  memory.docsSettings = next;
  await tryQuery(
    "UPDATE docs_settings SET is_enabled=$1, visibility_override=$2, start_at=$3, end_at=$4, updated_by=$5, updated_at=NOW() WHERE id='public-docs'",
    [next.is_enabled, next.visibility_override, next.start_at, next.end_at, next.updated_by]
  );
  res.json({ ...next, availability: docsAvailability(next) });
});

app.get("/api/docs/sections", requireAuthenticatedRole(...docsAdminRoles), async (_req, res) => {
  const sections = await getDocsSections();
  const versionsResult = await tryQuery("SELECT * FROM docs_versions ORDER BY created_at DESC LIMIT 20");
  res.json({ sections, versions: versionsResult?.rows || memory.docsVersions });
});

app.post("/api/docs/sections", requireAuthenticatedRole(...docsAdminRoles), async (req, res) => {
  const { title, slug, category = "Technical", summary = "", body = {}, display_order = memory.docsSections.length + 1, status = "draft" } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "Title and slug are required." });
  const section = { id: uuid(), title, slug, category, summary, body, display_order: Number(display_order), status: status === "published" ? "published" : "draft", updated_at: new Date().toISOString() };
  memory.docsSections.push(section);
  await tryQuery(
    "INSERT INTO docs_sections (id, slug, title, category, summary, body, display_order, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    [section.id, section.slug, section.title, section.category, section.summary, JSON.stringify(section.body), section.display_order, section.status]
  );
  res.status(201).json(section);
});

app.put("/api/docs/sections/:id", requireAuthenticatedRole(...docsAdminRoles), async (req, res) => {
  const current = memory.docsSections.find((section) => section.id === req.params.id);
  const databaseResult = current ? null : await tryQuery("SELECT * FROM docs_sections WHERE id=$1", [req.params.id]);
  const existing = current || databaseResult?.rows[0];
  if (!existing) return res.status(404).json({ error: "Docs section not found." });
  const section = {
    ...existing,
    title: req.body.title ?? existing.title,
    slug: req.body.slug ?? existing.slug,
    category: req.body.category ?? existing.category,
    summary: req.body.summary ?? existing.summary,
    body: req.body.body ?? existing.body,
    display_order: req.body.display_order === undefined ? existing.display_order : Number(req.body.display_order),
    status: req.body.status === undefined ? existing.status : req.body.status === "published" ? "published" : "draft",
    updated_at: new Date().toISOString()
  };
  const memoryIndex = memory.docsSections.findIndex((item) => item.id === req.params.id);
  if (memoryIndex >= 0) memory.docsSections[memoryIndex] = section;
  await tryQuery(
    "UPDATE docs_sections SET slug=$1, title=$2, category=$3, summary=$4, body=$5, display_order=$6, status=$7, updated_at=NOW() WHERE id=$8",
    [section.slug, section.title, section.category, section.summary, JSON.stringify(section.body), section.display_order, section.status, req.params.id]
  );
  res.json(section);
});

app.delete("/api/docs/sections/:id", requireAuthenticatedRole(...docsAdminRoles), async (req, res) => {
  const memoryIndex = memory.docsSections.findIndex((section) => section.id === req.params.id);
  if (memoryIndex >= 0) memory.docsSections.splice(memoryIndex, 1);
  const result = await tryQuery("DELETE FROM docs_sections WHERE id=$1 RETURNING id", [req.params.id]);
  if (memoryIndex < 0 && !result?.rowCount) return res.status(404).json({ error: "Docs section not found." });
  res.status(204).send();
});

app.post("/api/docs/publish", requireAuthenticatedRole(...docsAdminRoles), async (req, res) => {
  const sectionIds = Array.isArray(req.body.section_ids) ? req.body.section_ids : memory.docsSections.map((section) => section.id);
  const now = new Date().toISOString();
  memory.docsSections = memory.docsSections.map((section) => sectionIds.includes(section.id) ? { ...section, status: "published", updated_at: now } : section);
  await tryQuery("UPDATE docs_sections SET status='published', updated_at=NOW() WHERE id = ANY($1::uuid[])", [sectionIds]);
  const version = { id: uuid(), version_label: req.body.version_label || `Publication ${new Date().toLocaleDateString("en-CA")}`, notes: req.body.notes || "Docs sections published.", created_at: now };
  memory.docsVersions.unshift(version);
  await tryQuery("INSERT INTO docs_versions (id, version_label, notes, published_by) VALUES ($1,$2,$3,$4)", [version.id, version.version_label, version.notes, req.role]);
  res.json({ published_sections: sectionIds.length, version });
});

app.get("/api/docs/team", async (_req, res) => {
  const settings = await getDocsSettings();
  if (!isDocsAdmin(_req) && !docsAvailability(settings).visible) return res.status(403).json({ error: "Not Available" });
  res.json(await getDocsTeam());
});

app.post("/api/docs/team", requireAuthenticatedRole(...docsAdminRoles), async (req, res) => {
  const { full_name, role, email, image_url = "", github_url = "", linkedin_url = "", display_order = memory.teamMembers.length + 1 } = req.body;
  if (!full_name || !role || !email) return res.status(400).json({ error: "Full name, role, and email are required." });
  const member = { id: uuid(), full_name, role, email, image_url, github_url, linkedin_url, display_order: Number(display_order) };
  memory.teamMembers.push(member);
  await tryQuery(
    "INSERT INTO team_members (id, full_name, role, email, image_url, github_url, linkedin_url, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    [member.id, member.full_name, member.role, member.email, member.image_url, member.github_url, member.linkedin_url, member.display_order]
  );
  res.status(201).json(member);
});

app.get("/api/docs/metrics", async (req, res) => {
  const settings = await getDocsSettings();
  if (!isDocsAdmin(req) && !docsAvailability(settings).visible) return res.status(403).json({ error: "Not Available" });
  res.json(await getDocsMetrics());
});

app.post("/api/rag/chunk", requireRole("doctor_admin"), (req, res) => {
  if (!req.body.text) return res.status(400).json({ error: "Document text is required." });
  res.json({ chunks: semanticChunkDocument(req.body.text, req.body.metadata) });
});

app.post("/api/offline/queue", (req, res) => {
  const event = { id: uuid(), device_id: req.body.device_id || "rural-device-01", queue_type: "symptom_log", payload: req.body, sync_status: "pending" };
  memory.offlineQueue.push(event);
  res.status(201).json({ event, sms_fallback: "MOCK SMS queued to referral hotline when data connection is unavailable." });
});

app.post("/api/offline/sync", (_req, res) => {
  const synced = memory.offlineQueue.splice(0).map((event) => ({ ...event, sync_status: "synced" }));
  res.json({ synced_count: synced.length, events: synced });
});

app.use((error, _req, res, next) => {
  if (error.message === "Origin not allowed by CORS policy.") return res.status(403).json({ error: error.message });
  return next(error);
});

async function start() {
  if (config.nodeEnv === "production" && config.jwtSecret === "change-this-demo-secret") {
    throw new Error("JWT_SECRET must be set to a private value in production.");
  }
  await initializeDatabase();
  await initializeGraph();
  if (config.redisUrl) {
    const redis = createClient({ url: config.redisUrl });
    redis.on("error", (error) => console.warn("Redis cache unavailable:", error.message));
    redis.connect().then(() => console.log("Redis connected")).catch(() => undefined);
  }
  app.listen(config.port, () => console.log(`LifeLine API listening on ${config.port}`));
}

start().catch((error) => {
  console.error("LifeLine API failed to start:", error.message);
  process.exit(1);
});
