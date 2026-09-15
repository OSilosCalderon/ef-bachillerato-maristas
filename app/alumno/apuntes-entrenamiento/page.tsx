import { DashboardHeader } from "@/components/dashboard-header";
import { TrainingTheoryLibrary } from "@/components/training-theory-library";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";
import { getCurrentStudentCourse } from "@/lib/student-course";

export default async function Page() {
  const course = await getCurrentStudentCourse();
  const secondYear = course.bachilleratoYear === 2;

  return (
    <>
      <DashboardHeader
        eyebrow={secondYear ? "2º Bachillerato · Biblioteca propia" : "1º Bachillerato · Biblioteca de entrenamiento"}
        title={secondYear ? "Teoría aplicada de 2º Bachillerato" : "Apuntes de entrenamiento deportivo"}
        description={secondYear ? "6 módulos vinculados a las situaciones de aprendizaje: fundamentación, conceptos, casos, retos, autoevaluación, imágenes y bibliografía." : "9 temas organizados por capítulos. Elige uno y estudia su teoría, conceptos, ejemplos deportivos, reto, autoevaluación y referencias bibliográficas."}
      />
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        {secondYear ? <SecondYearTheoryReader /> : <TrainingTheoryLibrary />}
      </div>
    </>
  );
}
