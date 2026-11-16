import { createClient } from "@/lib/supabase/client";
import {
  emptyHabitPlan, emptyHabitWeek, foodHabitRecord, hasOtherHabitPlan, hasOtherHabitWeek, readActivityDays, weekNumbers,
  type HabitKind, type HabitPlan, type HabitWorkspaceStore, type WeeklyLog,
} from "@/lib/sa3-habits-types";

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" ? value : "";
const rating = (value: unknown) => value == null ? null : Number(value);

function habitPlan(row: Row | null, kind: HabitKind): HabitPlan {
  return {
    focusHabit: kind === "alimentacion" ? kind : text(row?.focus_habit) || emptyHabitPlan.focusHabit,
    initialReflection: text(row?.initial_reflection),
    objective: text(row?.objective),
    actionPlan: text(row?.action_plan),
    barrierStrategy: text(row?.barrier_strategy),
    successIndicator: text(row?.success_indicator),
    finalReflection: text(row?.final_reflection),
    status: row?.status === "active" || row?.status === "completed" ? row.status : "draft",
    ...(kind === "alimentacion" ? { activityDays: readActivityDays(row?.activity_days) } : {}),
  };
}

function habitWeeks(rows: Row[], kind: HabitKind): WeeklyLog[] {
  return weekNumbers.map((weekNumber) => {
    const base = rows.find((row) => Number(row.week_number) === weekNumber);
    const log = kind === "alimentacion" ? foodHabitRecord(base) : base && hasOtherHabitWeek(base) ? base : null;
    if (!base || !log) return emptyHabitWeek(weekNumber);
    return {
      id: String(base.id), weekNumber,
      sleepRoutine: rating(log.sleep_routine), dailyMovement: rating(log.daily_movement),
      sedentaryBreaks: rating(log.sedentary_breaks), recovery: rating(log.recovery),
      hydration: rating(log.hydration), balancedEating: rating(log.balanced_eating),
      goalCompletion: Number(log.goal_completion) || 0,
      reflection: text(log.reflection), nextAdjustment: text(log.next_adjustment),
    };
  });
}

export function createSa3HabitsStore(): HabitWorkspaceStore {
  let scope: { student_id: string; course_id: string; sa_code: "SA3" } | null = null;

  function currentScope() {
    if (!scope) throw new Error("Vuelve a cargar tu bitácora antes de guardar.");
    return scope;
  }

  return {
    async load() {
      scope = null;
      const supabase = createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Inicia sesión para abrir tu bitácora.");

      const { data: student, error: studentError } = await supabase.from("students")
        .select("id,course_id,courses!inner(bachillerato_year,is_active)")
        .eq("profile_id", auth.user.id).eq("active", true)
        .eq("courses.bachillerato_year", 2).eq("courses.is_active", true).single();
      if (studentError || !student) throw new Error("No se ha encontrado tu perfil activo de 2º de Bachillerato.");

      const [planResult, weeksResult, profileResult] = await Promise.all([
        supabase.from("healthy_habit_plans")
          .select("focus_habit,initial_reflection,objective,action_plan,barrier_strategy,success_indicator,final_reflection,status,food_habit")
          .eq("student_id", student.id).eq("course_id", student.course_id).eq("sa_code", "SA3").maybeSingle(),
        supabase.from("healthy_habit_weekly_logs")
          .select("id,week_number,sleep_routine,daily_movement,sedentary_breaks,recovery,hydration,balanced_eating,goal_completion,reflection,next_adjustment,food_habit")
          .eq("student_id", student.id).eq("course_id", student.course_id).eq("sa_code", "SA3").order("week_number"),
        supabase.from("profiles").select("display_name,class_group").eq("id", auth.user.id).maybeSingle(),
      ]);
      if (planResult.error || weeksResult.error) throw new Error("No se ha podido cargar el seguimiento. Vuelve a intentarlo.");

      const row = planResult.data;
      const food = foodHabitRecord(row);
      const other = row && hasOtherHabitPlan(row) ? row : null;
      const rows = weeksResult.data ?? [];
      scope = { student_id: String(student.id), course_id: String(student.course_id), sa_code: "SA3" };
      return {
        diaryKey: "sa3-diario-v1:" + auth.user.id + ":" + scope.course_id,
        studentName: text(profileResult.data?.display_name).trim() || "Alumno/a",
        group: text(profileResult.data?.class_group).trim(),
        challenges: {
          alimentacion: { hasPlan: food != null, plan: habitPlan(food, "alimentacion"), weeks: habitWeeks(rows, "alimentacion") },
          otro: { hasPlan: other != null, plan: habitPlan(other, "otro"), weeks: habitWeeks(rows, "otro") },
        },
      };
    },

    async savePlan(kind, plan) {
      const values = {
        focus_habit: kind === "alimentacion" ? kind : plan.focusHabit,
        initial_reflection: plan.initialReflection.trim(),
        objective: plan.objective.trim(),
        action_plan: plan.actionPlan.trim(),
        barrier_strategy: plan.barrierStrategy.trim(),
        success_indicator: plan.successIndicator.trim(),
        final_reflection: plan.finalReflection.trim(),
        status: plan.status,
        updated_at: new Date().toISOString(),
      };
      const fields = kind === "alimentacion" ? { food_habit: { ...values, activity_days: readActivityDays(plan.activityDays) } } : values;
      const { data, error } = await createClient().from("healthy_habit_plans").upsert({
        ...currentScope(), ...fields,
      }, { onConflict: "student_id,course_id,sa_code", defaultToNull: false }).select("status,food_habit").single();
      const confirmed = kind === "alimentacion" ? foodHabitRecord(data) : data;
      if (error || !confirmed || confirmed.status !== plan.status) throw new Error("No se ha podido guardar el reto. Vuelve a intentarlo.");
    },

    async saveWeek(kind, week) {
      const values = {
        sleep_routine: week.sleepRoutine,
        daily_movement: week.dailyMovement,
        sedentary_breaks: week.sedentaryBreaks,
        recovery: week.recovery,
        hydration: week.hydration,
        balanced_eating: week.balancedEating,
        goal_completion: week.goalCompletion,
        reflection: week.reflection.trim(),
        next_adjustment: week.nextAdjustment.trim(),
        updated_at: new Date().toISOString(),
      };
      const fields = kind === "alimentacion" ? { food_habit: values } : values;
      const { data, error } = await createClient().from("healthy_habit_weekly_logs").upsert({
        ...currentScope(), week_number: week.weekNumber, ...fields,
      }, { onConflict: "student_id,course_id,sa_code,week_number", defaultToNull: false }).select("id,week_number,food_habit").single();
      if (error || !data?.id || Number(data.week_number) !== week.weekNumber ||
          (kind === "alimentacion" && !foodHabitRecord(data))) {
        throw new Error("No se ha podido guardar la semana. Vuelve a intentarlo.");
      }
      return String(data.id);
    },
  };
}
