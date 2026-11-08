import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearHealthyHabitsPanel } from "@/components/second-year-healthy-habits-panel";
import { SecondYearSa3Layout } from "@/components/second-year-sa3-layout";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA3 · Hábitos"
        title="Laboratorio de hábitos"
        description="Registra, compara y explica un cambio con tu bitácora."
      />
      <SecondYearSa3Layout>
        <SecondYearHealthyHabitsPanel />
      </SecondYearSa3Layout>
    </>
  );
}
