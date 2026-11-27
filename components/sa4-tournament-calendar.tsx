"use client";

import { SA4_CALENDAR_SOURCE, countryFlag, shortSportName, sportClarifications, tournamentCalendar } from "@/lib/sa4-tournament-calendar";
import type { EventWorkspace } from "@/lib/sa4-event";
import { eventButton } from "@/components/sa4-event-editor";

const dateLabel = (date: string) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(new Date(`${date}T12:00:00Z`));
const classTasks = ["Explicación de reglas, organización y primeros partidos", "Partidos y rotación de participantes", "Continuación de partidos y registro de resultados", "Últimos encuentros, clasificación y balance"];
const brief = (text: string) => text.length > 260 ? `${text.slice(0, 257).trim()}…` : text;

export function Sa4TournamentCalendar({ workspace, onOpen }: { workspace: EventWorkspace; onOpen: (country: string, step: "sport" | "competition" | "results") => void }) {
  const rows = tournamentCalendar(workspace);
  return <section className="space-y-5" aria-labelledby="sa4-calendar-title">
    <div className="card space-y-3 p-5 sm:p-7">
      <h3 id="sa4-calendar-title" className="text-2xl font-extrabold text-slate-950">Calendario de torneos</h3>
      <p className="text-sm leading-6 text-slate-700">Cuatro clases por torneo, de lunes a jueves, salvo Brasil: dos jornadas el 9 y 10 de diciembre. Empezamos el 30 de noviembre de 2026. Todas las delegaciones participan y cada país organiza su actividad.</p>
      <p className="text-sm leading-6 text-slate-600">Se reservan semanas lectivas completas: se saltan las semanas con festivos, Navidad y Carnaval. Se conserva el orden previsto, con Brasil adelantado a diciembre. Su semana original del 1 al 4 de febrero queda libre. Las fechas son las previstas para el evento; el profesor comunicará los ajustes propios del centro.</p>
      <a href={SA4_CALENDAR_SOURCE} target="_blank" rel="noreferrer" className="inline-block min-h-11 py-2.5 text-sm font-bold text-[#164c3a] underline">Consultar calendario escolar de referencia (se abre en otra pestaña)</a>
      <p className="text-xs leading-5 text-slate-600">Las clases son una guía de trabajo. El cuadro, la duración de los partidos y las rotaciones se concretan en el reglamento de cada delegación.</p>
    </div>
    {!rows.length ? <p role="status" className="card p-6 text-sm text-slate-700">Todavía no hay delegaciones asignadas. El profesor debe configurar los equipos para mostrar sus torneos.</p> : <ol className="grid items-start gap-5 lg:grid-cols-2">
      {rows.map(({ delegation, sport, week }, index) => {
        const notes = sportClarifications(sport);
        return <li key={delegation.country_code} className="card min-w-0 space-y-4 p-5 sm:p-6">
          <div className="flex items-start gap-3"><span aria-hidden="true" className="shrink-0 text-4xl">{countryFlag(delegation.country_code)}</span><div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-[#164c3a]">Torneo {index + 1} · Organiza {delegation.country}</p>
            <h4 className="mt-1 break-words text-xl font-extrabold text-slate-950">{shortSportName(sport.sport)}</h4>
          </div></div>
          <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-950"><time dateTime={week.start}>{dateLabel(week.start)}</time> – <time dateTime={week.end}>{dateLabel(week.end)}</time><span className="mt-1 block text-xs font-semibold">{week.classes.length} clases · En horario de Educación Física</span></p>
          <div className="space-y-2"><h5 className="font-bold text-slate-950">Guía del juego</h5>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{brief(sport.objective.trim()) || "La delegación aún no ha guardado el objetivo del juego. Consulta al equipo organizador antes de empezar."}</p>
            {sport.players.trim() && <p className="break-words text-sm leading-6 text-slate-700"><strong>Participación: </strong>{brief(sport.players.trim())}</p>}
            {sport.scoring.trim() && <p className="break-words text-sm leading-6 text-slate-700"><strong>Puntuación: </strong>{brief(sport.scoring.trim())}</p>}
            {notes.length > 0 && <div className="space-y-2 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-950"><p className="font-bold">Antes de jugar</p>{notes.map((note) => <p key={note}>{note}</p>)}<p>El equipo organizador debe aclararlo con el profesor y actualizar su reglamento.</p></div>}
          </div>
          <ol className="space-y-2" aria-label={`Las ${week.classes.length} clases del torneo de ${delegation.country}`}>
            {week.classes.map((session, i) => <li key={session.date} className="rounded-xl border border-slate-200 p-3 text-sm leading-6"><p className="font-bold">Clase {i + 1} · {session.label} <time dateTime={session.date}>{dateLabel(session.date)}</time></p><p className="text-xs text-slate-600">{session.start}–{session.end}</p><p className="text-slate-700">{delegation.country_code === "BR" ? (i === 0 ? "Cuartos de final y registro de ganadores y perdedores" : "Semifinales oro y plata, finales y clasificación") : classTasks[i]}</p></li>)}
          </ol>
          <div className="flex flex-wrap gap-2"><button type="button" className={eventButton} onClick={() => onOpen(delegation.country_code, "sport")}>Ver reglamento completo</button><button type="button" className={eventButton} onClick={() => onOpen(delegation.country_code, "competition")}>Ver cuadro de juego</button><button type="button" className={eventButton} onClick={() => onOpen(delegation.country_code, "results")}>Ver resultados</button></div>
        </li>;
      })}
    </ol>}
  </section>;
}
