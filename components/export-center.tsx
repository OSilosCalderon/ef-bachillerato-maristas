"use client";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportTypes, studentCourseDetail } from "@/lib/teacher-dashboard-data";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"','""')}"`;
}
function downloadCsv(type: string, label: string) {
  const header = ["student_id","student_name","group","export_type","progress"];
  const rows = studentCourseDetail.map((student)=>[student.id, student.name, student.group, type, student.progress]);
  const csv = [header,...rows].map((row)=>row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=`ef-bachillerato-${type}.csv`; a.click(); URL.revokeObjectURL(url);
}
export function ExportCenter(){
 return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{exportTypes.map(([type,label])=><article key={type} className="card p-6"><FileSpreadsheet className="text-[#1e6b4f]"/><h2 className="mt-4 font-extrabold">{label}</h2><p className="mt-2 text-sm leading-6 text-slate-500">Exportación CSV preparada para filtros por grupo/alumno en la conexión definitiva con Supabase.</p><button onClick={()=>downloadCsv(type,label)} className="mt-5 flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><Download size={17}/>Exportar CSV demo</button></article>)}</section>
}
