import { createClient } from "@/lib/supabase/client";

export type TheoryTopicProgress = {
  topicSlug: string;
  completed: boolean;
  quizScore: number | null;
};

export async function loadTheoryTopicProgress() {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("No se ha podido identificar al alumno.");

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", auth.user.id)
    .eq("active", true)
    .single();

  if (studentError || !student) throw new Error("No se ha encontrado el perfil de alumno.");

  const { data, error } = await supabase
    .from("theory_topic_progress")
    .select("topic_slug,completed,quiz_score")
    .eq("student_id", student.id);

  if (error) throw new Error("No se ha podido cargar el progreso de los apuntes.");

  return {
    studentId: String(student.id),
    progress: (data ?? []).map((row) => ({
      topicSlug: String(row.topic_slug),
      completed: Boolean(row.completed),
      quizScore: row.quiz_score === null ? null : Number(row.quiz_score),
    })) satisfies TheoryTopicProgress[],
  };
}

export async function saveTheoryTopicProgress(
  studentId: string,
  topicSlug: string,
  completed: boolean,
  quizScore: number | null,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("theory_topic_progress")
    .upsert(
      {
        student_id: studentId,
        topic_slug: topicSlug,
        completed,
        quiz_score: quizScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,topic_slug" },
    )
    .select("topic_slug,completed,quiz_score")
    .single();

  if (error || !data) throw new Error(error?.message ?? "No se ha podido guardar el progreso.");
  return {
    topicSlug: String(data.topic_slug),
    completed: Boolean(data.completed),
    quizScore: data.quiz_score === null ? null : Number(data.quiz_score),
  } satisfies TheoryTopicProgress;
}
