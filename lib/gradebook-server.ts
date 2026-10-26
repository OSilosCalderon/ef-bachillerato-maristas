import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentGradeItem, GradebookData, PublishedAssessmentGrade } from "@/lib/gradebook";

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

export async function loadStudentGradebook() {
  const profile=await requireRole("student");
  const supabase=await createClient();
  const {data:student,error}=await supabase.from("students").select("id,course_id").eq("profile_id",profile.id).eq("active",true).single();
  if (error || !student) throw new Error("No se ha encontrado tu perfil de alumno.");
  const [itemsResult,gradesResult,courseResult,situationsResult]=await Promise.all([
    supabase.from("assessment_grade_items").select("id,course_id,sa_code,item_key,title,position").eq("course_id",student.course_id).order("position"),
    supabase.from("student_assessment_grades").select("id,student_id,item_id,score,comment,published_at").eq("student_id",student.id).order("published_at",{ascending:false}),
    supabase.from("courses").select("bachillerato_year").eq("id",student.course_id).single(),
    supabase.from("learning_situations").select("code,title").eq("course_id",student.course_id).order("code"),
  ]);
  if (itemsResult.error || gradesResult.error || courseResult.error || !courseResult.data || situationsResult.error) throw new Error("No se han podido cargar tus calificaciones. Actualiza la página e inténtalo de nuevo.");
  const sessionGrades:{number:number;score:number;comment:string;date:string;absent:boolean}[]=[];
  if ([1,2].includes(Number(courseResult.data.bachillerato_year))) {
    const evaluations=await supabase.from(courseResult.data.bachillerato_year===1 ? "first_year_plan_session_grades" : "training_session_grade_results").select("session_number,teacher_score,teacher_comment,updated_at,absent").eq("student_id",student.id).order("session_number");
    if (evaluations.error) throw new Error("No se han podido cargar las valoraciones de tus sesiones.");
    for (const evaluation of evaluations.data ?? []) sessionGrades.push({number:Number(evaluation.session_number),score:Number(evaluation.teacher_score),comment:String(evaluation.teacher_comment),date:String(evaluation.updated_at),absent:evaluation.absent===true});
  }
  return {studentId:String(student.id),courseId:String(student.course_id),year:Number(courseResult.data.bachillerato_year),items:(itemsResult.data ?? []) as AssessmentGradeItem[],grades:(gradesResult.data ?? []).map((row) => ({...row,score:Number(row.score)})) as PublishedAssessmentGrade[],situations:situationsResult.data ?? [],sessionGrades:sessionGrades.sort((a,b) => a.number-b.number)};
}

