import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sa1Layout } from "@/components/sa1-layout";
import { SecondYearPersonalPlan } from "@/components/second-year-personal-plan";

export default function Page() {
  return <><DashboardHeader eyebrow="1º Bachillerato · SA1" title="Mi plan personal" description="Convierte tus resultados iniciales en uno o dos objetivos y organiza ocho sesiones de trabajo."/><Sa1Layout><div className="rounded-2xl bg-emerald-50 p-5 text-sm leading-6"><p>El plan se desarrolla en ocho clases entre el 26 de octubre y el 23 de noviembre. Cada tarea aparecerá en el calendario al asignarla a una sesión.</p><Link href="/alumno/agenda" className="mt-2 inline-block font-bold text-[#1e6b4f] underline">Abrir agenda y recordatorios</Link></div><SecondYearPersonalPlan courseYear={1}/></Sa1Layout></>;
}
