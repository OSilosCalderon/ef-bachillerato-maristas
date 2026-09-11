import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { students } from "@/lib/demo-data";

export default function StudentsPage() {
  return <>
    <DashboardHeader eyebrow="Profesorado" title="Alumnado" description="Seguimiento individual y grupal. Los datos mostrados en esta versión son ficticios."/>
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="grid gap-4 md:hidden">
        {students.map((s)=><article key={s.id} className="card p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{s.name}</p><p className="text-xs text-slate-500">{s.group} · última actividad {s.lastActivity}</p></div><Link href={`/profesor/alumnado/${s.id}`} className="text-sm font-bold text-[#1e6b4f]">Abrir</Link></div><div className="mt-4"><ProgressBar value={s.progress}/></div><p className="mt-2 text-xs text-slate-500">{s.progress}% · {s.pending} pendientes</p></article>)}
      </div>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500"><tr><th className="p-4">Alumno/a</th><th className="p-4">Grupo</th><th className="p-4">Progreso</th><th className="p-4">Pendientes</th><th className="p-4"><span className="sr-only">Acción</span></th></tr></thead><tbody>{students.map((s)=><tr key={s.id} className="border-t border-slate-100"><td className="p-4"><p className="font-semibold">{s.name}</p><p className="text-xs text-slate-500">Última actividad: {s.lastActivity}</p></td><td className="p-4">{s.group}</td><td className="p-4"><div className="max-w-44"><ProgressBar value={s.progress} compact/></div></td><td className="p-4 font-semibold">{s.pending}</td><td className="p-4"><Link href={`/profesor/alumnado/${s.id}`} className="font-bold text-[#1e6b4f]">Ficha completa</Link></td></tr>)}</tbody></table>
      </div>
    </div>
  </>;
}
