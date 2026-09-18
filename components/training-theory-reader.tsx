"use client";

import { TheoryChallengeResponse } from "@/components/theory-challenge-response";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookMarked,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Lightbulb,
  Loader2,
  RotateCcw,
  Target,
} from "lucide-react";
import { TheoryVisual } from "@/components/theory-visual";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { getTheoryApplication } from "@/lib/training-theory-applications";
import { loadTheoryTopicProgress, saveTheoryTopicProgress, type TheoryTopicProgress } from "@/lib/training-theory-data";

const PASS_SCORE = 67;
const topics = [...trainingTheoryTopics, flexibilityTheoryTopic];

export function TrainingTheoryReader() {
  const [selectedSlug, setSelectedSlug] = useState(topics[0].slug);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, TheoryTopicProgress>>({});
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [submitted, setSubmitted] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const topicIndex = Math.max(0, topics.findIndex((item) => item.slug === selectedSlug));
  const topic = topics[topicIndex] ?? topics[0];
  const application = getTheoryApplication(topic.slug);
  const topicProgress = progress[topic.slug];
  const topicAnswers = answers[topic.slug] ?? {};
  const allAnswered = Object.keys(topicAnswers).length === topic.quiz.length;
  const topicPassed = (topicProgress?.quizScore ?? 0) >= PASS_SCORE;
  const readCount = topics.filter((item) => progress[item.slug]?.completed).length;
  const passedCount = topics.filter((item) => (progress[item.slug]?.quizScore ?? 0) >= PASS_SCORE).length;
  const mastery = Math.round(((readCount + passedCount) / (topics.length * 2)) * 100);

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

  function selectTopic(slug: string) {
    setSelectedSlug(slug);
    setMessage("");
    setError("");
  }

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
    return <div className="card flex min-h-[260px] items-center justify-center gap-3 p-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/> Cargando apuntes…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Biblioteca de entrenamiento · 9 temas</p>
            <h2 className="mt-2 text-2xl font-black">Un tema cada vez, sin contenidos repetidos</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Elige un tema en el submenú. Dentro encontrarás teoría, conceptos, ejemplos deportivos, reto, autoevaluación y bibliografía.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[300px]">
            <div className="rounded-2xl bg-white/10 p-3"><BookMarked className="mx-auto text-emerald-300" size={18}/><p className="mt-1 text-xl font-black">{readCount}</p><p className="text-[10px] text-slate-300">Leídos</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><Award className="mx-auto text-amber-300" size={18}/><p className="mt-1 text-xl font-black">{passedCount}</p><p className="text-[10px] text-slate-300">Tests</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><BrainCircuit className="mx-auto text-sky-300" size={18}/><p className="mt-1 text-xl font-black">{mastery}%</p><p className="text-[10px] text-slate-300">Dominio</p></div>
          </div>
        </div>
      </section>

      {(error || message) && <div role="status" className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

      <div className="lg:hidden">
        <label htmlFor="theory-topic" className="mb-2 block text-xs font-black uppercase tracking-[.14em] text-slate-500">Temas</label>
        <select id="theory-topic" value={topic.slug} onChange={(event) => selectTopic(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm">
          {topics.map((item) => <option key={item.slug} value={item.slug}>Tema {item.number} · {item.title}</option>)}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block lg:sticky lg:top-5 lg:self-start">
          <nav aria-label="Submenú de temas" className="card p-3">
            <p className="px-2 pb-2 text-xs font-black uppercase tracking-[.14em] text-slate-400">Temas</p>
            <div className="space-y-1">
              {topics.map((item) => {
                const active = item.slug === topic.slug;
                const read = Boolean(progress[item.slug]?.completed);
                const passed = (progress[item.slug]?.quizScore ?? 0) >= PASS_SCORE;
                return (
                  <button key={item.slug} type="button" onClick={() => selectTopic(item.slug)} className={`w-full rounded-xl px-3 py-3 text-left transition ${active ? "bg-[#e7f2ed] text-[#164c3a]" : "text-slate-600 hover:bg-slate-50"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${active ? "bg-[#1e6b4f] text-white" : "bg-slate-100 text-slate-600"}`}>{item.number}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold leading-5">{item.title}</p>
                        <p className="mt-1 text-[10px] font-bold text-slate-400">{read ? "Leído" : "Pendiente"} · {passed ? "Test superado" : "Test pendiente"}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <article className="min-w-0 space-y-6">
          <section className="card overflow-hidden">
            <div className="bg-gradient-to-br from-[#edf7f2] to-white p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-[#1e6b4f]">Tema {topic.number}</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{topic.title}</h1>
                  <p className="mt-2 text-base font-semibold text-slate-500">{topic.subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${topicProgress?.completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{topicProgress?.completed ? "✓ Leído" : "○ Lectura pendiente"}</span>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${topicPassed ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}`}>{topicPassed ? "★ Test superado" : "○ Test pendiente"}</span>
                </div>
              </div>
              <p className="mt-5 max-w-4xl text-sm font-medium leading-7 text-slate-700">{topic.summary}</p>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="aspect-[16/8] overflow-hidden bg-slate-50"><TheoryVisual kind={application.image} alt={application.imageAlt}/></div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3"><BrainCircuit className="text-[#1e6b4f]"/><div><p className="text-xs font-black uppercase tracking-wide text-[#1e6b4f]">Fundamentación</p><h2 className="text-2xl font-black">Por qué funciona</h2></div></div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{application.foundation}</p>
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-semibold leading-6 text-slate-500">{application.imageCaption}</p>
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <div className="flex items-center gap-3"><Lightbulb className="text-amber-600"/><div><p className="text-xs font-black uppercase tracking-wide text-amber-700">Conceptos</p><h2 className="text-2xl font-black">Ideas que debes manejar</h2></div></div>
            <div className="mt-5 flex flex-wrap gap-2">{application.connections.map((item) => <span key={item} className="rounded-full border border-[#bfd8ca] bg-[#f4faf7] px-3 py-1.5 text-xs font-bold text-[#164c3a]">{item}</span>)}</div>
            {topic.concepts && <div className="mt-5 grid gap-4 md:grid-cols-2">{topic.concepts.map((concept) => <div key={concept.name} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-extrabold text-slate-950">{concept.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{concept.definition}</p><p className="mt-3 rounded-xl bg-[#e7f2ed] p-3 text-xs font-semibold text-[#164c3a]">Ejemplo · {concept.example}</p></div>)}</div>}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{topic.keyIdeas.map((idea) => <div key={idea} className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={18}/><span>{idea}</span></div>)}</div>
          </section>

          <section className="card p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Teoría</p>
            <div className="mt-5 space-y-8">{topic.sections.map((section, sectionIndex) => <section key={section.title} className="relative pl-11"><span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{sectionIndex + 1}</span><h2 className="text-xl font-extrabold text-slate-950">{section.title}</h2><div className="mt-3 space-y-3">{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-slate-600">{paragraph}</p>)}</div>{section.bullets && <ul className="mt-4 grid gap-2 sm:grid-cols-2">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><Circle className="mt-1 shrink-0 fill-current text-[#1e6b4f]" size={8}/><span>{bullet}</span></li>)}</ul>}</section>)}</div>
          </section>

          <section>
            <div className="mb-4"><p className="text-xs font-black uppercase tracking-wide text-[#1e6b4f]">Casos prácticos</p><h2 className="mt-1 text-2xl font-black">Aplicado a deportes reales</h2></div>
            <div className="grid gap-4 xl:grid-cols-2">{application.cases.map((trainingCase) => <article key={`${trainingCase.sport}-${trainingCase.capacity}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wide text-emerald-300">{trainingCase.sport}</p><h3 className="mt-1 text-lg font-black">{trainingCase.capacity}</h3></div><div className="space-y-4 p-5"><div><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Situación</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{trainingCase.situation}</p></div><div className="rounded-2xl bg-[#f4faf7] p-4"><p className="text-[10px] font-black uppercase tracking-wide text-[#1e6b4f]">Propuesta</p><p className="mt-1 text-sm font-semibold leading-6 text-[#164c3a]">{trainingCase.proposal}</p></div><div><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Por qué</p><p className="mt-1 text-sm leading-6 text-slate-600">{trainingCase.why}</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-[10px] font-black uppercase tracking-wide text-amber-700">Progresión</p><p className="mt-1 text-sm font-semibold leading-6 text-amber-950">{trainingCase.progression}</p></div></div></article>)}</div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-violet-200 bg-violet-50 p-6"><Target className="text-violet-700"/><p className="mt-3 text-xs font-black uppercase tracking-wide text-violet-700">Reto de aplicación</p><p className="mt-2 text-sm font-semibold leading-7 text-violet-950">{application.appliedChallenge}</p><TheoryChallengeResponse key={topic.slug} topicSlug={topic.slug}/></div>
            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6"><p className="text-xs font-black uppercase tracking-wide text-sky-700">Ampliación · 2º Bachillerato</p><p className="mt-2 text-sm font-semibold leading-7 text-sky-950">{topic.secondYearExtension}</p></div>
          </section>

          <section className="card p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><BookMarked className="text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">Registra tu lectura</h2><p className="text-sm text-slate-500">Confirma la lectura cuando hayas estudiado el tema completo.</p></div></div><button disabled={saving} onClick={() => void toggleRead()} className={`rounded-xl px-5 py-3 text-sm font-bold text-white ${topicProgress?.completed ? "bg-slate-500" : "bg-[#1e6b4f]"}`}>{saving ? "Guardando…" : topicProgress?.completed ? "Marcar como pendiente" : "He leído este tema"}</button></div>
          </section>

          <section className="card overflow-hidden">
            <div className="bg-slate-950 p-6 text-white sm:p-8"><div className="flex items-center gap-3"><BookOpenCheck className="text-emerald-300"/><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Autoevaluación</p><h2 className="text-2xl font-extrabold">Comprueba lo aprendido</h2><p className="mt-1 text-sm text-slate-300">3 preguntas · necesitas 2 aciertos para superar el test. Se guarda tu mejor puntuación.</p></div></div></div>
            <div className="space-y-7 p-6 sm:p-8">{topic.quiz.map((question, index) => <fieldset key={question.question}><legend className="font-extrabold text-slate-900">{index + 1}. {question.question}</legend><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${topicAnswers[index] === optionIndex ? "border-[#1e6b4f] bg-[#e7f2ed]" : "border-slate-200 hover:bg-slate-50"}`}><input className="mr-2" type="radio" name={`${topic.slug}-${index}`} checked={topicAnswers[index] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [topic.slug]: { ...(current[topic.slug] ?? {}), [index]: optionIndex } }))}/>{option}</label>)}</div>{submitted[topic.slug] !== undefined && topicAnswers[index] !== undefined && <p className={`mt-2 text-xs font-semibold ${topicAnswers[index] === question.correct ? "text-emerald-700" : "text-amber-700"}`}>{topicAnswers[index] === question.correct ? "Correcto. " : "Revisa esta idea. "}{question.feedback}</p>}</fieldset>)}
              <div className="flex flex-wrap items-center gap-3"><button disabled={!allAnswered || saving} onClick={() => void submitQuiz()} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{saving ? "Guardando…" : "Corregir test"}</button><button type="button" onClick={() => { setAnswers((current) => ({ ...current, [topic.slug]: {} })); setSubmitted((current) => { const copy = { ...current }; delete copy[topic.slug]; return copy; }); }} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"><RotateCcw size={16}/>Repetir</button>{submitted[topic.slug] !== undefined && <span className={`rounded-full px-3 py-2 text-sm font-extrabold ${submitted[topic.slug] >= PASS_SCORE ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>Intento: {submitted[topic.slug]}% · {submitted[topic.slug] >= PASS_SCORE ? "Superado" : "Aún no superado"}</span>}{topicProgress?.quizScore != null && <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-700">Mejor: {topicProgress.quizScore}%</span>}</div>
            </div>
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-950">Referencias bibliográficas</h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">Fuentes utilizadas como base para la síntesis didáctica del tema.</p>
            <div className="mt-4 space-y-2">{topic.sources.map((source) => <div key={source} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">{source}</div>)}</div>
            {topicProgress?.completed && topicPassed && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"><Award className="shrink-0"/><div><p className="font-extrabold">Tema dominado</p><p className="text-sm">Lectura registrada y test superado.</p></div></div>}
          </section>

          <nav aria-label="Cambiar de tema" className="flex items-center justify-between gap-3">
            <button type="button" disabled={topicIndex === 0} onClick={() => selectTopic(topics[topicIndex - 1]?.slug ?? topic.slug)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 disabled:opacity-30"><ChevronLeft size={17}/>Anterior</button>
            <button type="button" disabled={topicIndex === topics.length - 1} onClick={() => selectTopic(topics[topicIndex + 1]?.slug ?? topic.slug)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 disabled:opacity-30">Siguiente<ChevronRight size={17}/></button>
          </nav>
        </article>
      </div>
    </div>
  );
}
