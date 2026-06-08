import { config, DISCLAIMER } from "../config.js";

function chunkText(chunk) {
  if (!chunk) return "";
  return chunk.chunk_text || chunk.text || "";
}

function buildPrompt(question, chunks, language) {
  const context = chunks
    .map((chunk) => `[${chunk.title || "Untitled"} | ${chunk.source || "local"}] ${chunkText(chunk)}`)
    .join("\n");

  const replyLanguage = language === "bn" ? "Bangla" : "English";

  return [
    "You are a maternal healthcare decision-support assistant.",
    "Do not diagnose.",
    "Use only the cited context.",
    "Advise qualified emergency care for danger signs.",
    `Reply in ${replyLanguage}.`,
    `QUESTION: ${question}`,
    "CONTEXT:",
    context,
    `End with this exact disclaimer: ${DISCLAIMER}`
  ].join("\n");
}

function withDisclaimer(text) {
  return text.includes(DISCLAIMER) ? text : `${text}\n\n${DISCLAIMER}`;
}

function jsonFromText(text) {
  const match = String(text || "").match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    const parsed = JSON.parse(match[0]);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateAnswer(input = {}) {
  const question = input.question || "";
  const chunks = Array.isArray(input.chunks) ? input.chunks : [];
  const language = input.language || "en";
  const firstChunkText = chunkText(chunks[0]);
  const fallbackText = firstChunkText || "Please contact a trained healthcare worker for assessment.";
  const fallback = `${fallbackText} ${DISCLAIMER}`;

  if (config.llmProvider === "mock") {
    return { text: fallback, provider: "retrieval-template fallback" };
  }

  const prompt = buildPrompt(question, chunks, language);

  try {
    if (config.llmProvider === "groq") {
      if (!config.groqApiKey) throw new Error("Groq API key is not configured");
      const response = await fetchWithTimeout(
        `${config.groqBaseUrl.replace(/\/$/, "")}/chat/completions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.groqApiKey}` },
          body: JSON.stringify({
            model: config.groqModel,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
          })
        },
        15000
      );

      if (!response.ok) throw new Error("Groq request failed");
      const body = await response.json();
      const choice = Array.isArray(body.choices) ? body.choices[0] : null;
      const message = choice && choice.message ? choice.message : {};
      const text = String(message.content || "");
      return { text: withDisclaimer(text), provider: `groq:${config.groqModel}` };
    }

    if (config.llmProvider === "ollama") {
      const response = await fetchWithTimeout(
        `${config.ollamaBaseUrl}/api/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: config.ollamaModel, prompt, stream: false })
        },
        15000
      );

      if (!response.ok) throw new Error("Ollama request failed");
      const body = await response.json();
      const text = String(body.response || "");
      return { text: withDisclaimer(text), provider: `ollama:${config.ollamaModel}` };
    }

    if (config.llmProvider === "llamacpp" || config.llmProvider === "vllm") {
      const response = await fetchWithTimeout(
        `${config.llmBaseUrl}/v1/chat/completions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: config.llmModel,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
          })
        },
        15000
      );

      if (!response.ok) throw new Error("Local compatible runtime request failed");
      const body = await response.json();
      const choice = Array.isArray(body.choices) ? body.choices[0] : null;
      const message = choice && choice.message ? choice.message : {};
      const text = String(message.content || "");
      return { text: withDisclaimer(text), provider: `${config.llmProvider}:${config.llmModel}` };
    }
  } catch (error) {
    console.warn("Local LLM unavailable; response used grounded fallback:", error.message);
  }

  return { text: fallback, provider: "retrieval-template fallback" };
}

export function parseOcrFields(text = "") {
  const compact = String(text).replace(/\s+/g, " ");
  const bp = compact.match(/(?:(?:bp|blood pressure)\s*[:\-]?\s*)?(\d{2,3})\s*\/\s*(\d{2,3})/i);
  const symptomTerms = {
    headache: ["headache", "severe headache"],
    swelling: ["swelling", "edema", "oedema"],
    bleeding: ["bleeding", "vaginal bleeding"],
    dizziness: ["dizziness", "weakness"],
    fever: ["fever"],
    "abdominal pain": ["abdominal pain", "stomach pain"],
    "blurred vision": ["blurred vision", "vision"]
  };
  const lower = compact.toLowerCase();
  const symptoms = Object.entries(symptomTerms)
    .filter(([, terms]) => terms.some((term) => lower.includes(term)))
    .map(([symptom]) => symptom);
  const medicines = ["iron", "folic acid", "calcium", "methyldopa", "aspirin", "paracetamol", "antacid"].filter((item) => lower.includes(item));
  const number = (pattern, cast = Number) => {
    const match = compact.match(pattern);
    return match ? cast(match[1]) : null;
  };
  return {
    patient_age: number(/(?:age|aged)\s*[:\-]?\s*(\d{1,2})/i),
    pregnancy_week: number(/(?:pregnancy|gestation|ga|week)\s*(?:week|wk|weeks)?\s*[:\-]?\s*(\d{1,2})/i),
    blood_pressure: bp ? `${bp[1]}/${bp[2]}` : null,
    systolic: bp ? Number(bp[1]) : null,
    diastolic: bp ? Number(bp[2]) : null,
    hemoglobin: number(/(?:hb|hemoglobin|haemoglobin)\s*[:\-]?\s*(\d{1,2}(?:\.\d)?)/i, parseFloat),
    symptoms,
    medicines
  };
}

function normalizeOcrFields(fields = {}) {
  const symptoms = Array.isArray(fields.symptoms) ? fields.symptoms.map((item) => String(item).toLowerCase()) : [];
  const medicines = Array.isArray(fields.medicines) ? fields.medicines.map((item) => String(item).toLowerCase()) : [];
  return {
    patient_age: fields.patient_age ?? null,
    pregnancy_week: fields.pregnancy_week ?? null,
    blood_pressure: fields.blood_pressure ?? null,
    hemoglobin: fields.hemoglobin ?? null,
    symptoms,
    medicines
  };
}

function mergeOcrFields(parsed, llmFields) {
  const merged = { ...parsed };
  Object.entries(llmFields).forEach(([key, value]) => {
    if (value !== null && value !== "" && (!Array.isArray(value) || value.length)) merged[key] = value;
  });
  const bp = String(merged.blood_pressure || "").match(/^\s*(\d{2,3})\s*\/\s*(\d{2,3})\s*$/);
  if (bp) {
    merged.systolic = Number(bp[1]);
    merged.diastolic = Number(bp[2]);
  }
  return merged;
}

export async function extractOcrFields(text = "") {
  const parsed = parseOcrFields(text);
  if (config.llmProvider !== "groq") return { ...parsed, provider: "deterministic local parser" };
  if (!config.groqApiKey) return { ...parsed, provider: "deterministic local parser; Groq API key not configured" };

  const prompt = [
    "Extract JSON only from this antenatal OCR text.",
    "Use keys patient_age, pregnancy_week, blood_pressure, hemoglobin, symptoms, medicines.",
    "Use null for unknown values. Do not diagnose or recommend care.",
    `Text:\n${String(text).slice(0, 4000)}`
  ].join("\n");

  try {
    const response = await fetchWithTimeout(
      `${config.groqBaseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.groqApiKey}` },
        body: JSON.stringify({
          model: config.groqModel,
          messages: [
            { role: "system", content: "You extract structured OCR fields for maternal health decision support. Return JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0,
          response_format: { type: "json_object" }
        })
      },
      15000
    );
    if (!response.ok) throw new Error("Groq OCR extraction request failed");
    const body = await response.json();
    const choice = Array.isArray(body.choices) ? body.choices[0] : null;
    const content = choice?.message?.content || "";
    return { ...mergeOcrFields(parsed, normalizeOcrFields(jsonFromText(content))), provider: `groq:${config.groqModel}` };
  } catch (error) {
    console.warn("Groq OCR extraction unavailable; deterministic parser used:", error.message);
    return { ...parsed, provider: "deterministic local parser; Groq unavailable" };
  }
}
