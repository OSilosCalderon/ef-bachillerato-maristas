import { DashboardHeader } from "@/components/dashboard-header";
import { Sa2Layout } from "@/components/sa2-layout";
import { SportsJournalPanel } from "@/components/sports-journal-panel";

export default function Page() {
  return <><DashboardHeader eyebrow="SA2 · Diario" title="Diario deportivo" description="Registra lo trabajado en cada sesión y reflexiona sobre tu propio proceso."/><Sa2Layout><SportsJournalPanel/></Sa2Layout></>;
}
