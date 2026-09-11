import { DashboardHeader } from "@/components/dashboard-header";
import { ContentManager } from "@/components/content-manager";
export default function Page() {
  return <><DashboardHeader eyebrow="Gestión central" title="Contenidos" description="Crea, edita, publica y organiza contenidos de SA1, SA2 y SA3 desde un único lugar."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><ContentManager/></div></>;
}
