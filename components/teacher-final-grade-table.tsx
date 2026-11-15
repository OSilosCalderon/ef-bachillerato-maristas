import { ChevronDown } from "lucide-react";
import { formatGrade, type AssessmentGradeItem, type GradebookStudent, type PublishedAssessmentGrade } from "@/lib/gradebook";
import { secondYearFinalGradeBlocks, secondYearFinalGrades } from "@/lib/second-year-final-grades";

const formatAverage = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

export function TeacherFinalGradeTable({ students, items, grades }: {
  students: GradebookStudent[];
  items: AssessmentGradeItem[];
  grades: ReadonlyMap<string, PublishedAssessmentGrade>;
}) {
  const rows = secondYearFinalGrades(students, items, grades);

  return <section className="card min-w-0 overflow-hidden" aria-labelledby="final-grade-heading">
    <div className="border-b border-slate-200 p-4 sm:p-5">
      <h2 id="final-grade-heading" className="text-xl font-extrabold text-slate-950">Notas finales por bloques</h2>
      <p id="final-grade-help" className="mt-2 text-sm leading-6 text-slate-600">
        La media aparece cuando están publicadas todas las notas del bloque. Abre una casilla para ver el detalle.
        El cuestionario de SA2 queda fuera del cálculo.
      </p>
    </div>
    {rows.length > 0 ? (
      <div role="region" aria-label="Tabla de notas finales" aria-describedby="final-grade-help" tabIndex={0}
        className="max-h-[65vh] overflow-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700">
        <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50 text-slate-950">
            <tr>
              <th scope="col" className="sticky left-0 z-10 min-w-36 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 sm:w-52">Alumno/a</th>
              {secondYearFinalGradeBlocks.map(({ title, description }) => <th key={title} scope="col" className="w-1/4 border-b border-r border-slate-200 px-3 py-3 align-top last:border-r-0">
                <span className="block font-extrabold">{title}</span>
                <span className="mt-0.5 block text-xs font-normal leading-4 text-slate-600">{description}</span>
              </th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ student, blocks }) => <tr key={student.id} className="group bg-white even:bg-slate-50/80">
              <th scope="row" className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2 align-top group-even:bg-slate-50">
                <span className="block max-w-40 break-words font-bold text-slate-950 sm:max-w-52">{student.name}</span>
                <span className="block text-xs font-normal text-slate-600">{student.group}</span>
              </th>
              {blocks.map(({ title, score, published, marks }) => <td key={title} className="border-b border-r border-slate-100 px-3 py-2 align-top last:border-r-0">
                <details className="group/block">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 [&::-webkit-details-marker]:hidden">
                    {score === null ? <span className="text-sm font-semibold text-amber-800">Pendiente <span className="block text-xs font-normal">{published} de {marks.length} publicadas</span></span>
                      : <span className="text-lg font-extrabold tabular-nums text-[#164c3a]">{formatAverage.format(score)}<span className="text-xs font-normal text-slate-600"> / 10</span></span>}
                    <ChevronDown aria-hidden="true" size={16} className="shrink-0 text-slate-500 group-open/block:rotate-180"/>
                  </summary>
                  <dl className="mt-1 space-y-2 border-t border-slate-200 px-1 py-2">
                    {marks.map(({ label, score, weight }) => <div key={label} className="flex items-start justify-between gap-2 text-xs">
                      <dt className="text-slate-600">{label}{weight !== undefined && <span className="block font-semibold text-slate-700">{weight} %</span>}</dt>
                      <dd className="shrink-0 font-bold tabular-nums text-slate-900">{score === null ? "Pendiente" : formatGrade(score)}</dd>
                    </div>)}
                  </dl>
                </details>
              </td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    ) : <p className="p-5 text-sm text-slate-600">No hay alumnado en el grupo seleccionado.</p>}
  </section>;
}
