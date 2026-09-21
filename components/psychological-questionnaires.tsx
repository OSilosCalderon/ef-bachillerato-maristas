"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Clock3, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Option = { id: string; label: string; value: string; position: number };
type Question = { id: string; prompt: string; position: number; questionnaire_options: Option[] };
type Questionnaire = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  instrument_code: "GOES" | "BPNES";
  assessment_phase: "initial" | "final";
  opens_at: string | null;
  closes_at: string | null;
  source_reference: string;
  questionnaire_questions: Question[];
};
type Attempt = { id: string; questionnaire_id: string; status: "in_progress" | "submitted"; submitted_at: string | null };
type SavedResponse = { attempt_id: string; question_id: string; answer: { option_id?: string; value?: string; label?: string } };

const phaseLabel = { initial: "Inicial", final: "Final" } as const;

export function PsychologicalQuestionnaires({ courseYear }: { courseYear: 1 | 2 }) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [responses, setResponses] = useState<SavedResponse[]>([]);
  const [studentId, setStudentId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión.");
      const { data: student, error: studentError } = await supabase.from("students").select("id,course_id").eq("profile_id", auth.user.id).eq("active", true).single();
      if (studentError || !student) throw new Error("No se ha encontrado tu perfil de alumno/a.");
      setStudentId(String(student.id));
      const { data: sa1, error: saError } = await supabase.from("learning_situations").select("id").eq("course_id", student.course_id).eq("code", "SA1").single();
      if (saError || !sa1) throw new Error("No se ha encontrado la SA1 de tu curso.");
      const { data: qRows, error: qError } = await supabase
        .from("questionnaires")
        .select("id,title,description,instructions,instrument_code,assessment_phase,opens_at,closes_at,source_reference,questionnaire_questions(id,prompt,position,questionnaire_options(id,label,value,position))")
        .eq("learning_situation_id", sa1.id)
        .not("instrument_code", "is", null);
      if (qError) throw qError;
      const normalized = ((qRows ?? []) as Questionnaire[]).map((q) => ({
        ...q,
        questionnaire_questions: [...q.questionnaire_questions]
          .sort((a, b) => a.position - b.position)
          .map((question) => ({ ...question, questionnaire_options: [...question.questionnaire_options].sort((a, b) => a.position - b.position) })),
      })).sort((a, b) => `${a.assessment_phase}-${a.instrument_code}`.localeCompare(`${b.assessment_phase}-${b.instrument_code}`));
      setQuestionnaires(normalized);
      if (!normalized.length) { setAttempts([]); setResponses([]); return; }
      const ids = normalized.map((q) => q.id);
      const { data: attemptRows, error: attemptError } = await supabase.from("questionnaire_attempts").select("id,questionnaire_id,status,submitted_at").eq("student_id", student.id).in("questionnaire_id", ids);
      if (attemptError) throw attemptError;
      const ownAttempts = (attemptRows ?? []) as Attempt[];
      setAttempts(ownAttempts);
      if (ownAttempts.length) {
        const { data: responseRows, error: responseError } = await supabase.from("questionnaire_responses").select("attempt_id,question_id,answer").in("attempt_id", ownAttempts.map((a) => a.id));
        if (responseError) throw responseError;
        setResponses((responseRows ?? []) as SavedResponse[]);
      } else setResponses([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se han podido cargar los cuestionarios.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const active = useMemo(() => questionnaires.find((q) => q.id === activeId) ?? null, [activeId, questionnaires]);
  const activeAttempt = active ? attempts.find((a) => a.questionnaire_id === active.id) : undefined;
  const activeResponses = activeAttempt ? responses.filter((r) => r.attempt_id === activeAttempt.id) : [];

  function openQuestionnaire(q: Questionnaire) {
    const attempt = attempts.find((a) => a.questionnaire_id === q.id);
    const saved = attempt ? responses.filter((r) => r.attempt_id === attempt.id) : [];
    setAnswers(Object.fromEntries(saved.map((r) => [r.question_id, String(r.answer.option_id ?? "")])));
    setActiveId(q.id);
    setMessage("");
  }

  async function submit() {
    if (!active || !studentId) return;
    if (active.questionnaire_questions.some((question) => !answers[question.id])) {
      setMessage("Responde todos los enunciados antes de entregar el cuestionario.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("submit_psychological_questionnaire", {
        p_questionnaire_id: active.id,
        p_answers: answers,
      });
      if (error) throw new Error(error.message);
      const receipt = data as { attempt: Attempt; responses: SavedResponse[] } | null;
      if (!receipt?.attempt || receipt.attempt.status !== "submitted" || !Array.isArray(receipt.responses) || receipt.responses.length !== active.questionnaire_questions.length) {
        throw new Error("No se ha podido confirmar la entrega. Pulsa Entregar otra vez; no se duplicará tu cuestionario.");
      }
      setAttempts((current) => [...current.filter((item) => item.questionnaire_id !== active.id), receipt.attempt]);
      setResponses((current) => [...current.filter((item) => item.attempt_id !== receipt.attempt.id), ...receipt.responses]);
      setAnswers(Object.fromEntries(receipt.responses.map((item) => [item.question_id, String(item.answer.option_id ?? "")])));
      setMessage("Cuestionario entregado. Puedes revisar tus respuestas, pero no las estadísticas ni las puntuaciones.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se ha podido guardar el cuestionario.");
    } finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
      <LockKeyhole className="mr-2 inline" size={17}/>
      En {courseYear}º, tus respuestas son privadas. Solo tú puedes revisar lo que has contestado; las puntuaciones y los informes de seguimiento solo están disponibles para el profesorado autorizado.
    </section>

    {loading && <section className="card p-6 text-sm text-slate-500">Cargando cuestionarios…</section>}
    {!loading && questionnaires.length === 0 && <section className="card p-6"><h2 className="font-extrabold">Próxima evaluación</h2><p className="mt-2 text-sm leading-6 text-slate-500">No hay cuestionarios abiertos ahora. La evaluación final de SA1 estará disponible del 23 de noviembre al 22 de diciembre.</p></section>}
    {!loading && questionnaires.length > 0 && <section className="grid gap-4 md:grid-cols-2">
      {questionnaires.map((q) => {
        const attempt = attempts.find((item) => item.questionnaire_id === q.id);
        const completed = attempt?.status === "submitted";
        return <article key={q.id} className="card flex flex-col p-6">
          <div className="flex items-center justify-between gap-3"><ClipboardCheck className="text-[#1e6b4f]"/><span className={`rounded-full px-3 py-1 text-xs font-bold ${completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{completed ? "Entregado" : "Disponible"}</span></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-[#1e6b4f]">{q.instrument_code} · {phaseLabel[q.assessment_phase]}</p>
          <h2 className="mt-2 text-lg font-extrabold">{q.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{q.description}</p>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14}/>{q.questionnaire_questions.length} enunciados · escala 1–5</p>
          <button disabled={saving} onClick={() => openQuestionnaire(q)} className="mt-5 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">{completed ? "Revisar mis respuestas" : "Responder"}</button>
        </article>;
      })}
    </section>}

    {active && <section className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#1e6b4f]">{active.instrument_code} · {phaseLabel[active.assessment_phase]}</p><h2 className="mt-2 text-2xl font-extrabold">{active.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{active.instructions}</p></div><button disabled={saving} onClick={() => setActiveId(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Cerrar</button></div>
      <div className="mt-7 space-y-6">
        {active.questionnaire_questions.map((question) => {
          const saved = activeResponses.find((response) => response.question_id === question.id);
          return <fieldset key={question.id} disabled={saving || activeAttempt?.status === "submitted"} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
            <legend className="px-2 text-sm font-bold text-slate-900">{question.position}. {question.prompt}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">
              {question.questionnaire_options.map((option) => {
                const checked = activeAttempt?.status === "submitted" ? saved?.answer.option_id === option.id : answers[question.id] === option.id;
                return <label key={option.id} className={`cursor-pointer rounded-xl border p-3 text-center text-xs leading-5 transition ${checked ? "border-[#1e6b4f] bg-[#e7f2ed] text-[#164c3a]" : "border-slate-200 bg-white text-slate-600"}`}><input className="sr-only" type="radio" name={question.id} checked={checked} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}/><span className="block text-base font-extrabold">{option.value}</span>{option.label}</label>;
              })}
            </div>
          </fieldset>;
        })}
      </div>
      {activeAttempt?.status === "submitted" ? <p className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18}/>Respuesta entregada. Esta vista muestra exclusivamente tus elecciones.</p> : <button onClick={submit} disabled={saving} className="mt-7 rounded-xl bg-[#1e6b4f] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Guardando…" : "Entregar cuestionario"}</button>}
      <p className="mt-5 text-xs leading-5 text-slate-400">Fuente: {active.source_reference} Uso educativo y descriptivo; este instrumento no emite un diagnóstico clínico.</p>
    </section>}
    {message && <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">{message}</p>}
    <p className="text-xs leading-5 text-slate-500">Los informes comparan la evaluación inicial y final de SA1. Solo el profesorado puede consultar puntuaciones, medias de grupo e informes.</p>
  </div>;
}
