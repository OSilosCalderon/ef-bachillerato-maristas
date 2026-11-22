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
export type Vote = { candidate: string };
export type EventWorkspace = {
  courseId: string; teacher: boolean; countryCode: string | null; delegations: Delegation[];
  steps: SavedStep[]; phase: VotingPhase; votes: Vote[]; ownVote: string | null;
};
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
