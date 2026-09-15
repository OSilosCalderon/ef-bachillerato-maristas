import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA2 · Teoría" title="Entrenar con cabeza" description="Comprende la carga, la recuperación y la progresión para construir tu condición física."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><SecondYearTheoryReader initialSlug="2bach-sa2-condicion-fisica" compactHeader/></div></>;
}
