import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa4Layout } from "@/components/second-year-sa4-layout";
import { Sa4EventWorkspace } from "@/components/sa4-event-workspace";

export default function Page() {
  return <>
    <DashboardHeader eyebrow="2º Bachillerato · SA4 · Calendario" title="Los torneos de nuestra olimpiada" description="Consulta qué deporte toca, qué país lo organiza y las cuatro clases de cada torneo."/>
    <SecondYearSa4Layout><Sa4EventWorkspace initialView="calendar"/></SecondYearSa4Layout>
  </>;
}
