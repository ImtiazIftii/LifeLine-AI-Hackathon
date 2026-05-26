export function analyzeRisk({ symptoms = [], vitals = {} }) {
  const normalized = symptoms.map((symptom) => symptom.toLowerCase().trim());
  const has = (term) => normalized.some((symptom) => symptom.includes(term));
  const systolic = Number(vitals.systolic || 0);
  const diastolic = Number(vitals.diastolic || 0);
  const hemoglobin = Number(vitals.hemoglobin || 0);
  const temperature = Number(vitals.temperature || 0);
  const reasons = [];
  const recommendations = [];
  let score = 10;
  let severity = "Green";

  if (has("bleeding")) {
    score = 100;
    severity = "Red";
    reasons.push("Bleeding is an emergency maternal danger sign.");
    recommendations.push("Arrange immediate emergency referral and human review.");
  }

  if ((systolic >= 140 || diastolic >= 90) && (has("headache") || has("swelling"))) {
    score = Math.max(score, systolic >= 160 || diastolic >= 110 ? 100 : 94);
    severity = "Red";
    reasons.push("Elevated blood pressure with headache or swelling indicates possible preeclampsia danger signs.");
    recommendations.push("Urgent facility referral; a qualified provider must review immediately.");
  } else if (systolic >= 140 || diastolic >= 90) {
    score = Math.max(score, 72);
    severity = severity === "Red" ? severity : "Orange";
    reasons.push("Elevated blood pressure requires urgent assessment.");
    recommendations.push("Same-day blood pressure reassessment and clinical evaluation.");
  }

  if (has("severe abdominal pain")) {
    score = Math.max(score, 86);
    severity = severity === "Red" ? severity : "Orange";
    reasons.push("Severe abdominal pain is an urgent pregnancy danger sign.");
    recommendations.push("Urgent referral for assessment.");
  }

  if (has("fever") && has("abdominal pain")) {
    score = Math.max(score, 76);
    severity = severity === "Red" ? severity : "Orange";
    reasons.push("Fever combined with abdominal pain requires urgent evaluation.");
    recommendations.push("Seek same-day clinical assessment.");
  }

  if (hemoglobin > 0 && hemoglobin < 10) {
    const anemiaScore = has("dizziness") ? 68 : 54;
    score = Math.max(score, anemiaScore);
    if (severity === "Green") severity = has("dizziness") ? "Orange" : "Yellow";
    reasons.push("Low hemoglobin indicates anemia warning signs.");
    recommendations.push("Clinical review, nutrition counseling, and follow-up hemoglobin check.");
  }

  if (temperature >= 38 && !has("abdominal pain")) {
    score = Math.max(score, 48);
    if (severity === "Green") severity = "Yellow";
    reasons.push("Fever in pregnancy should be evaluated.");
  }

  if (!reasons.length) {
    reasons.push("No configured emergency danger rule triggered by submitted information.");
    recommendations.push("Continue antenatal follow-up and report new danger signs promptly.");
  }

  return {
    score,
    severity,
    reasons,
    recommendations,
    requires_human_review: severity === "Red" || severity === "Orange"
  };
}
