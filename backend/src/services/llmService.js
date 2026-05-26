import { config, DISCLAIMER } from "../config.js";

function buildPrompt(question, chunks, language) {
  const context = chunks.map((chunk) => `[${chunk.title} | ${chunk.source}] ${chunk.chunk_text}`).join("\n");
  return `You are a maternal healthcare decision-support assistant. Do not diagnose. Use only the cited context and advise qualified emergency care for danger signs. Reply in ${language === "bn" ? "Bangla" : "English"}.\nQUESTION: ${question}\nCONTEXT:\n${context}\nEnd with this exact disclaimer: ${DISCLAIMER}`;
}

export async function generateAnswer({ question, chunks, language }) {
  const fallback = `${chunks[0]?.chunk_text || "Please contact a trained healthcare worker for assessment."} ${DISCLAIMER}`;
  if (config.llmProvider === "mock") return { text: fallback, provider: "retrieval-template fallback" };
  const prompt = buildPrompt(question, chunks, language);
  try {
    if (config.llmProvider === "ollama") {
      const response = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.ollamaModel, prompt, stream: false }),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error("Ollama request failed");
      const body = await response.json();
      const text = String(body.response || "");
      return { text: text.includes(DISCLAIMER) ? text : `${text}\n\n${DISCLAIMER}`, provider: `ollama:${config.ollamaModel}` };
    }
    if (config.llmProvider === "llamacpp" || config.llmProvider === "vllm") {
      const response = await fetch(`${config.llmBaseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.llmModel, messages: [{ role: "user", content: prompt }], temperature: 0.1 }),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error("Local compatible runtime request failed");
      const body = await response.json();
      const text = String(body.choices[0].message.content || "");
      return { text: text.includes(DISCLAIMER) ? text : `${text}\n\n${DISCLAIMER}`, provider: `${config.llmProvider}:${config.llmModel}` };
    }
  } catch (error) {
    console.warn("Local LLM unavailable; response used grounded fallback:", error.message);
  }
  return { text: fallback, provider: "retrieval-template fallback" };
}
