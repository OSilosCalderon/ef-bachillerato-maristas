import Link from "next/link";
import { Bell } from "lucide-react";
import { CoursePoster } from "@/components/course-poster";

export function DashboardHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="relative overflow-hidden border-b border-[#d9ccbc] bg-white/80 px-5 py-6 backdrop-blur sm:px-8">
      <div aria-hidden="true" className="absolute -right-12 -top-12 h-32 w-32 rotate-12 rounded-[2rem] border border-[#8b5e3c]/10 bg-[#ead7bd]/30" />
      <div className="relative grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">{eyebrow}</p>
            <span className="text-xs font-black uppercase tracking-[.12em] text-[#8b5e3c]">Lema 2026/2027</span>
          </div>
          <h1 className="mt-1 break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-1 max-w-3xl break-words text-sm text-slate-500">{description}</p>
        </div>
        <div className="dashboard-poster-wrap">
          <CoursePoster compact />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button aria-label="Notificaciones" className="rounded-xl border border-[#d9ccbc] bg-white p-3 text-slate-600"><Bell size={19} /></button>
          <Link href="/" className="rounded-xl border border-[#d9ccbc] bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-[#fbf6ee]">Cambiar vista</Link>
        </div>
      </div>
    </header>
  );
}
