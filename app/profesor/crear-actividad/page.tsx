import { DashboardHeader } from "@/components/dashboard-header";
import { ActivityCreator } from "@/components/activity-creator";
export default function Page(){return <><DashboardHeader eyebrow="Gestión central" title="Crear actividad" description="Constructor flexible para pruebas, cuestionarios, autoevaluaciones, valoraciones y actividades personalizadas."/><div className="mx-auto max-w-7xl p-5 sm:p-8"><ActivityCreator/></div></>}
