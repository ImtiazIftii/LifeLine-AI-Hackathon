from __future__ import annotations

from typing import Any


def classify_risk(fields: dict[str, Any]) -> dict[str, Any]:
    symptoms = [str(item).lower() for item in fields.get("symptoms") or []]
    systolic = int(fields.get("systolic") or 0)
    diastolic = int(fields.get("diastolic") or 0)
    hb = float(fields.get("hemoglobin") or 0)
    reasons: list[str] = []
    recommendations: list[str] = []
    score = 10
    level = "Green"

    if "bleeding" in symptoms:
        score, level = 100, "Red"
        reasons.append("Bleeding is a maternal danger sign that requires emergency referral review.")
        recommendations.append("Arrange immediate transport and qualified clinical assessment.")

    if systolic >= 160 or diastolic >= 110:
        score, level = max(score, 100), "Red"
        reasons.append("Very high blood pressure is an emergency warning sign in pregnancy.")
        recommendations.append("Immediate facility referral and human review are required.")
    elif (systolic >= 140 or diastolic >= 90) and ({"headache", "swelling", "blurred vision"} & set(symptoms)):
        score, level = max(score, 96), "Red"
        reasons.append("High blood pressure with headache, swelling, or vision symptoms suggests a preeclampsia danger-sign pathway.")
        recommendations.append("Urgent emergency referral review by a qualified provider.")
    elif systolic >= 140 or diastolic >= 90:
        score, level = max(score, 76), "Orange"
        reasons.append("Elevated blood pressure needs same-day clinical reassessment.")
        recommendations.append("Repeat blood pressure and refer according to local protocol.")

    if "abdominal pain" in symptoms and "fever" in symptoms and level != "Red":
        score, level = max(score, 78), "Orange"
        reasons.append("Fever with abdominal pain requires urgent evaluation.")
        recommendations.append("Same-day assessment by a trained clinician.")

    if hb and hb < 10 and level not in {"Red", "Orange"}:
        score, level = max(score, 52), "Yellow"
        reasons.append("Hemoglobin below 10 g/dL indicates anemia warning signs.")
        recommendations.append("Clinical review, nutrition counseling, iron adherence check, and follow-up hemoglobin test.")

    if not reasons:
        reasons.append("No configured emergency danger rule was triggered by the submitted demo data.")
        recommendations.append("Continue routine antenatal follow-up and report new danger signs promptly.")

    return {"risk_level": level, "score": score, "reasons": reasons, "recommendations": recommendations, "requires_human_review": level in {"Red", "Orange"}}
