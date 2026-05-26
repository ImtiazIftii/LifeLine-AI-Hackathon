# Model Context Protocol (MCP) Integration

## Purpose

MCP servers can expose controlled maternal-record and guideline operations to a locally hosted assistant while preserving service boundaries, least privilege, and auditability. MCP is optional for this MVP and is not launched in Compose.

## Proposed Servers

| MCP Server | Data Access | Permitted Use |
| --- | --- | --- |
| PostgreSQL MCP | Patient records, approved chunks, alerts, audits | Scoped structured retrieval and writes through approved tools |
| Neo4j MCP | Seeded symptom-risk-action graph | Read-only pathway traversal and explanations |
| Filesystem MCP | Staged guideline documents | Controlled ingestion by administrator/reviewer only |

## Exposed Tools

| Tool | Operation | Allowed Roles | Audit Requirement |
| --- | --- | --- | --- |
| `vector_search` | Search approved `guideline_chunks` with metadata filters | Mother, Health Worker, Doctor/Admin | Log chunks and source IDs |
| `graph_traverse` | Read symptom-to-action paths | Health Worker, Doctor/Admin | Log path and graph version |
| `risk_score` | Invoke deterministic danger rules | Health Worker, Doctor/Admin | Log inputs, score, severity |
| `ocr_extract` | Extract candidate fields from an uploaded record | Health Worker, Doctor/Admin | Log verification status; no unverified decision |
| `emergency_alert` | Create alert requiring human review | Health Worker, Doctor/Admin | Mandatory alert and reviewer trail |

## Permission Rules

- Mothers may submit their intake and read safe cited guidance; they cannot browse other records, graph administration, or audit logs.
- Health workers may review assigned patients, submit OCR for verification, traverse risk paths, and raise/acknowledge alerts.
- Doctor/Admin reviewers may view audits and analytics, approve source ingestion, and oversee role assignments.
- Tools must derive role from a validated user session, never from model-provided arguments.
- Red alerts cannot be resolved or downgraded by an LLM tool call.
- PostgreSQL access should use parameterized queries, row-level policy by assignment, and separate read/write service identities.
- Filesystem ingestion accepts only staged approved documents, records hashes and source metadata, and blocks secrets or patient uploads.

## Example Tool Contract

```json
{
  "name": "risk_score",
  "input": { "patient_id": "uuid", "symptoms": ["headache"], "vitals": { "systolic": 150, "diastolic": 96 } },
  "output": { "severity": "Red", "score": 94, "requires_human_review": true, "audit_id": "uuid" }
}
```

All tool-generated guidance must include the LifeLine decision-support disclaimer and return provenance suitable for the audit trail.
