import Link from "next/link";
import { TeacherSessionGrading } from "@/components/teacher-session-grading";
import { loadTeacherActivity } from "@/lib/teacher-activity-server";
import { isPlanSessionLog } from "@/lib/teacher-session-grading";

export default async function Page({ searchParams }: { searchParams: Promise<{ alumno?: string }> }) {
  const [data, params] = await Promise.all([loadTeacherActivity(2), searchParams]);
  return <div className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
    <header><p className="text-sm font-bold text-[#1e6b4f]">Perfil docente · 2º Bachillerato · SA2</p><h1 className="mt-2 text-2xl font-extrabold">Calificaciones de las sesiones</h1><Link href="/profesor/2bach/sa2" className="mt-3 inline-block text-sm font-bold text-[#1e6b4f] underline">Volver a los resultados de SA2</Link><Link href="/profesor/calificaciones?curso=2" className="ml-4 mt-3 inline-block text-sm font-bold text-[#1e6b4f] underline">Publicar notas de las situaciones</Link></header>
    <TeacherSessionGrading key={data.loadedAt} data={{ students: data.students, activities: data.activities.filter(isPlanSessionLog), sessionEvaluations: data.sessionEvaluations }} initialStudentId={params.alumno}/>
  </div>;
}

