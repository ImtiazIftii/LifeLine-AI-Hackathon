from __future__ import annotations

from typing import Any

import requests

from app.config import DISCLAIMER, GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL, LLM_PROVIDER, OLLAMA_BASE_URL, OLLAMA_MODEL


def _chunk_text(chunk: dict[str, Any]) -> str:
    return str(chunk.get("text") or chunk.get("chunk_text") or "")


def _with_disclaimer(text: str, disclaimer: str = DISCLAIMER) -> str:
    return text if disclaimer in text else f"{text.strip()}\n\n{disclaimer}"


def _chat(prompt: str, system: str, timeout: int = 20) -> tuple[str | None, str]:
    if LLM_PROVIDER == "groq":
        if not GROQ_API_KEY:
            return None, "local retrieval-template fallback; Groq API key not configured"
        try:
            response = requests.post(
                f"{GROQ_BASE_URL.rstrip('/')}/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.1,
                },
                timeout=timeout,
            )
            response.raise_for_status()
            choices = response.json().get("choices") or []
            text = ((choices[0] or {}).get("message") or {}).get("content", "") if choices else ""
            return str(text).strip() or None, f"groq:{GROQ_MODEL}"
        except Exception:
            return None, "local retrieval-template fallback; Groq unavailable"

    if LLM_PROVIDER == "ollama":
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": f"{system}\n\n{prompt}", "stream": False},
                timeout=timeout,
            )
            response.raise_for_status()
            text = str(response.json().get("response") or "").strip()
            return text or None, f"ollama:{OLLAMA_MODEL}"
        except Exception:
            return None, "local retrieval-template fallback; Ollama unavailable"

    return None, "local retrieval-template fallback"


def generate_grounded_assistant_answer(query: str, chunks: list[dict[str, Any]], language: str) -> dict[str, str]:
    context = "\n".join(
        f"[{chunk.get('title', 'Untitled')} | {chunk.get('source', 'local')}] {_chunk_text(chunk)}"
        for chunk in chunks
    )
    reply_language = "Bangla" if language == "bn" else "English"
    fallback = (_chunk_text(chunks[0]) if chunks else "Please contact a trained healthcare worker for assessment.") + f" {DISCLAIMER}"
    prompt = (
        "Answer the maternal health question using only the cited context. "
        "Do not diagnose. Do not invent facts. Keep urgent danger-sign referral language. "
        f"Reply in {reply_language}.\n\n"
        f"Question: {query}\n\nContext:\n{context}\n\n"
        f"End with this exact disclaimer: {DISCLAIMER}"
    )
    text, provider = _chat(
        prompt,
        "You are LifeLine AI, a maternal healthcare decision-support assistant. You provide education, not diagnosis.",
    )
    return {"answer": _with_disclaimer(text, DISCLAIMER) if text else fallback, "provider": provider}


def generate_nutrition_llm_note(result: dict[str, Any], payload: dict[str, Any]) -> dict[str, str] | None:
    prompt = (
        "Create a concise nutrition decision-support explanation from this local rule/RAG result. "
        "Do not diagnose. Do not replace the meal plan. Keep warning signs and dietitian/doctor disclaimer. "
        "If high-risk warning signs exist, emphasize urgent medical evaluation before nutrition advice. "
        "Include one short Bangla paragraph after the English bullets.\n\n"
        f"Input: {payload}\n\n"
        f"Local result: {result}"
    )
    text, provider = _chat(
        prompt[:6000],
        "You are LifeLine AI nutrition decision support for pregnancy. You are not a doctor or registered dietitian.",
    )
    if not text:
        return None
    return {"text": _with_disclaimer(text, result["disclaimer"]), "provider": provider}
