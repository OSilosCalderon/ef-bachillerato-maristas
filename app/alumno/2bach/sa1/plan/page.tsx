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
        description="Convierte tus datos iniciales en uno o dos objetivos y distribuye tus tareas en diez sesiones lectivas."
      />
      <SecondYearSa1Layout>
        <div className="mb-5 rounded-2xl bg-emerald-50 p-5 text-sm leading-6"><p>Plan de diez sesiones desde el periodo que comienza el 12 de octubre. El día 12 es festivo; las clases lectivas del plan se desarrollan del 13 al 28 de octubre.</p><Link href="/alumno/2bach/agenda" className="mt-2 inline-block font-bold text-[#1e6b4f] underline">Abrir agenda y recordatorios</Link></div>
        <SecondYearPersonalPlan />
      </SecondYearSa1Layout>
    </>
  );
}
