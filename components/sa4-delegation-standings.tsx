"use client";

import { delegationStandings, type EventWorkspace } from "@/lib/sa4-event";

const formatPoints = (points: number) => points.toLocaleString("es-ES", { maximumFractionDigits: 1 });

export function Sa4DelegationStandings({ workspace }: { workspace: EventWorkspace }) {
  const { activities, completed, rows } = delegationStandings(workspace.delegations, workspace.steps);
  const country = (code: string) => workspace.delegations.find((team) => team.country_code === code)?.country ?? code;
  return <section aria-label="Clasificación total de delegaciones" className="card min-w-0 space-y-5 p-5 sm:p-7">
    <div><h2 className="text-2xl font-extrabold">Clasificación total de delegaciones</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Cada deporte aporta puntos a la clasificación de la olimpiada. Guarda los resultados de los partidos y pulsa «Actualizar evento» para consultar los últimos datos.</p>
    </div>
    <p role="status" className="rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900">{completed === 8 ? "Clasificación final · 8 de 8 deportes completados" : `Clasificación provisional · ${completed} de 8 deportes completados`}</p>
    {!completed && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Todavía no hay deportes completados. Los puntos se incorporan cuando se guardan todos los partidos de una actividad, incluidos los desempates de las eliminatorias. Las pruebas pendientes se muestran con «—».</p>}
    <details className="rounded-xl border border-slate-200 p-4">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold">Cómo se calcula la clasificación</summary>
      <div className="mt-2 space-y-3 text-sm leading-6 text-slate-600">
        <p>Todos los deportes tienen el mismo peso. Los puestos del 1.º al 8.º aportan, respectivamente, 16, 14, 12, 10, 8, 6, 4 y 2 puntos. Cada prueba reparte 72 puntos entre las ocho delegaciones.</p>
        <p>En liguilla se ordena por puntos de los partidos, diferencia de tantos y tantos a favor. Un empate que persista comparte los puntos de los puestos ocupados. Dos delegaciones empatadas en el 2.º puesto reciben (14 + 12) / 2 = 13 puntos cada una.</p>
        <p>En eliminatorias, el campeón recibe 16 puntos y el subcampeón 14. Las dos delegaciones eliminadas en semifinales comparten los puestos 3.º y 4.º y reciben 11 puntos cada una. Las cuatro eliminadas en cuartos comparten los puestos 5.º a 8.º y reciben 5 puntos cada una.</p>
        <p>En parejas se suman los puntos de las dos parejas de cada delegación a lo largo de las cuatro jornadas; se ordena por puntos, diferencia de tantos, tantos a favor y orden del sorteo; la actividad aporta puntos al total al completar los 64 partidos.</p>
        <p>En cuatro rondas se ordena por victorias, victorias de los rivales, diferencia de tantos, tantos a favor y orden inicial del sorteo. En dos grupos y consolación, y en cuartos con cuadros oro y plata, los partidos de posición determinan los ocho puestos.</p>
        <p>La suma determina el puesto general. Si hay empate a puntos, las delegaciones comparten puesto. El concurso de logos tiene su propia clasificación y no suma puntos deportivos. Esta puntuación tampoco es una calificación académica.</p>
      </div>
    </details>
    <p id="sa4-standings-help" className="text-xs leading-5 text-slate-600">En móvil, desliza la tabla para consultar las ocho pruebas. Con teclado, enfoca la tabla y usa las flechas. Cada columna indica el deporte y la delegación que lo organiza.</p>
    <div tabIndex={0} role="region" aria-label="Tabla de clasificación total" aria-describedby="sa4-standings-help" className="overflow-x-auto rounded-xl border border-slate-200 focus-visible:outline-2 focus-visible:outline-emerald-700">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <caption className="sr-only">Puntos por deporte y total de cada delegación. Solo cuentan las actividades completadas.</caption>
        <thead className="bg-slate-100"><tr>
          <th scope="col" className="p-3">Puesto</th><th scope="col" className="sticky left-0 z-10 min-w-36 bg-slate-100 p-3">Delegación</th>
          {activities.map((activity, index) => <th key={activity.organizer} scope="col" className="min-w-32 p-3">{activity.sport || `Deporte ${index + 1}`}<span className="mt-1 block text-xs font-normal">Organiza {country(activity.organizer)}</span></th>)}
          <th scope="col" className="bg-emerald-50 p-3">Total</th>
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row.country} className="border-t border-slate-200">
          <td className="p-3 tabular-nums">{row.position ? `${row.position}.º${rows.filter((other) => other.points === row.points).length > 1 ? " =" : ""}` : "—"}</td>
          <th scope="row" className="sticky left-0 z-10 bg-white p-3 font-bold">{country(row.country)}{row.country === workspace.countryCode && <span className="mt-1 block text-xs font-normal text-emerald-800">Mi delegación</span>}</th>
          {activities.map((activity) => {
            const place = activity.places.find((item) => item.country === row.country);
            return <td key={activity.organizer} className="p-3 tabular-nums">{place ? formatPoints(place.points) : <span aria-label="Actividad pendiente">—</span>}</td>;
          })}
          <td className="bg-emerald-50 p-3 font-extrabold tabular-nums text-emerald-900">{formatPoints(row.points)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="grid gap-3 sm:grid-cols-2" aria-label="Estado de las ocho actividades">{activities.map((activity, index) => <article key={activity.organizer} className="rounded-xl border border-slate-200 p-4 text-sm">
      <h3 className="font-bold">{activity.sport || `Deporte ${index + 1}`} · {country(activity.organizer)}</h3>
      <p className="mt-1 text-slate-600">{!activity.configured ? "Pendiente de guardar un cuadro válido con las ocho delegaciones." : activity.complete ? "Completado · Puntos incorporados al total." : `${activity.played} de ${activity.total} partidos resueltos. Faltan resultados o desempates para sumar al total.`}</p>
    </article>)}</div>
  </section>;
}
