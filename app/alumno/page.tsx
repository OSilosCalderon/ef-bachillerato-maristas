import { getVisibleSituations } from "@/lib/situation-visibility-server";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { LearningSituationCard } from "@/components/learning-situation-card";
import { learningSituations } from "@/lib/demo-data";
import { getCurrentStudentCourse } from "@/lib/student-course";
import {
  secondYearLearningSituations,
  secondYearPlannedSessions,
  secondYearTransversalMargin,
} from "@/lib/second-year-data";

export default async function StudentDashboard() {
  const course = await getCurrentStudentCourse();
  const visible = await getVisibleSituations(course.id);

  if (course.bachilleratoYear === 2) {
    return <>
      <DashboardHeader eyebrow="Maristas Badajoz" title="EF de 2º Bachillerato" description="Analiza, planifica, aplica y justifica tu entrenamiento"/>
      <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
        <section className="card overflow-hidden">
          <div className="bg-slate-950 p-7 text-white">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Curso 2026/2027</p>
            <h2 className="mt-2 text-2xl font-extrabold">Programación de 2º Bachillerato</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Distribución orientativa de seis situaciones de aprendizaje desde septiembre hasta el 27 de abril, con {secondYearPlannedSessions} sesiones previstas. El calendario de clases llega hasta el 6 de mayo; consulta la agenda para las fechas y los ajustes del profesor.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 p-6">
            <Link href="/alumno/apuntes-entrenamiento" className="inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">
              <GraduationCap size={18}/>Abrir los 6 módulos teóricos
            </Link>
            <Link href="/alumno/2bach/agenda" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"><CalendarDays size={18}/>Agenda y recordatorios</Link>
            <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600">6 SA · {secondYearPlannedSessions} sesiones</span>
          </div>
        </section>

        {!visible.length && <p className="card p-5">El profesor todavía no ha activado ninguna situación de aprendizaje.</p>}
        <section>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Mi curso</p>
          <h2 className="mt-1 text-2xl font-extrabold">Situaciones de aprendizaje de 2º</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {secondYearLearningSituations.filter((sa) => visible.includes(sa.code)).map((situation) => (
              <article key={situation.code} className="card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-[#e7f2ed] px-3 py-1 text-xs font-bold tracking-wider text-[#1e6b4f]">{situation.code}</span>
                  <CalendarDays className="text-[#1e6b4f]" size={22}/>
                </div>
                <h3 className="mt-5 text-xl font-extrabold leading-tight text-slate-900">{situation.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{situation.period}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Sesiones</p><p className="mt-1 text-lg font-extrabold">{situation.sessions}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Semanas</p><p className="mt-1 text-lg font-extrabold">{situation.weeks}</p></div>
                </div>
                <Link href={situation.href} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                  Entrar <ArrowRight size={17} className="transition group-hover:translate-x-1"/>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="card border-dashed p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">{secondYearTransversalMargin.label}</p>
              <h2 className="mt-1 text-xl font-extrabold">{secondYearTransversalMargin.sessions} sesiones</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{secondYearTransversalMargin.description}</p>
            </div>
            <Sparkles className="shrink-0 text-[#1e6b4f]" size={28}/>
          </div>
        </section>

        <section className="card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Biblioteca de 2º Bachillerato</p>
            <h2 className="mt-1 text-xl font-extrabold">6 módulos de teoría aplicada</h2>
            <p className="mt-2 text-sm text-slate-500">Capacidades físicas, planificación, práctica deportiva y proyectos vinculados a las seis situaciones de aprendizaje.</p>
          </div>
          <Link href="/alumno/apuntes-entrenamiento" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">
            <GraduationCap size={18}/>Estudiar temas
          </Link>
        </section>
      </div>
    </>;
  }

  return <>
    <DashboardHeader eyebrow="Maristas Badajoz" title="EF de 1º Bachillerato" description="Aprende, practica, analiza y mejora"/>
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Tu grupo</p><h2 className="mt-1 text-xl font-extrabold">Clases y recordatorios</h2><p className="mt-2 text-sm text-slate-500">Consulta las fechas de 1ºA o 1ºB según el grupo asignado a tu cuenta.</p></div><Link href="/alumno/agenda" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white"><CalendarDays size={18}/>Abrir mi agenda</Link></section>
      {!visible.length && <p className="card p-5">El profesor todavía no ha activado ninguna situación de aprendizaje.</p>}

      <section>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Mi curso</p>
        <h2 className="mt-1 text-2xl font-extrabold">Situaciones de aprendizaje de 1º</h2>
        <div className="mt-5 grid gap-5 xl:grid-cols-3">{learningSituations.filter((sa) => visible.includes(sa.code)).map((sa)=><LearningSituationCard key={sa.id} situation={sa}/>)}</div>
      </section>

      <section className="card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">SA1 · Contenidos teóricos</p><h2 className="mt-1 text-xl font-extrabold">9 temas interactivos de entrenamiento</h2><p className="mt-2 text-sm text-slate-500">Principios, carga, fuerza y contracciones, resistencia, velocidad, flexibilidad, planificación y periodización.</p></div><Link href="/alumno/apuntes-entrenamiento" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><GraduationCap size={18}/>Estudiar temas</Link></section>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="text-xl font-extrabold">Mi progreso</h2><p className="mt-2 text-sm text-slate-500">Consulta tus registros físicos, lecturas y autoevaluaciones realizadas.</p></div><Link href="/alumno/progreso" className="rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white">Ver mis resultados</Link></section>
    </div>
  </>;
}
