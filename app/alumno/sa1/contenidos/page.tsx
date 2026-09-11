import { DashboardHeader } from "@/components/dashboard-header";
import { Sa1Layout } from "@/components/sa1-layout";
import { TheoryLibrary } from "@/components/theory-library";

export default function Page() {
  return (
    <>
      <DashboardHeader eyebrow="SA1 · Biblioteca" title="Contenidos teóricos" description="Materiales publicados para consultar a tu ritmo." />
      <Sa1Layout>
        <TheoryLibrary />
      </Sa1Layout>
    </>
  );
}
