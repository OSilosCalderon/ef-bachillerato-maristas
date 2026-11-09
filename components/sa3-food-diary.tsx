"use client";

import { useState } from "react";
import { CalendarDays, CircleHelp, Pencil, Trash2 } from "lucide-react";
import { Sa3FoodEntryForm } from "@/components/sa3-food-entry-form";
import { foodNumber as fmt, FoodMacros, Sa3FoodEstimateDetails } from "@/components/sa3-food-estimate";
import {
  classroomFoodDiary, displayFoodDay, foodEntryEnergy, foodEntryGroups, foodGroups, madridDay, meals,
  readFoodDiary, summarizeFoodDay, type FoodEntry, type FoodEntryDraft,
} from "@/lib/sa3-food-diary";

const control = "mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal";
const label = "text-sm font-bold text-slate-700";
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-emerald-500";
type DiaryMode = "case" | "personal";

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
  const [formRevision, setFormRevision] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const entries = diaries[mode];
  const daily = entries.filter((entry) => entry.day === day);
  const days = [...new Set(entries.map((entry) => entry.day))].sort().reverse();
  const summary = summarizeFoodDay(daily);
  const groupMentions = summary.groups.reduce((total, group) => total + group.count, 0);

  function clearDraft() {
    setEditing(null);
    setFormRevision((revision) => revision + 1);
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

  function saveEntry(draft: FoodEntryDraft) {
    const entry = { ...draft, id: editing ?? crypto.randomUUID(), day };
    saveEntries(editing ? entries.map((item) => item.id === editing ? entry : item) : [...entries, entry],
      editing ? "Entrada actualizada." : "Entrada añadida al diario.");
    clearDraft();
  }

  return <div className="space-y-5">
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">01 · Observa</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Diario de alimentación</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Escribe lo que has tomado y la cantidad para estimar su aporte. Puedes practicar con el caso de aula o comparar tres días de tu propio registro.</p>
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
          <Sa3FoodEntryForm key={formRevision + ":" + (editing ?? "new")} entry={daily.find((entry) => entry.id === editing)}
            onSave={saveEntry} onCancel={() => { clearDraft(); setNotice(""); }}/>
          <p role="status" className="mt-3 text-sm font-semibold text-[#164c3a]">{notice}</p>
        </section>

        <section className="card p-5 sm:p-6">
          <h3 className="text-lg font-extrabold text-slate-950">Entradas del {displayFoodDay(day)}</h3>
          {daily.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-600">Aún no hay alimentos en este día. Usa el formulario para añadir una entrada.</p> :
            <ul className="mt-3 divide-y divide-slate-100">
              {[...daily].sort((a, b) => meals.indexOf(a.meal) - meals.indexOf(b.meal)).map((entry) => {
                const kcal = foodEntryEnergy(entry);
                const groupIds = foodEntryGroups(entry);
                const groups = foodGroups.filter((group) => groupIds.has(group.id)).map((group) => group.label).join(", ");
                return <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-bold text-slate-900">{entry.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{entry.meal} · {groups}{entry.quantity != null ? " · " + fmt.format(entry.quantity) + " " + entry.unit : ""}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-[#164c3a]">{kcal == null ? "Sin dato" : fmt.format(kcal) + " kcal"}</span>
                  <div className="flex gap-1">
                    <button type="button" aria-label={"Editar " + entry.name} onClick={() => { setEditing(entry.id); setNotice("Editando " + entry.name + "."); }} className={button}><Pencil size={16} aria-hidden="true"/></button>
                    <button type="button" aria-label={"Eliminar " + entry.name} onClick={() => {
                      saveEntries(entries.filter((item) => item.id !== entry.id), "Entrada eliminada.");
                      if (editing === entry.id) clearDraft();
                    }} className={button}><Trash2 size={16} aria-hidden="true"/></button>
                  </div>
                  {entry.estimate && <details className="w-full rounded-xl bg-emerald-50/60 p-3">
                    <summary className="cursor-pointer text-xs font-bold text-[#164c3a]">Ver nutrientes e ingredientes</summary>
                    <div className="mt-3"><Sa3FoodEstimateDetails estimate={entry.estimate}/></div>
                  </details>}
                </li>;
              })}
            </ul>}
        </section>
      </div>

      <aside className="space-y-5" aria-label="Resumen de la alimentación registrada">
        <section className="rounded-3xl bg-[#0c372e] p-5 text-white sm:p-6">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Energía de las entradas</p>
          <p className="mt-2 text-3xl font-black tabular-nums" aria-live="polite">{summary.energy == null ? "—" : fmt.format(summary.energy) + " kcal"}</p>
          <p className="mt-2 text-sm leading-6 text-emerald-50">{summary.known} de {daily.length} entradas con cálculo de energía.</p>
          {summary.macros && <div className="mt-4 border-t border-white/20 pt-4 text-emerald-50">
            <FoodMacros values={summary.macros}/>
            <p className="mt-2 text-xs">{summary.macroEntries} de {daily.length} entradas con datos de macronutrientes.</p>
          </div>}
        </section>
        <section className="card space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">Medidor del día</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">Mapa de alimentos</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600"><strong>{summary.distinctGroups} grupos</strong> de alimentos identificados. Las barras cuentan anotaciones por grupo. Un plato puede aparecer en varios grupos. El agua, otros alimentos y las entradas por clasificar figuran por separado.</p>
          </div>
          <EntriesMeter title="Por grupo" items={summary.groups} total={groupMentions}/>
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
