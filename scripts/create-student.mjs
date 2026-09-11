import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.STUDENT_EMAIL;
const password = process.env.STUDENT_PASSWORD;
const displayName = process.env.STUDENT_DISPLAY_NAME;
const classGroup = process.env.STUDENT_CLASS_GROUP || "1º Bachillerato";
const academicYear = process.env.COURSE_ACADEMIC_YEAR || "2026/27";

if (!url || !serviceKey || !email || !password || !displayName) {
  console.error("Define NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STUDENT_EMAIL, STUDENT_PASSWORD y STUDENT_DISPLAY_NAME.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("academic_year", academicYear)
    .eq("is_active", true)
    .maybeSingle();
  if (courseError) throw courseError;
  if (!course) throw new Error(`No existe un curso activo para ${academicYear}. Ejecuta npm run init:course primero.`);

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError) throw userError;

  const userId = userData.user.id;
  try {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role: "student",
      display_name: displayName,
      class_group: classGroup,
    });
    if (profileError) throw profileError;

    const { error: studentError } = await supabase.from("students").insert({
      profile_id: userId,
      course_id: course.id,
      active: true,
    });
    if (studentError) throw studentError;
  } catch (error) {
    await supabase.auth.admin.deleteUser(userId);
    throw error;
  }

  console.log(`Alumno/a creado/a: ${displayName} (${email}) · ${classGroup}`);
  console.log("La contraseña no se muestra en consola.");
}

main().catch((error) => {
  console.error("Error al crear alumno/a:", error instanceof Error ? error.message : "Error desconocido");
  process.exit(1);
});
