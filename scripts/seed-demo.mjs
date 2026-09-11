import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const teacherEmail = process.env.DEMO_TEACHER_EMAIL;
const teacherPassword = process.env.DEMO_TEACHER_PASSWORD;
const studentPassword = process.env.DEMO_STUDENT_PASSWORD;

if (!url || !serviceKey || !teacherEmail || !teacherPassword || !studentPassword) {
  console.error("Faltan variables. Consulta README: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_TEACHER_EMAIL, DEMO_TEACHER_PASSWORD y DEMO_STUDENT_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function ensureAuthUser(email, password) {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((user) => user.email === email);
  if (existing) return existing;
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return data.user;
}

async function main() {
  const teacher = await ensureAuthUser(teacherEmail, teacherPassword);
  const { error: teacherProfileError } = await supabase.from("profiles").upsert({
    id: teacher.id, role: "teacher", display_name: "Profesor/a Demo", class_group: null,
  });
  if (teacherProfileError) throw teacherProfileError;

  let { data: course } = await supabase.from("courses").select("id").eq("academic_year", "2026/27").maybeSingle();
  if (!course) {
    const created = await supabase.from("courses").insert({ name: "EF 1º Bachillerato", academic_year: "2026/27", is_active: true }).select("id").single();
    if (created.error) throw created.error;
    course = created.data;
  }

  const situations = [
    ["SA1","Salud y calidad de vida",1],
    ["SA2","Habilidades motrices específicas y deportes",2],
    ["SA3","Ocio activo y juegos alternativos",3],
  ];
  for (const [code,title,position] of situations) {
    const { error } = await supabase.from("learning_situations").upsert({
      course_id: course.id, code, title, position, published: true,
    }, { onConflict: "course_id,code" });
    if (error) throw error;
  }

  for (let i = 1; i <= 6; i++) {
    const number = String(i).padStart(2, "0");
    const email = `demo.alumno${number}@example.invalid`;
    const user = await ensureAuthUser(email, studentPassword);
    const group = i <= 3 ? "1º Bach A" : "1º Bach B";

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id, role: "student", display_name: `Alumno ${number}`, class_group: group,
    });
    if (profileError) throw profileError;

    const { error: studentError } = await supabase.from("students").upsert({
      profile_id: user.id, course_id: course.id, active: true,
    }, { onConflict: "profile_id" });
    if (studentError) throw studentError;
  }

  console.log("Seed DEMO creado: curso, 3 SA, 1 profesor y 6 alumnos ficticios.");
  console.log("No se imprimen contraseñas ni claves sensibles.");
}

main().catch((error) => {
  console.error("Error al generar datos DEMO:", error instanceof Error ? error.message : "Error desconocido");
  process.exit(1);
});
