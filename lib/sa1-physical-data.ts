import { createClient } from "@/lib/supabase/client";
import type { AssessmentPeriod, FitnessReference, PhysicalTest } from "@/lib/sa1-types";

export async function loadPhysicalTestsForCurrentStudent() {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("No se ha podido identificar al alumno.");

  const [{ data: student, error: studentError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from("students").select("id").eq("profile_id", auth.user.id).single(),
    supabase.from("profiles").select("fitness_reference").eq("id", auth.user.id).single(),
  ]);

  if (studentError || !student) throw new Error("No se ha encontrado el perfil de alumno.");
  if (profileError) throw new Error("No se ha podido cargar la referencia de comparación.");

  const [{ data: rows, error: testsError }, { data: results, error: resultsError }] = await Promise.all([
    supabase
      .from("physical_tests")
      .select("id,name,description,unit,direction,instructions,active,benchmark_male,benchmark_female")
      .eq("active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("physical_test_results")
      .select("physical_test_id,period,value,updated_at")
      .eq("student_id", student.id),
  ]);

  if (testsError) throw new Error("No se han podido cargar las pruebas físicas.");
  if (resultsError) throw new Error("No se han podido cargar tus resultados.");

  const values = new Map<string, number>();
  for (const item of results ?? []) {
    const numericValue = Number(item.value);
    if (Number.isFinite(numericValue)) {
      values.set(`${item.physical_test_id}:${item.period}`, numericValue);
    }
  }

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

export async function savePhysicalResult(
  studentId: string,
  testId: string,
  period: AssessmentPeriod,
  value: number,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("physical_test_results")
    .upsert(
      {
        physical_test_id: testId,
        student_id: studentId,
        period,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "physical_test_id,student_id,period" },
    )
    .select("physical_test_id,student_id,period,value,updated_at")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Supabase no ha confirmado el registro guardado.");

  return {
    ...data,
    value: Number(data.value),
  };
}

export async function saveFitnessReference(reference: FitnessReference) {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("No se ha podido identificar al alumno.");

  const { data, error } = await supabase
    .from("profiles")
    .update({ fitness_reference: reference, updated_at: new Date().toISOString() })
    .eq("id", auth.user.id)
    .select("fitness_reference")
    .single();

  if (error) throw error;
  if (!data || data.fitness_reference !== reference) {
    throw new Error("La referencia no ha quedado guardada en el perfil.");
  }

  return reference;
}
