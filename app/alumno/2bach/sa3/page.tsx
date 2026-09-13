import Link from "next/link";
import { ArrowRight, BookOpenCheck, HeartPulse, LineChart, Target } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa3Layout } from "@/components/second-year-sa3-layout";

const sections = [
  {
    href: "/alumno/2bach/sa3/habitos",
    title: "Mi reto de hábitos",
    text: "Analiza tu rutina, escoge un hábito prioritario y formula un objetivo observable para cuatro semanas.",
    icon: Target,
    meta: "Punto de partida",
  },
  {
    href: "/alumno/2bach/sa3/habitos#seguimiento",
    title: "Seguimiento semanal",
    text: "Valora sueño, movimiento, sedentarismo, recuperación, hidratación y alimentación desde un enfoque educativo.",
    icon: LineChart,
    meta: "4 semanas",
  },
  {
    href: "/alumno/2bach/sa3/habitos#balance",
    title: "Balance final",
    text: "Compara la primera y la cuarta semana y explica qué cambio ha sido sostenible y qué necesitas reajustar.",
    icon: HeartPulse,
    meta: "Antes y después",
  },
  {
    href: "/alumno/2bach/sa3/teoria",
    title: "Teoría aplicada",
    text: "Comprende cómo actividad, descanso, recuperación y organización cotidiana sostienen el entrenamiento y la salud.",
    icon: BookOpenCheck,
    meta: "Hábitos + biblioteca común",
  },
];

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA3"
        title="Más que entrenar: hábitos para una vida saludable"
        description="Analiza tu rutina, prueba un cambio realista y utiliza los datos para valorar si puedes mantenerlo."
      />
      <SecondYearSa3Layout>
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Diciembre – finales enero · 16 sesiones · 4 semanas</p>
          <h2 className="mt-3 max-w-4xl text-2xl font-extrabold sm:text-3xl">La condición física no depende solo del entrenamiento</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            En esta SA observarás cómo tus rutinas cotidianas pueden facilitar o dificultar la recuperación y la continuidad del plan. Trabajarás con autorregistros sencillos, sin diagnósticos, dietas, calorías ni comparaciones entre compañeros.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map(({ href, title, text, icon: Icon, meta }) => (
            <Link key={`${href}-${title}`} href={href} className="card group flex min-h-64 flex-col p-5 transition hover:-translate-y-0.5 hover:border-slate-300">
              <span className="w-fit rounded-xl bg-[#e7f2ed] p-2.5 text-[#1e6b4f]"><Icon size={21}/></span>
              <h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{text}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>{meta}</span><ArrowRight size={16} className="transition group-hover:translate-x-1"/></div>
            </Link>
          ))}
        </section>

        <section className="card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Secuencia de trabajo</p>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {["1. Me observo", "2. Elijo", "3. Actúo", "4. Registro", "5. Reajusto"].map((title, index) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-5">
                <p className="font-extrabold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {index === 0 && "Analizo mi rutina sin etiquetarme ni compararme."}
                  {index === 1 && "Selecciono un hábito concreto y un objetivo realista."}
                  {index === 2 && "Pongo en práctica acciones sencillas durante cuatro semanas."}
                  {index === 3 && "Registro tendencias semanales y mi grado de cumplimiento."}
                  {index === 4 && "Explico qué mantendría, qué cambiaría y por qué."}
                </p>
              </div>
            ))}
          </div>
        </section>
      </SecondYearSa3Layout>
    </>
  );
}
