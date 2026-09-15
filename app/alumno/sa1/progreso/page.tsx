import { DashboardHeader } from "@/components/dashboard-header";
import { Sa1Layout } from "@/components/sa1-layout";
import { PhysicalProgressSummary } from "@/components/physical-progress-summary";
import { TheoryProgressSummary } from "@/components/theory-progress-summary";

export default function Page() {
  return <>
    <DashboardHeader eyebrow="SA1 · Mi progreso" title="Mi progreso" description="Consulta tus marcas de condición física y el progreso real de la biblioteca teórica de 1º." />
    <Sa1Layout>
      <section className="card min-w-0 p-5 sm:p-6"><PhysicalProgressSummary /></section>
      <TheoryProgressSummary courseYear={1} />
    </Sa1Layout>
  </>;
}
