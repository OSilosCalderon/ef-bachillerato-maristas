export const foodGroups = [
  { id: "hortalizas", label: "Hortalizas", color: "#198364" },
  { id: "fruta", label: "Fruta", color: "#e69941" },
  { id: "cereales", label: "Cereales y tubérculos", color: "#5477a7" },
  { id: "legumbres", label: "Legumbres, frutos secos y semillas", color: "#8b6cab" },
  { id: "proteinas", label: "Huevos, pescado y carne", color: "#c36f63" },
  { id: "lacteos", label: "Lácteos y alternativas", color: "#4ba6b1" },
  { id: "grasas", label: "Aceites y grasas", color: "#b09957" },
  { id: "agua", label: "Agua", color: "#7da4d5" },
  { id: "otros", label: "Otros alimentos y bebidas", color: "#799092" },
  { id: "duda", label: "Por clasificar", color: "#b1bab9" },
] as const;

export const processingGroups = [
  { id: "nova1", label: "Sin procesar o mínimamente procesado", color: "#198364" },
  { id: "nova2", label: "Ingrediente culinario", color: "#b09957" },
  { id: "nova3", label: "Procesado", color: "#5477a7" },
  { id: "nova4", label: "Ultraprocesado", color: "#8b6cab" },
  { id: "duda", label: "Por identificar", color: "#b1bab9" },
] as const;

export const meals = ["Desayuno", "Media mañana", "Comida", "Merienda", "Cena", "Otro momento"] as const;
export const maxFoodQuantity = 10000;
export const maxRecipeIngredients = 15;

export type FoodGroup = (typeof foodGroups)[number]["id"];
export type FoodProcessing = (typeof processingGroups)[number]["id"];
export type FoodUnit = "g" | "ml";
export type FoodValues = { kcal: number; protein: number; carbs: number; fat: number };
export const foodMacronutrients = [
  { key: "protein", label: "Proteínas", kcalPerGram: 4 },
  { key: "carbs", label: "Hidratos de carbono", kcalPerGram: 4 },
  { key: "fat", label: "Grasas", kcalPerGram: 9 },
] as const;
export type FoodPart = {
  ingredientId: string;
  name: string;
  group: FoodGroup;
  quantity: number;
  unit: FoodUnit;
  grams: number;
  values: FoodValues;
};
export type FoodEstimate = { catalogId?: string; parts: FoodPart[] };

export type FoodEntry = {
  id: string;
  day: string;
  meal: (typeof meals)[number];
  name: string;
  group: FoodGroup;
  processing: FoodProcessing;
  quantity: number | null;
  unit: FoodUnit;
  kcalPer100: number | null;
  estimate?: FoodEstimate;
};

export type FoodEntryDraft = Omit<FoodEntry, "id" | "day">;

export function parseFoodDecimal(input: string) {
  const value = input.trim().replace(",", ".");
  return /^\d{1,5}(?:\.\d{1,6})?$/.test(value) ? Number(value) : null;
}

export function foodEnergy(quantity: number | null, kcalPer100: number | null) {
  if (quantity == null || kcalPer100 == null) return null;
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > maxFoodQuantity) return null;
  if (!Number.isFinite(kcalPer100) || kcalPer100 < 0 || kcalPer100 > 1000) return null;
  return quantity * kcalPer100 / 100;
}

export function sumFoodValues(values: FoodValues[]): FoodValues {
  return values.reduce((total, value) => ({
    kcal: total.kcal + value.kcal,
    protein: total.protein + value.protein,
    carbs: total.carbs + value.carbs,
    fat: total.fat + value.fat,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}

export function foodMacroEnergy(values: FoodValues | null) {
  if (!values) return null;
  const portions = foodMacronutrients.map((nutrient) => ({
    ...nutrient,
    grams: values[nutrient.key],
    kcal: values[nutrient.key] * nutrient.kcalPerGram,
  }));
  const total = portions.reduce((sum, portion) => sum + portion.kcal, 0);
  if (!Number.isFinite(total) || total <= 0 || portions.some((portion) => portion.kcal < 0)) return null;

  const shares = portions.map((portion) => portion.kcal / total * 100);
  const percentages = shares.map(Math.floor);
  const remaining = 100 - percentages.reduce((sum, percent) => sum + percent, 0);
  // Assign leftover points to the largest remainders so the displayed percentages add up to 100.
  shares.map((share, index) => ({ index, remainder: share - percentages[index] }))
    .sort((a, b) => b.remainder - a.remainder).slice(0, remaining)
    .forEach(({ index }) => { percentages[index] += 1; });
  return { total, portions: portions.map((portion, index) => ({ ...portion, percent: percentages[index] })) };
}

export function foodEntryGroups(entry: FoodEntry) {
  return new Set(entry.estimate?.parts.map((part) => part.group) ?? [entry.group]);
}

export function foodEntryValues(entry: FoodEntry) {
  return entry.estimate
    ? sumFoodValues(entry.estimate.parts.map((part) => part.values))
    : null;
}

export function foodEntryEnergy(entry: FoodEntry) {
  return foodEntryValues(entry)?.kcal ?? foodEnergy(entry.quantity, entry.kcalPer100);
}

export function summarizeFoodDay(entries: FoodEntry[]) {
  const groupsPerEntry = entries.map(foodEntryGroups);
  const groups = foodGroups.map((group) => ({
    ...group,
    count: groupsPerEntry.filter((entry) => entry.has(group.id)).length,
  }));
  const processing = processingGroups.map((group) => ({
    ...group,
    count: entries.filter((entry) => entry.processing === group.id).length,
  }));
  let known = 0;
  let energy = 0;
  const macroValues: FoodValues[] = [];
  for (const entry of entries) {
    const values = foodEntryValues(entry);
    const estimate = values?.kcal ?? foodEnergy(entry.quantity, entry.kcalPer100);
    if (estimate != null) {
      known++;
      energy += estimate;
    }
    if (values) macroValues.push(values);
  }
  return {
    groups,
    processing,
    distinctGroups: groups.filter((group) => group.count > 0 && !["duda", "agua", "otros"].includes(group.id)).length,
    known,
    energy: known ? energy : null,
    macros: macroValues.length ? sumFoodValues(macroValues) : null,
    macroEntries: macroValues.length,
  };
}

export const madridDay = () => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

export function dateOffset(day: string, offset: number) {
  const date = new Date(day + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export const displayFoodDay = (day: string) => new Intl.DateTimeFormat("es-ES", {
  day: "numeric", month: "short", timeZone: "Europe/Madrid",
}).format(new Date(day + "T12:00:00Z"));

const classroomDays: FoodEntryDraft[][] = [
  [
    { meal: "Desayuno", name: "Pan integral", group: "cereales", processing: "nova3", quantity: 60, unit: "g", kcalPer100: 250 },
    { meal: "Comida", name: "Tortilla francesa", group: "proteinas", processing: "duda", quantity: null, unit: "g", kcalPer100: null },
    { meal: "Comida", name: "Tomate", group: "hortalizas", processing: "nova1", quantity: 100, unit: "g", kcalPer100: 20 },
    { meal: "Merienda", name: "Naranja", group: "fruta", processing: "nova1", quantity: 150, unit: "g", kcalPer100: 46 },
  ],
  [
    { meal: "Desayuno", name: "Yogur natural", group: "lacteos", processing: "nova1", quantity: 125, unit: "g", kcalPer100: 63 },
    { meal: "Comida", name: "Arroz integral cocido", group: "cereales", processing: "nova1", quantity: 160, unit: "g", kcalPer100: 123 },
    { meal: "Comida", name: "Lentejas cocidas", group: "legumbres", processing: "nova1", quantity: 140, unit: "g", kcalPer100: 116 },
    { meal: "Merienda", name: "Manzana", group: "fruta", processing: "nova1", quantity: 150, unit: "g", kcalPer100: 52 },
    { meal: "Cena", name: "Agua", group: "agua", processing: "nova1", quantity: 250, unit: "ml", kcalPer100: 0 },
  ],
  [
    { meal: "Desayuno", name: "Copos de avena", group: "cereales", processing: "nova1", quantity: 50, unit: "g", kcalPer100: 370 },
    { meal: "Desayuno", name: "Yogur natural", group: "lacteos", processing: "nova1", quantity: 125, unit: "g", kcalPer100: 63 },
    { meal: "Media mañana", name: "Plátano", group: "fruta", processing: "nova1", quantity: 110, unit: "g", kcalPer100: 89 },
    { meal: "Comida", name: "Garbanzos cocidos con sal", group: "legumbres", processing: "nova3", quantity: 150, unit: "g", kcalPer100: 130 },
    { meal: "Comida", name: "Ensalada de hortalizas", group: "hortalizas", processing: "duda", quantity: null, unit: "g", kcalPer100: null },
    { meal: "Comida", name: "Aceite de oliva", group: "grasas", processing: "nova2", quantity: 10, unit: "g", kcalPer100: 900 },
    { meal: "Comida", name: "Agua", group: "agua", processing: "nova1", quantity: 250, unit: "ml", kcalPer100: 0 },
  ],
];

export function classroomFoodDiary(day: string): FoodEntry[] {
  return classroomDays.flatMap((foods, dayIndex) => foods.map((entry, index) => ({
    ...entry,
    id: "caso-" + dayIndex + "-" + index,
    day: dateOffset(day, dayIndex - 2),
  })));
}

function isFoodEstimate(value: unknown): value is FoodEstimate {
  if (value == null || typeof value !== "object") return false;
  const { catalogId, parts } = value as Partial<FoodEstimate>;
  return (catalogId === undefined || typeof catalogId === "string") &&
    Array.isArray(parts) && parts.length > 0 && parts.length <= maxRecipeIngredients && parts.every((part) =>
      part && typeof part.ingredientId === "string" && typeof part.name === "string" &&
      foodGroups.some((group) => group.id === part.group) &&
      (part.unit === "g" || part.unit === "ml") &&
      Number.isFinite(part.quantity) && part.quantity > 0 && part.quantity <= maxFoodQuantity &&
      Number.isFinite(part.grams) && part.grams > 0 &&
      part.values && [part.values.kcal, part.values.protein, part.values.carbs, part.values.fat].every(
        (nutrient) => Number.isFinite(nutrient) && nutrient >= 0,
      ),
    );
}

export function readFoodDiary(raw: string): FoodEntry[] {
  const entries: unknown = JSON.parse(raw);
  if (!Array.isArray(entries)) throw new Error("El diario no tiene un formato válido.");
  return entries.filter((entry): entry is FoodEntry => {
    if (!entry || typeof entry !== "object") return false;
    return typeof entry.id === "string" && typeof entry.day === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(entry.day) && Number.isFinite(Date.parse(entry.day)) &&
      typeof entry.name === "string" && meals.includes(entry.meal) &&
      foodGroups.some((group) => group.id === entry.group) &&
      processingGroups.some((group) => group.id === entry.processing) &&
      (entry.unit === "g" || entry.unit === "ml") &&
      (entry.quantity === null || (Number.isFinite(entry.quantity) && entry.quantity > 0 && entry.quantity <= maxFoodQuantity)) &&
      (entry.kcalPer100 === null || (Number.isFinite(entry.kcalPer100) && entry.kcalPer100 >= 0 && entry.kcalPer100 <= 1000));
  }).map((entry) => entry.estimate === undefined || isFoodEstimate(entry.estimate)
    ? entry
    : { ...entry, estimate: undefined });
}
