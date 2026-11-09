"use client";

import Link from "next/link";
import { TeacherActivityDetail, teacherActivityStatuses } from "@/components/teacher-activity-detail";
import { TeacherSessionScoreSummary } from "@/components/teacher-assessment-summary";
import { TeacherStudentChecklist } from "@/components/teacher-student-checklist";
import { formatPublication } from "@/lib/gradebook";
import type { SessionAssessmentSummary } from "@/lib/teacher-assessment-summary";
import type { TeacherStudent } from "@/lib/teacher-activity";
import type { CompletionItem } from "@/lib/teacher-completion";

export function TeacherStudentWork({ student, situations, items, sessions }: {
  student: TeacherStudent;
  situations: { code: string; title: string }[];
  items: CompletionItem[];
  sessions: SessionAssessmentSummary;
}) {
  const studentPath = `/profesor/2bach/notas/${student.id}`;
  const hasPlan = items.some((item) => item.key === "SA1:plan" && item.records.length > 0);

  return <div className="mx-auto max-w-6xl space-y-5 p-5 sm:p-8">
    <header className="card p-5 sm:p-7">
      <Link href="/profesor/2bach/notas" className="text-sm font-bold text-[#1e6b4f] underline">Volver a Notas de todos</Link>
      <h1 className="mt-4 text-2xl font-extrabold">Entregas de SA1 y SA2</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Abre cada actividad para consultar lo que ha guardado el alumno. Puedes filtrar las que están pendientes o en curso.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={studentPath} prefetch={false} className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-bold text-[#164c3a]">Ver y modificar notas</Link>
        {hasPlan && <a href={studentPath + "/plan.pdf"} target="_blank" rel="noreferrer" className="rounded-xl bg-[#1e6b4f] px-4 py-2 text-sm font-bold text-white">Abrir plan guardado en PDF</a>}
      </div>
    </header>
    <TeacherStudentChecklist student={student} situations={situations} items={items}
      summary={<TeacherSessionScoreSummary summary={sessions} compact/>}
      renderRecord={(row, item) => {
        const details = item.key === "SA1:plan-reflection"
          ? { final_conclusions: row.details.final_conclusions, future_work: row.details.future_work }
          : row.details;
        return <>
          {row.date && Number.isFinite(Date.parse(row.date)) && <p className="mb-3 text-xs text-slate-500">
            Guardado el {formatPublication(row.date)}{row.status && ` · ${teacherActivityStatuses[row.status] ?? row.status}`}
          </p>}
          <TeacherActivityDetail value={details}/>
        </>;
      }}/>
  </div>;
}
