export type Language = "en" | "bn";

export function text(language: Language, english: string, bangla: string) {
  return language === "bn" ? bangla : english;
}

const banglaValues: Record<string, string> = {
  Green: "সবুজ",
  Yellow: "হলুদ",
  Orange: "কমলা",
  Red: "লাল",
  Open: "খোলা",
  Acknowledged: "স্বীকৃত",
  Closed: "বন্ধ",
  Pending: "অপেক্ষমাণ",
  en: "ইংরেজি",
  bn: "বাংলা",
  mother: "মা",
  health_worker: "স্বাস্থ্যকর্মী",
  doctor_admin: "ডাক্তার/প্রশাসক",
  "Ayesha Begum": "আয়েশা বেগম",
  "Mariam Khatun": "মারিয়াম খাতুন",
  "Rokeya Akter": "রোকেয়া আক্তার",
  "Shila Rani": "শীলা রানী",
  "Fatema Noor": "ফাতেমা নূর",
  Charpara: "চরপাড়া",
  Sonapur: "সোনাপুর",
  Lakshmipur: "লক্ষ্মীপুর",
  Dakkhinpara: "দক্ষিণপাড়া",
  "Boro Bari": "বড় বাড়ি",
  headache: "মাথাব্যথা",
  swelling: "ফোলা",
  bleeding: "রক্তপাত",
  dizziness: "মাথা ঘোরা",
  fever: "জ্বর",
  "abdominal pain": "পেটে ব্যথা",
  "severe abdominal pain": "তীব্র পেটে ব্যথা",
  blood_pressure: "রক্তচাপ",
  hemoglobin: "হিমোগ্লোবিন",
  pregnancy_week: "গর্ভকালীন সপ্তাহ",
  symptoms: "লক্ষণ",
  medication: "ওষুধ",
  "iron supplement": "আয়রন সাপ্লিমেন্ট",
  Headache: "মাথাব্যথা",
  Hypertension: "উচ্চ রক্তচাপ",
  Preeclampsia: "প্রি-এক্ল্যাম্পসিয়ার ঝুঁকি",
  "Emergency Referral": "জরুরি রেফারেল",
  Swelling: "ফোলা",
  Bleeding: "রক্তপাত",
  "Hemorrhage Risk": "অতিরিক্ত রক্তক্ষরণের ঝুঁকি",
  "Low Hemoglobin": "কম হিমোগ্লোবিন",
  Anemia: "রক্তস্বল্পতা",
  "Nutrition Counseling": "পুষ্টি পরামর্শ",
  "Severe Abdominal Pain": "তীব্র পেটে ব্যথা",
  "Reported Symptoms": "জানানো লক্ষণ",
  "Routine Antenatal Monitoring": "নিয়মিত প্রসবপূর্ব পর্যবেক্ষণ",
  "Neo4j seeded graph": "Neo4j-এ সংরক্ষিত গ্রাফ",
  "Local seeded graph fallback": "স্থানীয় সংরক্ষিত গ্রাফ বিকল্প",
  "Possible preeclampsia danger signs: referral review required.": "প্রি-এক্ল্যাম্পসিয়ার সম্ভাব্য বিপদসংকেত: রেফারেল পর্যালোচনা প্রয়োজন।",
  "Anemia follow-up recommended.": "রক্তস্বল্পতার জন্য ফলোআপের পরামর্শ দেওয়া হয়েছে।",
  "Urgent fever and pain evaluation.": "জ্বর ও ব্যথার জরুরি মূল্যায়ন প্রয়োজন।",
  "Routine ANC follow-up.": "নিয়মিত প্রসবপূর্ব ফলোআপ।",
  "No danger signs detected.": "কোনো বিপদসংকেত শনাক্ত হয়নি।",
  "Bleeding is an emergency maternal danger sign.": "রক্তপাত মাতৃস্বাস্থ্যের জরুরি বিপদসংকেত।",
  "Elevated blood pressure with headache or swelling indicates possible preeclampsia danger signs.": "উচ্চ রক্তচাপের সঙ্গে মাথাব্যথা বা ফোলা থাকলে প্রি-এক্ল্যাম্পসিয়ার সম্ভাব্য বিপদসংকেত হতে পারে।",
  "Elevated blood pressure requires urgent assessment.": "উচ্চ রক্তচাপের জন্য জরুরি মূল্যায়ন প্রয়োজন।",
  "Severe abdominal pain is an urgent pregnancy danger sign.": "গর্ভাবস্থায় তীব্র পেটে ব্যথা একটি জরুরি বিপদসংকেত।",
  "Fever combined with abdominal pain requires urgent evaluation.": "জ্বরের সঙ্গে পেটে ব্যথা থাকলে জরুরি মূল্যায়ন প্রয়োজন।",
  "Low hemoglobin indicates anemia warning signs.": "কম হিমোগ্লোবিন রক্তস্বল্পতার সতর্কসংকেত নির্দেশ করে।",
  "Fever in pregnancy should be evaluated.": "গর্ভাবস্থায় জ্বর হলে মূল্যায়ন করা প্রয়োজন।",
  "No configured emergency danger rule triggered by submitted information.": "দেওয়া তথ্য অনুযায়ী কোনো নির্ধারিত জরুরি বিপদ নিয়ম সক্রিয় হয়নি।",
  "Arrange immediate emergency referral and human review.": "অবিলম্বে জরুরি রেফারেল এবং মানবিক পর্যালোচনার ব্যবস্থা করুন।",
  "Urgent facility referral; a qualified provider must review immediately.": "দ্রুত স্বাস্থ্যকেন্দ্রে রেফার করুন; যোগ্য সেবাদানকারীকে অবিলম্বে পর্যালোচনা করতে হবে।",
  "Same-day blood pressure reassessment and clinical evaluation.": "একই দিনে রক্তচাপ পুনর্মূল্যায়ন ও ক্লিনিক্যাল মূল্যায়ন করুন।",
  "Urgent referral for assessment.": "মূল্যায়নের জন্য জরুরি রেফারেল করুন।",
  "Seek same-day clinical assessment.": "একই দিনে ক্লিনিক্যাল মূল্যায়ন নিন।",
  "Clinical review, nutrition counseling, and follow-up hemoglobin check.": "ক্লিনিক্যাল পর্যালোচনা, পুষ্টি পরামর্শ এবং হিমোগ্লোবিন ফলোআপ পরীক্ষা করুন।",
  "Continue antenatal follow-up and report new danger signs promptly.": "প্রসবপূর্ব ফলোআপ চালিয়ে যান এবং নতুন বিপদসংকেত দ্রুত জানান।",
  "Headache alongside high blood pressure can increase concern for preeclampsia and requires referral review.": "উচ্চ রক্তচাপের সঙ্গে মাথাব্যথা প্রি-এক্ল্যাম্পসিয়ার উদ্বেগ বাড়াতে পারে এবং রেফারেল পর্যালোচনা প্রয়োজন।",
  "Swelling may contribute to a preeclampsia danger-sign pathway requiring urgent review.": "ফোলা প্রি-এক্ল্যাম্পসিয়ার বিপদসংকেতের পথে থাকতে পারে এবং জরুরি পর্যালোচনা প্রয়োজন।",
  "Bleeding maps to hemorrhage risk and immediate emergency referral.": "রক্তপাত অতিরিক্ত রক্তক্ষরণের ঝুঁকির সঙ্গে যুক্ত এবং অবিলম্বে জরুরি রেফারেল প্রয়োজন।",
  "Low hemoglobin or dizziness maps to anemia follow-up and nutrition counseling.": "কম হিমোগ্লোবিন বা মাথা ঘোরা রক্তস্বল্পতার ফলোআপ ও পুষ্টি পরামর্শের সঙ্গে যুক্ত।",
  "Severe abdominal pain requires urgent clinical assessment.": "তীব্র পেটে ব্যথার জন্য জরুরি ক্লিনিক্যাল মূল্যায়ন প্রয়োজন।",
  "No emergency graph pathway was matched; monitor and escalate new danger signs.": "কোনো জরুরি গ্রাফ পথ মেলেনি; পর্যবেক্ষণ করুন এবং নতুন বিপদসংকেত হলে দ্রুত ব্যবস্থা নিন।",
  "Vaginal bleeding danger sign": "যোনিপথে রক্তপাতের বিপদসংকেত",
  "Bleeding warning": "রক্তপাতের সতর্কতা",
  "Preeclampsia warning": "উচ্চ রক্তচাপ সতর্কতা",
  "Preeclampsia danger signs": "প্রি-এক্ল্যাম্পসিয়ার বিপদসংকেত",
  "Anemia screening": "রক্তস্বল্পতা পরীক্ষা",
  "Anemia support": "রক্তস্বল্পতা সহায়তা",
  "Severe abdominal pain": "তীব্র পেটে ব্যথা",
  "Fever and pain": "জ্বর ও ব্যথা",
  "Emergency transport": "জরুরি পরিবহন",
  "Routine monitoring": "নিয়মিত পর্যবেক্ষণ",
  "Maternal hypertension field guide": "মাতৃ উচ্চ রক্তচাপ নির্দেশিকা",
  "WHO maternal health (demo excerpt)": "বিশ্ব স্বাস্থ্য সংস্থার মাতৃস্বাস্থ্য নির্দেশিকা (ডেমো অংশ)",
  "Antenatal nutrition guide": "প্রসবপূর্ব পুষ্টি নির্দেশিকা",
  "Obstetric triage protocol": "প্রসূতি ট্রায়াজ প্রটোকল",
  "Birth preparedness handbook": "প্রসব প্রস্তুতি হ্যান্ডবুক",
  "Community antenatal guide": "কমিউনিটি প্রসবপূর্ব নির্দেশিকা",
  risk_analysis: "ঝুঁকি বিশ্লেষণ",
  assistant_query: "সহায়কের প্রশ্ন",
  ocr_extract: "ওসিআর তথ্য উত্তোলন",
  offline_sync: "অফলাইন সমন্বয়",
  alert_review: "সতর্কতা পর্যালোচনা",
  "Red alert generated for elevated BP and headache.": "উচ্চ রক্তচাপ ও মাথাব্যথার জন্য লাল সতর্কতা তৈরি হয়েছে।",
  "Retrieved anemia guidance.": "রক্তস্বল্পতা বিষয়ক নির্দেশনা পাওয়া গেছে।",
  "Structured fields extracted from antenatal card placeholder.": "প্রসবপূর্ব কার্ডের নমুনা থেকে গঠিত তথ্য নেওয়া হয়েছে।",
  "Offline symptom event synced.": "অফলাইনে নথিবদ্ধ লক্ষণ সমন্বয় করা হয়েছে।",
  "Orange alert awaiting same-day evaluation.": "কমলা সতর্কতা একই দিনের মূল্যায়নের অপেক্ষায় আছে।",
  "Risk analysis": "ঝুঁকি বিশ্লেষণ",
  "document ingestion": "নথি গ্রহণ",
  "semantic chunking": "অর্থভিত্তিক খণ্ডায়ন",
  "metadata tagging": "মেটাডেটা ট্যাগিং",
  "hybrid retrieval": "সমন্বিত তথ্য অনুসন্ধান",
  "graph explanation": "গ্রাফ ব্যাখ্যা",
  "audit logging": "অডিট নথিভুক্তকরণ",
  "retrieval-template response": "উদ্ধারকৃত তথ্যভিত্তিক উত্তর",
  "retrieval-template fallback": "উদ্ধারকৃত তথ্যভিত্তিক বিকল্প উত্তর",
  "WHO maternal health public guidance (demo-derived summary)": "বিশ্ব স্বাস্থ্য সংস্থার মাতৃস্বাস্থ্য জননির্দেশিকা (ডেমো সারাংশ)",
  "Local maternal hypertension field guide placeholder": "স্থানীয় মাতৃ উচ্চ রক্তচাপ নির্দেশিকার নমুনা",
  "Community antenatal workflow demonstration": "কমিউনিটি প্রসবপূর্ব কার্যপ্রবাহ প্রদর্শনী",
  "Demo guideline text must be clinically validated before real-world use.": "বাস্তবে ব্যবহারের আগে ডেমো নির্দেশিকার লেখা ক্লিনিক্যালভাবে যাচাই করতে হবে।",
  "Vector similarity is a deterministic placeholder in the MVP.": "এই এমভিপিতে ভেক্টর মিল নির্ণয় একটি নির্ধারিত নমুনা ব্যবস্থা।",
  "Vaginal bleeding during pregnancy is a danger sign requiring rapid assessment and referral according to local emergency protocol.": "গর্ভাবস্থায় যোনিপথে রক্তপাত একটি বিপদসংকেত; স্থানীয় জরুরি প্রটোকল অনুযায়ী দ্রুত মূল্যায়ন ও রেফারেল প্রয়োজন।",
  "Bleeding during pregnancy is a danger sign. Refer rapidly to a health facility.": "গর্ভাবস্থায় রক্তপাত বিপদের লক্ষণ। দ্রুত স্বাস্থ্যকেন্দ্রে রেফার করুন।",
  "Blood pressure at or above 140/90 with severe headache or swelling needs urgent assessment for preeclampsia and referral.": "রক্তচাপ ১৪০/৯০ বা তার বেশি এবং তীব্র মাথাব্যথা বা ফোলা থাকলে প্রি-এক্ল্যাম্পসিয়ার জন্য জরুরি মূল্যায়ন ও রেফারেল প্রয়োজন।",
  "Blood pressure at or above 140/90 with headache or swelling needs urgent examination and referral.": "রক্তচাপ ১৪০/৯০ বা তার বেশি এবং মাথাব্যথা বা ফোলা থাকলে জরুরি পরীক্ষা ও রেফারেল প্রয়োজন।",
  "Hemoglobin below 10 g/dL warrants clinical review, nutrition counseling, iron adherence check, and follow-up testing.": "হিমোগ্লোবিন ১০ গ্রাম/ডেসিলিটারের কম হলে ক্লিনিক্যাল পর্যালোচনা, পুষ্টি পরামর্শ, আয়রন গ্রহণ যাচাই এবং ফলোআপ পরীক্ষা প্রয়োজন।",
  "Hemoglobin below 10 requires health worker assessment, nutrition counseling, and follow-up.": "হিমোগ্লোবিন ১০-এর কম হলে স্বাস্থ্যকর্মীর মূল্যায়ন, পুষ্টি পরামর্শ এবং ফলোআপ প্রয়োজন।",
  "Severe abdominal pain in pregnancy requires urgent clinical evaluation; escalate immediately when pain is severe or persistent.": "গর্ভাবস্থায় তীব্র পেটে ব্যথার জন্য জরুরি ক্লিনিক্যাল মূল্যায়ন প্রয়োজন; ব্যথা তীব্র বা স্থায়ী হলে অবিলম্বে ব্যবস্থা নিন।",
  "Fever combined with abdominal pain should receive same-day urgent assessment for possible infection or obstetric complication.": "জ্বরের সঙ্গে পেটে ব্যথা থাকলে সম্ভাব্য সংক্রমণ বা প্রসূতি জটিলতার জন্য একই দিনে জরুরি মূল্যায়ন প্রয়োজন।",
  "Activate transport, alert the receiving facility, and ensure a trained worker reviews all high-risk referrals.": "পরিবহন সক্রিয় করুন, গ্রহণকারী স্বাস্থ্যকেন্দ্রকে জানান এবং সব উচ্চ-ঝুঁকির রেফারেল প্রশিক্ষিত কর্মী দিয়ে পর্যালোচনা নিশ্চিত করুন।",
  "When no danger signs are present, continue scheduled antenatal checks and report new symptoms.": "বিপদের লক্ষণ না থাকলে নির্ধারিত প্রসবপূর্ব পরীক্ষা চালিয়ে যান এবং নতুন লক্ষণ জানাবেন।",
  "Assistant returned cited guidance.": "সহায়ক উদ্ধৃত নির্দেশনা দিয়েছে।",
  "OCR placeholder extracted structured antenatal fields.": "ওসিআর নমুনা প্রসবপূর্ব গঠিত তথ্য উত্তোলন করেছে।",
  "Red maternal risk decision-support result generated.": "মাতৃ ঝুঁকির জন্য লাল সিদ্ধান্ত-সহায়ক ফলাফল তৈরি হয়েছে।",
  "Orange maternal risk decision-support result generated.": "মাতৃ ঝুঁকির জন্য কমলা সিদ্ধান্ত-সহায়ক ফলাফল তৈরি হয়েছে।",
  "Yellow maternal risk decision-support result generated.": "মাতৃ ঝুঁকির জন্য হলুদ সিদ্ধান্ত-সহায়ক ফলাফল তৈরি হয়েছে।",
  "Green maternal risk decision-support result generated.": "মাতৃ ঝুঁকির জন্য সবুজ সিদ্ধান্ত-সহায়ক ফলাফল তৈরি হয়েছে।",
  "Verify OCR fields against the source record before care decisions.": "সেবা সিদ্ধান্তের আগে উৎস নথির সঙ্গে ওসিআর তথ্য যাচাই করুন।",
  "Decision-support only; clinical review required.": "কেবল সিদ্ধান্তে সহায়তার জন্য; ক্লিনিক্যাল পর্যালোচনা প্রয়োজন।",
  "Patient not found.": "রোগী পাওয়া যায়নি।",
  "Upload an image or PDF record.": "একটি ছবি বা পিডিএফ নথি আপলোড করুন।",
  "Invalid login credentials.": "প্রবেশের তথ্য সঠিক নয়।",
  "Request failed": "অনুরোধ সম্পন্ন হয়নি।"
};

export function displayValue(language: Language, value: string) {
  return language === "bn" ? banglaValues[value] || value : englishValues[value] || value;
}

export function displayContent(language: Language, value: string) {
  const dictionary =
    language === "bn"
      ? { ...banglaValues, [disclaimers.en]: disclaimers.bn }
      : { ...englishValues, [disclaimers.bn]: disclaimers.en };
  return Object.entries(dictionary)
    .sort(([first], [second]) => second.length - first.length)
    .reduce((translated, [source, translatedValue]) => translated.replaceAll(source, translatedValue), value);
}

export function translateWords(language: Language, values: string[]) {
  return values.map((value) => displayValue(language, value));
}

export const disclaimers = {
  en: "This is decision-support guidance, not a medical diagnosis. For emergency symptoms, contact a qualified healthcare provider immediately.",
  bn: "এটি সিদ্ধান্তে সহায়তার তথ্য, রোগ নির্ণয় নয়। জরুরি লক্ষণ থাকলে অবিলম্বে যোগ্য স্বাস্থ্যসেবা প্রদানকারীর সঙ্গে যোগাযোগ করুন।"
};

const englishValues: Record<string, string> = Object.fromEntries(
  Object.entries(banglaValues).map(([english, bangla]) => [bangla, english])
);
