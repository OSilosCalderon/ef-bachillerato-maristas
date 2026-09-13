import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa4Layout } from "@/components/second-year-sa4-layout";

const dimensions = [
  ["Propósito y diseño", "El evento tenía una finalidad clara y el formato era adecuado para los participantes."],
  ["Organización del equipo", "Las responsabilidades estaban repartidas y el equipo sabía qué hacer en cada momento."],
  ["Viabilidad", "Espacio, tiempos, materiales y presupuesto permitían realizar la propuesta con realismo."],
  ["Seguridad e inclusión", "Se anticiparon riesgos y se facilitaron formas de participación significativas para todos."],
  ["Comunicación y ejecución", "La información llegó a tiempo y el evento se desarrolló con fluidez suficiente."],
  ["Capacidad de reajuste", "Ante un problema, el equipo tomó decisiones y adaptó el plan sin perder la finalidad."],
  ["Sostenibilidad", "Se hizo un uso responsable del material, los recursos y los residuos generados."],
  ["Reflexión final", "El equipo identifica evidencias, aciertos y mejoras concretas para una nueva edición."],
];

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="2º Bachillerato · SA4 · Evaluación" title="Evalúa el evento para mejorarlo" description="No basta con decir si salió bien o mal: utiliza evidencias y explica qué mantendrías y qué cambiarías."/>
      <SecondYearSa4Layout>
        <section className="card p-6 sm:p-8">
          <div className="flex items-start gap-3"><ClipboardCheck className="mt-1 text-[#1e6b4f]"/><div><h2 className="text-2xl font-extrabold">Autoevaluación orientativa del proyecto</h2><p className="mt-2 text-sm leading-6 text-slate-500">Estas dimensiones sirven para revisar el trabajo. No sustituyen los criterios de calificación que establezca el profesor.</p></div></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {dimensions.map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-200 p-5"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={18}/><div><h3 className="font-extrabold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div></div></article>)}
          </div>
        </section>

        <section className="card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Evidencias para tu reflexión</p>
          <h2 className="mt-2 text-xl font-extrabold">Antes de escribir la reflexión final, revisa</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {["Qué tareas se completaron a tiempo", "Qué incidencias aparecieron", "Qué comentarios hicieron los participantes", "Qué cambiaríais en una segunda edición"].map((item) => <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">{item}</div>)}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="font-extrabold">Completa la evaluación en tu proyecto</p><p className="mt-1 text-xs text-slate-300">Escribe cómo valorarás el evento y, después de realizarlo, añade tu reflexión final.</p></div><Link href="/alumno/2bach/sa4/proyecto#evaluacion" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950">Ir a evaluación <ArrowRight size={17}/></Link></section>
      </SecondYearSa4Layout>
    </>
  );
}
