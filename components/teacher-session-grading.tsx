"use client";

import { useState, type FormEvent } from "react";
import { saveSecondYearSessionEvaluation } from "@/app/profesor/actions";
import { isPlanSessionLog, parseTeacherSessionScore, teacherSessionScore, teacherSessionSlots } from "@/lib/teacher-session-grading";
import type { TeacherActivityData } from "@/lib/teacher-activity";

type SavedEvaluation = { score: number; comment: string; updatedAt: string };

export function TeacherSessionEvaluationForm({ studentId, sessionNumber, initialScore, initialComment, onSaved }: {
  studentId: string; sessionNumber: number; initialScore: number | null; initialComment: string;
  onSaved?: (evaluation: SavedEvaluation) => void;
}) {
  const [score, setScore] = useState(initialScore === null ? "" : String(initialScore).replace(".", ","));
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");
    const parsedScore = parseTeacherSessionScore(score);
    if (parsedScore === null) {
      setError("Introduce una nota entre 0 y 10. Puedes usar una décima: por ejemplo, 8,5.");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveSecondYearSessionEvaluation({ studentId, sessionNumber, score: parsedScore, comment });
      setScore(String(saved.score).replace(".", ","));
      setComment(saved.comment);
      onSaved?.(saved);
      setFeedback("Calificación guardada y comprobada. El alumno puede verla en su seguimiento.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar la calificación.");
    } finally {
      setSaving(false);
    }
  }

  return <form aria-label={`Calificar sesión ${sessionNumber}`} onSubmit={(event) => void submit(event)} className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
    <h3 className="font-bold text-[#164c3a]">Calificación del profesor · sesión {sessionNumber}</h3>
    <fieldset disabled={saving} className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr]">
      <label className="text-xs font-bold text-slate-600">Nota · 0–10
        <input type="text" inputMode="decimal" required maxLength={4} value={score} onChange={(event) => { setScore(event.target.value); setFeedback(""); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" placeholder="Ej.: 8,5"/>
      </label>
      <label className="text-xs font-bold text-slate-600">Comentario breve · opcional
        <textarea maxLength={500} rows={2} value={comment} onChange={(event) => { setComment(event.target.value); setFeedback(""); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal" placeholder="Una indicación para la siguiente sesión"/>
        <span className="mt-1 block text-right font-normal">{comment.length}/500</span>
      </label>
      <button type="submit" aria-label={`Guardar calificación de la sesión ${sessionNumber}`} className="justify-self-start rounded-lg bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar calificación"}</button>
    </fieldset>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    {feedback && <p role="status" className="mt-2 text-sm text-emerald-800">{feedback}</p>}
  </form>;
}

const dateLabel = (value: string) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
const scoreLabel = (value: number) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value);

export function TeacherSessionGrading({ data, initialStudentId }: {
  data: Pick<TeacherActivityData, "students" | "activities" | "sessionEvaluations">; initialStudentId?: string;
}) {
  const logs = data.activities.filter(isPlanSessionLog);
  const [studentId, setStudentId] = useState(() => data.students.find((student) => student.id === initialStudentId)?.id ?? data.students.find((student) => logs.some((row) => row.studentId === student.id))?.id ?? data.students[0]?.id ?? "");
  const [saved, setSaved] = useState<Record<string, SavedEvaluation>>({});
  const student = data.students.find((entry) => entry.id === studentId);
  const slots = teacherSessionSlots(logs, studentId, data.sessionEvaluations);
  const scoreFor = (slot: (typeof slots)[number]) => saved[`${studentId}:${slot.number}`]?.score ?? slot.evaluation?.score ?? teacherSessionScore(slot.record?.details.teacher_score);
  const registered = slots.filter((slot) => slot.record).length;
  const graded = slots.filter((slot) => scoreFor(slot) !== null).length;

  return <section id="calificaciones-sa2" aria-label="Calificaciones de las diez sesiones" className="space-y-5">
    <div className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-extrabold">Calificar seguimiento · SA2 de 2º Bachillerato</h2><p className="mt-2 text-sm text-slate-600">Selecciona un alumno y califica cualquiera de las diez sesiones, aunque todavía no haya registrado su seguimiento.</p></div><button type="button" onClick={() => window.location.assign(`/profesor/calificar-sesiones?alumno=${encodeURIComponent(studentId)}`)} className="rounded-xl border px-4 py-2 text-sm font-bold">Actualizar sesiones</button></div>
      <label className="mt-5 block max-w-xl text-sm font-bold">Alumno para calificar
        <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="mt-2 w-full rounded-xl border border-emerald-600 bg-emerald-50 p-3">
          {data.students.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
        </select>
      </label>
      <div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold">{registered}/10 sesiones registradas</span><span className="rounded-full bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-800">{graded}/10 calificadas</span><span className="rounded-full bg-amber-100 px-3 py-1.5 font-semibold text-amber-900">{10 - graded} pendientes de calificar</span></div>
      <p className="mt-3 text-xs text-slate-500">La calificación no cuenta como seguimiento entregado. Cada alumno ve su nota y comentario en SA2 → Seguimiento y en Mis calificaciones.</p>
    </div>
    {!student ? <p className="card p-5">No hay alumnado activo de 2º de Bachillerato.</p> : <div className="grid gap-4 xl:grid-cols-2">{slots.map((slot) => {
      const { number, planned, record } = slot;
      const key = `${student.id}:${number}`;
      const evaluation = saved[key] ?? slot.evaluation;
      const score = scoreFor(slot);
      const comment = evaluation?.comment ?? String(record?.details.teacher_comment ?? "");
      return <article key={key} id={`sesion-${number}`} aria-label={`Sesión ${number} de ${student.name}`} className="card min-w-0 p-5 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-extrabold">Sesión {number}</h2><p className="mt-1 text-sm text-slate-500">{dateLabel(String(record?.details.session_date || planned.date))} · {student.name}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${score !== null ? "bg-emerald-100 text-emerald-800" : record ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500"}`}>{score !== null ? `Calificada · ${scoreLabel(score)}/10` : "Pendiente de calificar"}</span></header>
        {!record ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Seguimiento no registrado por el alumno. Puedes guardar una nota y un comentario para esta sesión.</p> : <>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><p>Duración<strong className="mt-1 block text-sm text-slate-900">{String(record.details.duration_minutes ?? "—")} min</strong></p><p>Esfuerzo del alumno<strong className="mt-1 block text-sm text-slate-900">{String(record.details.rpe ?? "—")}/10</strong></p><p>Cumplimiento<strong className="mt-1 block text-sm text-slate-900">{String(record.details.completion_percent ?? "—")}%</strong></p></div>
          <dl className="mt-3 space-y-2 text-sm"><div><dt className="font-bold text-slate-600">Modificaciones respecto al plan</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{String(record.details.modifications || "Sin modificaciones indicadas")}</dd></div><div><dt className="font-bold text-slate-600">Reflexión del alumno</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{String(record.details.reflection || "Sin reflexión escrita")}</dd></div></dl>
        </>}
        <TeacherSessionEvaluationForm key={key} studentId={student.id} sessionNumber={number} initialScore={score} initialComment={comment} onSaved={(value) => setSaved((current) => ({ ...current, [key]: value }))}/>
      </article>;
    })}</div>}
  </section>;
}
