import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
};

export function StatCard({ title, value, note, icon: Icon }: StatCardProps) {
  return (
    <article className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className="rounded-xl bg-[#e7f2ed] p-2.5 text-[#1e6b4f]"><Icon size={19} /></span>
      </div>
      <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </article>
  );
}
