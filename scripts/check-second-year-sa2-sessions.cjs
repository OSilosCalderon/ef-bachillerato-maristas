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
console.log("SA2 session log: ten shared plan dates, fixed schedule, allowed reflection fields, star effort scale and legacy selector removal passed.");
