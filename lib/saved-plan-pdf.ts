import type { PlanPdfData } from "./personal-plan-pdf";
import { methodologyLabels, normalizeItems } from "./personal-plan-tasks";
import { SECOND_YEAR_PLAN_SESSIONS } from "./second-year-personal-plan-calendar";

function planText(value: unknown, fallback = "Sin completar") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function formatPlanSessionDate(value: string) {
  if (!value) return "fecha pendiente";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(date);
}

export function savedPlanPdfData(plan: Record<string, unknown>, student: { name: string; group: string }, year: 1 | 2): PlanPdfData {
  const items = normalizeItems(plan.plan_items);
  const calendar = year === 2 ? SECOND_YEAR_PLAN_SESSIONS.map((session) => session.date) : [];
  const dates = [...new Set([...calendar, ...items.map((item) => item.sessionDate)])];
  const taskLines = dates.flatMap((date, index) => {
    const session = year === 1 || index < calendar.length ? `Sesión ${index + 1}` : "Tarea de otra fecha";
    const heading = `${session} - ${formatPlanSessionDate(date)}`;
    const tasks = items.filter((item) => item.sessionDate === date);
    if (!tasks.length) return [`• ${heading} - Sin tareas asignadas`];
    return tasks.flatMap((item) => [
      `• ${heading} - ${item.activity || "Tarea"} - ${methodologyLabels[item.methodology]} - ${item.rounds} serie(s)${item.roundRecovery ? ` - descanso entre series: ${item.roundRecovery} min` : ""}`,
      ...(item.materials.length || item.customMaterials.trim() ? [`  Materiales: ${[...item.materials, item.customMaterials.trim()].filter(Boolean).join(", ")}`] : []),
      ...item.exercises.map((exercise, exerciseIndex) => `  ${exerciseIndex + 1}. ${exercise.activity || "Ejercicio por concretar"}${exercise.dose ? ` - ${exercise.dose}` : ""}${exercise.recovery ? ` - descanso ${exercise.recovery}` : ""}`),
    ]);
  });
  const status = plan.status === "completed" ? "Finalizado" : plan.status === "active" ? "En marcha" : "Borrador";
  const capacity = planText(plan.priority_capacity, "condicion-fisica-general").replaceAll("-", " ");
  const duration = plan.duration_weeks ?? (year === 2 ? 3 : 4);
  const frequency = plan.weekly_frequency ?? (year === 2 ? 4 : 2);
  return {
    studentName: student.name,
    courseLabel: `${year}º Bachillerato`,
    group: student.group,
    status,
    capacity,
    sections: [
      { title: "1. Punto de partida", lines: [planText(plan.initial_analysis)] },
      { title: "2. Objetivos y temporalización", lines: [`Objetivo principal: ${planText(plan.objective)}`, `Cómo comprobaré mi objetivo principal: ${planText(plan.success_indicator)}`, ...(planText(plan.secondary_objective, "") ? [`Segundo objetivo: ${planText(plan.secondary_objective)}`, `Indicador del segundo objetivo: ${planText(plan.secondary_success_indicator)}`] : []), `${duration} semanas - ${frequency} sesiones/semana - ${plan.session_duration_minutes ?? 55} min por sesión`] },
      { title: "3. Calendario, tareas y cargas", lines: taskLines.length ? taskLines : ["• Sin sesiones planificadas"] },
      { title: "4. Progresión y recuperación", lines: [`Progresión: ${planText(plan.progression_strategy)}`, `Recuperación: ${planText(plan.recovery_strategy)}`] },
      { title: "5. Reflexión final", lines: [`Conclusiones: ${planText(plan.final_conclusions, "Pendiente al finalizar el plan")}`, `Qué quiero seguir trabajando: ${planText(plan.future_work, "Pendiente al finalizar el plan")}`] },
    ],
  };
}
