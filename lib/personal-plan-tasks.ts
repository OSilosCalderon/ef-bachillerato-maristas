export type PlanExercise = {
  id: string; exerciseId: string; activity: string; description: string;
  capacity: string; dose: string; recovery: string;
};

export type PlanItem = {
  id: string; activity: string; sessionDate: string; day: string; goal: string;
  methodology: "circuit" | "total" | "custom";
  rounds: string; roundRecovery: string; exercises: PlanExercise[];
};

export const methodologyLabels = { circuit: "Circuit training", total: "Total training", custom: "Trabajo específico" };
const text = (value: unknown) => typeof value === "string" ? value : "";
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

export function emptyExercise(): PlanExercise {
  return { id: crypto.randomUUID(), exerciseId: "", activity: "", description: "", capacity: "condicion-fisica-general", dose: "", recovery: "" };
}

export function normalizeItems(value: unknown): PlanItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(record).map((item) => ({
    id: text(item.id) || crypto.randomUUID(), activity: text(item.activity),
    sessionDate: text(item.sessionDate), day: text(item.day), goal: text(item.goal) || "1",
    methodology: item.methodology === "circuit" || item.methodology === "total" ? item.methodology : "custom",
    rounds: text(item.rounds) || "1", roundRecovery: text(item.roundRecovery),
    // Older plans stored a single exercise at task level. Keep every field and dose.
    exercises: (Array.isArray(item.exercises) ? item.exercises : [item]).filter(record).map((exercise) => ({
      id: text(exercise.id) || crypto.randomUUID(), exerciseId: text(exercise.exerciseId),
      activity: text(exercise.activity), description: text(exercise.description),
      capacity: text(exercise.capacity) || "condicion-fisica-general",
      dose: text(exercise.dose), recovery: text(exercise.recovery),
    })),
  }));
}

export function cleanPlanItems(items: PlanItem[], hasSecondGoal: boolean): PlanItem[] {
  return items.map((item) => ({
    ...item, activity: item.activity.trim(), goal: hasSecondGoal ? item.goal : "1",
    exercises: item.exercises.map((exercise) => ({ ...exercise, activity: exercise.activity.trim(), dose: exercise.dose.trim(), recovery: exercise.recovery.trim() })),
  }));
}
