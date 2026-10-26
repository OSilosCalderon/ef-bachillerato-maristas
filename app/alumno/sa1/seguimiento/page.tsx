import { DashboardHeader } from "@/components/dashboard-header";
import { Sa1Layout } from "@/components/sa1-layout";
import { SecondYearSa2Tracker } from "@/components/second-year-sa2-tracker";

export default function Page() {
  return <>
    <DashboardHeader eyebrow="1º Bachillerato · SA1 · Seguimiento" title="Mi plan en acción" description="Registra tus ocho sesiones desde el 26 de octubre y consulta la valoración del profesor junto a tu trabajo."/>
    <Sa1Layout><SecondYearSa2Tracker courseYear={1}/></Sa1Layout>
  </>;
}
