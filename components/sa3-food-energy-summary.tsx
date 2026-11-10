import { foodMacroColors, foodNumber } from "@/components/sa3-food-estimate";
import { foodMacroEnergy, foodMacronutrients, type summarizeFoodDay } from "@/lib/sa3-food-diary";

type FoodDaySummary = ReturnType<typeof summarizeFoodDay>;

export function Sa3FoodEnergySummary({ summary, entryCount }: { summary: FoodDaySummary; entryCount: number }) {
  const breakdown = foodMacroEnergy(summary.macros);
  const visiblePortions = breakdown?.portions.filter(({ percent }) => percent > 0) ?? [];
  const stops: string[] = [];
  let end = 0;
  for (const { key, percent } of visiblePortions) {
    const start = end;
    end += percent;
    stops.push(`${foodMacroColors[key]} ${start}% ${end}%`);
  }
  const ring = visiblePortions.length === 1 ? foodMacroColors[visiblePortions[0].key]
    : stops.length > 1 ? `conic-gradient(${stops.join(", ")})` : undefined;

  return <section id="reparto-energia-sa3" className="card scroll-mt-4 overflow-hidden" aria-label="Energía y macronutrientes del día">
    <div className="bg-[#0c372e] p-5 text-white sm:p-6">
      <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Energía de las entradas</p>
      <p className="mt-2 text-3xl font-black tabular-nums" aria-live="polite">{summary.energy == null ? "—" : foodNumber.format(summary.energy) + " kcal"}</p>
      <p className="mt-2 text-sm leading-6 text-emerald-50">{summary.known} de {entryCount} entradas con cálculo de energía.</p>
    </div>
    <div className="p-5 sm:p-6">
      <h3 className="text-lg font-extrabold text-slate-950">Reparto de energía por macronutriente</h3>
      <p className="mt-1 text-sm text-slate-600">{summary.macroEntries} de {entryCount} entradas con datos de macronutrientes.</p>
      {breakdown ? <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full bg-slate-100" style={{ background: ring }}>
          <div className="absolute inset-3.5 flex flex-col items-center justify-center rounded-full bg-white px-2 text-center">
            <strong className="text-xl font-black tabular-nums text-slate-950">{foodNumber.format(breakdown.total)}</strong>
            <span className="text-[11px] leading-tight text-slate-600">kcal del reparto</span>
          </div>
        </div>
        <dl aria-label="Porcentajes de energía" aria-live="polite" className="min-w-0 flex-[1_1_11rem] space-y-2.5">
          {breakdown.portions.map(({ key, label, grams, percent }) => <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
            <dt className="col-start-1 row-start-1 flex items-baseline gap-2 text-xs font-bold leading-5 text-slate-800">
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: foodMacroColors[key] }}/>{label}
            </dt>
            <dd className="col-start-1 row-start-2 ml-[18px] text-xs text-slate-600">{foodNumber.format(grams)} g</dd>
            <dd className="col-start-2 row-span-2 row-start-1 self-center text-sm font-extrabold tabular-nums text-slate-950">{percent} %</dd>
          </div>)}
        </dl>
      </div> : <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        {summary.macros ? "El reparto aparece cuando las entradas aportan energía de proteínas, hidratos o grasas." : "Añade una entrada del catálogo o por ingredientes para ver el reparto."}
      </p>}
      <details className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">
        <summary className="cursor-pointer font-bold text-[#164c3a]">Cómo se calcula el porcentaje</summary>
        <p className="mt-2">
          Multiplicamos los gramos por su aporte energético. {foodMacronutrients.map(({ label, kcalPerGram }) => label + " " + kcalPerGram + " kcal/g").join(" · ")}.
          Cada porcentaje se calcula sobre la suma de esas tres aportaciones. El gráfico usa las entradas con los tres datos registrados.
        </p>
        <a href="https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32011R1169" target="_blank" rel="noreferrer" className="mt-2 inline-block font-bold text-[#164c3a] underline">
          Reglamento (UE) 1169/2011 · Anexo XIV
        </a>
      </details>
    </div>
  </section>;
}
