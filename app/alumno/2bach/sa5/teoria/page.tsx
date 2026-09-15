import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA5 · Teoría" title="Extremadura se mueve" description="Explora cuerpo, espacio, tiempo, emoción y cultura como herramientas de expresión y creación."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><SecondYearTheoryReader initialSlug="2bach-sa5-cultura-cuerpo-expresion" compactHeader/></div></>;
}
