import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearAgenda } from "@/components/second-year-agenda";

export default function Page() {
  return <><DashboardHeader eyebrow="1º Bachillerato" title="Mi agenda" description="Consulta las clases y los recordatorios de tu grupo."/><div className="mx-auto max-w-6xl p-5 sm:p-8"><SecondYearAgenda courseYear={1}/></div></>;
}
