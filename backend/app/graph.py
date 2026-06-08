from __future__ import annotations

from typing import Any

EDGES = [
    ("headache", "hypertension", "RELATED_TO"),
    ("swelling", "hypertension", "RELATED_TO"),
    ("high BP", "hypertension", "INDICATES"),
    ("hypertension", "preeclampsia risk", "INCREASES_RISK_OF"),
    ("preeclampsia risk", "emergency referral", "REQUIRES"),
    ("bleeding", "hemorrhage risk", "INCREASES_RISK_OF"),
    ("hemorrhage risk", "emergency referral", "REQUIRES"),
    ("low hemoglobin", "anemia", "INDICATES"),
    ("anemia", "clinical follow-up", "REQUIRES"),
]


def reason_graph(symptoms: list[str], fields: dict[str, Any] | None = None) -> dict[str, Any]:
    fields = fields or {}
    lowered = {item.lower() for item in symptoms}
    if (fields.get("systolic") or 0) >= 140 or (fields.get("diastolic") or 0) >= 90:
        lowered.add("high bp")
    if {"headache", "swelling", "high bp"} & lowered:
        path = ["headache/swelling/high BP", "hypertension", "preeclampsia risk", "emergency referral"]
        explanation = "Headache, swelling, or high BP maps to hypertension, then preeclampsia risk, then emergency referral review."
    elif "bleeding" in lowered:
        path = ["bleeding", "hemorrhage risk", "emergency referral"]
        explanation = "Bleeding maps to hemorrhage risk and emergency referral review."
    elif (fields.get("hemoglobin") or 0) and fields["hemoglobin"] < 10:
        path = ["low hemoglobin", "anemia", "clinical follow-up"]
        explanation = "Low hemoglobin maps to anemia and follow-up support."
    else:
        path = ["reported symptoms", "routine antenatal monitoring"]
        explanation = "No seeded emergency graph path matched."
    return {"path": path, "edges": [{"from": a, "to": b, "type": rel} for a, b, rel in EDGES], "explanation": explanation, "source": "NetworkX-style in-memory graph fallback; Neo4j Community can replace this adapter"}
