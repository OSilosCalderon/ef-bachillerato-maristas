import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa4Layout } from "@/components/second-year-sa4-layout";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA4 · Teoría" title="Creamos un evento deportivo" description="Aprende a convertir una idea en un evento viable, seguro, inclusivo y evaluable."/><SecondYearSa4Layout><SecondYearTheoryReader initialSlug="2bach-sa4-evento-deportivo" compactHeader/></SecondYearSa4Layout></>;
}
