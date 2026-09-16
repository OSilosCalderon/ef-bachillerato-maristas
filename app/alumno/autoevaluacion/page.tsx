import { DashboardHeader } from "@/components/dashboard-header";
import { TheoryProgressSummary } from "@/components/theory-progress-summary";
import { getCurrentStudentCourse } from "@/lib/student-course";
export default async function Page() {
  const course = await getCurrentStudentCourse();
  return <><DashboardHeader eyebrow="Autoevaluación" title="Mis autoevaluaciones" description="Consulta los tests de los contenidos teóricos y accede a los temas para realizarlos."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><TheoryProgressSummary courseYear={course.bachilleratoYear === 2 ? 2 : 1}/></div></>;
}
