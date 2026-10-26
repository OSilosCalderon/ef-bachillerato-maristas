"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Loader2, Pencil, Save, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { planSessionsForYear } from "@/lib/teacher-session-grading";
import { firstYearCalendarGroup } from "@/lib/class-groups";
import { normalizeItems, methodologyLabels, type PlanItem } from "@/lib/personal-plan-tasks";

type PlanSummary = {
  objective: string;
  priority_capacity: string;
  weekly_frequency: number;
  session_duration_minutes: number;
  progression_strategy: string;
  recovery_strategy: string;
  status: string;
};

type SessionLog = {
  id: string;
  session_number: number;
  week_number: number | null;
  session_date: string | null;
  objective: string;
  activities: string;
  duration_minutes: number | null;
  rpe: number | null;
  completion_percent: number;
  modifications: string;
  reflection: string;
  status: "draft" | "completed";
  teacher_score?: number | null;
  teacher_absent?: boolean;
  teacher_comment?: string;
};

type SessionEvaluation = { session_number: number; teacher_score: number; teacher_comment: string; absent: boolean };

type SessionForm = {
  sessionNumber: number;
  durationMinutes: string;
  rpe: string;
  completionPercent: number;
  modifications: string;
  reflection: string;
};

const emptyForm = (sessionNumber = 0): SessionForm => ({
  sessionNumber,
  durationMinutes: "",
  rpe: "",
  completionPercent: 100,
  modifications: "",
  reflection: "",
});

const capacityLabel: Record<string, string> = {
  "condicion-fisica-general": "Condición física general",
  fuerza: "Fuerza",
  resistencia: "Resistencia",
  velocidad: "Velocidad",
  "flexibilidad-movilidad": "Flexibilidad / movilidad",
};

const formatDate = (value: string | null) => {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
};

export function SecondYearSa2Tracker({ courseYear = 2 }: { courseYear?: 1 | 2 }) {
  const [classGroup, setClassGroup] = useState("");
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const planSessions = planSessionsForYear(courseYear, classGroup);
  const getPlanSession = (number: number) => planSessions[number - 1] ?? null;
  const logTable = courseYear === 1 ? "first_year_plan_session_logs" : "training_session_logs";
  const gradeTable = courseYear === 1 ? "first_year_plan_session_grades" : "training_session_grade_results";
  const saCode = courseYear === 1 ? "SA1" : "SA2";
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [evaluations, setEvaluations] = useState<SessionEvaluation[]>([]);
  const [form, setForm] = useState<SessionForm>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, [courseYear]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("No se ha podido identificar al alumno.");

      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id,course_id")
        .eq("profile_id", auth.user.id)
        .eq("active", true)
        .single();
      if (studentError || !student) throw new Error("No se ha encontrado el perfil de alumno.");

      const currentStudentId = student.id as string;
      const currentCourseId = student.course_id as string;
      const [courseResult, profileResult] = await Promise.all([
        supabase.from("courses").select("bachillerato_year").eq("id", currentCourseId).single(),
        supabase.from("profiles").select("class_group").eq("id", auth.user.id).single(),
      ]);
      if (courseResult.error || courseResult.data?.bachillerato_year !== courseYear) throw new Error("Este seguimiento no corresponde a tu curso.");
      const group = firstYearCalendarGroup(profileResult.data?.class_group);
      if (courseYear === 1 && (profileResult.error || !group)) throw new Error("Tu cuenta necesita tener asignado el grupo 1ºA o 1ºB. Consulta con el profesor.");
      setClassGroup(group ?? "");
      const ownSessions = planSessionsForYear(courseYear, group ?? "");
      setStudentId(currentStudentId);
      setCourseId(currentCourseId);

      const [planResult, logsResult] = await Promise.all([
        supabase
          .from("personal_training_plans")
          .select("objective,priority_capacity,weekly_frequency,session_duration_minutes,progression_strategy,recovery_strategy,status,plan_items")
          .eq("student_id", currentStudentId)
          .eq("course_id", currentCourseId)
          .eq("sa_code", "SA1")
          .maybeSingle(),
        supabase
          .from(logTable)
          .select("id,session_number,week_number,session_date,objective,activities,duration_minutes,rpe,completion_percent,modifications,reflection,status")
          .eq("student_id", currentStudentId)
          .eq("course_id", currentCourseId)
          .eq("sa_code", saCode)
          .order("session_number", { ascending: true }),
      ]);

      if (planResult.error) throw planResult.error;
      if (logsResult.error) throw logsResult.error;

      setPlan((planResult.data as PlanSummary | null) ?? null);
      setPlanItems(normalizeItems(planResult.data?.plan_items));
      const nextLogs = (logsResult.data ?? []) as SessionLog[];
      const { data: evaluationRows, error: evaluationError } = await supabase
        .from(gradeTable)
        .select("session_number,teacher_score,teacher_comment,absent")
        .eq("student_id", currentStudentId)
        .order("session_number");
      if (evaluationError) throw evaluationError;
      const nextEvaluations = (evaluationRows ?? []).map((item) => ({
        session_number: Number(item.session_number),
        teacher_score: Number(item.teacher_score),
        absent: item.absent === true,
        teacher_comment: String(item.teacher_comment ?? ""),
      }));
      setEvaluations(nextEvaluations);
      const evaluationBySession = new Map(nextEvaluations.map((item) => [item.session_number, item]));
      const logsWithEvaluations = nextLogs.map((item) => ({
        ...item,
        teacher_absent: evaluationBySession.get(item.session_number)?.absent ?? false,
        teacher_score: evaluationBySession.get(item.session_number)?.teacher_score ?? null,
        teacher_comment: evaluationBySession.get(item.session_number)?.teacher_comment ?? "",
      }));
      setLogs(logsWithEvaluations);
      const used = new Set(nextLogs.map((item) => item.session_number));
      const nextNumber = ownSessions.map((_, index) => index + 1).find((number) => !used.has(number)) ?? 0;
      setForm(emptyForm(nextNumber));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar el seguimiento.");
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const completed = logs.filter((item) => item.status === "completed" && item.session_number >= 1 && item.session_number <= planSessions.length);
    const rpes = completed.map((item) => item.rpe).filter((value): value is number => value != null);
    const averageRpe = rpes.length ? rpes.reduce((sum, value) => sum + value, 0) / rpes.length : null;
    const averageCompletion = completed.length
      ? completed.reduce((sum, item) => sum + item.completion_percent, 0) / completed.length
      : null;
    const totalLoad = completed.reduce(
      (sum, item) => sum + ((item.duration_minutes ?? 0) * (item.rpe ?? 0)),
      0,
    );
    return { completed: completed.length, averageRpe, averageCompletion, totalLoad };
  }, [logs, planSessions.length]);

  const weekly = useMemo(() => {
    return Array.from({ length: courseYear === 1 ? 5 : 3 }, (_, index) => {
      const week = index + 1;
      const rows = logs.filter((item) => item.week_number === week && item.status === "completed");
      const load = rows.reduce((sum, item) => sum + ((item.duration_minutes ?? 0) * (item.rpe ?? 0)), 0);
      const completion = rows.length ? rows.reduce((sum, item) => sum + item.completion_percent, 0) / rows.length : 0;
      const rpes = rows.map((item) => item.rpe).filter((value): value is number => value != null);
      const rpe = rpes.length ? rpes.reduce((sum, value) => sum + value, 0) / rpes.length : 0;
      return { week, load, completion, rpe, sessions: rows.length };
    });
  }, [logs, courseYear]);

  const maxWeeklyLoad = Math.max(1, ...weekly.map((item) => item.load));
  const evaluationsWithoutLog = evaluations.filter((item) => !logs.some((log) => log.session_number === item.session_number));

  function update<K extends keyof SessionForm>(key: K, value: SessionForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function startEdit(log: SessionLog) {
    if (!getPlanSession(log.session_number)) {
      setError("Este registro pertenece al formato anterior y se conserva en el historial.");
      return;
    }
    setForm({
      sessionNumber: log.session_number,
      durationMinutes: log.duration_minutes == null ? "" : String(log.duration_minutes),
      rpe: log.rpe == null ? "" : String(log.rpe),
      completionPercent: log.completion_percent ?? 100,
      modifications: log.modifications ?? "",
      reflection: log.reflection ?? "",
    });
    setMessage(`Editando la sesión ${log.session_number}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!studentId || !courseId) return;
    const selectedSession = getPlanSession(form.sessionNumber);
    if (!selectedSession) {
      setError(`Selecciona una de las ${courseYear === 1 ? "ocho" : "diez"} sesiones del plan personal.`);
      return;
    }
    const duration = form.durationMinutes === "" ? null : Number(form.durationMinutes);
    const rpe = form.rpe === "" ? null : Number(form.rpe);
    if (duration != null && (!Number.isInteger(duration) || duration < 1 || duration > 240)) {
      setError("La duración debe estar entre 1 y 240 minutos.");
      return;
    }
    if (rpe != null && (!Number.isInteger(rpe) || rpe < 1 || rpe > 10)) {
      setError("El RPE debe estar entre 1 y 10.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const previousLog = logs.find((item) => item.session_number === form.sessionNumber);
      const { data, error: saveError } = await supabase
        .from(logTable)
        .upsert(
          {
            student_id: studentId,
            course_id: courseId,
            sa_code: saCode,
            session_number: form.sessionNumber,
            week_number: courseYear === 1 ? Math.floor((Date.parse(selectedSession.date) - Date.parse(planSessions[0].date)) / 604800000) + 1 : Math.floor((form.sessionNumber - 1) / 4) + 1,
            session_date: selectedSession.date,
            objective: previousLog?.objective || plan?.objective || "",
            activities: previousLog?.activities || planItems.filter((item) => item.sessionDate === selectedSession.date).map((item) => [item.activity, ...item.exercises.map((exercise) => exercise.activity)].filter(Boolean).join(" · ")).join("\n"),
            duration_minutes: duration,
            rpe,
            completion_percent: form.completionPercent,
            modifications: form.modifications.trim(),
            reflection: form.reflection.trim(),
            status: "completed",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id,course_id,sa_code,session_number" },
        )
        .select("id")
        .single();
      if (saveError) throw saveError;
      if (!data) throw new Error("Supabase no ha confirmado el registro.");
      setMessage(`Sesión ${form.sessionNumber} guardada y verificada.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar la sesión.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(log: SessionLog) {
    if (!studentId) return;
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from(logTable)
        .delete()
        .eq("id", log.id)
        .eq("student_id", studentId);
      if (deleteError) throw deleteError;
      setMessage(`Sesión ${log.session_number} eliminada.`);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido eliminar la sesión.");
    }
  }

  if (loading) {
    return <div className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/>Cargando seguimiento…</div>;
  }

  return (
    <div className="space-y-6">
      {!plan && (
        <section className="card border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Todavía no has guardado tu plan personal de SA1. Puedes registrar sesiones, pero será más útil si primero defines el objetivo y la progresión. <Link className="font-bold underline" href={courseYear === 1 ? "/alumno/sa1/plan" : "/alumno/2bach/sa1/plan"}>Abrir mi plan de SA1</Link>.
        </section>
      )}

      {plan && (
        <section className="card p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Plan de referencia · SA1</p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2"><p className="text-xs font-bold uppercase text-slate-400">Objetivo</p><p className="mt-1 font-semibold text-slate-800">{plan.objective || "Sin definir"}</p></div>
            <div><p className="text-xs font-bold uppercase text-slate-400">Prioridad</p><p className="mt-1 font-semibold text-slate-800">{capacityLabel[plan.priority_capacity] ?? plan.priority_capacity}</p></div>
            <div><p className="text-xs font-bold uppercase text-slate-400">Frecuencia prevista</p><p className="mt-1 font-semibold text-slate-800">{plan.weekly_frequency || "—"} sesiones/semana</p></div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card p-5"><p className="text-sm text-slate-500">Sesiones completadas</p><p className="mt-2 text-3xl font-extrabold">{metrics.completed}/{planSessions.length || (courseYear === 1 ? 8 : 10)}</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">RPE medio</p><p className="mt-2 text-3xl font-extrabold">{metrics.averageRpe == null ? "—" : metrics.averageRpe.toFixed(1)}</p><p className="mt-1 text-xs text-slate-400">Escala 1–10</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Cumplimiento medio</p><p className="mt-2 text-3xl font-extrabold">{metrics.averageCompletion == null ? "—" : `${metrics.averageCompletion.toFixed(0)}%`}</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Carga acumulada</p><p className="mt-2 text-3xl font-extrabold">{metrics.totalLoad || "—"}</p><p className="mt-1 text-xs text-slate-400">Índice educativo: minutos × RPE</p></article>
      </section>

      {(error || message) && <div className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-3"><Save className="mt-1 text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">Registrar o editar una sesión</h2><p className="mt-1 text-sm leading-6 text-slate-500">Guarda lo que realmente has hecho. Si cambias el plan, explica por qué.</p></div></div>
        {(() => {
          const selectedPlanSession = getPlanSession(form.sessionNumber);
          const occupied = new Set(logs.map((item) => item.session_number));
          const allRecorded = planSessions.every((_, index) =>
            occupied.has(index + 1),
          );
          const formatPlanDate = (value: string) =>
            new Intl.DateTimeFormat("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(`${value}T12:00:00`));

          return (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-[1.5fr_1fr]">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Sesión del plan personal
                  <select
                    value={form.sessionNumber}
                    onChange={(event) => { const number = Number(event.target.value); const log = logs.find((item) => item.session_number === number); if (log) startEdit(log); else { setForm(emptyForm(number)); setMessage(""); } }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"
                  >
                    <option value={0} disabled>Selecciona una sesión disponible</option>
                    {planSessions.map((session, index) => {
                      const number = index + 1;
                      const alreadyRecorded = occupied.has(number);
                      const label = `Sesión ${number} · ${session.day} ${formatPlanDate(session.date).replace(/^\\S+\\s/, "")} · ${session.start}–${session.end}`;
                      return (
                        <option key={number} value={number}>
                          {label}{alreadyRecorded ? " · Registrada" : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fecha y horario del plan</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {selectedPlanSession
                      ? `${selectedPlanSession.day} ${formatPlanDate(selectedPlanSession.date).replace(/^\\S+\\s/, "")} · ${selectedPlanSession.start}–${selectedPlanSession.end}`
                      : "Se completa al elegir una sesión"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">La fecha viene del calendario de tu plan personal.</p>
                </div>
              </div>

              {selectedPlanSession && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><h3 className="text-sm font-bold text-[#164c3a]">Tareas previstas en tu plan</h3>{planItems.filter((item) => item.sessionDate === selectedPlanSession.date).length ? planItems.filter((item) => item.sessionDate === selectedPlanSession.date).map((item) => <div key={item.id} className="mt-3 text-sm"><p className="font-bold">{item.activity || "Tarea"} · {methodologyLabels[item.methodology]}</p><ul className="mt-1 list-inside list-disc space-y-1 text-slate-600">{item.exercises.map((exercise) => <li key={exercise.id}>{exercise.activity || "Ejercicio por concretar"}{exercise.dose ? ` · ${exercise.dose}` : ""}</li>)}</ul></div>) : <p className="mt-2 text-sm text-slate-600">No hay tareas asignadas a esta fecha. Puedes organizarlas en tu plan personal.</p>}</div>}
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Duración estimada (minutos)
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={form.durationMinutes}
                    onChange={(event) => update("durationMinutes", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"
                    placeholder="Por ejemplo, 45"
                  />
                </label>
                <fieldset className="rounded-xl border border-slate-200 p-3">
                  <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">Esfuerzo percibido · 1–10</legend>
                  <div className="mt-1 flex flex-wrap items-center gap-1" role="group" aria-label="Valora el esfuerzo de 1 a 10">
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => update("rpe", String(rating))}
                        aria-label={`Esfuerzo ${rating} de 10`}
                        aria-pressed={Number(form.rpe) === rating}
                        className="rounded-lg p-1 text-amber-500 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                      >
                        <Star size={20} fill={Number(form.rpe) >= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{form.rpe ? `${form.rpe} de 10` : "Selecciona las estrellas"}</p>
                </fieldset>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Cumplimiento de la sesión · {form.completionPercent}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={form.completionPercent}
                    onChange={(event) => update("completionPercent", Number(event.target.value))}
                    className="mt-4 w-full"
                  />
                </label>
              </div>
              {allRecorded && form.sessionNumber === 0 && (
                <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                  Ya están registradas las {planSessions.length} sesiones del plan. Puedes editar cualquiera desde el historial.
                </p>
              )}
            </>
          );
        })()}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Modificaciones respecto al plan
            <textarea maxLength={4000} value={form.modifications} onChange={(event) => update("modifications", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm normal-case tracking-normal text-slate-800" placeholder="¿Cambiaste carga, ejercicio, descanso o volumen? ¿Por qué?"/>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Reflexión breve
            <textarea maxLength={4000} value={form.reflection} onChange={(event) => update("reflection", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm normal-case tracking-normal text-slate-800" placeholder="¿Qué repetirías o reajustarías en la siguiente sesión?"/>
          </label>
        </div>

        <button type="button" onClick={() => void save()} disabled={saving || form.sessionNumber === 0} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>}Guardar sesión</button>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-3"><BarChart3 className="mt-1 text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">Carga y cumplimiento por semana</h2><p className="mt-1 text-sm leading-6 text-slate-500">La carga es un índice sencillo de minutos × RPE. Úsalo para observar tendencias, no como diagnóstico ni como objetivo de “hacer más”.</p></div></div>
        <div className="mt-6 space-y-4">
          {weekly.map((item) => (
            <div key={item.week} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold">Semana {item.week}</p><p className="text-xs text-slate-500">{item.sessions} sesiones · RPE medio {item.sessions ? item.rpe.toFixed(1) : "—"} · cumplimiento {item.sessions ? `${item.completion.toFixed(0)}%` : "—"}</p></div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#1e6b4f]" style={{ width: `${(item.load / maxWeeklyLoad) * 100}%` }}/></div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Carga orientativa: {item.load || "—"}</p>
            </div>
          ))}
        </div>
      </section>

      {evaluationsWithoutLog.length > 0 && <section className="card p-5 sm:p-6">
        <h2 className="text-xl font-extrabold">Valoraciones del profesor · seguimientos pendientes</h2>
        <p className="mt-2 text-sm text-slate-500">Estas sesiones ya tienen calificación, pero todavía no has registrado su seguimiento. La nota se conservará cuando lo completes.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {evaluationsWithoutLog.map((item) => <article key={item.session_number} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-bold">Sesión {item.session_number} · {formatDate(getPlanSession(item.session_number)?.date ?? null)}</h3>
            {item.absent && <span className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800">AUSENCIA</span>}
            <p className="mt-2 font-extrabold text-[#164c3a]">Nota: {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(item.teacher_score)}/10</p>
            {item.teacher_comment.trim() && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{item.teacher_comment}</p>}
            <p className="mt-2 text-xs font-semibold text-amber-800">Seguimiento sin registrar</p>
          </article>)}
        </div>
      </section>}

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6"><h2 className="text-xl font-extrabold">Historial de sesiones</h2><p className="mt-1 text-sm text-slate-500">Edita un registro cuando necesites completar o corregir la información.</p></div>
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? <p className="p-6 text-sm text-slate-500">Todavía no hay sesiones registradas.</p> : logs.map((log) => {
            const load = (log.duration_minutes ?? 0) * (log.rpe ?? 0);
            return <article key={log.id} className="grid gap-4 p-5 md:grid-cols-[.7fr_1.4fr_1fr_auto] md:items-center">
              <div><p className="font-extrabold">Sesión {log.session_number}{getPlanSession(log.session_number) ? " del plan" : " · anterior"}</p><p className="mt-1 text-xs text-slate-500">{formatDate(log.session_date)}</p></div>
              <div><p className="text-sm font-semibold text-slate-800">{log.objective || "Sin objetivo escrito"}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{log.activities || "Sin actividades registradas"}</p></div>
              <div className="text-xs text-slate-500"><p>RPE: <strong>{log.rpe ?? "—"}</strong> · {log.duration_minutes ?? "—"} min</p><p className="mt-1">Carga: <strong>{load || "—"}</strong> · Cumplimiento: <strong>{log.completion_percent}%</strong></p></div>
              <div className="flex gap-2"><button type="button" onClick={() => startEdit(log)} className="rounded-xl border border-slate-200 p-2 text-slate-600" aria-label={`Editar sesión ${log.session_number}`}><Pencil size={16}/></button>{courseYear === 2 && <button type="button" onClick={() => void remove(log)} className="rounded-xl border border-red-100 p-2 text-red-600" aria-label={`Eliminar sesión ${log.session_number}`}><Trash2 size={16}/></button>}</div>
              <dl className="md:col-span-full grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-bold text-slate-600">Modificaciones respecto al plan</dt><dd className="mt-1 whitespace-pre-wrap break-words">{log.modifications || "Sin modificaciones indicadas"}</dd></div><div><dt className="font-bold text-slate-600">Mi reflexión</dt><dd className="mt-1 whitespace-pre-wrap break-words">{log.reflection || "Sin reflexión escrita"}</dd></div></dl>
              <div className="md:col-span-full rounded-xl border border-[#c6e1d6] bg-[#f2faf6] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">Valoración del profesor</p>
                {log.teacher_absent && <span className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800">AUSENCIA</span>}
                {log.teacher_score == null
                  ? <p className="mt-2 text-sm text-slate-600">Pendiente de valoración.</p>
                  : <div className="mt-2 flex flex-wrap items-start gap-x-4 gap-y-1 text-sm">
                      <p className="font-extrabold text-[#164c3a]">Nota: {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(log.teacher_score)}/10</p>
                      {log.teacher_comment?.trim() && <p className="min-w-0 flex-1 whitespace-pre-wrap text-slate-700">{log.teacher_comment}</p>}
                    </div>}
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-[#e7f2ed] p-5 text-sm leading-6 text-[#164c3a]">
        <div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0" size={19}/><p><strong>Objetivo educativo:</strong> aprender a relacionar lo planificado con lo realmente realizado. Una modificación bien argumentada puede ser una mejor decisión que cumplir un plan de forma rígida.</p></div>
      </section>
    </div>
  );
}

