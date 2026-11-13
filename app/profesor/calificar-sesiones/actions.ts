"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { TeacherSessionEvaluation } from "@/lib/teacher-activity";
import { planSessionsForYear } from "@/lib/teacher-session-grading";

type SessionScore = { studentId: string; number: number; score: number };
type SessionGradeWrite = {
  student_id: string;
  session_number: number;
  teacher_id: string;
  teacher_score: number;
  updated_at: string;
};

const gradeFields = "student_id,session_number,teacher_score,teacher_comment,absent,updated_at";
const sessionKey = (studentId: string, session: number) => `${studentId}:${session}`;
const studentIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const onConflict = "student_id,session_number";

async function preserveLegacySessionGrades(supabase: Awaited<ReturnType<typeof createClient>>, batch: SessionGradeWrite[]) {
  const studentIds = [...new Set(batch.map((row) => row.student_id))];
  const changed = new Map(batch.map((row) => [sessionKey(row.student_id, row.session_number), row]));
  const [effective, current] = await Promise.all([
    supabase.from("training_session_grade_results").select(gradeFields).in("student_id", studentIds),
    supabase.from("training_session_grades").select("student_id,session_number,updated_at").in("student_id", studentIds),
  ]);
  if (effective.error || current.error) throw new Error("No se han podido comprobar las notas anteriores.");
  const currentDates = new Map((current.data ?? []).map((row) => [sessionKey(row.student_id, row.session_number), row.updated_at]));
  for (const grade of effective.data ?? []) {
    const key = sessionKey(grade.student_id, grade.session_number);
    const change = changed.get(key);
    const date = currentDates.get(key);
    if (!change || date === grade.updated_at) continue;

    // Materialize the visible legacy grade before changing its score. Keep any newer concurrent edit.
    const result = date
      ? await supabase.from("training_session_grades").update({ ...grade, teacher_id: change.teacher_id })
        .eq("student_id", grade.student_id).eq("session_number", grade.session_number).lt("updated_at", grade.updated_at)
      : await supabase.from("training_session_grades").upsert({ ...grade, teacher_id: change.teacher_id }, { onConflict, ignoreDuplicates: true });
    if (result.error) throw new Error("No se ha podido conservar la valoración anterior de esta sesión.");
  }
}

export async function publishSessionScores(year: 1 | 2, input: SessionScore[]): Promise<{ grades: TeacherSessionEvaluation[]; error: string | null }> {
  const teacher = await requireRole("teacher");
  if (year !== 1 && year !== 2) return { grades: [], error: "Curso no válido." };
  if (!Array.isArray(input) || !input.length) return { grades: [], error: "Introduce alguna nota para publicar." };

  const sessionCount = planSessionsForYear(year, "1ºA").length;
  const changes = new Map<string, SessionGradeWrite>();
  const updatedAt = new Date().toISOString();
  for (const change of input) {
    if (!change || typeof change.studentId !== "string" || !studentIdPattern.test(change.studentId) ||
      !Number.isInteger(change.number) || change.number < 1 || change.number > sessionCount) {
      return { grades: [], error: "Selecciona un alumno y una sesión del curso." };
    }
    const { score } = change;
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 10 || Math.round(score * 10) !== score * 10) {
      return { grades: [], error: "La nota debe estar entre 0 y 10 y puede incluir una décima." };
    }
    const studentId = change.studentId.toLowerCase();
    const key = sessionKey(studentId, change.number);
    if (changes.has(key)) return { grades: [], error: "Hay más de un cambio para la misma casilla." };
    changes.set(key, {
      student_id: studentId, session_number: change.number, teacher_score: score, teacher_id: teacher.id, updated_at: updatedAt,
    });
  }

  const supabase = await createClient();
  const table = year === 1 ? "first_year_plan_session_grades" : "training_session_grades";
  const scores = [...changes.values()].sort((a, b) => a.student_id.localeCompare(b.student_id) || a.session_number - b.session_number);
  const grades: TeacherSessionEvaluation[] = [];
  // At most ten existing session rows per student and 1,000 rows per PostgREST read.
  const batchSize = 100;
  for (let start = 0; start < scores.length; start += batchSize) {
    const batch = scores.slice(start, start + batchSize);
    try {
      if (year === 2) await preserveLegacySessionGrades(supabase, batch);
      // RLS checks the active course. Omitted columns keep comments and absences when updating.
      const { data, error } = await supabase.from(table)
        .upsert(batch, { onConflict, defaultToNull: false })
        .select(gradeFields);
      const received = new Map((data ?? []).map((grade) => [sessionKey(grade.student_id, grade.session_number), grade]));
      if (error?.code === "42501") return finish("Revisa que todos los alumnos pertenezcan al curso activo seleccionado.");
      if (error || received.size !== batch.length || batch.some((row) =>
        Number(received.get(sessionKey(row.student_id, row.session_number))?.teacher_score) !== row.teacher_score)) {
        return finish("No se han podido confirmar todas las notas. Vuelve a publicar las pendientes.");
      }
      grades.push(...[...received.values()].map((grade) => ({
        studentId: grade.student_id, number: grade.session_number, score: Number(grade.teacher_score),
        comment: grade.teacher_comment, absent: grade.absent === true, updatedAt: grade.updated_at,
      })));
    } catch {
      return finish("No se han podido confirmar todas las notas. Vuelve a publicar las pendientes.");
    }
  }
  return finish(null);

  function finish(error: string | null) {
    if (grades.length) {
      revalidatePath("/alumno/calificaciones");
      revalidatePath(year === 1 ? "/alumno/sa1/seguimiento" : "/alumno/2bach/sa2/seguimiento");
      if (year === 2) {
        revalidatePath("/profesor/2bach/notas");
        revalidatePath("/profesor/2bach/notas/[id]", "page");
      }
    }
    return { grades, error };
  }
}
