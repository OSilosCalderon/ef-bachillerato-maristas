"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Clock3, Info } from "lucide-react";
import { activityCategories, type TeacherActivity, type TeacherStudent } from "@/lib/teacher-activity";
import { completionTotals, type CompletionItem, type CompletionState } from "@/lib/teacher-completion";

const stateLabels: Record<CompletionState, string> = { completed: "Completado", in_progress: "En curso", pending: "Pendiente", untracked: "Sin seguimiento digital" };
const stateClasses: Record<CompletionState, string> = { completed: "bg-emerald-100 text-emerald-800", in_progress: "bg-amber-100 text-amber-900", pending: "bg-slate-100 text-slate-600", untracked: "bg-sky-50 text-sky-800" };
const score = (value: number) => new Intl.NumberFormat("es-ES", {maximumFractionDigits:1}).format(value);

function StateIcon({ state }: { state: CompletionState }) {
  const Icon = state === "completed" ? CheckCircle2 : state === "in_progress" ? Clock3 : state === "untracked" ? Info : Circle;
  return <Icon aria-hidden="true" size={19} className={`mt-0.5 shrink-0 ${state === "completed" ? "text-emerald-600" : state === "in_progress" ? "text-amber-600" : "text-slate-400"}`}/>;
}
export function TeacherStudentChecklist({ student, items, situations, renderRecord }: {
  student: TeacherStudent; items: CompletionItem[]; situations: { code: string; title: string }[];
  renderRecord: (row: TeacherActivity) => ReactNode;
}) {
  const [pendingOnly, setPendingOnly] = useState(false);
  const totals = completionTotals(items);
  const codes = [...new Set([...situations.map((row) => row.code), ...items.map((item) => item.sa)])].sort();
  return <section aria-label={`Ficha completa de ${student.name}`} className="space-y-5">
    <header className="card border-emerald-200 p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-[#1e6b4f]">Ficha individual · {student.group}</p>
      <h2 className="mt-2 text-2xl font-extrabold">{student.name}</h2>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-2"><p className="text-sm text-slate-600"><strong className="text-lg text-slate-950">{totals.completed} de {totals.total}</strong> tareas completadas</p><strong className="text-2xl text-[#1e6b4f]">{totals.percent}%</strong></div>
      <div role="progressbar" aria-label="Tareas completadas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={totals.percent} className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{width:`${totals.percent}%`}}/></div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center"><p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><strong className="block text-xl">{totals.completed}</strong>Completadas</p><p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><strong className="block text-xl">{totals.inProgress}</strong>En curso</p><p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600"><strong className="block text-xl">{totals.pending}</strong>Pendientes</p></div>
      <p className="mt-3 text-xs leading-5 text-slate-500">El progreso se calcula sobre lo solicitado, incluidas las tareas sin registro. Un test respondido cuenta como realizado aunque su puntuación sea baja. Estos porcentajes no son una nota.</p>
      {totals.untracked > 0 && <p className="mt-3 rounded-xl bg-sky-50 p-3 text-xs leading-5 text-sky-900">{totals.untracked} actividades no disponen todavía de seguimiento digital. Se muestran aparte y no se contabilizan como pendientes ni completadas.</p>}
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={pendingOnly} onChange={(event) => setPendingOnly(event.target.checked)} className="h-4 w-4 accent-emerald-700"/>Mostrar solo pendientes y en curso</label>
    </header>
    {codes.map((sa) => {
      const all = items.filter((item) => item.sa === sa);
      const total = completionTotals(all);
      const visible = all.filter((item) => !pendingOnly || item.state === "pending" || item.state === "in_progress");
      const categories = [...new Set(visible.map((item) => item.category))];
      return <section key={sa} aria-label={`Trabajo solicitado en ${sa}`} className="card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[#1e6b4f]">{sa}</p><h3 className="mt-1 text-xl font-extrabold">{situations.find((row) => row.code === sa)?.title ?? sa}</h3></div><span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-[#164c3a]">{total.completed}/{total.total} completadas · {total.percent}%</span></div>
        {!all.length && <p className="mt-4 text-sm text-slate-500">No hay instrumentos de seguimiento configurados para esta situación.</p>}
        {all.length > 0 && !visible.length && <p className="mt-4 text-sm font-semibold text-emerald-700">No hay tareas pendientes en esta situación.</p>}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">{categories.map((category) => <div key={category} className="min-w-0"><h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">{activityCategories[category]}</h4><div className="divide-y divide-slate-100 rounded-xl border border-slate-200">{visible.filter((item) => item.category === category).map((item) => <details key={item.key} className="group min-w-0 p-3 sm:p-4">
          <summary className="flex cursor-pointer list-none items-start gap-2.5"><StateIcon state={item.state}/><div className="min-w-0 flex-1"><p className="text-sm font-bold leading-5 text-slate-800">{item.title}</p><div className="mt-2 flex flex-wrap items-center gap-1.5"><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${stateClasses[item.state]}`}>{stateLabels[item.state]}</span>{!item.requested && <span className="text-[11px] text-slate-500">Registro adicional</span>}{item.records[0]?.score !== null && item.records[0]?.score !== undefined && <span className="text-xs font-semibold text-slate-600">{score(item.records[0].score)} {item.records[0].scoreLabel ?? ""}</span>}{item.evaluation && <span className="text-xs font-bold text-[#164c3a]">Nota: {score(item.evaluation.score)}/10</span>}{item.evaluation?.absent && <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-extrabold text-rose-800">AUSENCIA</span>}</div><p className="mt-2 text-[11px] font-semibold text-[#1e6b4f]">Ver detalle <span aria-hidden="true">↓</span></p></div></summary>
          <div className="mt-4 space-y-4 border-t border-slate-100 pt-3 text-sm">
            {item.state === "untracked" && <p className="rounded-xl bg-sky-50 p-3 text-sky-900">Esta pantalla todavía no guarda entregas en la plataforma. Aquí no se puede confirmar si el alumno ha realizado la actividad.</p>}
            {!item.records.length && item.state !== "untracked" && <p className="text-slate-500">No hay una respuesta o entrega guardada para esta tarea.</p>}
            {item.evaluation?.comment && <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs font-bold text-[#164c3a]">Comentario del profesor</p><p className="mt-1 whitespace-pre-wrap break-words">{item.evaluation.comment}</p></div>}
            {item.sessionNumber && <Link href={`/profesor/calificar-sesiones?alumno=${student.id}#sesion-${item.sessionNumber}`} className="inline-block rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-[#164c3a]">Calificar sesión {item.sessionNumber}</Link>}
            {item.records.map((row) => <div key={row.id} className="min-w-0 rounded-xl bg-slate-50 p-3">{renderRecord(row)}</div>)}
          </div>
        </details>)}</div></div>)}</div>
      </section>;
    })}
  </section>;
}

