import Link from "next/link";
import { TeacherActivityDashboard } from "@/components/teacher-activity-dashboard";
import { loadTeacherActivity } from "@/lib/teacher-activity-server";

export default async function TeacherDashboard({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const year = (await searchParams).curso === "2" ? 2 : 1;
  const data = await loadTeacherActivity(year);
  return <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
    <TeacherActivityDashboard key={year} data={data} year={year}/>
    <div className="card flex flex-wrap gap-3 p-5">
      <Link href={`/profesor/situaciones?curso=${year}`} className="rounded-xl border px-4 py-3 font-bold">Activar situaciones de {year}º</Link>
      <Link href="/profesor/cuestionarios" className="rounded-xl border px-4 py-3 font-bold">Abrir informes GOES y BPNES</Link>
    </div>
  </div>;
}
