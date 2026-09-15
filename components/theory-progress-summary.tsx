"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Award, BookMarked, BrainCircuit, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { secondYearTheoryTopics } from "@/lib/second-year-theory-topics";
import { loadTheoryTopicProgress, type TheoryTopicProgress } from "@/lib/training-theory-data";

const PASS_SCORE = 67;

export function TheoryProgressSummary({ courseYear = 1 }: { courseYear?: 1 | 2 }) {
  const topics = courseYear === 2 ? secondYearTheoryTopics : [...trainingTheoryTopics, flexibilityTheoryTopic];
  const [progress, setProgress] = useState<Record<string, TheoryTopicProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTheoryTopicProgress()
      .then((result) => setProgress(Object.fromEntries(result.progress.map((item) => [item.topicSlug, item]))))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se ha podido cargar el progreso teórico."))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const read = topics.filter((topic) => progress[topic.slug]?.completed).length;
    const passed = topics.filter((topic) => (progress[topic.slug]?.quizScore ?? 0) >= PASS_SCORE).length;
    const mastered = topics.filter((topic) => progress[topic.slug]?.completed && (progress[topic.slug]?.quizScore ?? 0) >= PASS_SCORE).length;
    return { read, passed, mastered, percent: Math.round(((read + passed) / (topics.length * 2)) * 100) };
  }, [progress, topics]);

  if (loading) return <section className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={18}/> Cargando progreso de teoría…</section>;
  if (error) return <section className="card border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">{error}</section>;

  return (
    <section className="space-y-5">
      <div className="card overflow-hidden">
        <div className="grid gap-6 bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Progreso de conocimientos · {courseYear}º Bachillerato</p>
            <h2 className="mt-2 text-2xl font-black">{courseYear === 2 ? "Módulos teóricos de 2º" : "Teoría de entrenamiento deportivo"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">El progreso distingue entre haber estudiado un tema y haber demostrado los conocimientos en su test de autoevaluación.</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-4 text-center"><p className="text-3xl font-black">{summary.percent}%</p><p className="text-xs text-slate-300">progreso teórico global</p></div>
        </div>
        <div className="h-2 bg-slate-100"><div className="h-full bg-[#1e6b4f]" style={{ width: `${summary.percent}%` }}/></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="card p-5"><BookMarked className="text-[#1e6b4f]" size={20}/><p className="mt-4 text-sm text-slate-500">{courseYear === 2 ? "Módulos leídos" : "Temas leídos"}</p><p className="mt-1 text-3xl font-black">{summary.read}/{topics.length}</p></article>
        <article className="card p-5"><Award className="text-amber-600" size={20}/><p className="mt-4 text-sm text-slate-500">Tests superados</p><p className="mt-1 text-3xl font-black">{summary.passed}/{topics.length}</p><p className="mt-1 text-xs text-slate-400">Mínimo 67%</p></article>
        <article className="card p-5"><BrainCircuit className="text-sky-700" size={20}/><p className="mt-4 text-sm text-slate-500">{courseYear === 2 ? "Módulos dominados" : "Temas dominados"}</p><p className="mt-1 text-3xl font-black">{summary.mastered}/{topics.length}</p><p className="mt-1 text-xs text-slate-400">Leído + test superado</p></article>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h3 className="text-xl font-extrabold">Detalle por {courseYear === 2 ? "módulo" : "tema"}</h3><p className="mt-1 text-sm text-slate-500">Consulta qué te queda por estudiar o superar.</p></div><Link href="/alumno/apuntes-entrenamiento" className="rounded-xl bg-slate-950 px-4 py-2.5 text-center text-sm font-bold text-white">Ir a los apuntes</Link></div>
        <div className="divide-y divide-slate-100">
          {topics.map((topic) => {
            const item = progress[topic.slug];
            const read = Boolean(item?.completed);
            const score = item?.quizScore ?? null;
            const passed = (score ?? 0) >= PASS_SCORE;
            return <article key={topic.slug} className="grid gap-3 p-5 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:p-6"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">{topic.number}</span><div><h4 className="font-extrabold text-slate-900">{topic.title}</h4><p className="mt-1 text-xs text-slate-500">{topic.subtitle}</p></div><Status ok={read} label="Leído"/><div className="flex min-w-[140px] items-center gap-2"><Status ok={passed} label="Test superado"/>{score != null && <span className="text-xs font-bold text-slate-500">{score}%</span>}</div></article>;
          })}
        </div>
      </div>
    </section>
  );
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"}`}>{ok ? <CheckCircle2 size={14}/> : <Circle size={10}/>} {ok ? label : "Pendiente"}</span>;
}
