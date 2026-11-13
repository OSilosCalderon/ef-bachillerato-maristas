"use client";

import { useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import { assessmentGradeKey, formatGrade } from "@/lib/gradebook";
import { parseTeacherSessionScore } from "@/lib/teacher-session-grading";

type CellAddress = { studentId: string; columnId: string };
export type GradeGridChange = CellAddress & { score: number };
export type GradeGridDrafts = Record<string, CellAddress & { text: string }>;

type Props = {
  students: { id: string; name: string; group: string }[];
  columns: { id: string; title: string; detail?: string; date?: string }[];
  getCell: (studentId: string, columnId: string) => { score: number | null; absent?: boolean; unregistered?: boolean } | undefined;
  saveChanges: (changes: GradeGridChange[]) => Promise<{ confirmed: CellAddress[]; error: string | null }>;
  drafts: GradeGridDrafts;
  setDrafts: Dispatch<SetStateAction<GradeGridDrafts>>;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  sessionColumns?: boolean;
};

const cellInputId = (studentId: string, columnId: string) => `grade-grid-${studentId}-${columnId}`;
const secondary = "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50";

export function GradeGrid({ students, columns, getCell, saveChanges, drafts, setDrafts, saving, setSaving, sessionColumns = false }: Props) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const studentIds = new Set(students.map((student) => student.id));
  const columnIds = new Set(columns.map((column) => column.id));
  const pending = Object.values(drafts);
  const changes = pending.flatMap(({ studentId, columnId, text }) => {
    const score = parseTeacherSessionScore(text);
    return score === null ? [] : [{ studentId, columnId, score }];
  });
  const hasInvalidScore = changes.length !== pending.length;
  const outsideFilter = pending.filter(({ studentId, columnId }) => !studentIds.has(studentId) || !columnIds.has(columnId)).length;
  const columnLabel = sessionColumns ? (columns.length === 1 ? "sesión" : "sesiones") : (columns.length === 1 ? "instrumento" : "instrumentos");

  function changeScore(studentId: string, columnId: string, text: string, published: number | null) {
    const key = assessmentGradeKey(studentId, columnId);
    const sameScore = published === null ? text.trim() === "" : parseTeacherSessionScore(text) === published;
    setDrafts((current) => {
      const next = { ...current };
      if (sameScore) delete next[key];
      else next[key] = { studentId, columnId, text };
      return next;
    });
    setStatus("");
    setError("");
  }

  function moveToStudent(event: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnId: string) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (event.currentTarget.getAttribute("aria-invalid") === "true") return;
    const step = event.shiftKey ? -1 : 1;
    for (let index = rowIndex + step; index >= 0 && index < students.length; index += step) {
      const next = document.getElementById(cellInputId(students[index].id, columnId));
      if (next instanceof HTMLInputElement) {
        next.focus();
        next.select();
        return;
      }
    }
  }

  async function publish() {
    if (saving || !changes.length || hasInvalidScore) return;
    setSaving(true);
    setStatus("");
    setError("");
    try {
      const result = await saveChanges(changes);
      if (result.confirmed.length) {
        setDrafts((current) => {
          const next = { ...current };
          for (const { studentId, columnId } of result.confirmed) delete next[assessmentGradeKey(studentId, columnId)];
          return next;
        });
        setStatus(result.confirmed.length === 1 ? "1 calificación publicada." : `${result.confirmed.length} calificaciones publicadas.`);
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
          <p className="text-sm font-bold text-slate-950">{students.length} {students.length === 1 ? "alumno" : "alumnos"} · {columns.length} {columnLabel}</p>
          <p id="grade-grid-help" className="mt-1 text-xs leading-5 text-slate-600">Notas de 0 a 10. Tabulador avanza de columna e Intro baja una fila. El alumnado verá las notas al publicarlas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pending.length > 0 && <button type="button" className={secondary} disabled={saving} onClick={() => { setDrafts({}); setStatus(""); setError(""); }}>Descartar cambios</button>}
          <button type="button" disabled={!pending.length || hasInvalidScore || saving}
            onClick={() => void publish()} className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {saving ? "Publicando…" : pending.length === 1 ? "Publicar 1 nota" : pending.length ? `Publicar ${pending.length} notas` : "Publicar cambios"}
          </button>
        </div>
      </div>
      {pending.length > 0 && <p className="text-xs font-semibold text-amber-800" role="status">
        {pending.length === 1 ? "1 cambio pendiente" : `${pending.length} cambios pendientes`}{outsideFilter > 0 && ` · ${outsideFilter} fuera del filtro`}
      </p>}
      {hasInvalidScore && <p className="text-sm text-rose-800" role="alert">Revisa las casillas marcadas. Introduce una nota entre 0 y 10 con hasta una décima.</p>}
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
              {columns.map((column) => <th key={column.id} scope="col" className={`border-b border-r border-slate-200 px-2 py-2 align-top ${sessionColumns ? "w-24 min-w-20 text-center" : "w-36 min-w-32 text-left"}`}>
                {column.detail && <span className="block text-xs font-bold text-[#1e6b4f]">{column.detail}</span>}
                <span className="mt-0.5 block max-w-40 break-words leading-5">{column.title}</span>
                {column.date && <span className="mt-0.5 block text-xs font-normal text-slate-600">{column.date}</span>}
              </th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((student, rowIndex) => <tr key={student.id} className="group bg-white even:bg-slate-50/80">
              <th scope="row" className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2 text-left align-middle group-even:bg-slate-50">
                <span className="block max-w-32 break-words font-bold text-slate-950 sm:max-w-48">{student.name}</span>
                <span className="block text-xs font-normal text-slate-600">{student.group}</span>
              </th>
              {columns.map((column) => {
                const cell = getCell(student.id, column.id);
                const draft = drafts[assessmentGradeKey(student.id, column.id)];
                const invalid = Boolean(draft && parseTeacherSessionScore(draft.text) === null);
                const label = [student.name, column.detail, column.title, cell?.absent ? "Ausencia" : cell?.unregistered ? "Sin seguimiento registrado" : undefined]
                  .filter(Boolean).join(" · ");
                return <td key={column.id} className="border-b border-r border-slate-100 px-2 py-1.5 text-center">
                  {cell ? <>
                    <input id={cellInputId(student.id, column.id)} type="text" inputMode="decimal" maxLength={4}
                      aria-label={label} aria-invalid={invalid || undefined}
                      value={draft?.text ?? (cell.score !== null ? formatGrade(cell.score) : "")} readOnly={saving}
                      onChange={(event) => changeScore(student.id, column.id, event.target.value, cell.score)}
                      onKeyDown={(event) => moveToStudent(event, rowIndex, column.id)}
                      placeholder="—"
                      className={`h-10 rounded-lg border px-1.5 text-center font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-700 ${sessionColumns ? "w-14" : "w-[4.5rem]"} ${invalid
                        ? "border-rose-400 bg-rose-50 text-rose-900"
                        : draft ? "border-amber-400 bg-amber-50 text-amber-950"
                        : cell.score !== null ? "border-emerald-200 bg-emerald-50/60 text-[#164c3a]"
                        : "border-slate-200 bg-white text-slate-900"}`}/>
                    {cell.absent && <span aria-hidden="true" className="mx-auto mt-1 block w-fit rounded-md bg-rose-100 px-1 text-xs font-semibold text-rose-800">Ausencia</span>}
                  </> : <span className="text-slate-400" aria-label="Casilla sin calificación aplicable">—</span>}
                </td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    ) : <p className="p-5 text-sm text-slate-600">{students.length ? "No hay columnas para este filtro." : "No hay alumnado para este filtro."}</p>}
  </section>;
}
