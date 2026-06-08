"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";
import { text } from "@/lib/i18n";

const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({
  language: "en",
  setLanguage: () => undefined
});

export function useLanguage() {
  return useContext(LanguageContext);
}

const nav = [
  ["Intake", "ইনটেক", "/intake"],
  ["Assistant", "সহায়তা", "/assistant"],
  ["Nutrition", "পুষ্টি", "/nutrition"],
  ["Worker Dashboard", "কর্মী ড্যাশবোর্ড", "/dashboard"],
  ["Analytics", "বিশ্লেষণ", "/analytics"],
  ["OCR", "ওসিআর", "/ocr"],
  ["Offline", "অফলাইন", "/offline"],
  ["Audit", "অডিট", "/audit"],
  ["Provenance", "উৎস", "/provenance"],
  ["Docs", "Docs", "/docs"],
  ["Docs Admin", "Docs Admin", "/admin/docs"]
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const listener = () => setOffline(!navigator.onLine || localStorage.getItem("offline-demo") === "true");
    listener();
    window.addEventListener("online", listener);
    window.addEventListener("offline", listener);
    return () => {
      window.removeEventListener("online", listener);
      window.removeEventListener("offline", listener);
    };
  }, []);
  useEffect(() => {
    const savedLanguage = localStorage.getItem("lifeline-language");
    if (savedLanguage === "en" || savedLanguage === "bn") setLanguage(savedLanguage);
  }, []);
  useEffect(() => {
    localStorage.setItem("lifeline-language", language);
    document.documentElement.lang = language;
  }, [language]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinic-600 text-xl font-bold text-white">+</span>
            <span>
              <strong className="block text-lg leading-none text-clinic-900">LifeLine AI</strong>
              <small className="text-slate-500">{text(language, "Maternal safety support", "মাতৃ সুরক্ষা সহায়তা")}</small>
            </span>
          </Link>
          <nav className="hidden gap-4 text-sm font-medium text-slate-600 xl:flex">
            {nav.map(([english, bangla, href]) => <Link key={href} href={href} className="hover:text-clinic-600">{language === "bn" ? bangla : english}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <button className={`rounded-lg px-3 py-2 text-sm ${language === "en" ? "bg-clinic-600 text-white" : "bg-slate-100"}`} onClick={() => setLanguage("en")}>EN</button>
            <button className={`rounded-lg px-3 py-2 text-sm ${language === "bn" ? "bg-clinic-600 text-white" : "bg-slate-100"}`} onClick={() => setLanguage("bn")}>বাংলা</button>
            <Link href="/auth" className="btn-secondary hidden sm:inline-flex">{text(language, "Sign in", "প্রবেশ করুন")}</Link>
          </div>
        </div>
        {(offline || false) && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
            {text(language, "Offline simulation active: emergency rules and cached guidance remain available; events will sync later.", "অফলাইন সিমুলেশন সক্রিয়: জরুরি নিয়ম ও সংরক্ষিত নির্দেশনা পাওয়া যাবে; ঘটনাগুলো পরে সমন্বয় হবে।")}
          </div>
        )}
      </header>
      <nav className="flex gap-4 overflow-x-auto border-b border-slate-100 bg-white px-5 py-3 text-sm font-medium text-slate-600 xl:hidden">
        {nav.map(([english, bangla, href]) => <Link key={href} href={href} className="whitespace-nowrap hover:text-clinic-600">{language === "bn" ? bangla : english}</Link>)}
      </nav>
      <main className="mx-auto min-h-[calc(100vh-80px)] max-w-7xl px-5 py-8">{children}</main>
    </LanguageContext.Provider>
  );
}
