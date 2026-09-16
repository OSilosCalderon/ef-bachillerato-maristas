import { DashboardHeader } from "@/components/dashboard-header";
import { TeacherPsychologicalReports } from "@/components/teacher-psychological-reports";

export default function Page() {
  return <><DashboardHeader eyebrow="Profesorado · SA1" title="Cuestionarios psicológicos" description="Consulta resultados individuales, medias de clase e informes iniciales y finales de GOES y BPNES."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><TeacherPsychologicalReports/></div></>;
}
