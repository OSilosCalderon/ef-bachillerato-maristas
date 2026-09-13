"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, ChevronRight, Circle, Loader2, RotateCcw } from "lucide-react";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { loadTheoryTopicProgress, saveTheoryTopicProgress, type TheoryTopicProgress } from "@/lib/training-theory-data";

const allTrainingTheoryTopics = [...trainingTheoryTopics, flexibilityTheoryTopic];

export function TrainingTheoryLibrary() {
  const [selectedSlug, setSelectedSlug] = useState(allTrainingTheoryTopics[0].slug);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, TheoryTopicProgress>>({});
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const topic = allTrainingTheoryTopics.find((item) => item.slug === selectedSlug) ?? allTrainingTheoryTopics[0];
  const completedCount = allTrainingTheoryTopics.filter((item) => progress[item.slug]?.completed).length;
  const completion = Math.round((completedCount / allTrainingTheoryTopics.length) * 100);
  const topicProgress = progress[topic.slug];
  const topicAnswers = answers[topic.slug] ?? {};
  const allAnswered = Object.keys(topicAnswers).length === topic.quiz.length;

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await loadTheoryTopicProgress();
      setStudentId(result.studentId);
      setProgress(Object.fromEntries(result.progress.map((item) => [item.topicSlug, item])));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar tu progreso.");
    } finally {
      setLoading(false);
    }
  }

  const scorePreview = useMemo(() => {
    if (!allAnswered) return null;
    const hits = topic.quiz.reduce(
      (total, question, index) => total + (topicAnswers[index] === question.correct ? 1 : 0),
      0,
    );
    return Math.round((hits / topic.quiz.length) * 100);
  }, [allAnswered, topic.quiz, topicAnswers]);

  async function persist(nextCompleted: boolean, nextScore: number | null) {
    if (!studentId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await saveTheoryTopicProgress(studentId, topic.slug, nextCompleted, nextScore);
      setProgress((current) => ({ ...current, [topic.slug]: saved }));
      setMessage("Progreso guardado en Supabase.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el progreso.");
    } finally {
      setSaving(false);
    }
  }

  async function submitQuiz() {
    if (scorePreview === null) return;
    await persist(topicProgress?.completed ?? false, scorePreview);
  }

  async function toggleCompleted() {
    await persist(!(topicProgress?.completed ?? false), topicProgress?.quizScore ?? null);
  }

  if (loading) {
    return (
      <div className="card flex min-h-[260px] items-center justify-center gap-3 p-8 text-sm text-slate-500">
        <Loader2 className="animate-spin" size={20}/>
        Cargando apuntes interactivos…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="grid gap-6 bg-slate-950 p-6 text-white md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Biblioteca común · 1º y 2º Bachillerato</p>
            <h2 className="mt-2 text-2xl font-extrabold">{allTrainingTheoryTopics.length} temas de entrenamiento deportivo</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Núcleo común para comprender, aplicar y justificar un plan de entrenamiento. Incluye un tema específico de flexibilidad, ampliaciones para 2º y minicuestionarios autocorregibles.
            </p>
          </div>
          <div className="min-w-44 rounded-2xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">Progreso</p>
            <p className="mt-1 text-3xl font-extrabold">{completion}%</p>
            <p className="text-xs text-slate-300">{completedCount}/{allTrainingTheoryTopics.length} temas completados</p>
          </div>
        </div>
        <div className="h-2 bg-slate-100">
          <div className="h-full bg-[#1e6b4f] transition-all" style={{ width: `${completion}%` }}/>
        </div>
      </section>

      {(error || message) && (
        <div role="status" className={`rounded-xl border p-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
        <aside className="space-y-2 xl:sticky xl:top-5 xl:self-start">
          {allTrainingTheoryTopics.map((item) => {
            const itemProgress = progress[item.slug];
            const active = item.slug === topic.slug;
            return (
              <button
                key={item.slug}
                onClick={() => { setSelectedSlug(item.slug); setMessage(""); }}
                className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-[#1e6b4f] bg-[#e7f2ed]" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${active ? "bg-[#1e6b4f] text-white" : "bg-slate-100 text-slate-600"}`}>{item.number}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.subtitle}</p>
                  </div>
                  {itemProgress?.completed ? <CheckCircle2 className="shrink-0 text-[#1e6b4f]" size={19}/> : <ChevronRight className="shrink-0 text-slate-300" size={19}/>} 
                </div>
              </button>
            );
          })}
        </aside>

        <article className="space-y-6">
          <section className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Tema {topic.number}</p>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{topic.title}</h1>
                <p className="mt-2 text-base font-semibold text-slate-500">{topic.subtitle}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${topicProgress?.completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {topicProgress?.completed ? "Completado" : "En estudio"}
              </span>
            </div>
            <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{topic.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {topic.keyIdeas.map((idea) => (
                <div key={idea} className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={17}/><span>{idea}</span>
                </div>
              ))}
            </div>
          </section>

          {topic.concepts && (
            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-extrabold">Conceptos que debes distinguir</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {topic.concepts.map((concept) => (
                  <div key={concept.name} className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="font-extrabold text-slate-950">{concept.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{concept.definition}</p>
                    <p className="mt-3 rounded-xl bg-[#e7f2ed] p-3 text-xs font-semibold text-[#164c3a]">Ejemplo: {concept.example}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card p-6 sm:p-8">
            <div className="space-y-7">
              {topic.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-extrabold text-slate-950">{section.title}</h2>
                  <div className="mt-3 space-y-3">
                    {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-slate-600">{paragraph}</p>)}
                  </div>
                  {section.bullets && (
                    <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 rounded-xl bg-slate-50 p-3">
                          <Circle className="mt-1 shrink-0 fill-current text-[#1e6b4f]" size={8}/><span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Actividad aplicada</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-amber-950">{topic.challenge}</p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Ampliación · 2º Bachillerato</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-sky-950">{topic.secondYearExtension}</p>
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <BookOpenCheck className="text-[#1e6b4f]"/>
              <div><h2 className="text-xl font-extrabold">Comprueba lo aprendido</h2><p className="text-sm text-slate-500">3 preguntas · el resultado queda guardado en tu progreso.</p></div>
            </div>
            <div className="mt-6 space-y-6">
              {topic.quiz.map((question, index) => (
                <fieldset key={question.question}>
                  <legend className="font-bold text-slate-900">{index + 1}. {question.question}</legend>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={option} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${topicAnswers[index] === optionIndex ? "border-[#1e6b4f] bg-[#e7f2ed]" : "border-slate-200 hover:bg-slate-50"}`}>
                        <input
                          className="mr-2"
                          type="radio"
                          name={`${topic.slug}-${index}`}
                          checked={topicAnswers[index] === optionIndex}
                          onChange={() => setAnswers((current) => ({ ...current, [topic.slug]: { ...(current[topic.slug] ?? {}), [index]: optionIndex } }))}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  {topicProgress?.quizScore !== null && topicProgress?.quizScore !== undefined && topicAnswers[index] !== undefined && (
                    <p className={`mt-2 text-xs font-semibold ${topicAnswers[index] === question.correct ? "text-emerald-700" : "text-amber-700"}`}>{question.feedback}</p>
                  )}
                </fieldset>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button disabled={!allAnswered || saving} onClick={() => void submitQuiz()} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Guardando…" : "Corregir y guardar"}</button>
              <button onClick={() => setAnswers((current) => ({ ...current, [topic.slug]: {} }))} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"><RotateCcw size={16}/>Reiniciar</button>
              {topicProgress?.quizScore !== null && topicProgress?.quizScore !== undefined && <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-extrabold">Última puntuación: {topicProgress.quizScore}%</span>}
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="font-extrabold text-slate-950">Fuentes base del tema</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">Contenido sintetizado y adaptado didácticamente para Bachillerato; no reproduce programas de alto rendimiento de forma literal.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.sources.map((source) => <span key={source} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{source}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button disabled={saving} onClick={() => void toggleCompleted()} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white ${topicProgress?.completed ? "bg-slate-500" : "bg-[#1e6b4f]"}`}>{saving ? "Guardando…" : topicProgress?.completed ? "Marcar como pendiente" : "Marcar tema completado"}</button>
              {scorePreview !== null && <span className="text-sm text-slate-500">Resultado actual antes de guardar: <strong>{scorePreview}%</strong></span>}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
