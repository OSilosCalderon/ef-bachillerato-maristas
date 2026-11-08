import { createClient } from "@/lib/supabase/client";
import {
  emptyHabitPlan, emptyHabitWeek, weekNumbers,
  type HabitPlan, type HabitWorkspaceStore, type WeeklyLog,
} from "@/lib/sa3-habits-types";

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

      const [planResult, weeksResult] = await Promise.all([
        supabase.from("healthy_habit_plans")
          .select("focus_habit,initial_reflection,objective,action_plan,barrier_strategy,success_indicator,final_reflection,status")
          .eq("student_id", student.id).eq("course_id", student.course_id).eq("sa_code", "SA3").maybeSingle(),
        supabase.from("healthy_habit_weekly_logs")
          .select("id,week_number,sleep_routine,daily_movement,sedentary_breaks,recovery,hydration,balanced_eating,goal_completion,reflection,next_adjustment")
          .eq("student_id", student.id).eq("course_id", student.course_id).eq("sa_code", "SA3").order("week_number"),
      ]);
      if (planResult.error || weeksResult.error) throw new Error("No se ha podido cargar el seguimiento. Vuelve a intentarlo.");

      const row = planResult.data;
      const plan: HabitPlan = row ? {
        focusHabit: row.focus_habit || emptyHabitPlan.focusHabit,
        initialReflection: row.initial_reflection ?? "",
        objective: row.objective ?? "",
        actionPlan: row.action_plan ?? "",
        barrierStrategy: row.barrier_strategy ?? "",
        successIndicator: row.success_indicator ?? "",
        finalReflection: row.final_reflection ?? "",
        status: row.status === "active" || row.status === "completed" ? row.status : "draft",
      } : { ...emptyHabitPlan };

      const weeks = weekNumbers.map((weekNumber): WeeklyLog => {
        const log = weeksResult.data?.find((item) => Number(item.week_number) === weekNumber);
        if (!log) return emptyHabitWeek(weekNumber);
        return {
          id: String(log.id), weekNumber,
          sleepRoutine: log.sleep_routine == null ? null : Number(log.sleep_routine),
          dailyMovement: log.daily_movement == null ? null : Number(log.daily_movement),
          sedentaryBreaks: log.sedentary_breaks == null ? null : Number(log.sedentary_breaks),
          recovery: log.recovery == null ? null : Number(log.recovery),
          hydration: log.hydration == null ? null : Number(log.hydration),
          balancedEating: log.balanced_eating == null ? null : Number(log.balanced_eating),
          goalCompletion: Number(log.goal_completion) || 0,
          reflection: log.reflection ?? "",
          nextAdjustment: log.next_adjustment ?? "",
        };
      });
      scope = { student_id: String(student.id), course_id: String(student.course_id), sa_code: "SA3" };
      return { diaryKey: "sa3-diario-v1:" + auth.user.id + ":" + scope.course_id, plan, weeks };
    },

    async savePlan(plan) {
      const { data, error } = await createClient().from("healthy_habit_plans").upsert({
        ...currentScope(),
        focus_habit: plan.focusHabit,
        initial_reflection: plan.initialReflection.trim(),
        objective: plan.objective.trim(),
        action_plan: plan.actionPlan.trim(),
        barrier_strategy: plan.barrierStrategy.trim(),
        success_indicator: plan.successIndicator.trim(),
        final_reflection: plan.finalReflection.trim(),
        status: plan.status,
        updated_at: new Date().toISOString(),
      }, { onConflict: "student_id,course_id,sa_code" }).select("status").single();
      if (error || !data || data.status !== plan.status) throw new Error("No se ha confirmado el guardado de la bitácora.");
    },

    async saveWeek(week) {
      const { data, error } = await createClient().from("healthy_habit_weekly_logs").upsert({
        ...currentScope(),
        week_number: week.weekNumber,
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
      }, { onConflict: "student_id,course_id,sa_code,week_number" }).select("id,week_number").single();
      if (error || !data?.id || Number(data.week_number) !== week.weekNumber) {
        throw new Error("No se ha confirmado el guardado de la semana.");
      }
      return String(data.id);
    },
  };
}
