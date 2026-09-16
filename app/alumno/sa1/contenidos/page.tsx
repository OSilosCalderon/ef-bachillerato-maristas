import { DashboardHeader } from "@/components/dashboard-header";
import { Sa1Layout } from "@/components/sa1-layout";
import { TheoryLibrary } from "@/components/theory-library";
import { TrainingTheoryLibrary } from "@/components/training-theory-library";

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="SA1 · Biblioteca" title="Contenidos teóricos" description="Materiales publicados para consultar a tu ritmo." />
      <Sa1Layout>
        <TrainingTheoryLibrary />
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold">Materiales del profesorado</h2>
          <TheoryLibrary />
        </section>
      </Sa1Layout>
    </>
  );
}
