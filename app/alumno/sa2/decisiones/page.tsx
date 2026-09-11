import { DashboardHeader } from "@/components/dashboard-header";
import { ProceduralKnowledgePanel } from "@/components/procedural-knowledge-panel";
import { Sa2Layout } from "@/components/sa2-layout";

export default function Page() {
  return <><DashboardHeader eyebrow="SA2 · Juego" title="Conocimiento y toma de decisiones" description="Actividades de conocimiento procedimental y análisis de pequeños escenarios deportivos."/><Sa2Layout><ProceduralKnowledgePanel/></Sa2Layout></>;
}
