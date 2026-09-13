"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadPhysicalTestsForCurrentStudent } from "@/lib/sa1-physical-data";
import { physicalBenchmarkComparison } from "@/lib/sa1-types";
import type { FitnessReference, PhysicalTest } from "@/lib/sa1-types";

type PlanItem = {
  id: string;
  activity: string;
  capacity: string;
  dose: string;
  recovery: string;
};

type PlanForm = {
  initialAnalysis: string;
  objective: string;
  priorityCapacity: string;
  durationWeeks: number;
  weeklyFrequency: number;
  sessionDurationMinutes: number;
  progressionStrategy: string;
  recoveryStrategy: string;
  successIndicator: string;
  status: "draft" | "active" | "completed";
  items: PlanItem[];
};

const emptyPlan: PlanForm = {
  initialAnalysis: "",
  objective: "",
  priorityCapacity: "condicion-fisica-general",
  durationWeeks: 6,
  weeklyFrequency: 3,
  sessionDurationMinutes: 45,
  progressionStrategy: "",
  recoveryStrategy: "",
  successIndicator: "",
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
      activity: typeof item.activity === "string" ? item.activity : "",
      capacity: typeof item.capacity === "string" ? item.capacity : "",
      dose: typeof item.dose === "string" ? item.dose : "",
      recovery: typeof item.recovery === "string" ? item.recovery : "",
    }));
}

export function SecondYearPersonalPlan() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyPlan);
  const [tests, setTests] = useState<PhysicalTest[]>([]);
  const [reference, setReference] = useState<FitnessReference | null>(null);
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

      setStudentId(student.id as string);
      setCourseId(student.course_id as string);

      const [planResult, physicalData] = await Promise.all([
        supabase
          .from("personal_training_plans")
          .select("initial_analysis,objective,priority_capacity,duration_weeks,weekly_frequency,session_duration_minutes,progression_strategy,recovery_strategy,success_indicator,plan_items,status")
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
          priorityCapacity: row.priority_capacity || "condicion-fisica-general",
          durationWeeks: Number(row.duration_weeks) || 6,
          weeklyFrequency: Number(row.weekly_frequency) || 3,
          sessionDurationMinutes: Number(row.session_duration_minutes) || 45,
          progressionStrategy: row.progression_strategy ?? "",
          recoveryStrategy: row.recovery_strategy ?? "",
          successIndicator: row.success_indicator ?? "",
          status: row.status === "active" || row.status === "completed" ? row.status : "draft",
          items: normalizeItems(row.plan_items),
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar el plan personal.");
    } finally {
      setLoading(false);
    }
  }

  const initialSnapshot = useMemo(() => {
    const completed = tests.filter((test) => test.september != null).length;
    if (!reference) return { completed, index: null as number | null };
    const indexes = tests
      .map((test) => physicalBenchmarkComparison(test, test.september, reference)?.index)
      .filter((value): value is number => value != null && Number.isFinite(value));
    const index = indexes.length ? indexes.reduce((sum, value) => sum + value, 0) / indexes.length : null;
    return { completed, index };
  }, [tests, reference]);

  function updateField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function addItem() {
    updateField("items", [
      ...form.items,
      { id: crypto.randomUUID(), activity: "", capacity: form.priorityCapacity, dose: "", recovery: "" },
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

  async function save() {
    if (!studentId || !courseId) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const cleanItems = form.items
        .map((item) => ({
          ...item,
          activity: item.activity.trim(),
          capacity: item.capacity.trim(),
          dose: item.dose.trim(),
          recovery: item.recovery.trim(),
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
            priority_capacity: form.priorityCapacity,
            duration_weeks: form.durationWeeks,
            weekly_frequency: form.weeklyFrequency,
            session_duration_minutes: form.sessionDurationMinutes,
            progression_strategy: form.progressionStrategy.trim(),
            recovery_strategy: form.recoveryStrategy.trim(),
            success_indicator: form.successIndicator.trim(),
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
      setMessage("Plan personal guardado y verificado en Supabase.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el plan personal.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/>Cargando tu plan personal…</div>;
  }

  return (
    <div className="space-y-6">
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
        <h2 className="text-xl font-extrabold">2. Define un objetivo y la dosis general</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold text-slate-700 md:col-span-2">Objetivo personal
            <textarea value={form.objective} onChange={(event) => updateField("objective", event.target.value)} rows={3} placeholder="Qué quiero mejorar, cuánto y en qué periodo" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-[#1e6b4f]" />
          </label>
          <label className="text-sm font-bold text-slate-700">Capacidad prioritaria
            <select value={form.priorityCapacity} onChange={(event) => updateField("priorityCapacity", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {capacityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Duración del plan
            <select value={form.durationWeeks} onChange={(event) => updateField("durationWeeks", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[4, 6, 8, 10, 12].map((value) => <option key={value} value={value}>{value} semanas</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Frecuencia semanal
            <select value={form.weeklyFrequency} onChange={(event) => updateField("weeklyFrequency", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} sesiones/semana</option>)}
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">Duración orientativa de sesión
            <select value={form.sessionDurationMinutes} onChange={(event) => updateField("sessionDurationMinutes", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">
              {[30, 45, 60, 75].map((value) => <option key={value} value={value}>{value} min</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-extrabold">3. Selecciona tareas y concreta la carga</h2><p className="mt-1 text-sm text-slate-500">Indica qué harás, qué capacidad trabaja, la dosis y la recuperación.</p></div>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17}/>Añadir ejercicio</button>
        </div>
        <div className="mt-5 space-y-3">
          {form.items.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Añade las tareas principales de tu plan. Para resistencia puedes escribir, por ejemplo, “3 × 6 min”; para fuerza, “3 × 10 repeticiones”.</div>}
          {form.items.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
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

      <section className="flex flex-col gap-3 rounded-2xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 text-emerald-300" size={20}/><div><p className="font-extrabold">Justifica el plan con tus datos y con la teoría</p><p className="mt-1 text-xs leading-5 text-slate-300">Tu objetivo, carga, progresión y recuperación deben poder explicarse usando los principios de entrenamiento estudiados.</p></div></div>
        <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950 disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>}Guardar plan</button>
      </section>
    </div>
  );
}
