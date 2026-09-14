import { DashboardHeader } from "@/components/dashboard-header";
import { PhysicalProgressSummary } from "@/components/physical-progress-summary";
import { TheoryProgressSummary } from "@/components/theory-progress-summary";
import { getCurrentStudentCourse } from "@/lib/student-course";

export default async function Page() {
  const course = await getCurrentStudentCourse();
  return (
    <>
      <DashboardHeader
        eyebrow="Mi progreso"
        title="Evolución del curso"
        description="Consulta tu evolución física y el avance de los contenidos teóricos y sus autoevaluaciones."
      />
      <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
        <TheoryProgressSummary />
        {course.bachilleratoYear === 1 && <PhysicalProgressSummary />}
      </div>
    </>
  );
}
