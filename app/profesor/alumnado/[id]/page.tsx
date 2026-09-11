import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, BookOpen, Dumbbell, HeartPulse, Sparkles } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { studentCourseDetail } from "@/lib/teacher-dashboard-data";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = studentCourseDetail.find((item) => item.id === id);
  if (!found) return notFound();
  const student = found;

  return <>
    <DashboardHeader eyebrow="Ficha individual" title={student.name} description={`${student.group} · seguimiento privado del curso`}/>
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <section className="card p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Progreso general</p><p className="mt-1 text-4xl font-extrabold">{student.progress}%</p></div><Link href="/profesor/alumnado" className="text-sm font-bold text-[#1e6b4f]">← Volver al alumnado</Link></div><div className="mt-5"><ProgressBar value={student.progress}/></div></section>
      <section className="grid gap-5 xl:grid-cols-3">
        <Card title="SA1 · Salud" icon={HeartPulse} rows={[["Evolución física",`${student.sa1.physical}%`],["Diarios",String(student.sa1.journals)],["Cuestionarios",String(student.sa1.questionnaires)],["Contenidos consultados",String(student.sa1.contents)]]}/>
        <Card title="SA2 · Deportes" icon={Dumbbell} rows={[["Evolución técnica",`${student.sa2.technical}%`],["Deportes",String(student.sa2.sports)],["Diarios",String(student.sa2.journals)],["Cuestionarios",String(student.sa2.questionnaires)],["Conocimiento procedimental",String(student.sa2.procedural)],["Toma de decisiones",String(student.sa2.decisions)]]}/>
        <Card title="SA3 · Ocio activo" icon={Sparkles} rows={[["Sesiones creadas",String(student.sa3.sessions)],["Valoraciones de juegos",String(student.sa3.ratings)],["Contenidos",String(student.sa3.contents)],["Autoevaluación de actitud",String(student.sa3.attitude)]]}/>
      </section>
      <section className="card p-6">
        <div className="flex items-center gap-3"><Activity className="text-[#1e6b4f]"/><div><h2 className="text-lg font-extrabold">Cronología del curso</h2><p className="text-sm text-slate-500">Hitos principales del alumno durante las tres situaciones de aprendizaje.</p></div></div>
        <ol className="mt-6 space-y-5 border-l-2 border-slate-200 pl-6">
          {student.timeline.map((item)=><li key={`${item.period}-${item.title}`} className="relative"><span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#1e6b4f]"/><p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">{item.period}</p><div className="mt-1 flex flex-wrap items-center justify-between gap-2"><p className="font-bold">{item.title}</p><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.status}</span></div></li>)}
        </ol>
      </section>
    </div>
  </>;
}
function Card({ title, icon: Icon, rows }: { title: string; icon: typeof BookOpen; rows: [string,string][] }) {
  return <article className="card p-6"><Icon className="text-[#1e6b4f]"/><h2 className="mt-4 text-lg font-extrabold">{title}</h2><dl className="mt-5 space-y-3">{rows.map(([label,value])=><div key={label} className="flex justify-between gap-4 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl></article>
}
