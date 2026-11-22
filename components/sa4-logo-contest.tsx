"use client";

import { useRef, useState } from "react";
import { setSa4VotingPhase, voteSa4Logo } from "@/app/alumno/2bach/sa4/actions";
import { readStep, type EventWorkspace } from "@/lib/sa4-event";
import { eventButton } from "@/components/sa4-event-editor";

export function Sa4LogoContest({ workspace, onChange }: { workspace: EventWorkspace; onChange: (data: EventWorkspace) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inProgress = useRef(false);
  const countries = workspace.delegations.map((team) => team.country_code);
  const proposals = workspace.delegations.map((team) => ({ ...team, identity: readStep(workspace.steps, team.country_code, "identity", countries) }));
  const submitted = proposals.filter(({ identity }) => identity.logo && identity.slogan.trim() && identity.name.trim() && identity.meaning.trim()).length;
  const ownVote = workspace.ownVote;
  const counts = proposals.map((team) => ({ ...team, count: workspace.votes.filter((vote) => vote.candidate === team.country_code).length }));
  const max = Math.max(0, ...counts.map(({ count }) => count));
  const winners = counts.filter(({ count }) => count === max && count > 0);

  async function perform(action: () => Promise<void>) {
    if (inProgress.current) return;
    inProgress.current = true; setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : "No se ha confirmado la acción. Reintenta."); }
    finally { inProgress.current = false; setBusy(false); }
  }

  async function changePhase(phase: EventWorkspace["phase"]) {
    if (!window.confirm(phase === "voting" ? "¿Abrir la votación? Los logos y lemas quedarán fijados mientras se vota." : phase === "closed" ? "¿Cerrar la votación y mostrar el resultado?" : "¿Volver a la preparación de propuestas?")) return;
    await perform(async () => {
      const result = await setSa4VotingPhase(workspace.courseId, phase);
      if (result.error) throw new Error(result.error);
      onChange({ ...workspace, phase });
      setMessage(phase === "voting" ? "Votación abierta. Cada alumno puede guardar su voto." : phase === "closed" ? "Votación cerrada. Ya podéis consultar el resultado." : "Propuestas abiertas para seguir preparando los logos.");
    });
  }

  return <section className="card space-y-5 p-5 sm:p-7" aria-label="Concurso de logos">
    <div><h2 className="text-2xl font-extrabold">Concurso de logos</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Cada delegación presenta un logo, un nombre y un lema para la olimpiada. Cada alumno guarda un voto y puede cambiarlo mientras la votación esté abierta.</p>
    </div>
    <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
      {workspace.phase === "submissions" ? `Preparando propuestas · ${submitted} de 8 logos con nombre y lema` : workspace.phase === "voting" ? `Votación abierta · ${workspace.votes.length} votos registrados` : `Votación cerrada · ${workspace.votes.length} votos registrados`}
    </p>
    {workspace.teacher && <div className="flex flex-wrap gap-3" aria-label="Control de la votación">
      {workspace.phase !== "voting" && <button type="button" className={eventButton} disabled={busy || submitted !== 8} onClick={() => void changePhase("voting")}>{workspace.phase === "closed" ? "Reabrir votación" : "Abrir votación"}</button>}
      {workspace.phase === "voting" && <button type="button" className={eventButton} disabled={busy} onClick={() => void changePhase("closed")}>Cerrar votación</button>}
      {workspace.phase !== "submissions" && workspace.votes.length === 0 && <button type="button" className={eventButton} disabled={busy} onClick={() => void changePhase("submissions")}>Volver a propuestas</button>}
    </div>}
    {workspace.phase === "closed" && <p className="rounded-xl border border-emerald-200 p-4 font-bold text-emerald-900">
      {!winners.length ? "La votación terminó sin votos. El profesor puede reabrirla." : winners.length === 1 ? `Propuesta ganadora · ${winners[0].country} · ${winners[0].count} ${winners[0].count === 1 ? "voto" : "votos"}` : `Empate · ${winners.map((team) => team.country).join(", ")} · ${max} votos por propuesta. El profesor puede reabrir la votación para resolverlo.`}
    </p>}
    {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
    {message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {counts.map(({ country_code, country, identity, count }) => <article key={country_code} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-extrabold">{country}</h3>
        {identity.logo ? <div className="grid min-h-36 place-items-center rounded-xl bg-slate-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={identity.logo} alt={`Logo propuesto por ${country}`} className="max-h-40 max-w-full object-contain"/>
        </div> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Logo pendiente de subir.</p>}
        <div className="flex-1 space-y-2 break-words text-sm"><p className="font-bold">{identity.name || "Nombre pendiente"}</p><p>{identity.slogan || "Lema pendiente"}</p><p className="whitespace-pre-wrap text-xs leading-5 text-slate-600">{identity.meaning}</p></div>
        {workspace.phase === "closed" && <p className="font-bold text-emerald-900">{count} {count === 1 ? "voto" : "votos"}</p>}
        {!workspace.teacher && workspace.countryCode && workspace.phase === "voting" && identity.logo && <button type="button" aria-pressed={ownVote === country_code}
          className={eventButton + " aria-pressed:bg-slate-800"} disabled={busy || ownVote === country_code}
          onClick={() => void perform(async () => {
            if (!window.confirm(`¿Guardar tu voto por ${country}?`)) return;
            const result = await voteSa4Logo(workspace.courseId, workspace.countryCode!, country_code);
            if (result.error) throw new Error(result.error);
            const votes = [...workspace.votes];
            const previous = votes.findIndex((vote) => vote.candidate === ownVote);
            if (previous >= 0) votes.splice(previous, 1);
            onChange({ ...workspace, ownVote: country_code, votes: [...votes, { candidate: country_code }] });
            setMessage(`Tu voto para ${country} está guardado. Puedes cambiarlo mientras siga abierta la votación.`);
          })}>{ownVote === country_code ? "Tu voto guardado" : `Votar a ${country}`}</button>}
      </article>)}
    </div>
  </section>;
}
