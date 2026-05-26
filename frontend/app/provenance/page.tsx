"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Disclaimer, PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text } from "@/lib/i18n";

type Provenance = { sources: string[]; pipeline: string[]; model_runtime: { configured_provider: string; supported: string[]; fallback: string }; limitations: string[] };

export default function ProvenancePage() {
  const { language } = useLanguage();
  const [data, setData] = useState<Provenance | null>(null);
  useEffect(() => { api<Provenance>("/api/provenance", {}, "mother").then(setData).catch(() => undefined); }, []);
  return (
    <div>
      <PageHeading title={text(language, "Data provenance", "তথ্যের উৎস ও বংশপরম্পরা")} subtitle={text(language, "What informed this demonstration, how context moves through retrieval, and what remains unvalidated.", "এই প্রদর্শনী কোন তথ্যের ভিত্তিতে তৈরি, অনুসন্ধানের মাধ্যমে প্রসঙ্গ কীভাবে আসে, এবং কোন বিষয় এখনো যাচাই হয়নি।")} />
      {data && <div className="grid gap-5 lg:grid-cols-2">
        <section className="card"><h2 className="mb-3 text-lg font-bold">{text(language, "Document sources", "নথির উৎস")}</h2>{data.sources.map((source) => <p className="mb-2 text-sm text-slate-600" key={source}>- {displayValue(language, source)}</p>)}</section>
        <section className="card"><h2 className="mb-3 text-lg font-bold">{text(language, "Retrieval pipeline", "তথ্য অনুসন্ধান প্রক্রিয়া")}</h2><div className="flex flex-wrap gap-2">{data.pipeline.map((step) => <span className="rounded-lg bg-clinic-50 px-3 py-2 text-sm text-clinic-700" key={step}>{displayValue(language, step)}</span>)}</div></section>
        <section className="card"><h2 className="mb-3 text-lg font-bold">{text(language, "Local LLM support", "স্থানীয় এলএলএম সহায়তা")}</h2><p className="text-sm">{text(language, "Configured:", "কনফিগার করা:")} <strong>{data.model_runtime.configured_provider}</strong></p><p className="mt-2 text-sm text-slate-600">{text(language, "Supports", "সমর্থন করে")} {data.model_runtime.supported.join(", ")}। {text(language, "Current fallback:", "বর্তমান বিকল্প:")} {displayValue(language, data.model_runtime.fallback)}।</p></section>
        <section className="card"><h2 className="mb-3 text-lg font-bold">{text(language, "Known limitations", "জ্ঞাত সীমাবদ্ধতা")}</h2>{data.limitations.map((item) => <p className="mb-2 text-sm text-slate-600" key={item}>- {displayContent(language, item)}</p>)}</section>
      </div>}
      <div className="mt-5"><Disclaimer /></div>
      <Link href="/responsible-ai" className="btn-secondary mt-5">{text(language, "Responsible AI commitments", "দায়িত্বশীল এআই অঙ্গীকার")}</Link>
    </div>
  );
}
