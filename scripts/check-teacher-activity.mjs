import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/teacher-activity.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports });
const { categorySummary, evaluationInstrumentKey, isEvaluationInstrumentAchieved, physicalComparison, mean } = module.exports;
const students = [{ id: "a" }, { id: "b" }, { id: "c" }];
const physical = (studentId, period, score) => ({ studentId, category: "physical", score, details: { physical_test_id: "sprint", period } });
const rows = [physical("a", "september", 10), physical("a", "december", 8), physical("b", "september", 12), physical("outside", "december", 100)];
const result = physicalComparison(rows, "a", { id: "sprint", direction: "lower_better" }, new Set(["a", "b", "c"]));
assert.equal(result.improvement, 20);
assert.equal(result.initialMean, 11);
assert.equal(result.finalMean, 8);
assert.equal(result.initialN, 2);
assert.equal(result.pairedN, 1);
assert.equal(result.pairedInitial, 10);
assert.equal(result.pairedFinal, 8);
assert.equal(physicalComparison(rows, "c", { id: "sprint" }, new Set(["c"])).improvement, null);
assert.equal(mean([]), null);
assert.equal(mean([0, 100]), 50);
const evaluationRow = { id: "q", studentId: "a", category: "questionnaires", sa: "SA1", title: "GOES inicial", date: "", status: "", score: null, details: {} };
assert.equal(evaluationInstrumentKey(evaluationRow), "SA1:questionnaires:GOES inicial");
assert.equal(isEvaluationInstrumentAchieved(evaluationRow), false);
assert.equal(isEvaluationInstrumentAchieved({ ...evaluationRow, status: "submitted" }), true);
assert.equal(isEvaluationInstrumentAchieved({ ...evaluationRow, category: "quizzes", score: 67 }), true);
assert.equal(isEvaluationInstrumentAchieved({ ...evaluationRow, category: "quizzes", score: 66 }), false);
assert.equal(isEvaluationInstrumentAchieved({ ...evaluationRow, category: "physical", score: 0 }), true);
const summary = categorySummary(rows, students, "physical");
assert.equal(summary.count, 3);
assert.equal(summary.participants, 2);
assert.equal(summary.perStudent, 1);
assert.ok(Math.abs(summary.coverage - 200 / 3) < 0.0001);
assert.equal(categorySummary(rows, [], "physical").coverage, 0);
const loader = fs.readFileSync("lib/teacher-activity-server.ts", "utf8");
assert.match(loader, /code === "42P01" \|\| code === "PGRST205"/);
assert.match(loader, /optionalTables\.has\(table\)/);
assert.doesNotMatch(loader, /theoretical_content_reads/);
const dashboard = fs.readFileSync("components/teacher-activity-dashboard.tsx", "utf8");
assert.match(dashboard, /Descargar plan en PDF/);
assert.match(dashboard, /Descargar informe PDF de esta SA/);
assert.match(dashboard, /row\.sa === sa && row\.category !== "plans"/);
assert.match(dashboard, /Fecha de realización o registro/);
assert.match(dashboard, /Informe individual de resultados/);
assert.match(dashboard, /Resumen de cada alumno\/a/);
assert.match(dashboard, /instrument\.sa/);
const pdfModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/personal-plan-pdf.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { module: pdfModule, exports: pdfModule.exports, atob, Uint8Array, Map });
const reportPdf = pdfModule.exports.buildPersonalPlanPdf({
  studentName: "Alumna de prueba", courseLabel: "1º Bachillerato", group: "1ºA", status: "Resultados registrados", capacity: "SA2",
  documentTitle: "INFORME DE RESULTADOS", documentSubtitle: "SA2 · Condición física",
  footerText: "Informe individual de resultados",
  metaItems: [{ label: "SITUACIÓN", value: "SA2" }, { label: "GRUPO", value: "1ºA" }, { label: "DOCUMENTO", value: "Informe individual" }],
  sections: Array.from({ length: 14 }, (_, index) => ({ title: `Instrumento ${index + 1}`, lines: Array.from({ length: 8 }, (__, line) => `Registro ${line + 1}: resultado de la prueba y estado`) })),
});
const pdfText = Buffer.from(reportPdf).toString("latin1");
const pageCount = (pdfText.match(/\\/Type \\/Page /g) ?? []).length;
assert.ok(pageCount > 1, "long reports paginate");
assert.equal((pdfText.match(/\\/Logo Do/g) ?? []).length, pageCount, "the Maristas logo appears on every page");
assert.ok(pdfText.includes(`<${Buffer.from("INFORME DE RESULTADOS").toString("hex")}>`), "the shared PDF template uses the report title");
console.log("Teacher activity: group isolation, evaluation progress, individual SA report export and branded PDF pagination passed.");
