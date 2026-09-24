const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");

const root = process.cwd();
const sourcePath = path.join(root, "lib", "personal-plan-pdf.ts");
const exercisesPath = path.join(root, "lib", "second-year-exercises.ts");
const outputDir = path.join(root, "tmp", "pdfs");
const outputPath = path.join(outputDir, "plan-personal-prueba.pdf");
const code = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loaded = new Module(sourcePath, module);
loaded.filename = sourcePath;
loaded.paths = module.paths;
loaded._compile(code, sourcePath);

const sessions = Array.from({ length: 12 }, (_, index) => [
  `• Sesión ${index + 1} - ${13 + index} de octubre - Circuito global - 3 series - descanso entre series: 2 min`,
  "1. Sentadilla sin carga - 2 x 10 repeticiones - descanso 45 s",
  "2. Carrera controlada - 3 min - descanso 60 s",
]).flat();
const bytes = loaded.exports.buildPersonalPlanPdf({
  studentName: "Alumno de prueba",
  courseLabel: "2º Bachillerato",
  group: "2º Bachillerato",
  status: "En marcha",
  capacity: "Condición física general",
  sections: [
    { title: "1. Punto de partida", lines: ["Análisis inicial con fuerza, resistencia, velocidad y movilidad."] },
    { title: "2. Objetivos y temporalización", lines: ["Objetivo principal: mejorar la resistencia de forma progresiva.", "Cómo comprobaré mi objetivo principal: compararé el tiempo de carrera y mi esfuerzo percibido.", "3 semanas - 4 sesiones/semana - 55 min por sesión"] },
    { title: "3. Calendario, tareas y cargas", lines: sessions },
    { title: "4. Progresión y recuperación", lines: ["Progresión: aumentar una variable cada semana.", "Recuperación: alternar sesiones y cuidar el sueño."] },
    { title: "5. Reflexión final", lines: ["Conclusiones: revisar los resultados finales."] },
  ],
});
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, bytes);
const text = Buffer.from(bytes).toString("latin1");
assert.ok(text.startsWith("%PDF-1.4"));
assert.ok(text.includes("/Type /Catalog"));
const pageCount = (text.match(/\/Type \/Page\b/g) || []).length;
assert.ok(pageCount >= 1);
assert.ok(text.includes("/Subtype /Image"));
assert.equal((text.match(/\/Subtype \/Image/g) || []).length, pageCount);
assert.ok(text.includes("/ASCIIHexDecode /DCTDecode"));
assert.equal((text.match(/\/Logo Do/g) || []).length, pageCount);
assert.ok(!text.includes(Buffer.from("5. Reflexión final", "latin1").toString("hex")));
assert.ok(text.includes(Buffer.from("2. Objetivos y temporalización", "latin1").toString("hex")));
assert.ok(!text.includes(Buffer.from("Objetivos y dosis general", "latin1").toString("hex")));
assert.ok(bytes.length > 3000);
const exerciseCode = ts.transpileModule(fs.readFileSync(exercisesPath, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exerciseModule = new Module(exercisesPath, module);
exerciseModule.filename = exercisesPath;
exerciseModule.paths = module.paths;
exerciseModule._compile(exerciseCode, exercisesPath);
assert.ok(exerciseModule.exports.secondYearExercises.length >= 30);
assert.match(fs.readFileSync(path.join(root, "components", "personal-plan-task-editor.tsx"), "utf8"), /Otro ejercicio: escribirlo manualmente/);
console.log(`PDF plan: valid structure, pagination, direct download bytes, expanded catalogue and custom exercise passed. ${outputPath}`);
