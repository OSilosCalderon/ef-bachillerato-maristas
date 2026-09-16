import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const migration = read("supabase/migrations/20260916065843_psychological_questionnaires_sa1.sql");
const securityMigration = read("supabase/migrations/20260916071953_secure_questionnaire_policy_helpers.sql");
const student = read("components/psychological-questionnaires.tsx");
const teacher = read("components/teacher-psychological-reports.tsx");

const required = [
  [migration, "('GOES',10,'Otros no lo realizan tan bien como yo'", "Los 10 ítems GOES no están completos."],
  [migration, "('BPNES',12,'Me siento muy cómodo/a con los/as compañeros/as'", "Los 12 ítems BPNES no están completos."],
  [migration, "questionnaire_question_dimensions", "Falta separar las dimensiones de corrección."],
  [migration, "question_dimensions_teacher_only", "Falta la política docente de dimensiones."],
  [securityMigration, "create schema if not exists private", "Los ayudantes RLS deben quedar fuera del API público."],
  [student, "Esta vista muestra exclusivamente tus elecciones", "La vista del alumnado no explica su límite de acceso."],
  [teacher, "Informe psicológico educativo individual", "Falta el informe individual docente."],
  [teacher, "Informe grupal", "Falta el informe grupal docente."],
];

for (const [source, fragment, message] of required) {
  if (!source.includes(fragment)) throw new Error(message);
}
if (student.includes("questionnaire_option_scores") || student.includes("questionnaire_question_dimensions")) {
  throw new Error("El cliente del alumnado no debe consultar claves ni dimensiones de puntuación.");
}

console.log("Cuestionarios GOES/BPNES: estructura, informes y separación de permisos verificadas.");
