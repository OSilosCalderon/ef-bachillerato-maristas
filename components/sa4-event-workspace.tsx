"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadSa4Workspace } from "@/app/alumno/2bach/sa4/actions";
import { Sa4EventEditor, eventButton, eventControl } from "@/components/sa4-event-editor";
import { Sa4LogoContest } from "@/components/sa4-logo-contest";
import { Sa4Tournament } from "@/components/sa4-tournament";
import { eventSteps, readStep, type EventStep, type EventWorkspace, type SavedStep } from "@/lib/sa4-event";

export function Sa4EventWorkspace({ courseId }: { courseId?: string }) {
  const [workspace, setWorkspace] = useState<EventWorkspace | null>(null);
  const [country, setCountry] = useState("");
  const [step, setStep] = useState<EventStep>("identity");
  const [view, setView] = useState<"team" | "logos" | "activities">("team");
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    loadSa4Workspace(courseId).then(({ data, error }) => {
      if (!active) return;
      if (error || !data) throw new Error(error || "No se ha podido cargar el evento. Reintenta.");
      setWorkspace(data); setCountry((previous) => previous || data.countryCode || data.delegations[0]?.country_code || "");
      setDirty(false); setVersion((current) => current + 1);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "No se ha podido cargar. Reintenta."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId, attempt]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function canLeave() { return !busy && (!dirty || window.confirm("Hay cambios sin guardar en este paso. ¿Descartarlos y continuar?")); }
  function refresh() {
    if (!canLeave()) return;
    setLoading(true); setError(""); setAttempt((current) => current + 1);
  }
  function change(action: () => void) {
    if (!canLeave()) return;
    setDirty(false); action();
    requestAnimationFrame(() => heading.current?.focus());
  }
  function saved(row: SavedStep) {
    setWorkspace((current) => current && ({ ...current, steps: [...current.steps.filter((item) => item.country_code !== row.country_code || item.step !== row.step), row] }));
  }

  if (loading) return <p role="status" className="card p-6 text-sm text-slate-600">Cargando el evento y las propuestas guardadas…</p>;
  if (error || !workspace) return <section className="card space-y-4 p-6"><h2 className="text-xl font-extrabold">No se ha podido abrir el evento</h2>
    <p role="alert" className="text-sm text-red-700">{error || "Reintenta la carga para abrir las propuestas de los equipos."}</p>
    <button type="button" className={eventButton} onClick={refresh}>Reintentar carga</button>
  </section>;
  const team = workspace.delegations.find((item) => item.country_code === country);
  const codes = workspace.delegations.map((item) => item.country_code);

  return <div className="space-y-5">
    <section className="card space-y-4 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3"><div>
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-extrabold">Olimpiada de ocho deportes</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Ocho países organizan una prueba cada uno y compiten entre sí. Completad los pasos de vuestra delegación y consultad las propuestas de las demás.</p>
      </div><button type="button" className={eventButton} onClick={refresh}>Actualizar evento</button></div>
      {!workspace.teacher && <Link onClick={(event) => { if (!canLeave()) event.preventDefault(); }} href="/alumno/2bach/sa4/teoria" className="inline-block min-h-11 py-2.5 text-sm font-bold text-[#164c3a] underline">Teoría, autoevaluación y reflexión individual</Link>}
      <div role="group" aria-label="Vistas del evento" className="flex flex-wrap gap-2">
        {([['team', 'Trabajo por delegación'], ['logos', 'Concurso de logos'], ['activities', 'Las ocho actividades']] as const).map(([id, title]) => <button type="button" key={id}
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 aria-pressed:border-emerald-700 aria-pressed:bg-emerald-50 aria-pressed:text-emerald-900"
          aria-pressed={view === id} onClick={() => change(() => setView(id))}>{title}</button>)}
      </div>
      {!workspace.teacher && !workspace.countryCode && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Tu cuenta está pendiente de asignar a una delegación. Puedes consultar el evento. Pide al profesor que revise tu equipo para poder editar y votar.</p>}
    </section>
    {view === "team" && <>
      <section className="card space-y-4 p-5 sm:p-7">
        <div className="max-w-lg"><label className="text-sm font-bold" htmlFor="sa4-country">Delegación que estás consultando</label>
          <select id="sa4-country" className={eventControl} value={country} onChange={(event) => change(() => setCountry(event.target.value))}>
            {workspace.delegations.map((item) => <option key={item.country_code} value={item.country_code}>{item.country}{item.country_code === workspace.countryCode ? " · Mi equipo" : ""}</option>)}
          </select>
        </div>
        {team && <p className="text-sm leading-6 text-slate-600">{team.members.join(" · ")}</p>}
        <p role="status" className="text-sm font-semibold text-[#164c3a]">{dirty ? "Cambios pendientes de guardar en este paso." : "Los pasos guardados están disponibles para todos los integrantes. Actualizad el evento para ver los últimos cambios del equipo."}</p>
        <nav aria-label="Pasos para crear el evento" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {eventSteps.map((item, index) => <button type="button" key={item.id} aria-current={step === item.id ? "step" : undefined}
            onClick={() => change(() => setStep(item.id))} className="min-h-14 rounded-xl border border-slate-200 p-3 text-left text-sm font-bold text-slate-700 aria-[current=step]:border-emerald-700 aria-[current=step]:bg-emerald-50">
            {index + 1}. {item.title}<span className="mt-1 block text-xs font-normal">{workspace.steps.some((row) => row.country_code === country && row.step === item.id) ? "Con datos guardados" : "Pendiente"}</span>
          </button>)}
        </nav>
      </section>
      {country && <Sa4EventEditor key={`${country}-${step}-${version}`} workspace={workspace} country={country} step={step} onSaved={saved} onDirty={setDirty} onBusy={setBusy}/>}
    </>}
    {view === "logos" && <Sa4LogoContest workspace={workspace} onChange={setWorkspace}/>}
    {view === "activities" && <div className="grid items-start gap-4 lg:grid-cols-2">
      {workspace.delegations.map((delegation) => {
        const sport = readStep(workspace.steps, delegation.country_code, "sport", codes);
        const competition = readStep(workspace.steps, delegation.country_code, "competition", codes);
        const results = readStep(workspace.steps, delegation.country_code, "results", codes);
        return <article key={delegation.country_code} className="card min-w-0 space-y-3 p-5">
          <h3 className="text-lg font-extrabold">{delegation.country} · {sport.sport || "Actividad por elegir"}</h3>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{sport.objective || "La delegación está preparando su propuesta."}</p>
          <button type="button" className={eventButton} onClick={() => change(() => { setCountry(delegation.country_code); setStep("sport"); setView("team"); })}>Ver reglamento y organización</button>
          {workspace.steps.some((row) => row.country_code === delegation.country_code && row.step === "competition") && <details><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Cuadro y clasificación</summary>
            <Sa4Tournament teams={workspace.delegations} config={competition} scores={results.scores}/>
          </details>}
        </article>;
      })}
    </div>}
  </div>;
}
