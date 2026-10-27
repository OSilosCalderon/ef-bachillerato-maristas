import { olympiadChoiceLabel, type OlympiadStudentRow } from "@/lib/olympiad-lisboa";
import { summarizeOlympiadParticipation } from "@/lib/olympiad-participation-summary";

export function TeacherOlympiadSummary({ students }: { students: OlympiadStudentRow[] }) {
  const summary = summarizeOlympiadParticipation(students);
  return <div className="mt-6 space-y-5">
    <section aria-labelledby="olympiad-sport-summary" className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
      <h3 id="olympiad-sport-summary" className="text-lg font-extrabold text-emerald-950">Sí desean participar · Por deportes</h3>
      <p className="mt-2 text-xs leading-5 text-slate-600">{summary.accepted.length} alumnos/as. Despliega cada deporte para consultar nombres, grupo y prueba en primera o segunda opción. Las preferencias no son una asignación definitiva.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{summary.sports.map((sport) => <details key={sport.sport} className="min-w-0 rounded-xl border border-emerald-100 bg-white p-4">
        <summary className="cursor-pointer"><span className="text-sm font-extrabold text-slate-900">{sport.sport}</span><span className="ml-2 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">{sport.interested} interesados</span><span className="mt-2 block text-xs text-slate-500">1ª opción: {sport.first.length} · 2ª opción: {sport.second.length}</span></summary>
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-3">{[{label:"Primera opción",students:sport.first,field:"first_choice" as const},{label:"Segunda opción",students:sport.second,field:"second_choice" as const}].map((option) => <div key={option.label}><h4 className="text-xs font-extrabold uppercase text-[#1e6b4f]">{option.label} · {option.students.length}</h4>{option.students.length ? <ul className="mt-2 space-y-2">{option.students.map((student) => <li key={student.id} className="min-w-0 text-xs leading-5"><p className="break-words font-bold text-slate-800">{student.name}</p><p className="text-slate-500">{student.group} · {olympiadChoiceLabel(student.response?.[option.field] ?? null)}</p></li>)}</ul> : <p className="mt-2 text-xs text-slate-500">Sin solicitudes en esta opción.</p>}</div>)}</div>
      </details>)}</div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Cada alumno cuenta una vez como interesado en un deporte, aunque elija dos pruebas de ese mismo deporte.</p>
    </section>
    <section aria-labelledby="olympiad-declined-summary" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 id="olympiad-declined-summary" className="text-lg font-extrabold">No desean participar · {summary.declined.length}</h3>
      {summary.declined.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{summary.declined.map((student) => <li key={student.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><p className="font-bold">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.group}</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">Todavía no hay respuestas de no participación en este grupo.</p>}
      <p className="mt-3 text-xs leading-5 text-slate-500">Aquí solo aparece quien ha respondido «No». El alumnado sin respuesta figura aparte como «Sin responder».</p>
    </section>
  </div>;
}
