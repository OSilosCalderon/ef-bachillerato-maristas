import {
  catalogIngredients, catalogRecipes, type CatalogIngredient, type CatalogRecipe,
} from "./sa3-food-composition";
import {
  foodGroups, maxFoodQuantity, maxRecipeIngredients, sumFoodValues, type FoodEstimate, type FoodPart, type FoodUnit,
} from "./sa3-food-diary";

export const catalogFoods = [...catalogRecipes, ...catalogIngredients];

const ingredientsById = new Map(catalogIngredients.map((food) => [food.id, food]));
export const getIngredient = (id: string) => ingredientsById.get(id);

function normalizeFoodName(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim().replace(/\s+/g, " ");
}

const catalogNames = catalogFoods.map((item) => ({
  item,
  names: [item.name, ...(item.aliases ?? [])].map(normalizeFoodName),
}));

export function findCatalogFood(name: string) {
  const key = normalizeFoodName(name);
  return catalogNames.find(({ names }) => names.includes(key))?.item;
}

export function suggestCatalogFoods(name: string) {
  const key = normalizeFoodName(name);
  if (!key) return [];
  return catalogNames.filter(({ names }) => names.some((alias) => alias.includes(key))).slice(0, 5).map(({ item }) => item);
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
