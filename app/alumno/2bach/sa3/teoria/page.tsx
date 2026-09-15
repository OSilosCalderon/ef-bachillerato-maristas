import { DashboardHeader } from "@/components/dashboard-header";
import { SecondYearTheoryReader } from "@/components/second-year-theory-reader";

export default function Page() {
  return <><DashboardHeader eyebrow="2º Bachillerato · SA3 · Teoría" title="Más que entrenar" description="Relaciona sueño, movimiento, hidratación, alimentación, recuperación y organización diaria."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><SecondYearTheoryReader initialSlug="2bach-sa3-habitos-saludables" compactHeader/></div></>;
}
