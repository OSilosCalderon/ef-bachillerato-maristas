import Link from "next/link";
import { BookOpen, BrainCircuit, ClipboardCheck, Gauge, NotebookPen, Trophy } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sa2Layout } from "@/components/sa2-layout";

const sections = [
  { href: "/alumno/sa2/habilidades", title: "Mis habilidades deportivas", description: "Compara tus registros técnicos de enero y marzo.", icon: Trophy },
  { href: "/alumno/sa2/contenidos", title: "Contenidos teóricos", description: "Consulta materiales de reglamento, técnica, táctica y seguridad.", icon: BookOpen },
  { href: "/alumno/sa2/diario", title: "Diario deportivo", description: "Registra lo trabajado, tu participación y tus reflexiones.", icon: NotebookPen },
  { href: "/alumno/sa2/cuestionarios", title: "Cuestionarios psicológicos", description: "Accede a cuestionarios asignados por el profesorado.", icon: ClipboardCheck },
  { href: "/alumno/sa2/decisiones", title: "Conocimiento y toma de decisiones", description: "Trabaja escenarios deportivos y conocimiento procedimental.", icon: BrainCircuit },
  { href: "/alumno/sa2/progreso", title: "Mi progreso", description: "Revisa de forma global tu participación y evolución en SA2.", icon: Gauge },
];

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="SA2" title="Habilidades motrices específicas y deportes" description="Practica, interpreta situaciones de juego y analiza tu evolución personal." />
      <Sa2Layout>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map(({ href, title, description, icon: Icon }) => (
            <Link key={href} href={href} className="card group p-6 transition hover:-translate-y-0.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f2ed] text-[#1e6b4f]"><Icon size={21}/></span>
              <h2 className="mt-5 text-lg font-extrabold group-hover:text-[#1e6b4f]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
              <span className="mt-5 inline-block text-sm font-bold text-[#1e6b4f]">Entrar →</span>
            </Link>
          ))}
        </section>
      </Sa2Layout>
    </>
  );
}
