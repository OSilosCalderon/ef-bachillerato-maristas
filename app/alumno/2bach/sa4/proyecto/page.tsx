import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa4Layout } from "@/components/second-year-sa4-layout";
import { Sa4EventWorkspace } from "@/components/sa4-event-workspace";

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="2º Bachillerato · SA4 · Proyecto" title="Creamos nuestra olimpiada" description="Preparad el logo del evento y organizad una actividad por delegación."/>
      <SecondYearSa4Layout>
        <Sa4EventWorkspace />
      </SecondYearSa4Layout>
    </>
  );
}
