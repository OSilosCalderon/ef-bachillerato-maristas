import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa1Layout } from "@/components/second-year-sa1-layout";

const steps = [
  {
    title: "1. Preparación",
    text: "Lee el protocolo de cada prueba, realiza una activación adecuada y utiliza siempre el mismo criterio de medida.",
  },
  {
    title: "2. Primera toma",
    text: "Registra en septiembre una marca válida de cada test. No repitas intentos indefinidamente buscando una marca mejor.",
  },
  {
    title: "3. Interpretación",
    text: "Observa fortalezas y aspectos de mejora. El porcentaje frente a la referencia es orientativo; no es un diagnóstico ni un ranking.",
  },
  {
    title: "4. Decisión",
    text: "Escoge una prioridad y formula un objetivo que puedas relacionar con tus datos y con los principios del entrenamiento.",
  },
];

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA1 · Evaluación inicial"
        title="Construye tu punto de partida"
        description="Mide con criterio para que después puedas justificar tu plan personal."
      />
      <SecondYearSa1Layout>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <article key={step.title} className="card p-5">
              <ClipboardCheck className="text-[#1e6b4f]" size={21}/>
              <h2 className="mt-4 font-extrabold text-slate-950">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{step.text}</p>
            </article>
          ))}
        </section>

        <section className="card p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Criterios para una buena evaluación</p>
              <h2 className="mt-2 text-2xl font-extrabold">Los datos solo sirven si son comparables</h2>
              <div className="mt-5 space-y-3">
                {[
                  "Utiliza el mismo test y las mismas unidades en ambas tomas.",
                  "Anota el resultado inmediatamente después de la prueba.",
                  "No compares compañeros entre sí: analiza tu propia evolución.",
                  "Relaciona la mejora esperada con una capacidad física concreta.",
                  "Repite la batería en diciembre para valorar el antes y el después.",
                ].map((item) => <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={18}/><span>{item}</span></div>)}
              </div>
            </div>
            <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <ShieldCheck className="text-amber-700" size={23}/>
              <h3 className="mt-3 font-extrabold text-amber-950">Evaluación educativa, no médica</h3>
              <p className="mt-2 text-sm leading-6 text-amber-900">Las referencias de Bachillerato ayudan a interpretar una marca de forma orientativa. No sustituyen una valoración clínica ni deben utilizarse para etiquetar al alumnado.</p>
            </aside>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-extrabold">Cuando tengas una marca válida, regístrala.</p><p className="mt-1 text-xs text-slate-300">Tus datos de septiembre serán la base del diagnóstico inicial y del plan personal.</p></div>
          <Link href="/alumno/2bach/sa1/registro" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950">Ir al registro <ArrowRight size={17}/></Link>
        </section>
      </SecondYearSa1Layout>
    </>
  );
}
