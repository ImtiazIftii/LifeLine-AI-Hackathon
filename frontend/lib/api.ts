export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const DEMO_ROLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_ROLE_HEADER === "true"
  || (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_ROLE_HEADER !== "false");

export function apiAuthHeaders(role?: string): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("lifeline-token") : null;
  if (token) return { Authorization: `Bearer ${token}` };
  if (role && DEMO_ROLE_ENABLED) return { "x-demo-role": role };
  return {};
}

export async function api<T>(path: string, options: RequestInit = {}, role = "health_worker"): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...apiAuthHeaders(role),
      ...(options.headers || {})
    },
    cache: "no-store"
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || body.detail || "Request failed");
  }
  return response.json();
}
