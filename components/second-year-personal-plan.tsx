"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CheckCircle2, FileDown, Loader2, MessageSquareText, Plus, Save, Trash2 } from "lucide-react";
import { PersonalPlanTaskEditor } from "@/components/personal-plan-task-editor";
import { cleanPlanItems, emptyExercise, methodologyLabels, normalizeItems, type PlanItem } from "@/lib/personal-plan-tasks";
import { FIRST_YEAR_PLAN_SESSIONS } from "@/lib/first-year-personal-plan-calendar";
import { SECOND_YEAR_PLAN_SESSIONS, SECOND_YEAR_PLAN_START } from "@/lib/second-year-personal-plan-calendar";
import { firstYearCalendarGroup } from "@/lib/class-groups";
import { createClient } from "@/lib/supabase/client";
import { loadPhysicalTestsForCurrentStudent } from "@/lib/sa1-physical-data";
import { secondYearPhysicalComparison } from "@/lib/second-year-progress";
import type { FitnessReference, PhysicalTest } from "@/lib/sa1-types";
import { downloadPersonalPlanPdf } from "@/lib/personal-plan-pdf";

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

export function SecondYearPersonalPlan({ courseYear = 2 }: { courseYear?: 1 | 2 }) {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(() => courseYear === 1 ? { ...emptyPlan, durationWeeks: 4, weeklyFrequency: 2 } : emptyPlan);
  const [classGroup, setClassGroup] = useState(courseYear === 2 ? "2º Bachillerato" : "");
  const [studentName, setStudentName] = useState("Alumno/a");
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

      const { data: profile, error: profileError } = await supabase.from("profiles").select("display_name,class_group").eq("id", auth.user.id).single();
      if (profileError) throw new Error("No se ha podido cargar tu perfil.");
      setStudentName(profile?.display_name?.trim() || "Alumno/a");

      if (courseYear === 1) {
        const calendarGroup = firstYearCalendarGroup(profile?.class_group);
        if (!calendarGroup) throw new Error("Tu cuenta no tiene asignado un grupo de 1º. Consulta con el profesor.");
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
          durationWeeks: courseYear === 2 ? 3 : Number(row.duration_weeks) || 4,
          weeklyFrequency: courseYear === 2 ? 4 : Number(row.weekly_frequency) || 2,
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

  function addItem(date?: string) {
    const session = planSessions.find((entry) => entry.date === date) ?? planSessions[0];
    updateField("items", [
      ...form.items,
      { id: crypto.randomUUID(), activity: "", sessionDate: session?.date ?? "", day: session?.day ?? "", goal: "1", methodology: "circuit", rounds: "1", roundRecovery: "", exercises: [emptyExercise()] },
    ]);
  }

  function updateItem(id: string, key: "activity" | "goal", value: string) {
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
      const cleanItems = cleanPlanItems(form.items, Boolean(form.secondaryObjective.trim()));

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
            duration_weeks: courseYear === 2 ? 3 : form.durationWeeks,
            weekly_frequency: courseYear === 2 ? 4 : form.weeklyFrequency,
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

  function exportPdf() {
    const capacity = capacityOptions.find(([value]) => value === form.priorityCapacity)?.[1] ?? form.priorityCapacity;
    const status = form.status === "draft" ? "Borrador" : form.status === "active" ? "En marcha" : "Finalizado";
    const taskLines = planSessions.flatMap((session, index) => {
      const items = form.items.filter((item) => item.sessionDate === session.date);
      if (!items.length) return [`• Sesión ${index + 1} - ${formatPlanDate(session.date)} - Sin tareas asignadas`];
      return items.flatMap((item) => [`• Sesión ${index + 1} - ${formatPlanDate(session.date)} - ${item.activity || "Tarea"} - ${methodologyLabels[item.methodology]} - ${item.rounds} serie(s)${item.roundRecovery ? ` - descanso entre series: ${item.roundRecovery} min` : ""}`, ...item.exercises.map((exercise, exerciseIndex) => `  ${exerciseIndex + 1}. ${exercise.activity || "Ejercicio por concretar"}${exercise.dose ? ` - ${exercise.dose}` : ""}${exercise.recovery ? ` - descanso ${exercise.recovery}` : ""}`)]);
    });
    downloadPersonalPlanPdf({ studentName, courseLabel: `${courseYear}º Bachillerato`, group: classGroup || `${courseYear}º Bachillerato`, status, capacity, sections: [
      { title: "1. Punto de partida", lines: [form.initialAnalysis || "Sin completar"] },
      { title: "2. Objetivos y temporalización", lines: [`Objetivo principal: ${form.objective || "Sin completar"}`, `Cómo comprobaré mi objetivo principal: ${form.successIndicator || "Sin completar"}`, ...(form.secondaryObjective ? [`Segundo objetivo: ${form.secondaryObjective}`, `Indicador del segundo objetivo: ${form.secondarySuccessIndicator || "Sin completar"}`] : []), `${courseYear === 2 ? 3 : form.durationWeeks} semanas - ${courseYear === 2 ? 4 : form.weeklyFrequency} sesiones/semana - ${form.sessionDurationMinutes} min por sesión`] },
      { title: "3. Calendario, tareas y cargas", lines: taskLines },
      { title: "4. Progresión y recuperación", lines: [`Progresión: ${form.progressionStrategy || "Sin completar"}`, `Recuperación: ${form.recoveryStrategy || "Sin completar"}`] },
      { title: "5. Reflexión final", lines: [`Conclusiones: ${form.finalConclusions || "Pendiente al finalizar el plan"}`, `Qué quiero seguir trabajando: ${form.futureWork || "Pendiente al finalizar el plan"}`] },
    ] });
    setMessage("PDF descargado. Revisa la carpeta de descargas de tu dispositivo.");
  }

  if (loading) {
    return <div className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/>Cargando tu plan personal…</div>;
  }

  if (loadFailed) return <div role="alert" className="card p-6 text-red-700"><p>{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-xl border px-4 py-2 font-bold">Volver a cargar el plan</button></div>;

  return (
    <fieldset disabled={saving} className="space-y-6">
      <PrintablePlan courseYear={courseYear} classGroup={classGroup} studentName={studentName} form={form} sessions={planSessions}/>
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
          return <article key={session.date} className={`rounded-xl border p-4 ${assigned.length ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}><p className="text-xs font-bold text-[#1e6b4f]">Sesión {index + 1}</p><p className="mt-1 text-sm font-extrabold">{formatPlanDate(session.date)}</p><p className="mt-1 text-xs text-slate-500">{session.day} · {session.start}–{session.end}</p><div className="mt-3 space-y-2">{assigned.map((item) => <div key={item.id} className="rounded-lg bg-white px-3 py-2 text-xs text-slate-700"><p className="font-bold">{item.activity.trim() || "Tarea en preparación"}</p><p className="mt-1">{methodologyLabels[item.methodology]} · {item.rounds} serie(s)</p><ol className="mt-2 list-inside list-decimal space-y-1">{item.exercises.map((exercise) => <li key={exercise.id}>{exercise.activity || "Ejercicio por elegir"}{exercise.dose ? ` · ${exercise.dose}` : ""}</li>)}</ol></div>)}{!assigned.length && <p className="text-xs text-slate-400">Sin tareas asignadas</p>}</div><button type="button" onClick={() => addItem(session.date)} className="mt-3 text-xs font-bold text-[#1e6b4f] underline">Añadir tarea a esta sesión</button></article>;
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
          <label className="text-sm font-bold text-slate-700 md:col-span-2">¿Cómo comprobaré mi objetivo principal?
            <textarea value={form.successIndicator} onChange={(event) => updateField("successIndicator", event.target.value)} rows={3} placeholder="Indica qué prueba, marca o evidencia compararás al terminar el plan" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#1e6b4f]" />
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
          {courseYear === 2 ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700"><p className="font-bold">Duración del plan</p><p className="mt-2 text-base font-extrabold text-[#1e6b4f]">3 semanas</p><p className="mt-1 text-xs">Establecida por el calendario de la SA1.</p></div> : <label className="text-sm font-bold text-slate-700">Duración del plan
            <select value={form.durationWeeks} onChange={(event) => updateField("durationWeeks", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[3, 4, 6, 8, 10, 12].map((value) => <option key={value} value={value}>{value} semanas</option>)}
            </select>
          </label>}
          {courseYear === 2 ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700"><p className="font-bold">Frecuencia semanal</p><p className="mt-2 text-base font-extrabold text-[#1e6b4f]">4 sesiones por semana</p><p className="mt-1 text-xs">Distribuidas según el calendario lectivo.</p></div> : <label className="text-sm font-bold text-slate-700">Frecuencia semanal
            <select value={form.weeklyFrequency} onChange={(event) => updateField("weeklyFrequency", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} sesiones/semana</option>)}
            </select>
          </label>}
          <label className="text-sm font-bold text-slate-700">Duración orientativa de sesión
            <select value={form.sessionDurationMinutes} onChange={(event) => updateField("sessionDurationMinutes", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[30, 45, 55, 60, 75].map((value) => <option key={value} value={value}>{value} min</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-extrabold">3. Selecciona tareas y concreta la carga</h2><p className="mt-1 text-sm text-slate-500">Crea una tarea de circuit training o total training y añade todos sus ejercicios. Asigna la tarea a una sesión y adapta las cargas con el profesor.</p></div>
          <button type="button" onClick={() => addItem()} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17}/>Añadir tarea</button>
        </div>
        <div className="mt-5 space-y-3">
          {form.items.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Añade las tareas principales de tu plan. Para resistencia puedes escribir, por ejemplo, “3 × 6 min”; para fuerza, “3 × 10 repeticiones”.</div>}
          {form.items.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-2">
              <label className="text-xs font-bold text-slate-500">Sesión del calendario<select value={item.sessionDate} onChange={(event) => assignSession(item.id, event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm"><option value="">Por concretar</option>{planSessions.map((session, sessionIndex) => <option key={session.date} value={session.date}>Sesión {sessionIndex + 1} · {formatPlanDate(session.date)} · {session.start}</option>)}</select></label>
              <label className="text-xs font-bold text-slate-500">Objetivo al que contribuye<select value={item.goal} onChange={(event) => updateItem(item.id, "goal", event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm"><option value="1">Principal</option><option value="2" disabled={!form.secondaryObjective.trim()}>Segundo objetivo</option><option value="both" disabled={!form.secondaryObjective.trim()}>Ambos</option></select></label>
              <PersonalPlanTaskEditor item={item} onChange={(updated) => updateField("items", form.items.map((entry) => entry.id === item.id ? updated : entry))}/>
              <button type="button" onClick={() => removeItem(item.id)} aria-label={`Eliminar tarea ${index + 1}`} className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="mr-2 inline" size={18}/>Eliminar tarea completa</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-extrabold">4. Planifica la progresión y la recuperación</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">¿Cómo progresaré?
            <textarea value={form.progressionStrategy} onChange={(event) => updateField("progressionStrategy", event.target.value)} rows={4} placeholder="Qué variable modificaré y cuándo" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
          </label>
          <label className="text-sm font-bold text-slate-700">¿Cómo recuperaré?
            <textarea value={form.recoveryStrategy} onChange={(event) => updateField("recoveryStrategy", event.target.value)} rows={4} placeholder="Descansos, distribución semanal, sueño, días suaves…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" />
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

      <section className="plan-actions flex flex-col gap-3 rounded-2xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 text-emerald-300" size={20}/><div><p className="font-extrabold">Justifica el plan con tus datos y con la teoría</p><p className="mt-1 text-xs leading-5 text-slate-300">Tu objetivo, carga, progresión y recuperación deben poder explicarse usando los principios de entrenamiento estudiados.</p></div></div>
        <div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={!form.objective.trim() || form.items.length === 0} onClick={exportPdf} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40" title={!form.objective.trim() || form.items.length === 0 ? "Añade al menos un objetivo y una tarea para exportar" : "Descargar el plan en formato PDF"}><FileDown size={17}/>Descargar PDF</button><button type="button" disabled={saving} onClick={() => void save()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>}Guardar plan</button></div>
      </section>
    </fieldset>
  );
}

function PrintablePlan({ courseYear, classGroup, studentName, form, sessions }: { courseYear: 1 | 2; classGroup: string; studentName: string; form: PlanForm; sessions: typeof SECOND_YEAR_PLAN_SESSIONS }) {
  const capacity = capacityOptions.find(([value]) => value === form.priorityCapacity)?.[1] ?? form.priorityCapacity;
  const status = form.status === "draft" ? "Borrador" : form.status === "active" ? "En marcha" : "Finalizado";
  return <article id="personal-plan-export" className="plan-print-sheet" aria-hidden="true">
    <header className="plan-print-header"><div><p>Educación Física · Maristas Badajoz</p><h1>Plan personal · SA1</h1></div><strong>{courseYear}º Bachillerato</strong></header>
    <dl className="plan-print-meta"><div><dt>Alumno/a</dt><dd>{studentName}</dd></div><div><dt>Grupo</dt><dd>{classGroup || `${courseYear}º Bachillerato`}</dd></div><div><dt>Estado</dt><dd>{status}</dd></div><div><dt>Capacidad prioritaria</dt><dd>{capacity}</dd></div></dl>
    <PrintSection title="1. Punto de partida"><p>{form.initialAnalysis || "Sin completar"}</p></PrintSection>
    <PrintSection title="2. Objetivos y temporalización"><h3>Objetivo principal</h3><p>{form.objective || "Sin completar"}</p><h3>¿Cómo comprobaré mi objetivo principal?</h3><p>{form.successIndicator || "Sin completar"}</p>{form.secondaryObjective && <><h3>Segundo objetivo</h3><p>{form.secondaryObjective}</p><h3>Indicador del segundo objetivo</h3><p>{form.secondarySuccessIndicator || "Sin completar"}</p></>}<p><strong>Duración:</strong> {courseYear === 2 ? 3 : form.durationWeeks} semanas · <strong>Frecuencia:</strong> {courseYear === 2 ? 4 : form.weeklyFrequency} sesiones/semana · <strong>Sesión:</strong> {form.sessionDurationMinutes} min</p></PrintSection>
    <PrintSection title="3. Calendario y tareas"><div className="plan-print-sessions">{sessions.map((session, index) => { const items = form.items.filter((item) => item.sessionDate === session.date); return <section key={session.date}><h3>Sesión {index + 1} · {formatPlanDate(session.date)} · {session.start}-{session.end}</h3>{items.length ? items.map((item) => <div key={item.id} className="plan-print-task"><p><strong>{item.activity || "Tarea"}</strong> · {methodologyLabels[item.methodology]} · {item.rounds} serie(s){item.roundRecovery ? ` · descanso entre series: ${item.roundRecovery} min` : ""}</p><ol>{item.exercises.map((exercise) => <li key={exercise.id}>{exercise.activity || "Ejercicio por concretar"}{exercise.dose ? ` · ${exercise.dose}` : ""}{exercise.recovery ? ` · descanso ${exercise.recovery}` : ""}</li>)}</ol></div>) : <p className="plan-print-empty">Sin tareas asignadas</p>}</section>; })}</div></PrintSection>
    <PrintSection title="4. Progresión y recuperación"><h3>Progresión</h3><p>{form.progressionStrategy || "Sin completar"}</p><h3>Recuperación</h3><p>{form.recoveryStrategy || "Sin completar"}</p></PrintSection>
    <PrintSection title="5. Reflexión final"><h3>Conclusiones</h3><p>{form.finalConclusions || "Pendiente al finalizar el plan"}</p><h3>Qué quiero seguir trabajando</h3><p>{form.futureWork || "Pendiente al finalizar el plan"}</p></PrintSection>
    <footer>Documento generado desde la plataforma de Educación Física · Los datos corresponden al plan visible en pantalla.</footer>
  </article>;
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="plan-print-section"><h2>{title}</h2>{children}</section>;
}

function formatPlanDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(`${value}T12:00:00`));
}
