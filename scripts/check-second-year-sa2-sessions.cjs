const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");

const calendarSource = fs.readFileSync("lib/second-year-personal-plan-calendar.ts", "utf8");
const calendarModule = { exports: {} };
vm.runInNewContext(
  ts.transpileModule(calendarSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { module: calendarModule, exports: calendarModule.exports },
);
const { SECOND_YEAR_PLAN_SESSIONS } = calendarModule.exports;
assert.equal(SECOND_YEAR_PLAN_SESSIONS.length, 10, "El calendario del plan debe ofrecer diez sesiones.");
assert.equal(SECOND_YEAR_PLAN_SESSIONS[0].date, "2026-10-13");
assert.equal(SECOND_YEAR_PLAN_SESSIONS[9].date, "2026-10-28");

const tracker = fs.readFileSync("components/second-year-sa2-tracker.tsx", "utf8");
assert.match(tracker, /SECOND_YEAR_PLAN_SESSIONS\.map\(\(session, index\)/, "La selección debe venir del calendario compartido.");
assert.match(tracker, /session_date: selectedSession\.date/, "La fecha se debe guardar desde la sesión del plan.");
assert.match(tracker, /Esfuerzo percibido · 1–10/, "El esfuerzo debe usar la escala solicitada.");
assert.ok(tracker.includes("aria-label={`Esfuerzo ${rating} de 10`}"), "Cada estrella debe ser accesible.");
assert.match(tracker, /update\("rpe", String\(rating\)\)/, "Las estrellas deben guardar el esfuerzo seleccionado.");
assert.match(tracker, /durationMinutes: string/);
assert.match(tracker, /completionPercent: number/);
assert.match(tracker, /modifications: string/);
assert.match(tracker, /reflection: string/);
assert.doesNotMatch(tracker, /Array\.from\(\{ length: 20 \}/, "No deben aparecer veinte sesiones.");
assert.doesNotMatch(tracker, /name="weekNumber"|name="sessionDate"|Objetivo de la sesión|Trabajo realizado|>Estado</, "El alumno no debe editar la planificación desde el registro.");
const teacherActions = fs.readFileSync("app/profesor/actions.ts", "utf8");
const teacherDashboard = fs.readFileSync("components/teacher-activity-dashboard.tsx", "utf8");
const activityLoader = fs.readFileSync("lib/teacher-activity-server.ts", "utf8");
const evaluationMigration = fs.readFileSync("supabase/migrations/20261015151315_add_teacher_session_evaluations.sql", "utf8");
assert.match(evaluationMigration, /enable row level security/i, "Las valoraciones deben tener RLS.");
assert.match(evaluationMigration, /grant select, insert, update .* authenticated/i, "El rol autenticado debe tener permisos explícitos.");
assert.match(evaluationMigration, /training_session_evaluations_insert_teacher[\\s\\S]*is_teacher/i, "Solo profesorado puede insertar valoraciones.");
assert.match(evaluationMigration, /training_session_evaluations_select_own_or_teacher[\\s\\S]*current_student_id/i, "El alumno solo debe leer sus valoraciones propias.");
assert.match(teacherActions, /requireRole\\("teacher"\\)/, "Guardar la valoración requiere rol docente.");
assert.match(teacherActions, /session_number < 1 \\|\\| session\\.session_number > 10/, "La acción limita la valoración al conjunto de diez sesiones.");
assert.match(teacherDashboard, /saveSecondYearSessionEvaluation/, "La vista docente debe enviar la valoración.");
assert.match(teacherDashboard, /teacher_score/);
assert.match(activityLoader, /training_session_evaluations/, "La vista docente carga las valoraciones guardadas.");
assert.match(tracker, /Valoración del profesor/, "El alumno debe ver la valoración junto a su registro.");
assert.match(tracker, /training_session_evaluations/, "El seguimiento del alumno consulta sus valoraciones con RLS.");
console.log("SA2 session grading: teacher-only writes, own-student reads, ten-session scope and paired views passed.");
