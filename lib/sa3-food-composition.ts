import type { FoodGroup, FoodProcessing, FoodUnit, FoodValues } from "./sa3-food-diary";
import { actitudesCatalogIngredients } from "./sa3-food-actitudes";

type NamedFood = { id: string; name: string; aliases?: string[] };

export type CatalogIngredient = NamedFood & {
  group: FoodGroup;
  processing: FoodProcessing;
  density?: number;
  reference?: { title: string; url: string };
  per100g: FoodValues;
};

export type CatalogRecipe = NamedFood & {
  unit: FoodUnit;
  ingredients: { ingredientId: string; share: number }[];
};

// Los identificadores de ingredientes son códigos de la hoja 1.3 Proximates de CoFID 2021.
// Fuente: Public Health England, © Crown copyright 2021. Valores por 100 g de parte comestible.
// Se han convertido los hidratos de los equivalentes de monosacáridos a gramos según su
// composición (almidón ÷ 1,10 y disacáridos ÷ 1,05). Las trazas se aproximan a cero.
// Densidades aproximadas de FAO/INFOODS v2.0 en g/ml. El agua se aproxima a 1 g/ml.
export const catalogIngredients: CatalogIngredient[] = [
  { id: "17-833", name: "Café solo", group: "otros", processing: "nova1", aliases: ["café", "café preparado", "infusión de café"], density: 1, per100g: { kcal: 2, protein: 0.2, carbs: 0.3, fat: 0 } },
  { id: "12-313", name: "Leche semidesnatada", group: "lacteos", processing: "nova1", aliases: ["leche", "leche semi"], density: 1.03, per100g: { kcal: 46, protein: 3.5, carbs: 4.48, fat: 1.7 } },
  { id: "12-596", name: "Leche entera", group: "lacteos", processing: "nova1", aliases: ["leche entera fresca"], density: 1.03, per100g: { kcal: 63, protein: 3.4, carbs: 4.38, fat: 3.6 } },
  { id: "12-307", name: "Leche desnatada", group: "lacteos", processing: "nova1", density: 1.03, per100g: { kcal: 34, protein: 3.5, carbs: 4.57, fat: 0.3 } },
  { id: "17-063", name: "Azúcar blanco", group: "otros", processing: "nova2", aliases: ["azúcar"], per100g: { kcal: 394, protein: 0, carbs: 100, fat: 0 } },
  { id: "17-377", name: "Agua", group: "agua", processing: "nova1", aliases: ["agua mineral", "agua del grifo"], density: 1, per100g: { kcal: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: "11-1129", name: "Pasta blanca cocida", group: "cereales", processing: "nova1", aliases: ["pasta", "macarrones", "macarrones cocidos", "espaguetis", "espaguetis cocidos"], per100g: { kcal: 169, protein: 5.5, carbs: 33.88, fat: 0.8 } },
  { id: "11-723", name: "Pasta integral cocida", group: "cereales", processing: "nova1", aliases: ["pasta integral", "macarrones integrales"], per100g: { kcal: 134, protein: 5.2, carbs: 25, fat: 1.1 } },
  { id: "18-507", name: "Ternera picada magra cocinada", group: "proteinas", processing: "nova1", aliases: ["carne picada", "ternera picada", "carne picada cocinada"], per100g: { kcal: 137, protein: 24.7, carbs: 0, fat: 4.2 } },
  { id: "13-530", name: "Tomate natural en conserva", group: "hortalizas", processing: "duda", aliases: ["tomate triturado", "tomate de lata"], per100g: { kcal: 19, protein: 1.1, carbs: 3.8, fat: 0.1 } },
  { id: "17-038", name: "Aceite de oliva", group: "grasas", processing: "nova2", aliases: ["aceite de oliva virgen", "aceite de oliva virgen extra", "aove"], density: 0.915, per100g: { kcal: 899, protein: 0, carbs: 0, fat: 99.9 } },
  { id: "11-981", name: "Pan integral", group: "cereales", processing: "duda", aliases: ["pan de trigo integral"], per100g: { kcal: 217, protein: 9.4, carbs: 38.32, fat: 2.5 } },
  { id: "11-1145", name: "Pan blanco", group: "cereales", processing: "duda", aliases: ["pan", "pan de trigo"], per100g: { kcal: 236, protein: 8.7, carbs: 44.4, fat: 2.1 } },
  { id: "11-982", name: "Pan integral tostado", group: "cereales", processing: "duda", aliases: ["tostada integral"], per100g: { kcal: 255, protein: 11.2, carbs: 44.9, fat: 2.9 } },
  { id: "11-862", name: "Arroz blanco cocido", group: "cereales", processing: "nova1", aliases: ["arroz", "arroz blanco", "arroz cocido"], per100g: { kcal: 131, protein: 2.8, carbs: 28.27, fat: 0.4 } },
  { id: "11-869", name: "Arroz integral cocido", group: "cereales", processing: "nova1", aliases: ["arroz integral"], per100g: { kcal: 132, protein: 3.6, carbs: 26.56, fat: 0.9 } },
  { id: "11-788", name: "Copos de avena", group: "cereales", processing: "nova1", aliases: ["avena"], per100g: { kcal: 381, protein: 10.9, carbs: 64.29, fat: 8.1 } },
  { id: "13-490", name: "Patata cocida", group: "cereales", processing: "nova1", aliases: ["patata", "patatas cocidas", "patata hervida"], per100g: { kcal: 74, protein: 1.8, carbs: 15.97, fat: 0.1 } },
  { id: "18-323", name: "Pechuga de pollo a la plancha", group: "proteinas", processing: "nova1", aliases: ["pollo", "pechuga de pollo", "pollo a la plancha"], per100g: { kcal: 148, protein: 32, carbs: 0, fat: 2.2 } },
  { id: "12-940", name: "Huevo cocido", group: "proteinas", processing: "nova1", aliases: ["huevo duro"], per100g: { kcal: 143, protein: 14.1, carbs: 0, fat: 9.6 } },
  { id: "12-962", name: "Huevo cocinado sin aceite", group: "proteinas", processing: "nova1", aliases: ["huevo a la plancha sin aceite"], per100g: { kcal: 167, protein: 16, carbs: 0, fat: 11.4 } },
  { id: "16-416", name: "Atún al natural escurrido", group: "proteinas", processing: "nova3", aliases: ["atún al natural", "atún de lata al natural"], per100g: { kcal: 109, protein: 24.9, carbs: 0, fat: 1 } },
  { id: "16-359", name: "Salmón al horno", group: "proteinas", processing: "nova1", aliases: ["salmón cocinado"], per100g: { kcal: 232, protein: 25.2, carbs: 0, fat: 14.6 } },
  { id: "12-184", name: "Yogur natural entero", group: "lacteos", processing: "nova1", aliases: ["yogur natural", "yogurt natural"], per100g: { kcal: 79, protein: 5.7, carbs: 7.58, fat: 3 } },
  { id: "12-526", name: "Queso parmesano", group: "lacteos", processing: "nova3", aliases: ["parmesano"], per100g: { kcal: 415, protein: 36.2, carbs: 0.86, fat: 29.7 } },
  { id: "14-318", name: "Plátano sin piel", group: "fruta", processing: "nova1", aliases: ["plátano", "banana"], per100g: { kcal: 81, protein: 1.2, carbs: 19.97, fat: 0.1 } },
  { id: "14-319", name: "Manzana con piel", group: "fruta", processing: "nova1", aliases: ["manzana"], per100g: { kcal: 51, protein: 0.6, carbs: 11.47, fat: 0.5 } },
  { id: "14-327", name: "Naranja sin piel", group: "fruta", processing: "nova1", aliases: ["naranja"], per100g: { kcal: 36, protein: 0.8, carbs: 8.01, fat: 0.2 } },
  { id: "14-386", name: "Aguacate sin piel ni hueso", group: "fruta", processing: "nova1", aliases: ["aguacate"], per100g: { kcal: 171, protein: 1.8, carbs: 1.8, fat: 17.4 } },
  { id: "13-661", name: "Lentejas cocidas", group: "legumbres", processing: "nova1", aliases: ["lentejas"], per100g: { kcal: 92, protein: 7.8, carbs: 13.19, fat: 0.7 } },
  { id: "13-662", name: "Garbanzos cocidos", group: "legumbres", processing: "nova1", aliases: ["garbanzos"], per100g: { kcal: 129, protein: 8.4, carbs: 16.67, fat: 3 } },
  { id: "14-896", name: "Almendras sin cáscara", group: "legumbres", processing: "nova1", aliases: ["almendras"], per100g: { kcal: 554, protein: 21.2, carbs: 5.03, fat: 49.9 } },
  { id: "13-517", name: "Tomate fresco", group: "hortalizas", processing: "nova1", aliases: ["tomate", "tomate crudo"], per100g: { kcal: 14, protein: 0.5, carbs: 3, fat: 0.1 } },
  { id: "13-520", name: "Lechuga", group: "hortalizas", processing: "nova1", per100g: { kcal: 11, protein: 1.2, carbs: 1.4, fat: 0.1 } },
  { id: "13-523", name: "Pepino", group: "hortalizas", processing: "nova1", per100g: { kcal: 14, protein: 1, carbs: 1.2, fat: 0.6 } },
  { id: "13-496", name: "Zanahoria cruda", group: "hortalizas", processing: "nova1", aliases: ["zanahoria"], per100g: { kcal: 34, protein: 0.5, carbs: 7.45, fat: 0.4 } },
  { id: "13-497", name: "Zanahoria cocida", group: "hortalizas", processing: "nova1", aliases: ["zanahoria hervida"], per100g: { kcal: 29, protein: 0.5, carbs: 5.79, fat: 0.5 } },
  { id: "13-499", name: "Cebolla cruda", group: "hortalizas", processing: "nova1", aliases: ["cebolla"], per100g: { kcal: 35, protein: 1, carbs: 7.9, fat: 0.1 } },
  { id: "13-500", name: "Cebolla cocida", group: "hortalizas", processing: "nova1", per100g: { kcal: 25, protein: 0.7, carbs: 5.33, fat: 0.3 } },
  { id: "13-503", name: "Brócoli cocido", group: "hortalizas", processing: "nova1", aliases: ["brócoli"], per100g: { kcal: 28, protein: 3.3, carbs: 2.74, fat: 0.5 } },
  ...actitudesCatalogIngredients,
];

// Proporciones de ejemplo para el aula. Se aplican al peso cocinado o al volumen servido.
export const catalogRecipes: CatalogRecipe[] = [
  {
    id: "cafe-con-leche", name: "Café con leche", aliases: ["café con leche sin azúcar"], unit: "ml",
    ingredients: [
      { ingredientId: "12-313", share: 0.60 },
      { ingredientId: "17-833", share: 0.40 },
    ],
  },
  {
    id: "macarrones-con-carne", name: "Macarrones con carne",
    aliases: ["macarrones a la boloñesa", "macarrones boloñesa", "pasta con carne", "pasta boloñesa", "pasta a la boloñesa", "espaguetis a la boloñesa", "macarrones con carne picada"],
    unit: "g",
    ingredients: [
      { ingredientId: "11-1129", share: 0.60 },
      { ingredientId: "18-507", share: 0.20 },
      { ingredientId: "13-530", share: 0.17 },
      { ingredientId: "17-038", share: 0.03 },
    ],
  },
  {
    id: "arroz-con-pollo", name: "Arroz con pollo", unit: "g",
    ingredients: [
      { ingredientId: "11-862", share: 0.55 },
      { ingredientId: "18-323", share: 0.25 },
      { ingredientId: "13-497", share: 0.17 },
      { ingredientId: "17-038", share: 0.03 },
    ],
  },
  {
    id: "tostada-tomate", name: "Tostada con tomate y aceite", aliases: ["tostada con tomate", "pan con tomate y aceite"], unit: "g",
    ingredients: [
      { ingredientId: "11-982", share: 0.65 },
      { ingredientId: "13-517", share: 0.29 },
      { ingredientId: "17-038", share: 0.06 },
    ],
  },
  {
    id: "lentejas-verduras", name: "Lentejas con verduras", aliases: ["lentejas guisadas con verduras"], unit: "g",
    ingredients: [
      { ingredientId: "13-661", share: 0.60 },
      { ingredientId: "13-497", share: 0.18 },
      { ingredientId: "13-530", share: 0.12 },
      { ingredientId: "13-500", share: 0.07 },
      { ingredientId: "17-038", share: 0.03 },
    ],
  },
  {
    id: "ensalada-mixta", name: "Ensalada mixta", unit: "g",
    ingredients: [
      { ingredientId: "13-520", share: 0.34 },
      { ingredientId: "13-517", share: 0.25 },
      { ingredientId: "13-523", share: 0.18 },
      { ingredientId: "16-416", share: 0.20 },
      { ingredientId: "17-038", share: 0.03 },
    ],
  },
];
