import "server-only";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { reflectionFields, reflectionPath, validateReflection, type FinalPhysicalReflection } from "@/lib/final-physical-reflection";

export const getReflectionContext = cache(async (expectedYear?: 1 | 2) => {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const { data: student, error } = await supabase.from("students").select("id,course_id").eq("profile_id", profile.id).eq("active", true).single();
  if (error || !student) throw new Error("No se ha encontrado tu matrícula activa.");
  const { data: course, error: courseError } = await supabase.from("courses").select("id,bachillerato_year").eq("id", student.course_id).eq("is_active", true).single();
  const year = course?.bachillerato_year;
  if (courseError || (year !== 1 && year !== 2) || (expectedYear && year !== expectedYear)) throw new Error("Esta reflexión no corresponde a tu curso.");
  const sa = year === 1 ? "SA1" : "SA2";
  const { data: situation, error: visibilityError } = await supabase.from("learning_situations").select("id").eq("course_id", course.id).eq("code", sa).eq("published", true).maybeSingle();
  if (visibilityError || !situation) throw new Error("Esta situación de aprendizaje todavía no está disponible.");
  return { supabase, student, year: year as 1 | 2, sa };
});

export async function loadFinalPhysicalReflection(year: 1 | 2) {
  const { supabase, student } = await getReflectionContext(year);
  const { data, error } = await supabase.from("physical_final_reflections").select("*").eq("student_id", student.id).eq("course_id", student.course_id).maybeSingle();
  if (error) throw new Error("No se ha podido cargar tu reflexión. Vuelve a intentarlo.");
  return data as FinalPhysicalReflection | null;
}

export async function saveFinalPhysicalReflection(input: unknown) {
  const answer = validateReflection(input);
  const { supabase, student, year, sa } = await getReflectionContext();
  const { data, error } = await supabase.from("physical_final_reflections").upsert({ ...answer, student_id: student.id, course_id: student.course_id, course_year: year, sa_code: sa }, { onConflict: "student_id" }).select("*").single();
  if (error) {
    console.error("Final physical reflection save failed", { code: error.code });
    throw new Error("No se ha podido guardar tu reflexión. Conserva tus respuestas y vuelve a intentarlo.");
  }
  if (!data || data.student_id !== student.id || data.course_id !== student.course_id || data.status !== answer.status || reflectionFields.some((field) => data[field.key] !== answer[field.key])) throw new Error("No se ha podido confirmar el guardado. Vuelve a intentarlo.");
  for (const path of [reflectionPath(year), "/alumno/progreso", "/alumno/sa1/progreso", "/alumno/2bach/sa2/seguimiento", "/profesor"]) revalidatePath(path);
  return data as FinalPhysicalReflection;
}
