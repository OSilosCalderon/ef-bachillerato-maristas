import type { PlanPdfData } from "./personal-plan-pdf";
import { activityDayNames, habitLabel, habitStatusLabels, type HabitKind, type HabitPlan, type WeeklyLog } from "./sa3-habits-types";

export function habitPdfData(kind: HabitKind, plan: HabitPlan, weeks: WeeklyLog[], studentName: string, group: string): PlanPdfData {
  const isFood = kind === "alimentacion";
  const pending = "Por completar";
  const habit = habitLabel(plan.focusHabit);
  const status = habitStatusLabels[plan.status];
  const courseLabel = "2º Bachillerato";
  const activityLines = isFood ? [
    "Días de mayor gasto: " + (activityDayNames(plan.activityDays, "mas") || "Sin marcar"),
    "Días de menor gasto: " + (activityDayNames(plan.activityDays, "menos") || "Sin marcar"),
  ] : [];
  return {
    studentName, courseLabel, group: group || courseLabel, status, capacity: habit,
    documentTitle: isFood ? "RETO DE ALIMENTACIÓN" : "RETO DE HÁBITOS",
    documentSubtitle: "SA3 · Más que entrenar",
    metaItems: [
      { label: "ESTADO", value: status },
      { label: "RETO", value: isFood ? "Alimentación" : "Otro hábito" },
      { label: "DURACIÓN", value: "Cuatro semanas" },
    ],
    sections: [
      { title: "1. Punto de partida", lines: [habit, plan.initialReflection || pending, ...activityLines] },
      { title: "2. Objetivo y acción", lines: ["Objetivo: " + (plan.objective || pending), "Señal y acción: " + (plan.actionPlan || pending)] },
      { title: "3. Alternativa e indicador", lines: ["Obstáculo y alternativa: " + (plan.barrierStrategy || pending), "Indicador: " + (plan.successIndicator || pending)] },
      { title: "4. Seguimiento semanal", lines: weeks.length ? weeks.flatMap((week) => [
        `• Semana ${week.weekNumber} - ${week.goalCompletion} % de las ocasiones observadas`,
        week.reflection,
        ...(week.nextAdjustment ? ["Ajuste: " + week.nextAdjustment] : []),
      ]) : ["Los registros semanales se añadirán al guardar el seguimiento."] },
      { title: "5. Balance y próximo paso", lines: [plan.finalReflection || pending] },
    ],
  };
}
