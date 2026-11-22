import Link from "next/link";
import { ArrowRight, CalendarCheck2, ClipboardCheck, Megaphone, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa4Layout } from "@/components/second-year-sa4-layout";

import { Sa4Delegations } from "@/components/sa4-delegations";
import { getCurrentStudentCourse } from "@/lib/student-course";

const blocks = [
  { href: "/alumno/2bach/sa4/proyecto", title: "Creación del evento", text: "Completad en equipo el logo, el reglamento, la organización, el cuadro de juego y la clasificación de vuestra prueba.", icon: CalendarCheck2, meta: "Documento vivo" },
  { href: "/alumno/2bach/sa4/guia", title: "Guía de organización", text: "Consulta una secuencia clara para tomar decisiones viables, seguras, inclusivas y sostenibles.", icon: ShieldCheck, meta: "Antes de ejecutar" },
  { href: "/alumno/2bach/sa4/teoria", title: "Teoría y reflexión", text: "Lee el módulo, resuelve la autoevaluación y explica individualmente tus decisiones sobre la organización.", icon: Megaphone, meta: "Trabajo en equipo" },
  { href: "/alumno/2bach/sa4/evaluacion", title: "Evaluación final", text: "Valora la organización, la ejecución, la seguridad, la inclusión y el trabajo realizado por el equipo.", icon: ClipboardCheck, meta: "Mejora del proyecto" },
];

const weeks = [
  ["Identidad", "Logo y lema", "Propuesta de cada país, concurso y votación."],
  ["Actividad", "Un deporte por delegación", "Objetivo, participantes, reglamento y puntuación."],
  ["Preparación", "Organizar y comunicar", "Roles, material, espacio, horarios, seguridad y publicidad."],
  ["Competición", "Cuadro y clasificación", "Ocho países, partidos, arbitraje y registro de resultados."],
  ["Balance", "Evaluar la experiencia", "Evidencias, trabajo en equipo y propuestas de mejora."],
];

export default async function Page() {
  const course = await getCurrentStudentCourse();
  return (
    <>
      <DashboardHeader eyebrow="2º Bachillerato · SA4" title="Creamos un evento deportivo" description="Diseña, organiza, ejecuta y evalúa una experiencia deportiva realista y participativa."/>
      <SecondYearSa4Layout>
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Ocho delegaciones · ocho actividades</p>
          <h2 className="mt-3 max-w-4xl text-2xl font-extrabold sm:text-3xl">Creamos nuestra olimpiada</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Cada país propone el logo y el lema del evento, diseña una actividad deportiva y participa en las pruebas de las demás delegaciones. Prepararéis la organización, el cuadro de juego y la clasificación, y evaluaréis cómo ha funcionado.</p>
        </section>

        <Sa4Delegations courseId={course.id}/>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {blocks.map(({ href, title, text, icon: Icon, meta }) => (
            <Link key={title} href={href} className="card group flex min-h-64 flex-col p-5 transition hover:-translate-y-0.5 hover:border-slate-300">
              <span className="w-fit rounded-xl bg-[#e7f2ed] p-2.5 text-[#1e6b4f]"><Icon size={21}/></span>
              <h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{text}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>{meta}</span><ArrowRight size={16} className="transition group-hover:translate-x-1"/></div>
            </Link>
          ))}
        </section>

        <section className="card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Pasos de la olimpiada</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-5">
            {weeks.map(([week, title, text]) => <article key={week} className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">{week}</p><h3 className="mt-2 font-extrabold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}
          </div>
        </section>
      </SecondYearSa4Layout>
    </>
  );
}
