import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === "true",
  redisUrl: process.env.REDIS_URL,
  neo4jUri: process.env.NEO4J_URI,
  neo4jUser: process.env.NEO4J_USER || "neo4j",
  neo4jPassword: process.env.NEO4J_PASSWORD,
  jwtSecret: process.env.JWT_SECRET || "change-this-demo-secret",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean),
  allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS === "true",
  allowDemoRoleHeader: process.env.ALLOW_DEMO_ROLE_HEADER
    ? process.env.ALLOW_DEMO_ROLE_HEADER === "true"
    : process.env.NODE_ENV !== "production",
  enableDemoAccounts: process.env.ENABLE_DEMO_ACCOUNTS
    ? process.env.ENABLE_DEMO_ACCOUNTS === "true"
    : process.env.NODE_ENV !== "production",
  allowPrivilegedSelfRegistration: process.env.ALLOW_PRIVILEGED_SELF_REGISTRATION
    ? process.env.ALLOW_PRIVILEGED_SELF_REGISTRATION === "true"
    : process.env.NODE_ENV !== "production",
  docsAdminEmail: process.env.DOCS_ADMIN_EMAIL,
  docsAdminPassword: process.env.DOCS_ADMIN_PASSWORD,
  docsSuperAdminEmail: process.env.DOCS_SUPER_ADMIN_EMAIL,
  docsSuperAdminPassword: process.env.DOCS_SUPER_ADMIN_PASSWORD,
  llmProvider: process.env.LLM_PROVIDER || "mock",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.1:8b",
  llmBaseUrl: process.env.LLM_BASE_URL || "http://localhost:8000",
  llmModel: process.env.LLM_MODEL || "Qwen/Qwen2.5-7B-Instruct"
};

export const DISCLAIMER =
  "This is decision-support guidance, not a medical diagnosis. For emergency symptoms, contact a qualified healthcare provider immediately.";
