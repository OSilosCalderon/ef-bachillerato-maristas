import { BookOpenCheck, CheckCircle2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa2Layout } from "@/components/second-year-sa2-layout";
import { TrainingTheoryLibrary } from "@/components/training-theory-library";

const recommended = [
  "Tema 1 · Entrenar es adaptarse",
  "Tema 2 · Principios del entrenamiento",
  "Tema 3 · Carga y capacidades físicas",
  "Tema 4 · Fuerza y contracción muscular",
  "Tema 5 · Resistencia y métodos de trabajo",
  "Tema 6 · Velocidad, movilidad y estabilidad",
  "Tema 9 · Flexibilidad y amplitud de movimiento",
];

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA2 · Teoría aplicada"
        title="Comprende lo que estás entrenando"
        description="Relaciona cada decisión práctica con los principios, métodos y variables de carga que ya has estudiado."
      />
      <SecondYearSa2Layout>
        <section className="card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="mt-1 text-[#1e6b4f]" />
            <div>
              <h2 className="text-xl font-extrabold">Ruta prioritaria para SA2</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                No tienes que memorizar los temas de forma aislada. Utilízalos para explicar por qué eliges una carga, una pausa, una progresión o un tipo de ejercicio y para justificar los reajustes del plan.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((item) => (
              <div key={item} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={17}/><span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-300">
          <strong className="text-white">Pregunta guía:</strong> si una sesión sale peor de lo previsto, ¿debes repetir exactamente la misma carga o ajustar volumen, intensidad, recuperación o ejercicio? La respuesta debe apoyarse en tus registros y en los principios de entrenamiento.
        </section>

        <TrainingTheoryLibrary />
      </SecondYearSa2Layout>
    </>
  );
}
