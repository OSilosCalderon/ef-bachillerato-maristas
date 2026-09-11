import { DashboardHeader } from "@/components/dashboard-header";
import { Sa2Layout } from "@/components/sa2-layout";
import { SportsTheoryLibrary } from "@/components/sports-theory-library";

export default function Page() {
  return <><DashboardHeader eyebrow="SA2 · Biblioteca" title="Contenidos teóricos" description="Materiales asociados a SA2, deportes concretos y contenidos específicos."/><Sa2Layout><SportsTheoryLibrary/></Sa2Layout></>;
}
