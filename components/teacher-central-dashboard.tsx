"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, BookOpenCheck, CheckCircle2, Clock3, FileText, NotebookPen, TrendingUp, Users } from "lucide-react";
import { CourseEvolutionChart } from "@/components/course-evolution-chart";
import { academicYear, courseEvolution, courseKpis, groups, studentCourseDetail } from "@/lib/teacher-dashboard-data";

export function TeacherCentralDashboard() {
  const [group, setGroup] = useState<(typeof groups)[number]>("1º Bach A");
  const groupStudents = useMemo(() => studentCourseDetail.filter((s) => s.group === group), [group]);
  const [studentId, setStudentId] = useState(groupStudents[0]?.id ?? "");
  const [sa, setSa] = useState("Todas");
  const selected = groupStudents.find((s) => s.id === studentId) ?? groupStudents[0];

  const changeGroup = (value: string) => {
    const next = value as (typeof groups)[number];
    setGroup(next);
    setStudentId(studentCourseDetail.find((s) => s.group === next)?.id ?? "");
  };

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-slate-950 px-6 py-7 text-white sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Maristas Badajoz</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><h1 className="text-3xl font-black sm:text-4xl">EF 1º Bachillerato</h1><p className="mt-2 text-sm text-slate-300">Dashboard docente central · curso {academicYear}</p></div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-sm"><span className="text-slate-400">Grupo seleccionado</span><strong className="ml-2">{group}</strong></div>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
          <Select id="central-group" label="Grupo" value={group} onChange={changeGroup}>{groups.map((g)=><option key={g}>{g}</option>)}</Select>
          <Select id="central-student" label="Alumno/a" value={selected?.id ?? ""} onChange={setStudentId}>{groupStudents.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}</Select>
          <Select id="central-sa" label="Situación de aprendizaje" value={sa} onChange={setSa}><option>Todas</option><option>SA1</option><option>SA2</option><option>SA3</option></Select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi icon={Users} label="Alumnos" value={String(groupStudents.length)} note={group}/>
        <Kpi icon={Activity} label="Participación" value={`${courseKpis.participation}%`} note="Actividad registrada"/>
        <Kpi icon={CheckCircle2} label="Tareas realizadas" value={String(courseKpis.tasksDone)} note="Acumulado del curso"/>
        <Kpi icon={Clock3} label="Tareas pendientes" value={String(courseKpis.tasksPending)} note="Pendientes actuales"/>
        <Kpi icon={TrendingUp} label="Progreso medio" value={`${courseKpis.averageProgress}%`} note="Agregado del grupo"/>
        <Kpi icon={NotebookPen} label="Diarios completados" value={String(courseKpis.journalsCompleted)} note="SA1 + SA2"/>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <article className="card p-6">
          <h2 className="text-lg font-extrabold">Evolución del curso</h2>
          <p className="mt-1 text-sm text-slate-500">Visualización agregada del grupo. No contiene rankings ni comparaciones públicas.</p>
          <CourseEvolutionChart data={courseEvolution}/>
        </article>
        <article className="card p-6">
          <h2 className="text-lg font-extrabold">Línea temporal</h2>
          <ol className="mt-5 space-y-4">
            {courseEvolution.map((item)=><li key={item.label} className="relative border-l-2 border-slate-200 pl-5"><span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#1e6b4f]"/><p className="text-xs font-extrabold uppercase tracking-wide text-[#1e6b4f]">{item.month}</p><p className="mt-1 text-sm font-bold">{item.detail}</p></li>)}
          </ol>
        </article>
      </section>

      {selected && <StudentSnapshot student={selected} sa={sa}/>}
    </div>
  );
}

function StudentSnapshot({ student, sa }: { student: (typeof studentCourseDetail)[number]; sa: string }) {
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Ficha individual</p><h2 className="mt-1 text-2xl font-extrabold">{student.name}</h2><p className="mt-1 text-sm text-slate-500">{student.group} · {student.progress}% de progreso general</p></div>
        <Link href={`/profesor/alumnado/${student.id}`} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Abrir ficha completa</Link>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {(sa === "Todas" || sa === "SA1") && <SummaryCard title="SA1 · Salud" icon={BookOpenCheck} rows={[["Evolución física",`${student.sa1.physical}%`],["Diarios",String(student.sa1.journals)],["Cuestionarios",String(student.sa1.questionnaires)],["Contenidos",String(student.sa1.contents)]]}/>}
        {(sa === "Todas" || sa === "SA2") && <SummaryCard title="SA2 · Deportes" icon={Activity} rows={[["Evolución técnica",`${student.sa2.technical}%`],["Deportes",String(student.sa2.sports)],["Diarios",String(student.sa2.journals)],["Decisiones",String(student.sa2.decisions)]]}/>}
        {(sa === "Todas" || sa === "SA3") && <SummaryCard title="SA3 · Ocio activo" icon={FileText} rows={[["Sesiones",String(student.sa3.sessions)],["Valoraciones",String(student.sa3.ratings)],["Contenidos",String(student.sa3.contents)],["Autoevaluaciones",String(student.sa3.attitude)]]}/>}
      </div>
    </section>
  );
}

function SummaryCard({ title, icon: Icon, rows }: { title: string; icon: typeof Activity; rows: [string,string][] }) {
  return <article className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center gap-2"><Icon size={18} className="text-[#1e6b4f]"/><h3 className="font-extrabold">{title}</h3></div><dl className="mt-4 space-y-2">{rows.map(([label,value])=><div key={label} className="flex justify-between gap-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="font-bold">{value}</dd></div>)}</dl></article>
}
function Kpi({ icon: Icon, label, value, note }: { icon: typeof Users; label: string; value: string; note: string }) {
  return <article className="card p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon size={18} className="text-[#1e6b4f]"/></div><p className="mt-3 text-3xl font-extrabold">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>
}
function Select({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (value:string)=>void; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label><select id={id} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold focus:border-[#1e6b4f] focus:outline-none focus:ring-2 focus:ring-[#1e6b4f]/15">{children}</select></div>
}
