"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, Loader2, MessageSquareText, Plus, Save, Trash2 } from "lucide-react";
import { secondYearExercises } from "@/lib/second-year-exercises";
import { FIRST_YEAR_PLAN_SESSIONS } from "@/lib/first-year-personal-plan-calendar";
import { SECOND_YEAR_PLAN_SESSIONS, SECOND_YEAR_PLAN_START } from "@/lib/second-year-personal-plan-calendar";
import { firstYearCalendarGroup } from "@/lib/class-groups";
import { createClient } from "@/lib/supabase/client";
import { loadPhysicalTestsForCurrentStudent } from "@/lib/sa1-physical-data";
import { secondYearPhysicalComparison } from "@/lib/second-year-progress";
import type { FitnessReference, PhysicalTest } from "@/lib/sa1-types";

type PlanItem = {
  id: string;
  activity: string;
  exerciseId: string;
  description: string;
  sessionDate: string;
  day: string;
  goal: string;
  capacity: string;
  dose: string;
  recovery: string;
};

type PlanForm = {
  initialAnalysis: string;
  objective: string;
  secondaryObjective: string;
  secondarySuccessIndicator: string;
  priorityCapacity: string;
  durationWeeks: number;
  weeklyFrequency: number;
  sessionDurationMinutes: number;
  progressionStrategy: string;
  recoveryStrategy: string;
  successIndicator: string;
  finalConclusions: string;
  futureWork: string;
  status: "draft" | "active" | "completed";
  items: PlanItem[];
};

const emptyPlan: PlanForm = {
  initialAnalysis: "",
  objective: "",
  secondaryObjective: "",
  secondarySuccessIndicator: "",
  priorityCapacity: "condicion-fisica-general",
  durationWeeks: 3,
  weeklyFrequency: 4,
  sessionDurationMinutes: 55,
  progressionStrategy: "",
  recoveryStrategy: "",
  successIndicator: "",
  finalConclusions: "",
  futureWork: "",
  status: "draft",
  items: [],
};

const capacityOptions = [
  ["condicion-fisica-general", "Condición física general"],
  ["fuerza", "Fuerza"],
  ["resistencia", "Resistencia"],
  ["velocidad", "Velocidad"],
  ["flexibilidad-movilidad", "Flexibilidad / movilidad"],
] as const;

function normalizeItems(value: unknown): PlanItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
      exerciseId: typeof item.exerciseId === "string" ? item.exerciseId : "",
      description: typeof item.description === "string" ? item.description : "",
      sessionDate: typeof item.sessionDate === "string" ? item.sessionDate : "",
      day: typeof item.day === "string" ? item.day : "",
      goal: typeof item.goal === "string" ? item.goal : "1",
      activity: typeof item.activity === "string" ? item.activity : "",
      capacity: typeof item.capacity === "string" ? item.capacity : "",
      dose: typeof item.dose === "string" ? item.dose : "",
      recovery: typeof item.recovery === "string" ? item.recovery : "",
    }));
}

export function SecondYearPersonalPlan({ courseYear = 2 }: { courseYear?: 1 | 2 }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(() => courseYear === 1 ? { ...emptyPlan, durationWeeks: 4, weeklyFrequency: 2 } : emptyPlan);
  const [classGroup, setClassGroup] = useState(courseYear === 2 ? "2º Bachillerato" : "");
  const [tests, setTests] = useState<PhysicalTest[]>([]);
  const [reference, setReference] = useState<FitnessReference | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
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

      if (courseYear === 1) {
        const { data: profile, error: profileError } = await supabase.from("profiles").select("class_group").eq("id", auth.user.id).single();
        const calendarGroup = firstYearCalendarGroup(profile?.class_group);
        if (profileError || !calendarGroup) throw new Error("Tu cuenta no tiene asignado un grupo de 1º. Consulta con el profesor.");
        setClassGroup(calendarGroup);
      }

      setStudentId(student.id as string);
      setCourseId(student.course_id as string);

      const [planResult, physicalData] = await Promise.all([
        supabase
          .from("personal_training_plans")
          .select("initial_analysis,objective,secondary_objective,secondary_success_indicator,priority_capacity,duration_weeks,weekly_frequency,session_duration_minutes,progression_strategy,recovery_strategy,success_indicator,final_conclusions,future_work,plan_items,status")
          .eq("student_id", student.id)
          .eq("course_id", student.course_id)
          .eq("sa_code", "SA1")
          .maybeSingle(),
        loadPhysicalTestsForCurrentStudent(),
      ]);

      if (planResult.error) throw planResult.error;

      setTests(physicalData.tests);
      setReference(physicalData.fitnessReference);

      if (planResult.data) {
        const row = planResult.data;
        setForm({
          initialAnalysis: row.initial_analysis ?? "",
          objective: row.objective ?? "",
          secondaryObjective: row.secondary_objective ?? "",
          secondarySuccessIndicator: row.secondary_success_indicator ?? "",
          priorityCapacity: row.priority_capacity || "condicion-fisica-general",
          durationWeeks: Number(row.duration_weeks) || 6,
          weeklyFrequency: Number(row.weekly_frequency) || 3,
          sessionDurationMinutes: Number(row.session_duration_minutes) || 45,
          progressionStrategy: row.progression_strategy ?? "",
          recoveryStrategy: row.recovery_strategy ?? "",
          successIndicator: row.success_indicator ?? "",
          finalConclusions: row.final_conclusions ?? "",
          futureWork: row.future_work ?? "",
          status: row.status === "active" || row.status === "completed" ? row.status : "draft",
          items: normalizeItems(row.plan_items),
        });
      }
    } catch (cause) {
      setLoadFailed(true);
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar el plan personal.");
    } finally {
      setLoading(false);
    }
  }

    void load();
  }, [courseYear]);

  const initialSnapshot = useMemo(() => {
    const completed = tests.filter((test) => test.september != null).length;
    if (!reference) return { completed, index: null as number | null };
    const indexes = tests
      .map((test) => secondYearPhysicalComparison(test, test.september, reference)?.index)
      .filter((value): value is number => value != null && Number.isFinite(value));
    const index = indexes.length ? indexes.reduce((sum, value) => sum + value, 0) / indexes.length : null;
    return { completed, index };
  }, [tests, reference]);
  const planSessions = courseYear === 1 ? FIRST_YEAR_PLAN_SESSIONS[classGroup] ?? [] : SECOND_YEAR_PLAN_SESSIONS;

  function updateField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function addItem() {
    const session = planSessions[Math.min(form.items.length, Math.max(planSessions.length - 1, 0))];
    updateField("items", [
      ...form.items,
      { id: crypto.randomUUID(), activity: "", exerciseId: "", description: "", sessionDate: session?.date ?? "", day: session?.day ?? "", goal: "1", capacity: form.priorityCapacity, dose: "", recovery: "" },
    ]);
  }

  function updateItem(id: string, key: keyof Omit<PlanItem, "id">, value: string) {
    updateField(
      "items",
      form.items.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  }

  function removeItem(id: string) {
    updateField("items", form.items.filter((item) => item.id !== id));
  }

  function assignSession(id: string, sessionDate: string) {
    const session = planSessions.find((item) => item.date === sessionDate);
    updateField("items", form.items.map((item) => item.id === id ? { ...item, sessionDate, day: session?.day ?? "" } : item));
  }

  function selectExercise(id: string, exerciseId: string) {
    const exercise = secondYearExercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    updateField("items", form.items.map((item) => item.id === id ? { ...item, exerciseId, activity: exercise.name, description: exercise.description, capacity: exercise.capacity, dose: exercise.dose, recovery: exercise.recovery } : item));
  }

  async function save() {
    if (!studentId || !courseId) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (form.status !== "draft" && (!form.objective.trim() || !form.successIndicator.trim())) throw new Error("Completa el objetivo principal y su indicador antes de activar el plan.");
      if (form.secondaryObjective.trim() && !form.secondarySuccessIndicator.trim()) throw new Error("Añade cómo comprobarás el segundo objetivo.");
      if (form.status === "completed" && (!form.finalConclusions.trim() || !form.futureWork.trim())) throw new Error("Completa las conclusiones y qué quieres seguir trabajando antes de finalizar el plan.");
      const supabase = createClient();
      const cleanItems = form.items
        .map((item) => ({
          ...item,
          activity: item.activity.trim(),
          capacity: item.capacity.trim(),
          dose: item.dose.trim(),
          recovery: item.recovery.trim(),
          goal: form.secondaryObjective.trim() ? item.goal : "1",
        }))
        .filter((item) => item.activity || item.dose || item.recovery);

      const { data, error: saveError } = await supabase
        .from("personal_training_plans")
        .upsert(
          {
            student_id: studentId,
            course_id: courseId,
            sa_code: "SA1",
            initial_analysis: form.initialAnalysis.trim(),
            objective: form.objective.trim(),
            secondary_objective: form.secondaryObjective.trim(),
            secondary_success_indicator: form.secondarySuccessIndicator.trim(),
            priority_capacity: form.priorityCapacity,
            duration_weeks: form.durationWeeks,
            weekly_frequency: form.weeklyFrequency,
            session_duration_minutes: form.sessionDurationMinutes,
            progression_strategy: form.progressionStrategy.trim(),
            recovery_strategy: form.recoveryStrategy.trim(),
            success_indicator: form.successIndicator.trim(),
            final_conclusions: form.finalConclusions.trim(),
            future_work: form.futureWork.trim(),
            plan_items: cleanItems,
            status: form.status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id,course_id,sa_code" },
        )
        .select("status,updated_at")
        .single();

      if (saveError) throw saveError;
      if (!data) throw new Error("Supabase no ha confirmado el guardado del plan.");
      setForm((current) => ({ ...current, items: cleanItems }));
      setMessage("Plan personal guardado.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el plan personal.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/>Cargando tu plan personal…</div>;
  }

  if (loadFailed) return <div role="alert" className="card p-6 text-red-700"><p>{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-xl border px-4 py-2 font-bold">Volver a cargar el plan</button></div>;

  return (
    <fieldset disabled={saving} className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card p-5">
          <p className="text-sm text-slate-500">Pruebas iniciales registradas</p>
          <p className="mt-2 text-3xl font-extrabold">{initialSnapshot.completed}/{tests.length || 11}</p>
          <p className="mt-1 text-xs text-slate-400">Datos de septiembre para justificar tu punto de partida</p>
        </article>
        <article className="card p-5">
          <p className="text-sm text-slate-500">Índice orientativo inicial</p>
          <p className="mt-2 text-3xl font-extrabold">{initialSnapshot.index == null ? "—" : `${initialSnapshot.index.toFixed(1)}%`}</p>
          <p className="mt-1 text-xs text-slate-400">100% = promedio de la referencia elegida</p>
        </article>
        <article className="card p-5">
          <p className="text-sm text-slate-500">Estado del plan</p>
          <p className="mt-2 text-2xl font-extrabold">{form.status === "draft" ? "Borrador" : form.status === "active" ? "En marcha" : "Finalizado"}</p>
          <p className="mt-1 text-xs text-slate-400">Puedes revisarlo cuando cambien tus datos o sensaciones</p>
        </article>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-3"><CalendarDays className="mt-1 text-[#1e6b4f]"/><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">{courseYear === 1 ? `${classGroup} · 8 sesiones` : "2º Bachillerato · 10 sesiones"}</p><h2 className="mt-2 text-xl font-extrabold">Calendario del plan personal</h2></div></div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{courseYear === 1 ? "El trabajo comienza en la última semana de octubre y termina el 23 de noviembre." : `El periodo comienza el ${formatPlanDate(SECOND_YEAR_PLAN_START)}. Al ser festivo, la primera sesión lectiva es el 13 de octubre y la décima termina el 28 de octubre.`} Las tareas que añadas abajo aparecerán automáticamente en la sesión elegida.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{planSessions.map((session, index) => {
          const assigned = form.items.filter((item) => item.sessionDate === session.date);
          return <article key={session.date} className={`rounded-xl border p-4 ${assigned.length ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}><p className="text-xs font-bold text-[#1e6b4f]">Sesión {index + 1}</p><p className="mt-1 text-sm font-extrabold">{formatPlanDate(session.date)}</p><p className="mt-1 text-xs text-slate-500">{session.day} · {session.start}–{session.end}</p><div className="mt-3 space-y-2">{assigned.map((item) => <p key={item.id} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700">{item.activity.trim() || "Tarea en preparación"}{item.dose.trim() ? ` · ${item.dose}` : ""}</p>)}{!assigned.length && <p className="text-xs text-slate-400">Sin tareas asignadas</p>}</div></article>;
        })}</div>
        {form.items.some((item) => !planSessions.some((session) => session.date === item.sessionDate)) && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><p className="font-bold">Tareas pendientes de fecha</p><p className="mt-1">Conservamos tus tareas anteriores. Elige su sesión en el apartado 3 para verlas en el calendario.</p><ul className="mt-2 list-inside list-disc">{form.items.filter((item) => !planSessions.some((session) => session.date === item.sessionDate)).map((item) => <li key={item.id}>{item.activity || "Tarea en preparación"}{item.day ? ` · ${item.day}` : ""}</li>)}</ul></div>}
      </section>

      {(error || message) && (
        <div className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || message}
        </div>
      )}

      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-1 text-[#1e6b4f]" />
          <div>
            <h2 className="text-xl font-extrabold">1. Interpreta tu punto de partida</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">No copies una rutina. Explica qué muestran tus datos iniciales, qué capacidad quieres priorizar y por qué.</p>
          </div>
        </div>
        <label className="mt-6 block text-sm font-bold text-slate-700">
          Mi diagnóstico inicial
          <textarea value={form.initialAnalysis} onChange={(event) => updateField("initialAnalysis", event.target.value)} rows={5} placeholder="Ejemplo: mis resultados muestran mejor rendimiento en… y quiero mejorar…" className="mt-2 w-full rounded-2xl border border-slate-200 p-4 text-sm font-normal leading-6 outline-none focus:border-[#1e6b4f]" />
        </label>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">2. Define uno o dos objetivos y la dosis general</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Objetivo principal
            <textarea value={form.objective} onChange={(event) => updateField("objective", event.target.value)} rows={3} placeholder="Qué quiero mejorar, cuánto y en qué periodo" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#1e6b4f]" />
          </label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Segundo objetivo (opcional)
            <textarea value={form.secondaryObjective} onChange={(event) => updateField("secondaryObjective", event.target.value)} rows={2} placeholder="Una segunda mejora concreta que complemente la principal" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
          </label>
          {form.secondaryObjective && <label className="text-sm font-bold text-slate-700 md:col-span-2">¿Cómo comprobaré el segundo objetivo?
            <textarea value={form.secondarySuccessIndicator} onChange={(event) => updateField("secondarySuccessIndicator", event.target.value)} rows={2} placeholder="Indicador, punto de partida y fecha de revisión" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
          </label>}
          <label className="text-sm font-bold text-slate-700">Capacidad prioritaria
            <select value={form.priorityCapacity} onChange={(event) => updateField("priorityCapacity", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {capacityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Duración del plan
            <select value={form.durationWeeks} onChange={(event) => updateField("durationWeeks", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[3, 4, 6, 8, 10, 12].map((value) => <option key={value} value={value}>{value} semanas</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Frecuencia semanal
            <select value={form.weeklyFrequency} onChange={(event) => updateField("weeklyFrequency", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} sesiones/semana</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Duración orientativa de sesión
            <select value={form.sessionDurationMinutes} onChange={(event) => updateField("sessionDurationMinutes", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[30, 45, 55, 60, 75].map((value) => <option key={value} value={value}>{value} min</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-extrabold">3. Selecciona tareas y concreta la carga</h2><p className="mt-1 text-sm text-slate-500">Elige un ejercicio, asígnalo a una sesión del calendario y adapta su carga. Las dosis son orientaciones escolares; revísalas con el profesor.</p></div>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17}/>Añadir tarea</button>
        </div>
        <div className="mt-5 space-y-3">
          {form.items.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Añade las tareas principales de tu plan. Para resistencia puedes escribir, por ejemplo, “3 × 6 min”; para fuerza, “3 × 10 repeticiones”.</div>}
          {form.items.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-2">
              <label className="text-sm font-bold md:col-span-2">Elegir ejercicio {index + 1} del catálogo
                <select value={item.exerciseId} onChange={(event) => selectExercise(item.id, event.target.value)} className="mt-2 w-full min-w-0 rounded-xl border p-3 text-sm"><option value="">Selecciona un ejercicio o conserva tu tarea propia</option>{secondYearExercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select>
              </label>
              {item.description && <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 md:col-span-2"><p>{item.description}</p><p className="mt-2 text-xs text-slate-500">{secondYearExercises.find((exercise) => exercise.id === item.exerciseId)?.source}</p></div>}
              <label className="text-xs font-bold text-slate-500">Sesión del calendario<select value={item.sessionDate} onChange={(event) => assignSession(item.id, event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm"><option value="">Por concretar</option>{planSessions.map((session, sessionIndex) => <option key={session.date} value={session.date}>Sesión {sessionIndex + 1} · {formatPlanDate(session.date)} · {session.start}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-500">Objetivo al que contribuye<select value={item.goal} onChange={(event) => updateItem(item.id, "goal", event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm"><option value="1">Principal</option><option value="2" disabled={!form.secondaryObjective.trim()}>Segundo objetivo</option><option value="both" disabled={!form.secondaryObjective.trim()}>Ambos</option></select></label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Actividad
                <input value={item.activity} onChange={(event) => updateItem(item.id, "activity", event.target.value)} placeholder={`Ejercicio ${index + 1}`} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium normal-case tracking-normal" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Capacidad
                <select value={item.capacity} onChange={(event) => updateItem(item.id, "capacity", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium normal-case tracking-normal">
                  {capacityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Dosis
                <input value={item.dose} onChange={(event) => updateItem(item.id, "dose", event.target.value)} placeholder="3×10 / 20 min" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium normal-case tracking-normal" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Recuperación
                <input value={item.recovery} onChange={(event) => updateItem(item.id, "recovery", event.target.value)} placeholder="60 s / 2 min" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium normal-case tracking-normal" />
              </label>
              <button type="button" onClick={() => removeItem(item.id)} aria-label="Eliminar ejercicio" className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">4. Planifica progresión, recuperación y evaluación</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">¿Cómo progresaré?
            <textarea value={form.progressionStrategy} onChange={(event) => updateField("progressionStrategy", event.target.value)} rows={4} placeholder="Qué variable modificaré y cuándo" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
          </label>
          <label className="text-sm font-bold text-slate-700">¿Cómo recuperaré?
            <textarea value={form.recoveryStrategy} onChange={(event) => updateField("recoveryStrategy", event.target.value)} rows={4} placeholder="Descansos, distribución semanal, sueño, días suaves…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
          </label>
          <label className="text-sm font-bold text-slate-700 md:col-span-2">¿Cómo sabré si mi plan funciona?
            <textarea value={form.successIndicator} onChange={(event) => updateField("successIndicator", event.target.value)} rows={3} placeholder="Marca o indicador que compararé en la segunda toma" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
          </label>
          <label className="text-sm font-bold text-slate-700">Estado
            <select value={form.status} onChange={(event) => updateField("status", event.target.value as PlanForm["status"])} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              <option value="draft">Borrador</option>
              <option value="active">En marcha</option>
              <option value="completed">Finalizado</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-3"><MessageSquareText className="mt-1 text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">5. Reflexión personal tras el plan</h2><p className="mt-1 text-sm leading-6 text-slate-500">Completa este apartado después de realizar las sesiones y revisar tus resultados, sensaciones y grado de cumplimiento.</p></div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Mis conclusiones
            <textarea value={form.finalConclusions} onChange={(event) => updateField("finalConclusions", event.target.value)} rows={6} placeholder="Qué ha funcionado, qué cambios he observado, qué dificultades he tenido y qué modificaría del plan." className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/>
          </label>
          <label className="text-sm font-bold text-slate-700">¿Qué me gustaría seguir trabajando?
            <textarea value={form.futureWork} onChange={(event) => updateField("futureWork", event.target.value)} rows={6} placeholder="Capacidad, hábito u objetivo que quiero mantener o mejorar en el futuro y cómo podría continuar." className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal leading-6"/>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 text-emerald-300" size={20}/><div><p className="font-extrabold">Justifica el plan con tus datos y con la teoría</p><p className="mt-1 text-xs leading-5 text-slate-300">Tu objetivo, carga, progresión y recuperación deben poder explicarse usando los principios de entrenamiento estudiados.</p></div></div>
        <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>}Guardar plan</button>
      </section>
    </fieldset>
  );
}

function formatPlanDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
}
