import Link from "next/link";
import { Eye, LockKeyhole, ArrowRight, BookOpen, CalendarDays, Gauge } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { learningSituations } from "@/lib/demo-data";
import { secondYearLearningSituations } from "@/lib/second-year-data";

export default async function TeacherStudentPreview({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const year = (await searchParams).curso === "2" ? 2 : 1;
  const supabase = await createClient();
  const { data: courses } = await supabase.from("courses").select("id").eq("bachillerato_year", year).eq("is_active", true);
  const ids = (courses ?? []).map((course) => String(course.id));
  const { data: rows } = ids.length ? await supabase.from("learning_situations").select("code,title,published").in("course_id", ids).order("code") : { data: [] };
  const published = new Set((rows ?? []).filter((row) => row.published).map((row) => String(row.code)));
  const situations = year === 2
    ? secondYearLearningSituations.map((item) => ({ code: item.code, title: item.title, description: item.period, href: item.href }))
    : learningSituations.map((item) => ({ code: item.code, title: item.name, description: item.description, href: item.href }));

  return <>
    <DashboardHeader eyebrow="Vista previa docente" title={`Así ve el curso el alumnado de ${year}º`} description="Revisa la navegación, los contenidos publicados y la presentación del progreso sin utilizar una cuenta de alumno."/>
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <section className="modern-panel border-[#b8f34a]/50 bg-[#efffd5] p-5 sm:p-6">
        <div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 shrink-0 text-[#0f766e]"/><div><h2 className="font-black text-slate-950">Modo de observación</h2><p className="mt-1 text-sm leading-6 text-slate-700">Esta vista es de solo lectura. No crea entregas, marcas, lecturas, intentos de test ni registros de actividad, y por tanto no entra en ninguna estadística individual o grupal.</p></div></div>
      </section>
      <nav className="flex flex-wrap gap-3" aria-label="Curso de la vista previa">
        {[1, 2].map((item) => <Link key={item} href={`/profesor/vista-alumno?curso=${item}`} className={`rounded-full px-5 py-3 text-sm font-black ${year === item ? "bg-[#071f1c] text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{item}º Bachillerato</Link>)}
      </nav>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#0f766e]">Pantalla de inicio</p><h2 className="mt-1 text-3xl font-black tracking-tight">Situaciones visibles</h2></div><span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600">{published.size} activadas</span></div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{situations.map((item) => {
          const available = published.has(item.code);
          return <article key={item.code} className={`modern-panel flex min-h-64 flex-col p-6 ${available ? "" : "opacity-55"}`}><div className="flex items-center justify-between"><span className="rounded-full bg-[#dff8ed] px-3 py-1 text-xs font-black text-[#0f766e]">{item.code}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${available ? "bg-[#efffd5] text-[#41650d]" : "bg-slate-100 text-slate-500"}`}>{available ? "Visible" : "Oculta"}</span></div><h3 className="mt-5 text-xl font-black leading-tight">{item.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.description}</p><div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-500"><span className="rounded-xl bg-slate-50 p-2"><BookOpen className="mx-auto mb-1" size={16}/>Contenidos</span><span className="rounded-xl bg-slate-50 p-2"><CalendarDays className="mx-auto mb-1" size={16}/>Tareas</span><span className="rounded-xl bg-slate-50 p-2"><Gauge className="mx-auto mb-1" size={16}/>Progreso</span></div><div className="mt-4 flex items-center justify-between text-sm font-bold text-[#0f766e]"><span>{available ? "Disponible para el alumnado" : "No publicada"}</span><Eye size={18}/></div></article>;
        })}</div>
      </section>
      <section className="hero-surface rounded-[2rem] p-6 sm:p-8"><p className="accent-kicker text-xs font-black uppercase tracking-[.18em]">Comprobación segura</p><h2 className="mt-2 text-2xl font-black">¿Quieres cambiar lo que está visible?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/75">Activa o desactiva situaciones desde el control docente. Los datos que ya haya guardado el alumnado se conservan.</p><Link href="/profesor/situaciones" className="accent-button mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black">Gestionar situaciones <ArrowRight size={17}/></Link></section>
    </div>
  </>;
}

