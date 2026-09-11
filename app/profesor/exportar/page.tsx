import { DashboardHeader } from "@/components/dashboard-header";
import { ExportCenter } from "@/components/export-center";
export default function Page(){return <><DashboardHeader eyebrow="Profesorado" title="Exportar datos" description="Genera archivos CSV para análisis docente y archivo interno del centro."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><ExportCenter/></div></>}
