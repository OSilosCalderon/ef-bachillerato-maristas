import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearPersonalPlan } from "@/components/second-year-personal-plan";
import { SecondYearSa1Layout } from "@/components/second-year-sa1-layout";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA1 · Plan personal"
        title="Diseña tu propio plan de salud"
        description="Convierte tus datos iniciales en uno o dos objetivos, una carga y una estrategia que puedas justificar."
      />
      <SecondYearSa1Layout>
        <div className="mb-5 rounded-2xl bg-emerald-50 p-5 text-sm leading-6"><p>Lunes y miércoles 10:05–11:00 · Martes y jueves 13:20–14:15. Consulta los días lectivos y lo que ha previsto el profesor antes de repartir tus tareas.</p><Link href="/alumno/2bach/agenda" className="mt-2 inline-block font-bold text-[#1e6b4f] underline">Abrir agenda y recordatorios</Link></div>
        <SecondYearPersonalPlan />
      </SecondYearSa1Layout>
    </>
  );
}
