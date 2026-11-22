"use client";

import { eventMatches, leagueStandings, matchWinner, type Delegation, type MatchScore, type StepData } from "@/lib/sa4-event";

export function Sa4Tournament({ teams, config, scores, onChange }: {
  teams: Delegation[]; config: StepData["competition"]; scores: Record<string, MatchScore>;
  onChange?: (scores: Record<string, MatchScore>) => void;
}) {
  const matches = eventMatches(config.format, config.order, scores);
  const country = (code: string | null) => teams.find((team) => team.country_code === code)?.country ?? "Pendiente de la ronda anterior";
  const played = matches.filter((match) => scores[match.id]?.a != null && scores[match.id]?.b != null).length;

  function change(matchId: string, side: "a" | "b" | "winner", value: string) {
    if (!onChange) return;
    const previous = scores[matchId] ?? { a: null, b: null };
    if (config.format === "knockout" && ((matchId.startsWith("q") && (scores[`s${Math.floor(Number(matchId.slice(1)) / 2)}`] || scores.final))
      || (matchId.startsWith("s") && scores.final)) && !window.confirm("Al corregir este partido, los resultados de las rondas siguientes volverán a quedar pendientes. ¿Continuar?")) return;
    const next = { ...scores, [matchId]: { ...previous, [side]: side === "winner" ? value : value === "" ? null : Number(value) } };
    if (config.format === "knockout") {
      // A changed earlier result invalidates later results, including a stale tiebreak winner.
      if (side !== "winner") delete next[matchId].winner;
      if (matchId.startsWith("q")) { delete next[`s${Math.floor(Number(matchId.slice(1)) / 2)}`]; delete next.final; }
      if (matchId.startsWith("s")) delete next.final;
    }
    onChange(next);
  }

  return <div className="space-y-5">
    <p className="text-sm font-semibold text-slate-700">{played} de {matches.length} partidos con resultado</p>
    {[...new Set(matches.map((match) => match.round))].map((round) => <section key={round} aria-label={round} className="space-y-2">
      <h4 className="font-extrabold text-slate-900">{round}</h4>
      {matches.filter((match) => match.round === round).map((match) => {
        const score = scores[match.id];
        const tied = config.format === "knockout" && score?.a != null && score.a === score.b;
        return <div key={match.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 text-sm">
            {(["a", "b"] as const).map((side, index) => <div key={side} className={index === 0 ? "col-start-1 row-start-1" : "col-start-3 row-start-1"}>
              <span className="block break-words font-bold">{country(match[side])}</span>
              {onChange ? <label className="mt-2 block text-xs text-slate-600">Resultado de {country(match[side])}
                <input type="number" min={0} max={9999} step={1} inputMode="numeric" value={score?.[side] ?? ""}
                  disabled={!match.a || !match.b} className="mt-1 min-h-11 w-full max-w-24 rounded-lg border border-slate-300 p-2 text-sm"
                  aria-label={`${round} · ${country(match.a)} contra ${country(match.b)} · Resultado de ${country(match[side])}`}
                  onChange={(event) => change(match.id, side, event.target.value)}/>
              </label> : <span className="mt-2 block font-semibold">{score?.[side] ?? "—"}</span>}
            </div>)}
            <span className="col-start-2 row-start-1 text-slate-500" aria-label="contra">vs.</span>
          </div>
          {tied && onChange && <label className="block text-sm font-bold">Ganador tras aplicar el desempate del reglamento
            <select value={score.winner ?? ""} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2 text-sm" onChange={(event) => change(match.id, "winner", event.target.value)}>
              <option value="" disabled>Elegid el ganador del desempate</option>
              {[match.a, match.b].filter(Boolean).map((code) => <option key={code!} value={code!}>{country(code)}</option>)}
            </select>
          </label>}
          {config.format === "knockout" && matchWinner(match, score) && <p className="text-xs font-bold text-emerald-800">Avanza {country(matchWinner(match, score))}</p>}
        </div>;
      })}
    </section>)}
    {config.format === "league" && <section aria-label="Clasificación de la actividad" className="space-y-2">
      <h4 className="font-extrabold">Clasificación provisional</h4>
      <p className="text-xs leading-5 text-slate-600">Se ordena por puntos, diferencia de tantos y tantos a favor. Los equipos con los mismos valores siguen empatados.</p>
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
