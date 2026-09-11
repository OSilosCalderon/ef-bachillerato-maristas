import { DashboardHeader } from "@/components/dashboard-header";
import { TeacherSa2Dashboard } from "@/components/teacher-sa2-dashboard";

export default function Page() {
  return <><DashboardHeader eyebrow="SA2 · Profesorado" title="Habilidades motrices específicas y deportes" description="Seguimiento técnico, diarios, contenidos, cuestionarios y actividades de conocimiento y toma de decisiones."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><TeacherSa2Dashboard/></div></>;
}
