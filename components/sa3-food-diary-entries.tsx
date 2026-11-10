import { Apple, ChevronDown, Clock3, Coffee, Moon, Pencil, Sun, Trash2, Utensils } from "lucide-react";
import { foodNumber, FoodMacros, Sa3FoodEstimateDetails } from "@/components/sa3-food-estimate";
import {
  displayFoodDay, foodEntryEnergy, foodEntryGroups, foodEntryValues, foodGroups, meals, type FoodEntry,
} from "@/lib/sa3-food-diary";

const mealIcons = {
  Desayuno: Coffee,
  "Media mañana": Sun,
  Comida: Utensils,
  Merienda: Apple,
  Cena: Moon,
  "Otro momento": Clock3,
};
const action = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2";

export function Sa3FoodDiaryEntries({ day, entries, editing, onEdit, onDelete }: {
  day: string;
  entries: FoodEntry[];
  editing: string | null;
  onEdit: (entry: FoodEntry) => void;
  onDelete: (entry: FoodEntry) => void;
}) {
  return <section className="card p-5 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-lg font-extrabold text-slate-950">Entradas del {displayFoodDay(day)}</h3>
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#164c3a]">
        {entries.length} {entries.length === 1 ? "entrada" : "entradas"}
      </span>
    </header>
    {entries.length === 0 ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Añade tu primera entrada para empezar a ver cómo se reparte el día.</p> :
      <div className="mt-5 space-y-5">
        {meals.map((meal) => {
          const items = entries.filter((entry) => entry.meal === meal);
          if (!items.length) return null;
          const Icon = mealIcons[meal];
          return <section key={meal} aria-label={meal}>
            <h4 className="flex items-center gap-2 font-extrabold text-slate-800">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-[#164c3a]"><Icon size={17} aria-hidden="true"/></span>{meal}
            </h4>
            <ul className="mt-2 space-y-2">
              {items.map((entry) => {
                const values = foodEntryValues(entry);
                const kcal = values?.kcal ?? foodEntryEnergy(entry);
                const groupIds = foodEntryGroups(entry);
                const groups = foodGroups.filter((group) => groupIds.has(group.id));
                return <li key={entry.id} className={`space-y-3 rounded-2xl border p-3.5 sm:p-4 ${editing === entry.id ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200 bg-white"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-base font-extrabold text-slate-950">{entry.name}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">
                        {entry.quantity == null ? "Ración sin indicar" : foodNumber.format(entry.quantity) + " " + entry.unit}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#eaf4ef] px-3 py-1.5 text-right text-[#164c3a]">
                      <p className="text-xs leading-4">{values ? "Energía estimada" : "Energía"}</p>
                      <p className="font-black tabular-nums">{kcal == null ? "Sin dato" : foodNumber.format(kcal) + " kcal"}</p>
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Grupos de alimentos">
                    {groups.map((group) => <li key={group.id} className="inline-flex items-baseline gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-semibold leading-4 text-slate-700">
                      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: group.color }}/>{group.label}
                    </li>)}
                  </ul>
                  {values && <FoodMacros values={values} highlight/>}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-100 pt-2">
                    {entry.estimate ? <details className="group min-w-0 grow rounded-lg text-xs text-slate-700">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-bold text-[#164c3a] [&::-webkit-details-marker]:hidden">
                        <ChevronDown size={16} aria-hidden="true" className="shrink-0 group-open:rotate-180"/>Ingredientes y aporte por grupo
                      </summary>
                      <Sa3FoodEstimateDetails estimate={entry.estimate} showTotals={false}/>
                    </details> : <p className="self-center text-xs leading-5 text-slate-600">Macronutrientes sin datos</p>}
                    <div className="ml-auto flex shrink-0 gap-1.5">
                      <button type="button" aria-label={"Editar " + entry.name} title="Editar" onClick={() => onEdit(entry)} className={action + " hover:border-emerald-300 hover:text-[#164c3a]"}><Pencil size={16} aria-hidden="true"/></button>
                      <button type="button" aria-label={"Eliminar " + entry.name} title="Eliminar" onClick={() => onDelete(entry)} className={action + " hover:border-rose-300 hover:text-rose-700"}><Trash2 size={16} aria-hidden="true"/></button>
                    </div>
                  </div>
                </li>;
              })}
            </ul>
          </section>;
        })}
      </div>}
  </section>;
}
