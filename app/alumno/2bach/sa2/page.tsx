import Link from "next/link";
import { Activity, ArrowRight, BookOpenCheck, Gauge, Target } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa2Layout } from "@/components/second-year-sa2-layout";

const sections = [
  {
    href: "/alumno/2bach/sa1/plan",
    title: "Recupera tu plan",
    text: "Parte del objetivo, la capacidad prioritaria y la progresión que diseñaste en SA1.",
    icon: Target,
    meta: "Conexión con SA1",
  },
  {
    href: "/alumno/2bach/sa2/seguimiento",
    title: "Seguimiento de sesiones",
    text: "Registra lo realizado, duración, RPE, cumplimiento, modificaciones y reflexión de cada sesión.",
    icon: Activity,
    meta: "20 sesiones",
  },
  {
    href: "/alumno/2bach/sa2/seguimiento",
    title: "Carga y evolución",
    text: "Observa la tendencia de carga, el esfuerzo percibido y el grado de cumplimiento semana a semana.",
    icon: Gauge,
    meta: "5 semanas",
  },
  {
    href: "/alumno/2bach/sa2/teoria",
    title: "Teoría aplicada",
    text: "Usa principios, carga y métodos de trabajo para justificar los ajustes que realizas en el plan.",
    icon: BookOpenCheck,
    meta: "Biblioteca común",
  },
];

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="2º Bachillerato · SA2"
        title="Entrenar con cabeza: construye tu condición física"
        description="Ejecuta tu plan, controla la carga y aprende a reajustarlo a partir de los datos."
      />
      <SecondYearSa2Layout>
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Mediados octubre – finales noviembre · 20 sesiones · 5 semanas</p>
          <h2 className="mt-3 max-w-4xl text-2xl font-extrabold sm:text-3xl">Del plan escrito al entrenamiento real</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            En esta SA comprobarás si lo que diseñaste en SA1 funciona cuando lo llevas a la práctica. Registrarás cada sesión, controlarás el esfuerzo y justificarás los cambios necesarios sin convertir el proceso en una competición entre compañeros.
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
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Ciclo de trabajo</p>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {["1. Ejecuto", "2. Registro", "3. Interpreto", "4. Reajusto"].map((title, index) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-5">
                <p className="font-extrabold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {index === 0 && "Realizo la sesión intentando respetar el objetivo del plan."}
                  {index === 1 && "Anoto duración, RPE, cumplimiento y trabajo realizado."}
                  {index === 2 && "Observo tendencias de carga, fatiga y cumplimiento."}
                  {index === 3 && "Cambio la dosis, recuperación o ejercicios cuando puedo justificarlo."}
                </p>
              </div>
            ))}
          </div>
        </section>
      </SecondYearSa2Layout>
    </>
  );
}
