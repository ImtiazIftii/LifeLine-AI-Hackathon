"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, text } from "@/lib/i18n";

export default function OfflinePage() {
  const { language } = useLanguage();
  const [offline, setOffline] = useState(false);
  const [status, setStatus] = useState("");
  function toggle() {
    const next = !offline;
    setOffline(next);
    localStorage.setItem("offline-demo", String(next));
    window.dispatchEvent(new Event(next ? "offline" : "online"));
  }
  async function log(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symptoms = String(new FormData(event.currentTarget).get("symptoms"));
    const response = await api<{ sms_fallback: string }>("/api/offline/queue", { method: "POST", body: JSON.stringify({ symptoms, recorded_at: new Date(), device_id: "rural-device-01" }) });
    setStatus(text(language, response.sms_fallback, "ডেটা সংযোগ না থাকলে রেফারেল হটলাইনে নমুনা এসএমএস পাঠানোর সারিতে রাখা হয়েছে।"));
  }
  async function sync() {
    const result = await api<{ synced_count: number }>("/api/offline/sync", { method: "POST" });
    setStatus(text(language, `${result.synced_count} queued event(s) synchronized to the care team.`, `${result.synced_count}টি সারিবদ্ধ ঘটনা সেবাদলের সঙ্গে সমন্বয় করা হয়েছে।`));
  }
  return (
    <div className="max-w-4xl">
      <PageHeading title={text(language, "Offline and low-bandwidth mode", "অফলাইন ও দুর্বল সংযোগ মোড")} subtitle={text(language, "Simulate community screening where connectivity is intermittent and local emergency rules still operate.", "যেখানে সংযোগ অনিয়মিত, সেখানে স্থানীয় জরুরি নিয়ম চালু রেখে কমিউনিটি স্ক্রিনিং অনুকরণ করুন।")} />
      <section className="card mb-5 flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="font-bold">{text(language, "Connection simulation", "সংযোগ সিমুলেশন")}</h2><p className="text-sm text-slate-500">{text(language, "Cached guideline chunks: 10 | Local emergency rules: available", "সংরক্ষিত নির্দেশিকা অংশ: ১০ | স্থানীয় জরুরি নিয়ম: পাওয়া যাচ্ছে")}</p></div>
        <button className={offline ? "btn-primary bg-amber-600" : "btn-secondary"} onClick={toggle}>{offline ? text(language, "Offline enabled", "অফলাইন সক্রিয়") : text(language, "Enable offline mode", "অফলাইন মোড সক্রিয় করুন")}</button>
      </section>
      <form className="card" onSubmit={log}>
        <h2 className="mb-3 font-bold">{text(language, "Offline symptom log", "অফলাইন লক্ষণ নথি")}</h2>
        <label>{text(language, "Symptoms observed", "পর্যবেক্ষিত লক্ষণ")}</label>
        <input key={language} name="symptoms" defaultValue={text(language, "headache, swelling", "মাথাব্যথা, ফোলা")} />
        <div className="mt-4 flex gap-3"><button className="btn-primary">{text(language, "Queue locally", "স্থানীয়ভাবে সারিতে রাখুন")}</button><button className="btn-secondary" type="button" onClick={sync}>{text(language, "Sync when online", "অনলাইনে এলে সমন্বয় করুন")}</button></div>
        {status && <p className="mt-4 rounded-lg bg-clinic-50 p-3 text-sm text-clinic-700">{displayContent(language, status)}</p>}
      </form>
      <section className="card mt-5"><h2 className="font-bold">{text(language, "SMS fallback mock", "এসএমএস বিকল্প নমুনা")}</h2><p className="mt-2 text-sm text-slate-600">{text(language, "For a Red rule match while offline, the demo records an SMS escalation message for the nearest referral contact. No SMS provider or paid API is used.", "অফলাইনে লাল নিয়ম মিললে ডেমো নিকটস্থ রেফারেল যোগাযোগের জন্য একটি এসএমএস বার্তা নথিভুক্ত করে। কোনো এসএমএস সেবাদাতা বা অর্থপ্রদত্ত এপিআই ব্যবহৃত হয় না।")}</p></section>
    </div>
  );
}
