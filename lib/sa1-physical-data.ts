import { createClient } from "@/lib/supabase/client";
import type { AssessmentPeriod, FitnessReference, PhysicalTest } from "@/lib/sa1-types";

const supabase = createClient();

export async function loadPhysicalTestsForCurrentStudent() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("No se ha podido identificar al alumno.");

  const [{ data: student, error: studentError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from("students").select("id").eq("profile_id", auth.user.id).single(),
    supabase.from("profiles").select("fitness_reference").eq("id", auth.user.id).single(),
  ]);

  if (studentError || !student) throw new Error("No se ha encontrado el perfil de alumno.");
  if (profileError) throw new Error("No se ha podido cargar la referencia de comparación.");

  const { data: rows, error: testsError } = await supabase
    .from("physical_tests")
    .select("id,name,description,unit,direction,instructions,active,benchmark_male,benchmark_female")
    .eq("active", true)
    .order("created_at", { ascending: true });
  if (testsError) throw new Error("No se han podido cargar las pruebas físicas.");

  const { data: results, error: resultsError } = await supabase
    .from("physical_test_results")
    .select("physical_test_id,period,value")
    .eq("student_id", student.id);
  if (resultsError) throw new Error("No se han podido cargar tus resultados.");

  const values = new Map<string, number>();
  for (const item of results ?? []) values.set(`${item.physical_test_id}:${item.period}`, Number(item.value));

  const tests: PhysicalTest[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    unit: row.unit as string,
    direction: row.direction,
    instructions: row.instructions as string,
    active: Boolean(row.active),
    benchmarkMale: row.benchmark_male == null ? undefined : Number(row.benchmark_male),
    benchmarkFemale: row.benchmark_female == null ? undefined : Number(row.benchmark_female),
    september: values.get(`${row.id}:september`),
    december: values.get(`${row.id}:december`),
  }));

  const fitnessReference =
    profile?.fitness_reference === "masculino" || profile?.fitness_reference === "femenino"
      ? (profile.fitness_reference as FitnessReference)
      : null;

  return { studentId: student.id as string, tests, fitnessReference };
}

export async function savePhysicalResult(studentId: string, testId: string, period: AssessmentPeriod, value: number) {
  const { error } = await supabase.from("physical_test_results").upsert(
    { physical_test_id: testId, student_id: studentId, period, value, updated_at: new Date().toISOString() },
    { onConflict: "physical_test_id,student_id,period" },
  );
  if (error) throw error;
}

export async function saveFitnessReference(reference: FitnessReference) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("No se ha podido identificar al alumno.");

  const { error } = await supabase
    .from("profiles")
    .update({ fitness_reference: reference, updated_at: new Date().toISOString() })
    .eq("id", auth.user.id);

  if (error) throw error;
}
