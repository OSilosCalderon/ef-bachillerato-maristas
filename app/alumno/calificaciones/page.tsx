import { DashboardHeader } from "@/components/dashboard-header";
import { GradebookView } from "@/components/gradebook-view";
import { loadStudentGradebook } from "@/lib/gradebook-server";

export default async function Page() {
  const data = await loadStudentGradebook();
  return <>
    <DashboardHeader eyebrow={`${data.year}º Bachillerato`} title="Mis calificaciones" description="Consulta las notas y los comentarios que tu profesor ha publicado para ti."/>
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <section className="card flex flex-wrap items-center justify-between gap-3 p-5"><p className="text-sm text-slate-600">Las notas aparecen cuando el profesor las publica. Cada instrumento muestra su propia valoración.</p><a href="/alumno/calificaciones" className="rounded-xl border px-4 py-2 text-sm font-bold">Actualizar mis calificaciones</a></section>
      <GradebookView data={data}/>
    </div>
  </>;
}

