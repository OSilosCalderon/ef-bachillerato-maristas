import { DashboardHeader } from "@/components/dashboard-header";
import { TrainingTheoryLibrary } from "@/components/training-theory-library";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="1º + 2º Bachillerato · Biblioteca común"
        title="Apuntes de entrenamiento deportivo"
        description="9 temas organizados por capítulos. Elige uno y estudia su teoría, conceptos, ejemplos deportivos, reto, autoevaluación y referencias bibliográficas."
      />
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <TrainingTheoryLibrary />
      </div>
    </>
  );
}
