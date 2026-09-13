"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Loader2, Pencil, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
};

type SessionForm = {
  sessionNumber: number;
  weekNumber: number;
  sessionDate: string;
  objective: string;
  activities: string;
  durationMinutes: string;
  rpe: string;
  completionPercent: number;
  modifications: string;
  reflection: string;
  status: "draft" | "completed";
};

const emptyForm = (sessionNumber = 1): SessionForm => ({
  sessionNumber,
  weekNumber: Math.min(5, Math.max(1, Math.ceil(sessionNumber / 4))),
  sessionDate: "",
  objective: "",
  activities: "",
  durationMinutes: "",
  rpe: "",
  completionPercent: 100,
  modifications: "",
  reflection: "",
  status: "draft",
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
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
};

export function SecondYearSa2Tracker() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [form, setForm] = useState<SessionForm>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, []);

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
      setStudentId(currentStudentId);
      setCourseId(currentCourseId);

      const [planResult, logsResult] = await Promise.all([
        supabase
          .from("personal_training_plans")
          .select("objective,priority_capacity,weekly_frequency,session_duration_minutes,progression_strategy,recovery_strategy,status")
          .eq("student_id", currentStudentId)
          .eq("course_id", currentCourseId)
          .eq("sa_code", "SA1")
          .maybeSingle(),
        supabase
          .from("training_session_logs")
          .select("id,session_number,week_number,session_date,objective,activities,duration_minutes,rpe,completion_percent,modifications,reflection,status")
          .eq("student_id", currentStudentId)
          .eq("course_id", currentCourseId)
          .eq("sa_code", "SA2")
          .order("session_number", { ascending: true }),
      ]);

      if (planResult.error) throw planResult.error;
      if (logsResult.error) throw logsResult.error;

      setPlan((planResult.data as PlanSummary | null) ?? null);
      const nextLogs = (logsResult.data ?? []) as SessionLog[];
      setLogs(nextLogs);
      const used = new Set(nextLogs.map((item) => item.session_number));
      const nextNumber = Array.from({ length: 20 }, (_, index) => index + 1).find((number) => !used.has(number)) ?? 20;
      setForm(emptyForm(nextNumber));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar el seguimiento.");
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const completed = logs.filter((item) => item.status === "completed");
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
  }, [logs]);

  const weekly = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => {
      const week = index + 1;
      const rows = logs.filter((item) => item.week_number === week && item.status === "completed");
      const load = rows.reduce((sum, item) => sum + ((item.duration_minutes ?? 0) * (item.rpe ?? 0)), 0);
      const completion = rows.length ? rows.reduce((sum, item) => sum + item.completion_percent, 0) / rows.length : 0;
      const rpes = rows.map((item) => item.rpe).filter((value): value is number => value != null);
      const rpe = rpes.length ? rpes.reduce((sum, value) => sum + value, 0) / rpes.length : 0;
      return { week, load, completion, rpe, sessions: rows.length };
    });
  }, [logs]);

  const maxWeeklyLoad = Math.max(1, ...weekly.map((item) => item.load));

  function update<K extends keyof SessionForm>(key: K, value: SessionForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function startEdit(log: SessionLog) {
    setForm({
      sessionNumber: log.session_number,
      weekNumber: log.week_number ?? Math.min(5, Math.max(1, Math.ceil(log.session_number / 4))),
      sessionDate: log.session_date ?? "",
      objective: log.objective ?? "",
      activities: log.activities ?? "",
      durationMinutes: log.duration_minutes == null ? "" : String(log.duration_minutes),
      rpe: log.rpe == null ? "" : String(log.rpe),
      completionPercent: log.completion_percent ?? 100,
      modifications: log.modifications ?? "",
      reflection: log.reflection ?? "",
      status: log.status,
    });
    setMessage(`Editando la sesión ${log.session_number}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!studentId || !courseId) return;
    const duration = form.durationMinutes === "" ? null : Number(form.durationMinutes);
    const rpe = form.rpe === "" ? null : Number(form.rpe);
    if (duration != null && (!Number.isFinite(duration) || duration < 1 || duration > 240)) {
      setError("La duración debe estar entre 1 y 240 minutos.");
      return;
    }
    if (rpe != null && (!Number.isFinite(rpe) || rpe < 1 || rpe > 10)) {
      setError("El RPE debe estar entre 1 y 10.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error: saveError } = await supabase
        .from("training_session_logs")
        .upsert(
          {
            student_id: studentId,
            course_id: courseId,
            sa_code: "SA2",
            session_number: form.sessionNumber,
            week_number: form.weekNumber,
            session_date: form.sessionDate || null,
            objective: form.objective.trim(),
            activities: form.activities.trim(),
            duration_minutes: duration,
            rpe,
            completion_percent: form.completionPercent,
            modifications: form.modifications.trim(),
            reflection: form.reflection.trim(),
            status: form.status,
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
        .from("training_session_logs")
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
          Todavía no has guardado tu plan personal de SA1. Puedes registrar sesiones, pero será más útil si primero defines el objetivo y la progresión. <Link className="font-bold underline" href="/alumno/2bach/sa1/plan">Abrir mi plan de SA1</Link>.
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
        <article className="card p-5"><p className="text-sm text-slate-500">Sesiones completadas</p><p className="mt-2 text-3xl font-extrabold">{metrics.completed}/20</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">RPE medio</p><p className="mt-2 text-3xl font-extrabold">{metrics.averageRpe == null ? "—" : metrics.averageRpe.toFixed(1)}</p><p className="mt-1 text-xs text-slate-400">Escala 1–10</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Cumplimiento medio</p><p className="mt-2 text-3xl font-extrabold">{metrics.averageCompletion == null ? "—" : `${metrics.averageCompletion.toFixed(0)}%`}</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Carga acumulada</p><p className="mt-2 text-3xl font-extrabold">{metrics.totalLoad || "—"}</p><p className="mt-1 text-xs text-slate-400">Índice educativo: minutos × RPE</p></article>
      </section>

      {(error || message) && <div className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-3"><Save className="mt-1 text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">Registrar o editar una sesión</h2><p className="mt-1 text-sm leading-6 text-slate-500">Guarda lo que realmente has hecho. Si cambias el plan, explica por qué.</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Sesión
            <select value={form.sessionNumber} onChange={(event) => { const number = Number(event.target.value); setForm((current) => ({ ...current, sessionNumber: number, weekNumber: Math.min(5, Math.max(1, Math.ceil(number / 4))) })); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {Array.from({ length: 20 }, (_, index) => index + 1).map((number) => <option key={number} value={number}>Sesión {number}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Semana
            <select value={form.weekNumber} onChange={(event) => update("weekNumber", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">{[1,2,3,4,5].map((number) => <option key={number} value={number}>Semana {number}</option>)}</select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Fecha
            <input type="date" value={form.sessionDate} onChange={(event) => update("sessionDate", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"/>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado
            <select value={form.status} onChange={(event) => update("status", event.target.value as SessionForm["status"])} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"><option value="draft">Borrador</option><option value="completed">Completada</option></select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Objetivo de la sesión
            <textarea value={form.objective} onChange={(event) => update("objective", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm normal-case tracking-normal text-slate-800" placeholder="¿Qué pretendías trabajar?"/>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Trabajo realizado
            <textarea value={form.activities} onChange={(event) => update("activities", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm normal-case tracking-normal text-slate-800" placeholder="Ejercicios, series, repeticiones, tiempos o distancias…"/>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Duración (min)
            <input type="number" min="1" max="240" value={form.durationMinutes} onChange={(event) => update("durationMinutes", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"/>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">RPE · esfuerzo 1–10
            <input type="number" min="1" max="10" value={form.rpe} onChange={(event) => update("rpe", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"/>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Cumplimiento · {form.completionPercent}%
            <input type="range" min="0" max="100" step="5" value={form.completionPercent} onChange={(event) => update("completionPercent", Number(event.target.value))} className="mt-4 w-full"/>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Modificaciones respecto al plan
            <textarea value={form.modifications} onChange={(event) => update("modifications", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm normal-case tracking-normal text-slate-800" placeholder="¿Cambiaste carga, ejercicio, descanso o volumen? ¿Por qué?"/>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Reflexión breve
            <textarea value={form.reflection} onChange={(event) => update("reflection", event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm normal-case tracking-normal text-slate-800" placeholder="¿Qué repetirías o reajustarías en la siguiente sesión?"/>
          </label>
        </div>

        <button type="button" onClick={() => void save()} disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>}Guardar sesión</button>
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

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6"><h2 className="text-xl font-extrabold">Historial de sesiones</h2><p className="mt-1 text-sm text-slate-500">Edita un registro cuando necesites completar o corregir la información.</p></div>
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? <p className="p-6 text-sm text-slate-500">Todavía no hay sesiones registradas.</p> : logs.map((log) => {
            const load = (log.duration_minutes ?? 0) * (log.rpe ?? 0);
            return <article key={log.id} className="grid gap-4 p-5 md:grid-cols-[.7fr_1.4fr_1fr_auto] md:items-center">
              <div><p className="font-extrabold">Sesión {log.session_number}</p><p className="mt-1 text-xs text-slate-500">Semana {log.week_number ?? "—"} · {formatDate(log.session_date)}</p></div>
              <div><p className="text-sm font-semibold text-slate-800">{log.objective || "Sin objetivo escrito"}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{log.activities || "Sin actividades registradas"}</p></div>
              <div className="text-xs text-slate-500"><p>RPE: <strong>{log.rpe ?? "—"}</strong> · {log.duration_minutes ?? "—"} min</p><p className="mt-1">Carga: <strong>{load || "—"}</strong> · Cumplimiento: <strong>{log.completion_percent}%</strong></p></div>
              <div className="flex gap-2"><button type="button" onClick={() => startEdit(log)} className="rounded-xl border border-slate-200 p-2 text-slate-600" aria-label={`Editar sesión ${log.session_number}`}><Pencil size={16}/></button><button type="button" onClick={() => void remove(log)} className="rounded-xl border border-red-100 p-2 text-red-600" aria-label={`Eliminar sesión ${log.session_number}`}><Trash2 size={16}/></button></div>
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
