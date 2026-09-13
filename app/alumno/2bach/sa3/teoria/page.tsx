import { Activity, BedDouble, BookOpenCheck, CheckCircle2, Droplets, Utensils, Waves } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa3Layout } from "@/components/second-year-sa3-layout";
import { TrainingTheoryLibrary } from "@/components/training-theory-library";

const habitBlocks = [
  {
    title: "Movimiento cotidiano y sedentarismo",
    icon: Activity,
    text: "Entrenar una sesión no compensa por sí solo una rutina muy sedentaria. Observa cuánto te mueves a lo largo del día e introduce pausas activas cuando pasas mucho tiempo sentado.",
  },
  {
    title: "Sueño y recuperación",
    icon: BedDouble,
    text: "Una rutina de descanso regular ayuda a llegar en mejores condiciones a las tareas escolares y al entrenamiento. En esta SA importa observar regularidad y percepción de recuperación, no emitir diagnósticos.",
  },
  {
    title: "Hidratación",
    icon: Droplets,
    text: "La hidratación forma parte de la preparación y de la recuperación. El objetivo educativo es adquirir rutinas razonables antes, durante y después de la actividad, sin convertir el registro en una prescripción clínica.",
  },
  {
    title: "Alimentación y organización diaria",
    icon: Utensils,
    text: "Trabajaremos la alimentación desde la variedad, la organización y la relación con la actividad física. No se registran calorías, peso corporal ni dietas restrictivas.",
  },
  {
    title: "Recuperación y continuidad",
    icon: Waves,
    text: "La mejora necesita alternar estímulo y recuperación. Si una rutina dificulta descansar o mantener el plan, conviene reajustar la organización antes que aumentar siempre la carga.",
  },
];

const recommended = [
  "Tema 1 · Entrenar es adaptarse",
  "Tema 2 · Principios del entrenamiento",
  "Tema 3 · Carga y capacidades físicas",
  "Tema 8 · Periodización y plan personal",
  "Tema 9 · Flexibilidad y amplitud de movimiento",
];

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA3 · Teoría"
        title="Hábitos que sostienen el entrenamiento"
        description="Relaciona las rutinas cotidianas con la recuperación, la continuidad y la capacidad de mantener un plan saludable."
      />
      <SecondYearSa3Layout>
        <section className="card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="mt-1 text-[#1e6b4f]"/>
            <div>
              <h2 className="text-xl font-extrabold">Ideas clave de esta SA</h2>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">Estos contenidos amplían la biblioteca común de entrenamiento y sirven para interpretar el reto de cuatro semanas sin convertir la actividad en una valoración médica.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {habitBlocks.map(({ title, icon: Icon, text }) => (
              <article key={title} className="rounded-2xl border border-slate-200 p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e7f2ed] text-[#1e6b4f]"><Icon size={20}/></span>
                <h3 className="mt-4 font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Conexión con los apuntes comunes</p>
          <h2 className="mt-2 text-xl font-extrabold">Temas especialmente útiles para SA3</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((item) => <div key={item} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={17}/><span>{item}</span></div>)}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>Criterio de seguridad y privacidad:</strong> en esta SA no se pide registrar peso, índice de masa corporal, calorías, diagnósticos, medicación ni otros datos clínicos. El objetivo es aprender a observar conductas y a tomar decisiones razonadas sobre la propia rutina.
        </section>

        <TrainingTheoryLibrary />
      </SecondYearSa3Layout>
    </>
  );
}
