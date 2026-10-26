"use client";

import { useState } from "react";
import { GradePublicationForm } from "@/components/teacher-gradebook";
import { formatGrade, type PublishedAssessmentGrade } from "@/lib/gradebook";
import type { SessionAssessmentSummary, TeacherBlockScore } from "@/lib/teacher-assessment-summary";

export function TeacherSessionScoreSummary({ summary, compact = false }: { summary: SessionAssessmentSummary; compact?: boolean }) {
  return <div aria-label={`Resumen de calificación de sesiones · ${summary.sa}`} className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${compact ? "mt-3" : "mt-5"}`}>
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
      <p className="text-xs font-bold text-[#164c3a]">{summary.sa} · Media de sesiones del profesor</p>
      <p className={`mt-1 font-extrabold text-[#164c3a] ${compact ? "text-lg" : "text-2xl"}`}>{summary.mean === null ? "Sin calificar" : `${formatGrade(summary.mean)}/10`}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-600">{summary.graded} sesiones con nota · {summary.absences} ausencias excluidas</p>
    </div>
    <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
      <p className="text-xs font-bold text-sky-900">{summary.sa} · Valoraciones del alumno</p>
      <p className={`mt-1 font-extrabold text-sky-900 ${compact ? "text-lg" : "text-2xl"}`}>{summary.points}/{summary.total} puntos</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-600">1 punto por sesión valorada · {summary.total-summary.points} pendientes</p>
    </div>
  </div>;
}

export function TeacherBlockScores({ entries, summary, studentId, compact = false, onPublished }: {
  entries: TeacherBlockScore[]; summary: SessionAssessmentSummary; studentId: string; compact?: boolean;
  onPublished?: (grade: PublishedAssessmentGrade) => void;
}) {
  const [editing,setEditing] = useState<string | null>(null);
  const visible = compact ? entries.filter((entry) => entry.worked || entry.grade || (entry.item.item_key === "session-follow-up" && entry.item.sa_code === summary.sa)) : entries;
  const selected = entries.find((entry) => entry.item.id === editing);
  if (!visible.length) return null;
  return <section aria-label="Notas por bloque" className={compact ? "mt-3" : "mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"}>
    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Notas por bloque</h4>
    {!compact && <p className="mt-1 text-xs leading-5 text-slate-500">Consulta o publica cada nota. Los puntos de las valoraciones se calculan automáticamente; la media docente excluye AUSENCIA. Una tarea realizada sin nota aparece sin calificar.</p>}
    <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map(({item,grade,worked}) => {
        const followUp = item.item_key === "session-follow-up" && item.sa_code === summary.sa;
        return <div key={item.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-bold text-[#1e6b4f]">{item.sa_code}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-700">{item.title}</p>
          {followUp && <p className="mt-1 text-lg font-extrabold text-sky-900">{summary.points}/{summary.total} puntos</p>}
          <p className={`${followUp ? "mt-1 text-xs" : "mt-2 text-lg"} font-extrabold ${grade ? "text-[#164c3a]" : "text-slate-500"}`}>{grade ? `${followUp ? "Nota publicada: " : ""}${formatGrade(grade.score)}/10` : followUp ? "Nota final sin publicar" : "Sin calificar"}</p>
          {!compact && <>
            <p className="mt-1 text-[11px] text-slate-500">{followUp ? "1 punto por valoración de sesión" : grade ? "Nota publicada por el profesor" : worked ? "Trabajo registrado · falta la nota" : "Sin trabajo registrado"}</p>
            {grade?.comment && <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">{grade.comment}</p>}
            {onPublished && <button type="button" aria-expanded={editing === item.id} onClick={() => setEditing(editing === item.id ? null : item.id)} className="mt-3 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-[#164c3a]">{editing === item.id ? "Cerrar edición" : grade ? "Editar nota" : "Poner nota"}</button>}
          </>}
        </div>;
      })}
    </div>
    {!compact && selected && onPublished && <div className="mt-4"><GradePublicationForm key={`${studentId}-${selected.item.id}`} item={selected.item} studentId={studentId} grade={selected.grade} onPublished={onPublished}/></div>}
  </section>;
}
