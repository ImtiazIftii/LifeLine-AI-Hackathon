"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { Disclaimer, GraphPath, PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text } from "@/lib/i18n";

type Answer = { answer: string; provider: string; retrieval: { citations: { title: string; source: string }[] }; graph: { path: string[]; explanation: string } };

export default function AssistantPage() {
  const { language } = useLanguage();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const query = String(new FormData(event.currentTarget).get("query"));
    const result = await api<Answer>("/api/assistant/query", {
      method: "POST",
      body: JSON.stringify({ query, symptoms: /headache|মাথাব্যথা/.test(query.toLowerCase()) ? ["headache", "swelling"] : [], language })
    }, "mother");
    setAnswer(result);
    setLoading(false);
  }
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading title={text(language, "AI maternal health assistant", "এআই মাতৃস্বাস্থ্য সহায়ক")} subtitle={text(language, "Ask for plain-language guidance grounded in retrieved local guideline chunks and explainable pathways.", "উদ্ধারকৃত স্থানীয় নির্দেশিকার অংশ এবং ব্যাখ্যাযোগ্য পথের ভিত্তিতে সহজ ভাষায় নির্দেশনা জানতে চান।")} />
      <form className="card" onSubmit={ask}>
        <label>{text(language, "Question", "প্রশ্ন")}</label>
        <textarea key={language} name="query" rows={3} defaultValue={language === "bn" ? "আমার মাথাব্যথা এবং পা ফোলা, কী করা উচিত?" : "I have a headache and swelling during pregnancy. What should I do?"} />
        <button disabled={loading} className="btn-primary mt-4">{loading ? text(language, "Retrieving guidance...", "নির্দেশনা খোঁজা হচ্ছে...") : text(language, "Ask assistant", "সহায়ককে জিজ্ঞাসা করুন")}</button>
      </form>
      {answer && (
        <div className="mt-5 space-y-5">
          <section className="card">
            <p className="text-xs font-bold uppercase tracking-wide text-clinic-600">{text(language, "Grounded response", "তথ্যভিত্তিক উত্তর")} | {displayValue(language, answer.provider)}</p>
            <p className="mt-3 leading-7 text-slate-700">{displayContent(language, answer.answer)}</p>
            <h2 className="mt-5 font-bold">{text(language, "Sources retrieved", "প্রাপ্ত উৎস")}</h2>
            {answer.retrieval.citations.map((citation) => <p className="mt-2 text-sm text-slate-600" key={citation.title}>- {displayValue(language, citation.title)} ({displayValue(language, citation.source)})</p>)}
          </section>
          <section className="card"><h2 className="font-bold">{text(language, "Why this action appears", "এই করণীয় কেন দেখানো হচ্ছে")}</h2><GraphPath path={answer.graph.path} explanation={answer.graph.explanation} /></section>
        </div>
      )}
      <div className="mt-5"><Disclaimer /></div>
    </div>
  );
}
