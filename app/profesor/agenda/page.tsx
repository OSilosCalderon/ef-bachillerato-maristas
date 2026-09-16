import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearAgenda } from "@/components/second-year-agenda";
import { requireRole } from "@/lib/auth/guards";
export default async function Page() {
  await requireRole("teacher");
  return <><DashboardHeader eyebrow="Planificación docente" title="Agenda de clases" description="Selecciona 1ºA, 1ºB o 2º, planifica las clases y publica los recordatorios que verá el alumnado."/><div className="mx-auto max-w-6xl p-5 sm:p-8"><SecondYearAgenda teacher/></div></>;
}
