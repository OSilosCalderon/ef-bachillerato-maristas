"use server";

import { revalidatePath } from "next/cache";
import { getOlympiadStudent } from "@/lib/olympiad-lisboa-server";
import { createClient } from "@/lib/supabase/server";
import { validateOlympiadAnswer, type OlympiadResponse } from "@/lib/olympiad-lisboa";

export async function saveOlympiadAnswer(input: unknown): Promise<OlympiadResponse> {
  const student = await getOlympiadStudent();
  if (!student) throw new Error("Este formulario es para el alumnado de 1º de Bachillerato de 2026/2027.");
  const answer = validateOlympiadAnswer(input);
  const supabase = await createClient();
  const { data, error } = await supabase.from("olympiad_lisboa_2027_responses").upsert({ student_id: student.id, ...answer }, { onConflict: "student_id" }).select("student_id,participating,gender,first_choice,second_choice,updated_at").single();
  if (error || !data || data.student_id !== student.id || data.participating !== answer.participating || data.gender !== answer.gender || data.first_choice !== answer.first_choice || data.second_choice !== answer.second_choice) throw new Error("No se ha podido confirmar el guardado. Vuelve a intentarlo.");
  revalidatePath("/alumno/olimpiada-lisboa");
  revalidatePath("/profesor/olimpiada-lisboa");
  return data as OlympiadResponse;
}
