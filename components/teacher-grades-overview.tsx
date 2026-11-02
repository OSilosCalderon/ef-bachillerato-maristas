"use client";

import Link from "next/link";
import { useState } from "react";
import { formatGrade, formatPublication, gradesForStudent, type TeacherGradesOverviewData } from "@/lib/gradebook";

const searchable = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");

export function TeacherGradesOverview({ data }: { data: TeacherGradesOverviewData }) {
  const [group, setGroup] = useState("");
  const [search, setSearch] = useState("");
  const groups = [...new Set(data.students.map((student) => student.group))].sort((a, b) => a.localeCompare(b, "es"));
  const query = searchable(search.trim());
  const rows = data.students.filter((student) => (!group || student.group === group) && searchable(student.name).includes(query)).map((student) => ({
    student,
    entries: gradesForStudent(data.items, data.grades, student.id, student.courseId).filter((entry) => entry.grade),
    sessions: data.sessionGrades.filter((session) => session.studentId === student.id).sort((a, b) => a.number - b.number),
  }));
  const published = rows.reduce((total, row) => total + row.entries.length + row.sessions.length, 0);

  return <div className="space-y-5">
    <section className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-[#1e6b4f]">Profesorado · 2º Bachillerato</p><h1 className="mt-2 text-2xl font-extrabold">Notas de todos</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Consulta las notas publicadas de todo el alumnado. Abre un alumno para ver sus calificaciones tal como las ve él y modificar notas o comentarios.</p></div>
        <button type="button" onClick={() => window.location.reload()} className="rounded-xl border px-4 py-2 text-sm font-bold">Actualizar notas</button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">Grupo<select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="">Todos los grupos de 2º</option>{groups.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="text-sm font-bold">Buscar alumno/a<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o apellidos" className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/></label>
      </div>
      <p role="status" className="mt-4 text-sm font-semibold text-[#164c3a]">{rows.length} de {data.students.length} alumnos/as · {published} calificaciones publicadas</p>
      <p className="mt-2 text-xs text-slate-500">Datos consultados el {formatPublication(data.loadedAt)}. Las notas pendientes se muestran en la vista individual.</p>
    </section>
    {!rows.length ? <p className="card p-6 text-sm text-slate-600">{data.students.length ? "No hay alumnos que coincidan con los filtros." : "No hay alumnado activo de 2º de Bachillerato."}</p> : <section aria-label="Notas del alumnado de 2º" className="space-y-4">
      {rows.map(({ student, entries, sessions }) => <article key={student.id} className="card grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(10rem,1fr)_minmax(14rem,2fr)_minmax(12rem,1.5fr)]">
        <div><h2 className="break-words text-lg font-extrabold">{student.name}</h2><p className="mt-1 text-sm text-slate-500">{student.group}</p><Link prefetch={false} href={`/profesor/2bach/notas/${student.id}`} aria-label={`Ver y modificar notas de ${student.name}`} className="mt-4 inline-block rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white">Ver y modificar notas</Link></div>
        <div><h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Notas por instrumento</h3>{!entries.length ? <p className="mt-3 text-sm text-slate-500">Sin calificaciones publicadas.</p> : <ul className="mt-3 space-y-2">{entries.map(({ item, grade }) => <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm"><span className="min-w-0 break-words"><span className="mr-2 font-bold text-[#1e6b4f]">{item.sa_code}</span>{item.title}</span><strong className="shrink-0 text-[#164c3a]">{formatGrade(grade!.score)}/10</strong></li>)}</ul>}</div>
        <div><h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Sesiones · SA2</h3>{!sessions.length ? <p className="mt-3 text-sm text-slate-500">Sin sesiones calificadas.</p> : <ul className="mt-3 flex flex-wrap gap-2">{sessions.map((session) => <li key={session.number} className={`rounded-xl px-3 py-2 text-sm ${session.absent ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-[#164c3a]"}`}><span className="block text-xs">Sesión {session.number}</span><strong>{formatGrade(session.score)}/10</strong>{session.absent && <span className="mt-1 block text-[10px] font-extrabold">AUSENCIA</span>}</li>)}</ul>}</div>
      </article>)}
    </section>}
  </div>;
}
