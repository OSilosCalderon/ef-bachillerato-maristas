import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const cache = new Map();
function load(path) {
  if (cache.has(path)) return cache.get(path);
  const module = { exports: {} };
  const source = fs.readFileSync(path, "utf8");
  const require = (name) => load(`${name.replace("@/", "")}.ts`);
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports, require });
  cache.set(path, module.exports);
  return module.exports;
}
const { theoryProgressTotals, physicalPeriodTotals } = load("lib/second-year-progress.ts");
const slugs = ["2bach-sa1", "2bach-sa2", "2bach-sa3", "2bach-sa4", "2bach-sa5", "2bach-sa6"];
const totals = theoryProgressTotals(slugs, {
  "2bach-sa1": { completed: true, quizScore: 80 },
  "2bach-sa2": { completed: true, quizScore: 0 },
  "2bach-sa3": { completed: false, quizScore: 67 },
  "1bach-topic": { completed: true, quizScore: 100 },
});
assert.equal(totals.readPercent, 33);
assert.equal(totals.attemptedPercent, 50); // Una puntuación de cero es un test realizado.
assert.equal(totals.passedPercent, 33);
assert.equal(totals.averageScore, 49); // No incluye tests pendientes ni módulos de 1º.
assert.equal(theoryProgressTotals(slugs, {}).averageScore, null);
assert.equal(theoryProgressTotals([], {}).readPercent, 0);

const tests = [
  { id: "distance", direction: "higher_better", benchmarkMale: 100, benchmarkFemale: 80, september: 120, december: 130 },
  { id: "time", direction: "lower_better", benchmarkMale: 10, benchmarkFemale: 12, september: 10 },
  { id: "missing", direction: "higher_better", september: 50 },
  { id: "zero", direction: "lower_better", benchmarkMale: 10, september: 0 },
];
const before = physicalPeriodTotals(tests, "september", "masculino");
assert.equal(before.recorded, 4);
assert.equal(before.compared, 2);
assert.equal(before.points, 220);
assert.equal(before.benchmarkPoints, 200);
assert.ok(Math.abs(before.index - 110) < 0.00001);
const after = physicalPeriodTotals(tests, "december", "masculino");
assert.equal(after.points, 130);
assert.equal(after.benchmarkPoints, 100); // Mismas pruebas que el resultado personal de esta toma.
assert.equal(after.index, 130);
assert.equal(physicalPeriodTotals(tests, "september", "femenino").index, 135);
assert.equal(physicalPeriodTotals(tests, "september", null).index, null);
assert.equal(physicalPeriodTotals([], "december", "masculino").points, null);
console.log("Second-year progress: independent reading and quizzes, zero scores, course isolation, mixed units, timed tests, partial periods and missing references passed.");

const { physicalCapacity, physicalCapacityTotals } = load("lib/second-year-progress.ts");
for (const [name, expected] of [["Test 5 × 10 m", "Velocidad"], ["Sprint de 30 metros con salida lanzada", "Velocidad"], ["Sprint de 60 metros desde posición estática", "Velocidad"], ["Flexión lateral del tronco", "Flexibilidad / movilidad"], ["Flexiones de brazos", "Fuerza"], ["Salto horizontal con contramovimiento", "Fuerza"], ["Test de abdominales en 1 minuto", "Fuerza"], ["Carrera de 12 minutos (Test de Cooper)", "Resistencia"], ["Test de Course Navette", "Resistencia"], ["Test de extensión de hombros", "Flexibilidad / movilidad"], ["Test de Sit and Reach", "Flexibilidad / movilidad"], ["Prueba nueva", "Otras pruebas"]]) assert.equal(physicalCapacity(name), expected);
const capacity = physicalCapacityTotals([{ ...tests[0], name: "Cooper" }, { ...tests[1], name: "Course Navette" }], "masculino")[0];
assert.equal(capacity.september.compared, 2);
assert.equal(capacity.december.compared, 1);
assert.equal(capacity.pairedCount, 1);
assert.equal(capacity.pairedSeptember, 120);
assert.equal(capacity.pairedDecember, 130);
assert.equal(physicalCapacityTotals([{ ...tests[0], name: "Cooper" }], null)[0].september.index, null);
console.log("Capacity grouping and like-for-like period comparison passed.");

assert.equal(physicalPeriodTotals([{direction: "higher_better", benchmarkMale: 10, september: 0}], "september", "masculino").index, 0);
assert.equal(physicalPeriodTotals([{direction: "higher_better", benchmarkMale: Infinity, september: 10}], "september", "masculino").index, null);

// Los nueve temas de 1º usan sus slugs originales: los resultados de 2º no entran en sus totales.
const { trainingTheoryTopics } = load("lib/training-theory-topics.ts");
const { flexibilityTheoryTopic } = load("lib/training-theory-flexibility.ts");
const firstYearSlugs = [...trainingTheoryTopics, flexibilityTheoryTopic].map((topic) => topic.slug);
assert.equal(firstYearSlugs.length, 9);
const firstYearTotals = theoryProgressTotals(firstYearSlugs, {
  [firstYearSlugs[0]]: { completed: true, quizScore: 80 },
  [firstYearSlugs[1]]: { completed: true, quizScore: 0 },
  [firstYearSlugs[2]]: { completed: false, quizScore: 67 },
  "2bach-sa1": { completed: true, quizScore: 100 },
});
assert.equal(firstYearTotals.total, 9);
assert.equal(firstYearTotals.readPercent, 22);
assert.equal(firstYearTotals.attemptedPercent, 33);
assert.equal(firstYearTotals.passedPercent, 22);
assert.equal(firstYearTotals.averageScore, 49);
assert.equal(theoryProgressTotals(firstYearSlugs, {}).averageScore, null);
console.log("First-year progress: nine original topics, separate course results, zero-score attempts and pending tests passed.");
