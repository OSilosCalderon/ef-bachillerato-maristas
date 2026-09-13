import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, Megaphone, Recycle, ShieldCheck, Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearSa4Layout } from "@/components/second-year-sa4-layout";

const phases = [
  { icon: ClipboardList, title: "1. Define el reto", text: "Aclara la finalidad, los destinatarios, el tipo de actividad, el formato y el espacio antes de repartir tareas." },
  { icon: Users, title: "2. Reparte responsabilidades", text: "Cada área necesita una persona responsable. Evita que todo dependa de una sola persona y deja claro quién decide qué." },
  { icon: ShieldCheck, title: "3. Hazlo seguro e inclusivo", text: "Revisa espacio, material, tiempos, normas, supervisión y alternativas para que todos puedan participar de forma significativa." },
  { icon: Megaphone, title: "4. Comunica y ensaya", text: "Los participantes deben saber qué ocurre, dónde, cuándo y cómo. Antes del evento, prueba recorridos, tiempos, material y rotaciones." },
  { icon: Recycle, title: "5. Ejecuta, recoge y evalúa", text: "Durante el evento registra incidencias. Después recoge material, valora resultados y explica qué cambiarías en una segunda edición." },
];

const checklist = [
  "La finalidad del evento se entiende en una frase.",
  "El formato permite participar a todas las personas previstas.",
  "Cada área de trabajo tiene responsable.",
  "El reglamento es breve, comprensible y aplicable.",
  "Se han previsto seguridad, inclusión y posibles incidencias.",
  "El material y el espacio están disponibles o tienen alternativa.",
  "El cronograma incluye preparación, montaje, ejecución y recogida.",
  "La comunicación indica lugar, horario, normas y qué debe llevar cada participante.",
  "El presupuesto diferencia lo que ya existe de lo que habría que adquirir.",
  "Existe una forma concreta de evaluar si el evento ha funcionado.",
];

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="2º Bachillerato · SA4 · Guía" title="Cómo organizar un evento deportivo" description="Una secuencia práctica para pasar de una idea atractiva a un evento que pueda funcionar de verdad."/>
      <SecondYearSa4Layout>
        <section className="grid gap-4 lg:grid-cols-5">
          {phases.map(({ icon: Icon, title, text }) => <article key={title} className="card p-5"><Icon className="text-[#1e6b4f]" size={21}/><h2 className="mt-4 font-extrabold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}
        </section>

        <section className="card p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Lista de comprobación</p>
          <h2 className="mt-2 text-2xl font-extrabold">Antes de considerar el evento listo</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {checklist.map((item) => <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-0.5 shrink-0 text-[#1e6b4f]" size={18}/><span>{item}</span></div>)}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-extrabold text-amber-950">Si algo falla</h2><p className="mt-2 text-sm leading-6 text-amber-900">No improvises sin criterio. Define de antemano alternativas para falta de material, ausencia de participantes, retrasos, mal tiempo o necesidad de cambiar el espacio.</p></article>
          <article className="rounded-2xl border border-sky-200 bg-sky-50 p-6"><h2 className="font-extrabold text-sky-950">Un buen reglamento</h2><p className="mt-2 text-sm leading-6 text-sky-900">Debe ayudar a que la actividad fluya. Prioriza pocas normas, fáciles de comunicar, con criterios claros de puntuación, rotación y resolución de conflictos.</p></article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><h2 className="font-extrabold text-emerald-950">La organización también se entrena</h2><p className="mt-2 text-sm leading-6 text-emerald-900">Coordinar un evento exige escuchar, anticipar, decidir, asumir responsabilidades y reajustar. La calidad del trabajo en equipo forma parte del aprendizaje.</p></article>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="font-extrabold">Usa la guía mientras completas el proyecto</p><p className="mt-1 text-xs text-slate-300">El indicador de preparación te mostrará qué bloques esenciales faltan.</p></div><Link href="/alumno/2bach/sa4/proyecto" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-950">Abrir proyecto <ArrowRight size={17}/></Link></section>
      </SecondYearSa4Layout>
    </>
  );
}
