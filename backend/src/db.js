import pg from "pg";
import { config } from "./config.js";
import { alerts, auditLogs, guidelineChunks, patients } from "./seedData.js";
import { docsChangelog, docsSections, docsSettings, docsVersions, teamMembers } from "./docsSeed.js";

const { Pool } = pg;
export const pool = config.databaseUrl ? new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined
}) : null;
export const memory = {
  patients: structuredClone(patients),
  alerts: structuredClone(alerts),
  auditLogs: structuredClone(auditLogs),
  guidelineChunks: structuredClone(guidelineChunks),
  ocrRecords: [],
  offlineQueue: [],
  docsSettings: structuredClone(docsSettings),
  docsSections: structuredClone(docsSections),
  docsVersions: structuredClone(docsVersions),
  teamMembers: structuredClone(teamMembers),
  docsChangelog: structuredClone(docsChangelog)
};
let databaseReady = false;

export async function initializeDatabase() {
  if (!pool) return false;
  try {
    await pool.query("SELECT 1");
    databaseReady = true;
    console.log("PostgreSQL connected");
  } catch (error) {
    console.warn("PostgreSQL unavailable; using demo in-memory data:", error.message);
  }
  return databaseReady;
}

export function isDatabaseReady() {
  return databaseReady;
}

export async function query(text, params = []) {
  if (!databaseReady || !pool) throw new Error("Database not ready");
  return pool.query(text, params);
}

export async function tryQuery(text, params = []) {
  try {
    return await query(text, params);
  } catch (error) {
    console.warn("Database operation fell back to demo store:", error.message);
    return null;
  }
}
