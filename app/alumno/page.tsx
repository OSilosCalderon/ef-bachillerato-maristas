import Link from "next/link";
import { BookOpen, CheckCircle2, Clock3, Flame, GraduationCap, NotebookPen, Sparkles } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { LearningSituationCard } from "@/components/learning-situation-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ClassScheduleCard } from "@/components/class-schedule-card";
import { learningSituations } from "@/lib/demo-data";
import { weeklyItems } from "@/lib/teacher-dashboard-data";
import { getCurrentStudentCourse } from "@/lib/student-course";

export default async function StudentDashboard() {
  const course = await getCurrentStudentCourse();

  if (course.bachilleratoYear === 2) {
    return <>
      <DashboardHeader eyebrow="Maristas Badajoz" title="EF de 2º Bachillerato" description="Analiza, planifica, aplica y justifica tu entrenamiento"/>
      <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
        <section className="card overflow-hidden">
          <div className="bg-slate-950 p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Curso 2026/2027</p><h2 className="mt-2 text-2xl font-extrabold">2º de Bachillerato ya tiene acceso propio</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Las situaciones de aprendizaje y bloques específicos de 2º se incorporarán cuando definamos su programación. La biblioteca teórica de entrenamiento es común a ambos cursos.</p></div>
          <div className="p-6"><Link href="/alumno/apuntes-entrenamiento" className="inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white"><GraduationCap size={18}/>Abrir los 9 temas interactivos</Link></div>
        </section>
        <section><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Próximamente</p><h2 className="mt-1 text-2xl font-extrabold">Situaciones de aprendizaje de 2º</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{["Bloque / SA 1", "Bloque / SA 2", "Bloque / SA 3"].map((title) => <article key={title} className="card border-dashed p-6"><Sparkles className="text-slate-300"/><h3 className="mt-4 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">Pendiente de definir contigo para respetar la programación real de 2º.</p></article>)}</div></section>
      </div>
    </>;
  }

  return <>
    <DashboardHeader eyebrow="Maristas Badajoz" title="EF de 1º Bachillerato" description="Aprende, practica, analiza y mejora"/>
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      <ClassScheduleCard/>

      <section>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Mi curso</p>
        <h2 className="mt-1 text-2xl font-extrabold">Tu progreso en las tres situaciones de aprendizaje</h2>
        <div className="mt-5 grid gap-5 xl:grid-cols-3">{learningSituations.map((sa)=><LearningSituationCard key={sa.id} situation={sa}/>)}</div>
      </section>

      <section className="card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Biblioteca común de Bachillerato</p><h2 className="mt-1 text-xl font-extrabold">9 temas interactivos de entrenamiento</h2><p className="mt-2 text-sm text-slate-500">Principios, carga, fuerza y contracciones, resistencia, velocidad, flexibilidad, planificación y periodización.</p></div><Link href="/alumno/apuntes-entrenamiento" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><GraduationCap size={18}/>Estudiar temas</Link></section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card p-5"><CheckCircle2 className="text-[#1e6b4f]" size={20}/><p className="mt-4 text-sm text-slate-500">Curso completado</p><p className="mt-1 text-3xl font-extrabold">42%</p><div className="mt-4"><ProgressBar value={42} compact/></div></article>
        <article className="card p-5"><Flame className="text-[#1e6b4f]" size={20}/><p className="mt-4 text-sm text-slate-500">Racha de diario</p><p className="mt-1 text-3xl font-extrabold">3 sesiones</p><p className="mt-1 text-xs text-slate-400">Buen ritmo de reflexión personal</p></article>
        <article className="card p-5"><Sparkles className="text-[#1e6b4f]" size={20}/><p className="mt-4 text-sm text-slate-500">Módulos finalizados</p><p className="mt-1 text-3xl font-extrabold">5</p><p className="mt-1 text-xs text-slate-400">Continúa avanzando a tu ritmo</p></article>
      </section>

      <section>
        <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Esta semana</p><h2 className="mt-1 text-2xl font-extrabold">Lo que tienes por delante</h2></div>
        <div className="grid gap-3 md:grid-cols-2">
          {weeklyItems.map((item)=><article key={item.id} className="card flex items-start gap-4 p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e7f2ed] text-[#1e6b4f]">{item.type.includes("Diario")?<NotebookPen size={18}/>:item.type.includes("Contenido")?<BookOpen size={18}/>:<Clock3 size={18}/>}</span><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.type} · {item.situation}</p><h3 className="mt-1 font-bold">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.date}</p></div></article>)}
        </div>
      </section>
    </div>
  </>;
}
