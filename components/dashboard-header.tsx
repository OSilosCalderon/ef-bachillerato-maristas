import Link from "next/link";
import { ArrowUpRight, Bell } from "lucide-react";

export function DashboardHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="hero-surface relative overflow-hidden border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
      <div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 bg-[#b8f34a]/10" />
      <div className="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="accent-kicker text-xs font-black uppercase tracking-[.2em]">{eyebrow}</p>
          <h1 className="mt-2 max-w-4xl break-words text-3xl font-black tracking-[-.035em] text-white sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-emerald-50/75 sm:text-base">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <button aria-label="Notificaciones" className="rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur"><Bell size={19} /></button>
          <Link href="/" className="accent-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black">Cambiar vista <ArrowUpRight size={17}/></Link>
        </div>
      </div>
    </header>
  );
}

