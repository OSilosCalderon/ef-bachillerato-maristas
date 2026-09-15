import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA6 · Teoría" title="Muévete por tu entorno" description="Analiza barreras y facilitadores para diseñar una comunidad más activa e inclusiva."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><SecondYearTheoryReader initialSlug="2bach-sa6-comunidad-activa" compactHeader/></div></>;
}
