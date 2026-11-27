import { SECOND_YEAR_WEEK } from "./second-year-agenda-calendar";
import { readStep, type EventWorkspace, type StepData } from "./sa4-event";

export const SA4_CALENDAR_START = "2026-11-30";
export const SA4_CALENDAR_SOURCE = "https://doe.juntaex.es/otrosFormatos/html.php?anio=2026&doe=1160o&xml=2026061567";
// Calendario escolar de Extremadura 2026/27, apartado sexto. Solo semanas
// completas de las cuatro clases de lunes a jueves configuradas en la agenda.
const breaks = [
  { start: "2026-12-07", end: "2026-12-08", reason: "Puente de diciembre" },
  { start: "2026-12-23", end: "2027-01-07", reason: "Vacaciones de Navidad" },
  { start: "2027-01-29", end: "2027-01-29", reason: "Día del Docente" },
  { start: "2027-02-08", end: "2027-02-09", reason: "Carnaval" },
  { start: "2027-03-22", end: "2027-03-29", reason: "Vacaciones de Semana Santa" },
];
const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};
export function tournamentWeeks(count: number) {
  const weeks: { start: string; end: string; classes: { date: string; label: string; start: string; end: string }[] }[] = [];
  for (let offset = 0; weeks.length < count && offset < 365; offset += 7) {
    const monday = addDays(SA4_CALENDAR_START, offset);
    const classes = SECOND_YEAR_WEEK.map((day) => ({ ...day, date: addDays(monday, day.weekday - 1) }));
    if (classes.some(({ date }) => breaks.some(({ start, end }) => date >= start && date <= end))) continue;
    weeks.push({ start: monday, end: classes.at(-1)!.date, classes });
  }
  return weeks;
}
export function countryFlag(code: string) {
  return /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...Array.from(code, (letter) => 127397 + letter.charCodeAt(0))) : "";
}
export function shortSportName(value: string) {
  const name = value.trim().replace(/^el deporte elegido es el\s+/i, "").split(/\n|\.\s|, un deporte/i)[0].trim();
  return name.length > 95 ? `${name.slice(0, 92).trim()}…` : name || "Deporte pendiente";
}
export function sportClarifications(sport: StepData["sport"]) {
  const notes: string[] = [];
  if (/p[áa]del/i.test(sport.sport) && /volante/i.test(sport.rules)) notes.push("Confirmad el reglamento: el deporte figura como pádel, pero las normas mencionan un volante.");
  if (/21\s*puntos/i.test(`${sport.rules} ${sport.objective}`) && /11\s*puntos/i.test(sport.scoring)) notes.push("Confirmad la puntuación de los partidos: hay apartados que indican 11 puntos y otros 21.");
  if (/recorrido|relevos/i.test(`${sport.sport} ${sport.objective}`) && /pallino/i.test(sport.rules)) notes.push("Confirmad la actividad: la presentación describe un recorrido, pero el reglamento explica lanzamientos al pallino.");
  return notes;
}
export function tournamentCalendar(workspace: Pick<EventWorkspace, "delegations" | "steps">) {
  const delegations = [...workspace.delegations].sort((a, b) => a.position - b.position || a.country_code.localeCompare(b.country_code));
  const weeks = tournamentWeeks(delegations.length);
  const codes = delegations.map(({ country_code }) => country_code);
  return delegations.map((delegation, index) => ({ delegation,
    week: delegation.country_code === "BR" ? {start:"2026-12-09",end:"2026-12-10",classes:SECOND_YEAR_WEEK.filter(day=>day.weekday===3||day.weekday===4).map(day=>({...day,date:day.weekday===3?"2026-12-09":"2026-12-10"}))} : weeks[index],
    sport: readStep(workspace.steps, delegation.country_code, "sport", codes),
  })).sort((a,b)=>a.week.start.localeCompare(b.week.start));
}
