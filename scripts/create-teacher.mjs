import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.TEACHER_EMAIL;
const password = process.env.TEACHER_PASSWORD;
const displayName = process.env.TEACHER_DISPLAY_NAME || "Profesor/a";

if (!url || !serviceKey || !email || !password) {
  console.error("Define NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEACHER_EMAIL y TEACHER_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (error) throw error;

const { error: profileError } = await supabase.from("profiles").insert({
  id: data.user.id,
  role: "teacher",
  display_name: displayName,
  class_group: null,
});
if (profileError) {
  await supabase.auth.admin.deleteUser(data.user.id);
  throw profileError;
}

console.log(`Profesor creado para ${email}. La contraseña no se muestra en consola.`);
