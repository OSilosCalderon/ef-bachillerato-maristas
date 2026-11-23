export type Delegation = { country_code: string; country: string; members: string[]; position: number };
export type MatchScore = { a: number | null; b: number | null; winner?: string };
export type Match = { id: string; round: string; a: string | null; b: string | null };
export type EventStep = "identity" | "sport" | "planning" | "competition" | "results" | "reflection";
export type StepData = {
  identity: { name: string; slogan: string; logo: string; meaning: string };
  sport: { sport: string; objective: string; rules: string; players: string; duration: string; scoring: string; tieBreak: string; fairPlay: string };
  planning: { roles: string; venue: string; date: string; materials: string; budget: string; schedule: string; safety: string; inclusion: string; backup: string; publicity: string; sustainability: string };
  competition: { format: "league" | "knockout"; order: string[]; participation: string; referees: string };
  results: { scores: Record<string, MatchScore> };
  reflection: { outcome: string; evidence: string; teamwork: string; improvements: string };
};
export type SavedStep = { country_code: string; step: EventStep; data: StepData[EventStep]; revision: number; updated_at: string };
export type VotingPhase = "submissions" | "voting" | "closed";
export type LogoRanking = Record<string, number>;
export type Vote = { scores: LogoRanking };
export type EventWorkspace = {
  courseId: string; teacher: boolean; countryCode: string | null; delegations: Delegation[];
  steps: SavedStep[]; phase: VotingPhase; votes: Vote[]; ownVote: LogoRanking | null;
  projectVersions: Record<string, string>;
};
export type LogoUpdates = { countries: string[]; steps: SavedStep[]; versions: Record<string, string> };

export function mergeLogoUpdates(workspace: EventWorkspace, updates: LogoUpdates): EventWorkspace {
  return { ...workspace,
    steps: [...workspace.steps.filter((step) => step.step !== "identity" || !updates.countries.includes(step.country_code)), ...updates.steps],
    projectVersions: { ...workspace.projectVersions, ...updates.versions },
  };
}
export const eventSteps: { id: EventStep; title: string; help: string }[] = [
  { id: "identity", title: "Logo y lema", help: "Proponed una identidad para toda la olimpiada. Cada delegación presenta un logo al concurso." },
  { id: "sport", title: "Actividad y reglamento", help: "Elegid un deporte para organizar. Las ocho delegaciones participarán en las actividades propuestas por los equipos." },
  { id: "planning", title: "Planificación y publicidad", help: "Preparad lo necesario antes del primer partido y repartid las tareas para poder organizar y participar." },
  { id: "competition", title: "Formato y cuadro de juego", help: "Elegid el formato y el orden del sorteo. El cuadro se genera con las ocho delegaciones." },
  { id: "results", title: "Resultados y clasificación", help: "Anotad los resultados durante el evento. La clasificación se calcula con los partidos registrados." },
  { id: "reflection", title: "Balance del evento", help: "Explicad qué ha ocurrido y qué mejoraríais, utilizando evidencias de vuestra actividad." },
];

export const stepFields = {
  identity: [
    ["name", "Nombre del evento", "Un nombre para la olimpiada de la clase."],
    ["slogan", "Lema", "Una frase breve que invite a participar."],
    ["meaning", "Qué representa el logo", "Explicad sus símbolos, colores y relación con el evento."],
  ],
  sport: [
    ["sport", "Deporte o actividad", "Elegid una actividad distinta de las que ya han elegido otros equipos."],
    ["objective", "Objetivo del juego", "Qué deben conseguir los participantes y cómo se gana."],
    ["players", "Participantes y rotaciones", "Cómo participan las cuatro personas de cada país y cómo se realizan los cambios."],
    ["duration", "Duración y descansos", "Tiempo por partido, pausas y margen entre encuentros."],
    ["rules", "Reglamento", "Inicio, terreno de juego, acciones permitidas, faltas, sanciones y final del partido."],
    ["scoring", "Puntuación del juego", "Cómo se consiguen puntos o goles en cada partido."],
    ["tieBreak", "Cómo resolvemos los empates", "En eliminatorias debéis determinar un ganador. Explicad el procedimiento."],
    ["fairPlay", "Arbitraje y juego limpio", "Cómo se comunican las decisiones y se resuelven desacuerdos."],
  ],
  planning: [
    ["roles", "Reparto de responsabilidades", "Asignad a cada integrante tareas de coordinación, arbitraje, material y registro. Preved relevos para que pueda jugar."],
    ["venue", "Espacio y distribución", "Dónde se juega, dimensiones, zonas de espera y circulación."],
    ["date", "Fecha y horario previstos", "Concretad la sesión o franja que proponéis al profesor."],
    ["materials", "Material necesario", "Cantidades, material disponible, de dónde se obtiene y quién lo prepara."],
    ["budget", "Presupuesto", "Qué podéis reutilizar y cuánto costaría lo que falte. Si no hay gasto, indicad 0 €."],
    ["schedule", "Cronograma", "Orden y tiempos de montaje, explicación, calentamiento, partidos, pausas y recogida."],
    ["safety", "Seguridad", "Riesgos concretos del espacio y la actividad, medidas preventivas y cómo avisar al profesor."],
    ["inclusion", "Participación e inclusión", "Adaptaciones de reglas, material o roles para que todos puedan participar."],
    ["backup", "Plan alternativo", "Qué haréis si llueve, falta material, alguien se ausenta o se acumulan retrasos."],
    ["publicity", "Publicidad y anuncio", "Redactad el anuncio con nombre, lema, fecha, lugar, actividad y qué deben llevar los participantes. Añadid cómo lo difundiréis."],
    ["sustainability", "Recogida y sostenibilidad", "Cómo reutilizaréis material, repartiréis la recogida y gestionaréis los residuos."],
  ],
  reflection: [
    ["outcome", "Cómo ha salido la actividad", "Comparad el plan con lo ocurrido, incluidos tiempos, participación e incidencias."],
    ["evidence", "Evidencias", "Resultados, observaciones y opiniones que apoyan vuestra valoración."],
    ["teamwork", "Cómo hemos trabajado", "Qué aportó cada integrante y cómo resolvisteis los problemas."],
    ["improvements", "Qué mantendríamos y qué cambiaríamos", "Proponed mejoras concretas para una segunda edición."],
  ],
} as const;

export function emptyStep<K extends EventStep>(step: K, countries: string[]): StepData[K] {
  if (step === "competition") return { format: "league", order: countries, participation: "", referees: "" } as StepData[K];
  if (step === "results") return { scores: {} } as StepData[K];
  const fields = stepFields[step as keyof typeof stepFields];
  return { ...Object.fromEntries(fields.map(([key]) => [key, ""])), ...(step === "identity" ? { logo: "" } : {}) } as StepData[K];
}

export function readStep<K extends EventStep>(steps: SavedStep[], country: string, step: K, countries: string[]): StepData[K] {
  return (steps.find((item) => item.country_code === country && item.step === step)?.data ?? emptyStep(step, countries)) as StepData[K];
}

export function projectSteps(projects: { country_code: string; content: Record<string, unknown>; updated_at: string }[]): SavedStep[] {
  return projects.flatMap((project) => eventSteps.filter(({ id }) => project.content[id]).map(({ id }) => ({
    country_code: project.country_code, step: id, data: project.content[id] as StepData[EventStep],
    revision: Number((project.content._revisions as Record<string, number> | undefined)?.[id] ?? 0), updated_at: project.updated_at,
  })));
}

export function matchWinner(match: Match, score?: MatchScore): string | null {
  if (!match.a || !match.b || score?.a == null || score.b == null) return null;
  if (score.a > score.b) return match.a;
  if (score.b > score.a) return match.b;
  return score.winner === match.a || score.winner === match.b ? score.winner : null;
}

export function eventMatches(format: StepData["competition"]["format"], countries: string[], scores: Record<string, MatchScore> = {}): Match[] {
  if (countries.length !== 8 || new Set(countries).size !== 8) return [];
  if (format === "knockout") {
    const quarters = [0, 1, 2, 3].map((i) => ({ id: `q${i}`, round: "Cuartos de final", a: countries[i * 2], b: countries[i * 2 + 1] }));
    const semis = [0, 1].map((i) => ({ id: `s${i}`, round: "Semifinal", a: matchWinner(quarters[i * 2], scores[`q${i * 2}`]), b: matchWinner(quarters[i * 2 + 1], scores[`q${i * 2 + 1}`]) }));
    return [...quarters, ...semis, { id: "final", round: "Final", a: matchWinner(semis[0], scores.s0), b: matchWinner(semis[1], scores.s1) }];
  }
  const rotation = [...countries];
  const matches: Match[] = [];
  for (let round = 0; round < 7; round++) {
    for (let i = 0; i < 4; i++) matches.push({ id: `r${round}-${i}`, round: `Jornada ${round + 1}`, a: rotation[i], b: rotation[7 - i] });
    rotation.splice(1, 0, rotation.pop()!);
  }
  return matches;
}

export function leagueStandings(countries: string[], matches: Match[], scores: Record<string, MatchScore>) {
  const rows = countries.map((country) => ({ country, played: 0, won: 0, drawn: 0, lost: 0, for: 0, against: 0, points: 0 }));
  for (const match of matches) {
    const score = scores[match.id];
    if (!match.a || !match.b || score?.a == null || score.b == null) continue;
    const a = rows.find((row) => row.country === match.a)!;
    const b = rows.find((row) => row.country === match.b)!;
    a.played++; b.played++; a.for += score.a; a.against += score.b; b.for += score.b; b.against += score.a;
    if (score.a === score.b) { a.drawn++; b.drawn++; a.points++; b.points++; }
    else { const winner = score.a > score.b ? a : b; const loser = score.a > score.b ? b : a; winner.won++; winner.points += 3; loser.lost++; }
  }
  return rows.sort((a, b) => b.points - a.points || (b.for - b.against) - (a.for - a.against) || b.for - a.for);
}

export function validateLogoRanking(data: unknown, countries: string[]): LogoRanking {
  if (!data || typeof data !== "object" || Array.isArray(data) || countries.length !== 8 || new Set(countries).size !== 8
    || Object.keys(data).length !== 8 || countries.some((country) => !Object.hasOwn(data, country))) {
    throw new Error("Puntúa los ocho logos, incluido el de tu delegación, antes de guardar.");
  }
  const points = Object.values(data);
  if (new Set(points).size !== 8 || points.some((value) => !Number.isInteger(value) || Number(value) < 1 || Number(value) > 8)) {
    throw new Error("Usa cada puntuación del 1 al 8 una sola vez. El 8 es para el logo que más te gusta.");
  }
  return data as LogoRanking;
}

export function logoStandings(countries: string[], votes: Vote[]) {
  return countries.map((country) => ({ country, points: votes.reduce((total, vote) => total + (vote.scores[country] ?? 0), 0), ratings: votes.length }))
    .sort((a, b) => b.points - a.points);
}

// Each completed sport distributes 36 points. Ties share the points of the occupied places.
function awardPlaces(groups: string[][]) {
  let occupied = 0;
  return groups.flatMap((group) => {
    const position = occupied + 1;
    const points = 8 - occupied - (group.length - 1) / 2;
    occupied += group.length;
    return group.map((country) => ({ country, position, points }));
  });
}

export function delegationStandings(delegations: Delegation[], steps: SavedStep[]) {
  const countries = delegations.map((team) => team.country_code);
  const activities = delegations.map((team) => {
    const sport = readStep(steps, team.country_code, "sport", countries).sport;
    const configured = steps.some((row) => row.country_code === team.country_code && row.step === "competition");
    const config = readStep(steps, team.country_code, "competition", countries);
    const scores = readStep(steps, team.country_code, "results", countries).scores;
    const valid = configured && ["league", "knockout"].includes(config.format) && Array.isArray(config.order)
      && config.order.length === 8 && new Set(config.order).size === 8 && config.order.every((code) => countries.includes(code));
    const matches = valid ? eventMatches(config.format, config.order, scores) : [];
    const finished = matches.filter((match) => {
      const score = scores[match.id];
      return match.a && match.b && score && [score.a, score.b].every((n) => n !== null && Number.isInteger(n) && n >= 0 && n <= 9999)
        && (config.format === "league" || matchWinner(match, score));
    });
    const complete = matches.length > 0 && finished.length === matches.length;
    let places: { country: string; position: number; points: number }[] = [];
    if (complete && config.format === "league") {
      const rows = leagueStandings(countries, matches, scores);
      const groups: string[][] = [];
      rows.forEach((row, index) => {
        const previous = rows[index - 1];
        if (previous && row.points === previous.points && row.for - row.against === previous.for - previous.against && row.for === previous.for) groups.at(-1)!.push(row.country);
        else groups.push([row.country]);
      });
      places = awardPlaces(groups);
    } else if (complete) {
      const final = matches.at(-1)!;
      const winner = matchWinner(final, scores.final)!;
      const runnerUp = final.a === winner ? final.b! : final.a!;
      const losers = (round: string) => matches.filter((match) => match.round === round).map((match) => matchWinner(match, scores[match.id]) === match.a ? match.b! : match.a!);
      places = awardPlaces([[winner], [runnerUp], losers("Semifinal"), losers("Cuartos de final")]);
    }
    return { organizer: team.country_code, sport, configured: valid, complete, played: finished.length, total: matches.length, places };
  });
  const completed = activities.filter((activity) => activity.complete).length;
  const totals = countries.map((country) => ({ country, points: activities.reduce((sum, activity) => sum + (activity.places.find((place) => place.country === country)?.points ?? 0), 0) }))
    .sort((a, b) => b.points - a.points);
  const rows = totals.map((row) => ({ ...row, position: completed ? totals.findIndex((other) => other.points === row.points) + 1 : null }));
  return { activities, completed, rows };
}

export function validateStep(step: EventStep, data: unknown, countries: string[]) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Revisa los datos del paso.");
  const record = data as Record<string, unknown>;
  if (step === "competition") {
    if (!["league", "knockout"].includes(String(record.format)) || !Array.isArray(record.order) || record.order.length !== 8
      || new Set(record.order).size !== 8 || record.order.some((code) => !countries.includes(code))) throw new Error("El cuadro debe incluir a las ocho delegaciones una sola vez.");
    for (const key of ["participation", "referees"]) if (typeof record[key] !== "string" || record[key].length > 4000) throw new Error("Revisa la organización del cuadro.");
  } else if (step === "results") {
    const scores = record.scores;
    if (!scores || typeof scores !== "object" || Array.isArray(scores) || Object.keys(scores).length > 28) throw new Error("Revisa los resultados.");
    for (const score of Object.values(scores) as MatchScore[]) {
      if (!score || [score.a, score.b].some((value) => value !== null && (!Number.isInteger(value) || value < 0 || value > 9999))
        || (score.winner !== undefined && !countries.includes(score.winner))) throw new Error("Los resultados deben ser números enteros entre 0 y 9999.");
    }
  } else {
    for (const [key] of stepFields[step]) if (typeof record[key] !== "string" || record[key].length > 4000) throw new Error("Revisa los campos. Cada respuesta admite hasta 4.000 caracteres.");
    if (step === "identity" && (typeof record.logo !== "string" || record.logo.length > 350000
      || (record.logo && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(record.logo)))) throw new Error("Elige una imagen PNG, JPG o WebP para el logo.");
  }
  return data as StepData[typeof step];
}
