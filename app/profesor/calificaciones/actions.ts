"use server";

import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { validateGradePublication, type AssessmentGradeItem, type PublishedAssessmentGrade } from "@/lib/gradebook";

export async function publishAssessmentGrade(input:{studentId:string;itemId:string;score:number;comment:string}):Promise<PublishedAssessmentGrade> {
  const teacher=await requireRole("teacher");
  const value=validateGradePublication(input);
  const supabase=await createClient();
  const [student,item]=await Promise.all([
    supabase.from("students").select("id,course_id,active").eq("id",value.studentId).maybeSingle(),
    supabase.from("assessment_grade_items").select("id,course_id").eq("id",value.itemId).maybeSingle(),
  ]);
  if (student.error || item.error || !student.data?.active || !item.data || student.data.course_id!==item.data.course_id) throw new Error("El instrumento y el alumno deben pertenecer al mismo curso activo.");
  const course=await supabase.from("courses").select("id").eq("id",item.data.course_id).eq("is_active",true).maybeSingle();
  if (course.error || !course.data) throw new Error("El curso no está activo.");
  const {data,error}=await supabase.from("student_assessment_grades").upsert({student_id:value.studentId,item_id:value.itemId,teacher_id:teacher.id,score:value.score,comment:value.comment,published_at:new Date().toISOString()},{onConflict:"student_id,item_id"}).select("id,student_id,item_id,score,comment,published_at").single();
  if(error || !data || data.student_id!==value.studentId || data.item_id!==value.itemId) throw new Error("No se ha podido confirmar la publicación. Vuelve a intentarlo.");
  return {...data,score:Number(data.score)} as PublishedAssessmentGrade;
}

export async function addAssessmentGradeItem(input:{courseId:string;saCode:string;title:string}):Promise<AssessmentGradeItem> {
  const teacher=await requireRole("teacher");
  const title=typeof input.title==="string"?input.title.trim():"";
  if(!title || title.length>120 || !/^SA[1-6]$/.test(input.saCode) || !/^[0-9a-f-]{36}$/i.test(input.courseId)) throw new Error("Indica un título de hasta 120 caracteres y una situación válida.");
  const supabase=await createClient();
  const situation=await supabase.from("learning_situations").select("id").eq("course_id",input.courseId).eq("code",input.saCode).maybeSingle();
  if(situation.error || !situation.data) throw new Error("No se ha encontrado la situación en este curso.");
  const {data,error}=await supabase.from("assessment_grade_items").insert({course_id:input.courseId,sa_code:input.saCode,item_key:`custom-${crypto.randomUUID()}`,title,position:50,created_by:teacher.id}).select("id,course_id,sa_code,item_key,title,position").single();
  if(error?.code==="23505") throw new Error("Ya existe un instrumento con ese nombre en esta situación.");
  if(error || !data) throw new Error("No se ha podido añadir el instrumento de evaluación.");
  return data as AssessmentGradeItem;
}
