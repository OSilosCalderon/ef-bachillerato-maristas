export type SecondYearSituationCode = "SA1" | "SA2" | "SA3" | "SA4" | "SA5" | "SA6";

export type SecondYearLearningSituation = {
  code: SecondYearSituationCode;
  slug: string;
  title: string;
  period: string;
  sessions: number;
  weeks: number;
  href: string;
};

export const secondYearLearningSituations: SecondYearLearningSituation[] = [
  {
    code: "SA1",
    slug: "sa1",
    title: "¿Cuál es mi punto de partida? Diseña tu propio plan de salud",
    period: "14 septiembre – mediados octubre",
    sessions: 16,
    weeks: 4,
    href: "/alumno/2bach/sa1",
  },
  {
    code: "SA2",
    slug: "sa2",
    title: "Entrenar con cabeza: construye tu condición física",
    period: "Mediados octubre – finales noviembre",
    sessions: 20,
    weeks: 5,
    href: "/alumno/2bach/sa2",
  },
  {
    code: "SA3",
    slug: "sa3",
    title: "Más que entrenar: hábitos para una vida saludable",
    period: "Diciembre – finales enero",
    sessions: 16,
    weeks: 4,
    href: "/alumno/2bach/sa3",
  },
  {
    code: "SA4",
    slug: "sa4",
    title: "Creamos un evento deportivo",
    period: "Febrero – primera mitad marzo",
    sessions: 20,
    weeks: 5,
    href: "/alumno/2bach/sa4",
  },
  {
    code: "SA5",
    slug: "sa5",
    title: "Extremadura se mueve: cultura, cuerpo y expresión",
    period: "Segunda mitad marzo – comienzos abril",
    sessions: 16,
    weeks: 4,
    href: "/alumno/2bach/sa5",
  },
  {
    code: "SA6",
    slug: "sa6",
    title: "Muévete por tu entorno: una comunidad más activa",
    period: "Abril – 27 abril",
    sessions: 16,
    weeks: 4,
    href: "/alumno/2bach/sa6",
  },
];

export const secondYearTransversalMargin = {
  label: "Margen transversal",
  sessions: "11 orientativas",
  description:
    "Diferencia entre las 115 clases del calendario autonómico y las 104 sesiones previstas en las SA. Se destina a evaluación, reajustes y actividades del centro; las cancelaciones locales pueden reducirla. Consulta la agenda para las fechas reales.",
};

export const secondYearPlannedSessions = secondYearLearningSituations.reduce(
  (total, situation) => total + situation.sessions,
  0,
);

export function getSecondYearLearningSituation(slug: string) {
  return secondYearLearningSituations.find((situation) => situation.slug === slug);
}
