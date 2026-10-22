"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { TeacherStudentChecklist } from "@/components/teacher-student-checklist";
import { studentCompletion, completionTotals } from "@/lib/teacher-completion";
import { TeacherSessionEvaluationForm } from "@/components/teacher-session-grading";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";
import { refreshTeacherActivity } from "@/app/profesor/actions";
import { activityCategories, isEvaluationInstrumentAchieved, mean, physicalComparison, type ActivityCategory, type TeacherActivity, type TeacherActivityData } from "@/lib/teacher-activity";
import { physicalCapacity } from "@/lib/second-year-progress";
import { TeacherPsychologicalReports } from "@/components/teacher-psychological-reports";
import { PhysicalRadarChart } from "@/components/physical-radar-chart";
import { downloadPersonalPlanPdf } from "@/lib/personal-plan-pdf";
import { methodologyLabels, normalizeItems } from "@/lib/personal-plan-tasks";

const fmt = (value: number | null) => value === null ? "Sin datos" : new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value);
const statuses: Record<string, string> = { draft: "Borrador", active: "En marcha", completed: "Finalizado", submitted: "Enviado", in_progress: "En curso", planned: "Planificado" };
const labels: Record<string, string> = {
  question: "Pregunta", answers: "Respuestas guardadas", answer: "Respuesta del alumno/a", challenge_prompt: "Enunciado del reto", initial_analysis: "Análisis inicial", objective: "Objetivo", secondary_objective: "Segundo objetivo", priority_capacity: "Capacidad prioritaria", duration_weeks: "Semanas", weekly_frequency: "Frecuencia semanal", session_duration_minutes: "Minutos por sesión", progression_strategy: "Progresión", recovery_strategy: "Recuperación", success_indicator: "Indicador de logro", secondary_success_indicator: "Indicador del segundo objetivo", final_conclusions: "Conclusiones", future_work: "Trabajo futuro", plan_items: "Tareas del plan", activity: "Actividad", exercises: "Ejercicios", methodology: "Metodología", rounds: "Series", roundRecovery: "Descanso entre series (min)", dose: "Carga", recovery: "Descanso", sessionDate: "Fecha de la sesión", day: "Día", goal: "Objetivo", capacity: "Capacidad", description: "Descripción", title: "Título", activities: "Actividades", session_date: "Fecha de la sesión", feeling: "Sensaciones", learning: "Aprendizajes", reflection: "Reflexión", perceived_difficulty: "Dificultad percibida", perceived_effort: "Esfuerzo percibido", training_plan: "Trabajo de la sesión", content_worked: "Contenido trabajado", exercises_performed: "Ejercicios realizados", participation: "Participación", performance_perception: "Percepción del rendimiento", needs_improvement: "Aspectos a mejorar", session_number: "Sesión", week_number: "Semana", duration_minutes: "Duración (min)", rpe: "Esfuerzo percibido (RPE)", completion_percent: "Realización declarada (%)", modifications: "Adaptaciones", period: "Toma", value: "Marca", quiz_score: "Mejor resultado (%)", completed: "Lectura completada", focus_habit: "Hábito", initial_reflection: "Reflexión inicial", action_plan: "Acciones", barrier_strategy: "Dificultades y respuesta", final_reflection: "Reflexión final", sleep_routine: "Rutina de sueño", daily_movement: "Movimiento diario", sedentary_breaks: "Pausas activas", hydration: "Hidratación", balanced_eating: "Alimentación", goal_completion: "Cumplimiento del objetivo", next_adjustment: "Próximo ajuste", event_name: "Evento", purpose: "Propósito", target_audience: "Destinatarios", activity_type: "Actividad", event_format: "Formato", venue: "Lugar", event_date: "Fecha", participants_estimate: "Participantes previstos", team_name: "Equipo", personal_role: "Rol personal", team_roles: "Roles", rules: "Normas", inclusion_measures: "Inclusión", safety_measures: "Seguridad", materials: "Materiales", budget_items: "Presupuesto", timeline: "Calendario", communication_plan: "Comunicación", sustainability_measures: "Sostenibilidad", evaluation_plan: "Evaluación", instrument_code: "Cuestionario", assessment_phase: "Momento", total_score: "Puntuación", attempt_number: "Intento", status: "Estado",
};

labels.teacher_score = "Calificación del profesor (0–10)";
labels.teacher_absent = "AUSENCIA";
labels.teacher_comment = "Comentario del profesor";
labels.teacher_evaluated_at = "Fecha de calificación";

labels.success_indicator = "Cómo comprobaré mi objetivo principal";
labels.rounds = "Series";
labels.roundRecovery = "Descanso entre series (minutos)";

function planText(value: unknown, fallback = "Sin completar") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function formatPlanSessionDate(value: string) {
  if (!value) return "fecha pendiente";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(date);
}

function exportStudentPlan(row: TeacherActivity, student: TeacherActivityData["students"][number], year: 1 | 2) {
  const plan = row.details;
  const items = normalizeItems(plan.plan_items);
  const dates = [...new Set(items.map((item) => item.sessionDate || ""))];
  const taskLines = dates.length ? dates.flatMap((date, index) => items.filter((item) => (item.sessionDate || "") === date).flatMap((item) => [
    `• Sesión ${index + 1} - ${formatPlanSessionDate(date)} - ${item.activity || "Tarea"} - ${methodologyLabels[item.methodology]} - ${item.rounds} serie(s)${item.roundRecovery ? ` - descanso entre series: ${item.roundRecovery} min` : ""}`,
    ...(item.materials.length || item.customMaterials.trim() ? [`  Materiales: ${[...item.materials, item.customMaterials.trim()].filter(Boolean).join(", ")}`] : []),
    ...item.exercises.map((exercise, exerciseIndex) => `  ${exerciseIndex + 1}. ${exercise.activity || "Ejercicio por concretar"}${exercise.dose ? ` - ${exercise.dose}` : ""}${exercise.recovery ? ` - descanso ${exercise.recovery}` : ""}`),
  ])) : ["• Sin sesiones planificadas"];
  const status = plan.status === "completed" ? "Finalizado" : plan.status === "active" ? "En marcha" : "Borrador";
  const capacity = planText(plan.priority_capacity, "condicion-fisica-general").replaceAll("-", " ");
  const duration = plan.duration_weeks ?? (year === 2 ? 3 : 4);
  const frequency = plan.weekly_frequency ?? (year === 2 ? 4 : 2);
  downloadPersonalPlanPdf({
    studentName: student.name,
    courseLabel: `${year}º Bachillerato`,
    group: student.group,
    status,
    capacity,
    sections: [
      { title: "1. Punto de partida", lines: [planText(plan.initial_analysis)] },
      { title: "2. Objetivos y temporalización", lines: [`Objetivo principal: ${planText(plan.objective)}`, `Cómo comprobaré mi objetivo principal: ${planText(plan.success_indicator)}`, ...(planText(plan.secondary_objective, "") ? [`Segundo objetivo: ${planText(plan.secondary_objective)}`, `Indicador del segundo objetivo: ${planText(plan.secondary_success_indicator)}`] : []), `${duration} semanas - ${frequency} sesiones/semana - ${plan.session_duration_minutes ?? 55} min por sesión`] },
      { title: "3. Calendario, tareas y cargas", lines: taskLines },
      { title: "4. Progresión y recuperación", lines: [`Progresión: ${planText(plan.progression_strategy)}`, `Recuperación: ${planText(plan.recovery_strategy)}`] },
      { title: "5. Reflexión final", lines: [`Conclusiones: ${planText(plan.final_conclusions, "Pendiente al finalizar el plan")}`, `Qué quiero seguir trabajando: ${planText(plan.future_work, "Pendiente al finalizar el plan")}`] },
    ],
  });
}


function reportDate(value: string) {
  if (!value) return "Sin fecha";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function reportDetailLines(value: unknown, prefix = "", depth = 0): string[] {
  if (value === null || value === undefined || value === "" || depth > 4) return [];
  if (Array.isArray(value)) return value.flatMap((entry, index) => reportDetailLines(entry, prefix ? `${prefix} · ${index + 1}` : `Elemento ${index + 1}`, depth + 1));
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => key !== "id" && !key.endsWith("_id") && !["created_at", "updated_at", "recorded_at", "started_at", "submitted_at", "read_at", "topic_slug"].includes(key))
      .flatMap(([key, entry]) => reportDetailLines(entry, prefix ? `${prefix} · ${labels[key] ?? key.replaceAll("_", " ")}` : labels[key] ?? key.replaceAll("_", " "), depth + 1));
  }
  const printable = typeof value === "boolean" ? (value ? "Sí" : "No") : String(value);
  return [prefix ? `${prefix}: ${printable}` : printable];
}

function exportStudentResultsPdf(
  student: TeacherActivityData["students"][number],
  year: 1 | 2,
  situations: TeacherActivityData["situations"],
  cohortRows: TeacherActivity[],
  cohortIds: Set<string>,
  tests: TeacherActivityData["physicalTests"],
  expectedCatalog: TeacherActivityData["expectedInstruments"],
) {
  const personalRows = cohortRows.filter((row) => row.studentId === student.id);
  const completion = studentCompletion({students:[student],activities:cohortRows,expectedInstruments:expectedCatalog}, student.id);
  const instruments = completion.filter((instrument) => instrument.requested && instrument.state !== "untracked").map((instrument) => ({
    sa: instrument.sa, title: instrument.title, completed: instrument.state === "completed",
  }));
  if (!expectedCatalog?.length) for (const row of personalRows) instruments.push({sa:row.sa,title:row.title,completed:isEvaluationInstrumentAchieved(row)});
  const sessionLogs = year === 2
    ? personalRows.filter((row) => row.category === "journals" && row.sa === "SA2" && Number.isInteger(Number(row.details.session_number)) && Number(row.details.session_number) >= 1 && Number(row.details.session_number) <= 10)
    : [];
  const sessionsByNumber = new Map(sessionLogs.map((row) => [Number(row.details.session_number), row]));
  const sessions = year === 2 ? Array.from({ length: 10 }, (_, index) => {
    const sessionNumber = index + 1;
    const row = sessionsByNumber.get(sessionNumber);
    const numeric = (value: unknown) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value)) ? null : Number(value);
    return {
      sessionNumber,
      date: typeof row?.details.session_date === "string" ? row.details.session_date : "",
      durationMinutes: numeric(row?.details.duration_minutes),
      rpe: numeric(row?.details.rpe),
      completionPercent: numeric(row?.details.completion_percent),
      recorded: Boolean(row && (row.status === "completed" || row.status === "submitted")),
    };
  }) : [];
  if (!expectedCatalog?.some((item) => item.sa === "SA2" && item.category === "journals" && item.filters?.session_number)) for (const session of sessions) instruments.push({ sa: "SA2", title: "Sesión " + session.sessionNumber + " · valoración", completed: session.recorded });
  const radar = ["Fuerza", "Resistencia", "Velocidad", "Flexibilidad / movilidad", "Otras pruebas"].flatMap((capacity) => {
    const capacityTests = tests.filter((test) => physicalCapacity(test.name) === capacity);
    const periodIndex = (period: "september" | "december") => capacityTests.flatMap((test) => {
      const comparison = physicalComparison(cohortRows, student.id, test, cohortIds);
      const own = period === "september" ? comparison.first : comparison.last;
      const average = period === "september" ? comparison.initialMean : comparison.finalMean;
      if (own === null || average === null || own === 0 || average === 0) return [];
      return [test.direction === "lower_better" ? average / own * 100 : own / average * 100];
    });
    const initialValues = periodIndex("september");
    const finalValues = periodIndex("december");
    if (!initialValues.length && !finalValues.length) return [];
    return [{
      capacity: capacity.replace("Flexibilidad / movilidad", "Flexibilidad"),
      initial: mean(initialValues),
      final: mean(finalValues),
      reference: 100,
    }];
  });

  downloadPersonalPlanPdf({
    studentName: student.name,
    courseLabel: year + "º Bachillerato",
    group: student.group,
    status: "Seguimiento del curso",
    capacity: "Resultados por SA",
    documentTitle: "INFORME INDIVIDUAL",
    documentSubtitle: "Resultados de evaluación · " + year + "º Bachillerato",
    footerText: "Educación Física · Maristas Badajoz · Resumen individual del curso",
    metaItems: [
      { label: "CURSO", value: year + "º Bachillerato" },
      { label: "GRUPO", value: student.group },
      { label: "INFORME", value: "Resultados y seguimiento" },
    ],
    sections: [],
    resultsReport: {
      situations: situations.map((situation) => ({ code: situation.code, title: situation.title })),
      instruments,
      sessions,
      radar,
    },
  });
}

function DetailValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-slate-400">Sin completar</span>;
  if (Array.isArray(value)) return <ol className="list-inside list-decimal space-y-3">{value.map((entry, index) => <li key={index} className="rounded-lg bg-white p-3"><DetailValue value={entry}/></li>)}</ol>;
  if (typeof value === "object") return <dl className="space-y-2">{Object.entries(value).filter(([key]) => !key.startsWith("_") && key !== "id" && !key.endsWith("_id") && key !== "exerciseId" && !["created_at", "updated_at", "recorded_at", "started_at", "submitted_at", "read_at", "topic_slug"].includes(key)).map(([key, entry]) => <div key={key}><dt className="text-xs font-bold text-slate-500">{labels[key] ?? key.replaceAll("_", " ")}</dt><dd className="mt-1 whitespace-pre-wrap break-words"><DetailValue value={entry}/></dd></div>)}</dl>;
  if (typeof value === "boolean") return <>{value ? "Sí" : "No"}</>;
  const word = String(value);
  return <>{statuses[word] ?? ({ september: "Septiembre", december: "Diciembre", initial: "Inicial", final: "Final", circuit: "Circuit training", total: "Total training", custom: "Trabajo específico" } as Record<string, string>)[word] ?? word}</>;
}

function Value({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] leading-4 text-slate-500">{label}</p><p className="mt-1 text-lg font-black text-slate-950">{fmt(value)}{value !== null ? ` ${suffix}` : ""}</p></div>;
}

export function TeacherActivityDashboard({ data: initialData, year, initialSituation = "" }: { data: TeacherActivityData; year: 1 | 2; initialSituation?: string }) {
  const [data, setData] = useState(initialData);
  const [refreshing, startRefresh] = useTransition();
  const [refreshMessage, setRefreshMessage] = useState("");
  const [refreshError, setRefreshError] = useState(false);
  function refresh() {
    setRefreshMessage(""); setRefreshError(false);
    startRefresh(async () => {
      try { setData(await refreshTeacherActivity(year)); setRefreshMessage("Datos actualizados correctamente."); }
      catch { setRefreshError(true); setRefreshMessage("No se han podido actualizar los datos. Comprueba tu conexión y vuelve a intentarlo. Si tu sesión ha caducado, vuelve a entrar."); }
    });
  }
  const router = useRouter();
  const [changingCourse, startCourseChange] = useTransition();
  const [group, setGroup] = useState(""); const [studentId, setStudentId] = useState("");
  const [sa, setSa] = useState(initialSituation); const [view, setView] = useState<"group" | "individual">("group");
  const groups = [...new Set(data.students.map((student) => student.group))].sort();
  const students = data.students.filter((student) => !group || student.group === group);
  const selected = students.find((student) => student.id === studentId) ?? students[0];
  const groupIds = new Set(students.map((student) => student.id));
  const activities = data.activities.filter((row) => groupIds.has(row.studentId) && (!sa || row.sa === sa));
  const details = view === "individual" ? activities.filter((row) => row.studentId === selected?.id) : activities;
  const categories = Object.entries(activityCategories) as [ActivityCategory, string][];
  const situations = [...new Map(data.situations.map((entry) => [entry.code, entry])).values()].sort((a,b) => a.code.localeCompare(b.code));
  const visibleSituations = situations.filter((entry) => !sa || entry.code === sa);
  const completionByStudent = new Map(students.map((student) => [student.id, studentCompletion(data, student.id, sa)]));
  const selectedItems = completionByStudent.get(selected?.id ?? "") ?? [];
  const groupTotals = completionTotals([...completionByStudent.values()].flat());
  const selectedCohortIds = new Set(data.students.filter((student) => student.group === selected?.group).map((student) => student.id));
  const selectedCohortRows = data.activities.filter((row) => selectedCohortIds.has(row.studentId));
  const physicalRows = view === "individual" ? selectedCohortRows : data.activities.filter((row) => groupIds.has(row.studentId));
  const comparisonIds = view === "individual" ? selectedCohortIds : groupIds;
  function chooseStudent(id: string) { setStudentId(id); setView("individual"); setSa(""); }

  function renderRecord(row: TeacherActivity) {
    return <><p className="mb-3 text-xs text-slate-500">Última actualización: {row.date ? new Date(row.date).toLocaleDateString("es-ES") : "Sin fecha"}{row.status ? ` · ${statuses[row.status] ?? row.status}` : ""}</p>{row.category === "plans" && selected && <button type="button" onClick={() => exportStudentPlan(row, selected, year)} className="mb-4 inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white"><FileDown size={16}/>Descargar plan en PDF</button>}<DetailValue value={row.details}/>{year === 2 && row.category === "journals" && row.sa === "SA2" && Number(row.details.session_number) >= 1 && Number(row.details.session_number) <= 10 && <TeacherSessionEvaluationForm key={`${row.id}-${row.details.teacher_evaluated_at ?? ""}`} studentId={row.studentId} sessionNumber={Number(row.details.session_number)} initialScore={row.details.teacher_score == null ? null : Number(row.details.teacher_score)} initialComment={String(row.details.teacher_comment ?? "")} initialAbsent={row.details.teacher_absent === true}/>}</>;
  }

  const physicalRadar = ["Fuerza", "Resistencia", "Velocidad", "Flexibilidad / movilidad", "Otras pruebas"].flatMap((capacity) => {
    const tests = data.physicalTests.filter((test) => physicalCapacity(test.name) === capacity);
    const indexes = (period: "september" | "december") => tests.flatMap((test) => {
      const values = physicalComparison(physicalRows, selected?.id ?? "", test, comparisonIds);
      const own = period === "september" ? values.first : values.last;
      const average = period === "september" ? values.initialMean : values.finalMean;
      if (view === "group") {
        if (values.initialMean === null || average === null || values.initialMean === 0) return [];
        return [(test.direction === "lower_better" ? values.initialMean / average : average / values.initialMean) * 100];
      }
      if (own === null || average === null || own === 0 || average === 0) return [];
      return [(test.direction === "lower_better" ? average / own : own / average) * 100];
    });
    const initial = indexes("september"); const final = indexes("december");
    return initial.length || final.length ? [{ capacity: capacity.replace("Flexibilidad / movilidad", "Flexibilidad"), initial: mean(initial), final: mean(final), reference: 100 }] : [];
  });

  return <div className="space-y-6">
    <section className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#1e6b4f]">Seguimiento docente · {year}º Bachillerato</p><h1 className="mt-2 text-2xl font-extrabold">Resultados del alumnado</h1><p className="mt-2 text-sm text-slate-500">Comprueba lo solicitado, las entregas y los pendientes de cada alumno.</p></div><div className="flex flex-wrap gap-2"><Link href={`/profesor/calificaciones?curso=${year}${sa ? `&sa=${sa}` : ""}${view === "individual" && selected ? `&alumno=${selected.id}` : ""}`} className="rounded-xl bg-[#1e6b4f] px-4 py-2 text-sm font-bold text-white">Publicar calificaciones</Link><button type="button" onClick={refresh} disabled={refreshing || changingCourse} aria-busy={refreshing} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">{refreshing ? "Actualizando…" : "Actualizar datos"}</button></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-bold">Curso de los resultados<select aria-label="Curso de los resultados" value={year} disabled={changingCourse || refreshing} onChange={(event) => { const value = event.target.value; startCourseChange(() => router.push(`/profesor?curso=${value}`)); }} className="mt-2 w-full rounded-xl border border-emerald-600 bg-emerald-50 p-3"><option value="1">1º Bachillerato</option><option value="2">2º Bachillerato</option></select></label>
        <label className="text-sm font-bold">Grupo<select aria-label="Grupo" value={group} onChange={(event) => { setGroup(event.target.value); setStudentId(""); if (view === "individual") setSa(""); }} className="mt-2 w-full rounded-xl border p-3"><option value="">Todos los grupos del curso</option>{groups.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="text-sm font-bold">Vista<select aria-label="Vista" value={view} onChange={(event) => { const next = event.target.value as typeof view; setView(next); setSa(next === "individual" ? "" : initialSituation); }} className="mt-2 w-full rounded-xl border p-3"><option value="group">Grupal</option><option value="individual">Individual</option></select></label>
        <label className="text-sm font-bold">Alumno/a<select aria-label="Alumno/a" value={view === "individual" ? selected?.id ?? "" : ""} onChange={(event) => chooseStudent(event.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="" disabled>Selecciona un alumno para ver su ficha</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>
        <label className="text-sm font-bold">Situación<select aria-label="Situación" value={sa} onChange={(event) => setSa(event.target.value)} disabled={changingCourse || refreshing} className="mt-2 w-full rounded-xl border p-3"><option value="">Todas las situaciones</option>{situations.map((entry) => <option key={entry.code} value={entry.code}>{entry.code} · {entry.title}</option>)}</select></label>
      </div>
      {view === "individual" && selected && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 p-4"><button type="button" onClick={() => exportStudentResultsPdf(selected, year, data.situations, selectedCohortRows, selectedCohortIds, data.physicalTests, data.expectedInstruments)} className="inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white"><FileDown size={16}/>Descargar informe PDF</button><span className="text-xs text-slate-600">Informe en una hoja A4 con la evolución física y las tareas realizadas y pendientes.</span></div>}
      <p className="mt-3 text-xs text-slate-500">Última consulta: {new Intl.DateTimeFormat("es-ES", {timeZone:"Europe/Madrid",dateStyle:"short",timeStyle:"medium"}).format(new Date(data.loadedAt))}</p>
      {refreshMessage && <p role={refreshError ? "alert" : "status"} className={refreshError ? "mt-2 text-sm text-red-700" : "mt-2 text-sm text-emerald-700"}>{refreshMessage}</p>}
      {changingCourse && <p role="status" className="mt-3 font-semibold text-[#1e6b4f]">Cargando los resultados del curso seleccionado…</p>}
    </section>
    {!students.length ? <p className="card p-6">No hay alumnado activo en este grupo.</p> : <>
      {view === "individual" && selected ? <TeacherStudentChecklist key={`${selected.id}-${data.loadedAt}`} student={selected} items={selectedItems} situations={visibleSituations} renderRecord={renderRecord}/> : <section className="card p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold">Resumen de cada alumno/a</h2><p className="mt-2 text-sm text-slate-500">Selecciona un nombre para ver todo su trabajo, sus respuestas y lo que le falta en cada situación.</p></div><p className="text-sm font-bold text-[#164c3a]">{groupTotals.completed}/{groupTotals.total} tareas completadas en el grupo</p></div>
        <div className="mt-5 divide-y divide-slate-100">{students.map((student) => {
          const items = completionByStudent.get(student.id) ?? [];
          const total = completionTotals(items);
          return <article key={student.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(12rem,1fr)_minmax(14rem,2fr)_auto] sm:items-center">
            <div><button type="button" onClick={() => chooseStudent(student.id)} className="text-left text-sm font-extrabold text-[#164c3a] underline underline-offset-4">{student.name}</button><p className="mt-1 text-xs text-slate-500">{student.group}</p></div>
            <div><div className="flex justify-between gap-2 text-xs"><span>{total.completed}/{total.total} completadas · {total.pending} pendientes · {total.inProgress} en curso</span><strong>{total.percent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{width:`${total.percent}%`}}/></div><div className="mt-2 flex flex-wrap gap-1.5">{visibleSituations.map((instrument) => {const part=completionTotals(items.filter((item) => item.sa===instrument.code));return <span key={instrument.code} className={`rounded-full px-2 py-1 text-[11px] font-semibold ${part.total && part.completed===part.total ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{instrument.code} · {part.completed}/{part.total}</span>;})}</div></div>
            <button type="button" onClick={() => chooseStudent(student.id)} className="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-bold text-[#164c3a]">Ver ficha completa</button>
          </article>;
        })}</div>
      </section>}
      {year === 2 && (!sa || sa === "SA2") && <section className="card flex flex-wrap items-center justify-between gap-3 border-emerald-200 bg-emerald-50 p-5"><div><h2 className="font-extrabold text-[#164c3a]">Calificar las diez sesiones · SA2</h2><p className="mt-1 text-sm text-slate-600">Nota, comentario y ausencia, incluso sin seguimiento registrado.</p></div><Link href={`/profesor/calificar-sesiones${view === "individual" && selected ? `?alumno=${selected.id}` : ""}`} className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Abrir calificaciones de las sesiones</Link></section>}
      {(!sa || sa === "SA1" || sa === "SA2") && <details className="card space-y-5 p-5 sm:p-7"><summary className="cursor-pointer text-lg font-extrabold">Evolución física · gráfica y marcas</summary><h2 className="text-xl font-extrabold">Evolución física por capacidades</h2><p className="text-sm text-slate-500">La red compara septiembre y diciembre con el promedio del grupo, situado en el 100 %. Debajo se conservan todas las marcas, unidades, tamaños de muestra y cambios emparejados.</p>{physicalRadar.length >= 3 && <PhysicalRadarChart data={physicalRadar} title={view === "individual" ? `Perfil físico de ${selected!.name}` : "Evolución del grupo por capacidades"}/>} {["Fuerza", "Resistencia", "Velocidad", "Flexibilidad / movilidad", "Otras pruebas"].map((capacity) => {
        const tests = data.physicalTests.filter((test) => physicalCapacity(test.name) === capacity && physicalRows.some((row) => row.category === "physical" && row.details.physical_test_id === test.id));
        return tests.length ? <div key={capacity}><h3 className="mb-3 font-extrabold text-[#1e6b4f]">{capacity}</h3><div className="grid gap-4 md:grid-cols-2">{tests.map((test) => {
          const values = physicalComparison(physicalRows, selected!.id, test, comparisonIds);
          return <article key={test.id} className="space-y-3 rounded-xl border p-4"><h4 className="font-bold">{test.name} · {test.unit}</h4>{view === "individual" && <div className="grid grid-cols-2 gap-3"><Value label="Septiembre · alumno/a" value={values.first} suffix={test.unit}/><Value label="Diciembre · alumno/a" value={values.last} suffix={test.unit}/><p className="col-span-2 text-xs">Mejora entre tomas: {fmt(values.improvement)}{values.improvement !== null ? "%" : ""}</p></div>}<div className="grid grid-cols-2 gap-3"><Value label={`Media septiembre · n=${values.initialN}`} value={values.initialMean} suffix={test.unit}/><Value label={`Media diciembre · n=${values.finalN}`} value={values.finalMean} suffix={test.unit}/></div><p className="text-xs text-slate-500">Mismos {values.pairedN} alumnos en ambas tomas: {fmt(values.pairedInitial)} → {fmt(values.pairedFinal)} {test.unit}. {test.direction === "lower_better" ? "Menor marca indica mejor resultado." : "Mayor marca indica mejor resultado."}</p></article>;
        })}</div></div> : null;
      })}{!physicalRows.some((row) => row.category === "physical") && <p>Sin marcas físicas registradas en este filtro.</p>}</details>}

      <details className="card p-5 sm:p-7"><summary className="cursor-pointer text-lg font-extrabold">Archivo de registros guardados</summary><p className="mt-3 text-sm text-slate-500">Consulta también el historial y los registros adicionales conservados en la plataforma.</p><div className="mt-4 space-y-3">{categories.map(([category,label]) => {
        const rows = details.filter((row) => row.category===category).sort((a,b) => b.date.localeCompare(a.date));
        return rows.length ? <details key={category} className="rounded-xl border p-4"><summary className="cursor-pointer text-sm font-bold">{label} · {rows.length}</summary><div className="mt-3 space-y-3">{rows.map((row) => <details key={row.id} className="rounded-lg bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-semibold">{view === "group" ? `${students.find((student) => student.id===row.studentId)?.name} · ` : ""}{row.sa} · {row.title}</summary><div className="mt-3">{view === "group" && row.category==="plans" ? <><button type="button" onClick={() => {const student=students.find((entry) => entry.id===row.studentId);if(student)exportStudentPlan(row,student,year);}} className="mb-3 rounded-lg border px-3 py-2 text-xs font-bold">Descargar plan en PDF</button><DetailValue value={row.details}/></> : renderRecord(row)}</div></details>)}</div></details> : null;
      })}</div></details>
      {(!sa || sa === "SA1" || (year===2 && sa==="SA2")) && <details className="card p-5 sm:p-7"><summary className="cursor-pointer text-lg font-extrabold">Informes psicológicos · inicial y final</summary><div className="mt-5"><TeacherPsychologicalReports key={`${year}-${group}-${selected?.id}-${data.loadedAt}`} initialYear={year} initialStudentId={view==="individual"?selected?.id:undefined} initialGroup={view === "individual" ? selected?.group : group || undefined}/></div></details>}
    </>}
  </div>;
}

