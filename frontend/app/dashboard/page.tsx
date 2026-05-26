"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeading, SeverityBadge } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text } from "@/lib/i18n";

type Patient = { id: string; name: string; village: string; pregnancy_week: number; severity?: string; score?: number };
type Alert = { id: string; patient_name: string; severity: string; message: string; status: string; requires_human_review: boolean };

export default function DashboardPage() {
  const { language } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    Promise.all([api<Patient[]>("/api/patients"), api<Alert[]>("/api/alerts")]).then(([patientData, alertData]) => {
      setPatients(patientData);
      setAlerts(alertData);
    }).catch(() => undefined);
  }, []);
  return (
    <div>
      <PageHeading title={text(language, "Health worker dashboard", "স্বাস্থ্যকর্মী ড্যাশবোর্ড")} subtitle={text(language, "Referral queue, patient screening outcomes, and human-in-the-loop emergency alerts.", "রেফারেল সারি, রোগী স্ক্রিনিং ফলাফল এবং মানবিক পর্যালোচনাসহ জরুরি সতর্কতা।")} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">{text(language, "Open emergency alerts", "খোলা জরুরি সতর্কতা")}</p><p className="mt-2 text-3xl font-bold text-red-600">{alerts.filter((a) => a.status === "Open" && (a.severity === "Red" || a.severity === "Orange")).length}</p></div>
        <div className="card"><p className="text-sm text-slate-500">{text(language, "Patients screened", "স্ক্রিনিং করা রোগী")}</p><p className="mt-2 text-3xl font-bold">{patients.length}</p></div>
        <div className="card"><p className="text-sm text-slate-500">{text(language, "Needs human review", "মানবিক পর্যালোচনা প্রয়োজন")}</p><p className="mt-2 text-3xl font-bold text-orange-600">{alerts.filter((a) => a.requires_human_review).length}</p></div>
      </div>
      <section className="card mb-6">
        <div className="mb-4 flex justify-between"><h2 className="text-xl font-bold">{text(language, "Emergency alert workflow", "জরুরি সতর্কতার কার্যপ্রবাহ")}</h2><Link className="text-sm font-semibold text-clinic-600" href="/audit">{text(language, "Audit logs", "অডিট নথি")}</Link></div>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${alert.severity === "Red" ? "border-red-200 bg-red-50" : "border-slate-100"}`}>
              <div><p className="font-semibold">{displayValue(language, alert.patient_name)}</p><p className="text-sm text-slate-600">{displayContent(language, alert.message)}</p></div>
              <div className="flex items-center gap-3"><SeverityBadge level={alert.severity} /><span className="text-sm text-slate-500">{displayValue(language, alert.status)}</span>{alert.requires_human_review && <button className="btn-primary">{text(language, "Review referral", "রেফারেল পর্যালোচনা")}</button>}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="card overflow-x-auto">
        <h2 className="mb-4 text-xl font-bold">{text(language, "Patient registry", "রোগী নিবন্ধন")}</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500"><tr><th className="pb-3">{text(language, "Patient", "রোগী")}</th><th>{text(language, "Village", "গ্রাম")}</th><th>{text(language, "Week", "সপ্তাহ")}</th><th>{text(language, "Risk", "ঝুঁকি")}</th><th>{text(language, "Action", "করণীয়")}</th></tr></thead>
          <tbody>{patients.map((patient) => (
            <tr key={patient.id} className="border-t border-slate-100">
              <td className="py-4 font-semibold">{displayValue(language, patient.name)}</td><td>{displayValue(language, patient.village)}</td><td>{patient.pregnancy_week}</td>
              <td><SeverityBadge level={patient.severity || "Green"} /></td>
              <td><Link className="font-semibold text-clinic-600" href={`/patients/${patient.id}`}>{text(language, "Details", "বিস্তারিত")}</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </div>
  );
}
