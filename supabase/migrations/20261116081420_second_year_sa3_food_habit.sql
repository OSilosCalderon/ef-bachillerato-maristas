begin;

-- Keep the original keys usable by clients that already have the notebook open.
-- Each challenge update writes only its own fields.
alter table public.healthy_habit_plans
  add column food_habit jsonb check (
    food_habit is null or (
      sa_code = 'SA3' and jsonb_typeof(food_habit) = 'object'
      and food_habit ?& array['focus_habit', 'status']
      and food_habit ->> 'focus_habit' = 'alimentacion'
      and food_habit ->> 'status' in ('draft', 'active', 'completed')
    )
  );

alter table public.healthy_habit_weekly_logs
  add column food_habit jsonb check (
    food_habit is null or (
      sa_code = 'SA3' and jsonb_typeof(food_habit) = 'object'
      and food_habit ?& array['goal_completion', 'reflection']
      and jsonb_typeof(food_habit -> 'goal_completion') = 'number'
      and jsonb_typeof(food_habit -> 'reflection') = 'string'
    )
  );

-- Existing food challenges and their weeks reopen in Alimentación.
update public.healthy_habit_weekly_logs as week
set food_habit = to_jsonb(week) - array['id','student_id','course_id','sa_code','food_habit'],
    sleep_routine = null, daily_movement = null, sedentary_breaks = null,
    recovery = null, hydration = null, balanced_eating = null, goal_completion = 0,
    reflection = '', next_adjustment = ''
from public.healthy_habit_plans as plan
join public.courses as course on course.id = plan.course_id and course.bachillerato_year = 2
where week.student_id = plan.student_id and week.course_id = plan.course_id
  and week.sa_code = plan.sa_code and plan.sa_code = 'SA3' and plan.focus_habit = 'alimentacion';

update public.healthy_habit_plans as plan
set food_habit = to_jsonb(plan) - array['id','student_id','course_id','sa_code','food_habit'],
    focus_habit = 'rutina-general', initial_reflection = '', objective = '', action_plan = '',
    barrier_strategy = '', success_indicator = '', final_reflection = '', status = 'draft'
from public.courses as course
where plan.course_id = course.id and course.bachillerato_year = 2
  and plan.sa_code = 'SA3' and plan.focus_habit = 'alimentacion';

commit;
