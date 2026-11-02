import Link from "next/link";
import { TeacherActivityDashboard } from "@/components/teacher-activity-dashboard";
import { loadTeacherActivity } from "@/lib/teacher-activity-server";

export default async function TeacherDashboard({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const year = (await searchParams).curso === "2" ? 2 : 1;
  const data = await loadTeacherActivity(year);
  return <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
    {year === 2 && <section className="card flex flex-wrap items-center justify-between gap-4 border-emerald-200 bg-emerald-50 p-5 sm:p-6"><div><h2 className="text-xl font-extrabold text-[#164c3a]">Notas de todos</h2><p className="mt-2 text-sm text-slate-600">Consulta las notas de 2º, abre la vista de cada alumno y modifica las calificaciones que has publicado.</p></div><Link href="/profesor/2bach/notas" className="rounded-xl bg-[#1e6b4f] px-5 py-3 text-sm font-bold text-white">Abrir notas de todos</Link></section>}
    <TeacherActivityDashboard key={year} data={data} year={year}/>
    <div className="card flex flex-wrap gap-3 p-5">
      <Link href={`/profesor/situaciones?curso=${year}`} className="rounded-xl border px-4 py-3 font-bold">Activar situaciones de {year}º</Link>
      <Link href="/profesor/cuestionarios" className="rounded-xl border px-4 py-3 font-bold">Abrir informes GOES y BPNES</Link>
    </div>
  </div>;
}
