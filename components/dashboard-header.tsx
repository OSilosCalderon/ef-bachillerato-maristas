import Link from "next/link";
import { Bell } from "lucide-react";

export function DashboardHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 bg-white/75 px-5 py-6 backdrop-blur sm:px-8 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button aria-label="Notificaciones" className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600"><Bell size={19} /></button>
        <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cambiar vista</Link>
      </div>
    </header>
  );
}
