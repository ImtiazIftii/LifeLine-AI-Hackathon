from __future__ import annotations

import re
from typing import Any

from .data import GUIDANCE


def retrieve_guidance(query: str = "", symptoms: list[str] | None = None, risk_level: str | None = None, language: str = "bn") -> dict[str, Any]:
    symptoms = [item.lower() for item in (symptoms or [])]
    terms = set(re.findall(r"[a-zA-Z]+|[\u0980-\u09ff]+", f"{query} {' '.join(symptoms)}".lower()))
    scored = []
    for chunk in GUIDANCE:
        searchable = " ".join([
            chunk["title"],
            chunk["source"],
            chunk["text"],
            " ".join(chunk["symptoms"]),
            " ".join(chunk["conditions"]),
        ]).lower()
        score = sum(1 for term in terms if term in searchable)
        score += 4 * sum(1 for symptom in symptoms if symptom in chunk["symptoms"])
        score += 2 if risk_level and chunk["risk_level"] == risk_level else 0
        score += 1 if chunk["language"] == language else 0
        scored.append({**chunk, "score": score, "retrieval_method": "local keyword + metadata over seeded WHO/DGHS sample chunks"})
    chunks = sorted(scored, key=lambda item: item["score"], reverse=True)[:4]
    return {"chunks": chunks, "citations": [{"title": item["title"], "source": item["source"], "language": item["language"]} for item in chunks]}
