"use client";

import { Disclaimer, PageHeading } from "@/components/UI";
import { useLanguage } from "@/components/AppShell";
import { text } from "@/lib/i18n";

const commitments = [
  ["No autonomous diagnosis", "স্বয়ংক্রিয় রোগ নির্ণয় নয়", "Outputs are decision support only and do not replace qualified clinical evaluation.", "ফলাফল কেবল সিদ্ধান্তে সহায়তার জন্য; এটি যোগ্য ক্লিনিক্যাল মূল্যায়নের বিকল্প নয়।"],
  ["Human-in-the-loop", "মানবিক পর্যালোচনা", "All Red alerts require immediate health worker or clinician review before referral action is recorded.", "রেফারেলের করণীয় নথিভুক্ত করার আগে সব লাল সতর্কতায় স্বাস্থ্যকর্মী বা চিকিৎসকের তাৎক্ষণিক পর্যালোচনা প্রয়োজন।"],
  ["Traceability", "অনুসরণযোগ্যতা", "Retrieved chunks, cited sources, graph paths, risk scores, and disclaimers are recorded in audit logs.", "উদ্ধারকৃত অংশ, উদ্ধৃত উৎস, গ্রাফ পথ, ঝুঁকি স্কোর এবং সতর্কবার্তা অডিট নথিতে রাখা হয়।"],
  ["Privacy", "গোপনীয়তা", "Maternal records are sensitive. Use least-privilege roles, consent, encryption, retention controls, and anonymized analytics exports.", "মাতৃস্বাস্থ্যের নথি সংবেদনশীল। ন্যূনতম প্রবেশাধিকার, সম্মতি, এনক্রিপশন, সংরক্ষণ নিয়ন্ত্রণ এবং নামবিহীন বিশ্লেষণ রপ্তানি ব্যবহার করুন।"],
  ["Bias and limits", "পক্ষপাত ও সীমাবদ্ধতা", "Rules and guideline summaries may not reflect every local clinical protocol or patient circumstance; clinical and community validation is required.", "নিয়ম ও নির্দেশিকার সারাংশ প্রতিটি স্থানীয় ক্লিনিক্যাল প্রটোকল বা রোগীর পরিস্থিতি প্রতিফলিত নাও করতে পারে; ক্লিনিক্যাল ও কমিউনিটি যাচাই প্রয়োজন।"]
];

export default function ResponsibleAiPage() {
  const { language } = useLanguage();
  return (
    <div className="max-w-4xl">
      <PageHeading title={text(language, "Responsible AI and privacy", "দায়িত্বশীল এআই ও গোপনীয়তা")} subtitle={text(language, "Safety guardrails designed into the LifeLine AI demonstration.", "LifeLine AI প্রদর্শনীতে অন্তর্ভুক্ত নিরাপত্তা সুরক্ষা ব্যবস্থা।")} />
      <div className="space-y-4">
        {commitments.map(([englishTitle, banglaTitle, englishText, banglaText]) => <section className="card" key={englishTitle}><h2 className="font-bold text-clinic-900">{text(language, englishTitle, banglaTitle)}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text(language, englishText, banglaText)}</p></section>)}
      </div>
      <div className="mt-5"><Disclaimer /></div>
    </div>
  );
}
