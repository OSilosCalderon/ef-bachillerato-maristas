import { createClient } from "@/lib/supabase/client";
import type { AssessmentPeriod, PhysicalTest } from "@/lib/sa1-types";

const supabase = createClient();

export async function loadPhysicalTestsForCurrentStudent() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("No se ha podido identificar al alumno.");

  const { data: student, error: studentError } = await supabase
    .from("students").select("id").eq("profile_id", auth.user.id).single();
  if (studentError || !student) throw new Error("No se ha encontrado el perfil de alumno.");

  const { data: rows, error: testsError } = await supabase
    .from("physical_tests")
    .select("id,name,description,unit,direction,instructions,active")
    .eq("active", true).order("created_at", { ascending: true });
  if (testsError) throw new Error("No se han podido cargar las pruebas físicas.");

  const { data: results, error: resultsError } = await supabase
    .from("physical_test_results")
    .select("physical_test_id,period,value")
    .eq("student_id", student.id);
  if (resultsError) throw new Error("No se han podido cargar tus resultados.");

  const values = new Map<string, number>();
  for (const item of results ?? []) values.set(`${item.physical_test_id}:${item.period}`, Number(item.value));

  const tests: PhysicalTest[] = (rows ?? []).map((row) => ({
    ...row,
    september: values.get(`${row.id}:september`),
    november: values.get(`${row.id}:november`),
  }));
  return { studentId: student.id as string, tests };
}

export async function savePhysicalResult(studentId: string, testId: string, period: AssessmentPeriod, value: number) {
  const { error } = await supabase.from("physical_test_results").upsert(
    { physical_test_id: testId, student_id: studentId, period, value, updated_at: new Date().toISOString() },
    { onConflict: "physical_test_id,student_id,period" },
  );
  if (error) throw error;
}
