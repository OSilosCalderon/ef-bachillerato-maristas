import Link from "next/link";
import { TeacherSituationVisibility } from "@/components/teacher-situation-visibility";
import { TeacherCentralDashboard } from "@/components/teacher-central-dashboard";
import { ClassScheduleCard } from "@/components/class-schedule-card";

export default async function TeacherDashboard({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const year = (await searchParams).curso === "2" ? 2 : 1;
  return <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8"><div className="card flex flex-wrap gap-3 p-5"><Link href="/profesor?curso=1" className="rounded-xl border px-4 py-3 font-bold">Profesorado · 1º Bachillerato</Link><Link href="/profesor?curso=2" className="rounded-xl border px-4 py-3 font-bold">Profesorado · 2º Bachillerato</Link></div><TeacherSituationVisibility key={year} initialYear={year}/>{year === 1 ? <><ClassScheduleCard showAll/><TeacherCentralDashboard/></> : <div className="card p-5"><h2 className="text-xl font-extrabold">Planificación de 2º</h2><Link href="/profesor/agenda" className="mt-3 inline-block font-bold text-[#1e6b4f] underline">Abrir agenda de clases y recordatorios</Link></div>}</div>;
}
