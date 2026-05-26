export default function Loading() {
  return (
    <div className="mx-auto flex max-w-xl items-center justify-center py-24" aria-live="polite">
      <div className="card w-full text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-clinic-100 border-t-clinic-600" />
        <p className="mt-4 font-semibold text-clinic-900">Loading LifeLine AI...</p>
        <p className="mt-2 text-sm text-slate-500">Preparing decision-support information securely.</p>
      </div>
    </div>
  );
}
