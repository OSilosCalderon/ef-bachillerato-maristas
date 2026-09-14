import { DashboardHeader } from "@/components/dashboard-header";
import { TrainingTheoryApplicationLab } from "@/components/training-theory-application-lab";
import { TrainingTheoryLibrary } from "@/components/training-theory-library";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="1º + 2º Bachillerato · Biblioteca común"
        title="Apuntes de entrenamiento deportivo"
        description="Fundamentación, conceptos, casos prácticos, retos de aplicación y 9 tests de autoevaluación para comprender cómo se programa la condición física."
      />
      <div className="mx-auto max-w-7xl space-y-10 p-5 sm:p-8">
        <TrainingTheoryApplicationLab />
        <div className="border-t border-slate-200 pt-10">
          <TrainingTheoryLibrary />
        </div>
      </div>
    </>
  );
}
