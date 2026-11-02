import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentGradeItem, GradebookData, GradebookStudent, PublishedAssessmentGrade, StudentGradebookData, StudentSessionGrade, TeacherGradesOverviewData } from "@/lib/gradebook";

export async function loadTeacherGradebook(year: 1 | 2): Promise<GradebookData> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data: courses, error } = await supabase.from("courses").select("id,name").eq("bachillerato_year",year).eq("is_active",true);
  if (error || !courses?.length) throw new Error("No se ha encontrado el curso activo.");
  const courseIds = courses.map((course) => String(course.id));
  const [studentsResult,itemsResult,situationsResult] = await Promise.all([
    supabase.from("students").select("id,profile_id,course_id").in("course_id",courseIds).eq("active",true),
    supabase.from("assessment_grade_items").select("id,course_id,sa_code,item_key,title,position").in("course_id",courseIds).order("position"),
    supabase.from("learning_situations").select("course_id,code,title").in("course_id",courseIds).order("code"),
  ]);
  if (studentsResult.error || itemsResult.error || situationsResult.error) throw new Error("No se ha podido cargar el cuaderno de calificaciones.");
  const students = studentsResult.data ?? [];
  const ids = students.map((student) => String(student.id));
  const profiles = students.length ? await supabase.from("profiles").select("id,display_name,class_group").in("id",students.map((student) => student.profile_id)) : {data:[],error:null};
  if (profiles.error) throw new Error("No se ha podido cargar el alumnado.");
  const grades: PublishedAssessmentGrade[] = [];
  if (ids.length) for (let start=0; ; start+=1000) {
    const result = await supabase.from("student_assessment_grades").select("id,student_id,item_id,score,comment,published_at").in("student_id",ids).order("id").range(start,start+999);
    if (result.error) throw new Error("No se han podido cargar las calificaciones publicadas.");
    grades.push(...((result.data ?? []).map((row) => ({...row,score:Number(row.score)})) as PublishedAssessmentGrade[]));
    if ((result.data?.length ?? 0)<1000) break;
  }
  return {
    students: students.map((student) => { const profile=profiles.data?.find((entry) => entry.id===student.profile_id); return {id:String(student.id),courseId:String(student.course_id),name:String(profile?.display_name ?? "Alumno/a"),group:String(profile?.class_group ?? `${year}º Bachillerato`)}; }).sort((a,b) => a.name.localeCompare(b.name,"es")),
    items:(itemsResult.data ?? []) as AssessmentGradeItem[], grades,
    situations:(situationsResult.data ?? []).map((row) => ({courseId:String(row.course_id),code:String(row.code),title:String(row.title)})),
    loadedAt:new Date().toISOString(),
  };
}

async function loadGradebookForStudent(supabase: Awaited<ReturnType<typeof createClient>>, student: { id: string; course_id: string }, year: 1 | 2): Promise<StudentGradebookData> {
  const [itemsResult,gradesResult,situationsResult,sessionResult]=await Promise.all([
    supabase.from("assessment_grade_items").select("id,course_id,sa_code,item_key,title,position").eq("course_id",student.course_id).order("position"),
    supabase.from("student_assessment_grades").select("id,student_id,item_id,score,comment,published_at").eq("student_id",student.id).order("published_at",{ascending:false}),
    supabase.from("learning_situations").select("code,title").eq("course_id",student.course_id).order("code"),
    supabase.from(year === 1 ? "first_year_plan_session_grades" : "training_session_grade_results").select("session_number,teacher_score,teacher_comment,updated_at,absent").eq("student_id",student.id).order("session_number"),
  ]);
  if (itemsResult.error || gradesResult.error || situationsResult.error) throw new Error("No se han podido cargar las calificaciones. Actualiza la página e inténtalo de nuevo.");
  if (sessionResult.error) throw new Error("No se han podido cargar las valoraciones de las sesiones.");
  const sessionGrades: StudentSessionGrade[] = (sessionResult.data ?? []).map((row) => ({number:Number(row.session_number),score:Number(row.teacher_score),comment:String(row.teacher_comment),date:String(row.updated_at),absent:row.absent===true}));
  return {studentId:String(student.id),courseId:String(student.course_id),year,items:(itemsResult.data ?? []) as AssessmentGradeItem[],grades:(gradesResult.data ?? []).map((row) => ({...row,score:Number(row.score)})) as PublishedAssessmentGrade[],situations:situationsResult.data ?? [],sessionGrades};
}

export async function loadStudentGradebook(): Promise<StudentGradebookData> {
  const profile = await requireRole("student");
  const supabase = await createClient();
  const { data: student, error } = await supabase.from("students").select("id,course_id").eq("profile_id", profile.id).eq("active", true).single();
  if (error || !student) throw new Error("No se ha encontrado tu perfil de alumno.");
  const course = await supabase.from("courses").select("bachillerato_year").eq("id", student.course_id).single();
  const year = Number(course.data?.bachillerato_year);
  if (course.error || (year !== 1 && year !== 2)) throw new Error("No se ha encontrado tu curso de Bachillerato.");
  return loadGradebookForStudent(supabase, student, year);
}

export async function loadSecondYearGradesOverview(): Promise<TeacherGradesOverviewData> {
  const data = await loadTeacherGradebook(2);
  const sessionGrades: TeacherGradesOverviewData["sessionGrades"] = [];
  if (data.students.length) {
    const supabase = await createClient();
    const ids = data.students.map((student) => student.id);
    for (let start = 0; ; start += 1000) {
      const result = await supabase.from("training_session_grade_results")
        .select("student_id,session_number,teacher_score,teacher_comment,updated_at,absent")
        .in("student_id", ids).order("student_id").order("session_number").range(start, start + 999);
      if (result.error) throw new Error("No se han podido cargar las calificaciones de las sesiones.");
      sessionGrades.push(...(result.data ?? []).map((row) => ({ studentId: String(row.student_id), number: Number(row.session_number), score: Number(row.teacher_score), comment: String(row.teacher_comment), date: String(row.updated_at), absent: row.absent === true })));
      if ((result.data?.length ?? 0) < 1000) break;
    }
  }
  return { ...data, sessionGrades };
}

export async function loadSecondYearStudentGradebook(studentId: string): Promise<{ student: GradebookStudent; gradebook: StudentGradebookData } | null> {
  await requireRole("teacher");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) return null;
  const supabase = await createClient();
  const courses = await supabase.from("courses").select("id").eq("bachillerato_year", 2).eq("is_active", true);
  if (courses.error) throw new Error("No se ha podido cargar el curso de 2º de Bachillerato.");
  if (!courses.data?.length) return null;
  const result = await supabase.from("students").select("id,profile_id,course_id")
    .eq("id", studentId).in("course_id", courses.data.map((course) => course.id)).eq("active", true).maybeSingle();
  if (result.error) throw new Error("No se ha podido cargar el alumno.");
  if (!result.data) return null;
  const student = result.data;
  const [profile, gradebook] = await Promise.all([
    supabase.from("profiles").select("display_name,class_group").eq("id", student.profile_id).single(),
    loadGradebookForStudent(supabase, student, 2),
  ]);
  if (profile.error || !profile.data) throw new Error("No se ha podido cargar el perfil del alumno.");
  return {
    student: { id: String(student.id), courseId: String(student.course_id), name: String(profile.data.display_name), group: String(profile.data.class_group ?? "2º Bachillerato") },
    gradebook,
  };
}

