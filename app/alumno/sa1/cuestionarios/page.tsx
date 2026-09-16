import { DashboardHeader } from "@/components/dashboard-header";
import { PsychologicalQuestionnaires } from "@/components/psychological-questionnaires";
import { Sa1Layout } from "@/components/sa1-layout";

export default function Page() {
  return <><DashboardHeader eyebrow="1º Bachillerato · SA1" title="Cuestionarios psicológicos" description="Completa las escalas GOES y BPNES al inicio y al final de la situación de aprendizaje."/><Sa1Layout><PsychologicalQuestionnaires courseYear={1}/></Sa1Layout></>;
}
