"use client";

import { TheoryChallengeResponse } from "@/components/theory-challenge-response";

import { useEffect, useMemo, useState } from "react";
import { Award, BookMarked, BookOpenCheck, BrainCircuit, CheckCircle2, Circle, Loader2, Target } from "lucide-react";
import { BasicCapacitiesVisual } from "@/components/basic-capacities-visual";
import { SecondYearTheoryVisual } from "@/components/second-year-theory-visual";
import { loadStudentVisibleSituations } from "@/lib/situation-visibility";
import { secondYearTheoryTopics as allTopics } from "@/lib/second-year-theory-topics";
import { loadTheoryTopicProgress, saveTheoryTopicProgress, type TheoryTopicProgress } from "@/lib/training-theory-data";

import { SECOND_YEAR_PASS_SCORE as PASS_SCORE, secondYearMastery, secondYearQuizScore } from "@/lib/second-year-theory-assessment";

type Props = { initialSlug?: string; compactHeader?: boolean };

export function SecondYearTheoryReader({ initialSlug, compactHeader = false }: Props) {
  const [secondYearTheoryTopics, setTopics] = useState(allTopics);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug ?? secondYearTheoryTopics[0].slug);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, TheoryTopicProgress>>({});
  const [answers, setAnswers] = useState<Record<string, Record<number, number>>>({});
  const [submitted, setSubmitted] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const topic = secondYearTheoryTopics.find((item) => item.slug === selectedSlug) ?? secondYearTheoryTopics[0] ?? allTopics[0];
  const topicProgress = progress[topic.slug];
  const topicAnswers = answers[topic.slug] ?? {};
  const allAnswered = Object.keys(topicAnswers).length === topic.quiz.length;
  const topicPassed = (topicProgress?.quizScore ?? 0) >= PASS_SCORE;
  const readCount = secondYearTheoryTopics.filter((item) => progress[item.slug]?.completed).length;
  const passedCount = secondYearTheoryTopics.filter((item) => (progress[item.slug]?.quizScore ?? 0) >= PASS_SCORE).length;
  const mastery = secondYearMastery(secondYearTheoryTopics.map((item) => item.slug), progress);

  useEffect(() => { void load(); }, []);
  useEffect(() => { if (initialSlug) setSelectedSlug(initialSlug); }, [initialSlug]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [result, visible] = await Promise.all([loadTheoryTopicProgress(), loadStudentVisibleSituations()]);
      const available = allTopics.filter((topic) => visible.includes(topic.sa));
      setTopics(available);
      if (!available.some((topic) => topic.slug === initialSlug)) setSelectedSlug(available[0]?.slug ?? "");
      setStudentId(result.studentId);
      setProgress(Object.fromEntries(result.progress.map((item) => [item.topicSlug, item])));
    } catch (cause) {
      setTopics([]);
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar tu progreso.");
    } finally { setLoading(false); }
  }

  const scorePreview = useMemo(() => {
    if (!allAnswered) return null;
    const hits = topic.quiz.reduce((total, question, index) => total + (topicAnswers[index] === question.correct ? 1 : 0), 0);
    return secondYearQuizScore(hits, topic.quiz.length);
  }, [allAnswered, topic.quiz, topicAnswers]);

  async function persist(nextRead: boolean, nextScore: number | null, successMessage: string) {
    if (!studentId) { setError("Recarga la página para identificar tu perfil antes de guardar."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const saved = await saveTheoryTopicProgress(studentId, topic.slug, nextRead, nextScore);
      setProgress((current) => ({ ...current, [topic.slug]: saved }));
      setMessage(successMessage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el progreso.");
    } finally { setSaving(false); }
  }

  async function submitQuiz() {
    if (scorePreview === null) return;
    const bestScore = Math.max(topicProgress?.quizScore ?? 0, scorePreview);
    setSubmitted((current) => ({ ...current, [topic.slug]: scorePreview }));
    await persist(topicProgress?.completed ?? false, bestScore, scorePreview >= PASS_SCORE ? "¡Test superado! Tu mejor puntuación queda guardada." : "Resultado guardado. Repasa el módulo y vuelve a intentarlo.");
  }

  function retryQuiz() {
    setAnswers((current) => ({ ...current, [topic.slug]: {} }));
    setSubmitted((current) => { const next = { ...current }; delete next[topic.slug]; return next; });
    setMessage("");
  }

  if (loading) return <div className="card flex min-h-[240px] items-center justify-center gap-3 p-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={20}/> Cargando teoría de 2º…</div>;

  if (!secondYearTheoryTopics.length) return <p role={error ? "alert" : "status"} className="card p-6">{error || "El profesor todavía no ha activado módulos teóricos de 2º."}</p>;

  return <div className="space-y-6">
    {!compactHeader && <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">2º Bachillerato · {secondYearTheoryTopics.length} módulos disponibles</p><h2 className="mt-2 text-2xl font-black">Comprende · Decide · Justifica · Aplica</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Una biblioteca específica de 2º: menos repetición y más interpretación, diseño, organización y evaluación.</p></div><div className="grid grid-cols-3 gap-2 text-center sm:min-w-[300px]"><Stat icon={<BookMarked size={18}/>} value={`${readCount}/${secondYearTheoryTopics.length}`} label="Leídos"/><Stat icon={<Award size={18}/>} value={`${passedCount}/${secondYearTheoryTopics.length}`} label="Tests"/><Stat icon={<BrainCircuit size={18}/>} value={`${mastery}%`} label="Dominio"/></div></div></section>}

    {(error || message) && <div role="status" className={`rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error || message}</div>}

    <div className="lg:hidden"><label htmlFor="second-year-topic" className="mb-2 block text-xs font-black uppercase tracking-[.14em] text-slate-500">Módulos de 2º</label><select id="second-year-topic" disabled={saving} value={topic.slug} onChange={(event) => { setSelectedSlug(event.target.value); setMessage(""); }} className="min-w-0 max-w-full w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm">{secondYearTheoryTopics.map((item) => <option key={item.slug} value={item.slug}>{item.sa} · {item.title}</option>)}</select></div>

    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden lg:block lg:sticky lg:top-5 lg:self-start"><nav aria-label="Módulos teóricos de 2º" className="card p-3"><p className="px-2 pb-2 text-xs font-black uppercase tracking-[.14em] text-slate-400">Módulos</p><div className="space-y-1">{secondYearTheoryTopics.map((item) => { const active=item.slug===topic.slug; const read=Boolean(progress[item.slug]?.completed); const passed=(progress[item.slug]?.quizScore??0)>=PASS_SCORE; return <button key={item.slug} type="button" aria-current={active ? "page" : undefined} disabled={saving} onClick={()=>{setSelectedSlug(item.slug);setMessage("");}} className={`w-full rounded-xl px-3 py-3 text-left transition ${active?"bg-[#e7f2ed] text-[#164c3a]":"text-slate-600 hover:bg-slate-50"}`}><div className="flex items-start gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${active?"bg-[#1e6b4f] text-white":"bg-slate-100 text-slate-600"}`}>{item.number}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{item.sa}</p><p className="text-sm font-extrabold leading-5">{item.title}</p><p className="mt-1 text-[10px] font-bold text-slate-400">{read?"Leído":"Pendiente"} · {passed?"Test superado":"Test pendiente"}</p></div></div></button>})}</div></nav></aside>

      <article className="min-w-0 space-y-6">
        <section className="card overflow-hidden"><div className="bg-gradient-to-br from-[#edf7f2] to-white p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#1e6b4f]">{topic.sa} · Módulo {topic.number}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{topic.title}</h1><p className="mt-2 text-base font-semibold text-slate-500">{topic.subtitle}</p></div><div className="flex flex-wrap gap-2"><Badge ok={Boolean(topicProgress?.completed)} label="Leído"/><Badge ok={topicPassed} label="Test superado"/></div></div><p className="mt-5 max-w-4xl text-sm font-medium leading-7 text-slate-700">{topic.summary}</p></div></section>

        <section className="card p-6 sm:p-8"><h2 className="text-xl font-extrabold">Fundamentación · ¿Para qué sirve?</h2><p className="mt-3 text-sm leading-7 text-slate-600">{topic.foundation}</p></section>

        <section className="card overflow-hidden"><div className="bg-slate-50"><SecondYearTheoryVisual kind={topic.visual} alt={`Infografía del módulo ${topic.number}: ${topic.title}`}/></div><div className="p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-wide text-[#1e6b4f]">Imagen para comprender</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{topic.visualCaption}</p></div></section>

        {topic.number <= 2 && <BasicCapacitiesVisual/>}
        <section className="card p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-wide text-amber-700">Ideas clave</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{topic.keyIdeas.map((idea)=><div key={idea} className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-950"><CheckCircle2 className="mt-0.5 shrink-0 text-amber-700" size={18}/>{idea}</div>)}</div></section>

        <section className="card p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-wide text-[#1e6b4f]">Conceptos</p><h2 className="mt-1 text-2xl font-black">Vocabulario para razonar</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{topic.concepts.map((concept)=><div key={concept.name} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-extrabold text-slate-950">{concept.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{concept.definition}</p><p className="mt-3 rounded-xl bg-[#e7f2ed] p-3 text-xs font-semibold text-[#164c3a]">Ejemplo · {concept.example}</p></div>)}</div></section>

        <section className="card p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Desarrollo teórico</p><div className="mt-5 space-y-8">{topic.sections.map((section,index)=><section key={section.title} className="relative pl-11"><span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index+1}</span><h2 className="text-xl font-extrabold text-slate-950">{section.title}</h2><div className="mt-3 space-y-3">{section.paragraphs.map((p)=><p key={p} className="text-sm leading-7 text-slate-600">{p}</p>)}</div>{section.bullets&&<ul className="mt-4 grid gap-2 sm:grid-cols-2">{section.bullets.map((bullet)=><li key={bullet} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><Circle className="mt-1 shrink-0 fill-current text-[#1e6b4f]" size={8}/>{bullet}</li>)}</ul>}</section>)}</div></section>

        <section><div className="mb-4"><p className="text-xs font-black uppercase tracking-wide text-[#1e6b4f]">Casos prácticos</p><h2 className="mt-1 text-2xl font-black">Del concepto a una decisión real</h2></div><div className="grid gap-4 xl:grid-cols-2">{topic.cases.map((item)=><article key={`${item.sport}-${item.capacity}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-wide text-emerald-300">{item.sport}</p><h3 className="mt-1 text-lg font-black">{item.capacity}</h3></div><div className="space-y-4 p-5"><Case label="Situación" text={item.situation}/><div className="rounded-2xl bg-[#f4faf7] p-4"><Case label="Propuesta" text={item.proposal}/></div><Case label="Por qué" text={item.why}/><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><Case label="Cómo progresaría" text={item.progression}/></div></div></article>)}</div></section>

        <section className="grid gap-4 md:grid-cols-2"><div className="rounded-3xl border border-violet-200 bg-violet-50 p-6"><Target className="text-violet-700"/><p className="mt-3 text-xs font-black uppercase tracking-wide text-violet-700">Reto de aplicación</p><p className="mt-2 text-sm font-semibold leading-7 text-violet-950">{topic.challenge}</p><TheoryChallengeResponse key={topic.slug} topicSlug={topic.slug}/></div><div className="rounded-3xl border border-sky-200 bg-sky-50 p-6"><BrainCircuit className="text-sky-700"/><p className="mt-3 text-xs font-black uppercase tracking-wide text-sky-700">Piensa como alumno/a de 2º</p><p className="mt-2 text-sm font-semibold leading-7 text-sky-950">{topic.extension}</p></div></section>

        <section className="card p-6 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><BookMarked className="text-[#1e6b4f]"/><div><h2 className="text-xl font-extrabold">Registra tu lectura</h2><p className="text-sm text-slate-500">Marca el módulo cuando hayas estudiado todas sus secciones.</p></div></div><button disabled={saving || !studentId} onClick={()=>void persist(!(topicProgress?.completed??false),topicProgress?.quizScore??null,topicProgress?.completed?"Módulo marcado como pendiente.":"Módulo marcado como leído.")} className={`rounded-xl px-5 py-3 text-sm font-bold text-white ${topicProgress?.completed?"bg-slate-500":"bg-[#1e6b4f]"}`}>{saving?"Guardando…":topicProgress?.completed?"Marcar como pendiente":"He leído este módulo"}</button></div></section>

        <section className="card overflow-hidden"><div className="bg-slate-950 p-6 text-white sm:p-8"><div className="flex items-center gap-3"><BookOpenCheck className="text-emerald-300"/><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Autoevaluación</p><h2 className="text-2xl font-extrabold">Comprueba lo aprendido</h2><p className="mt-1 text-sm text-slate-300">{topic.quiz.length} preguntas · necesitas al menos 67%. Se guarda la mejor puntuación.</p></div></div></div><div className="space-y-7 p-6 sm:p-8">{topic.quiz.map((question,index)=><fieldset key={question.question}><legend className="font-extrabold text-slate-900">{index+1}. {question.question}</legend><div className="mt-3 grid gap-2">{question.options.map((option,optionIndex)=><label key={option} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${topicAnswers[index]===optionIndex?"border-[#1e6b4f] bg-[#f4faf7]":"border-slate-200 bg-white"}`}><input type="radio" disabled={saving || submitted[topic.slug]!=null} className="mr-2" name={`${topic.slug}-${index}`} checked={topicAnswers[index]===optionIndex} onChange={()=>setAnswers((current)=>({...current,[topic.slug]:{...(current[topic.slug]??{}),[index]:optionIndex}}))}/>{option}</label>)}</div>{submitted[topic.slug]!=null&&<p className="mt-2 text-sm leading-6 text-slate-600">{topicAnswers[index] === question.correct ? "✓ Correcta. " : `Revisa tu respuesta. Respuesta correcta: ${question.options[question.correct]}. `}{question.feedback}</p>}</fieldset>)}<div className="flex flex-wrap items-center gap-3"><button disabled={!allAnswered||saving||!studentId} onClick={()=>void submitQuiz()} className="rounded-xl bg-[#1e6b4f] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Corregir y guardar</button>{submitted[topic.slug]!=null&&<button type="button" disabled={saving} onClick={retryQuiz} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold disabled:opacity-40">Repetir test</button>}{submitted[topic.slug]!=null&&<span role="status" className={`rounded-full px-3 py-1.5 text-sm font-black ${submitted[topic.slug]>=PASS_SCORE?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-800"}`}>{submitted[topic.slug]}%</span>}{topicProgress?.quizScore!=null&&<span className="text-xs font-semibold text-slate-500">Mejor resultado: {topicProgress.quizScore}%</span>}</div></div></section>

        <section className="card p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Referencias bibliográficas</p><h2 className="mt-1 text-xl font-extrabold">Para profundizar</h2><ul className="mt-4 space-y-2">{topic.sourceLinks.map((source)=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1e6b4f] underline">{source.title}</a></li>)}{topic.sources.map((source)=><li key={source} className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">{source}</li>)}</ul></section>
      </article>
    </div>
  </div>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="rounded-2xl bg-white/10 p-3">{icon}<p className="mt-1 text-xl font-black">{value}</p><p className="text-[10px] text-slate-300">{label}</p></div>; }
function Badge({ ok, label }: { ok: boolean; label: string }) { return <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${ok?"bg-emerald-100 text-emerald-800":"bg-slate-100 text-slate-500"}`}>{ok?`✓ ${label}`:`○ ${label} pendiente`}</span>; }
function Case({ label, text }: { label: string; text: string }) { return <div><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{text}</p></div>; }
