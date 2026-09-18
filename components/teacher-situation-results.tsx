import { notFound } from "next/navigation";
import { TeacherActivityDashboard } from "@/components/teacher-activity-dashboard";
import { loadTeacherActivity } from "@/lib/teacher-activity-server";

export async function TeacherSituationResults({ year, code }: { year: 1 | 2; code: string }) {
  const data = await loadTeacherActivity(year);
  const situation = data.situations.find((entry) => entry.code === code);
  if (!situation) notFound();
  return <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
    <header><p className="text-sm font-bold text-[#1e6b4f]">{year}º Bachillerato · {code}</p><h1 className="mt-2 text-2xl font-extrabold">{situation.title}</h1><p className="mt-2 text-sm text-slate-500">Registros reales del alumnado de esta situación, con seguimiento individual y grupal.</p></header>
    <TeacherActivityDashboard key={`${year}-${code}`} data={data} year={year} initialSituation={code}/>
  </div>;
}
