"use client";

import { useState } from "react";
import MealPlanCard from "@/components/MealPlanCard";
import { api } from "@/lib/api";

const symptomOptions = ["dizziness", "weakness", "swelling", "nausea", "vomiting", "headache", "constipation", "low appetite"];

export default function NutritionAI() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const symptoms = symptomOptions.filter((symptom) => form.get(symptom));
    const allergies = String(form.get("allergies") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    try {
      const response = await api(
        "/api/nutrition/plan",
        {
          method: "POST",
          body: JSON.stringify({
            pregnancy_week: Number(form.get("pregnancy_week")),
            symptoms,
            hemoglobin: form.get("hemoglobin") ? Number(form.get("hemoglobin")) : null,
            bp: form.get("bp") || null,
            weight: form.get("weight") ? Number(form.get("weight")) : null,
            dietary_preference: form.get("dietary_preference"),
            allergies,
            budget: form.get("budget"),
            location: "Bangladesh"
          })
        },
        "health_worker"
      );
      setResult(response);
    } catch (reason) {
      setError(reason.message || "Nutrition plan could not be generated.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-clinic-900">Nutrition AI Engine</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Local maternal nutrition decision support using Bangladesh food data, guideline RAG, and safety rules.
        </p>
      </div>

      <form className="card grid gap-5 lg:grid-cols-[1fr_1fr]" onSubmit={submit}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label>Pregnancy week</label>
              <input name="pregnancy_week" type="number" min="1" max="42" defaultValue="28" required />
            </div>
            <div>
              <label>Hemoglobin</label>
              <input name="hemoglobin" type="number" step="0.1" defaultValue="8.9" />
            </div>
            <div>
              <label>Blood pressure</label>
              <input name="bp" placeholder="150/96" />
            </div>
            <div>
              <label>Weight</label>
              <input name="weight" type="number" step="0.1" placeholder="Optional" />
            </div>
          </div>

          <div>
            <label>Symptoms</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {symptomOptions.map((symptom) => (
                <label className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 capitalize" key={symptom}>
                  <input className="h-4 w-4" type="checkbox" name={symptom} defaultChecked={symptom === "weakness" || symptom === "dizziness"} />
                  {symptom}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label>Dietary preference</label>
            <select name="dietary_preference" defaultValue="rice, fish, egg allowed">
              <option>rice-based</option>
              <option>vegetarian</option>
              <option>rice, fish, egg allowed</option>
              <option>fish/chicken/egg allowed</option>
            </select>
          </div>
          <div>
            <label>Budget</label>
            <select name="budget" defaultValue="low">
              <option value="low">low</option>
              <option value="medium">medium</option>
            </select>
          </div>
          <div>
            <label>Allergies</label>
            <input name="allergies" placeholder="fish, egg, milk" />
          </div>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <strong>Clinical safety:</strong> Nutrition suggestions are educational decision-support only and do not replace doctors or registered dietitians.
          </p>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Generating..." : "Generate nutrition plan"}</button>
        </div>
      </form>

      {result && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className={`card ${String(result.risk).startsWith("High") ? "border-red-200 bg-red-50" : ""}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-clinic-600">Risk-aware nutrition advice</p>
            <h2 className="mt-2 text-2xl font-bold text-clinic-900">{result.risk}</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {result.risk_reasons.map((item) => <p key={item}>- {item}</p>)}
              {result.risk_aware_nutrition_advice.map((item) => <p key={item}>- {item}</p>)}
            </div>
            <p className="mt-4 rounded-lg bg-white/70 p-3 text-sm text-slate-700">{result.bangla_explanation}</p>
          </section>

          <MealPlanCard title="1-day meal plan" plan={result.one_day_meal_plan} />
          <MealPlanCard title="3-day meal plan" plan={result.three_day_meal_plan} />

          <section className="card">
            <h2 className="text-lg font-bold">Foods to prioritize</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.foods_to_prioritize.map((food) => <span className="rounded-full bg-clinic-50 px-3 py-1 text-sm text-clinic-700" key={food}>{food}</span>)}
            </div>
            <h2 className="mt-5 text-lg font-bold">Foods to avoid</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.foods_to_avoid.map((food) => <span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-800" key={food}>{food}</span>)}
            </div>
          </section>

          <section className="card lg:col-span-2">
            <h2 className="text-lg font-bold">Warning signs requiring doctor visit</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {result.warning_signs_requiring_doctor_visit.map((warning) => (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" key={warning}>{warning}</p>
              ))}
            </div>
            {result.local_llm_note && (
              <div className="mt-4 rounded-lg bg-clinic-50 p-4 text-sm leading-7 text-clinic-900">
                <strong>LLM reasoning note:</strong>
                <p className="mt-2 whitespace-pre-line">{result.local_llm_note}</p>
              </div>
            )}
            <p className="mt-4 text-xs text-slate-500">Provider: {result.provider}</p>
          </section>
        </div>
      )}
    </div>
  );
}
