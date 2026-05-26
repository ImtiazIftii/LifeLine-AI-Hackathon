import { memory, tryQuery, isDatabaseReady } from "../db.js";
import { DISCLAIMER } from "../config.js";

function rewriteQuery(query, symptoms) {
  const additions = symptoms.length ? ` maternal pregnancy ${symptoms.join(" ")}` : " maternal pregnancy danger signs";
  return `${query.trim()}${additions}`.toLowerCase();
}

function vectorPlaceholderScore(text, terms) {
  const chars = text.toLowerCase().split("");
  const fingerprint = chars.reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;
  const queryFingerprint = terms.join("").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;
  return Math.max(0, 1 - Math.abs(fingerprint - queryFingerprint) / 97);
}

export async function retrieveGuidance({ query = "", symptoms = [], language, severity }) {
  let chunks = memory.guidelineChunks;
  if (isDatabaseReady()) {
    const result = await tryQuery(
      "SELECT id, source, title, category, pregnancy_stage, severity, related_symptoms, related_conditions, language, chunk_text FROM guideline_chunks"
    );
    if (result) chunks = result.rows;
  }
  const rewrittenQuery = rewriteQuery(query, symptoms);
  const terms = rewrittenQuery.match(/[a-z]+|[\u0980-\u09ff]+/gi) || [];
  const normalizedSymptoms = symptoms.map((item) => item.toLowerCase());
  const scored = chunks.map((chunk) => {
    const searchable = `${chunk.title} ${chunk.category} ${chunk.chunk_text} ${(chunk.related_symptoms || []).join(" ")}`.toLowerCase();
    const keywordScore = terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0);
    const symptomScore = normalizedSymptoms.reduce(
      (score, symptom) => score + ((chunk.related_symptoms || []).includes(symptom) ? 3 : 0),
      0
    );
    const metadataScore = severity && chunk.severity === severity ? 2 : 0;
    const languageScore = language && chunk.language === language ? 1 : 0;
    return {
      ...chunk,
      retrieval_score: Number((keywordScore + symptomScore + metadataScore + languageScore + vectorPlaceholderScore(searchable, terms)).toFixed(2)),
      retrieval_method: "keyword + metadata + vector-placeholder"
    };
  });
  const filtered = scored
    .filter((chunk) => !language || chunk.language === language || chunk.language === "en")
    .sort((a, b) => b.retrieval_score - a.retrieval_score)
    .slice(0, 3);
  return {
    original_query: query,
    rewritten_query: rewrittenQuery,
    chunks: filtered,
    citations: filtered.map((chunk) => ({ title: chunk.title, source: chunk.source, language: chunk.language })),
    disclaimer: DISCLAIMER
  };
}
