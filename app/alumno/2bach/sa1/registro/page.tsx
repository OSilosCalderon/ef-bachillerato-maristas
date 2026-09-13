import { DashboardHeader } from "@/components/dashboard-header";
import { PhysicalEvolutionPanel } from "@/components/physical-evolution-panel";
import { SecondYearSa1Layout } from "@/components/second-year-sa1-layout";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA1 · Registro"
        title="Mis datos de condición física"
        description="Registra la toma inicial de septiembre y utiliza diciembre para analizar el antes y el después."
      />
      <SecondYearSa1Layout>
        <PhysicalEvolutionPanel />
      </SecondYearSa1Layout>
    </>
  );
}
