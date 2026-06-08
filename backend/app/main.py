from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import ALLOW_VERCEL_PREVIEWS, CORS_ORIGINS, DISCLAIMER, LLM_PROVIDER
from .data import DASHBOARD, GUIDANCE, SAMPLE_RECORDS
from .extraction import extract_with_optional_llm
from .graph import reason_graph
from .ocr import extract_text
from .rag import retrieve_guidance
from .risk import classify_risk
from routes.nutrition import router as nutrition_router
from services.llm_clients import generate_grounded_assistant_answer

app = FastAPI(title="LifeLine AI Free Demo API", version="1.0.0")


def allowed_origin(origin: str) -> bool:
    if origin in CORS_ORIGINS:
        return True
    if ALLOW_VERCEL_PREVIEWS:
        try:
            from urllib.parse import urlparse

            parsed = urlparse(origin)
            return parsed.scheme == "https" and parsed.hostname is not None and parsed.hostname.endswith(".vercel.app")
        except Exception:
            return False
    return False


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app" if ALLOW_VERCEL_PREVIEWS else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(nutrition_router)


DOCS_ADMIN_ROLES = {"admin", "super_admin"}


def token_role(authorization: str | None = Header(default=None)) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "", 1)
    if token.startswith("demo-token-"):
        return token.replace("demo-token-", "", 1)
    return None


def require_docs_admin(role: str | None = Depends(token_role)) -> str:
    if role not in DOCS_ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Authenticated docs administrator access is required.")
    return role

PATIENTS = [
    {"id": "demo-001", "name": "Ayesha Begum", "age": 25, "pregnancy_week": 34, "village": "Charpara", "preferred_language": "bn", "assigned_worker": "Nusrat CHW", "severity": "Red", "score": 96},
    {"id": "demo-002", "name": "Mariam Khatun", "age": 30, "pregnancy_week": 28, "village": "Sonapur", "preferred_language": "en", "assigned_worker": "Nusrat CHW", "severity": "Yellow", "score": 48},
    {"id": "demo-003", "name": "Rokeya Akter", "age": 21, "pregnancy_week": 19, "village": "Lakshmipur", "preferred_language": "bn", "assigned_worker": "Rahim CHW", "severity": "Green", "score": 12},
]

ALERTS = [
    {"id": "alert-001", "patient_name": "Ayesha Begum", "severity": "Red", "message": "Possible preeclampsia danger signs: referral review required.", "status": "Open", "requires_human_review": True},
    {"id": "alert-002", "patient_name": "Mariam Khatun", "severity": "Yellow", "message": "Anemia follow-up recommended.", "status": "Acknowledged", "requires_human_review": False},
]

AUDIT_LOGS = [
    {"id": "audit-001", "event_type": "risk_analysis", "actor_role": "health_worker", "summary": "Red alert generated for elevated BP and headache.", "risk_score": 96, "graph_path": ["Headache", "Hypertension", "Preeclampsia", "Emergency Referral"], "created_at": datetime.now(timezone.utc).isoformat()},
    {"id": "audit-002", "event_type": "ocr_extract", "actor_role": "health_worker", "summary": "Local OCR and structured extraction completed with verification required.", "risk_score": None, "graph_path": [], "created_at": datetime.now(timezone.utc).isoformat()},
]

OFFLINE_QUEUE: list[dict] = []


def docs_sections() -> list[dict]:
    return [
        {"id": "docs-001", "slug": "overview", "title": "LifeLine AI Overview", "category": "Pitch", "summary": "Free, local-first maternal emergency decision support.", "body": {"lead": "LifeLine AI turns symptoms, vitals, and scanned records into transparent, cited decision-support output.", "bullets": ["OCR with Tesseract or seeded fallback", "Local structured extraction with optional Ollama", "Risk rules with human review", "RAG and Graph RAG explanations"]}, "display_order": 1, "status": "published", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "docs-002", "slug": "demo-flow", "title": "Product Demo Flow", "category": "Product", "summary": "Upload, extract, classify, retrieve, explain, and review.", "body": {"steps": ["Upload prescription/report image, PDF, or text", "Extract text locally", "Extract patient age, pregnancy week, BP, hemoglobin, symptoms, medicines", "Classify Green, Yellow, Orange, or Red", "Retrieve WHO/DGHS sample guidance", "Show symptom-risk graph path", "Display Bangla explanation and review queue"]}, "display_order": 2, "status": "published", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "docs-003", "slug": "technology", "title": "Technology Stack", "category": "Technical", "summary": "No paid API dependency.", "body": {"bullets": ["Next.js and Tailwind CSS frontend", "FastAPI backend", "Tesseract OCR", "Optional Ollama local LLM", "Local JSON RAG with pgvector-ready Postgres", "NetworkX-style graph fallback with Neo4j Community available in Compose"]}, "display_order": 3, "status": "published", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "docs-004", "slug": "api", "title": "API Documentation", "category": "Technical", "summary": "Routes used by the demo and previous pages.", "body": {"endpoints": [["POST", "/api/ocr/extract", "Local OCR and fields"], ["POST", "/api/risk/analyze", "Risk, RAG, graph, alert, audit"], ["GET", "/api/docs/public", "Docs showcase"], ["GET", "/api/analytics", "Dashboard metrics"]]}, "display_order": 4, "status": "published", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "docs-005", "slug": "metrics", "title": "Analytics / KPIs", "category": "Operations", "summary": "Synthetic demo metrics only.", "body": {"lead": "Counts report seeded and synthetic workflow activity only."}, "display_order": 5, "status": "published", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "docs-006", "slug": "team", "title": "Team", "category": "Pitch", "summary": "Demo project contributors.", "body": {"lead": "Team entries are synthetic for demonstration."}, "display_order": 6, "status": "published", "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "docs-007", "slug": "changelog", "title": "Changelog", "category": "Operations", "summary": "Demo milestones.", "body": {"lead": "Updates are recorded as the demo evolves."}, "display_order": 7, "status": "published", "updated_at": datetime.now(timezone.utc).isoformat()},
    ]


DOCS_SECTIONS = docs_sections()
DOCS_SETTINGS = {
    "id": "public-docs",
    "is_enabled": True,
    "visibility_override": True,
    "start_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
    "end_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
    "updated_by": "system seed",
    "updated_at": datetime.now(timezone.utc).isoformat(),
}
DOCS_VERSIONS = [{"id": "version-001", "version_label": "Free local demo", "notes": "Previous pages restored with FastAPI compatibility endpoints.", "created_at": datetime.now(timezone.utc).isoformat()}]
TEAM = [{"id": "team-001", "full_name": "LifeLine Demo Team", "role": "Open-source prototype maintainers", "email": "team@lifeline.demo", "image_url": "", "github_url": "", "linkedin_url": "", "display_order": 1}]
CHANGELOG = [{"id": "change-001", "version": "1.0.0", "title": "Free local demo", "details": "FastAPI, local OCR, RAG, Graph RAG, and previous multi-page UI enabled.", "published_at": datetime.now(timezone.utc).isoformat()}]


def availability() -> dict:
    visible = bool(DOCS_SETTINGS["visibility_override"]) if DOCS_SETTINGS["visibility_override"] is not None else bool(DOCS_SETTINGS["is_enabled"])
    return {"visible": visible, "reason": "Visible now" if visible else "Hidden by admin"}


def risk_for_old_ui(fields: dict) -> dict:
    risk = classify_risk(fields)
    return {
        "score": risk["score"],
        "severity": risk["risk_level"],
        "reasons": risk["reasons"],
        "recommendations": risk["recommendations"],
        "requires_human_review": risk["requires_human_review"],
    }


def vitals_to_fields(symptoms: list[str], vitals: dict) -> dict:
    systolic = int(float(vitals.get("systolic") or 0))
    diastolic = int(float(vitals.get("diastolic") or 0))
    return {
        "systolic": systolic,
        "diastolic": diastolic,
        "blood_pressure": f"{systolic}/{diastolic}" if systolic and diastolic else None,
        "hemoglobin": float(vitals.get("hemoglobin") or 0),
        "symptoms": symptoms,
    }


class TextPayload(BaseModel):
    text: str
    language: str = "bn"


class FieldsPayload(BaseModel):
    fields: dict
    language: str = "bn"


class RagPayload(BaseModel):
    query: str = ""
    symptoms: list[str] = []
    risk_level: str | None = None
    language: str = "bn"


class GraphPayload(BaseModel):
    symptoms: list[str] = []
    fields: dict = {}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "stack": "FastAPI + Next.js + Tailwind + local OCR/RAG/risk/graph",
        "paid_api_dependencies": False,
        "llm_provider": LLM_PROVIDER,
        "disclaimer": DISCLAIMER,
    }


@app.get("/api/samples")
def samples():
    return {"records": SAMPLE_RECORDS, "guidance_count": len(GUIDANCE), "disclaimer": DISCLAIMER}


@app.post("/api/ocr/extract")
async def ocr_extract(file: UploadFile = File(...)):
    content = await file.read()
    ocr = extract_text(file.filename or "upload", content)
    fields = extract_with_optional_llm(str(ocr["text"]))
    extracted_fields = {
        "patient_age": fields.get("patient_age"),
        "pregnancy_week": fields.get("pregnancy_week"),
        "blood_pressure": fields.get("blood_pressure"),
        "hemoglobin": fields.get("hemoglobin"),
        "symptoms": fields.get("symptoms") or [],
        "medicines": fields.get("medicines") or [],
    }
    return {
        "id": str(uuid4()),
        "filename": file.filename,
        "ocr_text": ocr["text"],
        "engine": ocr["engine"],
        "provider": fields.get("provider"),
        "fallback_used": ocr["fallback_used"],
        "fields": fields,
        "extracted_fields": extracted_fields,
        "verification_required": True,
        "disclaimer": DISCLAIMER,
    }


@app.post("/api/llm/extract")
def structured_extract(payload: TextPayload):
    return {"fields": extract_with_optional_llm(payload.text), "disclaimer": DISCLAIMER}


@app.post("/api/risk/classify")
def risk_classify(payload: FieldsPayload):
    return {"risk": classify_risk(payload.fields), "disclaimer": DISCLAIMER}


@app.post("/api/rag/retrieve")
def rag_retrieve(payload: RagPayload):
    return {"retrieval": retrieve_guidance(payload.query, payload.symptoms, payload.risk_level, payload.language), "disclaimer": DISCLAIMER}


@app.post("/api/graph/reason")
def graph_reason(payload: GraphPayload):
    return {"graph": reason_graph(payload.symptoms, payload.fields), "disclaimer": DISCLAIMER}


@app.post("/api/demo/analyze")
def demo_analyze(payload: TextPayload):
    fields = extract_with_optional_llm(payload.text)
    risk = classify_risk(fields)
    retrieval = retrieve_guidance(payload.text, fields.get("symptoms") or [], risk["risk_level"], payload.language)
    graph = reason_graph(fields.get("symptoms") or [], fields)
    bangla_explanation = (
        "এই ফলাফলটি রোগ নির্ণয় নয়। প্রদত্ত তথ্য অনুযায়ী ঝুঁকির স্তর "
        f"{risk['risk_level']}। কারণ: {' '.join(risk['reasons'])} "
        "প্রশিক্ষিত স্বাস্থ্যকর্মী বা চিকিৎসকের পর্যালোচনা প্রয়োজন।"
    )
    return {"fields": fields, "risk": risk, "retrieval": retrieval, "graph": graph, "bangla_explanation": bangla_explanation, "disclaimer": DISCLAIMER}


@app.get("/api/dashboard")
def dashboard():
    return {**DASHBOARD, "offline_first": [
        "All sample guidance and demo records are bundled in the repository.",
        "Risk rules, RAG retrieval, and graph reasoning run locally after Docker build.",
        "Ollama is optional; deterministic extraction keeps the demo usable without internet.",
        "No paid OCR, LLM, vector, SMS, or cloud API is required.",
    ], "disclaimer": DISCLAIMER}


@app.post("/api/auth/login")
def login(payload: dict):
    email = str(payload.get("email") or "worker@lifeline.demo").lower()
    role = "admin" if "admin" in email else "doctor_admin" if "doctor" in email else "mother" if "mother" in email else "health_worker"
    return {"user": {"name": email.split("@")[0].replace(".", " ").title(), "email": email, "role": role}, "token": f"demo-token-{role}", "demo": True}


@app.post("/api/auth/register")
def register(payload: dict):
    role = payload.get("role") or "mother"
    return {"user": {"name": payload.get("name") or "Demo User", "email": payload.get("email") or "demo@lifeline.local", "role": role}, "token": f"demo-token-{role}"}


@app.post("/api/patients")
def create_patient(payload: dict):
    patient = {"id": str(uuid4()), **payload, "age": int(payload.get("age") or 0), "pregnancy_week": int(payload.get("pregnancy_week") or 0), "severity": "Green", "score": 0}
    PATIENTS.insert(0, patient)
    return patient


@app.get("/api/patients")
def list_patients():
    return PATIENTS


@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    patient = next((item for item in PATIENTS if item["id"] == patient_id), None) or PATIENTS[0]
    return {**patient, "vitals": {"systolic": 150, "diastolic": 96, "hemoglobin": 10.8, "temperature": 37.0}, "symptoms": ["headache", "swelling"], "risk": {"severity": patient.get("severity", "Green"), "score": patient.get("score", 0)}}


@app.post("/api/risk/analyze")
def risk_analyze(payload: dict):
    symptoms = payload.get("symptoms") or []
    fields = vitals_to_fields(symptoms, payload.get("vitals") or {})
    risk = risk_for_old_ui(fields)
    retrieval = retrieve_guidance(" ".join(symptoms), symptoms, risk["severity"], payload.get("language") or "en")
    graph = reason_graph(symptoms, fields)
    patient_id = payload.get("patient_id")
    for patient in PATIENTS:
        if patient["id"] == patient_id:
            patient["severity"] = risk["severity"]
            patient["score"] = risk["score"]
    if risk["severity"] in {"Red", "Orange"}:
        ALERTS.insert(0, {"id": str(uuid4()), "patient_name": payload.get("patient_name") or "New intake", "severity": risk["severity"], "message": risk["reasons"][0], "status": "Open", "requires_human_review": True})
    AUDIT_LOGS.insert(0, {"id": str(uuid4()), "event_type": "risk_analysis", "actor_role": "mother", "summary": f"{risk['severity']} maternal risk decision-support result generated.", "risk_score": risk["score"], "graph_path": graph["path"], "created_at": datetime.now(timezone.utc).isoformat()})
    return {"risk": risk, "retrieval": retrieval, "graph": graph, "alert_created": risk["severity"] in {"Red", "Orange"}, "disclaimer": DISCLAIMER}


@app.post("/api/assistant/query")
def assistant_query(payload: dict):
    query = payload.get("query") or ""
    symptoms = payload.get("symptoms") or []
    language = payload.get("language") or "en"
    retrieval = retrieve_guidance(query, symptoms, None, language)
    graph = reason_graph(symptoms or query.lower().split(), {})
    generated = generate_grounded_assistant_answer(query, retrieval["chunks"], language)
    return {"answer": generated["answer"], "retrieval": retrieval, "graph": graph, "provider": generated["provider"], "disclaimer": DISCLAIMER}


@app.post("/api/alerts")
def create_alert(payload: dict):
    alert = {"id": str(uuid4()), "status": "Open", "requires_human_review": payload.get("severity") in {"Red", "Orange"}, **payload}
    ALERTS.insert(0, alert)
    return alert


@app.get("/api/alerts")
def list_alerts():
    return ALERTS


@app.get("/api/analytics")
def analytics():
    counts = {level: 0 for level in ["Green", "Yellow", "Orange", "Red"]}
    for patient in PATIENTS:
        counts[patient.get("severity", "Green")] += 1
    return {
        "risk_distribution": [{"severity": key, "count": value} for key, value in counts.items()],
        "active_alerts": len([item for item in ALERTS if item.get("status") == "Open"]),
        "patients_screened": len(PATIENTS),
        "referrals_today": len([item for item in ALERTS if item.get("severity") in {"Red", "Orange"}]),
        "offline_sync_pending": len(OFFLINE_QUEUE),
    }


@app.get("/api/audit-logs")
def audit_logs():
    return AUDIT_LOGS


@app.get("/api/provenance")
def provenance():
    return {
        "sources": ["Local WHO-style sample guidance", "Local DGHS-style sample guidance", "Seeded synthetic demo records"],
        "pipeline": ["upload", "OCR", "structured extraction", "risk rules", "RAG retrieval", "graph reasoning", "dashboard", "audit"],
        "model_runtime": {"configured_provider": LLM_PROVIDER, "supported": ["Ollama", "Groq", "deterministic parser"], "fallback": "local retrieval-template response"},
        "limitations": ["Demo guidance requires clinical validation before real-world use.", "This prototype does not diagnose.", "Bangla text requires review before care use."],
        "disclaimer": DISCLAIMER,
    }


@app.post("/api/offline/queue")
def offline_queue(payload: dict):
    event = {"id": str(uuid4()), "payload": payload, "sync_status": "pending"}
    OFFLINE_QUEUE.append(event)
    return {"event": event, "sms_fallback": "MOCK SMS queued locally. No paid SMS API is used."}


@app.post("/api/offline/sync")
def offline_sync():
    count = len(OFFLINE_QUEUE)
    events = [{**event, "sync_status": "synced"} for event in OFFLINE_QUEUE]
    OFFLINE_QUEUE.clear()
    return {"synced_count": count, "events": events}


@app.get("/api/docs/public")
def docs_public():
    if not availability()["visible"]:
        return {"error": "Not Available", "schedule": {"start_at": DOCS_SETTINGS["start_at"], "end_at": DOCS_SETTINGS["end_at"]}}
    return {
        "sections": [section for section in DOCS_SECTIONS if section["status"] == "published"],
        "team": TEAM,
        "changelog": CHANGELOG,
        "metrics": {
            "users": 5,
            "patients_screened": len(PATIENTS),
            "alerts_generated": len(ALERTS),
            "audited_activities": len(AUDIT_LOGS),
            "documented_apis": 14,
            "platform_features": 10,
            "data_classification": "Synthetic demo data only",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        "publication": {"status": availability()["reason"], "start_at": DOCS_SETTINGS["start_at"], "end_at": DOCS_SETTINGS["end_at"]},
        "disclaimer": DISCLAIMER,
    }


@app.get("/api/docs/settings")
def docs_settings(_role: str = Depends(require_docs_admin)):
    return {**DOCS_SETTINGS, "availability": availability()}


@app.post("/api/docs/settings")
def save_docs_settings(payload: dict, _role: str = Depends(require_docs_admin)):
    DOCS_SETTINGS.update({key: payload[key] for key in ["is_enabled", "visibility_override", "start_at", "end_at"] if key in payload})
    DOCS_SETTINGS["updated_at"] = datetime.now(timezone.utc).isoformat()
    return {**DOCS_SETTINGS, "availability": availability()}


@app.get("/api/docs/sections")
def get_docs_sections(_role: str = Depends(require_docs_admin)):
    return {"sections": sorted(DOCS_SECTIONS, key=lambda item: item["display_order"]), "versions": DOCS_VERSIONS}


@app.post("/api/docs/sections")
def add_docs_section(payload: dict, _role: str = Depends(require_docs_admin)):
    section = {**payload, "id": str(uuid4()), "updated_at": datetime.now(timezone.utc).isoformat()}
    DOCS_SECTIONS.append(section)
    return section


@app.put("/api/docs/sections/{section_id}")
def update_docs_section(section_id: str, payload: dict, _role: str = Depends(require_docs_admin)):
    for index, section in enumerate(DOCS_SECTIONS):
        if section["id"] == section_id:
            DOCS_SECTIONS[index] = {**section, **payload, "id": section_id, "updated_at": datetime.now(timezone.utc).isoformat()}
            return DOCS_SECTIONS[index]
    return {"id": section_id, **payload}


@app.delete("/api/docs/sections/{section_id}")
def delete_docs_section(section_id: str, _role: str = Depends(require_docs_admin)):
    DOCS_SECTIONS[:] = [section for section in DOCS_SECTIONS if section["id"] != section_id]
    return {"ok": True}


@app.post("/api/docs/publish")
def publish_docs(payload: dict, _role: str = Depends(require_docs_admin)):
    section_ids = set(payload.get("section_ids") or [section["id"] for section in DOCS_SECTIONS])
    for section in DOCS_SECTIONS:
        if section["id"] in section_ids:
            section["status"] = "published"
    version = {"id": str(uuid4()), "version_label": payload.get("version_label") or "Publication", "notes": payload.get("notes") or "Published.", "created_at": datetime.now(timezone.utc).isoformat()}
    DOCS_VERSIONS.insert(0, version)
    return {"published_sections": len(section_ids), "version": version}


@app.get("/api/docs/team")
def docs_team(_role: str = Depends(require_docs_admin)):
    return TEAM


@app.post("/api/docs/team")
def add_team_member(payload: dict, _role: str = Depends(require_docs_admin)):
    member = {"id": str(uuid4()), "display_order": len(TEAM) + 1, "image_url": "", "github_url": "", "linkedin_url": "", **payload}
    TEAM.append(member)
    return member


@app.get("/api/docs/metrics")
def docs_metrics(_role: str = Depends(require_docs_admin)):
    return docs_public()["metrics"]
