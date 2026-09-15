import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearAgenda } from "@/components/second-year-agenda";
export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato" title="Mi agenda" description="Consulta las próximas clases, su planificación y los recordatorios del profesor."/><div className="mx-auto max-w-6xl p-5 sm:p-8"><SecondYearAgenda/></div></>;
}
