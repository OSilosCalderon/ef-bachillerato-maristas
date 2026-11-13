import Link from "next/link";
import { TeacherSessionGrading } from "@/components/teacher-session-grading";
import { loadTeacherActivity } from "@/lib/teacher-activity-server";
import { isPlanSessionLog } from "@/lib/teacher-session-grading";

export default async function Page({ searchParams }: { searchParams: Promise<{ alumno?: string; curso?: string; grupo?: string; vista?: string }> }) {
  const params = await searchParams;
  const year = params.curso === "1" ? 1 : 2;
  const sa = year === 1 ? "SA1" : "SA2";
  const data = await loadTeacherActivity(year);
  return <div className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
    <header><p className="text-sm font-bold text-[#1e6b4f]">Perfil docente · {year}º Bachillerato · {sa}</p><h1 className="mt-2 text-2xl font-extrabold">Calificaciones de las sesiones</h1><Link href={year === 1 ? "/profesor/sa1" : "/profesor/2bach/sa2"} className="mt-3 inline-block text-sm font-bold text-[#1e6b4f] underline">Volver a los resultados de {sa}</Link><Link href={`/profesor/calificaciones?curso=${year}`} className="ml-4 mt-3 inline-block text-sm font-bold text-[#1e6b4f] underline">Publicar notas de las situaciones</Link></header>
    <TeacherSessionGrading courseYear={year} key={year} data={{ students: data.students, activities: data.activities.filter((row) => isPlanSessionLog(row, year)), sessionEvaluations: data.sessionEvaluations }} initialStudentId={params.alumno} initialGroup={params.grupo} initialGrid={params.vista === "cuaderno"}/>
  </div>;
}


