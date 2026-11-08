import Link from "next/link";
import { ArrowRight, BookOpenCheck, FileText, NotebookPen, Target } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa3Layout } from "@/components/second-year-sa3-layout";

const sections = [
  {
    href: "/alumno/2bach/sa3/habitos",
    title: "Diario y calculadora",
    text: "Registra alimentos, calcula su energía a partir de la etiqueta y compara los grupos presentes en distintos días.",
    icon: NotebookPen,
    meta: "Observa",
  },
  {
    href: "/alumno/2bach/sa3/habitos#reto",
    title: "Mi hábito y su seguimiento",
    text: "Elige una acción observable, prepara una alternativa y documenta cómo te ha ido durante cuatro semanas.",
    icon: Target,
    meta: "Prueba",
  },
  {
    href: "/alumno/2bach/sa3/habitos#balance",
    title: "Informe final",
    text: "Compara el punto de partida y la última semana. Usa tus evidencias para explicar qué mantendrás o ajustarás.",
    icon: FileText,
    meta: "Explica",
  },
  {
    href: "/alumno/2bach/sa3/habitos#sesiones",
    title: "Ruta de diez sesiones",
    text: "Consulta la práctica, la evidencia que vas a preparar y la rúbrica de la bitácora.",
    icon: BookOpenCheck,
    meta: "Guía de trabajo",
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
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">10 sesiones · 4 semanas de seguimiento</p>
          <h2 className="mt-3 max-w-4xl text-2xl font-extrabold sm:text-3xl">Producto final · Bitácora de un cambio sostenible</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            Investiga un hábito cotidiano con un diario de alimentación, una acción practicable y cuatro registros semanales. Cierra la bitácora explicando qué muestran tus observaciones y qué paso darás después.
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
                  {index === 0 && "Identifico el contexto de mi rutina y observo tres días del diario."}
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
