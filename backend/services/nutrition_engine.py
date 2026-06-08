from __future__ import annotations

import csv
import os
from dataclasses import dataclass
from typing import Any

import requests

from app.config import LLM_PROVIDER, OLLAMA_BASE_URL, OLLAMA_MODEL
from services.llm_clients import generate_nutrition_llm_note

NUTRITION_DISCLAIMER = "Nutrition suggestions are educational decision-support only and do not replace doctors or registered dietitians."


@dataclass(frozen=True)
class Food:
    name: str
    category: str
    iron_mg: float
    protein_g: float
    vitamin_c_mg: float
    fiber_g: float
    budget: str
    diet_tags: str
    notes: str


def _project_path(*parts: str) -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", *parts))


def _load_foods() -> list[Food]:
    path = _project_path("data", "bd_food_nutrition.csv")
    with open(path, encoding="utf-8", newline="") as handle:
        return [
            Food(
                name=row["food"],
                category=row["category"],
                iron_mg=float(row["iron_mg"]),
                protein_g=float(row["protein_g"]),
                vitamin_c_mg=float(row["vitamin_c_mg"]),
                fiber_g=float(row["fiber_g"]),
                budget=row["budget"],
                diet_tags=row["diet_tags"],
                notes=row["notes"],
            )
            for row in csv.DictReader(handle)
        ]


def _load_guidelines() -> list[dict[str, str]]:
    path = _project_path("knowledge", "maternal_nutrition_guidelines.md")
    with open(path, encoding="utf-8") as handle:
        text = handle.read()
    chunks: list[dict[str, str]] = []
    for section in text.split("\n## "):
        section = section.strip()
        if not section:
            continue
        lines = section.splitlines()
        title = lines[0].replace("# ", "").strip()
        body = "\n".join(lines[1:]).strip()
        chunks.append({"title": title, "text": body or title})
    return chunks


def _contains(values: list[str], target: str) -> bool:
    return any(target == value.lower() for value in values)


def _bp_values(bp: str | None) -> tuple[int, int]:
    if not bp or "/" not in bp:
        return 0, 0
    left, right = bp.split("/", 1)
    try:
        return int(float(left.strip())), int(float(right.strip()))
    except ValueError:
        return 0, 0


def _retrieve_guidance(symptoms: list[str], indicators: dict[str, Any]) -> list[dict[str, str]]:
    terms = set(symptoms)
    hb = indicators.get("hemoglobin")
    systolic, diastolic = _bp_values(indicators.get("bp"))
    if hb is not None and float(hb or 0) < 10:
        terms.update(["anemia", "hemoglobin", "iron"])
    if systolic >= 140 or diastolic >= 90:
        terms.update(["blood", "pressure", "headache", "swelling"])
    if {"nausea", "vomiting"} & terms:
        terms.update(["nausea", "vomiting"])
    if "constipation" in terms:
        terms.update(["constipation", "fiber"])

    scored = []
    for chunk in _load_guidelines():
        searchable = f"{chunk['title']} {chunk['text']}".lower()
        score = sum(1 for term in terms if term and term in searchable)
        scored.append({**chunk, "score": score})
    return sorted(scored, key=lambda item: item["score"], reverse=True)[:4]


def _food_allowed(food: Food, preference: str, allergies: list[str], budget: str) -> bool:
    lowered_allergies = [item.lower().strip() for item in allergies]
    if any(allergy and allergy in food.name for allergy in lowered_allergies):
        return False
    if budget == "low" and food.budget == "medium":
        return False
    pref = preference.lower()
    tags = food.diet_tags.lower()
    if "vegetarian" in pref and food.category in {"fish", "protein"} and food.name not in {"egg", "lentils"}:
        return False
    if "fish" not in pref and food.name == "small fish":
        return False
    if "chicken" not in pref and food.name == "chicken":
        return False
    if "egg" not in pref and food.name == "egg":
        return False
    return "all" in tags or True


def _names(foods: list[Food], category: str | None = None) -> list[str]:
    return [food.name for food in foods if category is None or food.category == category]


def _first_available(foods: list[Food], names: list[str], fallback: str) -> str:
    available = {food.name for food in foods}
    return next((name for name in names if name in available), fallback)


def _risk_assessment(symptoms: list[str], indicators: dict[str, Any]) -> dict[str, Any]:
    hb = indicators.get("hemoglobin")
    systolic, diastolic = _bp_values(indicators.get("bp"))
    high_bp = systolic >= 140 or diastolic >= 90
    anemia_support = (hb is not None and float(hb or 0) < 10) or bool({"weakness", "dizziness"} & set(symptoms))
    high_risk = high_bp and bool({"headache", "swelling", "blurred vision"} & set(symptoms))
    nausea = bool({"nausea", "vomiting", "low appetite"} & set(symptoms))
    constipation = "constipation" in symptoms

    reasons: list[str] = []
    if high_risk:
        reasons.append("High blood pressure with headache, swelling, or blurred vision is a danger-sign pattern; urgent medical evaluation is needed.")
    if anemia_support:
        reasons.append("Possible anemia nutrition support needed because low hemoglobin, weakness, or dizziness is present.")
    if high_bp:
        reasons.append("Blood pressure is elevated; reduce excess salt and avoid processed salty snacks.")
    if nausea:
        reasons.append("Nausea, vomiting, or low appetite may improve with small frequent bland meals and fluids.")
    if constipation:
        reasons.append("Constipation support should include fiber-rich foods, vegetables, fruits, and water.")
    if not reasons:
        reasons.append("No nutrition danger pattern was detected from the submitted demo information.")

    risk = "High risk - urgent review" if high_risk else "Possible anemia nutrition support needed" if anemia_support else "Routine nutrition support"
    return {"risk": risk, "high_risk": high_risk, "reasons": reasons}


def _meal_plan(foods: list[Food], symptoms: list[str], indicators: dict[str, Any]) -> dict[str, Any]:
    available_names = {food.name for food in foods}
    protein_order = ["small fish", "egg", "lentils", "chicken"] if "small fish" in available_names else ["egg", "lentils", "chicken"]
    protein = _first_available(foods, protein_order, "lentils")
    vitamin_c = _first_available(foods, ["guava", "lemon", "banana"], "guava")
    iron_leaf = _first_available(foods, ["spinach", "mixed vegetables"], "spinach")
    staple = _first_available(foods, ["rice", "roti"], "rice")
    breakfast_protein = _first_available(foods, ["egg", "lentils", "small fish"], protein)
    bland = "banana"
    dinner_protein = "egg/fish" if {"egg", "small fish"} <= available_names else protein

    one_day = {
        "breakfast": f"{breakfast_protein} + roti/rice + {bland}",
        "lunch": f"rice + lentils + {iron_leaf} + {protein} + lemon",
        "snack": f"{vitamin_c}/banana + water",
        "dinner": f"rice + dal + mixed vegetables + {dinner_protein}",
    }
    three_day = [
        {"day": 1, **one_day},
        {
            "day": 2,
            "breakfast": f"roti or rice + egg/lentils + banana",
            "lunch": f"rice + dal + spinach + small fish or egg + lemon",
            "snack": "guava + safe drinking water",
            "dinner": "rice + mixed vegetables + dal + egg or fish",
        },
        {
            "day": 3,
            "breakfast": "rice porridge or roti + egg + banana",
            "lunch": "rice + lentils + leafy vegetables + lemon",
            "snack": "guava or seasonal fruit + water",
            "dinner": "rice + vegetables + dal + small fish/egg if allowed",
        },
    ]
    return {"one_day": one_day, "three_day": three_day}


def _bangla_summary(risk: str, high_risk: bool) -> str:
    if high_risk:
        return "উচ্চ রক্তচাপের সঙ্গে মাথাব্যথা, ফোলা বা চোখে ঝাপসা থাকলে এটি বিপদসংকেত হতে পারে। শুধু খাবারের পরিকল্পনা যথেষ্ট নয়; জরুরি চিকিৎসা মূল্যায়ন প্রয়োজন।"
    if "anemia" in risk.lower():
        return "কম হিমোগ্লোবিন, দুর্বলতা বা মাথা ঘোরার ক্ষেত্রে আয়রনসমৃদ্ধ খাবার যেমন ডাল, পালং শাক, ছোট মাছ, ডিম এবং লেবু/পেয়ারার মতো ভিটামিন সি উৎস সহায়ক হতে পারে।"
    return "গর্ভাবস্থায় নিয়মিত সুষম খাবার, পর্যাপ্ত পানি, শাকসবজি, ডাল, ফল এবং নিরাপদ প্রোটিন উৎস গ্রহণ করুন। কোনো বিপদসংকেত থাকলে স্বাস্থ্যকর্মীর সঙ্গে যোগাযোগ করুন।"


def _ollama_note(payload: dict[str, Any], guidance: list[dict[str, str]]) -> str | None:
    if LLM_PROVIDER != "ollama":
        return None
    prompt = (
        "Summarize this maternal nutrition decision-support plan in 3 safe bullets. "
        "Do not diagnose. Keep doctor referral warnings. Data: "
        f"{payload}. Guidance: {guidance}"
    )
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt[:4000], "stream": False},
            timeout=10,
        )
        response.raise_for_status()
        return str(response.json().get("response", ""))[:800]
    except Exception:
        return None


def generate_nutrition_plan(payload: dict[str, Any]) -> dict[str, Any]:
    symptoms = [str(item).lower() for item in payload.get("symptoms") or []]
    indicators = {
        "hemoglobin": payload.get("hemoglobin"),
        "bp": payload.get("bp") or payload.get("blood_pressure"),
        "weight": payload.get("weight"),
    }
    preference = str(payload.get("dietary_preference") or "rice-based").lower()
    allergies = [str(item) for item in payload.get("allergies") or []]
    budget = str(payload.get("budget") or "low").lower()

    foods = [food for food in _load_foods() if _food_allowed(food, preference, allergies, budget)]
    guidance = _retrieve_guidance(symptoms, indicators)
    risk = _risk_assessment(symptoms, indicators)
    meals = _meal_plan(foods, symptoms, indicators)

    prioritize = [
        "lentils",
        "spinach or leafy vegetables",
        "small fish or egg if allowed",
        "lemon or guava with iron-rich meals",
        "safe drinking water",
    ]
    avoid = ["excess salt", "processed salty snacks", "unwashed produce", "undercooked fish, egg, chicken, or liver"]
    if {"nausea", "vomiting"} & set(symptoms):
        avoid.extend(["large heavy meals", "oily or strong-smelling foods if they worsen nausea"])
    warnings = [
        "Seek urgent care for severe dizziness, breathlessness, bleeding, fainting, seizure, or severe abdominal pain.",
        "Seek urgent care if high blood pressure occurs with headache, swelling, or blurred vision.",
        "Seek care if vomiting is severe, fluids cannot be kept down, or signs of dehydration appear.",
    ]

    result = {
        "risk": risk["risk"],
        "risk_reasons": risk["reasons"],
        "risk_aware_nutrition_advice": [
            "Use iron-rich foods with vitamin C when anemia support is needed.",
            "Nutrition advice does not replace urgent evaluation for danger signs.",
            "Keep meals simple, affordable, and culturally familiar for Bangladesh.",
        ],
        "one_day_meal_plan": meals["one_day"],
        "three_day_meal_plan": meals["three_day"],
        "foods_to_prioritize": prioritize,
        "foods_to_avoid": avoid,
        "warning_signs_requiring_doctor_visit": warnings,
        "bangla_explanation": _bangla_summary(risk["risk"], risk["high_risk"]),
        "rag_guidance": guidance,
        "food_database_matches": [food.__dict__ for food in foods[:8]],
        "location": payload.get("location") or "Bangladesh",
        "provider": "local nutrition rules + CSV food database + markdown RAG",
        "disclaimer": NUTRITION_DISCLAIMER,
    }
    note = _ollama_note(payload, guidance)
    if note:
        result["local_llm_note"] = note
        result["provider"] = f"{result['provider']} + ollama:{OLLAMA_MODEL}"
    else:
        llm_note = generate_nutrition_llm_note(result, payload)
        if llm_note:
            result["local_llm_note"] = llm_note["text"]
            result["provider"] = f"{result['provider']} + {llm_note['provider']}"
    return result
