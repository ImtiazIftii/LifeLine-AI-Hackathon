"use client";

import Link from "next/link";
import { Disclaimer } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayValue, text } from "@/lib/i18n";

const features = [
  ["Rules + Contextual RAG", "নিয়ম + প্রাসঙ্গিক RAG", "Deterministic emergency flags backed by metadata-enriched, cited guideline retrieval.", "মেটাডেটাসমৃদ্ধ ও উদ্ধৃত নির্দেশনা অনুসন্ধানের ভিত্তিতে নির্ধারিত জরুরি সতর্কতা।"],
  ["Graph Explanation", "গ্রাফ ব্যাখ্যা", "Symptom-to-risk-to-action pathways make each recommendation reviewable.", "লক্ষণ থেকে ঝুঁকি ও করণীয় পর্যন্ত পথ প্রতিটি পরামর্শ পর্যালোচনাযোগ্য করে।"],
  ["Offline First", "অফলাইন-প্রথম", "Cached rules, sync queue, and SMS fallback mock for low-connectivity communities.", "দুর্বল সংযোগের এলাকায় সংরক্ষিত নিয়ম, সমন্বয় সারি এবং এসএমএস বিকল্প নমুনা।"],
  ["Human Review", "মানবিক পর্যালোচনা", "Red and Orange alerts surface immediately to health workers for escalation.", "লাল ও কমলা সতর্কতা দ্রুত ব্যবস্থা নেওয়ার জন্য স্বাস্থ্যকর্মীদের কাছে তাৎক্ষণিকভাবে পৌঁছায়।"]
];

export default function LandingPage() {
  const { language } = useLanguage();
  return (
    <div>
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.08fr_.92fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-clinic-100 px-4 py-2 text-sm font-semibold text-clinic-700">{text(language, "Open-source, local-first hackathon MVP", "ওপেন-সোর্স, স্থানীয়-প্রথম হ্যাকাথন এমভিপি")}</p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-clinic-900">
            {text(language, "Earlier maternal emergency signals for rural care teams.", "গ্রামীণ সেবাদলকে মাতৃস্বাস্থ্যের জরুরি সংকেত আরও আগে জানানো।")}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            {text(language, "LifeLine AI turns symptoms, vitals, and records into transparent decision-support alerts, cited guidance, and referral pathways.", "LifeLine AI লক্ষণ, ভাইটাল ও নথিকে স্বচ্ছ সিদ্ধান্ত-সহায়ক সতর্কতা, উদ্ধৃত নির্দেশনা এবং রেফারেল পথে রূপান্তর করে।")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/intake" className="btn-primary">{text(language, "Start patient intake", "রোগীর তথ্য নেওয়া শুরু করুন")}</Link>
            <Link href="/dashboard" className="btn-secondary">{text(language, "Open worker dashboard", "স্বাস্থ্যকর্মী ড্যাশবোর্ড খুলুন")}</Link>
          </div>
        </div>
        <div className="card relative overflow-hidden border-clinic-100 p-6">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-clinic-50" />
          <p className="relative text-sm font-semibold text-slate-500">{text(language, "LIVE TRIAGE EXAMPLE", "সরাসরি ট্রায়াজ উদাহরণ")}</p>
          <div className="relative mt-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
            <div>
              <p className="font-semibold">{displayValue(language, "Ayesha Begum")}</p>
              <p className="text-sm text-slate-600">{text(language, "BP 150/96 | headache + swelling", "রক্তচাপ ১৫০/৯৬ | মাথাব্যথা + ফোলা")}</p>
            </div>
            <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">{text(language, "RED", "লাল")}</span>
          </div>
          <div className="relative mt-5 space-y-3 text-sm">
            <p className="rounded-lg bg-clinic-50 p-3">{text(language, "Headache -> Hypertension -> Preeclampsia -> Emergency Referral", "মাথাব্যথা -> উচ্চ রক্তচাপ -> প্রি-এক্ল্যাম্পসিয়ার ঝুঁকি -> জরুরি রেফারেল")}</p>
            <p className="rounded-lg border border-slate-100 p-3"><strong>{text(language, "Cited guidance:", "উদ্ধৃত নির্দেশনা:")}</strong> {displayValue(language, "Maternal hypertension field guide")}</p>
            <p className="rounded-lg bg-amber-50 p-3 text-amber-900"><strong>{text(language, "Action:", "করণীয়:")}</strong> {text(language, "human review required immediately", "অবিলম্বে মানবিক পর্যালোচনা প্রয়োজন")}</p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([englishTitle, banglaTitle, englishCopy, banglaCopy]) => (
          <div className="card" key={englishTitle}>
            <h2 className="font-bold text-clinic-900">{text(language, englishTitle, banglaTitle)}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text(language, englishCopy, banglaCopy)}</p>
          </div>
        ))}
      </section>
      <Disclaimer />
    </div>
  );
}
