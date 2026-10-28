import Link from "next/link";
import { ArrowUpRight, MessageSquareText } from "lucide-react";
import { reflectionPath } from "@/lib/final-physical-reflection";
import { loadFinalPhysicalReflection } from "@/lib/final-physical-reflection-server";

export async function FinalPhysicalReflectionCard({ year }: { year: 1 | 2 }) {
  let status = "Pendiente de realizar";
  try { const row = await loadFinalPhysicalReflection(year); status = row?.status === "submitted" ? "Enviada · 100%" : row ? "Borrador · en curso" : status; }
  catch { status = "Abre la reflexión para consultar su estado"; }
  return <section className="card border-emerald-200 p-5 sm:p-7" aria-label="Reflexión personal y motivaciones de futuro">
    <div className="flex items-start gap-3"><span className="rounded-xl bg-emerald-50 p-3 text-[#1e6b4f]"><MessageSquareText size={23}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-[#1e6b4f]">{year}º Bachillerato · {year === 1 ? "SA1" : "SA2"} · Evaluación física final</p><h2 className="mt-2 text-xl font-extrabold">Reflexión personal y motivaciones de futuro</h2><p className="mt-2 text-sm leading-6 text-slate-600">Interpreta tu evolución, revisa tus objetivos y decide cómo seguir haciendo actividad física.</p></div></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-[#164c3a]">{status}</span><Link href={reflectionPath(year)} className="inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white">Abrir mi reflexión<ArrowUpRight size={17}/></Link></div>
  </section>;
}
