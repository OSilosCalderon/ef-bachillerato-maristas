"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { olympiadChoiceLabel, olympiadGenderLabel, type OlympiadStudentRow } from "@/lib/olympiad-lisboa";

export function TeacherOlympiadResponses({ students }: { students: OlympiadStudentRow[] }) {
  const router = useRouter();
  const [group, setGroup] = useState("");
  const [status, setStatus] = useState("");
  const groups = [...new Set(students.map((student) => student.group))].sort();
  const cohort = students.filter((student) => !group || student.group === group);
  const yes = cohort.filter((student) => student.response?.participating === true).length;
  const no = cohort.filter((student) => student.response?.participating === false).length;
  const rows = cohort.filter((student) => !status || (status === "pending" ? !student.response : student.response?.participating === (status === "yes")));
  return <section aria-labelledby="olympiad-responses" className="card p-5 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wider text-[#1e6b4f]">Consulta privada · Profesorado</p><h2 id="olympiad-responses" className="mt-2 text-2xl font-extrabold">Participación de 1º Bachillerato</h2><p className="mt-2 text-sm text-slate-500">Respuestas y preferencias del alumnado de 1ºA y 1ºB.</p></div><button type="button" onClick={() => router.refresh()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold"><RefreshCw size={16} aria-hidden="true"/>Actualizar respuestas</button></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">{[{label:"Sí desean participar",value:yes,color:"bg-emerald-50 text-emerald-900"},{label:"No desean participar",value:no,color:"bg-slate-100 text-slate-700"},{label:"Sin responder",value:cohort.length-yes-no,color:"bg-amber-50 text-amber-900"}].map((item) => <div key={item.label} className={`rounded-2xl p-4 ${item.color}`}><p className="text-3xl font-extrabold">{item.value}</p><p className="mt-2 text-sm font-semibold">{item.label}</p></div>)}</div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Grupo<select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"><option value="">Todos los grupos de 1º</option>{groups.map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-sm font-bold">Respuesta<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"><option value="">Todas</option><option value="yes">Sí desean participar</option><option value="no">No desean participar</option><option value="pending">Sin responder</option></select></label></div>
    <p className="mt-4 text-xs font-semibold text-slate-500">{rows.length} alumnos/as en esta selección</p>
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><caption className="sr-only">Respuestas de participación en la Olimpiada Marista Lisboa 2027</caption><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Alumno/a","Grupo","Participación","Género","Primera opción","Segunda opción","Actualizada"].map((label) => <th key={label} scope="col" className="whitespace-nowrap p-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((student) => <tr key={student.id}><th scope="row" className="min-w-44 p-3 font-bold">{student.name}</th><td className="whitespace-nowrap p-3 text-slate-500">{student.group}</td><td className="p-3"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-bold ${!student.response ? "bg-amber-50 text-amber-800" : student.response.participating ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{!student.response ? "Sin responder" : student.response.participating ? "Sí" : "No"}</span></td><td className="p-3">{olympiadGenderLabel(student.response?.gender ?? null)}</td><td className="min-w-40 p-3">{olympiadChoiceLabel(student.response?.first_choice ?? null)}</td><td className="min-w-40 p-3">{olympiadChoiceLabel(student.response?.second_choice ?? null)}</td><td className="whitespace-nowrap p-3 text-xs text-slate-500">{student.response ? new Intl.DateTimeFormat("es-ES",{timeZone:"Europe/Madrid",dateStyle:"short",timeStyle:"short"}).format(new Date(student.response.updated_at)) : "—"}</td></tr>)}</tbody></table>{!rows.length && <p className="p-5 text-sm text-slate-500">No hay alumnado en esta selección.</p>}</div>
  </section>;
}
