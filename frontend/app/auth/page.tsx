"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { displayContent, displayValue, text } from "@/lib/i18n";

export default function AuthPage() {
  const { language } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api<{ user: { name: string; role: string }; token: string }>(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(data)
      }, "mother");
      localStorage.setItem("lifeline-token", result.token);
      setMessage(text(language, `Signed in as ${result.user.name} (${result.user.role.replace("_", " ")}).`, `${displayValue(language, result.user.name)} (${displayValue(language, result.user.role)}) হিসেবে প্রবেশ করেছেন।`));
    } catch (error) {
      setMessage(displayContent(language, (error as Error).message));
    }
  }
  return (
    <div className="mx-auto max-w-lg">
      <PageHeading title={text(language, "Secure access", "নিরাপদ প্রবেশ")} subtitle={text(language, "Role-based views for mothers, health workers, and doctor/admin reviewers.", "মা, স্বাস্থ্যকর্মী এবং ডাক্তার/প্রশাসক পর্যালোচকদের জন্য ভূমিকাভিত্তিক দৃশ্য।")} />
      <div className="card">
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
          {(["login", "register"] as const).map((item) => (
            <button key={item} className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize ${mode === item ? "bg-white text-clinic-700 shadow-sm" : "text-slate-500"}`} onClick={() => setMode(item)}>{item === "login" ? text(language, "Login", "প্রবেশ") : text(language, "Register", "নিবন্ধন")}</button>
          ))}
        </div>
        <form className="space-y-4" onSubmit={submit}>
          {mode === "register" && <div><label>{text(language, "Name", "নাম")}</label><input name="name" required /></div>}
          <div><label>{text(language, "Email", "ইমেইল")}</label><input name="email" type="email" defaultValue={mode === "login" ? "worker@lifeline.demo" : ""} required /></div>
          <div><label>{text(language, "Password", "পাসওয়ার্ড")}</label><input name="password" type="password" defaultValue={mode === "login" ? "Demo123!" : ""} required /></div>
          {mode === "register" && <div><label>{text(language, "Role", "ভূমিকা")}</label><select name="role"><option value="mother">{text(language, "Mother", "মা")}</option><option value="health_worker">{text(language, "Health Worker", "স্বাস্থ্যকর্মী")}</option><option value="doctor_admin">{text(language, "Doctor/Admin", "ডাক্তার/প্রশাসক")}</option></select></div>}
          <button className="btn-primary w-full">{mode === "login" ? text(language, "Sign in", "প্রবেশ করুন") : text(language, "Create account", "অ্যাকাউন্ট তৈরি করুন")}</button>
        </form>
        {mode === "login" && <p className="mt-4 text-xs text-slate-500">{text(language, "Demo accounts include `worker@lifeline.demo`, `doctor@lifeline.demo`, `mother@lifeline.demo`, and `admin@lifeline.demo` with password `Demo123!`.", "ডেমো অ্যাকাউন্টগুলোর মধ্যে `worker@lifeline.demo`, `doctor@lifeline.demo`, `mother@lifeline.demo`, এবং `admin@lifeline.demo` আছে; পাসওয়ার্ড `Demo123!`।")}</p>}
        {message && <p className="mt-4 rounded-lg bg-clinic-50 p-3 text-sm text-clinic-700">{message}</p>}
      </div>
    </div>
  );
}
