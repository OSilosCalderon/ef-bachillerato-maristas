import {
  catalogIngredients, catalogRecipes, type CatalogIngredient, type CatalogRecipe,
} from "./sa3-food-composition";
import {
  classroomFoodDiary, foodEnergy, foodGroups, foodMacronutrients, isLabelMacroGrams, maxFoodQuantity, maxRecipeIngredients,
  parseFoodDecimal, processingGroups, sumFoodValues, type FoodEntry, type FoodEntryDraft, type FoodEstimate, type FoodPart,
  type FoodUnit, type FoodValues,
} from "./sa3-food-diary";

export const catalogFoods = [...catalogRecipes, ...catalogIngredients];

const ingredientsById = new Map(catalogIngredients.map((food) => [food.id, food]));
const catalogById = new Map(catalogFoods.map((food) => [food.id, food]));
export const getIngredient = (id: string) => ingredientsById.get(id);

function normalizeFoodName(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim().replace(/[.,:;!?]+$/, "").replace(/\s+/g, " ");
}

const catalogNames = catalogFoods.map((item) => ({
  item,
  names: [item.name, ...(item.aliases ?? [])].map(normalizeFoodName),
}));

export function findCatalogFood(name: string) {
  const key = normalizeFoodName(name);
  return catalogNames.find(({ names }) => names.includes(key))?.item;
}

export function suggestCatalogFoods(name: string, selectedId?: string) {
  const key = normalizeFoodName(name);
  if (!key) return [];
  const words = key.split(" ");
  const prefixMatches: (CatalogIngredient | CatalogRecipe)[] = [];
  const otherMatches: (CatalogIngredient | CatalogRecipe)[] = [];
  for (const { item, names } of catalogNames) {
    if (item.id === selectedId) continue;
    if (names.some((alias) => alias.startsWith(key))) prefixMatches.push(item);
    else if (names.some((alias) => words.every((word) => alias.includes(word)))) otherMatches.push(item);
  }
  return [...prefixMatches, ...otherMatches].slice(0, 5);
}

const amountFirst = /^(\d+(?:[.,]\d{1,3})?)\s*(kg|ml|l|g)\s+(?:de\s+)?(.+)$/i;
const amountLast = /^(.*?)\s+(?:de\s+)?(\d+(?:[.,]\d{1,3})?)\s*(kg|ml|l|g)$/i;

export function parseFoodQuery(text: string): { name: string; quantity?: string; unit?: FoodUnit } {
  const cleaned = text.trim().replace(/^(?:(?:me (?:he tomado|tomo)|he (?:tomado|comido|bebido))\s+)?(?:un(?:a)?\s+)?/i, "");
  const leading = cleaned.match(amountFirst);
  const trailing = cleaned.match(amountLast);
  const match = leading ?? trailing;
  if (!match) return { name: cleaned };
  const [name, amount, rawUnit] = leading ? [match[3], match[1], match[2]] : [match[1], match[2], match[3]];
  const unit = rawUnit.toLowerCase();
  const quantity = unit === "kg" || unit === "l" ? String(Math.round(Number(amount.replace(",", ".")) * 1000)) : amount;
  return { name: name.trim(), quantity, unit: unit === "ml" || unit === "l" ? "ml" : "g" };
}

export function unitsForFood(food: CatalogIngredient | CatalogRecipe): FoodUnit[] {
  if ("ingredients" in food) return [food.unit];
  if (food.density != null) return ["ml", "g"];
  return ["g"];
}

export type IngredientAmount = { ingredientId: string; quantity: number | null; unit: FoodUnit };

function estimatePart({ ingredientId, quantity, unit }: IngredientAmount): FoodPart | null {
  const food = getIngredient(ingredientId);
  if (!food || quantity == null || !Number.isFinite(quantity) || quantity <= 0 || quantity > maxFoodQuantity) return null;
  if (unit === "ml" && food.density == null) return null;
  const grams = quantity * (unit === "ml" ? food.density ?? 1 : 1);
  const factor = grams / 100;
  return {
    ingredientId, name: food.name, group: food.group, quantity, unit, grams,
    values: {
      kcal: food.per100g.kcal * factor,
      protein: food.per100g.protein * factor,
      carbs: food.per100g.carbs * factor,
      fat: food.per100g.fat * factor,
    },
  };
}

export function estimateIngredients(amounts: IngredientAmount[]): FoodEstimate | null {
  if (!amounts.length || amounts.length > maxRecipeIngredients) return null;
  const parts = amounts.map(estimatePart).filter((part) => part !== null);
  if (parts.length !== amounts.length || combinedFoodPortion(parts).quantity > maxFoodQuantity) return null;
  return { parts };
}

export function estimateCatalogFood(food: CatalogIngredient | CatalogRecipe, quantity: number | null, unit: FoodUnit): FoodEstimate | null {
  if (quantity == null || quantity < 0.001 || quantity > maxFoodQuantity || !unitsForFood(food).includes(unit)) return null;
  const ingredients = "ingredients" in food
    ? food.ingredients.map(({ ingredientId, share }) => ({
      ingredientId, quantity: Number((quantity * share).toFixed(6)), unit,
    }))
    : [{ ingredientId: food.id, quantity, unit }];
  const estimate = estimateIngredients(ingredients);
  return estimate ? { ...estimate, catalogId: food.id } : null;
}

export function findManualFood(name: string, referenceId?: string | null) {
  if (referenceId === null) return undefined;
  return referenceId === undefined ? findCatalogFood(name) : catalogById.get(referenceId);
}

type EntryNutrition = {
  energy: number | null;
  values: FoodValues | null;
  quantity: number | null;
  unit: FoodUnit;
  estimate?: FoodEstimate;
  referenceName?: string;
  source?: "catalog" | "label" | "manual-reference";
};

export function foodEntryNutrition(entry: FoodEntryDraft): EntryNutrition {
  if (entry.estimate) {
    const values = sumFoodValues(entry.estimate.parts.map((part) => part.values));
    return { energy: values.kcal, values, quantity: entry.quantity, unit: entry.unit, estimate: entry.estimate, source: "catalog" };
  }
  const query = parseFoodQuery(entry.name);
  const inlineQuantity = entry.quantity == null && query.quantity ? parseFoodDecimal(query.quantity) : null;
  const quantity = entry.quantity ?? (inlineQuantity != null && inlineQuantity > 0 && inlineQuantity <= maxFoodQuantity ? inlineQuantity : null);
  const unit = entry.quantity == null && quantity != null ? query.unit ?? entry.unit : entry.unit;
  const energy = foodEnergy(quantity, entry.kcalPer100);
  const macros = entry.labelMacrosPer100;
  if (quantity != null && isLabelMacroGrams(macros, unit)) {
    const factor = quantity / 100;
    const kcal = energy ?? foodMacronutrients.reduce((total, { key, kcalPerGram }) => total + macros[key] * factor * kcalPerGram, 0);
    const values = { kcal, protein: macros.protein * factor, carbs: macros.carbs * factor, fat: macros.fat * factor };
    return { energy: kcal, values, quantity, unit, source: "label" };
  }
  const reference = findManualFood(query.name, entry.manualReferenceId);
  const estimate = reference && estimateCatalogFood(reference, quantity, unit);
  if (estimate && reference) {
    const values = sumFoodValues(estimate.parts.map((part) => part.values));
    return { energy: energy ?? values.kcal, values, quantity, unit, estimate, referenceName: reference.name, source: "manual-reference" };
  }
  return { energy, values: null, quantity, unit };
}

export function foodEntryGroups(entry: FoodEntryDraft, estimate?: FoodEstimate) {
  const parts = entry.estimate?.parts ?? (entry.group === "duda" ? estimate?.parts : undefined);
  return new Set(parts?.map((part) => part.group) ?? [entry.group]);
}

export function summarizeFoodDay(entries: FoodEntry[]) {
  const groupCounts = new Map<string, number>();
  const processingCounts = new Map<string, number>();
  const macroValues: FoodValues[] = [];
  let known = 0;
  let energy = 0;
  let manualEstimates = 0;
  for (const entry of entries) {
    const nutrition = foodEntryNutrition(entry);
    for (const group of foodEntryGroups(entry, nutrition.estimate)) {
      groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1);
    }
    processingCounts.set(entry.processing, (processingCounts.get(entry.processing) ?? 0) + 1);
    if (nutrition.energy != null) {
      known++;
      energy += nutrition.energy;
    }
    if (nutrition.values) macroValues.push(nutrition.values);
    if (nutrition.source === "manual-reference") manualEstimates++;
  }
  const groups = foodGroups.map((group) => ({ ...group, count: groupCounts.get(group.id) ?? 0 }));
  return {
    groups,
    processing: processingGroups.map((group) => ({ ...group, count: processingCounts.get(group.id) ?? 0 })),
    distinctGroups: groups.filter((group) => group.count > 0 && !["duda", "agua", "otros"].includes(group.id)).length,
    known,
    energy: known ? energy : null,
    macros: macroValues.length ? sumFoodValues(macroValues) : null,
    macroEntries: macroValues.length,
    manualEstimates,
  };
}

export function estimatedClassroomDiary(day: string) {
  return classroomFoodDiary(day).map((entry) => {
    const food = findCatalogFood(entry.name);
    const estimate = food && estimateCatalogFood(food, entry.quantity, entry.unit);
    return estimate ? { ...entry, kcalPer100: null, estimate } : entry;
  });
}

export function combinedFoodPortion(parts: FoodPart[]): { quantity: number; unit: FoodUnit } {
  const allVolume = parts.every((part) => part.unit === "ml");
  const quantity = parts.reduce((sum, part) => sum + (allVolume ? part.quantity : part.grams), 0);
  return { quantity: Number(quantity.toFixed(6)), unit: allVolume ? "ml" : "g" };
}

export function groupFoodParts(parts: FoodPart[]) {
  return foodGroups.flatMap((group) => {
    const ingredients = parts.filter((part) => part.group === group.id);
    if (!ingredients.length) return [];
    return [{
      ...group,
      ingredients,
      grams: ingredients.reduce((sum, part) => sum + part.grams, 0),
      values: sumFoodValues(ingredients.map((part) => part.values)),
    }];
  });
}
