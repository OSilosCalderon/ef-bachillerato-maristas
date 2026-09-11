import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const academicYear = process.env.COURSE_ACADEMIC_YEAR || "2026/27";
const courseName = process.env.COURSE_NAME || "EF 1º Bachillerato";

if (!url || !serviceKey) {
  console.error("Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  let { data: course, error: courseLookupError } = await supabase
    .from("courses")
    .select("id,name,academic_year")
    .eq("academic_year", academicYear)
    .maybeSingle();
  if (courseLookupError) throw courseLookupError;

  if (!course) {
    const created = await supabase
      .from("courses")
      .insert({ name: courseName, academic_year: academicYear, is_active: true })
      .select("id,name,academic_year")
      .single();
    if (created.error) throw created.error;
    course = created.data;
  }

  const situations = [
    { code: "SA1", title: "Salud y calidad de vida", position: 1 },
    { code: "SA2", title: "Habilidades motrices específicas y deportes", position: 2 },
    { code: "SA3", title: "Ocio activo y juegos alternativos", position: 3 },
  ];

  for (const situation of situations) {
    const { error } = await supabase.from("learning_situations").upsert(
      { course_id: course.id, ...situation, published: true },
      { onConflict: "course_id,code" },
    );
    if (error) throw error;
  }

  console.log(`Curso listo: ${course.name} · ${course.academic_year}`);
  console.log(`COURSE_ID=${course.id}`);
}

main().catch((error) => {
  console.error("Error al inicializar el curso:", error instanceof Error ? error.message : "Error desconocido");
  process.exit(1);
});
