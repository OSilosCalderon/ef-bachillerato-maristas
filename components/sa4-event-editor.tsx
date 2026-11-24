"use client";

import { useRef, useState } from "react";
import { saveSa4Step } from "@/app/alumno/2bach/sa4/actions";
import { emptyStep, eventSteps, readStep, stepFields, type EventStep, type EventWorkspace, type SavedStep, type StepData } from "@/lib/sa4-event";
import { Sa4Tournament } from "@/components/sa4-tournament";
import { prepareSa4Logo } from "@/lib/sa4-logo-upload";

export const eventControl = "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:bg-slate-100";
export const eventButton = "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-50 aria-disabled:opacity-50";

export function Sa4EventEditor({ workspace, country, step, onSaved, onDirty, onBusy }: {
  workspace: EventWorkspace; country: string; step: EventStep; onSaved: (row: SavedStep) => void; onDirty: (dirty: boolean) => void; onBusy: (busy: boolean) => void;
}) {
  const countries = workspace.delegations.map((team) => team.country_code);
  const saved = workspace.steps.find((row) => row.country_code === country && row.step === step);
  const [data, setData] = useState<StepData[EventStep]>(() => saved?.data ?? emptyStep(step, countries));
  const [saving, setSaving] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inProgress = useRef(false);
  const preparingImage = useRef(false);
  const [logoError, setLogoError] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);
  const canEdit = (workspace.teacher || country === workspace.countryCode) && (step !== "identity" || workspace.phase === "submissions");
  const info = eventSteps.find(({ id }) => id === step)!;
  const record = data as unknown as Record<string, string>;
  const competition = readStep(workspace.steps, country, "competition", countries);
  const results = readStep(workspace.steps, country, "results", countries);
  const resultsExist = Object.keys(results.scores).length > 0;
  const competitionSaved = workspace.steps.some((row) => row.country_code === country && row.step === "competition");

  function update(next: StepData[EventStep]) {
    setData(next); onDirty(true); setMessage(""); setError("");
  }

  async function persist(nextData: StepData[EventStep]) {
    if (inProgress.current || !canEdit) return;
    inProgress.current = true; setSaving(true); onBusy(true); setError(""); setMessage("");
    try {
      const { data: row, error } = await saveSa4Step({ courseId: workspace.courseId, country, step, data: nextData, revision: saved?.revision ?? 0 });
      if (error || !row) throw new Error(error || "No se ha confirmado el guardado. Reintenta.");
      onSaved(row); onDirty(false); setMessage(step === "identity" ? "Logo y propuesta guardados. Ya podéis verlos en «Concurso de logos»." : "Paso guardado para toda la delegación. Podéis seguir con el siguiente.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se ha podido guardar. Tu edición sigue aquí. Reintenta."); }
    finally { inProgress.current = false; setSaving(false); onBusy(false); }
  }

  async function save() {
    if (preparingImage.current || logoError) return;
    await persist(data);
  }

  return <section className="card space-y-5 p-5 sm:p-7" aria-label={info.title}>
    <div><h3 className="text-xl font-extrabold text-slate-950">{info.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{info.help}</p></div>
    {!canEdit && <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{step === "identity" && workspace.phase !== "submissions" ? "Las propuestas de logo están cerradas durante la votación y el resultado final." : "Estás consultando la propuesta de otra delegación. Selecciona tu país para editar."}</p>}
    <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <fieldset disabled={!canEdit || saving || preparing || (step === "competition" && resultsExist)} className="min-w-0 space-y-5">
        {step === "identity" && <div className="space-y-3">
          <label className="block text-sm font-bold" htmlFor="sa4-logo">Logo para el concurso</label>
          <p id="sa4-logo-help" className="text-xs text-slate-600">Elegid el archivo del logo. Lo preparamos y guardamos automáticamente para que aparezca en el concurso. Admitimos PNG, JPG, WebP, SVG y otras imágenes que pueda abrir vuestro navegador, de hasta 20 MB.</p>
          <input ref={logoInput} id="sa4-logo" type="file" accept="image/*,.svg,.heic,.heif" aria-describedby="sa4-logo-help"
            className={eventControl} onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file || inProgress.current || preparingImage.current) return;
              preparingImage.current = true; setPreparing(true); onBusy(true); setError(""); setLogoError(""); setMessage("");
              try {
                const logo = await prepareSa4Logo(file);
                const next = { ...data, logo } as StepData["identity"];
                update(next);
                await persist(next);
              } catch (cause) {
                setLogoError(cause instanceof Error ? cause.message : "No se ha podido abrir el logo. Elige una imagen PNG o JPG.");
              } finally {
                preparingImage.current = false; setPreparing(false); onBusy(false);
                if (logoInput.current) logoInput.current.value = "";
              }
            }}/>
          {preparing && <p role="status" className="text-sm text-slate-600">{saving ? "Guardando el logo en el concurso…" : "Preparando el logo para guardarlo…"}</p>}
          {logoError && <div className="space-y-2 rounded-xl bg-red-50 p-3"><p role="alert" className="text-sm font-semibold text-red-700">{logoError}</p><p className="text-sm text-slate-700">Elige otra imagen para reintentar. Se conservan el texto y el logo que ya estuviera guardado.</p><button type="button" className={eventButton} onClick={() => setLogoError("")}>Descartar esta selección</button></div>}
          {record.logo && <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={record.logo} alt="Propuesta de logo de la delegación" className="mx-auto max-h-52 max-w-full object-contain"/>
            <p role="status" className="mt-3 text-sm font-semibold text-emerald-900">{record.logo === (saved?.data as StepData["identity"] | undefined)?.logo ? "Logo guardado para el concurso." : "Vista previa sin guardar. Pulsa «Guardar paso» para mostrar este logo en el concurso."}</p>
          </div>}
        </div>}
        {step !== "competition" && step !== "results" && stepFields[step].map(([key, label, help]) => <div key={key}>
          <label htmlFor={`sa4-${key}`} className="text-sm font-bold text-slate-800">{label}</label>
          <p id={`sa4-${key}-help`} className="mt-1 text-xs leading-5 text-slate-600">{help}</p>
          <textarea id={`sa4-${key}`} aria-describedby={`sa4-${key}-help`} value={record[key] ?? ""} maxLength={4000}
            rows={key === "rules" || key === "schedule" ? 5 : 2} className={eventControl}
            onChange={(event) => update({ ...data, [key]: event.target.value } as StepData[EventStep])}/>
        </div>)}
        {step === "competition" && <>
          {resultsExist && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">El formato y el sorteo están fijados porque ya hay resultados registrados.</p>}
          <label className="block text-sm font-bold">Formato competitivo
            <select disabled={resultsExist} className={eventControl} value={(data as StepData["competition"]).format}
              onChange={(event) => update({ ...data, format: event.target.value } as StepData["competition"])}>
              <option value="league">Liga de ocho países · 28 partidos · siete jornadas</option>
              <option value="knockout">Eliminatoria · siete partidos · cuartos, semifinales y final</option>
            </select>
          </label>
          <p className="text-sm leading-6 text-slate-600">En liga, cada país juega contra los otros siete. La clasificación suma 3 puntos por victoria, 1 por empate y 0 por derrota. En eliminatoria, explicad también cómo participan los equipos que quedan eliminados.</p>
          <fieldset disabled={resultsExist} className="grid min-w-0 gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-bold">Orden de las delegaciones en el sorteo</legend>
            {(data as StepData["competition"]).order.map((code, index) => <label key={index} className="text-sm font-bold">Posición {index + 1}
              <select className={eventControl} value={code} onChange={(event) => {
                const order = [...(data as StepData["competition"]).order];
                const previous = order.indexOf(event.target.value);
                order[previous] = code; order[index] = event.target.value;
                update({ ...data, order } as StepData["competition"]);
              }}>{workspace.delegations.map((team) => <option value={team.country_code} key={team.country_code}>{team.country}</option>)}</select>
            </label>)}
          </fieldset>
          {([['participation', 'Cómo garantizamos la participación'], ['referees', 'Arbitraje, turnos y registro de resultados']] as const).map(([key, label]) => <label key={key} className="block text-sm font-bold">{label}
            <textarea rows={3} maxLength={4000} className={eventControl} value={(data as StepData["competition"])[key]}
              onChange={(event) => update({ ...data, [key]: event.target.value } as StepData["competition"])}/>
          </label>)}
          <Sa4Tournament teams={workspace.delegations} config={data as StepData["competition"]} scores={{}}/>
        </>}
        {step === "results" && (competitionSaved ? <Sa4Tournament teams={workspace.delegations} config={competition}
          scores={(data as StepData["results"]).scores} onChange={(scores) => update({ scores })}/>
          : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Guardad el formato y el cuadro de juego en el paso anterior para poder anotar resultados.</p>)}
      </fieldset>
      {canEdit && !(step === "competition" && resultsExist) && <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
        <button type="submit" aria-disabled={saving || preparing} className={eventButton} disabled={saving || preparing || Boolean(logoError) || (step === "results" && !competitionSaved)}>
          {saving ? "Guardando paso…" : "Guardar paso"}
        </button>
        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        {message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
      </div>}
    </form>
  </section>;
}
