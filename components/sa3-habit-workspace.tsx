"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BookOpenCheck, CalendarDays, ClipboardCheck, FileText, Loader2, NotebookPen, Save, Target } from "lucide-react";
import { Sa3FoodDiary } from "@/components/sa3-food-diary";
import { Sa3SessionGuide } from "@/components/sa3-session-guide";
import {
  habitOptions, ratingFields, type HabitPlan, type HabitWorkspaceData,
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
  const habit = habitOptions.find(([key]) => key === plan.focusHabit)?.[1] ?? plan.focusHabit;
  const first = weeks.find((week) => week.weekNumber === 1)?.goalCompletion;
  const last = weeks.find((week) => week.weekNumber === 4)?.goalCompletion;
  const difference = first != null && last != null ? last - first : null;
  return <section className="card p-5 sm:p-7" aria-label="Vista de la bitácora">
    <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">Maristas Badajoz · Educación Física · 2º Bachillerato</p>
    <h3 className="mt-2 text-xl font-black text-slate-950">Bitácora de un cambio sostenible</h3>
    <p className="mt-1 text-sm font-semibold text-slate-600">{habit} · {plan.status === "completed" ? "Finalizada" : "En elaboración"}</p>
    <dl className="mt-5 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
      {[
        ["Punto de partida", plan.initialReflection],
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

function HabitNotebook({ data, store, view, preview }: {
  data: HabitWorkspaceData; store: HabitWorkspaceStore; view: View; preview: boolean;
}) {
  const [plan, setPlan] = useState(data.plan);
  const [weeks, setWeeks] = useState(data.weeks);
  const [savedPlan, setSavedPlan] = useState(data.plan);
  const [savedWeeks, setSavedWeeks] = useState(data.weeks.filter((week) => week.id));
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const planReady = [plan.initialReflection, plan.objective, plan.actionPlan, plan.barrierStrategy, plan.successIndicator].every((value) => value.trim());
  const completeWeeks = savedWeeks.filter((week) => week.reflection.trim()).length;
  const weeksHaveEdits = weeks.some((week) => {
    const saved = savedWeeks.find((item) => item.weekNumber === week.weekNumber);
    return saved ? JSON.stringify(saved) !== JSON.stringify(week)
      : Boolean(week.reflection.trim() || week.nextAdjustment.trim() || week.goalCompletion || ratingFields.some(([key]) => week[key] != null));
  });
  const ready = planReady && completeWeeks === 4 && !weeksHaveEdits && Boolean(plan.finalReflection.trim());
  const planDirty = JSON.stringify(plan) !== JSON.stringify(savedPlan);
  const statusLabels = { draft: "Borrador", active: "En marcha", completed: "Finalizada" };

  function updatePlan<K extends keyof HabitPlan>(key: K, value: HabitPlan[K]) {
    setPlan((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateWeek<K extends keyof WeeklyLog>(weekNumber: number, key: K, value: WeeklyLog[K]) {
    setWeeks((current) => current.map((week) => week.weekNumber === weekNumber ? { ...week, [key]: value } : week));
    setNotice("");
  }

  async function savePlan(finalize = false) {
    if (busy || (finalize && !ready)) return;
    const next: HabitPlan = {
      ...plan,
      status: finalize ? "completed" : plan.status === "completed" && ready ? "completed" : plan.objective.trim() ? "active" : "draft",
    };
    setBusy(finalize ? "final" : "plan");
    setError("");
    setNotice("");
    try {
      await store.savePlan(next);
      setPlan(next);
      setSavedPlan(next);
      setNotice(finalize ? (preview ? "Bitácora de ejemplo finalizada." : "Bitácora finalizada y guardada para la revisión docente.") : "Bitácora guardada.");
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
      const id = await store.saveWeek(week);
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

  const message = error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>
    : notice ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-[#164c3a]">{notice}</p> : null;

  return <>
    <div id="diario" hidden={view !== "diario"} className="scroll-mt-4">
      <Sa3FoodDiary storageKey={data.diaryKey}/>
    </div>

    <section id="reto" hidden={view !== "reto"} className="card scroll-mt-4 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">02 · Prueba</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Mi hábito a mejorar</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Elige una acción pequeña, una señal reconocible y una forma de observarla durante cuatro semanas.</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{preview ? "Trabajas con el reto de ejemplo." : "El profesorado puede revisar la plantilla, el seguimiento y la reflexión que guardes. El diario se queda en este navegador."}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-[#164c3a]">{statusLabels[savedPlan.status]}</span>
      </div>
      <fieldset disabled={busy != null} className="mt-5 grid min-w-0 gap-5 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">Hábito prioritario
          <select value={plan.focusHabit} onChange={(event) => updatePlan("focusHabit", event.target.value)} className={control}>
            {habitOptions.map(([value, title]) => <option key={value} value={value}>{title}</option>)}
            {!habitOptions.some(([value]) => value === plan.focusHabit) && <option value={plan.focusHabit}>{plan.focusHabit}</option>}
          </select>
        </label>
        <div className="rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-[#164c3a]">
          <strong>Ejemplo.</strong> Al cerrar el cuaderno de estudio, haré una pausa breve de movimiento. Contaré las ocasiones en que la hice.
        </div>
        <TextField title="Mi punto de partida" hint="Describe la conducta actual y en qué situaciones ocurre." value={plan.initialReflection} onChange={(value) => updatePlan("initialReflection", value)}/>
        <TextField title="Objetivo observable" hint="Qué acción quieres practicar y en qué ocasiones." value={plan.objective} onChange={(value) => updatePlan("objective", value)}/>
        <TextField title="Señal y acción" hint="Cuando ocurra…, haré… Define el contexto de tu acción." value={plan.actionPlan} onChange={(value) => updatePlan("actionPlan", value)}/>
        <TextField title="Obstáculo y alternativa" hint="Si aparece la dificultad…, entonces probaré…" value={plan.barrierStrategy} onChange={(value) => updatePlan("barrierStrategy", value)}/>
        <div className="md:col-span-2">
          <TextField title="Indicador de seguimiento" hint="Cuenta ocasiones realizadas y observadas con el mismo criterio cada semana." value={plan.successIndicator} onChange={(value) => updatePlan("successIndicator", value)}/>
        </div>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SavedButton busy={busy != null} onClick={() => void savePlan()}>{busy === "plan" ? "Guardando…" : "Guardar reto"}</SavedButton>
        {planDirty && <span className="text-xs font-bold text-amber-800">Cambios por guardar</span>}
      </div>
      {message && view === "reto" && <div className="mt-4">{message}</div>}
    </section>

    <section id="seguimiento" hidden={view !== "seguimiento"} className="card scroll-mt-4 p-5 sm:p-7">
      <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">02 · Prueba</p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">Seguimiento de cuatro semanas</h2>
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
      {message && view === "seguimiento" && <div className="mt-4">{message}</div>}
    </section>

    <div id="balance" hidden={view !== "balance"} className="scroll-mt-4 space-y-5">
      <section className="card p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">03 · Explica</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Informe final</h2>
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
            hint="Compara semana 1 y 4 con datos. Describe un patrón de tres días del diario, muestra un cálculo de etiqueta y cita una fuente. Explica una limitación y la acción que mantendrás o ajustarás. Puedes usar evidencias del caso de aula."
            value={plan.finalReflection} onChange={(value) => updatePlan("finalReflection", value)}/>
        </fieldset>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy != null} onClick={() => void savePlan()} className={secondary}>Guardar reflexión</button>
          <button type="button" disabled={busy != null || !ready} onClick={() => void savePlan(true)} className={primary}>
            <ClipboardCheck size={17} aria-hidden="true"/>{busy === "final" ? "Guardando…" : "Finalizar bitácora"}
          </button>
          <button type="button" disabled={busy != null || planDirty || weeksHaveEdits || savedPlan.status !== "completed"} onClick={() => window.print()} className={secondary}>
            Imprimir o guardar PDF
          </button>
        </div>
        {message && view === "balance" && <div className="mt-4">{message}</div>}
      </section>
      <HabitReport plan={plan} weeks={savedWeeks}/>
      {view === "balance" && createPortal(<div id="sa3-print-root">
        <style>{`
          #sa3-print-root { display: none; }
          @media print {
            @page { size: A4; margin: 14mm; }
            body:has(> #sa3-print-root) > :not(#sa3-print-root) { display: none !important; }
            #sa3-print-root { display: block !important; }
            #sa3-print-root, #sa3-print-root * { visibility: visible !important; }
            #sa3-print-root > section { padding: 0 !important; background: white !important; border: 0 !important; box-shadow: none !important; backdrop-filter: none !important; }
            #sa3-print-root li, #sa3-print-root dl > div { break-inside: avoid; }
          }
        `}</style>
        <HabitReport plan={savedPlan} weeks={savedWeeks}/>
      </div>, document.body)}
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
