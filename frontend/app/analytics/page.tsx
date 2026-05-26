"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { api } from "@/lib/api";
import { PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayValue, text } from "@/lib/i18n";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Analytics = { risk_distribution: { severity: string; count: number }[]; active_alerts: number; patients_screened: number; referrals_today: number; offline_sync_pending: number };

export default function AnalyticsPage() {
  const { language } = useLanguage();
  const [data, setData] = useState<Analytics | null>(null);
  useEffect(() => { api<Analytics>("/api/analytics").then(setData).catch(() => undefined); }, []);
  return (
    <div>
      <PageHeading title={text(language, "Healthcare analytics", "স্বাস্থ্যসেবা বিশ্লেষণ")} subtitle={text(language, "Operational overview for maternal screening, alerts, referral load, and offline synchronization.", "মাতৃ স্ক্রিনিং, সতর্কতা, রেফারেলের চাপ এবং অফলাইন সমন্বয়ের কার্যক্রম সারসংক্ষেপ।")} />
      {data && <>
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {[[text(language, "Screened", "স্ক্রিনিং হয়েছে"), data.patients_screened], [text(language, "Active alerts", "সক্রিয় সতর্কতা"), data.active_alerts], [text(language, "Referrals today", "আজকের রেফারেল"), data.referrals_today], [text(language, "Sync pending", "সমন্বয় অপেক্ষমাণ"), data.offline_sync_pending]].map(([title, value]) => (
            <div className="card" key={title}><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>
          ))}
        </div>
        <section className="card max-w-3xl">
          <h2 className="mb-5 text-lg font-bold">{text(language, "Risk severity distribution", "ঝুঁকির তীব্রতার বণ্টন")}</h2>
          <Bar data={{ labels: data.risk_distribution.map((row) => displayValue(language, row.severity)), datasets: [{ label: text(language, "Patients", "রোগী"), data: data.risk_distribution.map((row) => row.count), backgroundColor: ["#34d399", "#fbbf24", "#fb923c", "#ef4444"], borderRadius: 8 }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </section>
      </>}
    </div>
  );
}
