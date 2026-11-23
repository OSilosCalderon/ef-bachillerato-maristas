"use client";

import { useEffect, useRef, useState } from "react";
import { loadSa4Logos, setSa4VotingPhase, voteSa4Logos } from "@/app/alumno/2bach/sa4/actions";
import { logoStandings, readStep, validateLogoRanking, type EventWorkspace, type LogoRanking, type LogoUpdates } from "@/lib/sa4-event";
import { eventButton, eventControl } from "@/components/sa4-event-editor";
import { Sa4LogoImage } from "@/components/sa4-logo-image";

export function Sa4LogoContest({ workspace, onChange, onDirty, onBusy, onLogosUpdated }: {
  workspace: EventWorkspace; onChange: (update: (current: EventWorkspace) => EventWorkspace) => void; onDirty: (dirty: boolean) => void; onBusy: (busy: boolean) => void;
  onLogosUpdated: (updates: LogoUpdates) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<LogoRanking>(workspace.ownVote ?? {});
  const inProgress = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const knownVersions = useRef(workspace.projectVersions);
  const [checkingLogos, setCheckingLogos] = useState(false);
  const [logoSyncError, setLogoSyncError] = useState("");
  const [logoReload, setLogoReload] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const courseId = workspace.courseId;
  const phase = workspace.phase;
  const countries = workspace.delegations.map((team) => team.country_code);
  const proposals = workspace.delegations.map((team) => ({ ...team, identity: readStep(workspace.steps, team.country_code, "identity", countries) }));
  const submitted = proposals.filter(({ identity }) => identity.logo && identity.slogan.trim() && identity.name.trim() && identity.meaning.trim()).length;
  const standings = logoStandings(countries, workspace.votes);
  const max = standings[0]?.points ?? 0;
  const winners = standings.filter((row) => row.points === max && max > 0);
  const name = (code: string) => workspace.delegations.find((team) => team.country_code === code)?.country ?? code;
  const editable = !workspace.teacher && Boolean(workspace.countryCode) && workspace.phase === "voting";
  const dirty = countries.some((code) => draft[code] !== workspace.ownVote?.[code]);
  const assigned = countries.filter((code) => draft[code] !== undefined).length;
  const expanded = proposals.find((team) => team.country_code === preview);

  useEffect(() => {
    let active = true;
    let running = false;
    async function checkLogos() {
      if (running || document.visibilityState === "hidden") return;
      running = true; setCheckingLogos(true);
      try {
        const result = await loadSa4Logos(courseId, knownVersions.current);
        if (!active) return;
        if (result.error || !result.data) throw new Error(result.error || "No se han podido actualizar los logos. Reintenta con «Actualizar logos».");
        knownVersions.current = result.data.versions;
        if (result.data.countries.length) onLogosUpdated(result.data);
        setLogoSyncError("");
      } catch (cause) {
        if (active) setLogoSyncError(cause instanceof Error ? cause.message : "No se han podido actualizar los logos. Las propuestas cargadas siguen aquí. Reintenta.");
      } finally {
        running = false;
        if (active) setCheckingLogos(false);
      }
    }
    const visible = () => { if (document.visibilityState === "visible") void checkLogos(); };
    void checkLogos();
    const interval = phase === "submissions" ? window.setInterval(() => void checkLogos(), 15000) : undefined;
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => { active = false; window.clearInterval(interval); window.removeEventListener("focus", visible); document.removeEventListener("visibilitychange", visible); };
  }, [courseId, phase, logoReload, onLogosUpdated]);

  useEffect(() => {
    const dialog = previewDialog.current;
    if (preview && dialog && !dialog.open) dialog.showModal();
    else if (!preview && dialog?.open) dialog.close();
  }, [preview]);

  useEffect(() => { onDirty(editable && dirty); }, [editable, dirty, onDirty]);
  useEffect(() => {
    if (error) feedback.current?.scrollIntoView({ block: "center" });
  }, [error]);

  async function perform(action: () => Promise<void>) {
    if (inProgress.current) return;
    inProgress.current = true; setBusy(true); onBusy(true); setError(""); setMessage("");
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : "No se ha confirmado la acción. Reintenta."); }
    finally { inProgress.current = false; setBusy(false); onBusy(false); }
  }

  async function changePhase(phase: EventWorkspace["phase"]) {
    if (!window.confirm(phase === "voting" ? "¿Abrir la votación? Los logos y lemas quedarán fijados mientras se vota." : phase === "closed" ? "¿Cerrar la votación y mostrar la suma de puntos de cada logo?" : "¿Volver a la preparación de propuestas?")) return;
    await perform(async () => {
      const result = await setSa4VotingPhase(workspace.courseId, phase);
      if (result.error) throw new Error(result.error);
      onChange((current) => ({ ...current, phase }));
      setMessage(phase === "voting" ? "Votación abierta. Cada alumno debe puntuar los ocho logos." : phase === "closed" ? "Votación cerrada. Ya podéis consultar el resultado." : "Propuestas abiertas para seguir preparando los logos.");
    });
  }

  function assignPoints(country: string, value: string) {
    const next = { ...draft };
    const previous = next[country];
    delete next[country];
    if (value) {
      const points = Number(value);
      const other = countries.find((code) => code !== country && next[code] === points);
      if (other) {
        if (previous !== undefined) next[other] = previous;
        else delete next[other];
        setMessage(previous !== undefined ? `Puntuaciones intercambiadas entre ${name(country)} y ${name(other)}.` : `${points} puntos asignados a ${name(country)}. Elige otra puntuación para ${name(other)}.`);
      } else setMessage("");
      next[country] = points;
    } else setMessage("");
    setError(""); setDraft(next);
  }

  async function saveVote() {
    try { validateLogoRanking(draft, countries); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa las puntuaciones."); return; }
    await perform(async () => {
      const result = await voteSa4Logos(workspace.courseId, workspace.countryCode!, draft);
      if (result.error || !result.data) throw new Error(result.error || "No se ha confirmado la votación. Tus puntuaciones siguen aquí. Reintenta.");
      const ranking = result.data;
      onChange((current) => {
        const votes = [...current.votes];
        const previous = current.ownVote && votes.findIndex((vote) => countries.every((code) => vote.scores[code] === current.ownVote![code]));
        if (typeof previous === "number" && previous >= 0) votes.splice(previous, 1);
        return { ...current, ownVote: ranking, votes: [...votes, { scores: ranking }] };
      });
      setMessage("Votación guardada. Los ocho logos han recibido tus puntos. Puedes cambiarlos mientras la votación siga abierta.");
    });
  }

  return <section className="card space-y-5 p-5 sm:p-7" aria-label="Concurso de logos">
    <div><h2 className="text-2xl font-extrabold">Concurso de logos</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Puntúa los ocho logos, incluido el de tu delegación. Usa cada número del 1 al 8 una sola vez. Da 1 punto al que menos te gusta y 8 al que más te gusta. Cada alumno reparte 36 puntos y todos los logos reciben una valoración.</p>
      <p className="mt-2 text-xs leading-5 text-slate-600">Valora la claridad, la relación con el evento y si se reconoce al verlo pequeño. Las puntuaciones se suman al cerrar la votación. Si hay empate, se muestran todas las propuestas empatadas.</p>
    </div>
    <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
      {workspace.phase === "submissions" ? `Preparando propuestas · ${submitted} de 8 logos con nombre y lema` : `${workspace.phase === "voting" ? "Votación abierta" : "Votación cerrada"} · ${workspace.votes.length} ${workspace.votes.length === 1 ? "votación completa" : "votaciones completas"} · ${workspace.votes.length} ${workspace.votes.length === 1 ? "valoración" : "valoraciones"} por logo`}
    </p>
    <div className="space-y-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
      <p>{checkingLogos ? "Buscando logos guardados…" : "Se muestran los logos guardados por las delegaciones. Las nuevas propuestas se actualizan automáticamente."}</p>
      <button type="button" className={eventButton} disabled={checkingLogos} onClick={() => setLogoReload((current) => current + 1)}>Actualizar logos</button>
      {logoSyncError && <p role="status" className="font-semibold text-amber-900">{logoSyncError}</p>}
    </div>
    {workspace.teacher && <div className="flex flex-wrap gap-3" aria-label="Control de la votación">
      {workspace.phase !== "voting" && <button type="button" className={eventButton} disabled={busy || submitted !== 8} onClick={() => void changePhase("voting")}>{workspace.phase === "closed" ? "Reabrir votación" : "Abrir votación"}</button>}
      {workspace.phase === "voting" && <button type="button" className={eventButton} disabled={busy} onClick={() => void changePhase("closed")}>Cerrar votación</button>}
      {workspace.phase !== "submissions" && workspace.votes.length === 0 && <button type="button" className={eventButton} disabled={busy} onClick={() => void changePhase("submissions")}>Volver a propuestas</button>}
    </div>}
    {workspace.phase === "closed" && <div className="space-y-3 rounded-xl border border-emerald-200 p-4 text-emerald-900">
      <p className="font-bold">{!winners.length ? "La votación terminó sin puntuaciones. El profesor puede reabrirla." : winners.length === 1 ? `Propuesta ganadora · ${name(winners[0].country)} · ${max} puntos` : `Empate · ${winners.map((team) => name(team.country)).join(", ")} · ${max} puntos por propuesta.`}</p>
      {winners.length > 1 && <p className="text-sm">Las propuestas comparten puesto. El profesor puede reabrir la votación si quiere ampliar la participación.</p>}
      {workspace.votes.length > 0 && <ol className="space-y-2 text-sm" aria-label="Resultado del concurso de logos">{standings.map((row) => <li key={row.country}><strong>{standings.findIndex((other) => other.points === row.points) + 1}. {name(row.country)}</strong> · {row.points} puntos · {row.ratings} valoraciones</li>)}</ol>}
    </div>}
    {editable && <p id="sa4-logo-help" className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">Selecciona una puntuación bajo cada logo y guarda la votación completa. Si eliges un número ya asignado, se intercambian las puntuaciones. {workspace.ownVote ? "Ya tienes una votación guardada. Los cambios la sustituirán." : "Tus selecciones se guardan al pulsar «Guardar votación»."}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {proposals.map(({ country_code, country, identity }) => {
        const row = standings.find((item) => item.country === country_code)!;
        return <article key={country_code} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-extrabold">{country}{country_code === workspace.countryCode && <span className="mt-1 block text-xs font-normal text-emerald-800">Mi delegación</span>}</h3>
          {identity.logo ? <>
            <div className="grid h-56 w-full place-items-center overflow-hidden rounded-xl bg-slate-100 p-2">
              <Sa4LogoImage src={identity.logo} alt={`Logo propuesto por ${country}`} className="h-full max-h-52 w-full object-contain"/>
            </div>
            <button type="button" className="min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-emerald-900" onClick={() => setPreview(country_code)}>Ampliar logo de {country}</button>
          </> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No hay logo guardado todavía.</p>}
          <div className="flex-1 space-y-2 break-words text-sm"><p className="font-bold">{identity.name || "Nombre pendiente"}</p><p>{identity.slogan || "Lema pendiente"}</p><p className="whitespace-pre-wrap text-xs leading-5 text-slate-600">{identity.meaning}</p></div>
          {workspace.phase === "closed" && <p className="font-bold text-emerald-900">{row.points} puntos · {row.ratings} valoraciones</p>}
          {editable && <div><label htmlFor={`sa4-logo-${country_code}`} className="block text-sm font-bold">Tu puntuación para {country}</label>
            <select id={`sa4-logo-${country_code}`} value={draft[country_code] ?? ""} className={eventControl} disabled={busy} aria-describedby="sa4-logo-help" onChange={(event) => assignPoints(country_code, event.target.value)}>
              <option value="">Sin puntuar</option>
              {Array.from({ length: 8 }, (_, index) => index + 1).map((points) => <option key={points} value={points}>{points} {points === 1 ? "punto · El que menos me gusta" : points === 8 ? "puntos · El que más me gusta" : "puntos"}</option>)}
            </select>
          </div>}
          {!editable && workspace.ownVote && <p className="text-sm font-semibold">Tu valoración guardada · {workspace.ownVote[country_code]} puntos</p>}
        </article>;
      })}
    </div>
    {editable && <div ref={feedback} className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 space-y-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg lg:bottom-3" aria-label="Guardar puntuaciones de los logos">
      <p role="status" className="text-sm font-semibold">{busy ? "Guardando tu votación…" : `${assigned} de 8 logos puntuados · ${dirty ? "Cambios pendientes de guardar" : workspace.ownVote ? "Votación guardada" : "Completa las ocho puntuaciones"}`}</p>
      <div className="flex flex-wrap gap-3"><button type="button" className={eventButton} disabled={busy || !dirty} onClick={() => void saveVote()}>{busy ? "Guardando…" : "Guardar votación"}</button>
        {dirty && <button type="button" className={eventButton} disabled={busy} onClick={() => {
          if (!window.confirm("¿Descartar las puntuaciones que no has guardado?")) return;
          setDraft(workspace.ownVote ?? {}); setError(""); setMessage("Cambios descartados. Se conserva tu última votación guardada.");
        }}>Descartar cambios</button>}
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
      {message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
    </div>}
    {!editable && error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
    {!editable && message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
    <dialog ref={previewDialog} onCancel={() => setPreview(null)} onClose={() => setPreview(null)} aria-labelledby="sa4-expanded-logo-title" className="max-h-[90dvh] w-[min(92vw,52rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl backdrop:bg-slate-950/70">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 id="sa4-expanded-logo-title" className="text-xl font-extrabold">Logo de {expanded?.country}</h3>
        <button type="button" className={eventButton} onClick={() => setPreview(null)}>Cerrar imagen</button>
      </div>
      {expanded?.identity.logo && <Sa4LogoImage src={expanded.identity.logo} alt={`Logo ampliado de ${expanded.country}`} className="max-h-[70dvh] w-full rounded-xl bg-slate-100 object-contain"/>}
    </dialog>
  </section>;
}
