import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-bold text-clinic-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The requested page is unavailable. Visit the public showcase or return to the application home page.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link className="btn-primary" href="/docs">Open docs</Link>
          <Link className="btn-secondary" href="/">Return home</Link>
        </div>
      </div>
    </div>
  );
}
