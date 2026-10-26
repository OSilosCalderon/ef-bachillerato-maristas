import Link from "next/link";
import { TeacherSessionGrading } from "@/components/teacher-session-grading";
import { loadTeacherActivity } from "@/lib/teacher-activity-server";
import { isPlanSessionLog } from "@/lib/teacher-session-grading";

export default async function Page({ searchParams }: { searchParams: Promise<{ alumno?: string; curso?: string; grupo?: string }> }) {
  const params = await searchParams;
  const year = params.curso === "1" ? 1 : 2;
  const sa = year === 1 ? "SA1" : "SA2";
  const data = await loadTeacherActivity(year);
  return <div className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
    <header><p className="text-sm font-bold text-[#1e6b4f]">Perfil docente · {year}º Bachillerato · {sa}</p><h1 className="mt-2 text-2xl font-extrabold">Calificaciones de las sesiones</h1><Link href={year === 1 ? "/profesor/sa1" : "/profesor/2bach/sa2"} className="mt-3 inline-block text-sm font-bold text-[#1e6b4f] underline">Volver a los resultados de {sa}</Link><Link href={`/profesor/calificaciones?curso=${year}`} className="ml-4 mt-3 inline-block text-sm font-bold text-[#1e6b4f] underline">Publicar notas de las situaciones</Link></header>
    <nav aria-label="Curso de calificación" className="flex flex-wrap gap-3">{[1,2].map((course) => <Link key={course} href={`/profesor/calificar-sesiones?curso=${course}`} aria-current={year === course ? "page" : undefined} className={`rounded-xl border px-4 py-2 text-sm font-bold ${year === course ? "bg-emerald-100 text-emerald-900" : "bg-white"}`}>{course}º Bachillerato · {course === 1 ? "SA1" : "SA2"}</Link>)}</nav>
    <TeacherSessionGrading courseYear={year} key={data.loadedAt} data={{ students: data.students, activities: data.activities.filter((row) => isPlanSessionLog(row, year)), sessionEvaluations: data.sessionEvaluations }} initialStudentId={params.alumno} initialGroup={params.grupo}/>
  </div>;
}


