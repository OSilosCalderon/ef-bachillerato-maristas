"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, Calculator, CircleHelp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  classroomFoodDiary, displayFoodDay, foodEnergy, foodGroups, madridDay, meals,
  parseFoodDecimal, processingGroups, readFoodDiary, summarizeFoodDay, type FoodEntry,
} from "@/lib/sa3-food-diary";

const control = "mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal";
const label = "text-sm font-bold text-slate-700";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-emerald-500";
const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

type DiaryMode = "case" | "personal";
type FoodDraft = Omit<FoodEntry, "id" | "day" | "quantity" | "kcalPer100"> & {
  quantity: string;
  kcalPer100: string;
};

const emptyFood: FoodDraft = {
  meal: "Comida", name: "", group: "duda", processing: "duda",
  quantity: "", unit: "g", kcalPer100: "",
};

function loadEntries(key: string, fallback: FoodEntry[]) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? readFoodDiary(raw) : fallback;
  } catch {
    return fallback;
  }
}

type MeterItem = { id: string; label: string; color: string; count: number };

function EntriesMeter({ items, total, title }: { items: MeterItem[]; total: number; title: string }) {
  const present = items.filter((item) => item.count > 0);
  return <div>
    <h4 className="font-bold text-slate-900">{title}</h4>
    {total ? <>
      <div className="mt-3 flex h-3.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        {present.map((item) => <span key={item.id} style={{ width: (item.count / total * 100) + "%", backgroundColor: item.color }}/>)}
      </div>
      <ul className="mt-3 grid gap-2 text-sm">
        {present.map((item) => <li key={item.id} className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-start gap-2 text-slate-700">
            <span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }}/>
            {item.label}
          </span>
          <strong className="shrink-0 tabular-nums text-slate-900">{item.count}</strong>
        </li>)}
      </ul>
    </> : <p className="mt-3 text-sm text-slate-500">Añade una entrada para ver el reparto.</p>}
  </div>;
}

export function Sa3FoodDiary({ storageKey }: { storageKey: string }) {
  const [today] = useState(madridDay);
  const [day, setDay] = useState(today);
  const [mode, setMode] = useState<DiaryMode>("case");
  const [diaries, setDiaries] = useState(() => ({
    case: loadEntries(storageKey + ":case", classroomFoodDiary(today)),
    personal: loadEntries(storageKey + ":personal", []),
  }));
  const [draft, setDraft] = useState<FoodDraft>(emptyFood);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const entries = diaries[mode];
  const daily = entries.filter((entry) => entry.day === day);
  const days = [...new Set(entries.map((entry) => entry.day))].sort().reverse();
  const summary = summarizeFoodDay(daily);
  const quantity = parseFoodDecimal(draft.quantity);
  const kcalPer100 = parseFoodDecimal(draft.kcalPer100);
  const estimate = foodEnergy(quantity, kcalPer100);

  function setField<K extends keyof FoodDraft>(key: K, value: FoodDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
    setNotice("");
  }

  function clearDraft() {
    setDraft(emptyFood);
    setEditing(null);
    setError("");
  }

  function chooseDay(value: string) {
    if (!value || value === day) return;
    setDay(value);
    clearDraft();
    setNotice("");
  }

  function chooseMode(value: DiaryMode) {
    if (value === mode) return;
    setMode(value);
    setDay(today);
    clearDraft();
    setNotice("");
  }

  function saveEntries(next: FoodEntry[], success: string) {
    setDiaries((current) => ({ ...current, [mode]: next }));
    try {
      window.localStorage.setItem(storageKey + ":" + mode, JSON.stringify(next));
      setNotice(success);
    } catch {
      setNotice("Cambio aplicado para esta visita. El navegador no ha guardado el diario.");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) return setError("Escribe el nombre del alimento o bebida.");
    if (draft.quantity.trim() && (quantity == null || quantity <= 0 || quantity > 10000)) {
      return setError("Indica una cantidad mayor que 0, con un máximo de 10.000 g o ml.");
    }
    if (draft.kcalPer100.trim() && (kcalPer100 == null || kcalPer100 > 1000)) {
      return setError("Revisa las kcal por 100 " + draft.unit + ". Introduce un número entre 0 y 1000.");
    }
    if (kcalPer100 != null && quantity == null) return setError("Indica la cantidad para calcular las kcal.");
    const entry: FoodEntry = {
      ...draft, id: editing ?? crypto.randomUUID(), day, name: draft.name.trim(), quantity, kcalPer100,
    };
    saveEntries(editing ? entries.map((item) => item.id === editing ? entry : item) : [...entries, entry],
      editing ? "Entrada actualizada." : "Entrada añadida al diario.");
    clearDraft();
  }

  function edit(entry: FoodEntry) {
    setEditing(entry.id);
    setDraft({
      name: entry.name, meal: entry.meal, group: entry.group, processing: entry.processing,
      unit: entry.unit, quantity: entry.quantity == null ? "" : String(entry.quantity),
      kcalPer100: entry.kcalPer100 == null ? "" : String(entry.kcalPer100),
    });
    setError("");
    setNotice("Editando " + entry.name + ".");
    document.getElementById("sa3-food-name")?.focus();
  }

  return <div className="space-y-5">
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">01 · Observa</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Diario de alimentación</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Compara tres días del caso de aula o de tu propio registro. Anota los alimentos que quieras analizar y clasifícalos con la información disponible.</p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Tipo de diario">
          <button type="button" onClick={() => chooseMode("case")} aria-pressed={mode === "case"} className={"min-h-10 rounded-lg px-3 py-2 text-sm font-bold " + (mode === "case" ? "bg-white text-[#164c3a] shadow-sm" : "text-slate-600")}>Caso de aula</button>
          <button type="button" onClick={() => chooseMode("personal")} aria-pressed={mode === "personal"} className={"min-h-10 rounded-lg px-3 py-2 text-sm font-bold " + (mode === "personal" ? "bg-white text-[#164c3a] shadow-sm" : "text-slate-600")}>Mi registro</button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <label className={label}><span className="flex items-center gap-2"><CalendarDays size={16} aria-hidden="true"/> Día del registro</span>
          <input type="date" value={day} onChange={(event) => chooseDay(event.target.value)} className={control}/>
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Días con anotaciones">
          {days.slice(0, 7).map((date) => <button key={date} type="button" aria-pressed={date === day} onClick={() => chooseDay(date)}
            className={"min-h-10 rounded-lg border px-3 py-2 text-sm font-bold " + (date === day ? "border-emerald-300 bg-emerald-50 text-[#164c3a]" : "border-slate-200 bg-white text-slate-600")}>
            {displayFoodDay(date)} · {entries.filter((entry) => entry.day === date).length}
          </button>)}
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">
        {mode === "case" ? "Caso editable con registros parciales y datos de etiqueta simulados." : "Tu diario se guarda en este navegador. Si compartes el equipo, puedes trabajar con el caso de aula."}
      </p>
    </section>

    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <section className="card p-5 sm:p-6">
          <h3 className="text-lg font-extrabold text-slate-950">{editing ? "Editar alimento" : "Añadir alimento o bebida"}</h3>
          <form onSubmit={submit} className="mt-4 grid gap-4">
            <label className={label}>Nombre
              <input id="sa3-food-name" required maxLength={90} value={draft.name} onChange={(event) => setField("name", event.target.value)} placeholder="Ejemplo: pan integral" className={control}/>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>Momento
                <select value={draft.meal} onChange={(event) => setField("meal", event.target.value as FoodDraft["meal"])} className={control}>
                  {meals.map((meal) => <option key={meal}>{meal}</option>)}
                </select>
              </label>
              <label className={label}>Grupo de alimentos
                <select value={draft.group} onChange={(event) => setField("group", event.target.value as FoodDraft["group"])} className={control}>
                  {foodGroups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
                </select>
              </label>
            </div>
            <label className={label}>Procesamiento orientativo
              <select value={draft.processing} onChange={(event) => setField("processing", event.target.value as FoodDraft["processing"])} className={control}>
                {processingGroups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
              </select>
            </label>
            <details className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <summary className="font-bold text-slate-700">Cómo clasificar</summary>
              <p className="mt-2 leading-6">La fruta entera o la avena simple son ejemplos de NOVA 1. El aceite es un ingrediente culinario. Una conserva de legumbres con sal puede ser procesada. Para un producto formulado, revisa la lista de ingredientes y el tipo de elaboración. Si faltan datos, elige «Por identificar».</p>
            </details>
            <fieldset className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <legend className="px-1 text-sm font-black text-[#164c3a]"><span className="inline-flex items-center gap-2"><Calculator size={16} aria-hidden="true"/> Calculadora de kcal</span></legend>
              <p className="text-xs leading-5 text-slate-600">Cantidad × kcal de la etiqueta por 100 g o ml ÷ 100. Usa la misma unidad que la etiqueta. Estos campos son opcionales.</p>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_5rem] gap-3 sm:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)]">
                <label className={label}>Cantidad<input inputMode="decimal" maxLength={10} value={draft.quantity} onChange={(event) => setField("quantity", event.target.value)} placeholder="50" className={control}/></label>
                <label className={label}>Unidad<select value={draft.unit} onChange={(event) => setField("unit", event.target.value as FoodDraft["unit"])} className={control}><option>g</option><option>ml</option></select></label>
                <label className={label + " col-span-2 sm:col-span-1"}>kcal por 100 {draft.unit}<input inputMode="decimal" maxLength={10} value={draft.kcalPer100} onChange={(event) => setField("kcalPer100", event.target.value)} placeholder="240" className={control}/></label>
              </div>
              <output className="mt-3 block font-black text-[#164c3a]" aria-label="Energía estimada de la entrada">{estimate == null ? "Resultado por entrada · —" : fmt.format(estimate) + " kcal estimadas"}</output>
            </fieldset>
            {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2 text-sm font-bold text-white"><Plus size={17} aria-hidden="true"/>{editing ? "Guardar entrada" : "Añadir al diario"}</button>
              {editing && <button type="button" className={button} onClick={clearDraft}>Cancelar edición</button>}
            </div>
          </form>
          <p role="status" className="mt-3 text-sm font-semibold text-[#164c3a]">{notice}</p>
        </section>

        <section className="card p-5 sm:p-6">
          <h3 className="text-lg font-extrabold text-slate-950">Entradas del {displayFoodDay(day)}</h3>
          {daily.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-600">Aún no hay alimentos en este día. Usa el formulario para añadir una entrada.</p> :
            <ul className="mt-3 divide-y divide-slate-100">
              {[...daily].sort((a, b) => meals.indexOf(a.meal) - meals.indexOf(b.meal)).map((entry) => {
                const kcal = foodEnergy(entry.quantity, entry.kcalPer100);
                return <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-bold text-slate-900">{entry.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{entry.meal} · {foodGroups.find((group) => group.id === entry.group)?.label}{entry.quantity != null ? " · " + fmt.format(entry.quantity) + " " + entry.unit : ""}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-[#164c3a]">{kcal == null ? "Sin dato" : fmt.format(kcal) + " kcal"}</span>
                  <div className="flex gap-1">
                    <button type="button" aria-label={"Editar " + entry.name} onClick={() => edit(entry)} className={button}><Pencil size={16} aria-hidden="true"/></button>
                    <button type="button" aria-label={"Eliminar " + entry.name} onClick={() => {
                      saveEntries(entries.filter((item) => item.id !== entry.id), "Entrada eliminada.");
                      if (editing === entry.id) clearDraft();
                    }} className={button}><Trash2 size={16} aria-hidden="true"/></button>
                  </div>
                </li>;
              })}
            </ul>}
        </section>
      </div>

      <aside className="space-y-5" aria-label="Resumen de la alimentación registrada">
        <section className="rounded-3xl bg-[#0c372e] p-5 text-white sm:p-6">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Energía de las entradas</p>
          <p className="mt-2 text-3xl font-black tabular-nums" aria-live="polite">{summary.energy == null ? "—" : fmt.format(summary.energy) + " kcal"}</p>
          <p className="mt-2 text-sm leading-6 text-emerald-50">{summary.known} de {daily.length} entradas con cálculo. El resultado corresponde a las entradas con cantidad y dato energético.</p>
        </section>
        <section className="card space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">Medidor del día</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">Mapa de alimentos</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600"><strong>{summary.distinctGroups} grupos</strong> de alimentos identificados. Las barras cuentan anotaciones. El agua, otros alimentos y las entradas por clasificar figuran por separado.</p>
          </div>
          <EntriesMeter title="Por grupo" items={summary.groups} total={daily.length}/>
          <div className="border-t border-slate-100 pt-4">
            <EntriesMeter title="Por procesamiento" items={summary.processing} total={daily.length}/>
          </div>
        </section>
        {days.length > 1 && <section className="card p-5">
          <h3 className="font-extrabold text-slate-950">Comparación de días</h3>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs text-slate-600"><tr><th scope="col" className="pb-2">Día</th><th scope="col" className="pb-2 text-right">Entradas</th><th scope="col" className="pb-2 text-right">Grupos</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{days.slice(0, 3).map((date) => {
              const dayEntries = entries.filter((entry) => entry.day === date);
              return <tr key={date}>
                <th scope="row" className="py-2 font-semibold">{displayFoodDay(date)}</th>
                <td className="py-2 text-right tabular-nums">{dayEntries.length}</td>
                <td className="py-2 text-right tabular-nums">{summarizeFoodDay(dayEntries).distinctGroups}</td>
              </tr>;
            })}</tbody>
          </table>
          <p className="mt-2 text-xs leading-5 text-slate-600">Interpreta los grupos junto con el número de entradas de cada día.</p>
        </section>}
        <section className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><CircleHelp size={17} aria-hidden="true"/> Pregunta para tu informe</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">¿Qué grupo aparece en varios días? ¿Cómo cambiaría tu interpretación si faltara una comida? Elige una evidencia y una limitación.</p>
        </section>
      </aside>
    </div>
  </div>;
}
