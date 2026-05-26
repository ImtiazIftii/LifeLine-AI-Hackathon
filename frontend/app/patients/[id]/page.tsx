"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Disclaimer, PageHeading, SeverityBadge } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayValue, text, translateWords } from "@/lib/i18n";

type Patient = { name: string; age: number; village: string; pregnancy_week: number; preferred_language: string; vitals?: { systolic: number; diastolic: number; hemoglobin: number }; symptoms?: string[]; risk?: { severity: string; score: number } };

export default function PatientDetailPage() {
  const { language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  useEffect(() => { api<Patient>(`/api/patients/${id}`).then(setPatient).catch(() => undefined); }, [id]);
  if (!patient) return <p className="card">{text(language, "Loading patient record...", "রোগীর নথি লোড হচ্ছে...")}</p>;
  return (
    <div>
      <PageHeading title={displayValue(language, patient.name)} subtitle={text(language, `${patient.village} | ${patient.pregnancy_week} weeks pregnant | preferred language: ${patient.preferred_language}`, `${displayValue(language, patient.village)} | গর্ভাবস্থার ${patient.pregnancy_week} সপ্তাহ | পছন্দের ভাষা: ${displayValue(language, patient.preferred_language)}`)} />
      <div className="grid gap-5 md:grid-cols-3">
        <section className="card"><p className="text-sm text-slate-500">{text(language, "Latest risk", "সর্বশেষ ঝুঁকি")}</p><div className="mt-3 flex items-center gap-3"><SeverityBadge level={patient.risk?.severity || "Green"} /><strong>{patient.risk?.score ?? displayValue(language, "Pending")}</strong></div></section>
        <section className="card"><p className="text-sm text-slate-500">{text(language, "Latest blood pressure", "সর্বশেষ রক্তচাপ")}</p><p className="mt-3 text-2xl font-bold">{patient.vitals ? `${patient.vitals.systolic}/${patient.vitals.diastolic}` : text(language, "Not recorded", "নথিভুক্ত হয়নি")}</p></section>
        <section className="card"><p className="text-sm text-slate-500">{text(language, "Hemoglobin", "হিমোগ্লোবিন")}</p><p className="mt-3 text-2xl font-bold">{patient.vitals?.hemoglobin || text(language, "Not recorded", "নথিভুক্ত হয়নি")} <small className="text-sm">{text(language, "g/dL", "গ্রাম/ডেসিলিটার")}</small></p></section>
      </div>
      <section className="card mt-5"><h2 className="mb-3 text-lg font-bold">{text(language, "Symptoms and care record", "লক্ষণ ও সেবা নথি")}</h2><p className="text-slate-600">{patient.symptoms ? translateWords(language, patient.symptoms).join(", ") : text(language, "New intake awaiting full recorded symptoms.", "নতুন তথ্য গ্রহণে পূর্ণ লক্ষণ নথিভুক্ত হওয়ার অপেক্ষা চলছে।")}</p></section>
      <div className="mt-5"><Disclaimer /></div>
    </div>
  );
}
