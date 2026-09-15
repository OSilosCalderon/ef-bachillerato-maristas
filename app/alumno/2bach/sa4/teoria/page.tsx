import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA4 · Teoría" title="Creamos un evento deportivo" description="Aprende a convertir una idea en un evento viable, seguro, inclusivo y evaluable."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><SecondYearTheoryReader initialSlug="2bach-sa4-evento-deportivo" compactHeader/></div></>;
}
