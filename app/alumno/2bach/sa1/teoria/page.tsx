import { BookOpenCheck, CheckCircle2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa1Layout } from "@/components/second-year-sa1-layout";
import { TrainingTheoryLibrary } from "@/components/training-theory-library";

const recommended = [
  "Tema 1 · Entrenar es adaptarse",
  "Tema 2 · Principios del entrenamiento",
  "Tema 3 · Carga y capacidades físicas",
  "Tema 4 · Fuerza y contracción muscular",
  "Tema 9 · Flexibilidad y amplitud de movimiento",
  "Tema 7 · Planificación del entrenamiento",
  "Tema 8 · Periodización y plan personal",
];

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA1 · Teoría"
        title="Teoría para justificar tu plan"
        description="Estudia los conceptos que necesitas para tomar decisiones razonadas sobre tu entrenamiento."
      />
      <SecondYearSa1Layout>
        <section className="card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="mt-1 text-[#1e6b4f]" />
            <div>
              <h2 className="text-xl font-extrabold">Ruta recomendada para esta SA</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">La biblioteca es común a 1º y 2º, pero para diseñar el plan personal conviene priorizar estos temas y utilizar sus ideas en la justificación.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((item) => <div key={item} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={17}/><span>{item}</span></div>)}
          </div>
        </section>

        <TrainingTheoryLibrary />
      </SecondYearSa1Layout>
    </>
  );
}
