"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookMarked,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Circle,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { loadTheoryTopicProgress, saveTheoryTopicProgress, type TheoryTopicProgress } from "@/lib/training-theory-data";

const PASS_SCORE = 67;
const allTrainingTheoryTopics = [...trainingTheoryTopics, flexibilityTheoryTopic];

export function TrainingTheoryLibrary() {
  const [selectedSlug, setSelectedSlug] = useState(allTrainingTheoryTopics[0].slug);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, TheoryTopicProgress>>({});
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [submitted, setSubmitted] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const topic = allTrainingTheoryTopics.find((item) => item.slug === selectedSlug) ?? allTrainingTheoryTopics[0];
  const topicProgress = progress[topic.slug];
  const topicAnswers = answers[topic.slug] ?? {};
  const allAnswered = Object.keys(topicAnswers).length === topic.quiz.length;
  const readCount = allTrainingTheoryTopics.filter((item) => progress[item.slug]?.completed).length;
  const passedCount = allTrainingTheoryTopics.filter((item) => (progress[item.slug]?.quizScore ?? 0) >= PASS_SCORE).length;
  const mastery = Math.round(((readCount + passedCount) / (allTrainingTheoryTopics.length * 2)) * 100);
  const topicPassed = (topicProgress?.quizScore ?? 0) >= PASS_SCORE;

  useEffect(() => { void load(); }, []);

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
    const hits = topic.quiz.reduce((total, question, index) => total + (topicAnswers[index] === question.correct ? 1 : 0), 0);
    return Math.round((hits / topic.quiz.length) * 100);
  }, [allAnswered, topic.quiz, topicAnswers]);

  async function persist(nextRead: boolean, nextScore: number | null, successMessage: string) {
    if (!studentId) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await saveTheoryTopicProgress(studentId, topic.slug, nextRead, nextScore);
      setProgress((current) => ({ ...current, [topic.slug]: saved }));
      setMessage(successMessage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el progreso.");
    } finally {
      setSaving(false);
    }
  }

  async function submitQuiz() {
    if (scorePreview === null) return;
    const bestScore = Math.max(topicProgress?.quizScore ?? 0, scorePreview);
    setSubmitted((current) => ({ ...current, [topic.slug]: scorePreview }));
    await persist(
      topicProgress?.completed ?? false,
      bestScore,
      scorePreview >= PASS_SCORE ? "¡Test superado! Tu mejor resultado queda guardado." : "Resultado guardado. Repasa el tema y vuelve a intentarlo.",
    );
  }

  async function toggleRead() {
    const next = !(topicProgress?.completed ?? false);
    await persist(next, topicProgress?.quizScore ?? null, next ? "Tema marcado como leído." : "Tema marcado de nuevo como pendiente.");
  }

  if (loading) {
    return <div className="card flex min-h-[260px] items-center justify-center gap-3 p-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/> Cargando biblioteca de estudio…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-emerald-300"><Sparkles size={18}/><p className="text-xs font-bold uppercase tracking-[.18em]">Biblioteca común · 1º y 2º Bachillerato</p></div>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Aprende · Comprueba · Domina</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Los 9 temas teóricos están activos. Lee cada tema, marca la lectura y supera su test de 3 preguntas. Se considera superado con 2 aciertos de 3 (67%).</p>
          </div>
          <div className="grid min-w-[280px] grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/10 p-3"><BookMarked className="mx-auto text-emerald-300" size={19}/><p className="mt-2 text-2xl font-black">{readCount}</p><p className="text-[11px] text-slate-300">Leídos</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><Award className="mx-auto text-amber-300" size={19}/><p className="mt-2 text-2xl font-black">{passedCount}</p><p className="text-[11px] text-slate-300">Tests</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><BrainCircuit className="mx-auto text-sky-300" size={19}/><p className="mt-2 text-2xl font-black">{mastery}%</p><p className="text-[11px] text-slate-300">Dominio</p></div>
          </div>
        </div>
        <div className="h-2 bg-white/10"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${mastery}%` }}/></div>
      </section>

      {(error || message) && <div role="status" className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-2 xl:sticky xl:top-5 xl:self-start">
          {allTrainingTheoryTopics.map((item) => {
            const itemProgress = progress[item.slug];
            const active = item.slug === topic.slug;
            const read = Boolean(itemProgress?.completed);
            const passed = (itemProgress?.quizScore ?? 0) >= PASS_SCORE;
            return (
              <button key={item.slug} type="button" onClick={() => { setSelectedSlug(item.slug); setMessage(""); }} className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-[#1e6b4f] bg-[#e7f2ed] shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${active ? "bg-[#1e6b4f] text-white" : "bg-slate-100 text-slate-600"}`}>{item.number}</span>
                  <div className="min-w-0 flex-1"><p className="font-extrabold text-slate-900">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.subtitle}</p><div className="mt-2 flex flex-wrap gap-1.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${read ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{read ? "Leído" : "Pendiente"}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${passed ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-400"}`}>{passed ? "Test superado" : "Test pendiente"}</span></div></div>
                  <ChevronRight className="mt-1 shrink-0 text-slate-300" size={18}/>
                </div>
              </button>
            );
          })}
        </aside>

        <article className="space-y-6">
          <section className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-gradient-to-br from-[#edf7f2] to-white p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Tema {topic.number}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{topic.title}</h1><p className="mt-2 text-base font-semibold text-slate-500">{topic.subtitle}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${topicProgress?.completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{topicProgress?.completed ? "✓ Leído" : "○ Lectura pendiente"}</span><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${topicPassed ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}`}>{topicPassed ? "★ Test superado" : "○ Test pendiente"}</span></div></div>
              <p className="mt-6 max-w-4xl rounded-2xl bg-white p-5 text-sm font-medium leading-7 text-slate-700 shadow-sm">{topic.summary}</p>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">{topic.keyIdeas.map((idea) => <div key={idea} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={18}/><span>{idea}</span></div>)}</div>
          </section>

          {topic.concepts && <section className="card p-6 sm:p-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-[#e7f2ed] p-2 text-[#1e6b4f]"><BrainCircuit size={20}/></span><div><p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">Vocabulario clave</p><h2 className="text-xl font-extrabold">Conceptos que debes distinguir</h2></div></div><div className="mt-5 grid gap-4 md:grid-cols-2">{topic.concepts.map((concept) => <div key={concept.name} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-extrabold text-slate-950">{concept.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{concept.definition}</p><p className="mt-3 rounded-xl bg-[#e7f2ed] p-3 text-xs font-semibold text-[#164c3a]">Ejemplo · {concept.example}</p></div>)}</div></section>}

          <section className="card p-6 sm:p-8"><div className="space-y-8">{topic.sections.map((section, sectionIndex) => <section key={section.title} className="relative pl-12"><span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{sectionIndex + 1}</span><h2 className="text-xl font-extrabold text-slate-950">{section.title}</h2><div className="mt-3 space-y-3">{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-slate-600">{paragraph}</p>)}</div>{section.bullets && <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-2 rounded-xl bg-slate-50 p-3"><Circle className="mt-1 shrink-0 fill-current text-[#1e6b4f]" size={8}/><span>{bullet}</span></li>)}</ul>}</section>)}</div></section>

          <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Reto de aplicación</p><p className="mt-3 text-sm font-semibold leading-7 text-amber-950">{topic.challenge}</p></div><div className="rounded-2xl border border-sky-200 bg-sky-50 p-6"><p className="text-xs font-bold uppercase tracking-wide text-sky-700">Ampliación · 2º Bachillerato</p><p className="mt-3 text-sm font-semibold leading-7 text-sky-950">{topic.secondYearExtension}</p></div></section>

          <section className="card p-6 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><BookMarked className="text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">Registra tu lectura</h2><p className="text-sm text-slate-500">Cuando hayas estudiado el contenido completo, confirma la lectura.</p></div></div><button disabled={saving} onClick={() => void toggleRead()} className={`rounded-xl px-5 py-3 text-sm font-bold text-white ${topicProgress?.completed ? "bg-slate-500" : "bg-[#1e6b4f]"}`}>{saving ? "Guardando…" : topicProgress?.completed ? "Marcar como pendiente" : "He leído este tema"}</button></div></section>

          <section className="card overflow-hidden"><div className="bg-slate-950 p-6 text-white sm:p-8"><div className="flex items-center gap-3"><BookOpenCheck className="text-emerald-300"/><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Autoevaluación</p><h2 className="text-2xl font-extrabold">Comprueba lo aprendido</h2><p className="mt-1 text-sm text-slate-300">3 preguntas · necesitas 2 aciertos para superar el test. Se guarda tu mejor puntuación.</p></div></div></div><div className="space-y-7 p-6 sm:p-8">{topic.quiz.map((question, index) => <fieldset key={question.question}><legend className="font-extrabold text-slate-900">{index + 1}. {question.question}</legend><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${topicAnswers[index] === optionIndex ? "border-[#1e6b4f] bg-[#e7f2ed]" : "border-slate-200 hover:bg-slate-50"}`}><input className="mr-2" type="radio" name={`${topic.slug}-${index}`} checked={topicAnswers[index] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [topic.slug]: { ...(current[topic.slug] ?? {}), [index]: optionIndex } }))}/>{option}</label>)}</div>{submitted[topic.slug] !== undefined && topicAnswers[index] !== undefined && <p className={`mt-2 text-xs font-semibold ${topicAnswers[index] === question.correct ? "text-emerald-700" : "text-amber-700"}`}>{topicAnswers[index] === question.correct ? "Correcto. " : "Revisa esta idea. "}{question.feedback}</p>}</fieldset>)}<div className="flex flex-wrap items-center gap-3"><button disabled={!allAnswered || saving} onClick={() => void submitQuiz()} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Guardando…" : "Corregir test"}</button><button onClick={() => { setAnswers((current) => ({ ...current, [topic.slug]: {} })); setSubmitted((current) => { const copy = { ...current }; delete copy[topic.slug]; return copy; }); }} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"><RotateCcw size={16}/>Repetir</button>{submitted[topic.slug] !== undefined && <span className={`rounded-full px-3 py-2 text-sm font-extrabold ${submitted[topic.slug] >= PASS_SCORE ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>Intento: {submitted[topic.slug]}% · {submitted[topic.slug] >= PASS_SCORE ? "Superado" : "Aún no superado"}</span>}{topicProgress?.quizScore != null && <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-700">Mejor: {topicProgress.quizScore}%</span>}</div></div></section>

          <section className="card p-6 sm:p-8"><h2 className="font-extrabold text-slate-950">Fuentes base del tema</h2><p className="mt-1 text-xs leading-5 text-slate-400">Contenido sintetizado y adaptado didácticamente para Bachillerato.</p><div className="mt-3 flex flex-wrap gap-2">{topic.sources.map((source) => <span key={source} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{source}</span>)}</div>{topicProgress?.completed && topicPassed && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><Award className="shrink-0"/><div><p className="font-extrabold">Tema dominado</p><p className="text-sm">Lectura registrada y test superado.</p></div></div>}</section>
        </article>
      </div>
    </div>
  );
}
