import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync("lib/class-groups.ts", "utf8");
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports });
const { FIRST_YEAR_CALENDAR_GROUPS, firstYearCalendarGroup } = module.exports;
assert.deepEqual([...FIRST_YEAR_CALENDAR_GROUPS], ["1ºA Bachillerato", "1ºB Bachillerato"]);
assert.equal(firstYearCalendarGroup("1ºA"), "1ºA Bachillerato");
assert.equal(firstYearCalendarGroup("1ºA Bachillerato"), "1ºA Bachillerato");
assert.equal(firstYearCalendarGroup("1ºB"), "1ºB Bachillerato");
assert.equal(firstYearCalendarGroup("1ºB Bachillerato"), "1ºB Bachillerato");
assert.equal(firstYearCalendarGroup("2º Bachillerato"), null);
assert.equal(firstYearCalendarGroup(null), null);
console.log("Class groups: short and full first-year labels map only to their own calendar.");

const calendarSource = fs.readFileSync("lib/first-year-personal-plan-calendar.ts", "utf8");
const calendarModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(calendarSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module: calendarModule, exports: calendarModule.exports });
const { FIRST_YEAR_PLAN_SESSIONS, FIRST_YEAR_PLAN_WEEK } = calendarModule.exports;
for (const group of FIRST_YEAR_CALENDAR_GROUPS) {
  const sessions = FIRST_YEAR_PLAN_SESSIONS[group];
  assert.equal(sessions.length, 8);
  assert.equal(new Set(sessions.map((session) => session.date)).size, 8);
  assert.ok(sessions.every((session) => session.date >= "2026-10-26" && session.date <= "2026-11-23"));
  assert.ok(sessions.every((session) => FIRST_YEAR_PLAN_WEEK[group].some((slot) => slot.label === session.day && slot.start === session.start && slot.end === session.end)));
}
console.log("First-year personal plan: eight real group sessions from 26 October to 23 November passed.");

const secondYearSource = fs.readFileSync("lib/second-year-personal-plan-calendar.ts", "utf8");
const secondYearModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(secondYearSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module: secondYearModule, exports: secondYearModule.exports });
const { SECOND_YEAR_PLAN_START, SECOND_YEAR_PLAN_SESSIONS } = secondYearModule.exports;
assert.equal(SECOND_YEAR_PLAN_START, "2026-10-12");
assert.equal(SECOND_YEAR_PLAN_SESSIONS.length, 10);
assert.equal(new Set(SECOND_YEAR_PLAN_SESSIONS.map((session) => session.date)).size, 10);
assert.equal(SECOND_YEAR_PLAN_SESSIONS[0].date, "2026-10-13");
assert.equal(SECOND_YEAR_PLAN_SESSIONS.at(-1).date, "2026-10-28");
assert.ok(SECOND_YEAR_PLAN_SESSIONS.every((session) => ["Lunes", "Martes", "Miércoles", "Jueves"].includes(session.day)));
console.log("Second-year personal plan: ten teaching sessions in the period beginning 12 October passed.");

