import { students } from "@/lib/demo-data";

export const academicYear = "2026/27";
export const groups = ["1º Bach A", "1º Bach B"] as const;

export const courseKpis = {
  participation: 84,
  tasksDone: 486,
  tasksPending: 37,
  averageProgress: 67,
  journalsCompleted: 94,
};

export const courseEvolution = [
  { label: "Septiembre · SA1 inicial", value: 34, month: "SEPTIEMBRE", detail: "Evaluación física inicial" },
  { label: "Noviembre · SA1 final", value: 51, month: "NOVIEMBRE", detail: "Evaluación física final" },
  { label: "Enero · SA2 inicial", value: 56, month: "ENERO", detail: "Evaluación técnica inicial" },
  { label: "Marzo · SA2 final", value: 69, month: "MARZO", detail: "Evaluación técnica final" },
  { label: "Tercer periodo · SA3", value: 76, month: "TERCER PERIODO", detail: "Ocio activo y juegos alternativos" },
];

export const weeklyItems = [
  { id: "w1", type: "Actividad pendiente", title: "Completar diario de sesión", situation: "SA1", date: "Esta semana" },
  { id: "w2", type: "Cuestionario", title: "Cuestionario asignado por el profesor", situation: "SA2", date: "Disponible" },
  { id: "w3", type: "Diario pendiente", title: "Reflexión tras la sesión deportiva", situation: "SA2", date: "Pendiente" },
  { id: "w4", type: "Contenido nuevo", title: "Diseñar sesiones seguras y participativas", situation: "SA3", date: "Nuevo" },
];

export const studentCourseDetail = students.map((student, index) => ({
  ...student,
  sa1: { physical: 64 + index * 3, journals: 7 - Math.min(index, 3), questionnaires: 2, contents: 6 },
  sa2: { technical: 55 + index * 4, sports: 4, journals: 5, questionnaires: 1, procedural: 3, decisions: 2 },
  sa3: { sessions: 2, ratings: 4, contents: 3, attitude: 2 },
  timeline: [
    { period: "Septiembre", title: "SA1 · Evaluación física inicial", status: "Completada" },
    { period: "Noviembre", title: "SA1 · Evaluación física final", status: index === 2 ? "Pendiente" : "Completada" },
    { period: "Enero", title: "SA2 · Evaluación técnica inicial", status: "Completada" },
    { period: "Marzo", title: "SA2 · Evaluación técnica final", status: index === 4 ? "Pendiente" : "Completada" },
    { period: "Tercer periodo", title: "SA3 · Sesiones y juegos alternativos", status: "En curso" },
  ],
}));

export const centralContents = [
  { id: "c1", title: "Principios básicos del entrenamiento", sa: "SA1", category: "Salud", status: "Publicado", type: "Explicación", updated: "10 sep" },
  { id: "c2", title: "Seguridad durante la práctica deportiva", sa: "SA2", category: "Seguridad", status: "Publicado", type: "Documento", updated: "8 sep" },
  { id: "c3", title: "Diseñar sesiones participativas", sa: "SA3", category: "Diseño", status: "Borrador", type: "Infografía", updated: "6 sep" },
];

export const documentLibrary = [
  { id: "d1", title: "Guía de trabajo SA1.pdf", sa: "SA1", size: "1,4 MB", visibility: "Privado · alumnado autenticado" },
  { id: "d2", title: "Ficha técnica deportes.pdf", sa: "SA2", size: "980 KB", visibility: "Privado · alumnado autenticado" },
  { id: "d3", title: "Plantilla sesión alternativa.pdf", sa: "SA3", size: "640 KB", visibility: "Privado · alumnado autenticado" },
];

export const exportTypes = [
  ["physical", "Resultados de pruebas físicas"],
  ["technical", "Resultados técnicos"],
  ["journals", "Diarios"],
  ["questionnaires", "Cuestionarios"],
  ["activities", "Actividades"],
  ["progress", "Progreso"],
] as const;
