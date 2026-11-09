"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { TeacherSessionScoreSummary, TeacherBlockScores } from "@/components/teacher-assessment-summary";
import { sessionAssessmentSummary, studentBlockScores } from "@/lib/teacher-assessment-summary";
import type { PublishedAssessmentGrade } from "@/lib/gradebook";
import type { TeacherSessionEvaluation } from "@/lib/teacher-activity";
import { TeacherStudentChecklist } from "@/components/teacher-student-checklist";
import { studentCompletion, completionTotals } from "@/lib/teacher-completion";
import { isPlanSessionLog, teacherSessionSlots } from "@/lib/teacher-session-grading";
import { TeacherSessionEvaluationForm } from "@/components/teacher-session-grading";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";
import { refreshTeacherActivity } from "@/app/profesor/actions";
import { activityCategories, isEvaluationInstrumentAchieved, mean, physicalComparison, type ActivityCategory, type TeacherActivity, type TeacherActivityData } from "@/lib/teacher-activity";
import { physicalCapacity } from "@/lib/second-year-progress";
import { TeacherPsychologicalReports } from "@/components/teacher-psychological-reports";
import { PhysicalRadarChart } from "@/components/physical-radar-chart";
import { downloadPersonalPlanPdf } from "@/lib/personal-plan-pdf";
import { savedPlanPdfData } from "@/lib/saved-plan-pdf";
import { TeacherActivityDetail, teacherActivityStatuses as statuses } from "@/components/teacher-activity-detail";

const fmt = (value: number | null) => value === null ? "Sin datos" : new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value);
function exportStudentPlan(row: TeacherActivity, student: TeacherActivityData["students"][number], year: 1 | 2) {
  downloadPersonalPlanPdf(savedPlanPdfData(row.details, student, year));
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
  const planSa = year === 1 ? "SA1" : "SA2";
  const sessions = teacherSessionSlots(personalRows, student.id, [], year, student.group).map(({number,planned,record:row}) => {
    const numeric = (value: unknown) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value)) ? null : Number(value);
    return {sessionNumber:number,date:typeof row?.details.session_date === "string" ? row.details.session_date : planned.date,
      durationMinutes:numeric(row?.details.duration_minutes),rpe:numeric(row?.details.rpe),completionPercent:numeric(row?.details.completion_percent),
      recorded:Boolean(row && (row.status === "completed" || row.status === "submitted"))};
  });
  if (!expectedCatalog?.some((item) => item.sa === planSa && item.category === "journals" && item.filters?.session_number)) for (const session of sessions) instruments.push({sa:planSa,title:"Sesión " + session.sessionNumber + " · valoración",completed:session.recorded});
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
    resultsReport: { sessionSa: planSa,
      situations: situations.map((situation) => ({ code: situation.code, title: situation.title })),
      instruments,
      sessions,
      radar,
    },
  });
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
  const sessionSummaries = new Map(students.map((student) => [student.id, sessionAssessmentSummary(data, student.id, year)]));
  const blockScores = new Map(students.map((student) => [student.id, studentBlockScores(data, student.id, year, sa)]));
  function updatePublishedGrade(grade: PublishedAssessmentGrade) {
    setData((current) => ({...current,assessmentGrades:[...(current.assessmentGrades ?? []).filter((row) => !(row.student_id === grade.student_id && row.item_id === grade.item_id)),grade]}));
  }
  function updateSessionEvaluation(studentId: string, number: number, evaluation: Omit<TeacherSessionEvaluation, "studentId" | "number">) {
    setData((current) => ({...current,
      sessionEvaluations:[...(current.sessionEvaluations ?? []).filter((row) => !(row.studentId === studentId && row.number === number)),{...evaluation,studentId,number}],
      activities:current.activities.map((row) => row.studentId === studentId && isPlanSessionLog(row,year) && Number(row.details.session_number) === number
        ? {...row,details:{...row.details,teacher_score:evaluation.score,teacher_absent:evaluation.absent ?? false,teacher_comment:evaluation.comment,teacher_evaluated_at:evaluation.updatedAt}} : row),
    }));
  }
  const groupTotals = completionTotals([...completionByStudent.values()].flat());
  const selectedCohortIds = new Set(data.students.filter((student) => student.group === selected?.group).map((student) => student.id));
  const selectedCohortRows = data.activities.filter((row) => selectedCohortIds.has(row.studentId));
  const physicalRows = view === "individual" ? selectedCohortRows : data.activities.filter((row) => groupIds.has(row.studentId));
  const comparisonIds = view === "individual" ? selectedCohortIds : groupIds;
  function chooseStudent(id: string) { setStudentId(id); setView("individual"); setSa(""); }

  function renderRecord(row: TeacherActivity) {
    return <><p className="mb-3 text-xs text-slate-500">Última actualización: {row.date ? new Date(row.date).toLocaleDateString("es-ES") : "Sin fecha"}{row.status ? ` · ${statuses[row.status] ?? row.status}` : ""}</p>{row.category === "plans" && selected && <button type="button" onClick={() => exportStudentPlan(row, selected, year)} className="mb-4 inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white"><FileDown size={16}/>Descargar plan en PDF</button>}<TeacherActivityDetail value={row.details}/>{isPlanSessionLog(row, year) && <TeacherSessionEvaluationForm courseYear={year} key={row.id} studentId={row.studentId} sessionNumber={Number(row.details.session_number)} initialScore={row.details.teacher_score == null ? null : Number(row.details.teacher_score)} initialComment={String(row.details.teacher_comment ?? "")} initialAbsent={row.details.teacher_absent === true} onSaved={(evaluation) => updateSessionEvaluation(row.studentId, Number(row.details.session_number), evaluation)}/>}</>;
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
      {view === "individual" && selected ? <TeacherStudentChecklist key={`${selected.id}-${data.loadedAt}`} student={selected} items={selectedItems} situations={visibleSituations} renderRecord={renderRecord} summary={(!sa || sa === (year === 1 ? "SA1" : "SA2")) && <TeacherSessionScoreSummary summary={sessionSummaries.get(selected.id)!}/>} renderGrades={(code) => <TeacherBlockScores key={`${selected.id}-${code}-${data.loadedAt}`} entries={(blockScores.get(selected.id) ?? []).filter((entry) => entry.item.sa_code === code)} summary={sessionSummaries.get(selected.id)!} studentId={selected.id} onPublished={updatePublishedGrade}/>}/> : <section className="card p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold">Resumen de cada alumno/a</h2><p className="mt-2 text-sm text-slate-500">Selecciona un nombre para ver todo su trabajo, sus respuestas y lo que le falta en cada situación.</p></div><p className="text-sm font-bold text-[#164c3a]">{groupTotals.completed}/{groupTotals.total} tareas completadas en el grupo</p></div>
        <div className="mt-5 divide-y divide-slate-100">{students.map((student) => {
          const items = completionByStudent.get(student.id) ?? [];
          const total = completionTotals(items);
          const sessionSummary = sessionSummaries.get(student.id)!;
          return <article key={student.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(12rem,1fr)_minmax(14rem,2fr)_auto] sm:items-center">
            <div><button type="button" onClick={() => chooseStudent(student.id)} className="text-left text-sm font-extrabold text-[#164c3a] underline underline-offset-4">{student.name}</button><p className="mt-1 text-xs text-slate-500">{student.group}</p></div>
            <div><div className="flex justify-between gap-2 text-xs"><span>{total.completed}/{total.total} completadas · {total.pending} pendientes · {total.inProgress} en curso</span><strong>{total.percent}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{width:`${total.percent}%`}}/></div><div className="mt-2 flex flex-wrap gap-1.5">{visibleSituations.map((instrument) => {const part=completionTotals(items.filter((item) => item.sa===instrument.code));return <span key={instrument.code} className={`rounded-full px-2 py-1 text-[11px] font-semibold ${part.total && part.completed===part.total ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{instrument.code} · {part.completed}/{part.total}</span>;})}</div>{(!sa || sa === sessionSummary.sa) && <TeacherSessionScoreSummary summary={sessionSummary} compact/>}<TeacherBlockScores entries={blockScores.get(student.id) ?? []} summary={sessionSummary} studentId={student.id} compact/></div>
            <button type="button" onClick={() => chooseStudent(student.id)} className="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-bold text-[#164c3a]">Ver ficha completa</button>
          </article>;
        })}</div>
      </section>}
      {(!sa || sa === (year === 1 ? "SA1" : "SA2")) && <section className="card flex flex-wrap items-center justify-between gap-3 border-emerald-200 bg-emerald-50 p-5"><div><h2 className="font-extrabold text-[#164c3a]">Calificar las {year === 1 ? "ocho" : "diez"} sesiones · {year === 1 ? "SA1" : "SA2"}</h2><p className="mt-1 text-sm text-slate-600">Nota, comentario y ausencia, incluso sin seguimiento registrado.</p></div><Link href={`/profesor/calificar-sesiones?curso=${year}${view === "individual" && selected ? `&alumno=${selected.id}` : ""}`} className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Abrir calificaciones de las sesiones</Link></section>}
      {(!sa || sa === "SA1" || sa === "SA2") && <details className="card space-y-5 p-5 sm:p-7"><summary className="cursor-pointer text-lg font-extrabold">Evolución física · gráfica y marcas</summary><h2 className="text-xl font-extrabold">Evolución física por capacidades</h2><p className="text-sm text-slate-500">La red compara septiembre y diciembre con el promedio del grupo, situado en el 100 %. Debajo se conservan todas las marcas, unidades, tamaños de muestra y cambios emparejados.</p>{physicalRadar.length >= 3 && <PhysicalRadarChart data={physicalRadar} title={view === "individual" ? `Perfil físico de ${selected!.name}` : "Evolución del grupo por capacidades"}/>} {["Fuerza", "Resistencia", "Velocidad", "Flexibilidad / movilidad", "Otras pruebas"].map((capacity) => {
        const tests = data.physicalTests.filter((test) => physicalCapacity(test.name) === capacity && physicalRows.some((row) => row.category === "physical" && row.details.physical_test_id === test.id));
        return tests.length ? <div key={capacity}><h3 className="mb-3 font-extrabold text-[#1e6b4f]">{capacity}</h3><div className="grid gap-4 md:grid-cols-2">{tests.map((test) => {
          const values = physicalComparison(physicalRows, selected!.id, test, comparisonIds);
          return <article key={test.id} className="space-y-3 rounded-xl border p-4"><h4 className="font-bold">{test.name} · {test.unit}</h4>{view === "individual" && <div className="grid grid-cols-2 gap-3"><Value label="Septiembre · alumno/a" value={values.first} suffix={test.unit}/><Value label="Diciembre · alumno/a" value={values.last} suffix={test.unit}/><p className="col-span-2 text-xs">Mejora entre tomas: {fmt(values.improvement)}{values.improvement !== null ? "%" : ""}</p></div>}<div className="grid grid-cols-2 gap-3"><Value label={`Media septiembre · n=${values.initialN}`} value={values.initialMean} suffix={test.unit}/><Value label={`Media diciembre · n=${values.finalN}`} value={values.finalMean} suffix={test.unit}/></div><p className="text-xs text-slate-500">Mismos {values.pairedN} alumnos en ambas tomas: {fmt(values.pairedInitial)} → {fmt(values.pairedFinal)} {test.unit}. {test.direction === "lower_better" ? "Menor marca indica mejor resultado." : "Mayor marca indica mejor resultado."}</p></article>;
        })}</div></div> : null;
      })}{!physicalRows.some((row) => row.category === "physical") && <p>Sin marcas físicas registradas en este filtro.</p>}</details>}

      <details className="card p-5 sm:p-7"><summary className="cursor-pointer text-lg font-extrabold">Archivo de registros guardados</summary><p className="mt-3 text-sm text-slate-500">Consulta también el historial y los registros adicionales conservados en la plataforma.</p><div className="mt-4 space-y-3">{categories.map(([category,label]) => {
        const rows = details.filter((row) => row.category===category).sort((a,b) => b.date.localeCompare(a.date));
        return rows.length ? <details key={category} className="rounded-xl border p-4"><summary className="cursor-pointer text-sm font-bold">{label} · {rows.length}</summary><div className="mt-3 space-y-3">{rows.map((row) => <details key={row.id} className="rounded-lg bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-semibold">{view === "group" ? `${students.find((student) => student.id===row.studentId)?.name} · ` : ""}{row.sa} · {row.title}</summary><div className="mt-3">{view === "group" && row.category==="plans" ? <><button type="button" onClick={() => {const student=students.find((entry) => entry.id===row.studentId);if(student)exportStudentPlan(row,student,year);}} className="mb-3 rounded-lg border px-3 py-2 text-xs font-bold">Descargar plan en PDF</button><TeacherActivityDetail value={row.details}/></> : renderRecord(row)}</div></details>)}</div></details> : null;
      })}</div></details>
      {(!sa || sa === "SA1" || (year===2 && sa==="SA2")) && <details className="card p-5 sm:p-7"><summary className="cursor-pointer text-lg font-extrabold">Informes psicológicos · inicial y final</summary><div className="mt-5"><TeacherPsychologicalReports key={`${year}-${group}-${selected?.id}-${data.loadedAt}`} initialYear={year} initialStudentId={view==="individual"?selected?.id:undefined} initialGroup={view === "individual" ? selected?.group : group || undefined}/></div></details>}
    </>}
  </div>;
}


