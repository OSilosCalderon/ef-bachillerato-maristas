"use client";

import { useEffect, useRef, useState } from "react";
import { eventMatches, leagueStandings, matchWinner, swissStandings, clearLaterSwissResults, clearLaterGroupResults, clearLaterPlacementResults, matchNeedsWinner, pairDelegationStandings, type Delegation, type MatchScore, type StepData } from "@/lib/sa4-event";

export function Sa4Tournament({ teams, config, scores, onChange, title = "Cuadro de competición", saveStatus, onSave }: {
  teams: Delegation[]; config: StepData["competition"]; scores: Record<string, MatchScore>;
  onChange?: (scores: Record<string, MatchScore>) => void; title?: string; saveStatus?: string; onSave?: () => void;
}) {
  const matches = eventMatches(config.format, config.order, scores, config.pairSeed);
  const [pairDay, setPairDay] = useState(1);
  const [projection, setProjection] = useState(false);
  const [phase, setPhase] = useState("all");
  const [swissRound, setSwissRound] = useState(1);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!projection) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [projection]);
  const country = (code: string | null) => {
    const [base, pair] = (code ?? "").split(":");
    const name = teams.find((team) => team.country_code === base)?.country;
    return name ? `${name}${pair ? ` · Pareja ${pair}` : ""}` : "Pendiente de la ronda anterior";
  };
  const played = matches.filter((match) => scores[match.id]?.a != null && scores[match.id]?.b != null && (!matchNeedsWinner(config.format, match.id) || matchWinner(match, scores[match.id]))).length;

  function change(matchId: string, side: "a" | "b" | "winner", value: string) {
    if (!onChange) return;
    const previous = scores[matchId] ?? { a: null, b: null };
    if (config.format === "knockout" && ((matchId.startsWith("q") && (scores[`s${Math.floor(Number(matchId.slice(1)) / 2)}`] || scores.final))
      || (matchId.startsWith("s") && scores.final)) && !window.confirm("Al corregir este partido, los resultados de las rondas siguientes volverán a quedar pendientes. ¿Continuar?")) return;
    if (config.format === "swiss" && Object.keys(clearLaterSwissResults(scores, matchId)).length < Object.keys(scores).length
      && !window.confirm("Al corregir este partido se recalculan los emparejamientos y se borran los resultados de todas las rondas posteriores. ¿Continuar?")) return;
    if (config.format === "groups" && Object.keys(clearLaterGroupResults(scores, matchId)).length < Object.keys(scores).length
      && !window.confirm("Al corregir este partido se recalculan los cruces y se borran los resultados posteriores que dependen de él. ¿Continuar?")) return;
    if (config.format === "placement" && Object.keys(clearLaterPlacementResults(scores, matchId)).length < Object.keys(scores).length
      && !window.confirm("Al corregir este partido se borran los resultados posteriores que dependen de él en los cuadros oro y plata. ¿Continuar?")) return;
    const next = { ...(config.format === "swiss" ? clearLaterSwissResults(scores, matchId) : config.format === "groups" ? clearLaterGroupResults(scores, matchId) : config.format === "placement" ? clearLaterPlacementResults(scores, matchId) : scores), [matchId]: { ...previous, [side]: side === "winner" ? value : value === "" ? null : Number(value) } };
    if (config.format === "knockout") {
      // A changed earlier result invalidates later results, including a stale tiebreak winner.
      if (side !== "winner") delete next[matchId].winner;
      if (matchId.startsWith("q")) { delete next[`s${Math.floor(Number(matchId.slice(1)) / 2)}`]; delete next.final; }
      if (matchId.startsWith("s")) delete next.final;
    }
    if ((config.format === "swiss" || config.format === "groups" || config.format === "placement") && side !== "winner") delete next[matchId].winner;
    onChange(next);
  }

  return <div ref={root} role={projection ? "dialog" : undefined} aria-modal={projection || undefined} aria-label={projection ? "Proyección del cuadro de competición" : undefined}
    onKeyDown={(event) => {
      if (!projection) return;
      if (event.key === "Escape") { event.stopPropagation(); setProjection(false); }
      if (event.key === "Tab") {
        const controls = Array.from(root.current?.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex='0']") ?? []).filter(e => e.offsetParent !== null && !e.closest("fieldset:disabled"));
        const first=controls[0], last=controls.at(-1);
        if (event.shiftKey && document.activeElement===first) {event.preventDefault();last?.focus();}
        else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first?.focus();}
      }
    }} className={projection ? "fixed inset-0 z-[100] space-y-6 overflow-y-auto bg-[#061e24] p-5 text-white sm:p-8" : "space-y-5"}>
    <header className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 ${projection ? "sticky top-0 z-10 border border-white/20 bg-[#0b3037] shadow-2xl" : "border border-emerald-200 bg-emerald-50"}`}>
      <div className="min-w-0"><p className={`text-xs font-bold uppercase tracking-widest ${projection ? "text-lime-300" : "text-emerald-800"}`}>SA4 · Olimpiada de delegaciones</p><h3 className={`mt-1 break-words font-extrabold ${projection ? "text-2xl text-white sm:text-3xl" : "text-lg text-slate-950"}`}>{title.length>110?`${title.slice(0,107)}…`:title}</h3><p className={`mt-1 text-sm ${projection ? "text-slate-200" : "text-slate-700"}`}>{played} / {matches.length} partidos resueltos{saveStatus ? ` · ${saveStatus}` : ""}</p></div>
      <div className="flex flex-wrap gap-2">{onSave && <button type="button" onClick={onSave} className="min-h-11 rounded-xl bg-lime-300 px-4 py-2 font-bold text-slate-950">Guardar marcadores</button>}<button type="button" onClick={() => setProjection(!projection)} className="min-h-11 rounded-xl bg-[#1e6b4f] px-4 py-2 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300">{projection ? "Salir de proyección" : "Proyectar cuadro"}</button></div>
    </header>
    {config.format === "swiss" && <label className={`block text-sm font-bold ${projection ? "text-white" : "text-slate-800"}`}>Ronda mostrada<select aria-label="Ronda mostrada" className="mt-2 block min-h-11 w-full max-w-md rounded-xl border border-slate-300 bg-white p-2 text-slate-950" value={swissRound} onChange={e=>setSwissRound(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>Ronda {n}</option>)}</select></label>}
    {(config.format === "groups" || config.format === "placement") && <label className={`block text-sm font-bold ${projection ? "text-white" : "text-slate-800"}`}>Fase mostrada<select aria-label="Fase mostrada" className="mt-2 block min-h-11 w-full max-w-md rounded-xl border border-slate-300 bg-white p-2 text-slate-950" value={phase} onChange={e=>setPhase(e.target.value)}><option value="all">Todo el cuadro</option><option value="first">{config.format === "groups" ? "Fase de grupos" : "Cuartos de final"}</option><option value="semis">Semifinales</option><option value="finals">Finales y partidos de posición</option></select></label>}
    {config.format === "placement" && <p className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">Cuartos de final directos. Los cuatro ganadores pasan a las semifinales oro y los cuatro perdedores a las semifinales plata. Después se juegan las finales oro y plata y los partidos de posición: tres partidos por selección y 12 en total. Todos los encuentros requieren ganador. Primera jornada: cuartos. Segunda jornada: semifinales y finales.</p>}
    {config.format === "pairs" && <div className="space-y-3 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><p>Dos parejas por delegación. Cuatro días con dos partidos por pareja y día: 16 partidos diarios y 64 en total. Cada pareja juega ocho partidos. El sorteo evita enfrentamientos entre parejas de la misma delegación y no depende de los resultados. Los rivales pueden repetirse; no es un todos contra todos completo.</p><p>Victoria: 3 puntos; empate: 1; derrota: 0. Los puntos de ambas parejas se suman para su delegación. Acordad antes de jugar el reparto de pistas, tiempos y turnos para completar los 16 partidos de la clase.</p><label className="block font-bold">Jornada de parejas<select aria-label="Jornada de parejas" className="mt-2 block min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-950" value={pairDay} onChange={e=>setPairDay(Number(e.target.value))}>{[1,2,3,4].map(day=><option key={day} value={day}>Día {day} · 16 partidos</option>)}</select></label></div>}
    {config.format === "groups" && <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950"><p>Dos grupos de cuatro. Todos juegan tres partidos de grupo, una semifinal y un partido de posición: cinco por selección, 20 en total.</p><p>Principal: 1.º A contra 2.º B y 1.º B contra 2.º A. Consolación: 3.º A contra 4.º B y 3.º B contra 4.º A. Las finales y los partidos de posición determinan los puestos del 1.º al 8.º.</p><p>En grupos: 3 puntos por victoria y 1 por empate; después diferencia de tantos y tantos a favor. Si todo sigue igual, decide el orden inicial del sorteo. Los cruces esperan a que se completen los 12 partidos de grupo. Las semifinales y finales requieren ganador.</p></div>}
    {config.format === "groups" && <div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((g) => {
      const codes = config.order.slice(g * 4, g * 4 + 4);
      const rows = leagueStandings(codes, matches.filter(m => /^g[AB]/.test(m.id) && codes.includes(m.a!)), scores);
      return <section key={g} aria-label={`Clasificación del grupo ${g ? "B" : "A"}`} className="rounded-xl border border-slate-200 bg-white p-4 text-slate-950"><h4 className="font-extrabold">Grupo {g ? "B" : "A"}</h4><ol className="mt-2 space-y-2">{rows.map((r,i) => <li key={r.country} className="text-sm leading-6"><strong>{i+1}. {country(r.country)}</strong> · {r.played}/3 partidos · {r.points} puntos · {i < 2 ? "Cuadro principal" : "Consolación"} (provisional)</li>)}</ol></section>;
    })}</div>}
    {config.format === "swiss" && <p className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">Cuatro rondas, cuatro partidos por selección y ninguna eliminación. Se empareja por victorias acumuladas, evitando repetir rivales. Completad los cuatro partidos de cada ronda y guardad los resultados. Si hay empate, aplicad el desempate del reglamento y elegid el ganador. La siguiente ronda queda pendiente hasta que todos los partidos tengan ganador.</p>}
    <p className={`text-sm font-semibold ${projection ? "text-slate-200" : "text-slate-700"}`}>{played} de {matches.length} partidos con resultado</p>
    {[...new Set(matches.filter(m => (config.format !== "pairs" || m.round.startsWith(`Día ${pairDay} ·`)) && (config.format !== "swiss" || m.round === `Ronda ${swissRound}`) && (phase === "all" || !(config.format === "groups" || config.format === "placement") || (phase === "first" ? /^g[AB]|^bq/.test(m.id) : phase === "semis" ? /^g[MC]|^b[gs]/.test(m.id) : /^gF|^bf/.test(m.id)))).map((match) => match.round))].map((round) => <section key={round} aria-label={round} className="space-y-2">
      <h4 className={`font-extrabold ${projection ? "mb-4 text-2xl text-white" : "text-slate-900"}`}>{round}</h4><div className={`grid gap-3 ${projection ? "md:grid-cols-2 xl:grid-cols-4" : "xl:grid-cols-2"}`}>
      {matches.filter((match) => match.round === round).map((match) => {
        const score = scores[match.id];
        const tied = matchNeedsWinner(config.format, match.id) && score?.a != null && score.a === score.b;
        return <div key={match.id} className={`space-y-3 rounded-2xl border-2 bg-white p-4 text-slate-950 shadow-sm ${matchWinner(match, score) ? "border-emerald-400" : "border-slate-200"}`}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 text-sm">
            {(["a", "b"] as const).map((side, index) => <div key={side} className={index === 0 ? "col-start-1 row-start-1" : "col-start-3 row-start-1"}>
              <span className={`block break-words font-bold ${projection ? "text-lg" : "text-sm"}`}>{match[side] && <span aria-hidden="true" className="mb-1 block text-2xl">{String.fromCodePoint(...Array.from(match[side]!.slice(0,2),c=>127397+c.charCodeAt(0)))}</span>}{country(match[side])}</span>
              {onChange ? <label className="mt-2 block text-xs text-slate-600">Resultado de {country(match[side])}
                <input type="number" min={0} max={9999} step={1} inputMode="numeric" value={score?.[side] ?? ""}
                  disabled={!match.a || !match.b} className={`mt-1 min-h-11 w-full max-w-28 rounded-xl border border-slate-300 bg-slate-50 p-2 text-center font-extrabold tabular-nums focus-visible:outline-2 focus-visible:outline-emerald-700 ${projection ? "text-4xl" : "text-xl"}`}
                  aria-label={`${round} · ${country(match.a)} contra ${country(match.b)} · Resultado de ${country(match[side])}`}
                  onChange={(event) => change(match.id, side, event.target.value)}/>
              </label> : <span className={`mt-2 block rounded-xl bg-slate-100 p-2 text-center font-extrabold tabular-nums ${projection ? "text-4xl" : "text-xl"}`}>{score?.[side] ?? "—"}</span>}
            </div>)}
            <span className="col-start-2 row-start-1 text-slate-500" aria-label="contra">vs.</span>
          </div>
          {tied && onChange && <label className="block text-sm font-bold">Ganador tras aplicar el desempate del reglamento
            <select value={score.winner ?? ""} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2 text-sm" onChange={(event) => change(match.id, "winner", event.target.value)}>
              <option value="" disabled>Elegid el ganador del desempate</option>
              {[match.a, match.b].filter(Boolean).map((code) => <option key={code!} value={code!}>{country(code)}</option>)}
            </select>
          </label>}
          {matchNeedsWinner(config.format, match.id) && matchWinner(match, score) && <p className="text-xs font-bold text-emerald-800">{config.format === "knockout" ? "Avanza" : "Gana"} {country(matchWinner(match, score))}</p>}
        </div>;
      })}</div>
    </section>)}
    {config.format === "pairs" && <section aria-label="Puntos de parejas por delegación" className="space-y-3"><h4 className="font-extrabold">Clasificación de delegaciones por parejas</h4><p className={`text-sm leading-6 ${projection ? "text-slate-200" : "text-slate-600"}`}>Se suman ambas parejas y las cuatro jornadas. Orden por puntos, diferencia de tantos y tantos a favor. Si todo sigue igual, decide el orden inicial del sorteo.</p><ol className="space-y-2">{pairDelegationStandings(config.order,matches,scores).map((r,_,rows)=><li key={r.country} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-950"><strong>{rows.findIndex(other=>other.country===r.country)+1}. {country(r.country)}</strong> · {r.played}/16 partidos de la delegación · {r.won} victorias · {r.drawn} empates · {r.points} puntos</li>)}</ol></section>}
    {config.format === "swiss" && <section aria-label="Clasificación de las cuatro rondas" className="space-y-3">
      <h4 className="font-extrabold">Clasificación por victorias</h4>
      <p className={`text-sm leading-6 ${projection ? "text-slate-200" : "text-slate-600"}`}>Cada victoria suma 3 puntos. Desempate por victorias de los rivales, diferencia de tantos, tantos a favor y orden inicial del sorteo. La clasificación total de delegaciones incorpora este torneo cuando terminen los 16 partidos.</p>
      <ol className="space-y-2">{swissStandings(config.order, matches, scores).map((row, _, rows) => <li key={row.country} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-950"><strong>{rows.findIndex((other) => other.country === row.country) + 1}. {country(row.country)}</strong> · {row.played}/4 partidos · {row.won} victorias · {row.lost} derrotas · {row.points} puntos</li>)}</ol>
    </section>}
    {config.format === "league" && <section aria-label="Clasificación de la actividad" className="space-y-2">
      <h4 className="font-extrabold">Clasificación provisional</h4>
      <p className={`text-xs leading-5 ${projection ? "text-slate-200" : "text-slate-600"}`}>Se ordena por puntos, diferencia de tantos y tantos a favor. Los equipos con los mismos valores siguen empatados.</p>
      <div tabIndex={0} role="region" aria-label="Tabla de clasificación" className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[510px] text-left text-sm"><thead className="bg-slate-100"><tr>
          {["País", "Jugados", "Ganados", "Empatados", "Perdidos", "A favor", "En contra", "Puntos"].map((name) => <th key={name} scope="col" className="p-2">{name}</th>)}
        </tr></thead><tbody>{leagueStandings(config.order, matches, scores).map((row) => <tr key={row.country} className="border-t border-slate-200">
          <th scope="row" className="p-2 font-bold">{country(row.country)}</th>
          {[row.played, row.won, row.drawn, row.lost, row.for, row.against, row.points].map((value, index) => <td key={index} className="p-2 tabular-nums">{value}</td>)}
        </tr>)}</tbody></table>
      </div>
    </section>}
    {config.format === "knockout" && matches.length > 0 && <section className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900" aria-label="Clasificación de la eliminatoria">
      {matchWinner(matches.at(-1)!, scores.final) ? `Ganador de la actividad · ${country(matchWinner(matches.at(-1)!, scores.final))}` : "Ganador pendiente de los resultados de la final."}
    </section>}
  </div>;
}
