from __future__ import annotations

import re
import json
from typing import Any

import requests

from .config import GROQ_API_KEY, GROQ_BASE_URL, GROQ_MODEL, LLM_PROVIDER, OLLAMA_BASE_URL, OLLAMA_MODEL

SYMPTOM_TERMS = {
    "headache": ["headache", "severe headache", "মাথাব্যথা"],
    "swelling": ["swelling", "edema", "oedema", "ফোলা"],
    "bleeding": ["bleeding", "vaginal bleeding", "রক্তপাত"],
    "dizziness": ["dizziness", "weakness", "মাথা ঘোরা"],
    "fever": ["fever", "জ্বর"],
    "abdominal pain": ["abdominal pain", "stomach pain", "পেট ব্যথা"],
    "blurred vision": ["blurred vision", "vision", "চোখে ঝাপসা"],
}

MEDICINE_TERMS = ["iron", "folic acid", "calcium", "methyldopa", "aspirin", "paracetamol", "antacid"]


def _number(pattern: str, text: str, cast=float) -> Any:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return None
    value = match.group(1)
    try:
        return cast(value)
    except ValueError:
        return None


def parse_structured_fields(text: str) -> dict[str, Any]:
    compact = " ".join(text.split())
    bp_match = re.search(r"(?:(?:bp|blood pressure)\s*[:\-]?\s*)?(\d{2,3})\s*/\s*(\d{2,3})", compact, flags=re.IGNORECASE)
    symptoms = [
        canonical
        for canonical, variants in SYMPTOM_TERMS.items()
        if any(variant.lower() in compact.lower() for variant in variants)
    ]
    medicines = [name for name in MEDICINE_TERMS if name in compact.lower()]
    return {
        "patient_age": _number(r"(?:age|aged)\s*[:\-]?\s*(\d{1,2})", compact, int),
        "pregnancy_week": _number(r"(?:pregnancy|gestation|ga|week)\s*(?:week|wk|weeks)?\s*[:\-]?\s*(\d{1,2})", compact, int),
        "blood_pressure": f"{bp_match.group(1)}/{bp_match.group(2)}" if bp_match else None,
        "systolic": int(bp_match.group(1)) if bp_match else None,
        "diastolic": int(bp_match.group(2)) if bp_match else None,
        "hemoglobin": _number(r"(?:hb|hemoglobin|haemoglobin)\s*[:\-]?\s*(\d{1,2}(?:\.\d)?)", compact, float),
        "symptoms": symptoms,
        "medicines": medicines,
    }


def _json_from_text(value: str) -> dict[str, Any]:
    match = re.search(r"\{.*\}", value, flags=re.DOTALL)
    if not match:
        return {}
    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _normalize_llm_fields(value: dict[str, Any]) -> dict[str, Any]:
    symptoms = value.get("symptoms") if isinstance(value.get("symptoms"), list) else []
    medicines = value.get("medicines") if isinstance(value.get("medicines"), list) else []
    return {
        "patient_age": value.get("patient_age"),
        "pregnancy_week": value.get("pregnancy_week"),
        "blood_pressure": value.get("blood_pressure"),
        "hemoglobin": value.get("hemoglobin"),
        "symptoms": [str(item).lower() for item in symptoms],
        "medicines": [str(item).lower() for item in medicines],
    }


def _merge_fields(parsed: dict[str, Any], llm_fields: dict[str, Any]) -> dict[str, Any]:
    merged = {**parsed}
    for key, value in llm_fields.items():
        if value not in (None, "", []):
            merged[key] = value

    bp_match = re.match(r"^\s*(\d{2,3})\s*/\s*(\d{2,3})\s*$", str(merged.get("blood_pressure") or ""))
    if bp_match:
        merged["systolic"] = int(bp_match.group(1))
        merged["diastolic"] = int(bp_match.group(2))
    return merged


def _ocr_prompt(text: str) -> str:
    return (
        "Extract JSON only from this antenatal OCR text. "
        "Use keys patient_age, pregnancy_week, blood_pressure, hemoglobin, symptoms, medicines. "
        "Use null for unknown values. Do not diagnose or recommend care. Text:\n"
        + text[:4000]
    )


def extract_with_optional_llm(text: str) -> dict[str, Any]:
    parsed = parse_structured_fields(text)

    if LLM_PROVIDER not in {"ollama", "groq"}:
        return {**parsed, "provider": "deterministic local parser"}

    prompt = _ocr_prompt(text)

    if LLM_PROVIDER == "groq":
        if not GROQ_API_KEY:
            return {**parsed, "provider": "deterministic local parser; Groq API key not configured"}
        try:
            response = requests.post(
                f"{GROQ_BASE_URL.rstrip('/')}/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": "You extract structured OCR fields for maternal health decision support. Return JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0,
                    "response_format": {"type": "json_object"},
                },
                timeout=15,
            )
            response.raise_for_status()
            choices = response.json().get("choices") or []
            content = ((choices[0] or {}).get("message") or {}).get("content", "") if choices else ""
            llm_fields = _normalize_llm_fields(_json_from_text(content))
            return {**_merge_fields(parsed, llm_fields), "provider": f"groq:{GROQ_MODEL}"}
        except Exception:
            return {**parsed, "provider": "deterministic local parser; Groq unavailable"}

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=15,
        )
        response.raise_for_status()
        llm_response_text = response.json().get("response", "")
        llm_fields = _normalize_llm_fields(_json_from_text(llm_response_text))
        return {**_merge_fields(parsed, llm_fields), "provider": f"ollama:{OLLAMA_MODEL}", "llm_note": llm_response_text[:500]}
    except Exception:
        return {**parsed, "provider": "deterministic local parser; Ollama unavailable"}
