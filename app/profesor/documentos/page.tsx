import { DashboardHeader } from "@/components/dashboard-header";
import { DocumentLibrary } from "@/components/content-manager";
export default function Page() {
  return <><DashboardHeader eyebrow="Gestión central" title="Biblioteca de documentos" description="Repositorio privado del curso preparado para Supabase Storage."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><DocumentLibrary/></div></>;
}
