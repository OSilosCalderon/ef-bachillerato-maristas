"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Calculator, Plus, Search, Trash2 } from "lucide-react";
import { foodNumber, FoodMacros, Sa3FoodEstimateDetails } from "@/components/sa3-food-estimate";
import { catalogIngredients } from "@/lib/sa3-food-composition";
import {
  foodGroups, foodMacronutrients, isLabelMacroGrams, maxFoodQuantity, maxRecipeIngredients, meals, parseFoodDecimal, processingGroups,
  type FoodEntry, type FoodEntryDraft, type FoodMacroGrams, type FoodPart, type FoodProcessing, type FoodUnit,
} from "@/lib/sa3-food-diary";
import {
  catalogFoods, combinedFoodPortion, estimateCatalogFood, estimateIngredients, findCatalogFood, findManualFood,
  foodEntryNutrition, getIngredient, parseFoodQuery, suggestCatalogFoods, unitsForFood,
} from "@/lib/sa3-food-nutrition";
import { sa3FoodSources } from "@/lib/sa3-habits-curriculum";

const control = "mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal";
const label = "text-sm font-bold text-slate-700";
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-emerald-500";

const modes = [
  { id: "search", label: "Buscar alimento o plato" },
  { id: "ingredients", label: "Por ingredientes" },
  { id: "label", label: "Etiqueta o registro manual" },
] as const;

type FormMode = (typeof modes)[number]["id"];
type Draft = Omit<FoodEntryDraft, "estimate" | "quantity" | "kcalPer100" | "unit" | "processing" | "labelMacrosPer100"> & {
  quantity: string;
  kcalPer100: string;
  unit: FoodUnit | null;
  processing: FoodProcessing | null;
  labelMacros: Record<keyof FoodMacroGrams, string>;
};
type IngredientRow = { id: string; ingredientId: string; quantity: string; unit: FoodUnit };

const emptyIngredient = { ingredientId: "", quantity: "", unit: "g" } as const;
const ingredientGroups = foodGroups.map((group) => ({
  ...group,
  ingredients: catalogIngredients.filter((ingredient) => ingredient.group === group.id)
    .sort((a, b) => a.name.localeCompare(b.name, "es")),
})).filter((group) => group.ingredients.length);
const examples = ["Café con leche 250 ml", "Macarrones con carne 300 g", "Cuscús cocido 150 g"];
const manualReferences = [...catalogFoods].sort((a, b) => a.name.localeCompare(b.name, "es"));

const editableAmount = (quantity: number | null | undefined) => quantity == null
  ? ""
  : String(Number(quantity.toFixed(6)));

function rowsForParts(parts: FoodPart[]): IngredientRow[] {
  return parts.map((part, index) => ({
    id: String(index), ingredientId: part.ingredientId, quantity: editableAmount(part.quantity), unit: part.unit,
  }));
}

function validAmount(value: number | null) {
  return value != null && value > 0 && value <= maxFoodQuantity;
}

export function Sa3FoodEntryForm({ entry, onSave, onCancel }: {
  entry?: FoodEntry;
  onSave: (entry: FoodEntryDraft) => void;
  onCancel: () => void;
}) {
  const catalogItem = catalogFoods.find((item) => item.id === entry?.estimate?.catalogId);
  const [mode, setMode] = useState<FormMode>(catalogItem || !entry ? "search" : entry.estimate ? "ingredients" : "label");
  const [draft, setDraft] = useState<Draft>(() => ({
    name: catalogItem?.name ?? entry?.name ?? "", meal: entry?.meal ?? "Comida",
    group: entry?.group ?? "duda", processing: entry?.processing ?? null,
    quantity: editableAmount(entry?.quantity), unit: entry?.unit ?? null, kcalPer100: editableAmount(entry?.kcalPer100),
    manualReferenceId: entry?.manualReferenceId,
    labelMacros: {
      protein: editableAmount(entry?.labelMacrosPer100?.protein),
      carbs: editableAmount(entry?.labelMacrosPer100?.carbs),
      fat: editableAmount(entry?.labelMacrosPer100?.fat),
    },
  }));
  const [rows, setRows] = useState<IngredientRow[]>(() => entry?.estimate
    ? rowsForParts(entry.estimate.parts)
    : [{ id: "0", ...emptyIngredient }]);
  const [error, setError] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry) nameInput.current?.focus();
  }, [entry]);

  const query = mode === "ingredients" ? { name: draft.name } : parseFoodQuery(draft.name);
  const match = mode === "search" ? findCatalogFood(query.name) : undefined;
  const suggestions = mode === "search" ? suggestCatalogFoods(query.name, match?.id) : [];
  const reference = match && "reference" in match ? match.reference : undefined;
  const units = match ? unitsForFood(match) : ["g", "ml"] as const;
  const manualReference = mode === "label" ? findManualFood(query.name, draft.manualReferenceId) : undefined;
  const quantityText = mode === "label" ? draft.quantity || query.quantity || "" : query.quantity ?? draft.quantity;
  const quantity = parseFoodDecimal(quantityText);
  const unit = mode === "label"
    ? draft.unit ?? query.unit ?? (manualReference ? unitsForFood(manualReference)[0] : "g")
    : query.unit ?? draft.unit ?? units[0];
  const kcalPer100 = parseFoodDecimal(draft.kcalPer100);
  const estimate = mode === "ingredients"
    ? estimateIngredients(rows.map((row) => ({ ...row, quantity: parseFoodDecimal(row.quantity) })))
    : match ? estimateCatalogFood(match, quantity, unit) : null;
  const processing = draft.processing ?? (match && "processing" in match ? match.processing : "duda");
  const name = match?.name ?? query.name.trim();
  const macroInput = {
    protein: parseFoodDecimal(draft.labelMacros.protein),
    carbs: parseFoodDecimal(draft.labelMacros.carbs),
    fat: parseFoodDecimal(draft.labelMacros.fat),
  };
  const labelMacrosPer100 = isLabelMacroGrams(macroInput, unit) ? macroInput : undefined;
  const hasMacroInput = Object.values(draft.labelMacros).some((value) => value.trim());
  const manualDraft: FoodEntryDraft = {
    name, meal: draft.meal, group: draft.group, processing, quantity, unit, kcalPer100,
    labelMacrosPer100, manualReferenceId: draft.manualReferenceId,
  };
  const manualNutrition = mode === "label" ? foodEntryNutrition(manualDraft) : null;

  function update(fields: Partial<Draft>) {
    setDraft((previous) => ({ ...previous, ...fields }));
    setError("");
  }

  function chooseMode(next: FormMode) {
    if (next === mode) return;
    if (mode === "search" && next === "ingredients" && estimate) setRows(rowsForParts(estimate.parts));
    if (mode === "search") {
      update({ name, quantity: quantityText, unit, group: match && "group" in match ? match.group : draft.group });
    }
    setMode(next);
    setError("");
  }

  function updateRow(id: string, fields: Partial<IngredientRow>) {
    setRows((previous) => previous.map((row) => row.id === id ? { ...row, ...fields } : row));
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name) return setError("Escribe el nombre del alimento, bebida o plato.");
    if (mode === "search" && !match) return setError("Elige un alimento del catálogo o usa la opción Por ingredientes o Etiqueta.");
    if (mode !== "ingredients" && (quantityText.trim() || mode === "search") && !validAmount(quantity)) {
      return setError("Indica una cantidad mayor que 0 y de hasta 10.000 g o ml.");
    }
    if (mode === "search" && quantity != null && quantity < 0.001) return setError("Introduce al menos 0,001 g o ml.");
    if (mode === "search" && !units.includes(unit)) {
      return setError("Para este alimento, elige una de las unidades disponibles.");
    }
    if (mode === "label") {
      if (draft.kcalPer100.trim() && (kcalPer100 == null || kcalPer100 > 1000)) {
        return setError("Introduce entre 0 y 1000 kcal por 100 " + unit + ".");
      }
      if (hasMacroInput && !labelMacrosPer100) {
        return setError("Revisa los tres macronutrientes. Escribe los gramos de proteínas, hidratos y grasas por 100 " + unit + ". Usa 0 cuando la etiqueta indique cero.");
      }
      if ((kcalPer100 != null || hasMacroInput) && quantity == null) return setError("Indica la cantidad que has tomado para calcular el aporte.");
      onSave(manualDraft);
      return;
    }
    if (!estimate) return setError("Revisa el ingrediente, la unidad y la cantidad de cada fila. El total debe ser de hasta 10.000 g o ml.");
    const groups = new Set(estimate.parts.map((part) => part.group));
    const portion = mode === "ingredients" ? combinedFoodPortion(estimate.parts) : { quantity, unit };
    onSave({
      name, meal: draft.meal, group: groups.size === 1 ? estimate.parts[0].group : "duda",
      processing, ...portion, kcalPer100: null, estimate,
    });
  }

  return <form onSubmit={submit} className="mt-4 grid gap-4">
    <div className="flex flex-wrap gap-2" role="group" aria-label="Forma de añadir el alimento">
      {modes.map((option) => <button key={option.id} type="button" onClick={() => chooseMode(option.id)}
        className={button + " aria-pressed:border-emerald-300 aria-pressed:bg-emerald-50 aria-pressed:text-[#164c3a]"}
        aria-pressed={mode === option.id}>{option.label}</button>)}
    </div>
    <label className={label}>
      {mode === "search" ? <span className="inline-flex items-center gap-2"><Search size={16} aria-hidden="true"/> ¿Qué has tomado y cuánto?</span> : "Nombre del alimento o plato"}
      <input ref={nameInput} id="sa3-food-name" autoComplete="off" maxLength={90} value={draft.name}
        onChange={(event) => update(mode === "search"
          ? { name: event.target.value, quantity: "", unit: null }
          : { name: event.target.value, manualReferenceId: undefined })}
        placeholder={mode === "search" ? "Café con leche 250 ml" : "Escribe el nombre"}
        aria-describedby={mode === "search" ? "sa3-food-search-help" : undefined} className={control}/>
    </label>
    {mode === "search" && <>
      <p id="sa3-food-search-help" className="-mt-2 text-xs leading-5 text-slate-600">
        Escribe el nombre y la cantidad en g o ml. Elige la preparación que has pesado, como arroz seco o cocido.
      </p>
      {!draft.name.trim() && <div className="flex flex-wrap gap-2" aria-label="Ejemplos para probar">
        {examples.map((example) => <button type="button" key={example} className={button} onClick={() => update({ name: example, quantity: "", unit: null })}>{example}</button>)}
      </div>}
      {match && match.name.localeCompare(query.name, "es", { sensitivity: "base" }) !== 0 && <p className="text-xs leading-5 text-slate-600">Ficha seleccionada · <strong>{match.name}</strong></p>}
      {!!suggestions.length && <div className="flex flex-wrap gap-2" aria-label="Coincidencias del catálogo">
        {suggestions.map((food) => <button type="button" key={food.id} className={button} onClick={() => update({
          name: food.name, quantity: quantityText, unit: query.unit ?? draft.unit,
        })}>{food.name}</button>)}
      </div>}
      {!!query.name && !match && !suggestions.length && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        Prueba otro nombre, combina alimentos en «Por ingredientes» o añade los datos del envase en «Etiqueta o registro manual».
      </p>}
      {match && <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
        <label className={label}>Cantidad
          <input inputMode="decimal" maxLength={12} value={quantityText} placeholder="250"
            onChange={(event) => update({ name: match.name, quantity: event.target.value, unit })} className={control}/>
        </label>
        <label className={label}>Unidad
          <select value={unit} onChange={(event) => update({ name: match.name, quantity: quantityText, unit: event.target.value as FoodUnit })} className={control}>
            {!units.includes(unit) && <option value={unit} disabled>{unit}</option>}
            {units.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
      </div>}
      {match && !units.includes(unit) && <p className="-mt-2 text-xs leading-5 text-slate-600">Para {match.name.toLowerCase()}, usa {units.join(" o ")}.</p>}
    </>}
    {mode === "ingredients" && <fieldset className="min-w-0 space-y-3">
      <legend className={label}>Ingredientes de tu ración</legend>
      <p className="text-xs leading-5 text-slate-600">Elige cada ingrediente y la cantidad. Usa la ficha que corresponda al peso seco, crudo o cocinado.</p>
      {rows.map((row, index) => {
        const ingredient = getIngredient(row.ingredientId);
        const ingredientUnits = ingredient ? unitsForFood(ingredient) : ["g"];
        return <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_4.5rem_auto] items-end gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,2fr)_minmax(4.5rem,1fr)_4rem_auto]">
          <label className={label + " col-span-3 sm:col-span-1"}>Ingrediente {index + 1}
            <select value={row.ingredientId} onChange={(event) => {
              const selected = getIngredient(event.target.value);
              const unit = selected && unitsForFood(selected).includes(row.unit) ? row.unit : "g";
              updateRow(row.id, { ingredientId: event.target.value, unit });
            }} className={control}>
              <option value="">Elige un ingrediente</option>
              {ingredientGroups.map((group) => <optgroup key={group.id} label={group.label}>
                {group.ingredients.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
              </optgroup>)}
            </select>
          </label>
          <label className={label}>Cantidad
            <input aria-label={"Cantidad del ingrediente " + (index + 1)} inputMode="decimal" maxLength={12} value={row.quantity} placeholder="50"
              onChange={(event) => updateRow(row.id, { quantity: event.target.value })} className={control}/>
          </label>
          <label className={label}>Unidad
            <select aria-label={"Unidad del ingrediente " + (index + 1)} value={row.unit} onChange={(event) => updateRow(row.id, { unit: event.target.value as FoodUnit })} className={control}>
              {ingredientUnits.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <button type="button" className={button + " disabled:opacity-40"} disabled={rows.length === 1} aria-label={"Quitar ingrediente " + (index + 1)}
            onClick={() => { setRows((previous) => previous.filter((part) => part.id !== row.id)); setError(""); }}><Trash2 size={16} aria-hidden="true"/></button>
        </div>;
      })}
      <button type="button" className={button + " disabled:opacity-40"} disabled={rows.length >= maxRecipeIngredients}
        onClick={() => {
          const row = { id: crypto.randomUUID(), ...emptyIngredient };
          setRows((previous) => [...previous, row]);
          setError("");
        }}>
        <Plus size={16} aria-hidden="true"/> Añadir ingrediente
      </button>
    </fieldset>}
    {estimate && <section className="min-w-0 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 sm:p-4" aria-label="Estimación nutricional" aria-live="polite">
      <h4 className="flex items-center gap-2 text-sm font-black text-[#164c3a]"><Calculator size={16} aria-hidden="true"/> Estimación de tu ración</h4>
      {match && "ingredients" in match && <p className="text-xs leading-5 text-slate-600">Receta orientativa. Ajusta las proporciones según lo que hayas tomado.</p>}
      <Sa3FoodEstimateDetails estimate={estimate}/>
      {reference && <p className="text-xs leading-5 text-slate-600">Referencia por 100 g. <a className="font-semibold text-[#164c3a] underline" href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></p>}
      {match && "ingredients" in match && <button type="button" className={button} onClick={() => chooseMode("ingredients")}>Ajustar ingredientes</button>}
    </section>}
    {mode === "label" && <>
      <label className={label}>Grupo de alimentos
        <select value={draft.group} onChange={(event) => update({ group: event.target.value as FoodEntryDraft["group"] })} className={control}>
          {foodGroups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
        </select>
      </label>
      <fieldset className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <legend className="px-1 text-sm font-black text-[#164c3a]">Ración y etiqueta</legend>
        <p className="text-xs leading-5 text-slate-600">Indica la cantidad que has tomado. Si tienes la etiqueta, copia los valores por 100 {unit}.</p>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_5rem] gap-3 sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)]">
          <label className={label}>Cantidad<input inputMode="decimal" maxLength={12} value={quantityText} onChange={(event) => update({ name, quantity: event.target.value, unit })} placeholder="50" className={control}/></label>
          <label className={label}>Unidad<select value={unit} onChange={(event) => update({ unit: event.target.value as FoodUnit })} className={control}><option>g</option><option>ml</option></select></label>
          <label className={label + " col-span-2 sm:col-span-1"}>kcal por 100 {unit}<input inputMode="decimal" maxLength={10} value={draft.kcalPer100} onChange={(event) => update({ kcalPer100: event.target.value })} placeholder="240" className={control}/></label>
        </div>
        <details open={entry?.labelMacrosPer100 ? true : undefined} className="mt-3 rounded-lg bg-white/80 p-3">
          <summary className="min-h-9 cursor-pointer text-sm font-bold text-[#164c3a]">Macronutrientes de la etiqueta · opcional</summary>
          <div className="grid gap-3 sm:grid-cols-3">
            {foodMacronutrients.map(({ key, label: title }) => <label key={key} className={label}>{title}
              <span className="block text-xs font-normal">g por 100 {unit}</span>
              <input inputMode="decimal" maxLength={10} value={draft.labelMacros[key]} className={control}
                onChange={(event) => update({ labelMacros: { ...draft.labelMacros, [key]: event.target.value } })}/>
            </label>)}
          </div>
        </details>
        {!labelMacrosPer100 && <details className="mt-3 rounded-lg bg-white/80 p-3">
          <summary className="min-h-9 cursor-pointer text-sm font-bold text-[#164c3a]">{manualReference ? "Cambiar la referencia" : "Elegir un alimento parecido del catálogo"}</summary>
          <label className={label}>Ficha de referencia
            <select value={draft.manualReferenceId ?? (draft.manualReferenceId === null ? "none" : "auto")} className={control}
              onChange={(event) => update({ manualReferenceId: event.target.value === "auto" ? undefined : event.target.value === "none" ? null : event.target.value })}>
              <option value="auto">Automática por nombre</option>
              <option value="none">Sin referencia</option>
              {manualReferences.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
            </select>
          </label>
        </details>}
        <div className="mt-3 space-y-2" aria-live="polite">
          {manualNutrition?.energy != null && <p className="font-black text-[#164c3a]">{foodNumber.format(manualNutrition.energy)} kcal {kcalPer100 != null ? "de etiqueta" : "estimadas"}</p>}
          {manualNutrition?.values && <FoodMacros values={manualNutrition.values} highlight/>}
          {manualNutrition?.source === "manual-reference" && <p className="text-xs leading-5 text-slate-600">Macronutrientes estimados con la ficha de <strong>{manualNutrition.referenceName}</strong>.</p>}
          {!manualNutrition?.values && name && <p className="text-xs leading-5 text-slate-600">
            {manualReference && !unitsForFood(manualReference).includes(unit)
              ? `La ficha de ${manualReference.name} usa ${unitsForFood(manualReference).join(" o ")}. Revisa la unidad o usa la etiqueta.`
              : manualReference ? `Indica la cantidad para estimar el aporte de ${manualReference.name}.`
                : "Puedes guardar la entrada. Para incluirla en el gráfico, indica la cantidad y elige una referencia o añade los datos de la etiqueta."}
          </p>}
        </div>
      </fieldset>
    </>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className={label}>Momento
        <select value={draft.meal} onChange={(event) => update({ meal: event.target.value as FoodEntryDraft["meal"] })} className={control}>
          {meals.map((meal) => <option key={meal}>{meal}</option>)}
        </select>
      </label>
      <label className={label}>Procesamiento orientativo
        <select value={processing} onChange={(event) => update({ processing: event.target.value as FoodProcessing })} className={control}>
          {processingGroups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
        </select>
      </label>
    </div>
    {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
    <div className="flex flex-wrap gap-2">
      <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2 text-sm font-bold text-white">
        <Plus size={17} aria-hidden="true"/>{entry ? "Guardar entrada" : "Añadir al diario"}
      </button>
      {entry && <button type="button" className={button} onClick={onCancel}>Cancelar edición</button>}
    </div>
    <details className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
      <summary className="font-bold text-slate-700">Fuentes y cómo interpretar la estimación</summary>
      <p className="mt-2 leading-6">Las cifras dependen de los ingredientes, la preparación y la cantidad servida. Para clasificar el procesamiento de un producto, revisa su lista de ingredientes. Si faltan datos, elige «Por identificar».</p>
      <ul className="mt-2 grid gap-2">
        {sa3FoodSources.map((source) => <li key={source.url}>
          {source.use} <a className="font-semibold text-[#164c3a] underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
        </li>)}
      </ul>
    </details>
  </form>;
}
