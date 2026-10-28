import { FinalPhysicalReflectionCard } from "@/components/final-physical-reflection-card";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa2Layout } from "@/components/second-year-sa2-layout";
import { SecondYearSa2Tracker } from "@/components/second-year-sa2-tracker";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA2 · Seguimiento"
        title="Ejecuta, registra y reajusta"
        description="Controla cada sesión del plan y utiliza los datos para tomar decisiones razonadas."
      />
      <SecondYearSa2Layout>
        <FinalPhysicalReflectionCard year={2}/>
        <SecondYearSa2Tracker />
      </SecondYearSa2Layout>
    </>
  );
}
