import Link from "next/link";
import { Activity, BookOpen, ClipboardList, Gauge, MessageSquareText, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sa1Layout } from "@/components/sa1-layout";

const sections = [
  { href: "/alumno/sa1/evolucion", title: "Mi evolución física", text: "Registra y compara tus resultados de septiembre y noviembre.", icon: Activity, meta: "4 pruebas con datos demo" },
  { href: "/alumno/sa1/contenidos", title: "Contenidos teóricos", text: "Consulta materiales, recursos y documentos publicados.", icon: BookOpen, meta: "2 de 3 consultados" },
  { href: "/alumno/sa1/diario", title: "Diario de sesiones", text: "Reflexiona sobre lo realizado, tus sensaciones y aprendizajes.", icon: MessageSquareText, meta: "2 entradas" },
  { href: "/alumno/sa1/cuestionarios", title: "Cuestionarios", text: "Responde cuestionarios académicos publicados por tu profesor/a.", icon: ClipboardList, meta: "1 de 2 completado" },
  { href: "/alumno/sa1/progreso", title: "Mi progreso", text: "Revisa de forma global tu participación en esta situación.", icon: Gauge, meta: "68% realizado" },
];

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="SA1 · Salud" title="Salud y calidad de vida" description="Observa tu evolución, consulta contenidos y reflexiona sobre tu aprendizaje." />
      <Sa1Layout>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {sections.map(({ href, title, text, icon: Icon, meta }) => (
            <Link key={href} href={href} className="card group flex min-h-56 flex-col p-5 transition hover:-translate-y-0.5 hover:border-slate-300">
              <span className="w-fit rounded-xl bg-[#e7f2ed] p-2.5 text-[#1e6b4f]"><Icon size={20} /></span>
              <h2 className="mt-5 font-extrabold text-slate-950">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{text}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>{meta}</span><ArrowRight size={16} className="transition group-hover:translate-x-1" /></div>
            </Link>
          ))}
        </section>
        <section className="card overflow-hidden p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Tu proceso</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Mejorar también es comprender cómo aprendes y cómo respondes al esfuerzo.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Los registros sirven para observar cambios personales entre momentos del curso. No se muestran rankings ni comparaciones entre compañeros.</p>
          </div>
        </section>
      </Sa1Layout>
    </>
  );
}
