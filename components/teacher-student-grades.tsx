"use client";

import Link from "next/link";
import { useState } from "react";
import { GradebookView } from "@/components/gradebook-view";
import { GradePublicationForm } from "@/components/teacher-gradebook";
import { TeacherSessionEvaluationForm } from "@/components/teacher-session-grading";
import type { GradebookStudent, StudentGradebookData } from "@/lib/gradebook";

export function TeacherStudentGrades({ student, data }: { student: GradebookStudent; data: StudentGradebookData }) {
  const [grades, setGrades] = useState(data.grades);
  const [sessionGrades, setSessionGrades] = useState(data.sessionGrades);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  return <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
    <section className="card p-5 sm:p-7">
      <Link href="/profesor/2bach/notas" className="text-sm font-bold text-[#1e6b4f] underline">Volver a Notas de todos</Link>
      <p className="mt-5 text-xs font-bold uppercase tracking-widest text-[#1e6b4f]">Vista del alumno · 2º Bachillerato</p><h1 className="mt-2 text-2xl font-extrabold">Mis calificaciones</h1><p className="mt-2 font-bold text-slate-800">{student.name} · {student.group}</p><p className="mt-3 text-sm leading-6 text-slate-600">Estas son las notas y los comentarios que ve este alumno. Pulsa «Modificar nota» para corregir una calificación publicada. Al guardar, el alumno verá la actualización.</p>
      <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => window.location.reload()} className="rounded-xl border px-4 py-2 text-sm font-bold">Actualizar notas del alumno</button><Link href={`/profesor/calificaciones?curso=2&alumno=${student.id}`} className="rounded-xl border px-4 py-2 text-sm font-bold">Publicar una nueva calificación</Link></div>
    </section>
    {message && <p role="status" className="rounded-xl bg-emerald-100 p-4 text-sm font-bold text-emerald-900">{message}</p>}
    <GradebookView data={{ ...data, grades, sessionGrades }} showStudentLinks={false}
      assessmentActions={({ item, grade }) => grade && <div className="mt-4 border-t border-slate-100 pt-4">
        {editing === item.id ? <GradePublicationForm key={`${student.id}-${item.id}`} embedded item={item} studentId={student.id} grade={grade} onCancel={() => setEditing(null)} onPublished={(value) => {
          setGrades((current) => current.map((entry) => entry.id === value.id ? value : entry));
          setMessage(`Calificación de «${item.title}» actualizada. El alumno ya puede consultarla.`);
          setEditing(null);
        }}/> : <button type="button" aria-label={`Modificar nota de ${item.title}`} onClick={() => { setEditing(item.id); setMessage(""); }} className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-bold text-[#164c3a]">Modificar nota</button>}
      </div>}
      sessionActions={(session) => {
        const key = `session-${session.number}`;
        return <div className="mt-4 border-t border-slate-100 pt-4">{editing === key ? <TeacherSessionEvaluationForm key={`${student.id}-${key}`} courseYear={2} studentId={student.id} sessionNumber={session.number} initialScore={session.score} initialComment={session.comment} initialAbsent={session.absent} onCancel={() => setEditing(null)} onSaved={(value) => {
          setSessionGrades((current) => current.map((entry) => entry.number === session.number ? { ...entry, score: value.score, comment: value.comment, absent: value.absent, date: value.updatedAt } : entry));
          setMessage(`Calificación de la sesión ${session.number} actualizada. El alumno ya puede consultarla.`);
          setEditing(null);
        }}/> : <button type="button" aria-label={`Modificar nota de la sesión ${session.number}`} onClick={() => { setEditing(key); setMessage(""); }} className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-bold text-[#164c3a]">Modificar nota</button>}</div>;
      }}/>
  </div>;
}
