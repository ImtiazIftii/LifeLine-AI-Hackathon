const severityTerms = {
  Red: ["bleeding", "emergency", "seizure", "refer immediately"],
  Orange: ["urgent", "severe pain", "fever"],
  Yellow: ["monitor", "anemia", "follow-up"]
};

export function semanticChunkDocument(text, metadata = {}) {
  const blocks = text
    .split(/\n(?=#)|\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((chunkText, index) => {
    const lower = chunkText.toLowerCase();
    const severity =
      Object.entries(severityTerms).find(([, terms]) => terms.some((term) => lower.includes(term)))?.[0] ||
      metadata.severity ||
      "Green";
    const pregnancyStage = lower.includes("third trimester") ? "third trimester" : metadata.pregnancy_stage || "any";
    const symptoms = ["bleeding", "headache", "swelling", "dizziness", "fever", "abdominal pain"].filter((term) =>
      lower.includes(term)
    );
    return {
      id: `semantic-${index + 1}`,
      ...metadata,
      pregnancy_stage: pregnancyStage,
      severity,
      related_symptoms: symptoms,
      category: metadata.category || "ingested_guideline",
      chunk_text: chunkText.replace(/^#+\s*/, "")
    };
  });
}
