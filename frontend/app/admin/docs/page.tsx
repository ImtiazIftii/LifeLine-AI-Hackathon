"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DocsSection, DocsSettings, TeamMember } from "@/lib/docs";

type Version = { id: string; version_label: string; notes: string; created_at: string };
type SectionDraft = Omit<DocsSection, "body"> & { bodyText: string };

const emptyDraft: SectionDraft = {
  id: "", slug: "", title: "", category: "Pitch", summary: "",
  bodyText: '{\n  "lead": "",\n  "bullets": []\n}',
  display_order: 1, status: "draft"
};

function editShape(section: DocsSection): SectionDraft {
  return { ...section, bodyText: JSON.stringify(section.body, null, 2) };
}

function datetimeValue(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function docsAdminApi<T>(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("lifeline-token");
  if (!token) return Promise.reject(new Error("Sign in with a Docs Admin or Docs Super Admin account to manage this page."));
  return api<T>(path, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } }, "mother");
}

export default function DocsAdminPage() {
  const [settings, setSettings] = useState<DocsSettings | null>(null);
  const [sections, setSections] = useState<DocsSection[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [draft, setDraft] = useState<SectionDraft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const [settingsResult, sectionResult, teamResult] = await Promise.all([
        docsAdminApi<DocsSettings>("/api/docs/settings"),
        docsAdminApi<{ sections: DocsSection[]; versions: Version[] }>("/api/docs/sections"),
        docsAdminApi<TeamMember[]>("/api/docs/team")
      ]);
      setSettings(settingsResult);
      setSections(sectionResult.sections);
      setVersions(sectionResult.versions);
      setTeam(teamResult);
      setDraft((current) => current.id ? current : sectionResult.sections[0] ? editShape(sectionResult.sections[0]) : emptyDraft);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load docs management.");
    }
  }

  useEffect(() => { load(); }, []);

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    try {
      const saved = await docsAdminApi<DocsSettings>("/api/docs/settings", { method: "POST", body: JSON.stringify(settings) });
      setSettings(saved);
      setNotice("Visibility and schedule saved.");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Settings could not be saved.");
    }
  }

  async function persistDraft(publish = false) {
    try {
      const requestBody = { ...draft, body: JSON.parse(draft.bodyText), status: "draft" };
      const saved = draft.id
        ? await docsAdminApi<DocsSection>(`/api/docs/sections/${draft.id}`, { method: "PUT", body: JSON.stringify(requestBody) })
        : await docsAdminApi<DocsSection>("/api/docs/sections", { method: "POST", body: JSON.stringify(requestBody) });
      if (publish) {
        await docsAdminApi("/api/docs/publish", { method: "POST", body: JSON.stringify({ section_ids: [saved.id], version_label: `Published: ${saved.title}`, notes: "Published from the docs editor." }) });
      }
      setDraft(editShape({ ...saved, status: publish ? "published" : "draft" }));
      setNotice(publish ? "Section published and version recorded." : "Draft saved.");
      setError("");
      await load();
    } catch (reason) {
      setError(reason instanceof SyntaxError ? "Section body must be valid JSON." : reason instanceof Error ? reason.message : "Section could not be saved.");
    }
  }

  async function removeSection() {
    if (!draft.id) return;
    try {
      await docsAdminApi(`/api/docs/sections/${draft.id}`, { method: "DELETE" });
      setDraft(emptyDraft);
      setNotice("Section removed.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Section could not be removed.");
    }
  }

  async function moveSection(section: DocsSection, direction: -1 | 1) {
    const ordered = [...sections].sort((left, right) => left.display_order - right.display_order);
    const index = ordered.findIndex((item) => item.id === section.id);
    const other = ordered[index + direction];
    if (!other) return;
    try {
      await Promise.all([
        docsAdminApi(`/api/docs/sections/${section.id}`, { method: "PUT", body: JSON.stringify({ display_order: other.display_order, status: section.status }) }),
        docsAdminApi(`/api/docs/sections/${other.id}`, { method: "PUT", body: JSON.stringify({ display_order: section.display_order, status: other.status }) })
      ]);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Reordering failed.");
    }
  }

  async function publishAll() {
    try {
      await docsAdminApi("/api/docs/publish", { method: "POST", body: JSON.stringify({ section_ids: sections.map((section) => section.id), version_label: "Full showcase publication", notes: "All current sections published." }) });
      setNotice("All sections published.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Publication failed.");
    }
  }

  async function addTeamMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const member = await docsAdminApi<TeamMember>("/api/docs/team", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
      setTeam((current) => [...current, member]);
      form.reset();
      setNotice("Team member added.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Team member could not be added.");
    }
  }

  if (!settings) return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <p className="text-slate-600">{error || "Loading docs controls..."}</p>
      {error && <Link href="/auth" className="btn-primary mt-6">Sign in as docs admin</Link>}
    </div>
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-clinic-600">Admin / Super Admin Controls</p>
          <h1 className="mt-2 text-3xl font-bold text-clinic-900">Public docs editor</h1>
          <p className="mt-2 text-slate-600">Control the showcase and keep public output free of sensitive patient data.</p>
        </div>
        <Link className="btn-secondary" href="/docs">View public page</Link>
      </div>
      {(notice || error) && <div className={`rounded-xl border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-clinic-100 bg-clinic-50 text-clinic-800"}`}>{error || notice}</div>}

      <section className="card">
        <div className="mb-5 flex flex-wrap justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-clinic-900">Visibility and scheduling</h2>
            <p className="text-sm text-slate-600">Current state: <strong>{settings.availability.visible ? "Publicly visible" : "Not available"}</strong> ({settings.availability.reason})</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${settings.availability.visible ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{settings.availability.visible ? "ON" : "OFF"}</span>
        </div>
        <form className="grid gap-4 md:grid-cols-4" onSubmit={saveSettings}>
          <label className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
            <input type="checkbox" className="h-4 w-4" checked={settings.is_enabled} onChange={(event) => setSettings({ ...settings, is_enabled: event.target.checked })} />
            Schedule enabled
          </label>
          <div>
            <label>Immediate override</label>
            <select value={settings.visibility_override === null ? "" : String(settings.visibility_override)} onChange={(event) => setSettings({ ...settings, visibility_override: event.target.value === "" ? null : event.target.value === "true" })}>
              <option value="">Follow schedule</option><option value="true">Visible now</option><option value="false">Hidden now</option>
            </select>
          </div>
          <div><label>Public start</label><input type="datetime-local" value={datetimeValue(settings.start_at)} onChange={(event) => setSettings({ ...settings, start_at: new Date(event.target.value).toISOString() })} /></div>
          <div><label>Public end</label><input type="datetime-local" value={datetimeValue(settings.end_at)} onChange={(event) => setSettings({ ...settings, end_at: new Date(event.target.value).toISOString() })} /></div>
          <button className="btn-primary md:col-start-4" type="submit">Save visibility</button>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-[350px_minmax(0,1fr)]">
        <section className="card">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-clinic-900">Sections</h2><button className="text-sm font-semibold text-clinic-700" onClick={() => setDraft({ ...emptyDraft, display_order: sections.length + 1 })}>+ New</button></div>
          <button className="btn-primary mt-4 w-full" onClick={publishAll}>Publish all</button>
          <div className="mt-4 max-h-[680px] space-y-2 overflow-y-auto">
            {[...sections].sort((left, right) => left.display_order - right.display_order).map((section) => (
              <div className={`rounded-xl border p-3 ${draft.id === section.id ? "border-clinic-300 bg-clinic-50" : "border-slate-100"}`} key={section.id}>
                <button className="w-full text-left" onClick={() => setDraft(editShape(section))}><span className="block text-sm font-semibold text-clinic-900">{section.display_order}. {section.title}</span><span className="text-xs uppercase text-slate-500">{section.status} / {section.category}</span></button>
                <div className="mt-2 flex gap-2 text-xs font-semibold text-clinic-700"><button onClick={() => moveSection(section, -1)}>Move up</button><button onClick={() => moveSection(section, 1)}>Move down</button></div>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h2 className="text-xl font-bold text-clinic-900">{draft.id ? "Edit section" : "New section"}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><label>Title</label><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
            <div><label>Anchor slug</label><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></div>
            <div><label>Category</label><input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></div>
            <div><label>Order</label><input type="number" value={draft.display_order} onChange={(event) => setDraft({ ...draft, display_order: Number(event.target.value) })} /></div>
            <div className="sm:col-span-2"><label>Summary</label><textarea rows={2} value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></div>
            <div className="sm:col-span-2"><label>Structured content (JSON)</label><textarea className="font-mono" rows={14} value={draft.bodyText} onChange={(event) => setDraft({ ...draft, bodyText: event.target.value })} /><p className="mt-2 text-xs text-slate-500">Blocks: lead, bullets, steps, matrix, endpoints, and diagram.</p></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button className="btn-secondary" onClick={() => persistDraft(false)}>Save draft</button><button className="btn-primary" onClick={() => persistDraft(true)}>Publish section</button>{draft.id && <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-700" onClick={removeSection}>Delete</button>}</div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-bold text-clinic-900">Team directory</h2>
          <div className="mt-4 space-y-2 text-sm">{team.map((member) => <p className="rounded-xl bg-slate-50 p-3" key={member.id}><strong>{member.full_name}</strong> - {member.role}<br /><span className="text-slate-500">{member.email}</span></p>)}</div>
          <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={addTeamMember}>
            <div><label>Full name</label><input name="full_name" required /></div><div><label>Role</label><input name="role" required /></div>
            <div className="sm:col-span-2"><label>Email</label><input name="email" type="email" required /></div>
            <div><label>Profile picture URL</label><input name="image_url" /></div><div><label>GitHub URL</label><input name="github_url" /></div>
            <div><label>LinkedIn URL</label><input name="linkedin_url" /></div><button className="btn-primary sm:self-end" type="submit">Add member</button>
          </form>
        </section>
        <section className="card">
          <h2 className="text-xl font-bold text-clinic-900">Version history</h2>
          <p className="mt-2 text-sm text-slate-600">Publication snapshots are recorded here. Content rollback is a future control.</p>
          <div className="mt-5 space-y-3">{versions.map((version) => <article className="rounded-xl border border-slate-100 p-4" key={version.id}><div className="flex justify-between gap-3"><strong>{version.version_label}</strong><time className="text-xs text-slate-500">{new Date(version.created_at).toLocaleString()}</time></div><p className="mt-2 text-sm text-slate-600">{version.notes}</p></article>)}</div>
        </section>
      </div>
    </div>
  );
}
