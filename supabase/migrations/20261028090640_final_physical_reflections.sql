-- Separate instrument: do not replace the existing personal-plan reflection.
create table public.physical_final_reflections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students(id),
  course_id uuid not null references public.courses(id),
  course_year smallint not null check (course_year in (1,2)),
  sa_code text not null,
  results_analysis text not null default '' check (char_length(results_analysis) <= 3000),
  goal_review text not null default '' check (char_length(goal_review) <= 3000),
  personal_learning text not null default '' check (char_length(personal_learning) <= 3000),
  future_motivation text not null default '' check (char_length(future_motivation) <= 3000),
  status text not null default 'draft' check (status in ('draft','submitted')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((course_year=1 and sa_code='SA1') or (course_year=2 and sa_code='SA2')),
  check (status <> 'submitted' or (
    char_length(btrim(results_analysis)) > 0 and char_length(btrim(goal_review)) > 0
    and char_length(btrim(personal_learning)) > 0 and char_length(btrim(future_motivation)) > 0
  ))
);
create index physical_final_reflections_course_idx on public.physical_final_reflections(course_id);
alter table public.physical_final_reflections enable row level security;
revoke all on public.physical_final_reflections from public, anon, authenticated;
grant select on public.physical_final_reflections to authenticated;
grant insert (student_id,course_id,course_year,sa_code,results_analysis,goal_review,personal_learning,future_motivation,status),
  update (student_id,course_id,course_year,sa_code,results_analysis,goal_review,personal_learning,future_motivation,status)
  on public.physical_final_reflections to authenticated;

create policy physical_final_reflection_read on public.physical_final_reflections
for select to authenticated using (student_id=(select public.current_student_id()) or (select public.is_teacher()));
create policy physical_final_reflection_insert on public.physical_final_reflections
for insert to authenticated with check (
  student_id=(select public.current_student_id()) and (select public.current_user_role())='student'
  and exists (select 1 from public.students s join public.courses c on c.id=s.course_id
    join public.learning_situations ls on ls.course_id=c.id
    where s.id=physical_final_reflections.student_id and s.active and c.is_active
    and c.id=physical_final_reflections.course_id and c.bachillerato_year=physical_final_reflections.course_year
    and ls.code=physical_final_reflections.sa_code and ls.published)
);
create policy physical_final_reflection_update on public.physical_final_reflections
for update to authenticated using (student_id=(select public.current_student_id()) and (select public.current_user_role())='student')
with check (
  student_id=(select public.current_student_id()) and (select public.current_user_role())='student'
  and exists (select 1 from public.students s join public.courses c on c.id=s.course_id
    join public.learning_situations ls on ls.course_id=c.id
    where s.id=physical_final_reflections.student_id and s.active and c.is_active
    and c.id=physical_final_reflections.course_id and c.bachillerato_year=physical_final_reflections.course_year
    and ls.code=physical_final_reflections.sa_code and ls.published)
);
create function public.stamp_physical_final_reflection() returns trigger
language plpgsql set search_path='' as $$
begin
  new.updated_at=now();
  new.submitted_at=case when new.status='submitted' then now() else null end;
  return new;
end;
$$;
revoke all on function public.stamp_physical_final_reflection() from public,anon,authenticated;
create trigger physical_final_reflection_stamp before insert or update on public.physical_final_reflections
for each row execute function public.stamp_physical_final_reflection();

insert into public.assessment_grade_items(course_id,sa_code,item_key,title,position)
select c.id,case when c.bachillerato_year=1 then 'SA1' else 'SA2' end,
  'final-physical-reflection','Reflexión personal y motivaciones de futuro',90
from public.courses c
where c.is_active and c.bachillerato_year in (1,2)
  and exists (select 1 from public.learning_situations ls where ls.course_id=c.id and ls.code=case when c.bachillerato_year=1 then 'SA1' else 'SA2' end)
on conflict (course_id,sa_code,item_key) do nothing;
