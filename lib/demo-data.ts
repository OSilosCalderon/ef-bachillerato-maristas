import type { Activity, LearningSituation, StudentSummary } from "@/lib/types";

export const learningSituations: LearningSituation[] = [
  {
    id: "sa1",
    code: "SA1",
    name: "SALUD Y CALIDAD DE VIDA",
    shortName: "Salud",
    description: "Entrenamiento, hábitos saludables, condición física y análisis de tu evolución.",
    progress: 68,
    href: "/alumno/sa1",
  },
  {
    id: "sa2",
    code: "SA2",
    name: "HABILIDADES MOTRICES ESPECÍFICAS Y DEPORTES",
    shortName: "Deportes",
    description: "Mejora habilidades específicas, toma decisiones y comprende la lógica del deporte.",
    progress: 42,
    href: "/alumno/sa2",
  },
  {
    id: "sa3",
    code: "SA3",
    name: "OCIO ACTIVO Y JUEGOS ALTERNATIVOS",
    shortName: "Ocio activo",
    description: "Explora propuestas activas, inclusivas y alternativas para disfrutar del movimiento.",
    progress: 16,
    href: "/alumno/sa3",
  },
];

export const recentActivities: Activity[] = [
  { id: "a1", title: "Registro de actividad semanal", situation: "SA1", date: "Hoy", status: "Completada" },
  { id: "a2", title: "Principios del entrenamiento", situation: "SA1", date: "Ayer", status: "Revisada" },
  { id: "a3", title: "Toma de decisiones en juego", situation: "SA2", date: "3 sep", status: "Completada" },
];

export const pendingActivities: Activity[] = [
  { id: "p1", title: "Diario de sensaciones", situation: "SA1", date: "12 sep", status: "Pendiente" },
  { id: "p2", title: "Análisis técnico individual", situation: "SA2", date: "16 sep", status: "Pendiente" },
];

export const students: StudentSummary[] = [
  { id: "s1", name: "Alumno 01", group: "1º Bach A", progress: 72, pending: 1, lastActivity: "Hoy" },
  { id: "s2", name: "Alumno 02", group: "1º Bach A", progress: 64, pending: 2, lastActivity: "Ayer" },
  { id: "s3", name: "Alumno 03", group: "1º Bach A", progress: 49, pending: 3, lastActivity: "4 sep" },
  { id: "s4", name: "Alumno 04", group: "1º Bach B", progress: 81, pending: 0, lastActivity: "Hoy" },
  { id: "s5", name: "Alumno 05", group: "1º Bach B", progress: 58, pending: 2, lastActivity: "2 sep" },
];
