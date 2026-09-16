import Link from "next/link";
import { Activity, ArrowRight, BookOpenCheck, ClipboardCheck, ClipboardList, Target } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa1Layout } from "@/components/second-year-sa1-layout";

const sections = [
  {
    href: "/alumno/2bach/sa1/cuestionarios",
    title: "Cuestionarios psicológicos",
    text: "Completa GOES y BPNES al inicio y al final; tus respuestas son privadas y los informes quedan reservados al profesorado.",
    icon: ClipboardList,
    meta: "2 escalas · inicial y final",
  },
  {
    href: "/alumno/2bach/sa1/evaluacion",
    title: "Evaluación inicial",
    text: "Comprende el protocolo y construye una fotografía inicial de tu condición física antes de diseñar el plan.",
    icon: ClipboardCheck,
    meta: "Punto de partida",
  },
  {
    href: "/alumno/2bach/sa1/registro",
    title: "Registro de datos",
    text: "Introduce tus marcas de septiembre y conserva la segunda toma de diciembre para analizar el antes y el después.",
    icon: Activity,
    meta: "11 pruebas · 2 tomas",
  },
  {
    href: "/alumno/2bach/sa1/plan",
    title: "Mi plan personal",
    text: "Interpreta tus datos, formula un objetivo y concreta ejercicios, dosis, recuperación y progresión.",
    icon: Target,
    meta: "Calendario y reflexión final",
  },
  {
    href: "/alumno/2bach/sa1/teoria",
    title: "Bloque teórico",
    text: "Usa el módulo teórico de SA1 para justificar las decisiones de tu plan con principios de entrenamiento.",
    icon: BookOpenCheck,
    meta: "Teoría aplicada de SA1",
  },
];

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA1"
        title="¿Cuál es mi punto de partida? Diseña tu propio plan de salud"
        description="Evalúa, interpreta, planifica y justifica tu propuesta personal de condición física."
      />
      <SecondYearSa1Layout>
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Evaluación inicial · Plan personal: 13–28 octubre · Revisión final</p>
          <h2 className="mt-3 max-w-4xl text-2xl font-extrabold sm:text-3xl">De los datos a una decisión razonada</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            En 2º no basta con completar las pruebas. Debes interpretar tu punto de partida, seleccionar un objetivo realista y justificar cómo vas a organizar carga, recuperación, progresión y evaluación.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {sections.map(({ href, title, text, icon: Icon, meta }) => (
            <Link key={href} href={href} className="card group flex min-h-64 flex-col p-5 transition hover:-translate-y-0.5 hover:border-slate-300">
              <span className="w-fit rounded-xl bg-[#e7f2ed] p-2.5 text-[#1e6b4f]"><Icon size={21}/></span>
              <h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{text}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>{meta}</span><ArrowRight size={16} className="transition group-hover:translate-x-1"/></div>
            </Link>
          ))}
        </section>

        <section className="card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Secuencia de trabajo</p>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {["1. Mido", "2. Interpreto", "3. Diseño", "4. Reviso"].map((title, index) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-5">
                <p className="font-extrabold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {index === 0 && "Registro mis datos iniciales con un protocolo común."}
                  {index === 1 && "Comparo mis resultados conmigo mismo y con la referencia orientativa."}
                  {index === 2 && "Creo un plan con objetivo, tareas, dosis, progresión y recuperación."}
                  {index === 3 && "Uso la segunda toma para valorar qué ha funcionado y qué debo reajustar."}
                </p>
              </div>
            ))}
          </div>
        </section>
      </SecondYearSa1Layout>
    </>
  );
}
