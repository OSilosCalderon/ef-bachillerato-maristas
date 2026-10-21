"use server";

import { loadTeacherActivity } from "@/lib/teacher-activity-server";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export async function refreshTeacherActivity(year: 1 | 2) {
  if (year !== 1 && year !== 2) throw new Error("Curso no válido.");
  // The loader checks the teacher role on every request and uses the user's RLS.
  return loadTeacherActivity(year);
}


export async function saveSecondYearSessionEvaluation(input: {
  studentId: string;
  sessionNumber: number;
  score: number;
  comment: string;
  absent?: boolean;
}) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const score = Number(input.score);
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";

  if (!Number.isFinite(score) || score < 0 || score > 10 || Math.round(score * 10) !== score * 10) {
    throw new Error("La nota debe estar entre 0 y 10 y puede incluir una décima.");
  }
  if (input.absent !== undefined && typeof input.absent !== "boolean") throw new Error("Indica si hubo ausencia en esta sesión.");
  const absent = input.absent ?? false;
  if (comment.length > 500) throw new Error("El comentario no puede superar los 500 caracteres.");
  if (typeof input.studentId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.studentId)) {
    throw new Error("Selecciona un alumno válido.");
  }
  if (!Number.isInteger(input.sessionNumber) || input.sessionNumber < 1 || input.sessionNumber > 10) {
    throw new Error("Selecciona una de las diez sesiones del plan.");
  }
  const { data: student, error: studentError } = await supabase
    .from("students").select("id,course_id")
    .eq("id", input.studentId).eq("active", true).maybeSingle();
  if (studentError || !student) throw new Error("No se ha encontrado el alumno activo.");

  const { data: course, error: courseError } = await supabase
    .from("courses").select("bachillerato_year")
    .eq("id", student.course_id).eq("is_active", true).maybeSingle();
  if (courseError || course?.bachillerato_year !== 2) {
    throw new Error("Estas valoraciones solo están disponibles para SA2 de 2º de Bachillerato.");
  }
  const updatedAt = new Date().toISOString();
  const { data: saved, error: saveError } = await supabase
    .from("training_session_grades")
    .upsert({
      student_id: student.id,
      session_number: input.sessionNumber,
      teacher_id: teacher.id,
      teacher_score: score,
      teacher_comment: comment,
      absent,
      updated_at: updatedAt,
    }, { onConflict: "student_id,session_number" })
    .select("student_id,session_number,teacher_score,teacher_comment,updated_at,absent")
    .single();
  if (saveError || !saved || saved.student_id !== student.id || saved.session_number !== input.sessionNumber) throw new Error("No se ha podido confirmar el guardado de la calificación. Vuelve a intentarlo.");

  return { absent: saved.absent === true, score: Number(saved.teacher_score), comment: String(saved.teacher_comment), updatedAt: String(saved.updated_at) };
}

