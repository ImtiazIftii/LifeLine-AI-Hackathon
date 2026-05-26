import neo4j from "neo4j-driver";
import { config } from "../config.js";

let driver;
let connected = false;

const paths = [
  { match: ["headache"], path: ["Headache", "Hypertension", "Preeclampsia", "Emergency Referral"], explanation: "Headache alongside high blood pressure can increase concern for preeclampsia and requires referral review." },
  { match: ["swelling"], path: ["Swelling", "Preeclampsia", "Emergency Referral"], explanation: "Swelling may contribute to a preeclampsia danger-sign pathway requiring urgent review." },
  { match: ["bleeding"], path: ["Bleeding", "Hemorrhage Risk", "Emergency Referral"], explanation: "Bleeding maps to hemorrhage risk and immediate emergency referral." },
  { match: ["low hemoglobin", "dizziness"], path: ["Low Hemoglobin", "Anemia", "Nutrition Counseling"], explanation: "Low hemoglobin or dizziness maps to anemia follow-up and nutrition counseling." },
  { match: ["severe abdominal pain", "abdominal pain"], path: ["Severe Abdominal Pain", "Emergency Referral"], explanation: "Severe abdominal pain requires urgent clinical assessment." }
];

const graphStatements = [
  "MERGE (s:Symptom {name:'Headache'}) MERGE (c:Condition {name:'Hypertension'}) MERGE (r:Risk {name:'Preeclampsia'}) MERGE (a:EmergencyAction {name:'Emergency Referral'}) MERGE (s)-[:RELATED_TO]->(c) MERGE (c)-[:INCREASES_RISK_OF]->(r) MERGE (r)-[:REQUIRES]->(a)",
  "MERGE (s:Symptom {name:'Swelling'}) MERGE (r:Risk {name:'Preeclampsia'}) MERGE (a:EmergencyAction {name:'Emergency Referral'}) MERGE (s)-[:INCREASES_RISK_OF]->(r) MERGE (r)-[:REQUIRES]->(a)",
  "MERGE (s:Symptom {name:'Bleeding'}) MERGE (r:Risk {name:'Hemorrhage Risk'}) MERGE (a:EmergencyAction {name:'Emergency Referral'}) MERGE (s)-[:INCREASES_RISK_OF]->(r) MERGE (r)-[:REQUIRES]->(a)",
  "MERGE (s:Symptom {name:'Low Hemoglobin'}) MERGE (c:Condition {name:'Anemia'}) MERGE (a:EmergencyAction {name:'Nutrition Counseling'}) MERGE (s)-[:RELATED_TO]->(c) MERGE (c)-[:REQUIRES]->(a)",
  "MERGE (s:Symptom {name:'Severe Abdominal Pain'}) MERGE (a:EmergencyAction {name:'Emergency Referral'}) MERGE (s)-[:REQUIRES]->(a)",
  "MERGE (g:Guideline {name:'Maternal Emergency Protocol'}) MERGE (a:EmergencyAction {name:'Emergency Referral'}) MERGE (a)-[:SUPPORTED_BY]->(g)"
];

export async function initializeGraph() {
  if (!config.neo4jUri || !config.neo4jPassword) return;
  try {
    driver = neo4j.driver(config.neo4jUri, neo4j.auth.basic(config.neo4jUser, config.neo4jPassword));
    await driver.verifyConnectivity();
    const session = driver.session();
    for (const statement of graphStatements) await session.run(statement);
    await session.close();
    connected = true;
    console.log("Neo4j graph seeded");
  } catch (error) {
    console.warn("Neo4j unavailable; using graph path fallback:", error.message);
  }
}

export function getRiskPath(symptoms = []) {
  const normalized = symptoms.map((symptom) => symptom.toLowerCase());
  const result = paths.find((candidate) => candidate.match.some((term) => normalized.some((symptom) => symptom.includes(term))));
  return {
    ...(result || {
      path: ["Reported Symptoms", "Routine Antenatal Monitoring"],
      explanation: "No emergency graph pathway was matched; monitor and escalate new danger signs."
    }),
    source: connected ? "Neo4j seeded graph" : "Local seeded graph fallback"
  };
}

export function isGraphReady() {
  return connected;
}
