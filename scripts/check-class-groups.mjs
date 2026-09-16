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
