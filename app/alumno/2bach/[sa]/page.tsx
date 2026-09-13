import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Layers3 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCurrentStudentCourse } from "@/lib/student-course";
import { getSecondYearLearningSituation } from "@/lib/second-year-data";

export default async function SecondYearSituationPage({
  params,
}: {
  params: Promise<{ sa: string }>;
}) {
  const course = await getCurrentStudentCourse();
  if (course.bachilleratoYear !== 2) notFound();

  const { sa } = await params;
  const situation = getSecondYearLearningSituation(sa);
  if (!situation) notFound();

  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · Curso 2026/2027"
        title={`${situation.code}. ${situation.title}`}
        description={situation.period}
      />
      <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
        <Link href="/alumno" className="inline-flex items-center gap-2 text-sm font-bold text-[#1e6b4f] hover:text-[#164c3a]">
          <ArrowLeft size={17}/>Volver a la programación de 2º
        </Link>

        <section className="card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Estructura de programación</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <CalendarDays className="text-[#1e6b4f]" size={22}/>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Periodo aproximado</p>
              <p className="mt-2 text-sm font-extrabold leading-6 text-slate-900">{situation.period}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Clock3 className="text-[#1e6b4f]" size={22}/>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Sesiones</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{situation.sessions}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Layers3 className="text-[#1e6b4f]" size={22}/>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Semanas</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{situation.weeks}</p>
            </div>
          </div>
        </section>

        <section className="card border-dashed p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-slate-950">Situación de aprendizaje registrada</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            La estructura temporal de esta SA ya está incorporada a la programación de 2º. Los contenidos, tareas, instrumentos de evaluación y herramientas específicas se añadirán a partir de la programación que vayamos definiendo.
          </p>
        </section>
      </div>
    </>
  );
}
