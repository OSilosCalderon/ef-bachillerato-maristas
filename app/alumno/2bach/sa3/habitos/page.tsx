import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearHealthyHabitsPanel } from "@/components/second-year-healthy-habits-panel";
import { SecondYearSa3Layout } from "@/components/second-year-sa3-layout";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA3 · Hábitos"
        title="Mi reto de hábitos saludables"
        description="Elige un hábito observable, haz seguimiento durante cuatro semanas y explica qué cambio puedes mantener."
      />
      <SecondYearSa3Layout>
        <SecondYearHealthyHabitsPanel />
      </SecondYearSa3Layout>
    </>
  );
}
