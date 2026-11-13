"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { saveFirstYearSessionEvaluation, saveSecondYearSessionEvaluation } from "@/app/profesor/actions";
import { TeacherSessionGradeGrid } from "@/components/teacher-session-grade-grid";
import type { GradeGridDrafts } from "@/components/grade-grid";
import { isPlanSessionLog, parseTeacherSessionScore, teacherSessionScore, teacherSessionSlots } from "@/lib/teacher-session-grading";
import type { TeacherActivityData, TeacherSessionEvaluation } from "@/lib/teacher-activity";
import { FIRST_YEAR_CALENDAR_GROUPS, firstYearCalendarGroup } from "@/lib/class-groups";

type SavedEvaluation = { absent: boolean; score: number; comment: string; updatedAt: string };

export function TeacherSessionEvaluationForm({ studentId, sessionNumber, initialScore, initialComment, initialAbsent = false, courseYear = 2, onSaved, onCancel }: {
  studentId: string; sessionNumber: number; initialScore: number | null; initialComment: string; initialAbsent?: boolean; courseYear?: 1 | 2;
  onSaved?: (evaluation: SavedEvaluation) => void;
  onCancel?: () => void;
}) {
  const [scoreDraft, setScore] = useState<string | null>(null);
  const [commentDraft, setComment] = useState<string | null>(null);
  const [absentDraft, setAbsent] = useState<boolean | null>(null);
  const score = scoreDraft ?? (initialScore === null ? "" : String(initialScore).replace(".", ","));
  const comment = commentDraft ?? initialComment;
  const absent = absentDraft ?? initialAbsent;
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
      const saved = await (courseYear === 1 ? saveFirstYearSessionEvaluation : saveSecondYearSessionEvaluation)({ studentId, sessionNumber, score: parsedScore, comment, absent });
      setScore(onSaved ? null : String(saved.score).replace(".", ","));
      setComment(onSaved ? null : saved.comment);
      setAbsent(onSaved ? null : saved.absent);
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
      <label className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900 sm:col-span-2">
        <input type="checkbox" checked={absent} onChange={(event) => { setAbsent(event.target.checked); setFeedback(""); }} className="h-4 w-4 accent-amber-700"/>
        AUSENCIA · No asistió a esta sesión
      </label>
      <label className="text-xs font-bold text-slate-600">Nota · 0–10
        <input type="text" inputMode="decimal" required maxLength={4} value={score} onChange={(event) => { setScore(event.target.value); setFeedback(""); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" placeholder="Ej.: 8,5"/>
      </label>
      <label className="text-xs font-bold text-slate-600">Comentario breve · opcional
        <textarea maxLength={500} rows={2} value={comment} onChange={(event) => { setComment(event.target.value); setFeedback(""); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-normal" placeholder="Una indicación para la siguiente sesión"/>
        <span className="mt-1 block text-right font-normal">{comment.length}/500</span>
      </label>
      <button type="submit" aria-label={`Guardar calificación de la sesión ${sessionNumber}`} className="justify-self-start rounded-lg bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar calificación"}</button>
      {onCancel && <button type="button" onClick={onCancel} className="justify-self-start rounded-lg border px-4 py-2.5 text-sm font-bold">Cancelar edición</button>}
    </fieldset>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    {feedback && <p role="status" className="mt-2 text-sm text-emerald-800">{feedback}</p>}
  </form>;
}

const dateLabel = (value: string) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
const scoreLabel = (value: number) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value);

export function TeacherSessionGrading({ data, initialStudentId, initialGroup, courseYear = 2, initialGrid = false }: {
  data: Pick<TeacherActivityData, "students" | "activities" | "sessionEvaluations">; initialStudentId?: string; initialGroup?: string; courseYear?: 1 | 2; initialGrid?: boolean;
}) {
  const logs = useMemo(() => data.activities.filter((row) => isPlanSessionLog(row, courseYear)), [data.activities, courseYear]);
  const [grid, setGrid] = useState(initialGrid);
  const [drafts, setDrafts] = useState<GradeGridDrafts>({});
  const [gridSaving, setGridSaving] = useState(false);
  const groups = courseYear === 1 ? FIRST_YEAR_CALENDAR_GROUPS : [...new Set(data.students.map((student) => student.group))].sort();
  const [group, setGroup] = useState(() => courseYear === 1 ? firstYearCalendarGroup(initialGroup) ?? "" : initialGroup ?? "");
  const students = useMemo(() => data.students.filter((student) => !group || (courseYear === 1 ? firstYearCalendarGroup(student.group) : student.group) === group), [data.students, courseYear, group]);
  const [studentId, setStudentId] = useState(() => students.find((student) => student.id === initialStudentId)?.id ?? students.find((student) => logs.some((row) => row.studentId === student.id))?.id ?? students[0]?.id ?? "");
  const [saved, setSaved] = useState<Record<string, TeacherSessionEvaluation>>({});
  const evaluations = useMemo(() => {
    const current = new Map((data.sessionEvaluations ?? []).map((grade) => [`${grade.studentId}:${grade.number}`, grade]));
    for (const [key, grade] of Object.entries(saved)) {
      const received = current.get(key);
      if (received && Date.parse(received.updatedAt) > Date.parse(grade.updatedAt)) continue;
      current.set(key, grade);
    }
    return [...current.values()];
  }, [data.sessionEvaluations, saved]);
  const student = students.find((entry) => entry.id === studentId) ?? students[0];
  const activeStudentId = student?.id ?? "";
  const slots = teacherSessionSlots(logs, activeStudentId, evaluations, courseYear, student?.group);
  const gradingUrl = (selectedGroup: string, selectedId: string, table = grid) => `/profesor/calificar-sesiones?curso=${courseYear}${selectedGroup ? `&grupo=${encodeURIComponent(selectedGroup)}` : ""}${selectedId ? `&alumno=${encodeURIComponent(selectedId)}` : ""}${table ? "&vista=cuaderno" : ""}`;
  function recordEvaluations(grades: TeacherSessionEvaluation[]) {
    setSaved((current) => {
      const next = { ...current };
      for (const grade of grades) {
        const key = `${grade.studentId}:${grade.number}`;
        if (!next[key] || Date.parse(grade.updatedAt) >= Date.parse(next[key].updatedAt)) next[key] = grade;
      }
      return next;
    });
  }
  function changeView(table: boolean) {
    setGrid(table);
    window.history.replaceState(null, "", gradingUrl(group, activeStudentId, table));
  }
  function changeGroup(value: string) {
    const nextGroup = courseYear === 1 ? firstYearCalendarGroup(value) ?? "" : value;
    const filtered = data.students.filter((entry) => !nextGroup || (courseYear === 1 ? firstYearCalendarGroup(entry.group) : entry.group) === nextGroup);
    const nextStudentId = filtered.some((entry) => entry.id === activeStudentId) ? activeStudentId : filtered[0]?.id ?? "";
    setGroup(nextGroup);
    setStudentId(nextStudentId);
    window.history.replaceState(null, "", gradingUrl(nextGroup, nextStudentId));
  }
  const sa = courseYear === 1 ? "SA1" : "SA2";
  const count = courseYear === 1 ? 8 : 10;
  const pending = Object.keys(drafts).length;
  const scoreFor = (slot: (typeof slots)[number]) => slot.evaluation?.score ?? teacherSessionScore(slot.record?.details.teacher_score);
  const absentFor = (slot: (typeof slots)[number]) => slot.evaluation?.absent ?? (slot.record?.details.teacher_absent === true);
  const absences = slots.filter(absentFor).length;
  const registered = slots.filter((slot) => slot.record).length;
  const graded = slots.filter((slot) => scoreFor(slot) !== null).length;

  return <section id={`calificaciones-${sa.toLowerCase()}`} aria-label={`Calificaciones de las ${count} sesiones`} className="space-y-5">
    <nav aria-label="Curso de calificación" className="flex flex-wrap gap-3">
      {([1, 2] as const).map((year) => <Link key={year} href={`/profesor/calificar-sesiones?curso=${year}${grid ? "&vista=cuaderno" : ""}`}
        aria-current={year === courseYear ? "page" : undefined}
        onClick={(event) => {
          if (year === courseYear || gridSaving || (pending && !window.confirm("¿Cambiar de curso y descartar las notas pendientes de publicar?"))) event.preventDefault();
        }}
        className={`rounded-xl border px-4 py-2 text-sm font-bold ${year === courseYear ? "bg-emerald-100 text-emerald-900" : "bg-white"}`}>
        {year}º Bachillerato · {year === 1 ? "SA1" : "SA2"}
      </Link>)}
    </nav>
    <div className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Calificar seguimiento · {sa} de {courseYear}º Bachillerato</h2>
          <p className="mt-2 text-sm text-slate-600">{grid ? "Escribe una nota en la casilla del alumno y la sesión. Puedes calificar sesiones con el seguimiento pendiente." : `Selecciona un alumno y califica cualquiera de las ${count} sesiones, aunque todavía no haya registrado su seguimiento.`}</p>
        </div>
        <button type="button" disabled={gridSaving || pending > 0} onClick={() => window.location.assign(gradingUrl(group, activeStudentId))}
          className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">Actualizar sesiones</button>
      </div>
      <div role="group" aria-label="Vista de las calificaciones" className="mt-5 inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        <button type="button" aria-pressed={!grid} disabled={gridSaving} onClick={() => changeView(false)} className="min-h-10 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 aria-pressed:bg-white aria-pressed:text-[#164c3a] aria-pressed:shadow-sm">Por alumno</button>
        <button type="button" aria-pressed={grid} disabled={gridSaving} onClick={() => changeView(true)} className="min-h-10 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 aria-pressed:bg-white aria-pressed:text-[#164c3a] aria-pressed:shadow-sm">Cuaderno de notas{!grid && pending > 0 ? ` (${pending})` : ""}</button>
      </div>
      <div className={`mt-5 grid gap-4 ${!grid && (courseYear === 1 || groups.length > 1) ? "md:grid-cols-2" : "max-w-xl"}`}>
        {(courseYear === 1 || groups.length > 1) && <label className="block text-sm font-bold">Grupo para calificar
          <select aria-label="Grupo para calificar" value={group} disabled={gridSaving} onChange={(event) => changeGroup(event.target.value)} className="mt-2 w-full rounded-xl border border-emerald-600 bg-emerald-50 p-3">
            <option value="">Todos los grupos de {courseYear}º</option>
            {groups.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
        </label>}
        {!grid && <label className="block text-sm font-bold">Alumno para calificar
          <select aria-label="Alumno para calificar" value={activeStudentId} disabled={!students.length} onChange={(event) => {setStudentId(event.target.value); window.history.replaceState(null, "", gradingUrl(group, event.target.value));}} className="mt-2 w-full rounded-xl border border-emerald-600 bg-emerald-50 p-3 disabled:opacity-50">
            {!students.length && <option value="">Sin alumnado en este grupo</option>}
            {students.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} · {entry.group}</option>)}
          </select>
        </label>}
      </div>
      {!grid && <>
        {courseYear === 1 && <p role="status" className="mt-3 text-sm font-semibold text-[#164c3a]">{group || "Todos los grupos de 1º"} · {students.length} alumnos/as</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold">{registered}/{count} sesiones registradas</span><span className="rounded-full bg-emerald-100 px-3 py-1.5 font-semibold text-emerald-800">{graded}/{count} calificadas</span><span className="rounded-full bg-amber-100 px-3 py-1.5 font-semibold text-amber-900">{count - graded} pendientes de calificar</span><span className="rounded-full bg-rose-100 px-3 py-1.5 font-semibold text-rose-800">{absences} ausencias registradas</span></div>
        <p className="mt-3 text-xs text-slate-500">La calificación no cuenta como seguimiento entregado. Cada alumno ve su nota y comentario en {sa} → Seguimiento y en Mis calificaciones.</p>
      </>}
    </div>
    {grid && <TeacherSessionGradeGrid students={students} logs={logs} evaluations={evaluations} courseYear={courseYear} group={group}
      drafts={drafts} setDrafts={setDrafts} saving={gridSaving} setSaving={setGridSaving}
      onPublished={recordEvaluations}/>}
    <div hidden={grid}>
      {!student ? <p className="card p-5">No hay alumnado activo {group ? `en ${group}` : `de ${courseYear}º de Bachillerato`}.</p> : !slots.length ? <p role="alert" className="card p-5">Este alumno necesita tener asignado el grupo 1ºA o 1ºB para mostrar su calendario.</p> : <div className="grid gap-4 xl:grid-cols-2">{slots.map((slot) => {
        const { number, planned, record } = slot;
        const key = `${student.id}:${number}`;
        const evaluation = slot.evaluation;
        const score = scoreFor(slot);
        const absent = absentFor(slot);
        const comment = evaluation?.comment ?? String(record?.details.teacher_comment ?? "");
        return <article key={key} id={`sesion-${number}`} aria-label={`Sesión ${number} de ${student.name}`} className="card min-w-0 p-5 sm:p-6">
          <header className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-extrabold">Sesión {number}</h2>{absent && <span className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800">AUSENCIA</span>}<p className="mt-1 text-sm text-slate-500">{dateLabel(String(record?.details.session_date || planned.date))} · {student.name}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${score !== null ? "bg-emerald-100 text-emerald-800" : record ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500"}`}>{score !== null ? `Calificada · ${scoreLabel(score)}/10` : "Pendiente de calificar"}</span></header>
          {!record ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Seguimiento no registrado por el alumno. Puedes guardar una nota y un comentario para esta sesión.</p> : <>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><p>Duración<strong className="mt-1 block text-sm text-slate-900">{String(record.details.duration_minutes ?? "—")} min</strong></p><p>Esfuerzo del alumno<strong className="mt-1 block text-sm text-slate-900">{String(record.details.rpe ?? "—")}/10</strong></p><p>Cumplimiento<strong className="mt-1 block text-sm text-slate-900">{String(record.details.completion_percent ?? "—")}%</strong></p></div>
            <dl className="mt-3 space-y-2 text-sm"><div><dt className="font-bold text-slate-600">Modificaciones respecto al plan</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{String(record.details.modifications || "Sin modificaciones indicadas")}</dd></div><div><dt className="font-bold text-slate-600">Reflexión del alumno</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{String(record.details.reflection || "Sin reflexión escrita")}</dd></div></dl>
          </>}
          <TeacherSessionEvaluationForm key={key} courseYear={courseYear} studentId={student.id} sessionNumber={number} initialScore={score} initialComment={comment} initialAbsent={absent} onSaved={(value) => recordEvaluations([{ ...value, studentId: student.id, number }])}/>
        </article>;
      })}</div>}
    </div>
  </section>;
}

