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
assert.match(tracker, /planSessions\.map\(\(session, index\)/, "La selección debe venir del calendario compartido.");
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
const teacherGrading = fs.readFileSync("components/teacher-session-grading.tsx", "utf8");
const activityLoader = fs.readFileSync("lib/teacher-activity-server.ts", "utf8");
const evaluationMigration = fs.readFileSync("supabase/migrations/20261015151315_add_teacher_session_evaluations.sql", "utf8");
assert.ok(evaluationMigration.toLowerCase().includes("enable row level security"), "Las valoraciones deben tener RLS.");
assert.ok(/grant select, insert, update .* authenticated/i.test(evaluationMigration), "El rol autenticado debe tener permisos explícitos.");
assert.ok(evaluationMigration.includes("training_session_evaluations_insert_teacher") && evaluationMigration.includes("public.is_teacher()"), "Solo profesorado puede insertar valoraciones.");
assert.ok(evaluationMigration.includes("training_session_evaluations_select_own_or_teacher") && evaluationMigration.includes("public.current_student_id()"), "El alumno solo debe leer sus valoraciones propias.");
assert.ok(teacherActions.includes('requireRole("teacher")'), "Guardar la valoración requiere rol docente.");
assert.ok(teacherActions.includes("input.sessionNumber > (year === 1 ? 8 : 10)"), "La acción limita la valoración al conjunto de diez sesiones.");
assert.ok(teacherGrading.includes("saveSecondYearSessionEvaluation"), "La vista docente debe enviar la valoración.");
assert.ok(teacherDashboard.includes("teacher_score"));
assert.ok(activityLoader.includes("training_session_grade_results"), "La vista docente carga las valoraciones guardadas.");
assert.ok(tracker.includes("Valoración del profesor"), "El alumno debe ver la valoración junto a su registro.");
assert.ok(tracker.includes("training_session_grade_results"), "El seguimiento del alumno consulta sus valoraciones con RLS.");
console.log("SA2 session grading: teacher-only writes, own-student reads, ten-session scope and paired views passed.");

const gradingSource = fs.readFileSync("lib/teacher-session-grading.ts", "utf8");
const gradingModule = { exports: {} };
vm.runInNewContext(
  ts.transpileModule(gradingSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
  { module: gradingModule, exports: gradingModule.exports, require: (name) => {
    if (name === "./second-year-personal-plan-calendar") return calendarModule.exports;
    const module={exports:{}};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/"+name.slice(2)+".ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module,exports:module.exports});
    return module.exports;
  } },
);
const { teacherSessionSlots, parseTeacherSessionScore, teacherSessionScore } = gradingModule.exports;
const log = (id, studentId, number, date, overrides = {}) => ({ id: `journals-${id}`, studentId, category: "journals", sa: "SA2", title: "Sesión", date, status: "completed", score: 100, details: { id, session_number: number }, ...overrides });
const input = [
  log("older", "a", 1, "2026-10-13"),
  log("other-student", "b", 2, "2026-10-14"),
  log("latest", "a", 1, "2026-10-15", { details: { id: "latest", session_number: 1, teacher_score: 0 } }),
  log("third", "a", 3, "2026-10-15"),
  log("legacy", "a", 11, "2026-10-15"),
  log("fractional", "a", 1.5, "2026-10-15"),
  log("other-sa", "a", 2, "2026-10-14", { sa: "SA1" }),
  log("other-category", "a", 2, "2026-10-14", { category: "plans" }),
];
const slots = teacherSessionSlots(input, "a");
assert.equal(slots.length, 10);
assert.equal(slots.map((slot) => slot.number).join(","), "1,2,3,4,5,6,7,8,9,10");
assert.equal(slots[0].record.details.id, "latest", "Ante duplicados se muestra el registro más reciente.");
assert.equal(slots[1].record, null, "No se deben mezclar alumnos, situaciones o instrumentos.");
assert.equal(slots[2].record.details.id, "third");
assert.equal(slots.filter((slot) => slot.record).length, 2, "Los registros antiguos fuera de las diez sesiones se conservan sin incorporarlos a la calificación.");
assert.equal(input[0].details.id, "older", "Preparar la vista no debe modificar los registros de entrada.");
assert.equal(teacherSessionScore(slots[0].record.details.teacher_score), 0, "Una nota cero se conserva y no equivale a pendiente.");
assert.equal(teacherSessionScore(null), null);
assert.equal(parseTeacherSessionScore("8,5"), 8.5, "Se deben aceptar décimas con coma.");
assert.equal(parseTeacherSessionScore("8.5"), 8.5);
assert.equal(parseTeacherSessionScore("0"), 0);
assert.equal(parseTeacherSessionScore("10"), 10);
for (const invalid of ["", " ", "-1", "10,1", "8.55", "Infinity", "nota"]) assert.equal(parseTeacherSessionScore(invalid), null);
console.log("SA2 grading view: ten slots, student and instrument isolation, legacy preservation, zero grades and Spanish decimals passed.");


const independent = teacherSessionSlots(input, "a", [
  { studentId: "a", number: 2, score: 0, comment: "Pendiente de seguimiento", updatedAt: "2026-10-19" },
  { studentId: "b", number: 4, score: 10, comment: "Privado", updatedAt: "2026-10-19" },
]);
assert.equal(independent[1].record, null);
assert.equal(independent[1].evaluation.score, 0, "Se puede calificar con cero una sesión sin seguimiento.");
assert.equal(independent[3].evaluation, null, "Las notas de otro alumno no deben mezclarse.");
assert.equal(independent.filter((slot) => slot.record).length, 2, "Una nota no se cuenta como entrega.");
console.log("Unregistered sessions: independent grades, zero, peer isolation and honest submission counts passed.");

