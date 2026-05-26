"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Disclaimer } from "@/components/UI";
import { FlowDiagram, MetricCards, TeamCards } from "@/components/DocsVisuals";
import { API_URL } from "@/lib/api";
import { docsAsMarkdown, type DocsSection, type PublicDocs } from "@/lib/docs";

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr>{rows[0].map((item, columnIndex) => <th className="border-b border-slate-200 p-3 text-clinic-900" key={`header-${columnIndex}`}>{item}</th>)}</tr></thead>
        <tbody>{rows.slice(1).map((row, rowIndex) => <tr key={`row-${rowIndex}`}>{row.map((item, columnIndex) => <td className="border-b border-slate-100 p-3 text-slate-600" key={`cell-${rowIndex}-${columnIndex}`}>{item}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function SectionContent({ section, data }: { section: DocsSection; data: PublicDocs }) {
  const body = section.body;
  if (section.slug === "team") return <TeamCards members={data.team} />;
  if (section.slug === "metrics") return <MetricCards metrics={data.metrics} />;
  if (section.slug === "changelog") return (
    <div className="space-y-3">
      {data.changelog.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-100 p-4">
          <div className="flex flex-wrap justify-between gap-2"><strong>{item.version} - {item.title}</strong><time className="text-sm text-slate-500">{new Date(item.published_at).toLocaleDateString()}</time></div>
          <p className="mt-2 text-sm text-slate-600">{item.details}</p>
        </div>
      ))}
    </div>
  );
  return (
    <div className="space-y-4">
      {body.lead && <p className="leading-7 text-slate-700">{body.lead}</p>}
      {body.bullets && <ul className="grid gap-3 md:grid-cols-2">{body.bullets.map((item) => <li className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700" key={item}>{item}</li>)}</ul>}
      {body.steps && <ol className="space-y-3">{body.steps.map((item, index) => <li className="flex gap-3 text-sm text-slate-700" key={item}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clinic-100 font-bold text-clinic-700">{index + 1}</span><span className="pt-1">{item}</span></li>)}</ol>}
      {body.matrix && <Table rows={body.matrix} />}
      {body.endpoints && <Table rows={[["Method", "Endpoint", "Purpose"], ...body.endpoints]} />}
      {body.diagram && <FlowDiagram nodes={body.diagram} />}
    </div>
  );
}

export default function DocsPage() {
  const [data, setData] = useState<PublicDocs | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<{ message: string; schedule?: { start_at: string; end_at: string } } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/api/docs/public`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw body;
        setData(body);
      })
      .catch((reason) => setError({ message: reason.error || "Documentation is unavailable.", schedule: reason.schedule }));
  }, []);
  const sections = useMemo(() => data?.sections.filter((section) => {
    const search = query.toLowerCase();
    return !search || `${section.title} ${section.summary} ${JSON.stringify(section.body)}`.toLowerCase().includes(search);
  }) || [], [data, query]);

  function exportMarkdown() {
    if (!data) return;
    const file = new Blob([docsAsMarkdown(data)], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "lifeline-ai-docs.md";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (error) return (
    <section className="mx-auto max-w-xl py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[.25em] text-slate-400">LifeLine AI Docs</p>
      <h1 className="mt-4 text-4xl font-bold text-clinic-900">Not Available</h1>
      <p className="mt-4 text-slate-600">{error.message}. This public showcase is controlled by an administrator.</p>
      {error.schedule && <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">Scheduled window: {new Date(error.schedule.start_at).toLocaleString()} to {new Date(error.schedule.end_at).toLocaleString()}.</p>}
      <Link className="btn-secondary mt-8" href="/">Return home</Link>
    </section>
  );
  if (!data) return <p className="py-20 text-center text-slate-500">Loading public documentation...</p>;

  return (
    <div className="docs-page">
      <section className="mb-8 overflow-hidden rounded-3xl bg-clinic-900 px-6 py-9 text-white md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.26em] text-clinic-100">Public showcase / live system docs</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">Maternal emergency decision support that shows its work.</h1>
            <p className="mt-5 max-w-2xl text-lg text-clinic-50">LifeLine AI combines traceable risk signals, Contextual RAG, Graph RAG, offline workflows, and human escalation for frontline maternal care.</p>
          </div>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">Live aggregate dashboard</span>
            <span className="rounded-full bg-white/10 px-4 py-2">Synthetic demonstration data</span>
            <span className="rounded-full bg-white/10 px-4 py-2">No paid API required</span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-clinic-900" onClick={() => window.print()}>Export PDF</button>
          <button className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold" onClick={exportMarkdown}>Export Markdown</button>
          <button className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold" onClick={copyLink}>{copied ? "Link copied" : "Copy shareable link"}</button>
          <Link href="/admin/docs" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold">Admin editor</Link>
        </div>
      </section>
      <Disclaimer />
      <div className="mt-8 grid gap-7 lg:grid-cols-[255px_minmax(0,1fr)]">
        <aside className="self-start lg:sticky lg:top-28">
          <label htmlFor="docs-search">Search documentation</label>
          <input id="docs-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search features, RAG, API..." />
          <nav className="mt-4 max-h-[65vh] overflow-y-auto rounded-2xl bg-white p-2 shadow-card" aria-label="Documentation sections">
            {sections.map((section) => <a className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-clinic-50 hover:text-clinic-700" href={`#${section.slug}`} key={section.id}>{section.title}</a>)}
          </nav>
        </aside>
        <div className="space-y-5">
          {sections.map((section) => (
            <section className="card scroll-mt-28" id={section.slug} key={section.id}>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-clinic-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-clinic-700">{section.category}</span>
                  <h2 className="mt-3 text-2xl font-bold text-clinic-900">{section.title}</h2>
                  <p className="mt-2 text-slate-600">{section.summary}</p>
                </div>
              </div>
              <SectionContent section={section} data={data} />
            </section>
          ))}
          {sections.length === 0 && <div className="card text-center text-slate-500">No sections match your search.</div>}
        </div>
      </div>
    </div>
  );
}
