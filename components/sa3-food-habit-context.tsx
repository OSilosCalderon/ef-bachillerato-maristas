"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Utensils } from "lucide-react";
import { meals, type FoodDiaries, type FoodDiaryMode } from "@/lib/sa3-food-diary";
import { summarizeFoodDay } from "@/lib/sa3-food-nutrition";
import { activityWeekdays, type ActivityDays, type ActivityLevel, type ActivityWeekday } from "@/lib/sa3-habits-types";

const dateLabel = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Madrid" });
const levels = { mas: "Más gasto", menos: "Menos gasto" };
const selectClass = "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800";

export function Sa3FoodHabitContext({ diaries, activityDays, onChangeDay, disabled }: {
  diaries: FoodDiaries;
  activityDays: ActivityDays;
  onChangeDay: (day: ActivityWeekday, level: ActivityLevel | "") => void;
  disabled: boolean;
}) {
  const [source, setSource] = useState<FoodDiaryMode>("personal");
  const [selectedDate, setSelectedDate] = useState("");
  const entries = diaries[source];
  const dates = [...new Set(entries.map((entry) => entry.day))].sort().reverse();
  const date = dates.includes(selectedDate) ? selectedDate : dates[0];
  const dayEntries = entries.filter((entry) => entry.day === date);
  const summary = summarizeFoodDay(dayEntries);
  const weekday = date ? activityWeekdays[(new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7][0] : undefined;
  const activity = weekday && source === "personal" ? activityDays[weekday] : undefined;

  return <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="sa3-food-habit-diary">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="sa3-food-habit-diary" className="flex items-center gap-2 font-extrabold text-slate-950">
          <Utensils size={17} aria-hidden="true" className="text-[#1e6b4f]"/> Tu diario de alimentación
        </h3>
        <a href="#diario" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-[#164c3a] underline underline-offset-4">
          Abrir Diario y kcal <ArrowUpRight size={15} aria-hidden="true"/>
        </a>
      </div>
      <div role="group" aria-label="Registro de alimentación que se muestra" className="mt-2 flex w-fit flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {([["personal", "Mi registro"], ["case", "Caso de aula"]] as const).map(([id, label]) => <button
          key={id} type="button" onClick={() => setSource(id)} aria-pressed={source === id}
          className="min-h-10 rounded-lg px-3 text-sm font-bold text-slate-600 aria-pressed:bg-white aria-pressed:text-[#164c3a] aria-pressed:shadow-sm"
        >{label}</button>)}
      </div>
      {date ? <div className="mt-3">
        <label htmlFor="sa3-food-habit-date" className="block text-sm font-bold text-slate-700">Día del diario</label>
        <select id="sa3-food-habit-date" value={date} onChange={(event) => setSelectedDate(event.target.value)} className={selectClass + " mt-1"}>
          {dates.map((value) => <option key={value} value={value}>{dateLabel.format(new Date(value + "T12:00:00Z"))}</option>)}
        </select>
        <p className="mt-3 text-sm text-slate-700">
          <strong>{dayEntries.length} {dayEntries.length === 1 ? "entrada" : "entradas"}</strong> · {summary.distinctGroups} grupos de alimentos
          {activity && <span className="ml-2 inline-block rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-[#164c3a]">{levels[activity]}</span>}
        </p>
        <dl className="mt-2 divide-y divide-slate-100 text-sm leading-5">
          {meals.map((meal) => {
            const items = dayEntries.filter((entry) => entry.meal === meal);
            return items.length ? <div key={meal} className="flex flex-wrap gap-x-2 py-2">
              <dt className="font-bold text-slate-800">{meal}</dt>
              <dd className="min-w-0 break-words text-slate-600">{items.map((entry) => entry.name).join(", ")}</dd>
            </div> : null;
          })}
        </dl>
      </div> : <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">Aquí aparecerán tus anotaciones. Añádelas en «Diario y kcal» o abre el caso de aula para practicar.</p>}
    </section>
    <fieldset disabled={disabled} className="min-w-0 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5" aria-labelledby="sa3-food-habit-activity">
      <h3 id="sa3-food-habit-activity" className="flex items-center gap-2 font-extrabold text-slate-950">
        <CalendarDays size={17} aria-hidden="true" className="text-[#1e6b4f]"/> Días de mayor y menor gasto
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">Traslada lo que observaste en el estudio de gasto energético. Revisa cómo se organizan tus comidas esos días y elige cuándo practicar tu acción.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {activityWeekdays.map(([day, label]) => <div key={day} className="min-w-0">
          <label htmlFor={`sa3-gasto-${day}`} className="block text-xs font-bold text-slate-700">{label}</label>
          <select id={`sa3-gasto-${day}`} value={activityDays[day] ?? ""} onChange={(event) => onChangeDay(day, event.target.value as ActivityLevel | "")}
            className={selectClass + " mt-1" + (activityDays[day] ? " border-emerald-500" : "")}>
            <option value="">Sin marcar</option>
            <option value="mas">Más gasto</option>
            <option value="menos">Menos gasto</option>
          </select>
        </div>)}
      </div>
    </fieldset>
  </div>;
}
