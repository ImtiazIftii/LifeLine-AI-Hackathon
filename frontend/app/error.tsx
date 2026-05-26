"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-red-600">Connection issue</p>
        <h1 className="mt-3 text-3xl font-bold text-clinic-900">This page could not be loaded</h1>
        <p className="mt-3 text-slate-600">Please retry. Decision-support output must be successfully loaded and reviewed before any care action.</p>
        <div className="mt-7 flex justify-center gap-3">
          <button className="btn-primary" onClick={reset}>Try again</button>
          <Link className="btn-secondary" href="/">Return home</Link>
        </div>
      </div>
    </div>
  );
}
