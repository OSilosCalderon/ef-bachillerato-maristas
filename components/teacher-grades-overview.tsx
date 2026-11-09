"use client";

import Link from "next/link";
import { useState } from "react";
import { formatGrade, formatPublication, gradesForStudent, type TeacherGradesOverviewData } from "@/lib/gradebook";
import type { CompletionState } from "@/lib/teacher-completion";
import type { SecondYearWorkSummary } from "@/lib/second-year-work";

const searchable = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
const count = ({ done, total }: { done: number; total: number }) => total ? `${done}/${total}` : "—";
const mark = (value: number | null) => value === null ? "—" : formatGrade(value) + "/10";
const planLabels: Record<SecondYearWorkSummary["plan"], string> = {
  pending: "Pendiente", draft: "Borrador", active: "En marcha", completed: "Finalizado",
};
const conclusionsLabels: Record<CompletionState, string> = {
  pending: "Pendientes", in_progress: "Parciales", completed: "Completas", untracked: "Sin seguimiento",
};
const reflectionLabels: Record<CompletionState, string> = {
  pending: "Pendiente", in_progress: "Borrador", completed: "Entregada", untracked: "Sin seguimiento",
};

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-wrap items-baseline justify-between gap-x-2">
    <dt className="text-xs leading-5 text-slate-600">{label}</dt>
    <dd className="font-bold tabular-nums text-slate-950">{value}</dd>
  </div>;
}

export function TeacherGradesOverview({ data }: { data: TeacherGradesOverviewData }) {
  const [group, setGroup] = useState("");
  const [search, setSearch] = useState("");
  const groups = [...new Set(data.students.map((student) => student.group))].sort((a, b) => a.localeCompare(b, "es"));
  const query = searchable(search.trim());
  const rows = data.students.filter((student) => (!group || student.group === group) && searchable(student.name).includes(query)).map((student) => ({
    student,
    work: data.work[student.id],
    entries: gradesForStudent(data.items, data.grades, student.id, student.courseId).flatMap(({ item, grade }) => grade ? [{ item, grade }] : []),
    sessions: data.sessionGrades.filter((session) => session.studentId === student.id).sort((a, b) => a.number - b.number),
  }));
  const published = rows.reduce((total, row) => total + row.entries.length + row.sessions.length, 0);

  return <div className="space-y-5">
    <section className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1e6b4f]">Profesorado · 2º Bachillerato</p>
          <h1 className="mt-2 text-2xl font-extrabold">Notas de todos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Consulta el trabajo de SA1 y SA2 por alumno. Abre sus entregas o la vista de calificaciones para editar las notas publicadas.</p>
        </div>
        <button type="button" onClick={() => window.location.reload()} className="rounded-xl border px-4 py-2 text-sm font-bold">Actualizar notas</button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">Grupo<select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="">Todos los grupos de 2º</option>{groups.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="text-sm font-bold">Buscar alumno/a<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o apellidos" className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/></label>
      </div>
      <p role="status" className="mt-4 text-sm font-semibold text-[#164c3a]">{rows.length} de {data.students.length} alumnos/as · {published} calificaciones publicadas</p>
      <p className="mt-2 text-xs leading-5 text-slate-600">Las fracciones indican registros sobre el total solicitado. La media de autoevaluación usa la mejor nota guardada de cada tema realizado. La media docente de sesiones excluye las ausencias. Datos consultados el {formatPublication(data.loadedAt)}.</p>
    </section>
    {!rows.length ? <p className="card p-6 text-sm text-slate-600">{data.students.length ? "No hay alumnos que coincidan con los filtros." : "No hay alumnado activo de 2º de Bachillerato."}</p> :
      <section className="card overflow-hidden" aria-label="Notas y entregas del alumnado de 2º">
        <p className="px-4 pt-3 text-xs text-slate-500 xl:hidden">Desplaza la tabla para ver todas las columnas.</p>
        <div tabIndex={0} role="region" aria-label="Tabla de seguimiento de SA1 y SA2" className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <caption className="sr-only">Seguimiento individual y medias de SA1 y SA2</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-700">
              <tr>{["Alumno/a", "Pruebas y cuestionarios", "Teoría", "Sesiones · SA2", "Plan y cierre", "Notas publicadas"].map((label) =>
                <th key={label} scope="col" className="px-3 py-3 font-extrabold">{label}</th>,
              )}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ student, work, entries, sessions }) => {
                const studentPath = `/profesor/2bach/notas/${student.id}`;
                const scores = entries.filter(({ item }) => item.sa_code === "SA1" || item.sa_code === "SA2").map(({ grade }) => grade.score);
                const publishedMean = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
                return <tr key={student.id} className="align-top even:bg-slate-50/50">
                  <th scope="row" className="w-[18%] px-3 py-4">
                    <p className="break-words font-extrabold">{student.name}</p>
                    <p className="mt-1 text-xs font-normal text-slate-500">{student.group}</p>
                    <div className="mt-2 flex flex-col items-start gap-1.5 text-xs font-bold text-[#164c3a]">
                      <Link href={studentPath + "/trabajo"} prefetch={false} aria-label={`Ver entregas de SA1 y SA2 de ${student.name}`} className="underline">Ver entregas de SA1 y SA2</Link>
                      <Link href={studentPath} prefetch={false} aria-label={`Ver y modificar notas de ${student.name}`} className="underline">Ver y modificar notas</Link>
                    </div>
                  </th>
                  <td className="px-3 py-4"><dl className="space-y-1">
                    <Metric label="Test físicos iniciales" value={count(work.physical.initial)}/>
                    <Metric label="Test físicos finales" value={count(work.physical.final)}/>
                    <Metric label="Cuestionarios iniciales" value={count(work.questionnaires.initial)}/>
                    <Metric label="Cuestionarios finales" value={count(work.questionnaires.final)}/>
                  </dl></td>
                  <td className="px-3 py-4"><dl className="space-y-1">
                    <Metric label="Lecturas" value={count(work.readings)}/>
                    <Metric label="Autoevaluaciones" value={count(work.quizzes)}/>
                    <Metric label="Media" value={mark(work.quizzes.mean)}/>
                  </dl></td>
                  <td className="px-3 py-4"><dl className="space-y-1">
                    <Metric label="Media docente" value={mark(work.sessions.mean)}/>
                    <Metric label="Valoradas por el profesor" value={`${work.sessions.graded + work.sessions.absences}/${work.sessions.total}`}/>
                    <Metric label="Valoradas por el alumno" value={`${work.sessions.points}/${work.sessions.total}`}/>
                    {work.sessions.absences > 0 && <Metric label={`${work.sessions.graded} con nota · ausencias`} value={String(work.sessions.absences)}/>}
                  </dl></td>
                  <td className="px-3 py-4">
                    <dl className="space-y-1">
                      <Metric label="Plan personal" value={planLabels[work.plan]}/>
                      <Metric label="Conclusiones del plan" value={conclusionsLabels[work.conclusions]}/>
                      <Metric label="Valoración final" value={reflectionLabels[work.finalReflection]}/>
                    </dl>
                    {work.plan !== "pending" && <a href={studentPath + "/plan.pdf"} target="_blank" rel="noreferrer" aria-label={`Abrir plan guardado en PDF de ${student.name}`} className="mt-2 inline-block text-xs font-bold text-[#164c3a] underline">Abrir plan en PDF</a>}
                  </td>
                  <td className="max-w-48 px-3 py-4">
                    <dl><Metric label="Media SA1 y SA2" value={mark(publishedMean)}/></dl>
                    <p className="text-xs text-slate-600">{scores.length} notas por instrumento</p>
                    {(entries.length > 0 || sessions.length > 0) && <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-bold text-[#164c3a]">Desglose de notas</summary>
                      <ul className="mt-2 space-y-2 text-xs">
                        {entries.map(({ item, grade }) => <li key={item.id} className="break-words"><span className="text-slate-600">{item.sa_code} · {item.title}</span> <strong className="whitespace-nowrap">{formatGrade(grade.score)}/10</strong></li>)}
                        {sessions.map((session) => <li key={session.number}><span className="text-slate-600">Sesión {session.number}</span> <strong>{formatGrade(session.score)}/10</strong>{session.absent && <span className="ml-1 text-[10px] font-extrabold text-rose-800">AUSENCIA</span>}</li>)}
                      </ul>
                    </details>}
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>}
  </div>;
}
