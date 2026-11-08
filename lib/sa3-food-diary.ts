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

export type FoodEntry = {
  id: string;
  day: string;
  meal: (typeof meals)[number];
  name: string;
  group: (typeof foodGroups)[number]["id"];
  processing: (typeof processingGroups)[number]["id"];
  quantity: number | null;
  unit: "g" | "ml";
  kcalPer100: number | null;
};

export function parseFoodDecimal(input: string) {
  const value = input.trim().replace(",", ".");
  return /^\d{1,5}(?:\.\d{1,3})?$/.test(value) ? Number(value) : null;
}

export function foodEnergy(quantity: number | null, kcalPer100: number | null) {
  if (quantity == null || kcalPer100 == null) return null;
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 10000) return null;
  if (!Number.isFinite(kcalPer100) || kcalPer100 < 0 || kcalPer100 > 1000) return null;
  return quantity * kcalPer100 / 100;
}

export function summarizeFoodDay(entries: FoodEntry[]) {
  const groups = foodGroups.map((group) => ({
    ...group,
    count: entries.filter((entry) => entry.group === group.id).length,
  }));
  const processing = processingGroups.map((group) => ({
    ...group,
    count: entries.filter((entry) => entry.processing === group.id).length,
  }));
  let known = 0;
  let energy = 0;
  for (const entry of entries) {
    const estimate = foodEnergy(entry.quantity, entry.kcalPer100);
    if (estimate != null) {
      known++;
      energy += estimate;
    }
  }
  return {
    groups,
    processing,
    distinctGroups: groups.filter((group) => group.count > 0 && !["duda", "agua", "otros"].includes(group.id)).length,
    known,
    energy: known ? energy : null,
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

type ExampleFood = Omit<FoodEntry, "id" | "day">;
const classroomDays: ExampleFood[][] = [
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
      (entry.quantity === null || (Number.isFinite(entry.quantity) && entry.quantity > 0 && entry.quantity <= 10000)) &&
      (entry.kcalPer100 === null || (Number.isFinite(entry.kcalPer100) && entry.kcalPer100 >= 0 && entry.kcalPer100 <= 1000));
  });
}
