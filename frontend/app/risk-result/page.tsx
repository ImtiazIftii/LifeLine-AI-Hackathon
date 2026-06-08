"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Disclaimer, GraphPath, PageHeading, SeverityBadge } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text } from "@/lib/i18n";

type Result = {
  risk: { score: number; severity: string; reasons: string[]; recommendations: string[]; requires_human_review: boolean };
  retrieval: { chunks: { title: string; source: string; chunk_text?: string; text?: string; language: string }[] };
  graph: { path: string[]; explanation: string; source: string };
  alert_created: boolean;
};

function guidanceText(chunk: Result["retrieval"]["chunks"][number]) {
  return chunk.chunk_text || chunk.text || "Guidance text was not included in this response.";
}

export default function RiskResultPage() {
  const { language } = useLanguage();
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem("latest-risk-result");
    if (!stored) return;
    try {
      setResult(JSON.parse(stored));
    } catch {
      localStorage.removeItem("latest-risk-result");
    }
  }, []);
  if (!result) return <div className="card"><p>{text(language, "No new risk result is stored on this device.", "এই ডিভাইসে নতুন কোনো ঝুঁকি ফলাফল সংরক্ষিত নেই।")}</p><Link className="btn-primary mt-4" href="/intake">{text(language, "Run an intake", "নতুন তথ্য গ্রহণ করুন")}</Link></div>;
  return (
    <div>
      <PageHeading title={text(language, "Maternal risk result", "মাতৃ ঝুঁকির ফলাফল")} subtitle={text(language, "Transparent rule outcome with retrieved context and graph-based pathway explanation.", "উদ্ধারকৃত প্রাসঙ্গিক তথ্য এবং গ্রাফভিত্তিক পথের ব্যাখ্যাসহ স্বচ্ছ নিয়মভিত্তিক ফলাফল।")} />
      <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <section className="card">
          <div className="flex items-start justify-between">
            <div><p className="text-sm text-slate-500">{text(language, "Emergency severity", "জরুরি তীব্রতা")}</p><p className="mt-2 text-5xl font-bold text-clinic-900">{result.risk.score}</p><p className="text-sm text-slate-500">{text(language, "risk score / 100", "ঝুঁকি স্কোর / ১০০")}</p></div>
            <SeverityBadge level={result.risk.severity} />
          </div>
          {result.alert_created && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{text(language, "Emergency alert created. Human review and referral decision are required.", "জরুরি সতর্কতা তৈরি হয়েছে। মানবিক পর্যালোচনা ও রেফারেল সিদ্ধান্ত প্রয়োজন।")}</p>}
          <h2 className="mt-6 font-bold">{text(language, "Signals detected", "শনাক্ত সংকেত")}</h2>
          {result.risk.reasons.map((reason) => <p className="mt-2 text-sm text-slate-600" key={reason}>- {displayContent(language, reason)}</p>)}
          <h2 className="mt-5 font-bold">{text(language, "Recommended actions", "প্রস্তাবিত করণীয়")}</h2>
          {result.risk.recommendations.map((action) => <p className="mt-2 text-sm text-slate-600" key={action}>- {displayContent(language, action)}</p>)}
        </section>
        <div className="space-y-5">
          <section className="card">
            <h2 className="text-lg font-bold">{text(language, "Graph RAG explanation", "গ্রাফ RAG ব্যাখ্যা")}</h2>
            <GraphPath path={result.graph.path} explanation={result.graph.explanation} />
            <p className="mt-2 text-xs text-slate-500">{text(language, "Path source:", "পথের উৎস:")} {displayValue(language, result.graph.source)}</p>
          </section>
          <section className="card">
            <h2 className="mb-3 text-lg font-bold">{text(language, "Cited contextual guidance", "উদ্ধৃত প্রাসঙ্গিক নির্দেশনা")}</h2>
            {result.retrieval.chunks.map((chunk) => (
              <article className="mb-3 rounded-xl border border-slate-100 p-4" key={chunk.title}>
                <p className="text-sm font-bold text-clinic-700">{displayValue(language, chunk.title)}</p>
                <p className="my-2 text-sm text-slate-700">{displayContent(language, guidanceText(chunk))}</p>
                <p className="text-xs text-slate-500">{text(language, "Source:", "উৎস:")} {displayValue(language, chunk.source)} | {text(language, "Displayed language:", "প্রদর্শিত ভাষা:")} {displayValue(language, language)}</p>
              </article>
            ))}
          </section>
        </div>
      </div>
      <div className="mt-5"><Disclaimer /></div>
      <div className="mt-5 flex gap-3"><Link className="btn-primary" href="/dashboard">{text(language, "View dashboard alert", "ড্যাশবোর্ড সতর্কতা দেখুন")}</Link><Link className="btn-secondary" href="/audit">{text(language, "Inspect audit trail", "অডিট নথি দেখুন")}</Link></div>
    </div>
  );
}
