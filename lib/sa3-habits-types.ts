export type HabitPlan = {
  focusHabit: string;
  initialReflection: string;
  objective: string;
  actionPlan: string;
  barrierStrategy: string;
  successIndicator: string;
  finalReflection: string;
  status: "draft" | "active" | "completed";
  activityDays?: ActivityDays;
};

export const habitKinds = [
  ["alimentacion", "Alimentación"],
  ["otro", "Otro hábito"],
] as const;
export type HabitKind = (typeof habitKinds)[number][0];

export const activityWeekdays = [
  ["lunes", "Lunes"], ["martes", "Martes"], ["miercoles", "Miércoles"], ["jueves", "Jueves"],
  ["viernes", "Viernes"], ["sabado", "Sábado"], ["domingo", "Domingo"],
] as const;
export type ActivityWeekday = (typeof activityWeekdays)[number][0];
export type ActivityLevel = "mas" | "menos";
export type ActivityDays = Partial<Record<ActivityWeekday, ActivityLevel>>;

export function activityDayNames(days: ActivityDays | undefined, level: ActivityLevel) {
  return activityWeekdays.filter(([day]) => days?.[day] === level).map(([, label]) => label.toLowerCase()).join(", ");
}

export const habitOptions = [
  ["rutina-general", "Organización de mi rutina"],
  ["sueno", "Regularidad del sueño"],
  ["movimiento", "Movimiento cotidiano"],
  ["sedentarismo", "Pausas de movimiento"],
  ["recuperacion", "Recuperación y descanso"],
  ["hidratacion", "Hidratación"],
  ["alimentacion", "Organización de una alimentación variada"],
  ["otro", "Otro (especificar)"],
] as const;

export const habitStatusLabels = { draft: "Borrador", active: "En marcha", completed: "Finalizado" };
export const habitLabel = (focus: string) => habitOptions.find(([key]) => key === focus)?.[1] ?? focus;

export const ratingFields = [
  ["sleepRoutine", "Rutina de sueño"],
  ["dailyMovement", "Movimiento diario"],
  ["sedentaryBreaks", "Pausas del sedentarismo"],
  ["recovery", "Recuperación"],
  ["hydration", "Hidratación"],
  ["balancedEating", "Alimentación variada"],
] as const;

export type RatingKey = (typeof ratingFields)[number][0];

export type WeeklyLog = Record<RatingKey, number | null> & {
  id?: string;
  weekNumber: number;
  goalCompletion: number;
  reflection: string;
  nextAdjustment: string;
};

export const emptyHabitPlan: HabitPlan = {
  focusHabit: "rutina-general",
  initialReflection: "",
  objective: "",
  actionPlan: "",
  barrierStrategy: "",
  successIndicator: "",
  finalReflection: "",
  status: "draft",
};

export const weekNumbers = [1, 2, 3, 4] as const;

export function emptyHabitWeek(weekNumber: number): WeeklyLog {
  return {
    weekNumber, sleepRoutine: null, dailyMovement: null, sedentaryBreaks: null,
    recovery: null, hydration: null, balancedEating: null, goalCompletion: 0,
    reflection: "", nextAdjustment: "",
  };
}

export type HabitChallengeData = {
  hasPlan: boolean;
  plan: HabitPlan;
  weeks: WeeklyLog[];
};

export type HabitWorkspaceData = {
  diaryKey: string;
  studentName: string;
  group: string;
  challenges: Record<HabitKind, HabitChallengeData>;
};

export type HabitWorkspaceStore = {
  load: () => Promise<HabitWorkspaceData>;
  savePlan: (kind: HabitKind, plan: HabitPlan) => Promise<void>;
  saveWeek: (kind: HabitKind, week: WeeklyLog) => Promise<string>;
};

export function readActivityDays(value: unknown): ActivityDays {
  if (!value || typeof value !== "object") return {};
  const days: ActivityDays = {};
  for (const [day] of activityWeekdays) {
    const level = (value as Record<string, unknown>)[day];
    if (level === "mas" || level === "menos") days[day] = level;
  }
  return days;
}

export function foodHabitRecord(row: Record<string, unknown> | null | undefined) {
  const value = row?.food_habit;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function hasOtherHabitPlan(row: Record<string, unknown>) {
  return !foodHabitRecord(row) || row.focus_habit !== emptyHabitPlan.focusHabit || row.status !== "draft" ||
    ["initial_reflection", "objective", "action_plan", "barrier_strategy", "success_indicator", "final_reflection"]
      .some((field) => Boolean(row[field]));
}

export function hasOtherHabitWeek(row: Record<string, unknown>) {
  return !foodHabitRecord(row) || Boolean(row.reflection);
}
