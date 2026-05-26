export const docsSettings = {
  id: "public-docs",
  is_enabled: true,
  visibility_override: null,
  start_at: "2026-06-10T00:00:00.000Z",
  end_at: "2026-06-14T23:59:59.000Z",
  updated_by: "system seed",
  updated_at: "2026-05-27T00:00:00.000Z"
};

const makeSection = (id, slug, title, category, summary, body, displayOrder) => ({
  id: `90000000-0000-4000-8000-${id.slice(2).padStart(12, "0")}`,
  slug,
  title,
  category,
  summary,
  body,
  display_order: displayOrder,
  status: "published",
  updated_at: "2026-05-27T00:00:00.000Z"
});

export const docsSections = [
  makeSection("ds01", "overview", "Hero / Product Overview", "Pitch", "Earlier maternal emergency signals for frontline care teams.", {
    lead: "LifeLine AI helps health workers turn symptoms, vitals, and scanned records into transparent, cited escalation guidance in low-bandwidth settings.",
    bullets: ["Maternal emergency prediction support", "Cited Contextual RAG plus Graph RAG explanations", "Offline-ready escalation and audit trail"]
  }, 1),
  makeSection("ds02", "problem", "Problem", "Pitch", "Danger signs can be missed where records, specialists, and connectivity are limited.", {
    lead: "Maternal emergencies require timely recognition, yet frontline teams often rely on fragmented paper records and delayed referral coordination.",
    bullets: ["Warning signals are scattered across symptoms and vitals", "Rural connectivity interrupts digital workflows", "Unexplained AI output cannot earn clinical trust"]
  }, 2),
  makeSection("ds03", "solution", "Solution", "Pitch", "Traceable decision support built around a human care team.", {
    lead: "LifeLine validates intake, computes rule-based risk indicators, retrieves grounded guidance, maps graph pathways, and surfaces alerts for human review.",
    bullets: ["OCR ingestion with verification", "Risk scores linked to evidence", "Health worker alert dashboard"]
  }, 3),
  makeSection("ds04", "why-now", "Why Now", "Pitch", "Local AI and interoperable data systems make responsible deployment practical.", {
    bullets: ["Affordable local LLM inference protects sensitive workflows", "pgvector and Neo4j enable explainable hybrid retrieval", "Digital community health programs need resilient tools for last-mile escalation"]
  }, 4),
  makeSection("ds05", "demo-flow", "Product Demo Flow", "Pitch", "A two-minute path from intake to accountable escalation.", {
    steps: ["Enter symptoms and vitals or verify an OCR-extracted record", "Risk engine identifies danger indicators without issuing a diagnosis", "Contextual RAG retrieves cited guidance and Graph RAG explains the path", "Red or Orange alerts require health worker review", "Audit log preserves score, sources, path, and safety disclaimer"]
  }, 5),
  makeSection("ds06", "market", "Market Opportunity", "Pitch", "Maternal health systems need trusted clinical workflow support.", {
    lead: "LifeLine is designed for public health programs, NGOs, clinics, and community health networks operating in emerging and low-connectivity markets.",
    bullets: ["Program deployments with configurable local guidelines", "Facility-to-community referral coordination", "Anonymized quality and operational analytics"]
  }, 6),
  makeSection("ds07", "business-model", "Business Model", "Pitch", "Deployment and support without paid AI dependence.", {
    bullets: ["Open-core demonstration with institutional deployment services", "Implementation, training, and local guideline configuration", "Local inference support avoids a required paid API dependency"]
  }, 7),
  makeSection("ds08", "traction", "Traction / Current Status", "Pitch", "Deployable MVP with end-to-end traceability.", {
    bullets: ["Synthetic demonstration dataset and seeded workflows", "Contextual RAG, Graph RAG, OCR simulation, alerts, and audits wired end-to-end", "Docker Compose deployment with Postgres/pgvector, Redis, Neo4j, Express, and Next.js"]
  }, 8),
  makeSection("ds09", "competition", "Competition", "Pitch", "More accountable than generic chat and more adaptive than static forms.", {
    matrix: [
      ["Capability", "Static checklists", "General AI chat", "LifeLine AI"],
      ["Cited maternal guidance", "Limited", "Variable", "Built in"],
      ["Graph explainability", "No", "No", "Yes"],
      ["Offline workflow", "Partial", "No", "Designed in"],
      ["Human escalation + audit", "Manual", "Variable", "Built in"]
    ]
  }, 9),
  makeSection("ds10", "advantage", "Unique Advantage", "Pitch", "Clinical accountability is part of the product architecture.", {
    bullets: ["Contextual RAG combines semantics with pregnancy stage, severity, and source metadata", "Neo4j paths make symptom-to-action reasoning reviewable", "Every high-risk signal is designed for human-in-loop escalation and auditing"]
  }, 10),
  makeSection("ds11", "go-to-market", "Go-To-Market", "Pitch", "Start with supervised pilots and measured escalation workflows.", {
    steps: ["Partner with maternal health program operators", "Validate local guidance and workflow protocols with clinicians", "Pilot with trained health workers using synthetic then governed data", "Measure referral timeliness, alert review, and usability"]
  }, 11),
  makeSection("ds12", "team", "Team", "Pitch", "Builders and reviewers behind LifeLine AI.", {
    lead: "The showcase team directory is managed below. Contact information is provided for project collaboration only."
  }, 12),
  makeSection("ds13", "vision", "Vision", "Pitch", "A trusted early-warning layer for every frontline maternal care team.", {
    lead: "We envision locally operated decision support that helps care teams recognize danger sooner while protecting privacy, respecting clinical authority, and learning from accountable outcomes."
  }, 13),
  makeSection("ds14", "feature-matrix", "Feature Matrix", "Product", "What is implemented today and designed next.", {
    matrix: [
      ["Feature", "MVP status", "Traceability"],
      ["Maternal risk flags", "Live", "Score and reasons logged"],
      ["Contextual RAG", "Live demo", "Citations retained"],
      ["Graph RAG", "Live demo", "Path displayed"],
      ["OCR medical record ingestion", "Simulated extraction", "Verification required"],
      ["Offline / low-bandwidth", "Live simulation", "Sync activity logged"],
      ["Local LLM support", "Configurable", "Provider surfaced"]
    ]
  }, 14),
  makeSection("ds15", "architecture", "Architecture Diagram", "Technical", "Modular services keep prediction support grounded and observable.", {
    diagram: ["User", "Frontend", "Backend API", "Risk Engine", "Contextual RAG", "pgvector", "Neo4j Graph RAG", "Alert Dashboard", "Audit Logs"]
  }, 15),
  makeSection("ds16", "data-flow", "Data Flow Diagram", "Technical", "Safety-relevant output is validated, retrieved, escalated, and audited.", {
    diagram: ["Patient symptoms/vitals", "Validation", "Risk scoring", "RAG retrieval", "Graph traversal", "Recommendation", "Emergency alert", "Dashboard", "Audit log"]
  }, 16),
  makeSection("ds17", "technology", "Technology Stack", "Technical", "Deployable open technologies, with local AI support.", {
    bullets: ["Next.js and Tailwind CSS frontend", "Express API with role gates", "PostgreSQL and pgvector for records and vector-ready retrieval", "Neo4j for Graph RAG pathways", "Redis for caching/offline workflow support", "Ollama, llama.cpp, or vLLM local runtime support"]
  }, 17),
  makeSection("ds18", "api", "API Documentation", "Technical", "Live interfaces for docs and the product demonstration.", {
    endpoints: [
      ["GET", "/api/docs/public", "Published public showcase payload"],
      ["GET/POST", "/api/docs/settings", "Read or administer schedule and override"],
      ["GET/POST/PUT/DELETE", "/api/docs/sections", "Section authoring and ordering"],
      ["POST", "/api/docs/publish", "Publish draft sections and record version"],
      ["GET/POST", "/api/docs/team", "Public team listing and admin add"],
      ["GET", "/api/docs/metrics", "Anonymized live dashboard totals"],
      ["POST", "/api/risk/analyze", "Risk, retrieval, graph, alert and audit workflow"]
    ]
  }, 18),
  makeSection("ds19", "data-layer", "Data Layer", "Technical", "Structured and vector-ready records with anonymized public reporting.", {
    bullets: ["PostgreSQL stores clinical demo workflow and docs publishing state", "pgvector column supports local embedding replacement", "Semantic chunking enriches guidelines with severity, stage, source, and language metadata", "No identifiable patient records are returned through public docs metrics"]
  }, 19),
  makeSection("ds20", "ai-layer", "AI Layer", "Technical", "Retrieval-grounded assistance rather than autonomous diagnosis.", {
    bullets: ["Hybrid search pattern combines metadata and semantic relevance", "Contextual RAG supplies source citations", "Neo4j Graph RAG renders explainable symptom-condition-action paths", "Local LLM mode is optional; deterministic fallback remains available"]
  }, 20),
  makeSection("ds21", "roadmap", "Product Roadmap", "Technical", "From robust demonstration to governed clinical pilot.", {
    steps: ["Now: deployable traceable MVP with synthetic data", "Next: clinician-reviewed localized guideline corpus and real OCR integration", "Pilot: authenticated RBAC, encryption, consent, monitored referral workflow", "Scale: validated outcomes analysis and regional configuration"]
  }, 21),
  makeSection("ds22", "scalability", "Performance & Scalability", "Technical", "Designed for intermittent networks and independently scalable services.", {
    bullets: ["Cached guidance and queue-based offline synchronization", "Vector and graph data stores isolated behind API services", "Stateless frontend/backend containers support horizontal deployment", "Local inference selection permits latency and infrastructure control"]
  }, 22),
  makeSection("ds23", "security", "Security & Responsible AI", "Trust", "Care teams remain accountable for every medical action.", {
    bullets: ["AI is decision-support, not diagnosis", "Source citations and Graph RAG paths support explainability", "Audit logs preserve risk output provenance", "Privacy protection requires least privilege and anonymized reporting", "Human-in-loop escalation is required for urgent flags", "Bias, language accuracy, and clinical validation limitations must be assessed before deployment"]
  }, 23),
  makeSection("ds24", "metrics", "Analytics / KPIs", "Operations", "Anonymized demonstration indicators update from system data.", {
    lead: "Counts report synthetic/demo workflow activity only and disclose no patient identity."
  }, 24),
  makeSection("ds25", "changelog", "Changelog", "Operations", "Published product and showcase milestones.", {
    lead: "Updates are recorded as the demonstration evolves."
  }, 25)
];

export const teamMembers = [
  {
    id: "91000000-0000-4000-8000-000000000001",
    full_name: "Dr. Farhana Sultana",
    role: "Clinical Safety Advisor",
    email: "farhana@lifeline.demo",
    image_url: "",
    github_url: "",
    linkedin_url: "https://www.linkedin.com/",
    display_order: 1
  },
  {
    id: "91000000-0000-4000-8000-000000000002",
    full_name: "Nusrat Rahman",
    role: "Community Health Workflow Lead",
    email: "nusrat@lifeline.demo",
    image_url: "",
    github_url: "https://github.com/",
    linkedin_url: "",
    display_order: 2
  },
  {
    id: "91000000-0000-4000-8000-000000000003",
    full_name: "Samir Hasan",
    role: "AI and Platform Engineer",
    email: "samir@lifeline.demo",
    image_url: "",
    github_url: "https://github.com/",
    linkedin_url: "",
    display_order: 3
  }
];

export const docsChangelog = [
  { id: "92000000-0000-4000-8000-000000000001", version: "0.3.0", title: "Public showcase and docs portal", details: "Investor narrative, architecture, metrics, and controlled publishing added.", published_at: "2026-05-27T00:00:00.000Z" },
  { id: "92000000-0000-4000-8000-000000000002", version: "0.2.0", title: "Traceable maternal risk workflow", details: "Alert dashboard, citations, graph path, and audit views connected.", published_at: "2026-05-26T00:00:00.000Z" },
  { id: "92000000-0000-4000-8000-000000000003", version: "0.1.0", title: "Deployable local-first MVP", details: "Compose stack and synthetic demonstration dataset established.", published_at: "2026-05-25T00:00:00.000Z" }
];

export const docsVersions = [
  { id: "93000000-0000-4000-8000-000000000001", version_label: "Seed publication", notes: "Initial published showcase content.", created_at: "2026-05-27T00:00:00.000Z" }
];
