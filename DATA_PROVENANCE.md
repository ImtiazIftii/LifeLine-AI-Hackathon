# Data Provenance

## Demonstration Data

All seeded patients, vitals, alerts, OCR outputs, and audit events are synthetic examples created for the hackathon demonstration. They do not represent real people.

## Guideline Sources

The seeded chunks are short demonstration summaries attributed to public maternal health concepts and local-protocol placeholders. The application surfaces `source`, `title`, `category`, `pregnancy_stage`, `severity`, `related_symptoms`, `related_conditions`, `language`, and `chunk_text` with every retrieval.

Before operational use:

1. Replace demonstration summaries with approved documents licensed for use and reviewed by local clinical governance.
2. Store document publisher, original URI, version/date, jurisdiction, reviewer, approval timestamp, and supersession status.
3. Validate English and Bangla translations with qualified clinical and language reviewers.
4. Re-index only approved chunks and retain immutable provenance for every answer.

## Processing Lineage

```text
Approved source -> semantic chunking -> metadata review -> local embedding/index
-> query rewrite/filter/retrieve -> cited response -> graph path -> audit record
```

`POST /api/rag/chunk` demonstrates heading and clinical-tag aware segmentation. The UI provenance page discloses the configured runtime, fallback behavior, and retrieval limitations.

## Analytics Export

`lakehouse/export/` produces anonymized aggregate demonstration data only. A production export must remove direct identifiers, suppress small cohorts, track consent and purpose, and log access. Its documented partition model is compatible with future Delta Lake, Apache Iceberg, or Apache Hudi tables and Parquet storage.
