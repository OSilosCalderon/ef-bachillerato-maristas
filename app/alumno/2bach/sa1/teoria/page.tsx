import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA1 · Teoría" title="¿Cuál es mi punto de partida?" description="Evalúa, interpreta y diseña decisiones de entrenamiento a partir de tu punto de partida."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><SecondYearTheoryReader initialSlug="2bach-sa1-punto-partida" compactHeader/></div></>;
}
