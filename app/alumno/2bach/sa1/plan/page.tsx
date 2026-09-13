import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearPersonalPlan } from "@/components/second-year-personal-plan";
import { SecondYearSa1Layout } from "@/components/second-year-sa1-layout";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA1 · Plan personal"
        title="Diseña tu propio plan de salud"
        description="Convierte tus datos iniciales en un objetivo, una carga y una estrategia que puedas justificar."
      />
      <SecondYearSa1Layout>
        <SecondYearPersonalPlan />
      </SecondYearSa1Layout>
    </>
  );
}
