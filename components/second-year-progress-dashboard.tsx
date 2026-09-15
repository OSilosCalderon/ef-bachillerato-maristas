"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { secondYearTheoryTopics } from "@/lib/second-year-theory-topics";
import { loadTheoryTopicProgress, type TheoryTopicProgress } from "@/lib/training-theory-data";
import { theoryProgressTotals } from "@/lib/second-year-progress";
import { SECOND_YEAR_PASS_SCORE } from "@/lib/second-year-theory-assessment";
import { SecondYearPhysicalProgress } from "@/components/second-year-physical-progress";

import { PercentCard } from "@/components/progress-percent-card";

export function SecondYearProgressDashboard({ visibleSituations }: { visibleSituations: string[] }) {
  const topics = secondYearTheoryTopics.filter((topic) => visibleSituations.includes(topic.sa));
  const [progress, setProgress] = useState<Record<string, TheoryTopicProgress> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    loadTheoryTopicProgress().then(({ progress: rows }) => { if (active) setProgress(Object.fromEntries(rows.map((item) => [item.topicSlug, item]))); })
      .catch(() => { if (active) setError("No se ha podido cargar tu progreso teórico. Vuelve a abrir esta página para intentarlo de nuevo."); });
    return () => { active = false; };
  }, []);
  const total = progress ? theoryProgressTotals(topics.map((topic) => topic.slug), progress) : null;

  return <div className="space-y-7">
    <section className="card p-5 sm:p-7" aria-labelledby="theory-overview-title">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#1e6b4f]">2º Bachillerato · 6 módulos</p>
      <h2 id="theory-overview-title" className="mt-2 text-2xl font-extrabold">Mi avance en teoría y autoevaluación</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">La lectura se registra cuando marcas «He leído este módulo». Los resultados muestran la mejor puntuación guardada en cada autoevaluación.</p>
      {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : total ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PercentCard label="Lectura completada" percent={total.readPercent} detail={`${total.read} de ${total.total} módulos leídos`} />
        <PercentCard label="Tests realizados" percent={total.attemptedPercent} detail={`${total.attempted} de ${total.total} autoevaluaciones realizadas`} />
        <PercentCard label="Tests superados" percent={total.passedPercent} detail={`${total.passed} de ${total.total} superados · mínimo ${SECOND_YEAR_PASS_SCORE}%`} />
        <PercentCard label="Resultado medio de los tests" percent={total.averageScore} detail={total.attempted ? `Media de las mejores puntuaciones de ${total.attempted} tests realizados` : "Todavía no has realizado ninguna autoevaluación"} />
      </div> : <p role="status" className="mt-5 text-sm text-slate-500">Cargando tus lecturas y autoevaluaciones…</p>}
    </section>
    <section className="space-y-4" aria-labelledby="sa-progress-title">
      <div><h2 id="sa-progress-title" className="text-2xl font-extrabold">Mi progreso por situación de aprendizaje</h2><p className="mt-2 text-sm text-slate-600">Abre cada SA para consultar tus datos y continuar el trabajo.</p></div>
      {topics.map((topic) => {
        const item = progress?.[topic.slug];
        const score = item?.quizScore;
        const href = `/alumno/2bach/sa${topic.number}`;
        return <details key={topic.slug} className="card group overflow-hidden" open={topic.number === 1}>
          <summary className="cursor-pointer p-5 sm:p-6"><span className="ml-2 font-extrabold">{topic.sa} · {topic.title}</span><span className="mt-2 block text-sm text-slate-500">{topic.subtitle}</span></summary>
          <div className="space-y-6 border-t border-slate-200 p-5 sm:p-6">
            {progress && <div className="grid gap-4 sm:grid-cols-2">
              <PercentCard label={`${topic.sa} · Lectura del módulo`} percent={item?.completed ? 100 : 0} detail={item?.completed ? "Módulo marcado como leído" : "Lectura pendiente de completar y marcar"} />
              <PercentCard label={`${topic.sa} · Resultado de autoevaluación`} percent={score ?? null} detail={score == null ? "Test pendiente" : `Mejor puntuación guardada · ${score >= SECOND_YEAR_PASS_SCORE ? "test superado" : "puedes repasar y repetir el test"}`} />
            </div>}
            {topic.number === 1 && <SecondYearPhysicalProgress />}
            <div className="flex flex-wrap gap-3"><Link href={`${href}/teoria`} className="rounded-xl border border-[#bfd8ca] px-4 py-3 text-sm font-bold text-[#1e6b4f]">Leer módulo y realizar test</Link><Link href={href} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Abrir {topic.sa}</Link></div>
          </div>
        </details>;
      })}
    </section>
  </div>;
}
