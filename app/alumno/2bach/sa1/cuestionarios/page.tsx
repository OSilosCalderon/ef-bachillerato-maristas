import { DashboardHeader } from "@/components/dashboard-header";
import { PsychologicalQuestionnaires } from "@/components/psychological-questionnaires";
import { SecondYearSa1Layout } from "@/components/second-year-sa1-layout";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA1" title="Cuestionarios psicológicos" description="Completa las escalas GOES y BPNES al inicio y al final de la situación de aprendizaje."/><SecondYearSa1Layout><PsychologicalQuestionnaires courseYear={2}/></SecondYearSa1Layout></>;
}
