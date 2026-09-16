alter table public.personal_training_plans
  add column if not exists final_conclusions text not null default '',
  add column if not exists future_work text not null default '';

comment on column public.personal_training_plans.final_conclusions is 'Personal conclusions written after completing the SA1 training plan.';
comment on column public.personal_training_plans.future_work is 'Physical capacities or habits the student wants to continue developing.';
