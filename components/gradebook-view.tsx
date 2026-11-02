import Link from "next/link";
import type { ReactNode } from "react";
import { formatGrade, formatPublication, gradesForStudent, type AssessmentGradeItem, type PublishedAssessmentGrade, type StudentGradebookData, type StudentSessionGrade } from "@/lib/gradebook";

export function GradebookView({ data, showStudentLinks = true, assessmentActions, sessionActions }: {
  data: StudentGradebookData;
  showStudentLinks?: boolean;
  assessmentActions?: (entry: { item: AssessmentGradeItem; grade: PublishedAssessmentGrade | null }) => ReactNode;
  sessionActions?: (session: StudentSessionGrade) => ReactNode;
}) {
  const entries = gradesForStudent(data.items, data.grades, data.studentId, data.courseId);
  const situations = [...new Set(entries.map((entry) => entry.item.sa_code))].sort();

  return <>
    {!data.grades.length && !data.sessionGrades.length && <p className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-900">Aún no tienes calificaciones publicadas. Cuando el profesor publique una nota, podrás verla aquí con su comentario.</p>}
    {situations.map((sa) => {
      const rows = entries.filter((entry) => entry.item.sa_code === sa);
      const title = data.situations.find((entry) => entry.code === sa)?.title;
      return <section key={sa} className="space-y-4">
        <div><p className="text-sm font-bold text-[#1e6b4f]">{sa}</p><h2 className="mt-1 text-xl font-extrabold">{title ?? `Situación de aprendizaje ${sa.slice(2)}`}</h2><p className="mt-2 text-sm text-slate-500">{rows.filter((row) => row.grade).length}/{rows.length} calificaciones publicadas</p></div>
        <div className="grid gap-4 md:grid-cols-2">{rows.map(({ item, grade }) => <article key={item.id} className="card min-w-0 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><h3 className="font-extrabold">{item.title}</h3>{grade ? <p className="shrink-0 text-2xl font-extrabold text-[#1e6b4f]">{formatGrade(grade.score)}<span className="text-sm text-slate-500">/10</span></p> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Pendiente</span>}</div>
          {grade ? <>
            <p className="mt-3 text-xs text-slate-500">Publicada el {formatPublication(grade.published_at)}</p>
            {grade.comment && <div className="mt-4 rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">Comentario del profesor</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{grade.comment}</p></div>}
          </> : <p className="mt-3 text-sm text-slate-500">El profesor todavía no ha publicado la calificación de este instrumento.</p>}
          {assessmentActions?.({ item, grade })}
        </article>)}</div>
      </section>;
    })}
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-[#1e6b4f]">{data.year === 1 ? "SA1" : "SA2"} · Seguimiento</p><h2 className="mt-1 text-xl font-extrabold">Calificaciones de mis sesiones</h2></div>{showStudentLinks && <Link href={data.year === 1 ? "/alumno/sa1/seguimiento" : "/alumno/2bach/sa2/seguimiento"} className="text-sm font-bold text-[#1e6b4f] underline">Ver mi seguimiento</Link>}</div>
      {!data.sessionGrades.length ? <p className="card p-5 text-sm text-slate-500">Todavía no hay sesiones calificadas por el profesor.</p> : <div className="grid gap-4 md:grid-cols-2">{data.sessionGrades.map((session) => <article key={session.number} className="card p-5">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Sesión {session.number}</h3>{session.absent && <span className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800">AUSENCIA</span>}</div><strong className="text-xl text-[#1e6b4f]">{formatGrade(session.score)}/10</strong></div>
        <p className="mt-2 text-xs text-slate-500">Publicada el {formatPublication(session.date)}</p>
        {session.comment && <div className="mt-3 rounded-xl bg-emerald-50 p-3"><p className="text-xs font-bold text-[#1e6b4f]">Comentario del profesor</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{session.comment}</p></div>}
        {sessionActions?.(session)}
      </article>)}</div>}
    </section>
  </>;
}
