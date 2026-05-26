# Lakehouse Export

`node lakehouse/export/export.js` writes a safe demonstration CSV with aggregated, anonymized maternal screening counts. No names, phone numbers, villages, or record identifiers are exported.

The `parquet/` directory is reserved for a production Parquet writer: run exports from approved aggregate SQL views and partition by reporting period and region. That contract can be registered in Delta Lake, Apache Iceberg, or Apache Hudi without changing dashboard-facing analytics semantics. Apply consent, minimum-cell suppression, retention controls, encryption, and access audit logging before any operational use.
