import type {
  ProceduralActivity,
  ProceduralAttempt,
  Sa2TheoryContent,
  Sport,
  SportsJournalEntry,
  TechnicalTest,
} from "@/lib/sa2-types";

export const sports: Sport[] = [
  { id: "basket", name: "Baloncesto", description: "Habilidades técnicas y toma de decisiones en situaciones de juego.", active: true },
  { id: "volley", name: "Voleibol", description: "Control del balón, desplazamientos y cooperación.", active: true },
  { id: "badminton", name: "Bádminton", description: "Golpeos, colocación y lectura del espacio.", active: true },
  { id: "football", name: "Fútbol", description: "Conducción, pase y principios básicos de juego.", active: true },
  { id: "handball", name: "Balonmano", description: "Pase, recepción, lanzamiento y ocupación de espacios.", active: false },
];

export const technicalTests: TechnicalTest[] = [
  {
    id: "tt-1", sportId: "basket", name: "Circuito técnico demo", description: "Prueba demostrativa configurable.",
    instructions: "Completa el recorrido siguiendo las indicaciones del profesor.", unit: "s",
    direction: "lower_better", valuationCriteria: "Control y ejecución eficiente del recorrido.",
    active: true, january: 24.8, march: 22.9,
  },
  {
    id: "tt-2", sportId: "basket", name: "Precisión demo", description: "Registro técnico de ejemplo.",
    instructions: "Realiza la serie de intentos indicada.", unit: "aciertos",
    direction: "higher_better", valuationCriteria: "Número de ejecuciones correctas.",
    active: true, january: 6, march: 8,
  },
  {
    id: "tt-3", sportId: "volley", name: "Control continuado demo", description: "Prueba abierta a sustitución por otra definitiva.",
    instructions: "Mantén el control según la consigna indicada.", unit: "acciones",
    direction: "higher_better", valuationCriteria: "Continuidad y control técnico.",
    active: true, january: 13, march: 16,
  },
  {
    id: "tt-4", sportId: "badminton", name: "Desplazamiento y golpeo demo", description: "Ejemplo para visualizar la evolución.",
    instructions: "Completa la secuencia técnica marcada.", unit: "puntos",
    direction: "higher_better", valuationCriteria: "Ejecución correcta según la rúbrica docente.",
    active: true, january: 7, march: 7,
  },
];

export const sa2TheoryContents: Sa2TheoryContent[] = [
  {
    id: "sa2-content-1", title: "Principios básicos para ocupar espacios",
    excerpt: "Ideas generales para interpretar espacios libres, apoyos y líneas de pase.",
    category: "principios_juego", scope: "sa2", publishedAt: "18 ene", read: true,
    documents: ["principios-juego.pdf"],
  },
  {
    id: "sa2-content-2", title: "Baloncesto: reglas básicas para las tareas de clase",
    excerpt: "Material de apoyo asociado al deporte y adaptado a las situaciones trabajadas.",
    category: "reglamento", scope: "sport", sportId: "basket", publishedAt: "30 ene", read: true,
    links: ["Recurso complementario"],
  },
  {
    id: "sa2-content-3", title: "Seguridad durante la práctica deportiva",
    excerpt: "Recordatorio de hábitos y normas para realizar las tareas de forma segura.",
    category: "seguridad", scope: "sa2", publishedAt: "7 feb", read: false, hasImage: true,
  },
  {
    id: "sa2-content-4", title: "Voleibol: orientación corporal y continuidad",
    excerpt: "Contenido técnico de demostración asociado a un deporte concreto.",
    category: "tecnica", scope: "sport", sportId: "volley", publishedAt: "15 feb", read: false,
  },
];

export const sportsJournalEntries: SportsJournalEntry[] = [
  {
    id: "sj-1", date: "2026-01-22", sportId: "basket", contentWorked: "Pase, recepción y ocupación del espacio",
    exercises: "Rueda de pases, 3x2 y situación reducida.", learning: "He identificado mejor cuándo ofrecer una línea de pase.",
    difficulty: 3, participation: 4, performancePerception: 4,
    needsImprovement: "Tomar la decisión con más rapidez.", reflection: "Me ha ayudado mirar antes de recibir.",
  },
  {
    id: "sj-2", date: "2026-02-12", sportId: "volley", contentWorked: "Control y continuidad",
    exercises: "Tareas por parejas y juego condicionado.", learning: "La colocación previa facilita el control.",
    difficulty: 3, participation: 5, performancePerception: 3,
    needsImprovement: "Ajustar mejor los desplazamientos.", reflection: "Cuando llego equilibrado ejecuto con más control.",
  },
];

export const sa2Questionnaires = [
  {
    id: "sa2-q-1", title: "Cuestionario configurable de SA2",
    description: "Ejemplo vacío de contenido psicológico real. Utiliza el mismo motor genérico de SA1.",
    instructions: "Responde siguiendo las indicaciones del profesor/a.", questionCount: 6,
    status: "available" as const, opensAt: "20 feb", closesAt: "30 mar",
  },
];

export const proceduralActivities: ProceduralActivity[] = [
  {
    id: "pa-1", title: "Decisiones en situaciones de juego · demo",
    description: "Actividad ficticia para probar el motor de escenarios. No constituye un test definitivo.",
    sportId: "basket", published: true, maxAttempts: 3, questionCount: 3,
  },
  {
    id: "pa-2", title: "Conocimiento procedimental · demo",
    description: "Plantilla demostrativa con alternativas y explicación posterior.",
    sportId: "volley", published: true, maxAttempts: 2, questionCount: 4,
  },
];

export const proceduralAttempts: ProceduralAttempt[] = [
  { id: "pat-1", activityId: "pa-1", attemptNumber: 1, date: "2026-02-18", score: 5, maxScore: 8, status: "submitted" },
  { id: "pat-2", activityId: "pa-1", attemptNumber: 2, date: "2026-03-05", score: 7, maxScore: 8, status: "submitted" },
];

export const individualTechnicalEvolution = [
  { label: "Enero", value: 54 },
  { label: "Marzo", value: 71 },
];

export const groupTechnicalEvolution = [
  { label: "Enero", value: 57 },
  { label: "Marzo", value: 68 },
];

export const decisionEvolution = [
  { label: "Intento 1", value: 63 },
  { label: "Intento 2", value: 88 },
];
