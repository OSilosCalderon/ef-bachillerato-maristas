import { DashboardHeader } from "@/components/dashboard-header";
import { PhysicalProgressSummary } from "@/components/physical-progress-summary";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="Mi progreso"
        title="Evolución del curso"
        description="Consulta de forma visual cómo evoluciona tu condición física entre septiembre y diciembre."
      />
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <PhysicalProgressSummary />
      </div>
    </>
  );
}
