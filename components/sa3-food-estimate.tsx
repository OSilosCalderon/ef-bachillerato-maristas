import { sumFoodValues, type FoodEstimate, type FoodValues } from "@/lib/sa3-food-diary";
import { groupFoodParts } from "@/lib/sa3-food-nutrition";

export const foodNumber = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

export function FoodMacros({ values }: { values: FoodValues }) {
  return <dl className="grid grid-cols-3 gap-2">
    {([
      ["Proteínas", values.protein],
      ["Hidratos de carbono", values.carbs],
      ["Grasas", values.fat],
    ] as const).map(([label, amount]) => <div key={label}>
      <dt className="text-xs">{label}</dt>
      <dd className="font-bold tabular-nums">{foodNumber.format(amount)} g</dd>
    </div>)}
  </dl>;
}

export function Sa3FoodEstimateDetails({ estimate }: { estimate: FoodEstimate }) {
  const totals = sumFoodValues(estimate.parts.map((part) => part.values));
  const groups = groupFoodParts(estimate.parts);

  return <div className="space-y-3">
    <div className="grid gap-3 rounded-xl bg-white p-3 text-[#164c3a] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <p><span className="block text-xs">Energía estimada</span><strong className="text-xl tabular-nums">{foodNumber.format(totals.kcal)} kcal</strong></p>
      <FoodMacros values={totals}/>
    </div>
    <ul className="divide-y divide-emerald-100 rounded-xl border border-emerald-100 bg-white text-sm" aria-label="Grupos e ingredientes de la ración">
      {groups.map((group) => <li key={group.id} className="px-3 py-2.5">
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
          <strong className="flex items-center gap-2 text-slate-800">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: group.color }}/>
            {group.label}
          </strong>
          <span className="font-semibold tabular-nums text-[#164c3a]">
            {group.ingredients.length > 1 ? foodNumber.format(group.grams) + " g · " : ""}{foodNumber.format(group.values.kcal)} kcal
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          {group.ingredients.map((part) => part.name + " · " + foodNumber.format(part.quantity) + " " + part.unit).join(" + ")}
        </p>
        {groups.length > 1 && <p className="mt-1 text-xs leading-5 text-slate-600">
          {foodNumber.format(group.values.protein)} g proteínas · {foodNumber.format(group.values.carbs)} g hidratos · {foodNumber.format(group.values.fat)} g grasas
        </p>}
      </li>)}
    </ul>
  </div>;
}
