export const guidelineChunks = [
  { id: "g1", source: "WHO maternal health (demo excerpt)", title: "Vaginal bleeding danger sign", category: "emergency", pregnancy_stage: "any", severity: "Red", related_symptoms: ["bleeding"], related_conditions: ["hemorrhage"], language: "en", chunk_text: "Vaginal bleeding during pregnancy is a danger sign requiring rapid assessment and referral according to local emergency protocol." },
  { id: "g2", source: "WHO maternal health (demo excerpt)", title: "Bleeding warning", category: "emergency", pregnancy_stage: "any", severity: "Red", related_symptoms: ["bleeding"], related_conditions: ["hemorrhage"], language: "bn", chunk_text: "গর্ভাবস্থায় রক্তপাত বিপদের লক্ষণ। দ্রুত স্বাস্থ্যকেন্দ্রে রেফার করুন।" },
  { id: "g3", source: "Maternal hypertension field guide", title: "Preeclampsia danger signs", category: "hypertension", pregnancy_stage: "third trimester", severity: "Red", related_symptoms: ["headache", "swelling"], related_conditions: ["hypertension", "preeclampsia"], language: "en", chunk_text: "Blood pressure at or above 140/90 with severe headache or swelling needs urgent assessment for preeclampsia and referral." },
  { id: "g4", source: "Maternal hypertension field guide", title: "উচ্চ রক্তচাপ সতর্কতা", category: "hypertension", pregnancy_stage: "third trimester", severity: "Red", related_symptoms: ["headache", "swelling"], related_conditions: ["preeclampsia"], language: "bn", chunk_text: "রক্তচাপ ১৪০/৯০ বা তার বেশি এবং মাথাব্যথা বা ফোলা থাকলে জরুরি পরীক্ষা ও রেফারেল প্রয়োজন।" },
  { id: "g5", source: "Antenatal nutrition guide", title: "Anemia screening", category: "anemia", pregnancy_stage: "any", severity: "Yellow", related_symptoms: ["dizziness", "fatigue"], related_conditions: ["anemia"], language: "en", chunk_text: "Hemoglobin below 10 g/dL warrants clinical review, nutrition counseling, iron adherence check, and follow-up testing." },
  { id: "g6", source: "Antenatal nutrition guide", title: "রক্তস্বল্পতা সহায়তা", category: "anemia", pregnancy_stage: "any", severity: "Yellow", related_symptoms: ["dizziness"], related_conditions: ["anemia"], language: "bn", chunk_text: "হিমোগ্লোবিন ১০-এর কম হলে স্বাস্থ্যকর্মীর মূল্যায়ন, পুষ্টি পরামর্শ এবং ফলোআপ প্রয়োজন।" },
  { id: "g7", source: "Obstetric triage protocol", title: "Severe abdominal pain", category: "pain", pregnancy_stage: "any", severity: "Orange", related_symptoms: ["severe abdominal pain", "abdominal pain"], related_conditions: ["obstetric emergency"], language: "en", chunk_text: "Severe abdominal pain in pregnancy requires urgent clinical evaluation; escalate immediately when pain is severe or persistent." },
  { id: "g8", source: "Obstetric triage protocol", title: "Fever and pain", category: "infection", pregnancy_stage: "any", severity: "Orange", related_symptoms: ["fever", "abdominal pain"], related_conditions: ["infection"], language: "en", chunk_text: "Fever combined with abdominal pain should receive same-day urgent assessment for possible infection or obstetric complication." },
  { id: "g9", source: "Birth preparedness handbook", title: "Emergency transport", category: "referral", pregnancy_stage: "third trimester", severity: "Red", related_symptoms: ["bleeding", "headache", "swelling"], related_conditions: ["emergency referral"], language: "en", chunk_text: "Activate transport, alert the receiving facility, and ensure a trained worker reviews all high-risk referrals." },
  { id: "g10", source: "Community antenatal guide", title: "Routine monitoring", category: "routine", pregnancy_stage: "any", severity: "Green", related_symptoms: ["fatigue"], related_conditions: ["routine care"], language: "bn", chunk_text: "বিপদের লক্ষণ না থাকলে নির্ধারিত প্রসবপূর্ব পরীক্ষা চালিয়ে যান এবং নতুন লক্ষণ জানাবেন।" }
];

export const patients = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Ayesha Begum", age: 25, pregnancy_week: 34, village: "Charpara", preferred_language: "bn", assigned_worker: "Nusrat CHW", severity: "Red", score: 94 },
  { id: "22222222-2222-4222-8222-222222222222", name: "Mariam Khatun", age: 30, pregnancy_week: 28, village: "Sonapur", preferred_language: "en", assigned_worker: "Nusrat CHW", severity: "Yellow", score: 55 },
  { id: "33333333-3333-4333-8333-333333333333", name: "Rokeya Akter", age: 21, pregnancy_week: 19, village: "Lakshmipur", preferred_language: "bn", assigned_worker: "Rahim CHW", severity: "Green", score: 12 },
  { id: "44444444-4444-4444-8444-444444444444", name: "Shila Rani", age: 32, pregnancy_week: 37, village: "Dakkhinpara", preferred_language: "en", assigned_worker: "Rahim CHW", severity: "Orange", score: 75 },
  { id: "55555555-5555-4555-8555-555555555555", name: "Fatema Noor", age: 27, pregnancy_week: 31, village: "Boro Bari", preferred_language: "bn", assigned_worker: "Nusrat CHW", severity: "Green", score: 25 }
];

export const alerts = [
  { id: "a1", patient_name: "Ayesha Begum", severity: "Red", message: "Possible preeclampsia danger signs: referral review required.", status: "Open", requires_human_review: true },
  { id: "a2", patient_name: "Mariam Khatun", severity: "Yellow", message: "Anemia follow-up recommended.", status: "Acknowledged", requires_human_review: false },
  { id: "a3", patient_name: "Shila Rani", severity: "Orange", message: "Urgent fever and pain evaluation.", status: "Open", requires_human_review: true },
  { id: "a4", patient_name: "Fatema Noor", severity: "Green", message: "Routine ANC follow-up.", status: "Closed", requires_human_review: false },
  { id: "a5", patient_name: "Rokeya Akter", severity: "Green", message: "No danger signs detected.", status: "Closed", requires_human_review: false }
];

export const auditLogs = [
  { id: "l1", event_type: "risk_analysis", actor_role: "health_worker", summary: "Red alert generated for elevated BP and headache.", risk_score: 94, graph_path: ["Headache", "Hypertension", "Preeclampsia", "Emergency Referral"] },
  { id: "l2", event_type: "assistant_query", actor_role: "mother", summary: "Retrieved anemia guidance.", risk_score: 55, graph_path: ["Low Hemoglobin", "Anemia", "Nutrition Counseling"] },
  { id: "l3", event_type: "ocr_extract", actor_role: "health_worker", summary: "Structured fields extracted from antenatal card placeholder." },
  { id: "l4", event_type: "offline_sync", actor_role: "health_worker", summary: "Offline symptom event synced." },
  { id: "l5", event_type: "alert_review", actor_role: "doctor_admin", summary: "Orange alert awaiting same-day evaluation.", risk_score: 75 }
];
