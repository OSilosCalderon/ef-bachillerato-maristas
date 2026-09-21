"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { secondYearTheoryTopics } from "@/lib/second-year-theory-topics";

type Pulse = { code: string; completed: number; total: number; evidence: number; highlights: string[] };
type Row = Record<string, unknown>;

export function StudentSituationPulse({ courseYear, visibleSituations }: { courseYear: 1 | 2; visibleSituations: string[] }) {
  const [rows, setRows] = useState<Pulse[] | null>(null);
  const [error, setError] = useState("");
  const topics = useMemo(() => courseYear === 2 ? secondYearTheoryTopics : [...trainingTheoryTopics, flexibilityTheoryTopic].map((topic) => ({ ...topic, sa: "SA1" })), [courseYear]);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("No se ha podido identificar tu cuenta.");
      const { data: student } = await supabase.from("students").select("id").eq("profile_id", auth.user.id).eq("active", true).single();
      if (!student) throw new Error("No se ha encontrado tu perfil de alumno.");
      const studentId = String(student.id);
      const requests = [
        supabase.from("theory_topic_progress").select("topic_slug,completed,quiz_score").eq("student_id", studentId),
        supabase.from("personal_training_plans").select("sa_code,status").eq("student_id", studentId),
        supabase.from("training_session_logs").select("sa_code,status").eq("student_id", studentId),
        supabase.from("healthy_habit_plans").select("sa_code,status").eq("student_id", studentId),
        supabase.from("healthy_habit_weekly_logs").select("sa_code").eq("student_id", studentId),
        supabase.from("sports_event_projects").select("sa_code,status").eq("student_id", studentId),
        supabase.from("physical_test_results").select("period").eq("student_id", studentId),
        supabase.from("questionnaire_attempts").select("status").eq("student_id", studentId),
      ];
      const results = await Promise.all(requests);
      const values = results.map((result) => (result.data ?? []) as Row[]);
      const [theory, plans, logs, habitPlans, habitLogs, projects, physical, questionnaires] = values;
      const output = visibleSituations.map((code) => {
        const topicSlugs = new Set(topics.filter((topic) => topic.sa === code).map((topic) => topic.slug));
        const topicRows = theory.filter((row) => topicSlugs.has(String(row.topic_slug)));
        const read = topicRows.filter((row) => row.completed).length;
        const tests = topicRows.filter((row) => row.quiz_score !== null).length;
        const planCount = plans.filter((row) => row.sa_code === code).length;
        const logCount = logs.filter((row) => row.sa_code === code).length;
        const habits = habitPlans.filter((row) => row.sa_code === code).length + habitLogs.filter((row) => row.sa_code === code).length;
        const projectCount = projects.filter((row) => row.sa_code === code).length;
        const physicalCount = code === "SA1" ? physical.length : 0;
        const questionnaireCount = code === "SA1" ? questionnaires.filter((row) => row.status === "submitted").length : 0;
        const evidence = read + tests + planCount + logCount + habits + projectCount + physicalCount + questionnaireCount;
        const theoryExpected = Math.max(1, topicSlugs.size * 2);
        const practicalExpected = code === "SA1" ? 4 : code === "SA2" ? 3 : code === "SA3" ? 3 : 2;
        const total = theoryExpected + practicalExpected;
        const completed = Math.min(total, read + tests + Math.min(practicalExpected, planCount + logCount + habits + projectCount + (physicalCount ? 1 : 0) + questionnaireCount));
        const highlights = [`${read}/${topicSlugs.size || 1} lecturas`, `${tests}/${topicSlugs.size || 1} autoevaluaciones`];
        if (code === "SA1") highlights.push(`${physicalCount} marcas · ${questionnaireCount} cuestionarios`);
        else if (code === "SA2") highlights.push(`${logCount} seguimientos`);
        else if (code === "SA3") highlights.push(`${habits} registros de hábitos`);
        else if (code === "SA4") highlights.push(`${projectCount} proyectos`);
        else highlights.push(`${evidence} evidencias guardadas`);
        return { code, completed, total, evidence, highlights };
      });
      if (active) setRows(output);
    }
    load().catch(() => { if (active) setError("No se ha podido actualizar el resumen de progreso."); });
    return () => { active = false; };
  }, [courseYear, topics, visibleSituations]);

  if (error) return <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!rows) return <p role="status" className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={17}/>Actualizando tu evolución por situaciones…</p>;
  return <section aria-labelledby="pulse-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#0f766e]">Tu evolución, de un vistazo</p><h2 id="pulse-title" className="mt-1 text-2xl font-black">Progreso por situación</h2></div><Link href="/alumno/progreso" className="inline-flex items-center gap-2 text-sm font-black text-[#0f766e]">Ver todo el detalle <ArrowRight size={16}/></Link></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((item) => { const percent = Math.round(item.completed / item.total * 100); return <article key={item.code} className="modern-panel p-5"><div className="flex items-center justify-between"><span className="rounded-full bg-[#dff8ed] px-3 py-1 text-xs font-black text-[#0f766e]">{item.code}</span><strong className="text-2xl font-black">{percent}%</strong></div><div className="progress-track mt-4 h-2.5"><div className="progress-fill" style={{ width: `${percent}%` }}/></div><div className="mt-4 space-y-2">{item.highlights.map((text) => <p key={text} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><CheckCircle2 size={14} className="text-[#0f766e]"/>{text}</p>)}</div><p className="mt-4 text-[11px] leading-5 text-slate-400">{item.evidence} registros conservados. Los pendientes no se cuentan como realizados.</p></article>; })}</div></section>;
}

