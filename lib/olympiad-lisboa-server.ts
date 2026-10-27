import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { firstYearCalendarGroup } from "@/lib/class-groups";
import type { OlympiadResponse, OlympiadStudentRow } from "@/lib/olympiad-lisboa";

export async function getOlympiadStudent() {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const student = await supabase.from("students").select("id,course_id").eq("profile_id", profile.id).eq("active", true).maybeSingle();
  if (student.error) throw new Error("No se ha podido comprobar tu curso. Vuelve a intentarlo.");
  if (!student.data) return null;
  const course = await supabase.from("courses").select("id").eq("id", student.data.course_id).eq("bachillerato_year", 1).eq("academic_year", "2026-2027").eq("is_active", true).maybeSingle();
  if (course.error) throw new Error("No se ha podido comprobar tu curso. Vuelve a intentarlo.");
  return course.data ? { id: String(student.data.id) } : null;
}

export async function loadStudentOlympiad() {
  const student = await getOlympiadStudent();
  if (!student) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("olympiad_lisboa_2027_responses").select("student_id,participating,gender,first_choice,second_choice,updated_at").eq("student_id", student.id).maybeSingle();
  if (error) throw new Error("No se ha podido cargar tu respuesta. Actualiza la página.");
  return { student, response: data as OlympiadResponse | null };
}

export async function loadTeacherOlympiad(): Promise<OlympiadStudentRow[]> {
  await requireRole("teacher");
  const supabase = await createClient();
  const courses = await supabase.from("courses").select("id").eq("bachillerato_year", 1).eq("academic_year", "2026-2027").eq("is_active", true);
  if (courses.error || !courses.data?.length) throw new Error("No se ha encontrado el curso activo de 1º Bachillerato.");
  const students = await supabase.from("students").select("id,profile_id").in("course_id", courses.data.map((course) => course.id)).eq("active", true).order("id");
  if (students.error) throw new Error("No se ha podido cargar el alumnado.");
  if (!students.data?.length) return [];
  const [profiles, responses] = await Promise.all([
    supabase.from("profiles").select("id,display_name,class_group").in("id", students.data.map((student) => student.profile_id)),
    supabase.from("olympiad_lisboa_2027_responses").select("student_id,participating,gender,first_choice,second_choice,updated_at").in("student_id", students.data.map((student) => student.id)),
  ]);
  if (profiles.error || responses.error) throw new Error("No se han podido cargar las respuestas de la Olimpiada.");
  const profileMap = new Map((profiles.data ?? []).map((profile) => [profile.id, profile]));
  const responseMap = new Map((responses.data ?? []).map((response) => [response.student_id, response as OlympiadResponse]));
  return students.data.map((student) => {
    const profile = profileMap.get(student.profile_id);
    return { id: String(student.id), name: String(profile?.display_name ?? "Alumno/a"), group: firstYearCalendarGroup(profile?.class_group ?? "") ?? String(profile?.class_group ?? "1º Bachillerato"), response: responseMap.get(student.id) ?? null };
  }).sort((a, b) => a.group.localeCompare(b.group, "es") || a.name.localeCompare(b.name, "es"));
}
