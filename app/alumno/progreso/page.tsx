import { getVisibleSituations } from "@/lib/situation-visibility-server";
import { DashboardHeader } from "@/components/dashboard-header";
import { PhysicalProgressSummary } from "@/components/physical-progress-summary";
import { TheoryProgressSummary } from "@/components/theory-progress-summary";
import { SecondYearProgressDashboard } from "@/components/second-year-progress-dashboard";
import { getCurrentStudentCourse } from "@/lib/student-course";

export default async function Page() {
  const course = await getCurrentStudentCourse();
  const visible = await getVisibleSituations(course.id);
  return (
    <>
      <DashboardHeader
        eyebrow="Mi progreso"
        title="Evolución del curso"
        description="Consulta tu evolución y el avance de los contenidos teóricos y sus autoevaluaciones."
      />
      <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
        {course.bachilleratoYear === 2 ? <SecondYearProgressDashboard visibleSituations={visible} /> : <><TheoryProgressSummary courseYear={1} />{visible.includes("SA1") && <details open className="card min-w-0 overflow-hidden"><summary className="cursor-pointer p-5 font-extrabold sm:p-6">SA1 · Salud y calidad de vida</summary><div className="min-w-0 border-t border-slate-200 p-5 sm:p-6"><PhysicalProgressSummary /></div></details>}</>}
      </div>
    </>
  );
}
