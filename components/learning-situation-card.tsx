import Link from "next/link";
import { ArrowRight, Dumbbell, HeartPulse, Sparkles } from "lucide-react";
import type { LearningSituation } from "@/lib/types";
import { ProgressBar } from "@/components/ui/progress-bar";

const icons = { SA1: HeartPulse, SA2: Dumbbell, SA3: Sparkles };

export function LearningSituationCard({ situation }: { situation: LearningSituation }) {
  const Icon = icons[situation.code];
  return (
    <article className="card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <span className="rounded-full bg-[#e7f2ed] px-3 py-1 text-xs font-bold tracking-wider text-[#1e6b4f]">
          {situation.code}
        </span>
        <span className="rounded-2xl border border-slate-200 p-3 text-[#1e6b4f]"><Icon size={23} /></span>
      </div>
      <h3 className="text-xl font-extrabold leading-tight text-slate-900">{situation.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{situation.description}</p>
      <div className="mt-6"><ProgressBar value={situation.progress} label="Tu progreso" /></div>
      <Link href={situation.href} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#164c3a]">
        Entrar <ArrowRight size={17} className="transition group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
