import { BookOpen, BrainCircuit, ClipboardCheck, Dumbbell, NotebookPen, Trophy } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Sa2Layout } from "@/components/sa2-layout";
import { Sa2LineChart } from "@/components/sa2-charts";
import { individualTechnicalEvolution } from "@/lib/sa2-demo-data";

const stats = [
  ["Deportes trabajados", "4", "Con actividad registrada", Trophy],
  ["Pruebas realizadas", "4 / 4", "Con registros técnicos", Dumbbell],
  ["Diarios", "2", "Entradas completadas", NotebookPen],
  ["Contenidos", "2 / 4", "Consultados", BookOpen],
  ["Cuestionarios", "0 / 1", "Completados", ClipboardCheck],
  ["Toma de decisiones", "2", "Intentos registrados", BrainCircuit],
] as const;

export default function Page() {
  return <><DashboardHeader eyebrow="SA2 · Resumen" title="Mi progreso" description="Una visión global de tu participación y evolución en Habilidades motrices específicas y deportes."/><Sa2Layout><section className="card p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-slate-500">Realización general</p><p className="mt-1 text-5xl font-extrabold">64%</p></div><p className="max-w-xl text-sm leading-6 text-slate-500">Resume actividades realizadas en SA2. No representa una clasificación frente a otros alumnos.</p></div><div className="mt-6"><ProgressBar value={64}/></div></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(([title,value,note,Icon]) => <article key={title} className="card p-5"><Icon className="text-[#1e6b4f]" size={20}/><p className="mt-5 text-sm text-slate-500">{title}</p><p className="mt-1 text-3xl font-extrabold">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>)}</section><section className="card p-6"><h2 className="text-lg font-extrabold">Evolución global enero–marzo</h2><p className="mt-1 text-sm text-slate-500">Resumen normalizado de tus pruebas técnicas comparables.</p><Sa2LineChart data={individualTechnicalEvolution}/></section></Sa2Layout></>;
}
