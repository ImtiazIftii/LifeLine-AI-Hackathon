"use client";

import { useLanguage } from "@/components/AppShell";
import { disclaimers, displayContent, displayValue, text } from "@/lib/i18n";

export function SeverityBadge({ level }: { level: string }) {
  const { language } = useLanguage();
  const classes: Record<string, string> = {
    Green: "bg-emerald-100 text-emerald-700",
    Yellow: "bg-amber-100 text-amber-700",
    Orange: "bg-orange-100 text-orange-700",
    Red: "bg-red-100 text-red-700"
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${classes[level] || classes.Green}`}>{displayValue(language, level)}</span>;
}

export function Disclaimer() {
  const { language } = useLanguage();
  return <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>{text(language, "Clinical safety:", "ক্লিনিক্যাল নিরাপত্তা:")}</strong> {disclaimers[language]}</div>;
}

export function GraphPath({ path, explanation }: { path: string[]; explanation?: string }) {
  const { language } = useLanguage();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 py-3">
        {path.map((node, index) => (
          <span className="contents" key={node}>
            <span className="rounded-lg bg-clinic-50 px-3 py-2 text-sm font-medium text-clinic-700">{displayValue(language, node)}</span>
            {index < path.length - 1 && <span className="text-clinic-500">-&gt;</span>}
          </span>
        ))}
      </div>
      {explanation && <p className="text-sm text-slate-600">{displayContent(language, explanation)}</p>}
    </div>
  );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-3xl font-bold tracking-tight text-clinic-900">{title}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>
    </div>
  );
}
