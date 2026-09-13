import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa4Layout } from "@/components/second-year-sa4-layout";
import { SecondYearSportsEventProject } from "@/components/second-year-sports-event-project";

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="2º Bachillerato · SA4 · Proyecto" title="Diseña y organiza tu evento" description="Convierte una idea deportiva en un proyecto viable, seguro, inclusivo y evaluable."/>
      <SecondYearSa4Layout>
        <SecondYearSportsEventProject />
      </SecondYearSa4Layout>
    </>
  );
}
