import Link from "next/link";
import { ArrowRight, BookOpenCheck, GraduationCap, Layers3 } from "lucide-react";
import { CoursePoster } from "@/components/course-poster";
import { secondYearPlannedSessions } from "@/lib/second-year-data";

const courses = [
  {
    year: 1,
    title: "1º Bachillerato",
    subtitle: "Aprende, practica, analiza y mejora",
    description:
      "Tres situaciones de aprendizaje centradas en salud, condición física, habilidades motrices y ocio activo, con seguimiento personal y biblioteca teórica común.",
    meta: "3 situaciones de aprendizaje",
    href: "/auth/login?curso=1",
  },
  {
    year: 2,
    title: "2º Bachillerato",
    subtitle: "Analiza, planifica, aplica y justifica",
    description:
      "Seis situaciones de aprendizaje para diseñar y aplicar planes de salud, controlar el entrenamiento, trabajar hábitos saludables y desarrollar proyectos deportivos y de entorno.",
    meta: `6 situaciones · ${secondYearPlannedSessions} sesiones planificadas`,
    href: "/auth/login?curso=2",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-14">
        <nav className="mb-12 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#1e6b4f]">Maristas Badajoz</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">Educación Física · Bachillerato</div>
          </div>
          <span className="rounded-full border border-[#d7c4ab] bg-white/85 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Entorno educativo privado</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e7f2ed] px-3 py-2 text-xs font-bold text-[#1e6b4f]">
              <GraduationCap size={16}/> Curso 2026/27
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Educación Física
              <span className="mt-1 block text-[#1e6b4f]">Bachillerato</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold text-slate-600 sm:text-xl">
              Un mismo portal para 1º y 2º de Bachillerato, con entornos, situaciones de aprendizaje y seguimiento adaptados a cada curso.
            </p>
            <p className="mt-4 text-sm font-bold uppercase tracking-[.16em] text-[#8b5e3c]">Elige tu curso para acceder</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CoursePoster />
          </div>
        </div>

        <section className="mt-14 grid gap-5 lg:grid-cols-2" aria-label="Acceso por curso">
          {courses.map((course) => (
            <article key={course.year} className="card flex min-h-[330px] flex-col overflow-hidden p-0">
              <div className={`p-6 sm:p-7 ${course.year === 1 ? "bg-slate-950 text-white" : "bg-[#1e6b4f] text-white"}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold uppercase tracking-[.16em]">Acceso {course.year}º</span>
                  <Layers3 size={22} className="opacity-80"/>
                </div>
                <h2 className="mt-5 text-3xl font-black">{course.title}</h2>
                <p className="mt-2 text-sm font-bold text-white/80">{course.subtitle}</p>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-sm leading-7 text-slate-600">{course.description}</p>
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                  <BookOpenCheck size={18} className="text-[#1e6b4f]"/>
                  <span>{course.meta}</span>
                </div>
                <Link href={course.href} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b4f]">
                  Acceso alumnado · {course.title} <ArrowRight size={17}/>
                </Link>
                <Link href={`/auth/login?curso=${course.year}&perfil=profesor`} className="mt-3 rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-[#1e6b4f]">Acceso profesorado · {course.title}</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[#d7c4ab] bg-white/70 p-5 text-sm leading-6 text-slate-600">
          <strong className="text-slate-900">Biblioteca común:</strong> los 9 temas interactivos de entrenamiento deportivo están disponibles para ambos cursos. El resto del entorno cambia según 1º o 2º de Bachillerato.
        </section>
      </section>
    </main>
  );
}
