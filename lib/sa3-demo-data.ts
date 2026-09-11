import type {
  AlternativeGame,
  AttitudeItem,
  AttitudeSubmission,
  DesignedSession,
  GameRating,
  Sa3TheoryContent,
} from "@/lib/sa3-types";

export const alternativeGames: AlternativeGame[] = [
  {
    id: "g1", name: "Kin-Ball adaptado", description: "Juego cooperativo de ocupación del espacio con balón ligero.",
    objective: "Favorecer la cooperación, la anticipación y la participación continua.", recommendedParticipants: "12-24",
    space: "Pista polideportiva", materials: ["Balón ligero grande", "Petos"], approximateMinutes: 18, intensity: "media",
    rules: ["Tres equipos participan de forma rotatoria.", "El objetivo es mantener el balón en juego siguiendo la consigna."],
    variants: ["Reducir el espacio.", "Introducir zonas de puntuación cooperativa."],
    safetyRecommendations: "Mantener distancia durante desplazamientos y evitar lanzamientos directos al cuerpo.",
    categories: ["Cooperación", "Gran grupo"], active: true,
  },
  {
    id: "g2", name: "Ultimate con zonas", description: "Versión educativa de juego con disco y zonas de progresión.",
    objective: "Moverse sin móvil, ofrecer apoyos y tomar decisiones colectivas.", recommendedParticipants: "8-16",
    space: "Pista o campo exterior", materials: ["Disco volador", "Conos"], approximateMinutes: 20, intensity: "alta",
    rules: ["No se puede correr con el disco.", "La progresión se consigue mediante pases.", "Se prioriza el juego limpio."],
    variants: ["Limitar tiempo de posesión.", "Añadir zonas de pase obligatorio."],
    safetyRecommendations: "Evitar contactos, revisar el terreno y adaptar distancias al nivel del grupo.",
    categories: ["Oposición", "Cooperación", "Exterior"], active: true,
  },
  {
    id: "g3", name: "Colpbol adaptado", description: "Juego colectivo con golpeos de balón y participación compartida.",
    objective: "Crear líneas de apoyo y favorecer intervenciones breves de muchos participantes.", recommendedParticipants: "10-20",
    space: "Pista polideportiva", materials: ["Balón blando", "Porterías o conos"], approximateMinutes: 16, intensity: "media",
    rules: ["El balón se juega mediante golpeos.", "Se evita retenerlo.", "No se permite contacto intencionado."],
    variants: ["Modificar tamaño de las porterías.", "Crear zonas de pase."],
    safetyRecommendations: "Utilizar balón blando y dejar espacio suficiente entre jugadores.",
    categories: ["Cooperación", "Oposición"], active: true,
  },
  {
    id: "g4", name: "Reto de islas", description: "Desafío cooperativo ficticio para desplazarse usando apoyos limitados.",
    objective: "Resolver problemas motrices de forma creativa y cooperativa.", recommendedParticipants: "6-12",
    space: "Gimnasio o pista", materials: ["Aros", "Colchonetas pequeñas"], approximateMinutes: 12, intensity: "baja",
    rules: ["El grupo debe alcanzar la zona final usando solo los apoyos permitidos.", "Los materiales se comparten."],
    variants: ["Reducir apoyos.", "Introducir una tarea de transporte."],
    safetyRecommendations: "Evitar saltos entre superficies inestables y asegurar que los apoyos no deslicen.",
    categories: ["Cooperación", "Creatividad"], active: true,
  },
];

export const designedSessions: DesignedSession[] = [
  {
    id: "ses1", title: "Cooperar y ocupar espacios", objective: "Diseñar una sesión participativa basada en cooperación.",
    participants: 20, materials: "Discos, conos, petos y balón ligero", space: "Pista polideportiva",
    warmup: "Activación en parejas con desplazamientos y pases.", warmupMinutes: 8,
    mainGames: [
      { id: "b1", source: "library", gameId: "g2", name: "Ultimate con zonas", minutes: 18 },
      { id: "b2", source: "own", name: "Cruza y coopera", minutes: 12, notes: "Juego propio por pequeños grupos." },
    ],
    cooldown: "Movilidad suave y reflexión conjunta.", cooldownMinutes: 7,
    observations: "Organizar equipos antes de comenzar.", safetyMeasures: "Sin contacto y revisión previa del espacio.",
    status: "submitted", updatedAt: "2026-04-18", submittedAt: "2026-04-18",
    teacherFeedback: "La progresión está bien organizada. Revisa la transición entre los dos juegos principales.",
  },
  {
    id: "ses2", title: "Retos cooperativos", objective: "Proponer tareas con participación equilibrada.",
    participants: 18, materials: "Aros, conos y colchonetas", space: "Gimnasio",
    warmup: "Desplazamientos guiados.", warmupMinutes: 6,
    mainGames: [{ id: "b3", source: "library", gameId: "g4", name: "Reto de islas", minutes: 20 }],
    cooldown: "Respiración y breve puesta en común.", cooldownMinutes: 5,
    observations: "", safetyMeasures: "Separar zonas de trabajo y comprobar apoyos.",
    status: "draft", updatedAt: "2026-04-24",
  },
];

export const gameRatings: GameRating[] = [
  { id: "r1", gameId: "g2", fun: 5, participation: 4, difficulty: 3, intensity: 4, cooperation: 4, wouldPlayAgain: true, comment: "Me gustó que el juego fuera continuo.", improvementProposal: "Equipos algo más pequeños.", date: "2026-04-12" },
  { id: "r2", gameId: "g1", fun: 4, participation: 5, difficulty: 2, intensity: 3, cooperation: 5, wouldPlayAgain: true, comment: "Participamos bastante.", improvementProposal: "Probar otra variante.", date: "2026-04-20" },
];

export const groupGameRatingSummary = [
  { label: "Diversión", value: 4.4 },
  { label: "Participación", value: 4.2 },
  { label: "Dificultad", value: 2.9 },
  { label: "Intensidad", value: 3.7 },
  { label: "Cooperación", value: 4.5 },
];

export const sa3TheoryContents: Sa3TheoryContent[] = [
  { id: "tc1", title: "¿Qué caracteriza a un juego alternativo?", description: "Ideas para analizar participación, accesibilidad y adaptación de reglas.", category: "Fundamentos", type: "explicacion", publishedAt: "2 abr", read: true },
  { id: "tc2", title: "Diseñar sesiones seguras y participativas", description: "Infografía sobre organización del espacio, material y tiempos.", category: "Diseño de sesiones", type: "infografia", publishedAt: "8 abr", read: true },
  { id: "tc3", title: "Ficha de análisis de juegos", description: "Documento para observar reglas, intensidad y variantes.", category: "Recursos", type: "documento", publishedAt: "15 abr", read: false },
  { id: "tc4", title: "Vídeo enlazado: adaptar un juego", description: "Recurso externo ficticio para trabajar variantes y accesibilidad.", category: "Creatividad", type: "video", publishedAt: "22 abr", read: false },
];

export const attitudeItems: AttitudeItem[] = [
  { id: "a1", label: "Participación", type: "scale_1_5", active: true, position: 1 },
  { id: "a2", label: "Esfuerzo", type: "scale_1_5", active: true, position: 2 },
  { id: "a3", label: "Respeto", type: "scale_1_5", active: true, position: 3 },
  { id: "a4", label: "Cooperación", type: "scale_1_5", active: true, position: 4 },
  { id: "a5", label: "Responsabilidad", type: "scale_1_5", active: true, position: 5 },
  { id: "a6", label: "Cuidado del material", type: "yes_no", active: true, position: 6 },
  { id: "a7", label: "Actitud ante los compañeros", type: "scale_1_5", active: true, position: 7 },
  { id: "a8", label: "Cumplimiento de normas", type: "scale_1_5", active: true, position: 8 },
];

export const attitudeHistory: AttitudeSubmission[] = [
  { id: "as1", date: "2026-04-10", periodLabel: "Primer registro", scoreIndex: 72 },
  { id: "as2", date: "2026-05-08", periodLabel: "Segundo registro", scoreIndex: 81 },
];

export const sa3ProgressSeries = [
  { label: "Inicio", value: 22 },
  { label: "Abril", value: 48 },
  { label: "Mayo", value: 67 },
];
