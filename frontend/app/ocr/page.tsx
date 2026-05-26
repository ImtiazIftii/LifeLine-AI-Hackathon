"use client";

import { FormEvent, useState } from "react";
import { API_URL, apiAuthHeaders } from "@/lib/api";
import { PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text } from "@/lib/i18n";

type Extraction = { filename: string; engine: string; verification_required: boolean; extracted_fields: Record<string, string | number | string[]> };

export default function OcrPage() {
  const { language } = useLanguage();
  const [result, setResult] = useState<Extraction | null>(null);
  const [error, setError] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${API_URL}/api/ocr/extract`, { method: "POST", headers: apiAuthHeaders("health_worker"), body: form });
    const body = await response.json();
    if (!response.ok) return setError(body.error);
    setResult(body);
    setError("");
  }
  return (
    <div className="max-w-4xl">
      <PageHeading title={text(language, "OCR record ingestion", "ওসিআর নথি গ্রহণ")} subtitle={text(language, "Digitize antenatal cards in the demo pipeline; all extracted values require health worker verification.", "ডেমো প্রক্রিয়ায় প্রসবপূর্ব কার্ড ডিজিটাল করুন; উত্তোলিত সব মান স্বাস্থ্যকর্মীর যাচাই প্রয়োজন।")} />
      <form className="card" onSubmit={upload}>
        <label>{text(language, "Upload antenatal card image or PDF", "প্রসবপূর্ব কার্ডের ছবি অথবা পিডিএফ আপলোড করুন")}</label>
        <input className="mt-2" type="file" name="file" accept="image/*,.pdf" required />
        <p className="mt-3 text-sm text-slate-500">{text(language, "MVP engine: Tesseract/EasyOCR integration placeholder returning representative structured fields.", "এমভিপি ইঞ্জিন: Tesseract/EasyOCR সংযোগের নমুনা, যা উদাহরণস্বরূপ গঠিত তথ্য ফেরত দেয়।")}</p>
        <button className="btn-primary mt-5">{text(language, "Extract fields", "তথ্য উত্তোলন করুন")}</button>
        {error && <p className="mt-3 text-red-600">{displayContent(language, error)}</p>}
      </form>
      {result && (
        <section className="card mt-5">
          <div className="flex justify-between"><h2 className="text-lg font-bold">{text(language, "Extracted record:", "উত্তোলিত নথি:")} {result.filename}</h2><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{text(language, "VERIFY REQUIRED", "যাচাই প্রয়োজন")}</span></div>
          <p className="mt-2 text-sm text-slate-500">{text(language, "Engine:", "ইঞ্জিন:")} {text(language, result.engine, "Tesseract/EasyOCR নমুনা")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(result.extracted_fields).map(([key, value]) => <p className="rounded-lg bg-slate-50 p-3 text-sm" key={key}><strong className="capitalize">{displayValue(language, key)}:</strong> {Array.isArray(value) ? value.map((item) => displayValue(language, item)).join(", ") : value}</p>)}
          </div>
        </section>
      )}
    </div>
  );
}
