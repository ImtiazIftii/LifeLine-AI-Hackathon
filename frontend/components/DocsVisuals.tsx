"use client";

import { useState } from "react";
import type { DocsMetrics, TeamMember } from "@/lib/docs";

export function FlowDiagram({ nodes }: { nodes: string[] }) {
  const width = Math.max(980, nodes.length * 150);
  return (
    <div className="overflow-x-auto rounded-2xl border border-clinic-100 bg-clinic-50/40 p-3">
      <svg viewBox={`0 0 ${width} 112`} className="min-w-[920px] text-clinic-700" aria-label={nodes.join(" to ")}>
        {nodes.map((node, index) => {
          const x = 18 + index * 150;
          return (
            <g key={node}>
              {index > 0 && (
                <>
                  <line x1={x - 35} y1="55" x2={x - 10} y2="55" stroke="currentColor" strokeWidth="2" />
                  <path d={`M${x - 10} 55 l-8 -5 v10 z`} fill="currentColor" />
                </>
              )}
              <rect x={x} y="26" width="116" height="58" rx="12" fill="white" stroke="#a8ded5" />
              <foreignObject x={x + 6} y="32" width="104" height="46">
                <div className="flex h-full items-center justify-center text-center text-[11px] font-semibold leading-4 text-clinic-800">{node}</div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function MetricCards({ metrics }: { metrics: DocsMetrics }) {
  const values = [
    ["Patients screened", metrics.patients_screened],
    ["Alerts generated", metrics.alerts_generated],
    ["Audited activities", metrics.audited_activities],
    ["Documented APIs", metrics.documented_apis],
    ["Platform features", metrics.platform_features],
    ["Demo users", metrics.users]
  ];
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {values.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-clinic-100 bg-clinic-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-clinic-800">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500">{metrics.data_classification}. Updated {new Date(metrics.updated_at).toLocaleString()}.</p>
    </div>
  );
}

function Initials({ name }: { name: string }) {
  return <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-clinic-100 text-xl font-bold text-clinic-700">{name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>;
}

export function TeamCards({ members }: { members: TeamMember[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {members.map((member) => <TeamCard member={member} key={member.id} />)}
    </div>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="flex min-h-40 items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4">
      {member.image_url && !failed
        ? <img src={member.image_url} alt={member.full_name} onError={() => setFailed(true)} className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
        : <Initials name={member.full_name} />}
      <div className="min-w-0">
        <h3 className="font-bold text-clinic-900">{member.full_name}</h3>
        <p className="text-sm text-clinic-600">{member.role}</p>
        <a className="mt-2 block truncate text-sm text-slate-600 hover:text-clinic-700" href={`mailto:${member.email}`}>{member.email}</a>
        <div className="mt-2 flex gap-3 text-sm font-semibold text-clinic-700">
          {member.github_url && <a href={member.github_url} target="_blank" rel="noreferrer">GitHub</a>}
          {member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
        </div>
      </div>
    </article>
  );
}
