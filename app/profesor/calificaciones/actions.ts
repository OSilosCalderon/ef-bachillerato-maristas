"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  assessmentGradeKey, validateGradePublication,
  type AssessmentGradeItem, type AssessmentScoreChange, type PublishedAssessmentGrade,
} from "@/lib/gradebook";

export async function publishAssessmentGrade(input:{studentId:string;itemId:string;score:number;comment:string}):Promise<PublishedAssessmentGrade> {
  const teacher=await requireRole("teacher");
  const value=validateGradePublication(input);
  const supabase=await createClient();
  const [student,item]=await Promise.all([
    supabase.from("students").select("id,course_id,active").eq("id",value.studentId).maybeSingle(),
    supabase.from("assessment_grade_items").select("id,course_id").eq("id",value.itemId).maybeSingle(),
  ]);
  if (student.error || item.error || !student.data?.active || !item.data || student.data.course_id!==item.data.course_id) throw new Error("El instrumento y el alumno deben pertenecer al mismo curso activo.");
  const course=await supabase.from("courses").select("id,bachillerato_year").eq("id",item.data.course_id).eq("is_active",true).maybeSingle();
  if (course.error || !course.data) throw new Error("El curso no está activo.");
  const {data,error}=await supabase.from("student_assessment_grades").upsert({student_id:value.studentId,item_id:value.itemId,teacher_id:teacher.id,score:value.score,comment:value.comment,published_at:new Date().toISOString()},{onConflict:"student_id,item_id"}).select("id,student_id,item_id,score,comment,published_at").single();
  if(error || !data || data.student_id!==value.studentId || data.item_id!==value.itemId) throw new Error("No se ha podido confirmar la publicación. Vuelve a intentarlo.");
  if (course.data.bachillerato_year === 2) {
    revalidatePath("/profesor/2bach/notas");
    revalidatePath(`/profesor/2bach/notas/${value.studentId}`);
    revalidatePath("/alumno/calificaciones");
  }
  return {...data,score:Number(data.score)} as PublishedAssessmentGrade;
}

export async function publishAssessmentScores(input: AssessmentScoreChange[]): Promise<{ grades: PublishedAssessmentGrade[]; error: string | null }> {
  const teacher = await requireRole("teacher");
  if (!Array.isArray(input) || input.length === 0) return { grades: [], error: "Introduce alguna nota para publicar." };

  const publishedAt = new Date().toISOString();
  let scores;
  try {
    scores = input.map((change) => {
      const value = validateGradePublication({ ...change, comment: "" });
      return {
        student_id: value.studentId.toLowerCase(), item_id: value.itemId.toLowerCase(),
        score: value.score, teacher_id: teacher.id, published_at: publishedAt,
      };
    });
  } catch (cause) {
    return { grades: [], error: cause instanceof Error ? cause.message : "Revisa las notas introducidas." };
  }
  const keys = scores.map((score) => assessmentGradeKey(score.student_id, score.item_id));
  if (new Set(keys).size !== scores.length) return { grades: [], error: "Hay más de un cambio para la misma casilla." };
  scores.sort((a, b) => assessmentGradeKey(a.student_id, a.item_id).localeCompare(assessmentGradeKey(b.student_id, b.item_id)));

  const supabase = await createClient();
  const grades: PublishedAssessmentGrade[] = [];
  let error: string | null = null;
  // PostgREST caps returned rows. Keep the confirmed receipts even if a later batch fails.
  const batchSize = 500;
  for (let start = 0; start < scores.length; start += batchSize) {
    const batch = scores.slice(start, start + batchSize);
    try {
      // Omit comment so updates preserve it and inserts use the column default. RLS checks the active course for each pair.
      const result = await supabase.from("student_assessment_grades")
        .upsert(batch, { onConflict: "student_id,item_id", defaultToNull: false })
        .select("id,student_id,item_id,score,comment,published_at");
      const received = new Map((result.data ?? []).map((grade) => [assessmentGradeKey(grade.student_id, grade.item_id), grade]));
      if (result.error || received.size !== batch.length || batch.some((score) => {
        const grade = received.get(assessmentGradeKey(score.student_id, score.item_id));
        return !grade || Number(grade.score) !== score.score;
      })) {
        error = result.error?.code === "42501"
          ? "Revisa que el alumnado y los instrumentos pertenezcan al mismo curso activo."
          : "No se han podido confirmar todas las notas. Vuelve a publicar las pendientes.";
        break;
      }
      grades.push(...[...received.values()].map((grade) => ({ ...grade, score: Number(grade.score) })));
    } catch {
      error = "No se han podido confirmar todas las notas. Vuelve a publicar las pendientes.";
      break;
    }
  }

  if (grades.length) {
    revalidatePath("/alumno/calificaciones");
    revalidatePath("/profesor/2bach/notas");
    revalidatePath("/profesor/2bach/notas/[id]", "page");
  }
  return { grades, error };
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
