"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text, translateWords } from "@/lib/i18n";

type Log = { id: string; event_type: string; actor_role: string; summary: string; risk_score?: number; created_at?: string; graph_path?: string[] };

export default function AuditPage() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => { api<Log[]>("/api/audit-logs", {}, "doctor_admin").then(setLogs).catch(() => undefined); }, []);
  return (
    <div>
      <PageHeading title={text(language, "Responsible AI audit trail", "দায়িত্বশীল এআই অডিট নথি")} subtitle={text(language, "Doctor/admin access to traced retrieval, risk outputs, graph explanations, and review activities.", "অনুসরণযোগ্য তথ্য অনুসন্ধান, ঝুঁকি ফলাফল, গ্রাফ ব্যাখ্যা এবং পর্যালোচনা কার্যক্রমে ডাক্তার/প্রশাসকের প্রবেশাধিকার।")} />
      <section className="card overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="text-slate-500"><tr><th className="pb-3">{text(language, "Event", "ঘটনা")}</th><th>{text(language, "Role", "ভূমিকা")}</th><th>{text(language, "Summary", "সারাংশ")}</th><th>{text(language, "Risk", "ঝুঁকি")}</th><th>{text(language, "Graph evidence", "গ্রাফ প্রমাণ")}</th></tr></thead>
          <tbody>{logs.map((log) => (
            <tr className="border-t border-slate-100 align-top" key={log.id}>
              <td className="py-4 font-semibold">{displayValue(language, log.event_type)}</td>
              <td>{displayValue(language, log.actor_role)}</td>
              <td className="max-w-xs">{displayContent(language, log.summary)}</td>
              <td>{log.risk_score ?? "-"}</td>
              <td className="max-w-xs text-xs text-slate-500">{log.graph_path ? translateWords(language, log.graph_path).join(" -> ") : text(language, "Logged without graph path", "গ্রাফ পথ ছাড়া নথিভুক্ত")}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>
      <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{text(language, "Red alerts require documented human review. Audit logs support accountability and must be protected as sensitive health data.", "লাল সতর্কতার জন্য নথিভুক্ত মানবিক পর্যালোচনা প্রয়োজন। অডিট নথি জবাবদিহি নিশ্চিত করে এবং সংবেদনশীল স্বাস্থ্যতথ্য হিসেবে সুরক্ষিত রাখতে হবে।")}</p>
    </div>
  );
}
