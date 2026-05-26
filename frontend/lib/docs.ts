export type DocsBody = {
  lead?: string;
  bullets?: string[];
  steps?: string[];
  matrix?: string[][];
  diagram?: string[];
  endpoints?: string[][];
};

export type DocsSection = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: DocsBody;
  display_order: number;
  status: "draft" | "published";
  updated_at?: string;
};

export type TeamMember = {
  id: string;
  full_name: string;
  role: string;
  email: string;
  image_url: string;
  github_url: string;
  linkedin_url: string;
  display_order: number;
};

export type DocsMetrics = {
  users: number;
  patients_screened: number;
  alerts_generated: number;
  audited_activities: number;
  documented_apis: number;
  platform_features: number;
  data_classification: string;
  updated_at: string;
};

export type ChangelogEntry = {
  id: string;
  version: string;
  title: string;
  details: string;
  published_at: string;
};

export type PublicDocs = {
  sections: DocsSection[];
  team: TeamMember[];
  changelog: ChangelogEntry[];
  metrics: DocsMetrics;
  publication: { status: string; start_at: string; end_at: string };
  disclaimer: string;
};

export type DocsSettings = {
  id: string;
  is_enabled: boolean;
  visibility_override: boolean | null;
  start_at: string;
  end_at: string;
  updated_by: string;
  updated_at: string;
  availability: { visible: boolean; reason: string };
};

export function docsAsMarkdown(data: PublicDocs) {
  const lines = [
    "# LifeLine AI - Public Documentation",
    "",
    `> ${data.disclaimer}`,
    "",
    "## Live anonymized metrics",
    "",
    `- Patients screened: ${data.metrics.patients_screened}`,
    `- Alerts generated: ${data.metrics.alerts_generated}`,
    `- Audited activities: ${data.metrics.audited_activities}`,
    ""
  ];
  for (const section of data.sections) {
    lines.push(`## ${section.title}`, "", section.summary, "");
    if (section.body.lead) lines.push(section.body.lead, "");
    for (const item of section.body.bullets || section.body.steps || []) lines.push(`- ${item}`);
    if (section.body.matrix) {
      lines.push("", ...section.body.matrix.map((row) => `| ${row.join(" | ")} |`));
    }
    lines.push("");
  }
  return lines.join("\n");
}
