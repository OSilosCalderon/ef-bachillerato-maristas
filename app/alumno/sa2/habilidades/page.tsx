import { DashboardHeader } from "@/components/dashboard-header";
import { Sa2Layout } from "@/components/sa2-layout";
import { Sa2LineChart } from "@/components/sa2-charts";
import { TechnicalSkillsPanel } from "@/components/technical-skills-panel";
import { individualTechnicalEvolution } from "@/lib/sa2-demo-data";

export default function Page() {
  return <><DashboardHeader eyebrow="SA2 · Habilidades" title="Mis habilidades deportivas" description="Registra y compara tus pruebas técnicas entre enero y finales de marzo."/><Sa2Layout><section className="card p-6"><h2 className="text-lg font-extrabold">Resumen visual enero–marzo</h2><p className="mt-1 text-sm text-slate-500">Índice demo para integrar pruebas con unidades diferentes. Se centra únicamente en tu evolución.</p><Sa2LineChart data={individualTechnicalEvolution}/></section><TechnicalSkillsPanel/></Sa2Layout></>;
}
