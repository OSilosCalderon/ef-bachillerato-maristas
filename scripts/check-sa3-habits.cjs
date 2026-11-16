const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(file, imports = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", "lib", file + ".ts"), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((id) => {
    if (!(id in imports)) throw new Error("Unexpected import " + id);
    return imports[id];
  }, module, module.exports);
  return module.exports;
}

const diary = load("sa3-food-diary");
const composition = load("sa3-food-composition", { "./sa3-food-actitudes": load("sa3-food-actitudes") });
const nutrition = load("sa3-food-nutrition", { "./sa3-food-composition": composition, "./sa3-food-diary": diary });
const habits = load("sa3-habits-types");
const { habitPdfData } = load("sa3-habit-pdf", { "./sa3-habits-types": habits });
const { buildPersonalPlanPdf } = load("personal-plan-pdf");

function entry(name, changes = {}) {
  return {
    id: name, day: "2026-11-16", name, meal: "Comida", group: "duda", processing: "duda",
    quantity: null, unit: "g", kcalPer100: null, ...changes,
  };
}

const legacyCoffee = entry("cafe con leche 250 ml");
const manualPasta = entry("Macarrones a la boloñesa", { quantity: 300, kcalPer100: 160 });
const label = entry("Producto de prueba", {
  quantity: 50, kcalPer100: 240, labelMacrosPer100: { protein: 10, carbs: 32, fat: 8 },
});
const ref = nutrition.findCatalogFood("Cuscús cocido");
assert.ok(ref, "The expanded Ciqual catalogue is available as a manual reference.");
const custom = entry("Ensalada de prueba sin ficha", { quantity: 100, manualReferenceId: ref.id });
const unknown = entry("Entrada de nombre desconocido", { quantity: 100, kcalPer100: 123 });
const [coffee, pasta, packaged, chosen, unmatched] = diary.readFoodDiary(JSON.stringify([legacyCoffee, manualPasta, label, custom, unknown]));
assert.equal(nutrition.foodEntryNutrition(coffee).source, "manual-reference");
assert.equal(nutrition.foodEntryNutrition(coffee).quantity, 250);
assert.equal(nutrition.foodEntryNutrition(coffee).unit, "ml");
assert.ok(nutrition.foodEntryNutrition(coffee).values.protein > 5);
assert.equal(nutrition.foodEntryNutrition(pasta).energy, 480, "Keep explicitly declared kcal.");
assert.equal(nutrition.foodEntryNutrition(pasta).estimate.parts.length, 4);
assert.deepEqual(nutrition.foodEntryNutrition(packaged).values, { kcal: 120, protein: 5, carbs: 16, fat: 4 });
assert.equal(nutrition.foodEntryNutrition({ ...manualPasta, labelMacrosPer100: label.labelMacrosPer100 }).source, "label");
assert.equal(nutrition.foodEntryNutrition(chosen).referenceName, ref.name);
assert.equal(nutrition.foodEntryNutrition(unmatched).values, null);
assert.equal(nutrition.foodEntryNutrition({ ...manualPasta, manualReferenceId: null }).values, null);
assert.equal(nutrition.foodEntryNutrition({ ...manualPasta, unit: "ml" }).values, null);
assert.equal(nutrition.foodEntryNutrition(entry("Agua", { unit: "ml", quantity: 250 })).energy, 0);
assert.equal(diary.readFoodDiary(JSON.stringify([entry("Vale", { labelMacrosPer100: { protein: 120, carbs: 100, fat: 0 } })]))[0].labelMacrosPer100, undefined);
const summary = nutrition.summarizeFoodDay([coffee, pasta, packaged, chosen, unmatched]);
assert.equal(summary.manualEstimates, 3);
assert.equal(summary.macroEntries, 4);
assert.equal(summary.known, 5);
assert.equal(diary.foodMacroEnergy(summary.macros).portions.reduce((total, { percent }) => total + percent, 0), 100);

const student = { id: "student-test", course_id: "course-test" };
const emptyRow = { focus_habit: "rutina-general", status: "draft", goal_completion: 0, reflection: "" };
const records = { healthy_habit_plans: null, healthy_habit_weekly_logs: [] };
const client = {
  auth: { async getUser() { return { data: { user: { id: "student-profile" } } }; } },
  from(table) {
    function read() {
      if (table === "students") return student;
      if (table === "profiles") return { display_name: "María de Prueba", class_group: "2º B" };
      return records[table];
    }
    return {
      select() { return this; }, eq() { return this; },
      async single() { return { data: records[table]?.find?.((row) => row.week_number === this.week) ?? read() }; },
      async maybeSingle() { return { data: read() }; },
      async order() { return { data: read() }; },
      upsert(payload, { onConflict }) {
        assert.equal(payload.student_id, student.id);
        assert.equal(payload.course_id, student.course_id);
        assert.equal(payload.sa_code, "SA3");
        if ("food_habit" in payload) assert.equal(Object.hasOwn(payload, "status"), false);
        if (table === "healthy_habit_plans") {
          assert.equal(onConflict, "student_id,course_id,sa_code");
          records[table] = { ...emptyRow, ...records[table], ...payload };
        } else {
          assert.equal(onConflict, "student_id,course_id,sa_code,week_number");
          this.week = payload.week_number;
          const existing = records[table].find((row) => row.week_number === this.week);
          const updated = { ...emptyRow, id: "week-" + this.week, ...existing, ...payload };
          records[table] = [...records[table].filter((row) => row.week_number !== this.week), updated];
        }
        return this;
      },
    };
  },
};

(async () => {
  const { createSa3HabitsStore } = load("sa3-habits-store", {
    "@/lib/sa3-habits-types": habits, "@/lib/supabase/client": { createClient: () => client },
  });
  const store = createSa3HabitsStore();
  const initial = await store.load();
  assert.equal(initial.diaryKey, "sa3-diario-v1:student-profile:course-test");
  assert.equal(initial.challenges.alimentacion.hasPlan, false);
  const food = {
    ...initial.challenges.alimentacion.plan, objective: "Preparar la merienda", status: "active",
    activityDays: { lunes: "mas", viernes: "menos", festivo: "mas" },
  };
  const other = { ...initial.challenges.otro.plan, focusHabit: "Pausas para descansar la vista", objective: "Hacer una pausa", status: "active" };
  await store.savePlan("alimentacion", food);
  const afterFood = await store.load();
  assert.equal(afterFood.challenges.otro.hasPlan, false, "A row created by the food tab must leave the other plan empty.");
  await store.savePlan("otro", other);
  await Promise.all([
    store.saveWeek("otro", { ...habits.emptyHabitWeek(1), goalCompletion: 60, reflection: "Pausa durante el estudio" }),
    store.saveWeek("alimentacion", { ...habits.emptyHabitWeek(1), goalCompletion: 80, reflection: "Merienda preparada" }),
    store.saveWeek("alimentacion", { ...habits.emptyHabitWeek(2), goalCompletion: 100, reflection: "Lo preparé el día anterior" }),
  ]);
  const refreshed = await store.load();
  assert.equal(refreshed.challenges.alimentacion.plan.objective, food.objective);
  assert.equal(refreshed.challenges.otro.plan.focusHabit, other.focusHabit);
  assert.deepEqual(refreshed.challenges.alimentacion.plan.activityDays, { lunes: "mas", viernes: "menos" });
  assert.equal(refreshed.challenges.otro.weeks[0].goalCompletion, 60);
  assert.equal(refreshed.challenges.otro.weeks[1].id, undefined);
  assert.equal(refreshed.challenges.alimentacion.weeks[0].goalCompletion, 80);
  assert.equal(refreshed.challenges.alimentacion.weeks[1].goalCompletion, 100);

  const plan = { ...refreshed.challenges.alimentacion.plan, finalReflection: "Preparar la merienda con antelación" };
  const pdf = habitPdfData("alimentacion", plan, refreshed.challenges.alimentacion.weeks.filter((week) => week.id), refreshed.studentName, refreshed.group);
  const raw = Buffer.from(buildPersonalPlanPdf(pdf)).toString("latin1");
  for (const text of ["RETO DE ALIMENTACIÓN", "María de Prueba", "Días de mayor gasto: lunes", "Merienda preparada", "Preparar la merienda con antelación"]) {
    assert.ok(raw.includes(Buffer.from(text, "latin1").toString("hex")), text);
  }
  assert.ok(raw.startsWith("%PDF-1.4") && raw.includes("/Logo Do"), "Uses the SA1 PDF renderer and school header.");
  console.log("SA3: manual estimates, label precedence, coverage, independent plans and weeks, retained activity days and the SA1 PDF template passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
