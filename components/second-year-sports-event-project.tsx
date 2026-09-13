"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDollarSign, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RoleItem = { id: string; area: string; responsible: string };
type MaterialItem = { id: string; name: string; quantity: string };
type BudgetItem = { id: string; concept: string; quantity: string; unitCost: string };
type TimelineItem = { id: string; task: string; responsible: string; deadline: string; done: boolean };

type EventForm = {
  eventName: string;
  purpose: string;
  targetAudience: string;
  activityType: string;
  eventFormat: string;
  venue: string;
  eventDate: string;
  participantsEstimate: string;
  teamName: string;
  personalRole: string;
  teamRoles: RoleItem[];
  rules: string;
  inclusionMeasures: string;
  safetyMeasures: string;
  materials: MaterialItem[];
  budgetItems: BudgetItem[];
  timeline: TimelineItem[];
  communicationPlan: string;
  sustainabilityMeasures: string;
  evaluationPlan: string;
  finalReflection: string;
  status: "draft" | "planning" | "ready" | "completed";
};

const emptyForm: EventForm = {
  eventName: "",
  purpose: "",
  targetAudience: "",
  activityType: "",
  eventFormat: "",
  venue: "",
  eventDate: "",
  participantsEstimate: "",
  teamName: "",
  personalRole: "",
  teamRoles: [],
  rules: "",
  inclusionMeasures: "",
  safetyMeasures: "",
  materials: [],
  budgetItems: [],
  timeline: [],
  communicationPlan: "",
  sustainabilityMeasures: "",
  evaluationPlan: "",
  finalReflection: "",
  status: "draft",
};

function id() {
  return crypto.randomUUID();
}

function normalizeRoles(value: unknown): RoleItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => {
    const row = item as Record<string, unknown>;
    return { id: typeof row.id === "string" ? row.id : id(), area: typeof row.area === "string" ? row.area : "", responsible: typeof row.responsible === "string" ? row.responsible : "" };
  });
}

function normalizeMaterials(value: unknown): MaterialItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => {
    const row = item as Record<string, unknown>;
    return { id: typeof row.id === "string" ? row.id : id(), name: typeof row.name === "string" ? row.name : "", quantity: typeof row.quantity === "string" ? row.quantity : String(row.quantity ?? "") };
  });
}

function normalizeBudget(value: unknown): BudgetItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => {
    const row = item as Record<string, unknown>;
    return { id: typeof row.id === "string" ? row.id : id(), concept: typeof row.concept === "string" ? row.concept : "", quantity: typeof row.quantity === "string" ? row.quantity : String(row.quantity ?? ""), unitCost: typeof row.unitCost === "string" ? row.unitCost : String(row.unitCost ?? "") };
  });
}

function normalizeTimeline(value: unknown): TimelineItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => {
    const row = item as Record<string, unknown>;
    return { id: typeof row.id === "string" ? row.id : id(), task: typeof row.task === "string" ? row.task : "", responsible: typeof row.responsible === "string" ? row.responsible : "", deadline: typeof row.deadline === "string" ? row.deadline : "", done: row.done === true };
  });
}

const fieldClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal outline-none focus:border-[#1e6b4f] focus:ring-2 focus:ring-[#1e6b4f]/10";

export function SecondYearSportsEventProject() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("No se ha podido identificar al alumno.");
      const { data: student, error: studentError } = await supabase.from("students").select("id,course_id").eq("profile_id", auth.user.id).eq("active", true).single();
      if (studentError || !student) throw new Error("No se ha encontrado el perfil de alumno.");
      setStudentId(student.id as string);
      setCourseId(student.course_id as string);

      const { data, error: projectError } = await supabase
        .from("sports_event_projects")
        .select("event_name,purpose,target_audience,activity_type,event_format,venue,event_date,participants_estimate,team_name,personal_role,team_roles,rules,inclusion_measures,safety_measures,materials,budget_items,timeline,communication_plan,sustainability_measures,evaluation_plan,final_reflection,status")
        .eq("student_id", student.id)
        .eq("course_id", student.course_id)
        .eq("sa_code", "SA4")
        .maybeSingle();
      if (projectError) throw projectError;
      if (data) {
        setForm({
          eventName: data.event_name ?? "",
          purpose: data.purpose ?? "",
          targetAudience: data.target_audience ?? "",
          activityType: data.activity_type ?? "",
          eventFormat: data.event_format ?? "",
          venue: data.venue ?? "",
          eventDate: data.event_date ?? "",
          participantsEstimate: data.participants_estimate == null ? "" : String(data.participants_estimate),
          teamName: data.team_name ?? "",
          personalRole: data.personal_role ?? "",
          teamRoles: normalizeRoles(data.team_roles),
          rules: data.rules ?? "",
          inclusionMeasures: data.inclusion_measures ?? "",
          safetyMeasures: data.safety_measures ?? "",
          materials: normalizeMaterials(data.materials),
          budgetItems: normalizeBudget(data.budget_items),
          timeline: normalizeTimeline(data.timeline),
          communicationPlan: data.communication_plan ?? "",
          sustainabilityMeasures: data.sustainability_measures ?? "",
          evaluationPlan: data.evaluation_plan ?? "",
          finalReflection: data.final_reflection ?? "",
          status: data.status === "planning" || data.status === "ready" || data.status === "completed" ? data.status : "draft",
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar el proyecto.");
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof EventForm>(key: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  const readiness = useMemo(() => {
    const checks = [
      Boolean(form.eventName.trim() && form.purpose.trim()),
      Boolean(form.targetAudience.trim() && form.activityType.trim() && form.eventFormat.trim()),
      Boolean(form.venue.trim() && form.participantsEstimate.trim()),
      Boolean(form.teamName.trim() && form.personalRole.trim() && form.teamRoles.some((row) => row.area.trim() && row.responsible.trim())),
      Boolean(form.rules.trim()),
      Boolean(form.inclusionMeasures.trim()),
      Boolean(form.safetyMeasures.trim()),
      form.materials.some((row) => row.name.trim()),
      form.timeline.some((row) => row.task.trim() && row.responsible.trim()),
      Boolean(form.communicationPlan.trim() && form.evaluationPlan.trim()),
    ];
    const completed = checks.filter(Boolean).length;
    return { completed, total: checks.length, percent: Math.round((completed / checks.length) * 100) };
  }, [form]);

  const budgetTotal = useMemo(() => form.budgetItems.reduce((sum, row) => {
    const quantity = Number.parseFloat(row.quantity.replace(",", ".")) || 0;
    const unitCost = Number.parseFloat(row.unitCost.replace(",", ".")) || 0;
    return sum + quantity * unitCost;
  }, 0), [form.budgetItems]);

  async function save() {
    if (!studentId || !courseId) return;
    const participants = form.participantsEstimate.trim() === "" ? null : Number(form.participantsEstimate);
    if (participants != null && (!Number.isInteger(participants) || participants < 1 || participants > 1000)) {
      setError("El número estimado de participantes debe estar entre 1 y 1000.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error: saveError } = await supabase.from("sports_event_projects").upsert({
        student_id: studentId,
        course_id: courseId,
        sa_code: "SA4",
        event_name: form.eventName.trim(),
        purpose: form.purpose.trim(),
        target_audience: form.targetAudience.trim(),
        activity_type: form.activityType.trim(),
        event_format: form.eventFormat.trim(),
        venue: form.venue.trim(),
        event_date: form.eventDate || null,
        participants_estimate: participants,
        team_name: form.teamName.trim(),
        personal_role: form.personalRole.trim(),
        team_roles: form.teamRoles,
        rules: form.rules.trim(),
        inclusion_measures: form.inclusionMeasures.trim(),
        safety_measures: form.safetyMeasures.trim(),
        materials: form.materials,
        budget_items: form.budgetItems,
        timeline: form.timeline,
        communication_plan: form.communicationPlan.trim(),
        sustainability_measures: form.sustainabilityMeasures.trim(),
        evaluation_plan: form.evaluationPlan.trim(),
        final_reflection: form.finalReflection.trim(),
        status: form.status,
        updated_at: new Date().toISOString(),
      }, { onConflict: "student_id,course_id,sa_code" }).select("id,status,updated_at").single();
      if (saveError) throw saveError;
      if (!data) throw new Error("Supabase no ha confirmado el guardado del proyecto.");
      setMessage("Proyecto del evento guardado y verificado en Supabase.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el proyecto.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/>Cargando proyecto del evento…</div>;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card p-5"><p className="text-sm text-slate-500">Preparación del evento</p><p className="mt-2 text-3xl font-extrabold">{readiness.percent}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-[#1e6b4f]" style={{ width: `${readiness.percent}%` }}/></div><p className="mt-2 text-xs text-slate-400">{readiness.completed}/{readiness.total} bloques esenciales preparados</p></article>
        <article className="card p-5"><CircleDollarSign className="text-[#1e6b4f]" size={20}/><p className="mt-3 text-sm text-slate-500">Presupuesto estimado</p><p className="mt-1 text-3xl font-extrabold">{budgetTotal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p><p className="mt-1 text-xs text-slate-400">Estimación didáctica; no implica gasto real</p></article>
        <article className="card p-5"><CheckCircle2 className="text-[#1e6b4f]" size={20}/><p className="mt-3 text-sm text-slate-500">Tareas completadas</p><p className="mt-1 text-3xl font-extrabold">{form.timeline.filter((row) => row.done).length}/{form.timeline.length}</p><p className="mt-1 text-xs text-slate-400">Cronograma del equipo</p></article>
      </section>

      {(error || message) && <div role="status" className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

      <section className="card p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">1. Idea y propósito</p><h2 className="mt-1 text-xl font-extrabold">¿Qué evento queremos crear y para qué?</h2></div><StatusSelect value={form.status} onChange={(value) => update("status", value)}/></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Nombre del evento" value={form.eventName} onChange={(value) => update("eventName", value)} placeholder="Ej.: Maristas Activa Cup"/>
          <Field label="Actividad o deporte principal" value={form.activityType} onChange={(value) => update("activityType", value)} placeholder="Deporte, reto, circuito, torneo…"/>
          <Area label="Finalidad del evento" value={form.purpose} onChange={(value) => update("purpose", value)} placeholder="Qué queremos conseguir con el evento y qué experiencia queremos ofrecer"/>
          <Area label="Destinatarios" value={form.targetAudience} onChange={(value) => update("targetAudience", value)} placeholder="A quién va dirigido y qué necesidades debemos tener en cuenta"/>
          <Field label="Formato" value={form.eventFormat} onChange={(value) => update("eventFormat", value)} placeholder="Liga, eliminatoria, estaciones, jornada participativa…"/>
          <Field label="Instalación / espacio" value={form.venue} onChange={(value) => update("venue", value)} placeholder="Pabellón, patio, pista, parque…"/>
          <label className="text-sm font-bold text-slate-700">Fecha prevista<input type="date" value={form.eventDate} onChange={(event) => update("eventDate", event.target.value)} className={fieldClass}/></label>
          <label className="text-sm font-bold text-slate-700">Participantes estimados<input type="number" min={1} max={1000} value={form.participantsEstimate} onChange={(event) => update("participantsEstimate", event.target.value)} className={fieldClass} placeholder="Ej.: 60"/></label>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">2. Equipo y responsabilidades</p><h2 className="mt-1 text-xl font-extrabold">Cada tarea debe tener una persona responsable</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Nombre del equipo organizador" value={form.teamName} onChange={(value) => update("teamName", value)} placeholder="Nombre del grupo"/><Field label="Mi responsabilidad principal" value={form.personalRole} onChange={(value) => update("personalRole", value)} placeholder="Coordinación, arbitraje, material, comunicación…"/></div>
        <ListHeader title="Reparto de roles" onAdd={() => update("teamRoles", [...form.teamRoles, { id: id(), area: "", responsible: "" }])}/>
        <div className="mt-3 space-y-3">{form.teamRoles.length === 0 && <Empty text="Añade las áreas necesarias y quién se responsabiliza de cada una."/>}{form.teamRoles.map((row) => <div key={row.id} className="grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_1fr_auto]"><input value={row.area} onChange={(event) => update("teamRoles", form.teamRoles.map((item) => item.id === row.id ? { ...item, area: event.target.value } : item))} placeholder="Área: coordinación, arbitraje…" className="rounded-xl border border-slate-200 p-3 text-sm"/><input value={row.responsible} onChange={(event) => update("teamRoles", form.teamRoles.map((item) => item.id === row.id ? { ...item, responsible: event.target.value } : item))} placeholder="Responsable/s" className="rounded-xl border border-slate-200 p-3 text-sm"/><Remove onClick={() => update("teamRoles", form.teamRoles.filter((item) => item.id !== row.id))}/></div>)}</div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">3. Diseño técnico, inclusión y seguridad</p><div className="mt-5 grid gap-4 lg:grid-cols-3"><Area label="Reglamento básico" value={form.rules} onChange={(value) => update("rules", value)} placeholder="Duración, puntuación, rotaciones, desempates, normas de convivencia…"/><Area label="Medidas de inclusión" value={form.inclusionMeasures} onChange={(value) => update("inclusionMeasures", value)} placeholder="Cómo facilitarás que todas las personas puedan participar de forma significativa"/><Area label="Seguridad y prevención" value={form.safetyMeasures} onChange={(value) => update("safetyMeasures", value)} placeholder="Espacios, material, calentamiento, incidencias, supervisión…"/></div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">4. Recursos y presupuesto</p>
        <ListHeader title="Material necesario" onAdd={() => update("materials", [...form.materials, { id: id(), name: "", quantity: "" }])}/>
        <div className="mt-3 space-y-3">{form.materials.length === 0 && <Empty text="Lista el material que necesitaréis y comprobad qué puede aportar el centro."/>}{form.materials.map((row) => <div key={row.id} className="grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_180px_auto]"><input value={row.name} onChange={(event) => update("materials", form.materials.map((item) => item.id === row.id ? { ...item, name: event.target.value } : item))} placeholder="Material" className="rounded-xl border border-slate-200 p-3 text-sm"/><input value={row.quantity} onChange={(event) => update("materials", form.materials.map((item) => item.id === row.id ? { ...item, quantity: event.target.value } : item))} placeholder="Cantidad" className="rounded-xl border border-slate-200 p-3 text-sm"/><Remove onClick={() => update("materials", form.materials.filter((item) => item.id !== row.id))}/></div>)}</div>
        <div className="mt-7"><ListHeader title="Presupuesto básico" onAdd={() => update("budgetItems", [...form.budgetItems, { id: id(), concept: "", quantity: "1", unitCost: "0" }])}/></div>
        <div className="mt-3 space-y-3">{form.budgetItems.length === 0 && <Empty text="Si el evento no necesita compras, puedes dejar el presupuesto en 0 €."/>}{form.budgetItems.map((row) => <div key={row.id} className="grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_120px_150px_auto]"><input value={row.concept} onChange={(event) => update("budgetItems", form.budgetItems.map((item) => item.id === row.id ? { ...item, concept: event.target.value } : item))} placeholder="Concepto" className="rounded-xl border border-slate-200 p-3 text-sm"/><input value={row.quantity} onChange={(event) => update("budgetItems", form.budgetItems.map((item) => item.id === row.id ? { ...item, quantity: event.target.value } : item))} placeholder="Cantidad" inputMode="decimal" className="rounded-xl border border-slate-200 p-3 text-sm"/><input value={row.unitCost} onChange={(event) => update("budgetItems", form.budgetItems.map((item) => item.id === row.id ? { ...item, unitCost: event.target.value } : item))} placeholder="€/unidad" inputMode="decimal" className="rounded-xl border border-slate-200 p-3 text-sm"/><Remove onClick={() => update("budgetItems", form.budgetItems.filter((item) => item.id !== row.id))}/></div>)}</div>
      </section>

      <section id="cronograma" className="card scroll-mt-6 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">5. Cronograma</p><ListHeader title="Del proyecto a la ejecución" onAdd={() => update("timeline", [...form.timeline, { id: id(), task: "", responsible: "", deadline: "", done: false }])}/>
        <div className="mt-3 space-y-3">{form.timeline.length === 0 && <Empty text="Divide el proyecto en tareas pequeñas: reservar espacio, probar material, crear cuadro, difundir, montar, recoger…"/>}{form.timeline.map((row) => <div key={row.id} className="grid gap-2 rounded-2xl bg-slate-50 p-3 lg:grid-cols-[auto_1.4fr_1fr_170px_auto]"><label className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold"><input type="checkbox" checked={row.done} onChange={(event) => update("timeline", form.timeline.map((item) => item.id === row.id ? { ...item, done: event.target.checked } : item))}/>Hecha</label><input value={row.task} onChange={(event) => update("timeline", form.timeline.map((item) => item.id === row.id ? { ...item, task: event.target.value } : item))} placeholder="Tarea" className="rounded-xl border border-slate-200 p-3 text-sm"/><input value={row.responsible} onChange={(event) => update("timeline", form.timeline.map((item) => item.id === row.id ? { ...item, responsible: event.target.value } : item))} placeholder="Responsable" className="rounded-xl border border-slate-200 p-3 text-sm"/><input type="date" value={row.deadline} onChange={(event) => update("timeline", form.timeline.map((item) => item.id === row.id ? { ...item, deadline: event.target.value } : item))} className="rounded-xl border border-slate-200 p-3 text-sm"/><Remove onClick={() => update("timeline", form.timeline.filter((item) => item.id !== row.id))}/></div>)}</div>
      </section>

      <section className="card p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">6. Comunicación y sostenibilidad</p><div className="mt-5 grid gap-4 md:grid-cols-2"><Area label="Plan de comunicación" value={form.communicationPlan} onChange={(value) => update("communicationPlan", value)} placeholder="Qué información necesita el participante, por qué canal y cuándo"/><Area label="Medidas de sostenibilidad" value={form.sustainabilityMeasures} onChange={(value) => update("sustainabilityMeasures", value)} placeholder="Reutilización de material, residuos, desplazamientos, uso responsable de recursos…"/></div></section>

      <section id="evaluacion" className="card scroll-mt-6 p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">7. Evaluación</p><h2 className="mt-1 text-xl font-extrabold">¿Cómo sabremos si el evento ha funcionado?</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Area label="Plan de evaluación" value={form.evaluationPlan} onChange={(value) => update("evaluationPlan", value)} placeholder="Qué observarás: participación, puntualidad, seguridad, satisfacción, fluidez, cumplimiento de roles…"/><Area label="Reflexión final" value={form.finalReflection} onChange={(value) => update("finalReflection", value)} placeholder="Tras el evento: qué funcionó, qué problema surgió, cómo lo resolvisteis y qué cambiarías"/></div></section>

      <div className="sticky bottom-20 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:bottom-5"><div><p className="font-extrabold text-slate-900">Proyecto SA4 · {readiness.percent}% preparado</p><p className="text-xs text-slate-500">Guarda con frecuencia. Puedes volver y modificarlo durante las 5 semanas.</p></div><button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <Save size={17}/>}Guardar proyecto</button></div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="text-sm font-bold text-slate-700">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={fieldClass}/></label>;
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="text-sm font-bold text-slate-700">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} placeholder={placeholder} className={fieldClass}/></label>;
}

function ListHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h3 className="font-extrabold text-slate-900">{title}</h3><button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-[#e7f2ed] px-3 py-2 text-xs font-extrabold text-[#164c3a]"><Plus size={15}/>Añadir</button></div>;
}

function Remove({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label="Eliminar fila" className="grid min-h-11 min-w-11 place-items-center rounded-xl text-red-600 hover:bg-red-50"><Trash2 size={17}/></button>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">{text}</div>;
}

function StatusSelect({ value, onChange }: { value: EventForm["status"]; onChange: (value: EventForm["status"]) => void }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado<select value={value} onChange={(event) => onChange(event.target.value as EventForm["status"])} className="mt-2 block rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold normal-case text-slate-700"><option value="draft">Borrador</option><option value="planning">En planificación</option><option value="ready">Listo para ejecutar</option><option value="completed">Evento realizado</option></select></label>;
}
