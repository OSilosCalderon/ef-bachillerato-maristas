export const reflectionFields = [
  { key: "results_analysis", title: "¿Cómo ha evolucionado mi condición física?", help: "Compara tus resultados iniciales y finales. Cita al menos una prueba o capacidad y explica qué ha cambiado, también si no has mejorado." },
  { key: "goal_review", title: "¿He conseguido mis objetivos?", help: "Recupera el objetivo principal y su indicador. Explica con datos si lo has conseguido, parcialmente o todavía no, y qué aspectos del plan han influido." },
  { key: "personal_learning", title: "¿Qué he aprendido y cómo me siento?", help: "Explica tus conclusiones, las dificultades y las sensaciones al finalizar. Valora lo que te ha ayudado a participar y a mantener el esfuerzo." },
  { key: "future_motivation", title: "¿Qué me motiva a seguir y qué haré a partir de ahora?", help: "Propón una actividad u objetivo que te interese, acciones concretas para continuar y cómo afrontarás una dificultad que pueda aparecer." },
] as const;
export type ReflectionKey = typeof reflectionFields[number]["key"];
export type ReflectionAnswer = Record<ReflectionKey, string> & { status: "draft" | "submitted" };
export type FinalPhysicalReflection = ReflectionAnswer & { student_id: string; course_id: string; course_year: 1 | 2; sa_code: "SA1" | "SA2"; updated_at: string; submitted_at: string | null };
export const emptyReflection: ReflectionAnswer = { results_analysis: "", goal_review: "", personal_learning: "", future_motivation: "", status: "draft" };
export function reflectionPath(year: 1 | 2) { return year === 1 ? "/alumno/sa1/reflexion-final" : "/alumno/2bach/sa2/reflexion-final"; }
export function validateReflection(input: unknown): ReflectionAnswer {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Revisa tu reflexión.");
  const value = input as Record<string, unknown>;
  if (value.status !== "draft" && value.status !== "submitted") throw new Error("Elige guardar borrador o enviar la reflexión.");
  const answer = { ...emptyReflection, status: value.status } as ReflectionAnswer;
  for (const field of reflectionFields) {
    if (typeof value[field.key] !== "string") throw new Error("Revisa los apartados de la reflexión.");
    const text = (value[field.key] as string).trim();
    if (text.length > 3000) throw new Error("Cada apartado admite un máximo de 3000 caracteres.");
    if (value.status === "submitted" && !text) throw new Error("Completa los cuatro apartados antes de enviar. Puedes guardar un borrador para continuar después.");
    answer[field.key] = text;
  }
  if (!reflectionFields.some((field) => answer[field.key])) throw new Error("Escribe al menos una respuesta antes de guardar el borrador.");
  return answer;
}
