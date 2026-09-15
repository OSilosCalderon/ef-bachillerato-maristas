export function PercentCard({ label, percent, detail }: { label: string; percent: number | null; detail: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-sm font-bold text-slate-600">{label}</h3><p className="mt-3 text-3xl font-black text-slate-950">{percent == null ? "—" : `${percent}%`}</p>
    {percent != null && <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#1e6b4f]" style={{ width: `${percent}%` }} /></div>}
    <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
  </article>;
}
