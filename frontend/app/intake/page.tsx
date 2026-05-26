"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Disclaimer, PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text } from "@/lib/i18n";

const symptomOptions = ["bleeding", "headache", "swelling", "dizziness", "fever", "abdominal pain", "severe abdominal pain"];

export default function IntakePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const symptoms = symptomOptions.filter((symptom) => form.get(symptom));
    try {
      const patient = await api<{ id: string }>("/api/patients", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"), age: form.get("age"), pregnancy_week: form.get("pregnancy_week"),
          village: form.get("village"), phone: form.get("phone"), preferred_language: language
        })
      }, "mother");
      const result = await api("/api/risk/analyze", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patient.id,
          patient_name: form.get("name"),
          language,
          symptoms,
          vitals: { systolic: form.get("systolic"), diastolic: form.get("diastolic"), hemoglobin: form.get("hemoglobin"), temperature: form.get("temperature") }
        })
      }, "mother");
      localStorage.setItem("latest-risk-result", JSON.stringify(result));
      router.push("/risk-result");
    } catch (requestError) {
      setError((requestError as Error).message);
      setLoading(false);
    }
  }
  return (
    <div>
      <PageHeading title={text(language, "Maternal patient intake", "মাতৃ স্বাস্থ্য তথ্য গ্রহণ")} subtitle={text(language, "Record symptoms and vitals. Emergency signals are surfaced to a health worker for review.", "লক্ষণ ও ভাইটাল লিখুন। জরুরি সতর্কতা পর্যালোচনার জন্য স্বাস্থ্যকর্মীর কাছে যাবে।")} />
      <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Public demo:</strong> Use fictional information only. Do not enter real patient names, contacts, or medical records.</p>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <section className="card space-y-4">
          <h2 className="text-lg font-bold">{text(language, "Patient information", "রোগীর তথ্য")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label>{text(language, "Full name", "পূর্ণ নাম")}</label><input key={`name-${language}`} name="name" defaultValue={text(language, "Ayesha Demo", "আয়েশা ডেমো")} required /></div>
            <div><label>{text(language, "Age", "বয়স")}</label><input name="age" type="number" defaultValue="25" required /></div>
            <div><label>{text(language, "Pregnancy week", "গর্ভকালীন সপ্তাহ")}</label><input name="pregnancy_week" type="number" defaultValue="34" required /></div>
            <div><label>{text(language, "Village", "গ্রাম")}</label><input key={`village-${language}`} name="village" defaultValue={text(language, "Charpara", "চরপাড়া")} required /></div>
            <div className="sm:col-span-2"><label>{text(language, "Phone (optional)", "ফোন (ঐচ্ছিক)")}</label><input name="phone" placeholder="০১৭..." /></div>
          </div>
          <h2 className="pt-3 text-lg font-bold">{text(language, "Symptoms reported", "জানানো লক্ষণ")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {symptomOptions.map((symptom) => (
              <label key={symptom} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 capitalize">
                <input className="h-4 w-4" type="checkbox" name={symptom} defaultChecked={symptom === "headache" || symptom === "swelling"} />
                {displayValue(language, symptom)}
              </label>
            ))}
          </div>
        </section>
        <section className="card h-fit space-y-4">
          <h2 className="text-lg font-bold">{text(language, "Vitals", "ভাইটাল লক্ষণ")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label>{text(language, "Systolic BP", "সিস্টোলিক রক্তচাপ")}</label><input name="systolic" type="number" defaultValue="150" required /></div>
            <div><label>{text(language, "Diastolic BP", "ডায়াস্টোলিক রক্তচাপ")}</label><input name="diastolic" type="number" defaultValue="96" required /></div>
            <div><label>{text(language, "Hemoglobin (g/dL)", "হিমোগ্লোবিন (গ্রাম/ডেসিলিটার)")}</label><input name="hemoglobin" type="number" step="0.1" defaultValue="10.8" /></div>
            <div><label>{text(language, "Temperature (C)", "তাপমাত্রা (সেলসিয়াস)")}</label><input name="temperature" type="number" step="0.1" defaultValue="37.0" /></div>
          </div>
          <Disclaimer />
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{displayContent(language, error)}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? text(language, "Analyzing...", "বিশ্লেষণ হচ্ছে...") : text(language, "Analyze risk and notify care team", "ঝুঁকি বিশ্লেষণ করে সেবাদলকে জানান")}</button>
        </section>
      </form>
    </div>
  );
}
