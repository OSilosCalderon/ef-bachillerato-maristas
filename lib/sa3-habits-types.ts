export type HabitPlan = {
  focusHabit: string;
  initialReflection: string;
  objective: string;
  actionPlan: string;
  barrierStrategy: string;
  successIndicator: string;
  finalReflection: string;
  status: "draft" | "active" | "completed";
};

export const habitOptions = [
  ["rutina-general", "Organización de mi rutina"],
  ["sueno", "Regularidad del sueño"],
  ["movimiento", "Movimiento cotidiano"],
  ["sedentarismo", "Pausas de movimiento"],
  ["recuperacion", "Recuperación y descanso"],
  ["hidratacion", "Hidratación"],
  ["alimentacion", "Organización de una alimentación variada"],
] as const;

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

export type HabitWorkspaceData = {
  diaryKey: string;
  plan: HabitPlan;
  weeks: WeeklyLog[];
};

export type HabitWorkspaceStore = {
  load: () => Promise<HabitWorkspaceData>;
  savePlan: (plan: HabitPlan) => Promise<void>;
  saveWeek: (week: WeeklyLog) => Promise<string>;
};
