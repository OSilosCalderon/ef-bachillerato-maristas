"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { BookOpenCheck, CalendarDays, ClipboardCheck, Download, FileText, Loader2, NotebookPen, Save, Target } from "lucide-react";
import { loadFoodDiaries, Sa3FoodDiary } from "@/components/sa3-food-diary";
import { Sa3FoodHabitContext } from "@/components/sa3-food-habit-context";
import { Sa3SessionGuide } from "@/components/sa3-session-guide";
import { madridDay, type FoodDiaries } from "@/lib/sa3-food-diary";
import { habitPdfData } from "@/lib/sa3-habit-pdf";
import {
  activityDayNames, habitKinds, habitLabel, habitOptions, habitStatusLabels, ratingFields,
  type ActivityLevel, type ActivityWeekday, type HabitChallengeData, type HabitKind, type HabitPlan, type HabitWorkspaceData,
  type HabitWorkspaceStore, type WeeklyLog,
} from "@/lib/sa3-habits-types";

const views = [
  { id: "diario", title: "Diario y kcal", icon: NotebookPen },
  { id: "reto", title: "Mi hábito", icon: Target },
  { id: "seguimiento", title: "Seguimiento", icon: CalendarDays },
  { id: "balance", title: "Informe final", icon: FileText },
  { id: "sesiones", title: "10 sesiones", icon: BookOpenCheck },
] as const;

type View = (typeof views)[number]["id"];
type ChallengeView = Extract<View, "reto" | "seguimiento" | "balance">;
const otherHabitOptions = habitOptions.filter(([key]) => key !== "alimentacion");
const control = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal leading-6 text-slate-900";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2 text-sm font-bold text-white disabled:opacity-50";
const secondary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50";

function currentView(): View {
  const hash = window.location.hash.slice(1);
  return views.find((view) => view.id === hash)?.id ?? "diario";
}

function listenForViewChange(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function TextField({ title, hint, value, onChange, rows = 3 }: {
  title: string; hint: string; value: string; onChange: (value: string) => void; rows?: number;
}) {
  return <label className="block text-sm font-bold text-slate-700">
    {title}
    <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{hint}</span>
    <textarea maxLength={3000} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className={control}/>
  </label>;
}

function SavedButton({ busy, children, onClick }: { busy: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" disabled={busy} onClick={onClick} className={primary}>
    {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true"/> : <Save size={16} aria-hidden="true"/>}
    {children}
  </button>;
}

function HabitReport({ plan, weeks }: { plan: HabitPlan; weeks: WeeklyLog[] }) {
  const habit = habitLabel(plan.focusHabit);
  const first = weeks.find((week) => week.weekNumber === 1)?.goalCompletion;
  const last = weeks.find((week) => week.weekNumber === 4)?.goalCompletion;
  const difference = first != null && last != null ? last - first : null;
  return <section className="card p-5 sm:p-7" aria-label="Vista de la bitácora">
    <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">Maristas Badajoz · Educación Física · 2º Bachillerato</p>
    <h3 className="mt-2 text-xl font-black text-slate-950">Bitácora de un cambio sostenible</h3>
    <p className="mt-1 text-sm font-semibold text-slate-600">{habit} · {habitStatusLabels[plan.status]}</p>
    <dl className="mt-5 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
      {[
        ["Punto de partida", plan.initialReflection],
        ...(plan.activityDays ? [
          ["Días de mayor gasto", activityDayNames(plan.activityDays, "mas")],
          ["Días de menor gasto", activityDayNames(plan.activityDays, "menos")],
        ] : []),
        ["Objetivo", plan.objective],
        ["Señal y acción", plan.actionPlan],
        ["Alternativa", plan.barrierStrategy],
        ["Indicador", plan.successIndicator],
      ].map(([title, value]) => <div key={title}>
        <dt className="font-extrabold text-slate-950">{title}</dt>
        <dd className="whitespace-pre-wrap break-words">{value.trim() || "Pendiente de completar"}</dd>
      </div>)}
    </dl>
    <div className="mt-5 border-t border-slate-200 pt-4">
      <h4 className="font-extrabold text-slate-950">Evolución del hábito</h4>
      {difference != null && <p className="mt-1 text-sm text-slate-700">Semana 1: {first}% · Semana 4: {last}% · Diferencia: {difference > 0 ? "+" : ""}{difference} puntos porcentuales</p>}
      {weeks.length ? <ol className="mt-3 space-y-3 text-sm leading-6">
        {weeks.map((week) => <li key={week.weekNumber}>
          <strong>Semana {week.weekNumber} · {week.goalCompletion}%</strong>
          <p className="whitespace-pre-wrap break-words text-slate-700">{week.reflection || "Observación pendiente."}</p>
          {week.nextAdjustment && <p className="whitespace-pre-wrap break-words text-slate-700">Ajuste: {week.nextAdjustment}</p>}
        </li>)}
      </ol> : <p className="mt-2 text-sm text-slate-500">Los registros aparecerán aquí al guardarlos.</p>}
    </div>
    <div className="mt-5 border-t border-slate-200 pt-4">
      <h4 className="font-extrabold text-slate-950">Interpretación y próximo paso</h4>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{plan.finalReflection.trim() || "Pendiente de completar"}</p>
    </div>
  </section>;
}

function HabitChallenge({ data, kind, diaries, studentName, group, store, view, preview }: {
  data: HabitChallengeData;
  kind: HabitKind;
  diaries: FoodDiaries;
  studentName: string;
  group: string;
  store: HabitWorkspaceStore;
  view: ChallengeView | null;
  preview: boolean;
}) {
  const [plan, setPlan] = useState(data.plan);
  const [weeks, setWeeks] = useState(data.weeks);
  const [savedPlan, setSavedPlan] = useState(data.plan);
  const [hasSavedPlan, setHasSavedPlan] = useState(data.hasPlan);
  const [savedWeeks, setSavedWeeks] = useState(data.weeks.filter((week) => week.id));
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const isFood = kind === "alimentacion";
  const habitChoice = habitOptions.some(([key]) => key === plan.focusHabit) ? plan.focusHabit : "otro";
  const planReady = plan.focusHabit !== "otro" &&
    [plan.initialReflection, plan.objective, plan.actionPlan, plan.barrierStrategy, plan.successIndicator].every((value) => value.trim());
  const completeWeeks = savedWeeks.filter((week) => week.reflection.trim()).length;
  const weeksHaveEdits = weeks.some((week) => {
    const saved = savedWeeks.find((item) => item.weekNumber === week.weekNumber);
    return saved ? JSON.stringify(saved) !== JSON.stringify(week)
      : Boolean(week.reflection.trim() || week.nextAdjustment.trim() || week.goalCompletion || ratingFields.some(([key]) => week[key] != null));
  });
  const ready = planReady && completeWeeks === 4 && !weeksHaveEdits && Boolean(plan.finalReflection.trim());
  const planDirty = JSON.stringify(plan) !== JSON.stringify(savedPlan);

  function updatePlan<K extends keyof HabitPlan>(key: K, value: HabitPlan[K]) {
    setPlan((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateWeek<K extends keyof WeeklyLog>(weekNumber: number, key: K, value: WeeklyLog[K]) {
    setWeeks((current) => current.map((week) => week.weekNumber === weekNumber ? { ...week, [key]: value } : week));
    setNotice("");
  }

  function updateActivityDay(day: ActivityWeekday, level: ActivityLevel | "") {
    setPlan((current) => {
      const activityDays = { ...current.activityDays };
      if (level) activityDays[day] = level;
      else delete activityDays[day];
      return { ...current, activityDays };
    });
    setNotice("");
  }

  async function savePlan(finalize = false) {
    if (busy || (finalize && !ready)) return;
    if (plan.focusHabit === "otro") {
      setError("Escribe el nombre del hábito que quieres trabajar en «Mi hábito».");
      return;
    }
    const next: HabitPlan = {
      ...plan,
      focusHabit: plan.focusHabit.trim(),
      status: finalize ? "completed" : plan.status === "completed" && ready ? "completed" : plan.objective.trim() ? "active" : "draft",
    };
    setBusy(finalize ? "final" : "plan");
    setError("");
    setNotice("");
    try {
      await store.savePlan(kind, next);
      setPlan(next);
      setSavedPlan(next);
      setHasSavedPlan(true);
      setNotice(finalize ? (preview ? "Bitácora de ejemplo finalizada." : "Bitácora finalizada y guardada para la revisión docente.") : "Reto guardado.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar la bitácora.");
    } finally {
      setBusy(null);
    }
  }

  async function saveWeek(week: WeeklyLog) {
    if (busy) return;
    if (!week.reflection.trim()) {
      setError("Escribe qué observaste en la semana " + week.weekNumber + ".");
      return;
    }
    if (!Number.isInteger(week.goalCompletion) || week.goalCompletion < 0 || week.goalCompletion > 100) {
      setError("El porcentaje de la semana " + week.weekNumber + " debe ser un número entero entre 0 y 100.");
      return;
    }
    setBusy("week-" + week.weekNumber);
    setError("");
    setNotice("");
    try {
      const id = await store.saveWeek(kind, week);
      const saved = { ...week, id };
      setWeeks((current) => current.map((item) => item.weekNumber === week.weekNumber ? saved : item));
      setSavedWeeks((current) => [...current.filter((item) => item.weekNumber !== saved.weekNumber), saved]
        .sort((a, b) => a.weekNumber - b.weekNumber));
      setNotice("Semana " + week.weekNumber + " guardada.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar el registro semanal.");
    } finally {
      setBusy(null);
    }
  }

  async function exportPdf() {
    if (busy || !hasSavedPlan || planDirty) return;
    setBusy("pdf");
    setError("");
    setNotice("");
    try {
      const { downloadPersonalPlanPdf } = await import("@/lib/personal-plan-pdf");
      downloadPersonalPlanPdf(
        habitPdfData(kind, savedPlan, savedWeeks, studentName, group),
        isFood ? "reto-alimentacion-sa3" : "reto-habito-sa3",
      );
      setNotice("PDF preparado. Ábrelo desde las descargas para imprimirlo.");
    } catch {
      setError("No se ha podido preparar el PDF. Vuelve a pulsar «Descargar PDF».");
    } finally {
      setBusy(null);
    }
  }

  const pdfButton = <button type="button" disabled={busy != null || !hasSavedPlan || planDirty}
    onClick={() => void exportPdf()} className={secondary}>
    <Download size={16} aria-hidden="true"/>{busy === "pdf" ? "Preparando PDF…" : "Descargar PDF"}
  </button>;

  const message = error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>
    : notice ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-[#164c3a]">{notice}</p> : null;

  if (view === "reto") return <section className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">{isFood ? "Mi reto de alimentación" : "Mi hábito a mejorar"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{isFood
            ? "Revisa tus anotaciones y elige una acción concreta que puedas repetir durante cuatro semanas."
            : "Elige una acción pequeña, una señal reconocible y una forma de observarla durante cuatro semanas."}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{preview ? "Trabajas con el reto de ejemplo." : "El profesorado puede revisar la plantilla, el seguimiento y la reflexión que guardes. El diario se queda en este navegador."}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-[#164c3a]">{hasSavedPlan ? habitStatusLabels[savedPlan.status] : "Sin guardar"}</span>
      </div>
      {isFood && <div className="mt-5">
        <Sa3FoodHabitContext diaries={diaries} activityDays={plan.activityDays ?? {}}
          onChangeDay={updateActivityDay} disabled={busy != null}/>
      </div>}
      <fieldset disabled={busy != null} className="mt-5 grid min-w-0 gap-5 md:grid-cols-2">
        {!isFood && <label className="text-sm font-bold text-slate-700">Hábito prioritario
          <select value={habitChoice} onChange={(event) => updatePlan("focusHabit", event.target.value)} className={control}>
            {otherHabitOptions.map(([value, title]) => <option key={value} value={value}>{title}</option>)}
            {habitChoice === "alimentacion" && <option value={habitChoice}>{habitLabel(habitChoice)}</option>}
          </select>
        </label>}
        <div className={"rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-[#164c3a]" + (isFood ? " md:col-span-2" : "")}>
          {isFood
            ? "Por ejemplo, al preparar la mochila para entrenar por la tarde, dejaré lista mi merienda. Anotaré los días que lo hice."
            : "Por ejemplo, al cerrar el cuaderno de estudio haré una pausa breve para moverme. Contaré las ocasiones en que la hice."}
        </div>
        {!isFood && habitChoice === "otro" && <label className="text-sm font-bold text-slate-700 md:col-span-2">Nombre del hábito
          <input maxLength={90} value={plan.focusHabit === "otro" ? "" : plan.focusHabit}
            onChange={(event) => updatePlan("focusHabit", event.target.value.trim() ? event.target.value : "otro")}
            placeholder="Ejemplo: preparar la mochila la noche anterior" className={control}/>
        </label>}
        <TextField title="Mi punto de partida" hint={isFood ? "Describe un patrón que observes en tus comidas y cómo influye tu horario." : "Describe la conducta actual y en qué situaciones ocurre."} value={plan.initialReflection} onChange={(value) => updatePlan("initialReflection", value)}/>
        <TextField title="Objetivo observable" hint="Qué acción quieres practicar y en qué ocasiones." value={plan.objective} onChange={(value) => updatePlan("objective", value)}/>
        <TextField title="Señal y acción" hint="Cuando ocurra…, haré… Define el contexto de tu acción." value={plan.actionPlan} onChange={(value) => updatePlan("actionPlan", value)}/>
        <TextField title="Obstáculo y alternativa" hint="Si aparece la dificultad…, entonces probaré…" value={plan.barrierStrategy} onChange={(value) => updatePlan("barrierStrategy", value)}/>
        <div className="md:col-span-2">
          <TextField title="Indicador de seguimiento" hint="Cuenta ocasiones realizadas y observadas con el mismo criterio cada semana." value={plan.successIndicator} onChange={(value) => updatePlan("successIndicator", value)}/>
        </div>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SavedButton busy={busy != null} onClick={() => void savePlan()}>{busy === "plan" ? "Guardando…" : "Guardar reto"}</SavedButton>
        {pdfButton}
        {planDirty && <span className="text-xs font-bold text-amber-800">Cambios por guardar</span>}
      </div>
      {(!hasSavedPlan || planDirty) && <p className="mt-2 text-xs text-slate-600">Guarda el reto y sus cambios para descargar el PDF.</p>}
      {message && <div className="mt-4">{message}</div>}
    </section>;

  if (view === "seguimiento") return <section className="card p-5 sm:p-7">
      <h2 className="text-2xl font-black text-slate-950">Seguimiento de cuatro semanas</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Anota cuántas ocasiones observaste y en cuántas hiciste la acción. Registra el contexto y el ajuste que probarás. Por ejemplo, 3 de 5 ocasiones equivalen al 60%.</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de las semanas guardadas">
        {weeks.map((week) => {
          const saved = savedWeeks.find((item) => item.weekNumber === week.weekNumber);
          return <div key={week.weekNumber} className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-600">Semana {week.weekNumber}</p>
            <p className="mt-1 text-xl font-black text-[#164c3a]">{saved ? saved.goalCompletion + "%" : "Pendiente"}</p>
            {saved && <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true">
              <div className="h-full rounded-full bg-[#1e6b4f]" style={{ width: saved.goalCompletion + "%" }}/>
            </div>}
          </div>;
        })}
      </div>
      <div className="mt-5 divide-y divide-slate-100">
        {weeks.map((week) => <details key={week.weekNumber} className="py-4" open={week.weekNumber === 1 ? true : undefined}>
          <summary className="min-h-10 cursor-pointer py-1 font-extrabold text-slate-950">
            Semana {week.weekNumber} · {["Punto de partida", "Primera prueba", "Revisión", "Última observación"][week.weekNumber - 1]}
            {week.id && <span className="ml-2 text-xs font-bold text-[#1e6b4f]">Guardada</span>}
          </summary>
          <fieldset disabled={busy != null} className="mt-3 grid min-w-0 gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Ocasiones realizadas · %
              <input type="number" min={0} max={100} step={1} value={Number.isFinite(week.goalCompletion) ? week.goalCompletion : ""}
                onChange={(event) => updateWeek(week.weekNumber, "goalCompletion", event.target.valueAsNumber)} className={control}/>
            </label>
            <p className="self-center rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-[#164c3a]">Usa el porcentaje para describir tu acción elegida. Cuando haya pocas ocasiones, explica cuántas pudiste observar.</p>
            <TextField title="Qué observé" hint="Ejemplo: hice la acción 3 de 5 veces. El cambio de horario influyó en dos ocasiones." value={week.reflection} onChange={(value) => updateWeek(week.weekNumber, "reflection", value)}/>
            <TextField title="Ajuste para la próxima semana" hint="Describe una decisión concreta a partir de lo observado." value={week.nextAdjustment} onChange={(value) => updateWeek(week.weekNumber, "nextAdjustment", value)}/>
            <details className="rounded-xl bg-slate-50 p-3 md:col-span-2">
              <summary className="cursor-pointer text-sm font-bold text-slate-700">Otros aspectos de la semana · opcional</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ratingFields.map(([key, title]) => <label key={key} className="text-sm font-bold text-slate-700">{title}
                  <select value={week[key] ?? ""} onChange={(event) => updateWeek(week.weekNumber, key, event.target.value ? Number(event.target.value) : null)} className={control}>
                    <option value="">Sin valorar</option>
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} de 5</option>)}
                  </select>
                </label>)}
              </div>
            </details>
          </fieldset>
          <div className="mt-4">
            <SavedButton busy={busy != null} onClick={() => void saveWeek(week)}>
              {busy === "week-" + week.weekNumber ? "Guardando…" : "Guardar semana " + week.weekNumber}
            </SavedButton>
          </div>
        </details>)}
      </div>
      {message && <div className="mt-4">{message}</div>}
    </section>;

  if (view !== "balance") return null;
  return <div className="space-y-5">
      <section className="card p-5 sm:p-7">
        <h2 className="text-2xl font-black text-slate-950">Informe final</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Tu producto reúne el plan, las cuatro semanas y una interpretación de los datos. El profesorado revisará tu método, tus evidencias y el ajuste que propones.</p>
        <div className="my-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          <p className="font-extrabold text-slate-950">Antes de finalizar</p>
          <ul className="mt-2 space-y-1">
            <li>{planReady ? "✓" : "○"} Plantilla del hábito completa.</li>
            <li>{completeWeeks === 4 && !weeksHaveEdits ? "✓" : "○"} {completeWeeks}/4 semanas con observaciones guardadas.{weeksHaveEdits ? " Hay cambios semanales por guardar." : ""}</li>
            <li>{plan.finalReflection.trim() ? "✓" : "○"} Reflexión con evidencias, una limitación y un paso siguiente.</li>
          </ul>
        </div>
        <fieldset disabled={busy != null} className="min-w-0">
          <TextField title="Mi interpretación y próximo paso" rows={7}
            hint={isFood
              ? "Compara las semanas 1 y 4 con tus datos. Relaciona una observación del diario con los días de mayor o menor gasto. Explica una limitación y qué mantendrás o ajustarás."
              : "Compara las semanas 1 y 4 con tus datos. Explica cuándo funcionó tu acción, una limitación y qué mantendrás o ajustarás."}
            value={plan.finalReflection} onChange={(value) => updatePlan("finalReflection", value)}/>
        </fieldset>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy != null} onClick={() => void savePlan()} className={secondary}>Guardar reflexión</button>
          <button type="button" disabled={busy != null || !ready} onClick={() => void savePlan(true)} className={primary}>
            <ClipboardCheck size={17} aria-hidden="true"/>{busy === "final" ? "Guardando…" : "Finalizar bitácora"}
          </button>
          {pdfButton}
        </div>
        <p className="mt-2 text-xs text-slate-600">El PDF incluye el reto y las semanas que hayas guardado.</p>
        {message && <div className="mt-4">{message}</div>}
      </section>
      <HabitReport plan={plan} weeks={savedWeeks}/>
    </div>;
}

function HabitNotebook({ data, store, view, preview }: {
  data: HabitWorkspaceData; store: HabitWorkspaceStore; view: View; preview: boolean;
}) {
  const [kind, setKind] = useState<HabitKind>(() =>
    data.challenges.otro.hasPlan && !data.challenges.alimentacion.hasPlan ? "otro" : "alimentacion");
  const [diaries, setDiaries] = useState(() => loadFoodDiaries(data.diaryKey, madridDay()));
  const challengeView = view === "reto" || view === "seguimiento" || view === "balance" ? view : null;

  return <>
    <div id="diario" hidden={view !== "diario"} className="scroll-mt-4">
      <Sa3FoodDiary storageKey={data.diaryKey} diaries={diaries}
        onChange={(mode, entries) => setDiaries((current) => ({ ...current, [mode]: entries }))}/>
    </div>
    <div id={challengeView ?? undefined} hidden={!challengeView} className="scroll-mt-4 space-y-4">
      <div role="group" aria-label="Tipo de reto" className="flex w-fit flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {habitKinds.map(([id, label]) => <button key={id} type="button" aria-pressed={kind === id} onClick={() => setKind(id)}
          className="min-h-11 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 aria-pressed:bg-white aria-pressed:text-[#164c3a] aria-pressed:shadow-sm">
          {label}
        </button>)}
      </div>
      {habitKinds.map(([id]) => <HabitChallenge key={id} data={data.challenges[id]} kind={id} diaries={diaries}
        studentName={data.studentName} group={data.group} store={store} view={kind === id ? challengeView : null} preview={preview}/>)}
    </div>
  </>;
}

export function Sa3HabitWorkspace({ store, preview = false }: { store: HabitWorkspaceStore; preview?: boolean }) {
  const view = useSyncExternalStore(listenForViewChange, currentView, () => "diario" as View);
  const [result, setResult] = useState<{ data: HabitWorkspaceData } | { error: string } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void store.load().then(
      (data) => { if (active) setResult({ data }); },
      (error: unknown) => {
        if (active) setResult({ error: error instanceof Error ? error.message : "No se ha podido cargar la bitácora." });
      },
    );
    return () => { active = false; };
  }, [store, retry]);

  return <div className="space-y-5">
    <section className="hero-surface overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[.19em] text-[#b8f34a]">SA3 · 2º Bachillerato · {preview ? "Vista de revisión" : "Producto final"}</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Bitácora de un cambio sostenible</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-50">Observa cómo te organizas, pon a prueba un hábito y explica qué te ayudó a mantenerlo.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-3 text-white">
          <div className="px-2"><p className="text-2xl font-black text-[#b8f34a]">10</p><p className="text-xs font-bold">sesiones</p></div>
          <div className="border-l border-white/20 px-3"><p className="text-2xl font-black text-[#b8f34a]">4</p><p className="text-xs font-bold">semanas</p></div>
        </div>
      </div>
      {preview && <p className="mt-5 text-xs font-semibold text-emerald-100">Ejemplo interactivo. Los cambios se guardan en este navegador.</p>}
    </section>

    <nav aria-label="Apartados de la bitácora" className="flex flex-wrap gap-2">
      {views.map(({ id, title, icon: Icon }) => <a key={id} href={"#" + id} aria-current={view === id ? "location" : undefined}
        className={"inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold " +
          (view === id ? "border-[#1e6b4f] bg-[#1e6b4f] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400")}>
        <Icon size={17} aria-hidden="true"/>{title}
      </a>)}
    </nav>

    {result && "data" in result ? <HabitNotebook key={result.data.diaryKey} data={result.data} store={store} view={view} preview={preview}/>
      : view !== "sesiones" && <div className="card p-5">
        {result && "error" in result ? <>
          <p role="alert" className="text-sm font-bold text-rose-800">{result.error}</p>
          <button type="button" className={secondary + " mt-3"} onClick={() => { setResult(null); setRetry((value) => value + 1); }}>Volver a cargar</button>
        </> : <p role="status" className="flex items-center gap-2 text-sm text-slate-600"><Loader2 size={17} className="animate-spin" aria-hidden="true"/> Cargando la bitácora…</p>}
      </div>}

    <div id="sesiones" hidden={view !== "sesiones"} className="scroll-mt-4">
      <Sa3SessionGuide review={preview}/>
    </div>
  </div>;
}
