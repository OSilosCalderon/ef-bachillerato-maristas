import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStudentCourse } from "@/lib/student-course";
export const getVisibleSituations = cache(async (courseId: string | null): Promise<string[]> => {
  if (!courseId) return [];
  const { data, error } = await (await createClient()).from("learning_situations").select("code").eq("course_id", courseId).eq("published", true);
  if (error) throw new Error("No se han podido comprobar las situaciones disponibles. Vuelve a intentarlo.");
  return (data ?? []).map((row) => String(row.code));
});
export async function requireVisibleSituation(year: 1 | 2, code: string) {
  const course = await getCurrentStudentCourse();
  if (course.bachilleratoYear !== year) redirect("/alumno");
  if (!(await getVisibleSituations(course.id)).includes(code)) redirect("/alumno?contenido=no-disponible");
}
