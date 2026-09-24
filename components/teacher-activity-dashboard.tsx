"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshTeacherActivity } from "@/app/profesor/actions";
import { activityCategories, categorySummary, mean, physicalComparison, type ActivityCategory, type TeacherActivityData } from "@/lib/teacher-activity";
import { physicalCapacity } from "@/lib/second-year-progress";
import { TeacherPsychologicalReports } from "@/components/teacher-psychological-reports";
import { PhysicalRadarChart } from "@/components/physical-radar-chart";

const fmt = (value: number | null) => value === null ? "Sin datos" : new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value);
const statuses: Record<string, string> = { draft: "Borrador", active: "En marcha", completed: "Finalizado", submitted: "Enviado", in_progress: "En curso", planned: "Planificado" };
const labels: Record<string, string> = {
  answer: "Respuesta del alumno/a", challenge_prompt: "Enunciado del reto", initial_analysis: "Análisis inicial", objective: "Objetivo", secondary_objective: "Segundo objetivo", priority_capacity: "Capacidad prioritaria", duration_weeks: "Semanas", weekly_frequency: "Frecuencia semanal", session_duration_minutes: "Minutos por sesión", progression_strategy: "Progresión", recovery_strategy: "Recuperación", success_indicator: "Indicador de logro", secondary_success_indicator: "Indicador del segundo objetivo", final_conclusions: "Conclusiones", future_work: "Trabajo futuro", plan_items: "Tareas del plan", activity: "Actividad", exercises: "Ejercicios", methodology: "Metodología", rounds: "Vueltas", roundRecovery: "Pausa entre vueltas", dose: "Carga", recovery: "Descanso", sessionDate: "Fecha de la sesión", day: "Día", goal: "Objetivo", capacity: "Capacidad", description: "Descripción", title: "Título", activities: "Actividades", session_date: "Fecha de la sesión", feeling: "Sensaciones", learning: "Aprendizajes", reflection: "Reflexión", perceived_difficulty: "Dificultad percibida", perceived_effort: "Esfuerzo percibido", training_plan: "Trabajo de la sesión", content_worked: "Contenido trabajado", exercises_performed: "Ejercicios realizados", participation: "Participación", performance_perception: "Percepción del rendimiento", needs_improvement: "Aspectos a mejorar", session_number: "Sesión", week_number: "Semana", duration_minutes: "Duración (min)", rpe: "Esfuerzo percibido (RPE)", completion_percent: "Realización declarada (%)", modifications: "Adaptaciones", period: "Toma", value: "Marca", quiz_score: "Mejor resultado (%)", completed: "Lectura completada", focus_habit: "Hábito", initial_reflection: "Reflexión inicial", action_plan: "Acciones", barrier_strategy: "Dificultades y respuesta", final_reflection: "Reflexión final", sleep_routine: "Rutina de sueño", daily_movement: "Movimiento diario", sedentary_breaks: "Pausas activas", hydration: "Hidratación", balanced_eating: "Alimentación", goal_completion: "Cumplimiento del objetivo", next_adjustment: "Próximo ajuste", event_name: "Evento", purpose: "Propósito", target_audience: "Destinatarios", activity_type: "Actividad", event_format: "Formato", venue: "Lugar", event_date: "Fecha", participants_estimate: "Participantes previstos", team_name: "Equipo", personal_role: "Rol personal", team_roles: "Roles", rules: "Normas", inclusion_measures: "Inclusión", safety_measures: "Seguridad", materials: "Materiales", budget_items: "Presupuesto", timeline: "Calendario", communication_plan: "Comunicación", sustainability_measures: "Sostenibilidad", evaluation_plan: "Evaluación", instrument_code: "Cuestionario", assessment_phase: "Momento", total_score: "Puntuación", attempt_number: "Intento", status: "Estado",
};

labels.success_indicator = "Cómo comprobaré mi objetivo principal";
labels.rounds = "Series";
labels.roundRecovery = "Descanso entre series (minutos)";

function DetailValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-slate-400">Sin completar</span>;
  if (Array.isArray(value)) return <ol className="list-inside list-decimal space-y-3">{value.map((entry, index) => <li key={index} className="rounded-lg bg-white p-3"><DetailValue value={entry}/></li>)}</ol>;
  if (typeof value === "object") return <dl className="space-y-2">{Object.entries(value).filter(([key]) => key !== "id" && !key.endsWith("_id") && key !== "exerciseId" && !["created_at", "updated_at", "recorded_at", "started_at", "submitted_at", "read_at", "topic_slug"].includes(key)).map(([key, entry]) => <div key={key}><dt className="text-xs font-bold text-slate-500">{labels[key] ?? key.replaceAll("_", " ")}</dt><dd className="mt-1 whitespace-pre-wrap break-words"><DetailValue value={entry}/></dd></div>)}</dl>;
  if (typeof value === "boolean") return <>{value ? "Sí" : "No"}</>;
  const word = String(value);
  return <>{statuses[word] ?? ({ september: "Septiembre", december: "Diciembre", initial: "Inicial", final: "Final", circuit: "Circuit training", total: "Total training", custom: "Trabajo específico" } as Record<string, string>)[word] ?? word}</>;
}

function Bar({ label, value, max = 100, color = "bg-emerald-600", suffix = "" }: { label: string; value: number | null; max?: number; color?: string; suffix?: string }) {
  return <div className="min-w-0"><div className="mb-1 flex justify-between gap-3 text-xs"><span>{label}</span><strong>{fmt(value)}{value !== null ? suffix : ""}</strong></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${value === null ? 0 : Math.min(100, Math.max(0, value / (max || 1) * 100))}%` }}/></div></div>;
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
    setRefreshMessage("");
    setRefreshError(false);
    startRefresh(async () => {
      try {
        const next = await refreshTeacherActivity(year);
        setData(next);
        setRefreshMessage("Datos actualizados correctamente.");
      } catch {
        setRefreshError(true);
        setRefreshMessage("No se han podido actualizar los datos. Comprueba tu conexión y vuelve a intentarlo. Si tu sesión ha caducado, vuelve a entrar.");
      }
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
  const personal = activities.filter((row) => row.studentId === selected?.id);
  const categories = Object.entries(activityCategories) as [ActivityCategory, string][];
  const scoreRows = (id: string) => activities.filter((row) => row.studentId === id && row.category === "quizzes" && row.score !== null);
  const individualScores = scoreRows(selected?.id ?? "").map((row) => row.score!);
  const groupScores = students.map((student) => mean(scoreRows(student.id).map((row) => row.score!))).filter((value): value is number => value !== null);
  const details = view === "individual" ? personal : activities;
  const physicalRadar = ["Fuerza", "Resistencia", "Velocidad", "Flexibilidad / movilidad", "Otras pruebas"].flatMap((capacity) => {
    const tests = data.physicalTests.filter((test) => physicalCapacity(test.name) === capacity);
    const indexes = (period: "september" | "december") => tests.flatMap((test) => {
      const values = physicalComparison(activities, selected?.id ?? "", test, groupIds);
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
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#1e6b4f]">Seguimiento docente · {year}º Bachillerato</p><h1 className="mt-2 text-2xl font-extrabold">Actividad y resultados del alumnado</h1><p className="mt-2 text-sm text-slate-500">{data.courseName} · Datos guardados en la plataforma. Solo el profesorado puede consultar esta vista.</p></div><button onClick={refresh} disabled={refreshing || changingCourse} aria-busy={refreshing} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">{refreshing ? "Actualizando…" : "Actualizar datos"}</button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-bold">Curso de los resultados<select aria-label="Curso de los resultados" value={year} disabled={changingCourse || refreshing} onChange={(event) => { const value = event.target.value; startCourseChange(() => router.push(`/profesor?curso=${value}`)); }} className="mt-2 w-full rounded-xl border border-emerald-600 bg-emerald-50 p-3"><option value="1">1º Bachillerato</option><option value="2">2º Bachillerato</option></select></label>
        <label className="text-sm font-bold">Grupo<select value={group} onChange={(event) => { setGroup(event.target.value); setStudentId(""); }} className="mt-2 w-full rounded-xl border p-3"><option value="">Todos los grupos del curso</option>{groups.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="text-sm font-bold">Situación<select value={sa} onChange={(event) => { const value = event.target.value; if (initialSituation) { startCourseChange(() => router.push(value ? `/profesor/${year === 2 ? "2bach/" : ""}${value.toLowerCase()}` : `/profesor?curso=${year}`)); } else { setSa(value); } }} disabled={changingCourse || refreshing} className="mt-2 w-full rounded-xl border p-3"><option value="">Todas las situaciones</option>{data.situations.map((entry) => <option key={entry.id} value={entry.code}>{entry.code} · {entry.title}</option>)}</select></label>
        <label className="text-sm font-bold">Vista<select value={view} onChange={(event) => setView(event.target.value as typeof view)} className="mt-2 w-full rounded-xl border p-3"><option value="group">Grupal</option><option value="individual">Individual</option></select></label>
        <label className="text-sm font-bold">Alumno/a<select value={selected?.id ?? ""} onChange={(event) => { setStudentId(event.target.value); setView("individual"); }} className="mt-2 w-full rounded-xl border p-3">{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>
      </div>
      <p className="mt-3 text-xs text-slate-500">Última consulta: {new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", dateStyle: "short", timeStyle: "medium" }).format(new Date(data.loadedAt))}</p>
      {refreshMessage && <p role={refreshError ? "alert" : "status"} className={refreshError ? "mt-2 text-sm text-red-700" : "mt-2 text-sm text-emerald-700"}>{refreshMessage}</p>}
      {changingCourse && <p role="status" className="mt-3 font-semibold text-[#1e6b4f]">Cargando los resultados del curso seleccionado…</p>}
      <p className="mt-4 text-xs text-slate-500">{students.length} alumnos en el filtro · {activities.length} registros. No se calcula una nota global mezclando actividades de naturaleza distinta.</p>
    </section>
    {!students.length ? <p className="card p-6">No hay alumnado activo en este grupo.</p> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{categories.map(([category, label]) => {
        const groupSummary = categorySummary(activities, students, category);
        const own = personal.filter((row) => row.category === category).length;
        const scale = Math.max(1, own, groupSummary.perStudent);
        return <article key={category} className="card space-y-3 p-5"><h2 className="font-extrabold">{label}</h2>{view === "group" ? <><Bar label="Alumnado con registros" value={groupSummary.coverage} suffix="%"/><p className="text-xs text-slate-500">{groupSummary.participants}/{students.length} alumnos · {groupSummary.count} registros · media {fmt(groupSummary.perStudent)} por alumno</p></> : <><Bar label={selected!.name} value={own} max={scale}/><Bar label="Media de registros por alumno del grupo" value={groupSummary.perStudent} max={scale} color="bg-sky-500"/></>}</article>;
      })}</section>
      <section className="card space-y-5 p-5 sm:p-7"><h2 className="text-xl font-extrabold">Trabajo finalizado y seguimiento declarado</h2><p className="text-sm text-slate-500">Estos porcentajes se calculan sobre los registros existentes, no sobre todas las tareas del curso. No equivalen a una calificación.</p><div className="grid gap-5 md:grid-cols-2">{(["plans", "questionnaires", "procedural", "projects"] as ActivityCategory[]).map((category) => {
        const rows = details.filter((row) => row.category === category);
        const finished = rows.filter((row) => row.status === "completed" || row.status === "submitted").length;
        return <div key={category}><Bar label={`${activityCategories[category]} finalizados/enviados`} value={rows.length ? finished / rows.length * 100 : null} suffix="%"/><p className="mt-2 text-xs text-slate-500">{finished}/{rows.length} registros; {rows.length - finished} en borrador, en marcha u otro estado.</p></div>;
      })}{["Esfuerzo percibido", "Realización declarada (%)"].map((label) => {
        const rows = details.filter((row) => row.category === "journals" && row.scoreLabel === label && row.score !== null);
        return <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-bold">{label}</p><p className="mt-2 text-2xl font-extrabold">{fmt(mean(rows.map((row) => row.score!)))}</p><p className="mt-1 text-xs text-slate-500">Media de {rows.length} registros con este indicador. Los diarios sin respuesta no se incluyen.</p></div>;
      })}</div></section>
      <section className="card space-y-4 p-5 sm:p-7"><h2 className="text-xl font-extrabold">Resultados de autoevaluación teórica</h2><p className="text-sm text-slate-500">Se utiliza la mejor puntuación guardada de cada tema. La media de grupo da el mismo peso a cada alumno que ha realizado algún test; los pendientes no se cuentan como cero.</p>{view === "individual" && <Bar label={`Resultado medio · ${individualScores.length} tests`} value={mean(individualScores)} suffix="%"/>}<Bar label={`Media del grupo · ${groupScores.length} alumnos con tests`} value={mean(groupScores)} suffix="%" color="bg-sky-500"/><p className="text-sm">{view === "individual" ? `${individualScores.filter((score) => score >= 67).length} de ${individualScores.length} tests realizados superados (mínimo 67%).` : `${activities.filter((row) => row.category === "quizzes" && (row.score ?? -1) >= 67).length} tests superados en el grupo (mínimo 67%).`}</p></section>
      {(!sa || sa === "SA1") && <section className="card space-y-5 p-5 sm:p-7"><h2 className="text-xl font-extrabold">Evolución física por capacidades</h2><p className="text-sm text-slate-500">La red compara septiembre y diciembre con el promedio del grupo, situado en el 100 %. Debajo se conservan todas las marcas, unidades, tamaños de muestra y cambios emparejados.</p>{physicalRadar.length >= 3 && <PhysicalRadarChart data={physicalRadar} title={view === "individual" ? `Perfil físico de ${selected!.name}` : "Evolución del grupo por capacidades"}/>} {["Fuerza", "Resistencia", "Velocidad", "Flexibilidad / movilidad", "Otras pruebas"].map((capacity) => {
        const tests = data.physicalTests.filter((test) => physicalCapacity(test.name) === capacity && activities.some((row) => row.category === "physical" && row.details.physical_test_id === test.id));
        return tests.length ? <div key={capacity}><h3 className="mb-3 font-extrabold text-[#1e6b4f]">{capacity}</h3><div className="grid gap-4 md:grid-cols-2">{tests.map((test) => {
          const values = physicalComparison(activities, selected!.id, test, groupIds);
          return <article key={test.id} className="space-y-3 rounded-xl border p-4"><h4 className="font-bold">{test.name} · {test.unit}</h4>{view === "individual" && <div className="grid grid-cols-2 gap-3"><Value label="Septiembre · alumno/a" value={values.first} suffix={test.unit}/><Value label="Diciembre · alumno/a" value={values.last} suffix={test.unit}/><p className="col-span-2 text-xs">Mejora entre tomas: {fmt(values.improvement)}{values.improvement !== null ? "%" : ""}</p></div>}<div className="grid grid-cols-2 gap-3"><Value label={`Media septiembre · n=${values.initialN}`} value={values.initialMean} suffix={test.unit}/><Value label={`Media diciembre · n=${values.finalN}`} value={values.finalMean} suffix={test.unit}/></div><p className="text-xs text-slate-500">Mismos {values.pairedN} alumnos en ambas tomas: {fmt(values.pairedInitial)} → {fmt(values.pairedFinal)} {test.unit}. {test.direction === "lower_better" ? "Menor marca indica mejor resultado." : "Mayor marca indica mejor resultado."}</p></article>;
        })}</div></div> : null;
      })}{!activities.some((row) => row.category === "physical") && <p>Sin marcas físicas registradas en este filtro.</p>}</section>}
      <section className="card overflow-hidden p-5 sm:p-7"><h2 className="text-xl font-extrabold">Resumen de cada alumno/a</h2><p className="mt-2 text-sm text-slate-500">Número de registros por apartado. Pulsa un nombre para consultar el trabajo completo.</p><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th className="p-3">Alumno/a</th>{categories.map(([key, label]) => <th key={key} className="p-3">{label}</th>)}</tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-t"><td className="p-3"><button className="font-bold text-[#1e6b4f] underline" onClick={() => { setStudentId(student.id); setView("individual"); }}>{student.name}</button></td>{categories.map(([key]) => <td key={key} className="p-3">{activities.filter((row) => row.studentId === student.id && row.category === key).length}</td>)}</tr>)}</tbody></table></div></section>
      <section className="card space-y-4 p-5 sm:p-7"><h2 className="text-xl font-extrabold">{view === "individual" ? `Trabajo de ${selected!.name}` : "Detalle de los registros del grupo"}</h2><p className="text-sm text-slate-500">Los planes reflejan lo previsto y su estado declarado; los diarios reflejan lo registrado tras la práctica. Abre cada apartado para leer objetivos, ejercicios, cargas, reflexiones y resultados.</p>{categories.map(([category, label]) => {
        const rows = details.filter((row) => row.category === category).sort((a, b) => b.date.localeCompare(a.date));
        return <details key={category} className="rounded-xl border p-4"><summary className="cursor-pointer font-bold">{label} · {rows.length} registros</summary><div className="mt-4 space-y-3">{!rows.length && <p className="text-sm text-slate-500">Sin registros guardados.</p>}{rows.map((row) => <details key={row.id} className="rounded-lg bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-semibold">{view === "group" ? `${students.find((student) => student.id === row.studentId)?.name} · ` : ""}{row.sa} · {row.title} {row.status ? `· ${statuses[row.status] ?? row.status}` : ""}{row.score !== null ? ` · ${fmt(row.score)} ${row.scoreLabel ?? ""}` : ""}</summary><div className="mt-4 text-sm"><p className="mb-3 text-xs text-slate-500">Último registro: {row.date ? new Date(row.date).toLocaleDateString("es-ES") : "Sin fecha"}</p><DetailValue value={row.details}/></div></details>)}</div></details>;
      })}</section>
      {(!sa || sa === "SA1") && <section className="space-y-4"><h2 className="text-xl font-extrabold">Informes psicológicos · inicial y final</h2><TeacherPsychologicalReports key={`${year}-${group}-${selected?.id}-${data.loadedAt}`} initialYear={year} initialStudentId={selected?.id} initialGroup={selected?.group}/></section>}
    </>}
  </div>;
}

