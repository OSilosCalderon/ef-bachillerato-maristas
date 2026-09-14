"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, BrainCircuit, Dumbbell, Gauge, Lightbulb, Sparkles, Target, Trophy } from "lucide-react";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { getTheoryApplication } from "@/lib/training-theory-applications";
import { TheoryVisual } from "@/components/theory-visual";

const topics = [...trainingTheoryTopics, flexibilityTheoryTopic];

const sportIcons: Record<string, typeof Activity> = {
  "Fútbol": Trophy,
  "Voleibol": Activity,
  "Pádel": Target,
  "Baloncesto": Gauge,
  "Bádminton": Sparkles,
  "Atletismo": Dumbbell,
};

export function TrainingTheoryApplicationLab() {
  const [selectedSlug, setSelectedSlug] = useState(topics[0].slug);
  const topic = useMemo(() => topics.find((item) => item.slug === selectedSlug) ?? topics[0], [selectedSlug]);
  const application = useMemo(() => getTheoryApplication(topic.slug), [topic.slug]);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 bg-gradient-to-br from-[#123f32] via-[#1e6b4f] to-[#2f8667] p-6 text-white sm:p-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-200"><Sparkles size={18}/><p className="text-xs font-black uppercase tracking-[.2em]">Laboratorio de aplicación deportiva</p></div>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Entiende el concepto y llévalo al deporte</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/90">Cada tema incorpora fundamentación ampliada, relaciones entre conceptos, ejemplos aplicados a deportes y un reto para transformar la teoría en decisiones de entrenamiento.</p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-100">Pregunta guía</p>
            <p className="mt-2 text-xl font-black">¿Qué capacidad quiero mejorar y cómo debería modificar la tarea?</p>
            <p className="mt-3 text-xs leading-5 text-emerald-50/80">No buscamos copiar entrenamientos profesionales: aprendemos a justificar volumen, intensidad, pausas, progresión y especificidad con ejemplos seguros para Bachillerato.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {topics.map((item) => {
          const active = item.slug === topic.slug;
          return (
            <button key={item.slug} type="button" onClick={() => setSelectedSlug(item.slug)} className={`min-w-[210px] rounded-2xl border px-4 py-3 text-left transition ${active ? "border-[#1e6b4f] bg-[#e7f2ed] shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <p className={`text-[10px] font-black uppercase tracking-[.16em] ${active ? "text-[#1e6b4f]" : "text-slate-400"}`}>Tema {item.number}</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{item.title}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <article className="card overflow-hidden">
          <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
            <TheoryVisual kind={application.image} alt={application.imageAlt} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/88 to-transparent p-5 pt-16 text-white">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-200">Imagen para comprender</p>
              <p className="mt-1 text-sm font-semibold">{application.imageCaption}</p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-[#e7f2ed] p-2 text-[#1e6b4f]"><BrainCircuit size={21}/></span><div><p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">Fundamentación</p><h3 className="text-2xl font-black text-slate-950">¿Por qué funciona?</h3></div></div>
            <p className="mt-5 text-sm leading-7 text-slate-600">{application.foundation}</p>
            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Conceptos conectados</p>
              <div className="mt-3 flex flex-wrap gap-2">{application.connections.map((item) => <span key={item} className="rounded-full border border-[#bfd8ca] bg-[#f4faf7] px-3 py-1.5 text-xs font-bold text-[#164c3a]">{item}</span>)}</div>
            </div>
          </div>
        </article>

        <aside className="card p-6 sm:p-8">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-700"><Lightbulb size={21}/></span><div><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Del concepto a la decisión</p><h3 className="text-2xl font-black text-slate-950">Qué debe preguntarse el alumnado</h3></div></div>
          <div className="mt-6 space-y-3">
            {["¿Qué capacidad o cualidad es prioritaria?", "¿Qué variable voy a modificar: volumen, intensidad, pausa o frecuencia?", "¿La tarea se parece a la demanda real del deporte?", "¿Cómo sabré si puedo progresar sin perder calidad?"].map((question, index) => <div key={question} className="flex gap-3 rounded-2xl bg-slate-50 p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span><p className="pt-1 text-sm font-bold leading-6 text-slate-700">{question}</p></div>)}
          </div>
          <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="text-xs font-black uppercase tracking-wide text-sky-700">Idea clave</p><p className="mt-2 text-sm font-semibold leading-6 text-sky-950">Un ejercicio no es “de fútbol” o “de voleibol” solo por usar un balón. Es específico cuando sus decisiones, tiempos, desplazamientos o producción de fuerza guardan relación con lo que queremos mejorar.</p></div>
        </aside>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#1e6b4f]">Casos prácticos</p><h3 className="mt-1 text-2xl font-black text-slate-950">Así cambia el entrenamiento según el deporte</h3></div><p className="hidden max-w-md text-right text-xs leading-5 text-slate-500 md:block">Observa la relación entre situación, propuesta, fundamento y progresión. Esa secuencia es más importante que memorizar un ejercicio.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {application.cases.map((trainingCase) => {
            const Icon = sportIcons[trainingCase.sport] ?? Activity;
            return (
              <article key={`${trainingCase.sport}-${trainingCase.capacity}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-950 p-5 text-white"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><Icon size={22}/></span><div><p className="text-xs font-bold uppercase tracking-wide text-emerald-300">{trainingCase.sport}</p><h4 className="text-lg font-black">{trainingCase.capacity}</h4></div></div><ArrowRight className="text-slate-500"/></div>
                <div className="space-y-4 p-5 sm:p-6">
                  <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">Situación</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{trainingCase.situation}</p></div>
                  <div className="rounded-2xl bg-[#f4faf7] p-4"><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#1e6b4f]">Propuesta de entrenamiento</p><p className="mt-1 text-sm font-semibold leading-6 text-[#164c3a]">{trainingCase.proposal}</p></div>
                  <div><p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">¿Por qué?</p><p className="mt-1 text-sm leading-6 text-slate-600">{trainingCase.why}</p></div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-[10px] font-black uppercase tracking-[.15em] text-amber-700">Cómo progresaría</p><p className="mt-1 text-sm font-semibold leading-6 text-amber-950">{trainingCase.progression}</p></div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white"><Target size={26}/></span><div className="flex-1"><p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">Reto de aplicación · Tema {topic.number}</p><h3 className="mt-1 text-xl font-black text-violet-950">Ahora toma tú la decisión</h3><p className="mt-2 text-sm font-semibold leading-7 text-violet-950/80">{application.appliedChallenge}</p></div></div>
      </div>
    </section>
  );
}
