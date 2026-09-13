import { createClient } from "@/lib/supabase/server";

export type BachilleratoYear = 1 | 2;

export type StudentCourse = {
  id: string | null;
  name: string;
  bachilleratoYear: BachilleratoYear;
};

const fallback: StudentCourse = {
  id: null,
  name: "EF de 1º Bachillerato · Maristas Badajoz",
  bachilleratoYear: 1,
};

export async function getCurrentStudentCourse(): Promise<StudentCourse> {
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const profileId = claims?.claims?.sub;
    if (!profileId) return fallback;

    const { data: student } = await supabase
      .from("students")
      .select("course_id")
      .eq("profile_id", profileId)
      .eq("active", true)
      .single();

    if (!student?.course_id) return fallback;

    const { data: course } = await supabase
      .from("courses")
      .select("id,name,bachillerato_year")
      .eq("id", student.course_id)
      .single();

    if (!course) return fallback;
    const year: BachilleratoYear = Number(course.bachillerato_year) === 2 ? 2 : 1;
    return { id: String(course.id), name: String(course.name), bachilleratoYear: year };
  } catch {
    return fallback;
  }
}
