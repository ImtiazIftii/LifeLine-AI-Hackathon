from __future__ import annotations

import json
import os
from typing import Any

from .config import DATA_DIR


def load_json(name: str) -> list[dict[str, Any]]:
    path = os.path.join(DATA_DIR, name)
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


GUIDANCE = load_json("guidance.json")
SAMPLE_RECORDS = load_json("sample_records.json")

DASHBOARD = {
    "patients": [
        {"id": "demo-001", "name": "Ayesha Begum", "age": 25, "pregnancy_week": 34, "village": "Charpara", "risk_level": "Red", "score": 96},
        {"id": "demo-002", "name": "Mariam Khatun", "age": 30, "pregnancy_week": 28, "village": "Sonapur", "risk_level": "Yellow", "score": 48},
        {"id": "demo-003", "name": "Rokeya Akter", "age": 21, "pregnancy_week": 19, "village": "Lakshmipur", "risk_level": "Green", "score": 12},
    ],
    "alerts": [
        {"patient_name": "Ayesha Begum", "risk_level": "Red", "message": "Possible preeclampsia danger-sign pathway. Immediate human review required."},
        {"patient_name": "Mariam Khatun", "risk_level": "Yellow", "message": "Low hemoglobin follow-up and counseling recommended."},
    ],
}
