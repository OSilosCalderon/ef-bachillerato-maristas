"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, LockKeyhole, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Course = { id: string; name: string; bachillerato_year: number };
type Student = { id: string; displayName: string; classGroup: string };
type Questionnaire = { id: string; instrument_code: "GOES" | "BPNES"; assessment_phase: "initial" | "final" };
type Question = { id: string; questionnaire_id: string };
type Attempt = { id: string; questionnaire_id: string; student_id: string };
type Response = { attempt_id: string; question_id: string; answer: { option_id?: string } };
type Report = { studentId: string; instrument: "GOES" | "BPNES"; phase: "initial" | "final"; values: Record<string, number> };

const dimensions = {
  GOES: [["task", "Orientación a la tarea"], ["ego", "Orientación al ego"]],
  BPNES: [["autonomy", "Autonomía"], ["competence", "Competencia"], ["relatedness", "Relación con los demás"]],
} as const;

export function TeacherPsychologicalReports() {
  const [courseYear, setCourseYear] = useState<1 | 2>(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [group, setGroup] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const supabase = createClient();
        const { data: courseRows, error: courseError } = await supabase.from("courses").select("id,name,bachillerato_year").in("bachillerato_year", [1, 2]).order("bachillerato_year");
        if (courseError) throw courseError;
        const selectedCourse = ((courseRows ?? []) as Course[]).find((course) => Number(course.bachillerato_year) === courseYear);
        if (!selectedCourse) throw new Error("No se ha encontrado el curso seleccionado.");
        const { data: studentRows, error: studentError } = await supabase.from("students").select("id,profiles(display_name,class_group)").eq("course_id", selectedCourse.id).eq("active", true);
        if (studentError) throw studentError;
        const normalizedStudents = (studentRows ?? []).map((row) => {
          const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          return { id: String(row.id), displayName: String(profile?.display_name ?? "Alumno/a"), classGroup: String(profile?.class_group ?? `${courseYear}º Bachillerato`) };
        }).sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
        const { data: sa1, error: saError } = await supabase.from("learning_situations").select("id").eq("course_id", selectedCourse.id).eq("code", "SA1").single();
        if (saError || !sa1) throw new Error("No se ha encontrado la SA1 del curso.");
        const { data: questionnaireRows, error: questionnaireError } = await supabase.from("questionnaires").select("id,instrument_code,assessment_phase").eq("learning_situation_id", sa1.id).not("instrument_code", "is", null);
        if (questionnaireError) throw questionnaireError;
        const qs = (questionnaireRows ?? []) as Questionnaire[];
        if (!qs.length) { if (!cancelled) { setStudents(normalizedStudents); setReports([]); } return; }
        const qIds = qs.map((q) => q.id);
        const { data: questionRows, error: questionError } = await supabase.from("questionnaire_questions").select("id,questionnaire_id").in("questionnaire_id", qIds);
        if (questionError) throw questionError;
        const questions = (questionRows ?? []) as Question[];
        const { data: dimensionRows, error: dimensionError } = await supabase.from("questionnaire_question_dimensions").select("question_id,dimension").in("question_id", questions.map((question) => question.id));
        if (dimensionError) throw dimensionError;
        const { data: optionRows, error: optionError } = await supabase.from("questionnaire_options").select("id,question_id").in("question_id", questions.map((question) => question.id));
        if (optionError) throw optionError;
        const optionIds = (optionRows ?? []).map((option) => String(option.id));
        const scoresResult = optionIds.length ? await supabase.from("questionnaire_option_scores").select("option_id,score").in("option_id", optionIds) : { data: [], error: null };
        if (scoresResult.error) throw scoresResult.error;
        const { data: attemptRows, error: attemptError } = await supabase.from("questionnaire_attempts").select("id,questionnaire_id,student_id").in("questionnaire_id", qIds).eq("status", "submitted");
        if (attemptError) throw attemptError;
        const attempts = (attemptRows ?? []) as Attempt[];
        const responsesResult = attempts.length ? await supabase.from("questionnaire_responses").select("attempt_id,question_id,answer").in("attempt_id", attempts.map((attempt) => attempt.id)) : { data: [], error: null };
        if (responsesResult.error) throw responsesResult.error;
        const dimensionMap = new Map((dimensionRows ?? []).map((row) => [String(row.question_id), String(row.dimension)]));
        const optionQuestionMap = new Map((optionRows ?? []).map((option) => [String(option.id), String(option.question_id)]));
        const scoreMap = new Map((scoresResult.data ?? []).map((score) => [String(score.option_id), Number(score.score)]));
        const questionnaireMap = new Map(qs.map((q) => [q.id, q]));
        const responseByAttempt = new Map<string, Response[]>();
        for (const response of (responsesResult.data ?? []) as Response[]) responseByAttempt.set(response.attempt_id, [...(responseByAttempt.get(response.attempt_id) ?? []), response]);
        const calculated: Report[] = attempts.map((attempt) => {
          const q = questionnaireMap.get(attempt.questionnaire_id)!;
          const buckets = new Map<string, number[]>();
          for (const response of responseByAttempt.get(attempt.id) ?? []) {
            const optionId = String(response.answer?.option_id ?? "");
            const questionId = optionQuestionMap.get(optionId) ?? response.question_id;
            const dimension = dimensionMap.get(questionId);
            const score = scoreMap.get(optionId);
            if (dimension && score) buckets.set(dimension, [...(buckets.get(dimension) ?? []), score]);
          }
          return { studentId: attempt.student_id, instrument: q.instrument_code, phase: q.assessment_phase, values: Object.fromEntries([...buckets].map(([key, values]) => [key, average(values)])) };
        });
        if (!cancelled) { setStudents(normalizedStudents); setReports(calculated); }
      } catch (caught) { if (!cancelled) setError(caught instanceof Error ? caught.message : "No se han podido cargar los informes."); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load(); return () => { cancelled = true; };
  }, [courseYear]);

  const groups = useMemo(() => [...new Set(students.map((student) => student.classGroup))].sort(), [students]);
  const selectedGroup = groups.includes(group) ? group : groups[0] ?? "";
  const groupStudents = students.filter((student) => student.classGroup === selectedGroup);
  const selectedStudentId = groupStudents.some((student) => student.id === studentId) ? studentId : groupStudents[0]?.id ?? "";
  const selectedStudent = students.find((student) => student.id === selectedStudentId);
  const groupIds = new Set(groupStudents.map((student) => student.id));
  const valueFor = (instrument: "GOES" | "BPNES", phase: "initial" | "final", dimension: string) => reports.find((report) => report.studentId === selectedStudentId && report.instrument === instrument && report.phase === phase)?.values[dimension] ?? Number.NaN;
  const groupValue = (instrument: "GOES" | "BPNES", phase: "initial" | "final", dimension: string) => average(reports.filter((report) => groupIds.has(report.studentId) && report.instrument === instrument && report.phase === phase).map((report) => report.values[dimension]).filter((value): value is number => typeof value === "number"));
  const completedCount = (instrument: "GOES" | "BPNES", phase: "initial" | "final") => new Set(reports.filter((report) => groupIds.has(report.studentId) && report.instrument === instrument && report.phase === phase).map((report) => report.studentId)).size;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><LockKeyhole className="mr-2 inline" size={17}/>Información sensible de seguimiento educativo. Los resultados se muestran solo al profesorado y describen respuestas a escalas; no constituyen un diagnóstico clínico.</section>
    <section className="card p-5"><div className="flex flex-wrap gap-3">{([1, 2] as const).map((year) => <button key={year} onClick={() => { setCourseYear(year); setGroup(""); setStudentId(""); }} className={`rounded-xl border px-4 py-3 text-sm font-bold ${courseYear === year ? "border-[#1e6b4f] bg-[#e7f2ed] text-[#164c3a]" : "border-slate-200"}`}>{year}º Bachillerato</button>)}</div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Grupo<select value={selectedGroup} onChange={(event) => { setGroup(event.target.value); setStudentId(""); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900">{groups.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Alumno/a<select value={selectedStudentId} onChange={(event) => setStudentId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-900">{groupStudents.map((student) => <option key={student.id} value={student.id}>{student.displayName}</option>)}</select></label></div></section>
    {loading && <section className="card p-6 text-sm text-slate-500">Calculando informes…</section>}{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p>}
    {!loading && !error && <><section className="card p-6 sm:p-8"><div className="flex items-start gap-3"><BarChart3 className="mt-1 text-[#1e6b4f]"/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#1e6b4f]">Informe psicológico educativo individual</p><h2 className="mt-2 text-2xl font-extrabold">{selectedStudent?.displayName ?? "Sin alumnado"}</h2><p className="mt-1 text-sm text-slate-500">Comparación inicial/final de SA1. Escala media de 1 a 5.</p></div></div><div className="mt-7 grid gap-6 xl:grid-cols-2">{(["GOES", "BPNES"] as const).map((instrument) => <ReportCard key={instrument} instrument={instrument} getValue={(phase, dimension) => valueFor(instrument, phase, dimension)}/>)}</div><Narrative reports={reports.filter((report) => report.studentId === selectedStudentId)}/></section>
    <section className="card p-6 sm:p-8"><div className="flex items-start gap-3"><Users className="mt-1 text-[#1e6b4f]"/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#1e6b4f]">Informe grupal</p><h2 className="mt-2 text-2xl font-extrabold">{selectedGroup || `Curso de ${courseYear}º`}</h2><p className="mt-1 text-sm text-slate-500">Media del grupo por dimensión; ningún alumno puede consultar esta comparación.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(["GOES", "BPNES"] as const).flatMap((instrument) => (["initial", "final"] as const).map((phase) => <div key={`${instrument}-${phase}`} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{instrument} · {phase === "initial" ? "Inicial" : "Final"}</p><p className="mt-2 text-2xl font-extrabold">{completedCount(instrument, phase)}<span className="text-sm font-semibold text-slate-400">/{groupStudents.length}</span></p><p className="text-xs text-slate-500">cuestionarios entregados</p></div>))}</div><div className="mt-7 grid gap-6 xl:grid-cols-2">{(["GOES", "BPNES"] as const).map((instrument) => <ReportCard key={instrument} instrument={instrument} getValue={(phase, dimension) => groupValue(instrument, phase, dimension)}/>)}</div><Narrative reports={reports.filter((report) => groupIds.has(report.studentId))} group/></section></>}
    <p className="text-xs leading-5 text-slate-500">GOES: Kilpatrick, Bartholomew y Riemer (2003), validación española de Moreno et al. (2007). BPNES: Vlachopoulos y Michailidou (2006), adaptación a Educación Física de Moreno et al. (2008).</p>
  </div>;
}

function ReportCard({ instrument, getValue }: { instrument: "GOES" | "BPNES"; getValue: (phase: "initial" | "final", dimension: string) => number }) { return <article className="rounded-2xl border border-slate-200 p-5"><h3 className="text-lg font-extrabold">{instrument}</h3><div className="mt-5 space-y-5">{dimensions[instrument].map(([key, label]) => <div key={key}><div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-semibold">{label}</p><p className="text-xs text-slate-500">Inicial {format(getValue("initial", key))} · Final {format(getValue("final", key))}</p></div><ScoreBar value={getValue("initial", key)} color="bg-sky-500" label="Inicial"/><ScoreBar value={getValue("final", key)} color="bg-emerald-500" label="Final"/></div>)}</div></article>; }
function ScoreBar({ value, color, label }: { value: number; color: string; label: string }) { const width = Number.isFinite(value) ? Math.max(0, Math.min(100, ((value - 1) / 4) * 100)) : 0; return <div className="mb-1 grid grid-cols-[3rem_1fr_2.5rem] items-center gap-2"><span className="text-[11px] font-semibold text-slate-500">{label}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }}/></div><span className="text-right text-xs font-bold">{format(value)}</span></div>; }
function Narrative({ reports, group = false }: { reports: Report[]; group?: boolean }) { const scope = group ? "El grupo" : "El alumno o alumna"; const hasInitial = reports.some((report) => report.phase === "initial"); const hasFinal = reports.some((report) => report.phase === "final"); return <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600"><h3 className="font-extrabold text-slate-900">Lectura descriptiva</h3>{!hasInitial && <p className="mt-2">Aún no hay una evaluación inicial completa para generar el informe.</p>}{hasInitial && !hasFinal && <p className="mt-2">{scope} ya dispone de una línea de base. El informe final se completará cuando se responda la segunda toma.</p>}{hasInitial && hasFinal && <p className="mt-2">Las dos tomas permiten observar cambios en orientación de meta y percepción de autonomía, competencia y relación. Interpreta cada dimensión por separado y junto al contexto de clase; las escalas no establecen por sí solas categorías diagnósticas.</p>}<p className="mt-2">En GOES, tarea y ego son orientaciones distintas y pueden coexistir. En BPNES, una media mayor expresa una percepción más favorable de la necesidad correspondiente dentro de las clases.</p></div>; }
function average(values: number[]) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : Number.NaN; }
function format(value: number) { return Number.isFinite(value) ? value.toFixed(2) : "—"; }
