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
  sessionLogId: string;
  score: number;
  comment: string;
}) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const score = Number(input.score);
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";

  if (!Number.isFinite(score) || score < 0 || score > 10 || Math.round(score * 10) !== score * 10) {
    throw new Error("La nota debe estar entre 0 y 10 y puede incluir una décima.");
  }
  if (comment.length > 500) throw new Error("El comentario no puede superar los 500 caracteres.");
  if (typeof input.sessionLogId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.sessionLogId)) {
    throw new Error("Selecciona un registro de sesión válido.");
  }

  const { data: session, error: sessionError } = await supabase
    .from("training_session_logs")
    .select("id,student_id,course_id,sa_code,session_number")
    .eq("id", input.sessionLogId)
    .maybeSingle();
  if (sessionError || !session || session.sa_code !== "SA2" || session.session_number < 1 || session.session_number > 10) {
    throw new Error("No se ha encontrado una sesión válida de SA2.");
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("bachillerato_year")
    .eq("id", session.course_id)
    .maybeSingle();
  if (courseError || course?.bachillerato_year !== 2) {
    throw new Error("Estas valoraciones solo están disponibles para SA2 de 2º de Bachillerato.");
  }

  const updatedAt = new Date().toISOString();
  const { data: saved, error: saveError } = await supabase
    .from("training_session_evaluations")
    .upsert({
      session_log_id: session.id,
      student_id: session.student_id,
      teacher_id: teacher.id,
      teacher_score: score,
      teacher_comment: comment,
      updated_at: updatedAt,
    }, { onConflict: "session_log_id" })
    .select("session_log_id,teacher_score,teacher_comment,updated_at")
    .single();
  if (saveError || !saved || saved.session_log_id !== session.id) throw new Error("No se ha podido confirmar el guardado de la calificación. Vuelve a intentarlo.");

  return { score: Number(saved.teacher_score), comment: String(saved.teacher_comment), updatedAt: String(saved.updated_at) };
}

