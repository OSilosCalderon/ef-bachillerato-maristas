import Link from "next/link";
import { Bell } from "lucide-react";

export function DashboardHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="relative overflow-hidden border-b border-[#d9ccbc] bg-white/80 px-5 py-6 backdrop-blur sm:px-8">
      <div aria-hidden="true" className="absolute -right-12 -top-12 h-32 w-32 rotate-12 rounded-[2rem] border border-[#8b5e3c]/10 bg-[#ead7bd]/30" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">{eyebrow}</p>
            <span className="text-xs font-black uppercase tracking-[.12em] text-[#8b5e3c]">¿Te imaginas?</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Notificaciones" className="rounded-xl border border-[#d9ccbc] bg-white p-3 text-slate-600"><Bell size={19} /></button>
          <Link href="/" className="rounded-xl border border-[#d9ccbc] bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-[#fbf6ee]">Cambiar vista</Link>
        </div>
      </div>
    </header>
  );
}
