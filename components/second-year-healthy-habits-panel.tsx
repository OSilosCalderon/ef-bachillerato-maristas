"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Save, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type HabitPlan = {
  focusHabit: string;
  initialReflection: string;
  objective: string;
  actionPlan: string;
  barrierStrategy: string;
  successIndicator: string;
  finalReflection: string;
  status: "draft" | "active" | "completed";
};

type WeeklyLog = {
  id?: string;
  weekNumber: number;
  sleepRoutine: number | null;
  dailyMovement: number | null;
  sedentaryBreaks: number | null;
  recovery: number | null;
  hydration: number | null;
  balancedEating: number | null;
  goalCompletion: number;
  reflection: string;
  nextAdjustment: string;
};

const emptyPlan: HabitPlan = {
  focusHabit: "rutina-general",
  initialReflection: "",
  objective: "",
  actionPlan: "",
  barrierStrategy: "",
  successIndicator: "",
  finalReflection: "",
  status: "draft",
};

const habitOptions = [
  ["rutina-general", "Rutina saludable general"],
  ["sueno", "Regularidad del sueño"],
  ["movimiento", "Movimiento cotidiano"],
  ["sedentarismo", "Interrumpir tiempos sedentarios"],
  ["recuperacion", "Recuperación y descanso"],
  ["hidratacion", "Hidratación"],
  ["alimentacion", "Organización de una alimentación variada"],
] as const;

const ratingFields = [
  ["sleepRoutine", "Rutina de sueño"],
  ["dailyMovement", "Movimiento diario"],
  ["sedentaryBreaks", "Pausas del sedentarismo"],
  ["recovery", "Recuperación"],
  ["hydration", "Hidratación"],
  ["balancedEating", "Alimentación variada"],
] as const;

type RatingKey = (typeof ratingFields)[number][0];

function emptyWeek(weekNumber: number): WeeklyLog {
  return {
    weekNumber,
    sleepRoutine: null,
    dailyMovement: null,
    sedentaryBreaks: null,
    recovery: null,
    hydration: null,
    balancedEating: null,
    goalCompletion: 0,
    reflection: "",
    nextAdjustment: "",
  };
}

function habitIndex(log: WeeklyLog) {
  const values = ratingFields
    .map(([key]) => log[key])
    .filter((value): value is number => value != null && Number.isFinite(value));
  if (!values.length) return null;
  return (values.reduce((sum, value) => sum + value, 0) / (values.length * 5)) * 100;
}

export function SecondYearHealthyHabitsPanel() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [plan, setPlan] = useState<HabitPlan>(emptyPlan);
  const [weeks, setWeeks] = useState<WeeklyLog[]>([1, 2, 3, 4].map(emptyWeek));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
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
          .from("healthy_habit_plans")
          .select("focus_habit,initial_reflection,objective,action_plan,barrier_strategy,success_indicator,final_reflection,status")
          .eq("student_id", currentStudentId)
          .eq("course_id", currentCourseId)
          .eq("sa_code", "SA3")
          .maybeSingle(),
        supabase
          .from("healthy_habit_weekly_logs")
          .select("id,week_number,sleep_routine,daily_movement,sedentary_breaks,recovery,hydration,balanced_eating,goal_completion,reflection,next_adjustment")
          .eq("student_id", currentStudentId)
          .eq("course_id", currentCourseId)
          .eq("sa_code", "SA3")
          .order("week_number", { ascending: true }),
      ]);

      if (planResult.error) throw planResult.error;
      if (logsResult.error) throw logsResult.error;

      if (planResult.data) {
        const row = planResult.data;
        setPlan({
          focusHabit: row.focus_habit || "rutina-general",
          initialReflection: row.initial_reflection ?? "",
          objective: row.objective ?? "",
          actionPlan: row.action_plan ?? "",
          barrierStrategy: row.barrier_strategy ?? "",
          successIndicator: row.success_indicator ?? "",
          finalReflection: row.final_reflection ?? "",
          status: row.status === "active" || row.status === "completed" ? row.status : "draft",
        });
      }

      const byWeek = new Map<number, WeeklyLog>();
      for (const row of logsResult.data ?? []) {
        byWeek.set(Number(row.week_number), {
          id: row.id as string,
          weekNumber: Number(row.week_number),
          sleepRoutine: row.sleep_routine == null ? null : Number(row.sleep_routine),
          dailyMovement: row.daily_movement == null ? null : Number(row.daily_movement),
          sedentaryBreaks: row.sedentary_breaks == null ? null : Number(row.sedentary_breaks),
          recovery: row.recovery == null ? null : Number(row.recovery),
          hydration: row.hydration == null ? null : Number(row.hydration),
          balancedEating: row.balanced_eating == null ? null : Number(row.balanced_eating),
          goalCompletion: Number(row.goal_completion) || 0,
          reflection: row.reflection ?? "",
          nextAdjustment: row.next_adjustment ?? "",
        });
      }
      setWeeks([1, 2, 3, 4].map((weekNumber) => byWeek.get(weekNumber) ?? emptyWeek(weekNumber)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar la SA3.");
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const indexes = weeks.map((week) => habitIndex(week));
    const recorded = indexes.filter((value): value is number => value != null);
    const averageCompletion = weeks.filter((week) => habitIndex(week) != null).length
      ? weeks.filter((week) => habitIndex(week) != null).reduce((sum, week) => sum + week.goalCompletion, 0) /
        weeks.filter((week) => habitIndex(week) != null).length
      : null;
    const first = indexes[0];
    const last = indexes[3];
    return {
      weeksRecorded: recorded.length,
      averageCompletion,
      first,
      last,
      evolution: first != null && last != null ? last - first : null,
    };
  }, [weeks]);

  function updatePlan<K extends keyof HabitPlan>(key: K, value: HabitPlan[K]) {
    setPlan((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function updateWeek(weekNumber: number, key: keyof WeeklyLog, value: WeeklyLog[keyof WeeklyLog]) {
    setWeeks((current) => current.map((week) => (week.weekNumber === weekNumber ? { ...week, [key]: value } : week)));
    setMessage("");
  }

  async function savePlan() {
    if (!studentId || !courseId) return;
    setSaving("plan");
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error: saveError } = await supabase
        .from("healthy_habit_plans")
        .upsert(
          {
            student_id: studentId,
            course_id: courseId,
            sa_code: "SA3",
            focus_habit: plan.focusHabit,
            initial_reflection: plan.initialReflection.trim(),
            objective: plan.objective.trim(),
            action_plan: plan.actionPlan.trim(),
            barrier_strategy: plan.barrierStrategy.trim(),
            success_indicator: plan.successIndicator.trim(),
            final_reflection: plan.finalReflection.trim(),
            status: plan.status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id,course_id,sa_code" },
        )
        .select("status,updated_at")
        .single();
      if (saveError) throw saveError;
      if (!data) throw new Error("Supabase no ha confirmado el guardado del reto.");
      setMessage("Reto de hábitos guardado y verificado.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el reto.");
    } finally {
      setSaving(null);
    }
  }

  async function saveWeek(week: WeeklyLog) {
    if (!studentId || !courseId) return;
    setSaving(`week-${week.weekNumber}`);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error: saveError } = await supabase
        .from("healthy_habit_weekly_logs")
        .upsert(
          {
            student_id: studentId,
            course_id: courseId,
            sa_code: "SA3",
            week_number: week.weekNumber,
            sleep_routine: week.sleepRoutine,
            daily_movement: week.dailyMovement,
            sedentary_breaks: week.sedentaryBreaks,
            recovery: week.recovery,
            hydration: week.hydration,
            balanced_eating: week.balancedEating,
            goal_completion: week.goalCompletion,
            reflection: week.reflection.trim(),
            next_adjustment: week.nextAdjustment.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id,course_id,sa_code,week_number" },
        )
        .select("id,week_number")
        .single();
      if (saveError) throw saveError;
      if (!data) throw new Error("Supabase no ha confirmado el registro semanal.");
      setWeeks((current) => current.map((item) => item.weekNumber === week.weekNumber ? { ...item, id: data.id as string } : item));
      setMessage(`Semana ${week.weekNumber} guardada y verificada.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar la semana.");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/>Cargando tu seguimiento de hábitos…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card p-5"><p className="text-sm text-slate-500">Semanas registradas</p><p className="mt-2 text-3xl font-extrabold">{summary.weeksRecorded}/4</p><p className="mt-1 text-xs text-slate-400">Un registro reflexivo por semana</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Cumplimiento medio</p><p className="mt-2 text-3xl font-extrabold">{summary.averageCompletion == null ? "—" : `${summary.averageCompletion.toFixed(0)}%`}</p><p className="mt-1 text-xs text-slate-400">Respecto al reto que tú mismo has definido</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Índice educativo · semana 1</p><p className="mt-2 text-3xl font-extrabold">{summary.first == null ? "—" : `${summary.first.toFixed(0)}%`}</p><p className="mt-1 text-xs text-slate-400">Media de tus 6 autoevaluaciones</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Cambio semana 1 → 4</p><p className="mt-2 text-3xl font-extrabold">{summary.evolution == null ? "—" : `${summary.evolution >= 0 ? "+" : ""}${summary.evolution.toFixed(0)} pp`}</p><p className="mt-1 text-xs text-slate-400">No es una nota ni una valoración clínica</p></article>
      </section>

      {(error || message) && <div role="status" className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-3"><Target className="mt-1 text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">1. Define tu reto de hábitos</h2><p className="mt-1 text-sm leading-6 text-slate-500">Elige un comportamiento que puedas observar y modificar. No registres peso, calorías, diagnósticos ni información médica.</p></div></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Hábito prioritario<select value={plan.focusHabit} onChange={(event) => updatePlan("focusHabit", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">{habitOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-700">Estado del reto<select value={plan.status} onChange={(event) => updatePlan("status", event.target.value as HabitPlan["status"])} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"><option value="draft">Borrador</option><option value="active">En marcha</option><option value="completed">Finalizado</option></select></label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Mi punto de partida<textarea value={plan.initialReflection} onChange={(event) => updatePlan("initialReflection", event.target.value)} rows={4} placeholder="¿Qué hábito quiero revisar y qué observo actualmente en mi rutina?" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6 outline-none focus:border-[#1e6b4f]"/></label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Objetivo concreto<textarea value={plan.objective} onChange={(event) => updatePlan("objective", event.target.value)} rows={3} placeholder="Ejemplo: durante cuatro semanas quiero organizar mejor…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6 outline-none focus:border-[#1e6b4f]"/></label>
          <label className="text-sm font-bold text-slate-700">Acciones que voy a realizar<textarea value={plan.actionPlan} onChange={(event) => updatePlan("actionPlan", event.target.value)} rows={4} placeholder="Qué haré, cuándo y con qué frecuencia" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/></label>
          <label className="text-sm font-bold text-slate-700">Obstáculos y alternativa<textarea value={plan.barrierStrategy} onChange={(event) => updatePlan("barrierStrategy", event.target.value)} rows={4} placeholder="Si aparece este obstáculo, probaré…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/></label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">¿Cómo sabré si avanzo?<textarea value={plan.successIndicator} onChange={(event) => updatePlan("successIndicator", event.target.value)} rows={3} placeholder="Un indicador sencillo y observable, sin datos médicos" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/></label>
        </div>
        <button type="button" disabled={saving === "plan"} onClick={() => void savePlan()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving === "plan" ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}Guardar reto</button>
      </section>

      <section id="seguimiento" className="card overflow-hidden scroll-mt-6">
        <div className="border-b border-slate-200 p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Seguimiento · 4 semanas</p><h2 className="mt-2 text-2xl font-extrabold">2. Observa tendencias, no días perfectos</h2><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">Valora cada dimensión del 1 al 5 según cómo ha sido tu semana. La finalidad es reflexionar y reajustar; no se compara con otros alumnos.</p></div>
        <div className="divide-y divide-slate-100">
          {weeks.map((week) => {
            const index = habitIndex(week);
            return (
              <article key={week.weekNumber} className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">Semana {week.weekNumber}</p><h3 className="mt-1 text-xl font-extrabold">Autoevaluación semanal</h3></div><div className="rounded-xl bg-slate-50 px-4 py-2 text-right"><p className="text-xs text-slate-400">Índice educativo</p><p className="font-extrabold">{index == null ? "—" : `${index.toFixed(0)}%`}</p></div></div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {ratingFields.map(([key, label]) => (
                    <label key={key} className="text-sm font-bold text-slate-700">{label}<select value={week[key] ?? ""} onChange={(event) => updateWeek(week.weekNumber, key as RatingKey, event.target.value === "" ? null : Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option value="">Sin valorar</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} · {value === 1 ? "Muy mejorable" : value === 2 ? "Mejorable" : value === 3 ? "Aceptable" : value === 4 ? "Bien" : "Muy bien"}</option>)}</select></label>
                  ))}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">Cumplimiento de mi reto: {week.goalCompletion}%<input type="range" min="0" max="100" step="5" value={week.goalCompletion} onChange={(event) => updateWeek(week.weekNumber, "goalCompletion", Number(event.target.value))} className="mt-3 w-full"/></label>
                  <div className="rounded-xl bg-[#e7f2ed] p-4 text-xs leading-5 text-[#164c3a]"><CheckCircle2 className="mb-2" size={17}/><strong>Importante:</strong> este porcentaje expresa tu percepción de cumplimiento del reto, no tu nivel de salud.</div>
                  <label className="text-sm font-bold text-slate-700">¿Qué ha funcionado esta semana?<textarea value={week.reflection} onChange={(event) => updateWeek(week.weekNumber, "reflection", event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/></label>
                  <label className="text-sm font-bold text-slate-700">¿Qué ajustaré la próxima semana?<textarea value={week.nextAdjustment} onChange={(event) => updateWeek(week.weekNumber, "nextAdjustment", event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/></label>
                </div>
                <button type="button" disabled={saving === `week-${week.weekNumber}`} onClick={() => void saveWeek(week)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">{saving === `week-${week.weekNumber}` ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}Guardar semana {week.weekNumber}</button>
              </article>
            );
          })}
        </div>
      </section>

      <section id="balance" className="card p-6 sm:p-8 scroll-mt-6">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Balance final</p><h2 className="mt-2 text-2xl font-extrabold">3. Explica qué has aprendido de tu rutina</h2><p className="mt-2 text-sm leading-6 text-slate-500">Compara la primera y la cuarta semana, identifica qué conducta fue más fácil de mantener y qué cambio necesitaría más tiempo.</p>
        <textarea value={plan.finalReflection} onChange={(event) => updatePlan("finalReflection", event.target.value)} rows={6} placeholder="Mi conclusión después de cuatro semanas…" className="mt-5 w-full rounded-2xl border border-slate-200 p-4 text-sm leading-7 outline-none focus:border-[#1e6b4f]"/>
        <button type="button" disabled={saving === "plan"} onClick={() => void savePlan()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving === "plan" ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}Guardar balance final</button>
      </section>

      <p className="rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">Actividad educativa de autorregistro. La web no diagnostica, prescribe dietas ni evalúa condiciones médicas. Si una cuestión de salud requiere atención individual, debe tratarse fuera de esta herramienta con los profesionales y responsables correspondientes.</p>
    </div>
  );
}
