"use client";

import { useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import { publishAssessmentScores } from "@/app/profesor/calificaciones/actions";
import {
  assessmentGradeKey, compareAssessmentItems, displayAssessmentItem, formatGrade, isRetiredDiaryItem,
  type AssessmentGradeItem, type GradebookStudent, type PublishedAssessmentGrade,
} from "@/lib/gradebook";
import { parseTeacherSessionScore } from "@/lib/teacher-session-grading";

export type GradeGridDrafts = Record<string, { studentId: string; itemId: string; text: string }>;

type Props = {
  students: GradebookStudent[];
  items: AssessmentGradeItem[];
  grades: ReadonlyMap<string, PublishedAssessmentGrade>;
  situation: string;
  drafts: GradeGridDrafts;
  setDrafts: Dispatch<SetStateAction<GradeGridDrafts>>;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  onPublished: (grades: PublishedAssessmentGrade[]) => void;
};

const cellInputId = (studentId: string, itemId: string) => `grade-grid-${studentId}-${itemId}`;
const secondary = "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50";

export function TeacherGradeGrid({ students, items, grades, situation, drafts, setDrafts, saving, setSaving, onPublished }: Props) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const studentIds = new Set(students.map((student) => student.id));
  const courseIds = new Set(students.map((student) => student.courseId));
  const gradedItemIds = new Set([...grades.values()].filter((grade) => studentIds.has(grade.student_id)).map((grade) => grade.item_id));
  const columns = items.filter((item) =>
    courseIds.has(item.course_id) && (!situation || item.sa_code === situation) &&
    (!isRetiredDiaryItem(item) || gradedItemIds.has(item.id)))
    .sort(compareAssessmentItems)
    .map(displayAssessmentItem);
  const columnIds = new Set(columns.map((item) => item.id));
  const pending = Object.values(drafts).map(({ studentId, itemId, text }) => ({
    studentId, itemId, score: parseTeacherSessionScore(text),
  }));
  const invalidCount = pending.filter((change) => change.score === null).length;
  const outsideFilter = pending.filter(({ studentId, itemId }) => !studentIds.has(studentId) || !columnIds.has(itemId)).length;

  function changeScore(studentId: string, itemId: string, text: string, published: number | undefined) {
    const key = assessmentGradeKey(studentId, itemId);
    const sameScore = published === undefined ? text.trim() === "" : parseTeacherSessionScore(text) === published;
    setDrafts((current) => {
      const next = { ...current };
      if (sameScore) delete next[key];
      else next[key] = { studentId, itemId, text };
      return next;
    });
    setStatus("");
    setError("");
  }

  function moveToStudent(event: KeyboardEvent<HTMLInputElement>, rowIndex: number, itemId: string) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (event.currentTarget.getAttribute("aria-invalid") === "true") return;
    const step = event.shiftKey ? -1 : 1;
    for (let index = rowIndex + step; index >= 0 && index < students.length; index += step) {
      const next = document.getElementById(cellInputId(students[index].id, itemId));
      if (next instanceof HTMLInputElement) {
        next.focus();
        next.select();
        return;
      }
    }
  }

  async function publish() {
    if (saving || !pending.length || invalidCount) return;
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const scores = pending.flatMap(({ studentId, itemId, score }) => score === null ? [] : [{ studentId, itemId, score }]);
      const result = await publishAssessmentScores(scores);
      if (result.grades.length) {
        onPublished(result.grades);
        setDrafts((current) => {
          const next = { ...current };
          for (const grade of result.grades) delete next[assessmentGradeKey(grade.student_id, grade.item_id)];
          return next;
        });
        setStatus(result.grades.length === 1 ? "1 calificación publicada." : `${result.grades.length} calificaciones publicadas.`);
      }
      setError(result.error ?? "");
    } catch {
      setError("No se han podido confirmar las notas. Vuelve a publicar las pendientes.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="card min-w-0 overflow-hidden" aria-label="Cuaderno de notas">
    <div className="space-y-3 border-b border-slate-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-950">{students.length} {students.length === 1 ? "alumno" : "alumnos"} · {columns.length} {columns.length === 1 ? "instrumento" : "instrumentos"}</p>
          <p id="grade-grid-help" className="mt-1 text-xs leading-5 text-slate-600">Notas de 0 a 10. Tabulador avanza de columna e Intro baja una fila. El alumnado verá las notas al publicarlas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pending.length > 0 && <button type="button" className={secondary} disabled={saving} onClick={() => { setDrafts({}); setStatus(""); setError(""); }}>Descartar cambios</button>}
          <button type="button" disabled={!pending.length || invalidCount > 0 || saving}
            onClick={() => void publish()} className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Publicando…" : pending.length === 1 ? "Publicar 1 nota" : pending.length ? `Publicar ${pending.length} notas` : "Publicar cambios"}
          </button>
        </div>
      </div>
      {pending.length > 0 && <p className="text-xs font-semibold text-amber-800" role="status">
        {pending.length === 1 ? "1 cambio pendiente" : `${pending.length} cambios pendientes`}{outsideFilter > 0 && ` · ${outsideFilter} fuera del filtro`}
      </p>}
      {invalidCount > 0 && <p className="text-sm text-rose-800" role="alert">Revisa las casillas marcadas. Introduce una nota entre 0 y 10 con hasta una décima.</p>}
      {status && <p className="text-sm font-semibold text-emerald-800" role="status">{status}</p>}
      {error && <p className="text-sm font-semibold text-rose-800" role="alert">{error}</p>}
    </div>
    {students.length > 0 && columns.length > 0 ? (
      <div className="max-h-[65vh] overflow-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700"
        role="region" aria-label="Tabla de calificaciones" aria-describedby="grade-grid-help" tabIndex={0} aria-busy={saving}>
        <table className="w-full min-w-max border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-20 bg-slate-50 text-slate-800">
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-40 min-w-36 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 text-left sm:w-52">Alumno/a</th>
              {columns.map((item) => <th key={item.id} scope="col" className="w-36 min-w-32 border-b border-r border-slate-200 px-3 py-2 text-left align-top">
                <span className="block text-xs font-bold text-[#1e6b4f]">{item.sa_code}</span>
                <span className="mt-0.5 block max-w-40 break-words leading-5">{item.title}</span>
              </th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((student, rowIndex) => <tr key={student.id} className="group bg-white even:bg-slate-50/80">
              <th scope="row" className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2 text-left align-middle group-even:bg-slate-50">
                <span className="block max-w-32 break-words font-bold text-slate-950 sm:max-w-48">{student.name}</span>
                <span className="block text-xs font-normal text-slate-600">{student.group}</span>
              </th>
              {columns.map((item) => {
                const key = assessmentGradeKey(student.id, item.id);
                const grade = grades.get(key);
                const draft = drafts[key];
                const invalid = Boolean(draft && parseTeacherSessionScore(draft.text) === null);
                const editable = student.courseId === item.course_id && (!isRetiredDiaryItem(item) || Boolean(grade));
                return <td key={item.id} className="border-b border-r border-slate-100 px-3 py-1.5 text-center">
                  {editable ? <input id={cellInputId(student.id, item.id)} type="text" inputMode="decimal" maxLength={4}
                    aria-label={`${student.name} · ${item.sa_code} · ${item.title}`} aria-invalid={invalid || undefined}
                    value={draft?.text ?? (grade ? formatGrade(grade.score) : "")} readOnly={saving}
                    onChange={(event) => changeScore(student.id, item.id, event.target.value, grade?.score)}
                    onKeyDown={(event) => moveToStudent(event, rowIndex, item.id)}
                    placeholder="—"
                    className={`h-10 w-[4.5rem] rounded-lg border px-2 text-center font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-700 ${invalid
                      ? "border-rose-400 bg-rose-50 text-rose-900"
                      : draft ? "border-amber-400 bg-amber-50 text-amber-950"
                      : grade ? "border-emerald-200 bg-emerald-50/60 text-[#164c3a]"
                      : "border-slate-200 bg-white text-slate-900"}`}/>
                    : <span className="text-slate-400" aria-label="Casilla sin instrumento aplicable">—</span>}
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    ) : <p className="p-5 text-sm text-slate-600">{students.length ? "No hay instrumentos para este filtro." : "No hay alumnado para este filtro."}</p>}
  </section>;
}
