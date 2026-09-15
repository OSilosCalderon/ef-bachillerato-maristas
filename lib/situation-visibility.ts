import { createClient } from "@/lib/supabase/client";
export async function loadStudentVisibleSituations() {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("No se ha podido comprobar tu acceso.");
  const { data: student, error: studentError } = await supabase.from("students").select("course_id").eq("profile_id", auth.user.id).eq("active", true).single();
  if (studentError || !student) throw new Error("No se ha podido comprobar tu curso.");
  const { data, error } = await supabase.from("learning_situations").select("code").eq("course_id", student.course_id).eq("published", true);
  if (error) throw new Error("No se han podido comprobar las situaciones disponibles.");
  return (data ?? []).map((row) => String(row.code));
}
