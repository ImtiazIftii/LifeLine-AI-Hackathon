"use client";

export default function MealPlanCard({ title, plan }) {
  const entries = Array.isArray(plan)
    ? plan.map((day) => [`Day ${day.day}`, `${day.breakfast}; ${day.lunch}; ${day.snack}; ${day.dinner}`])
    : Object.entries(plan || {});

  return (
    <section className="card">
      <h2 className="text-lg font-bold text-clinic-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {entries.map(([label, value]) => (
          <div className="rounded-lg bg-slate-50 p-3 text-sm" key={label}>
            <strong className="capitalize text-clinic-800">{String(label).replaceAll("_", " ")}:</strong>{" "}
            <span className="text-slate-700">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
