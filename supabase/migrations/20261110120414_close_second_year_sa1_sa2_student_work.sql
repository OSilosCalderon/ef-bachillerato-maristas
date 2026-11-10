alter table public.courses add column sa1_sa2_student_work_closed boolean not null default false;

comment on column public.courses.sa1_sa2_student_work_closed is
  'Closes student editing for readings, quizzes, personal plans, session reviews and final reflections in second-year SA1 and SA2.';

-- Read the authenticated pupil's own course. This function retains the caller's RLS.
create function public.second_year_sa1_sa2_work_closed()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.students as student
    join public.courses as course on course.id = student.course_id
    where student.id = (select public.current_student_id())
      and course.bachillerato_year = 2
      and course.sa1_sa2_student_work_closed
  );
$$;

revoke all on function public.second_year_sa1_sa2_work_closed() from public, anon;
grant execute on function public.second_year_sa1_sa2_work_closed() to authenticated;

-- Restrictive write policies preserve the existing ownership and read policies.
create policy student_work_open_insert on public.theory_topic_progress
  as restrictive for insert to authenticated
  with check (not (topic_slug ~ '^2bach-sa[12]-' and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_update on public.theory_topic_progress
  as restrictive for update to authenticated
  using (not (topic_slug ~ '^2bach-sa[12]-' and (select public.second_year_sa1_sa2_work_closed())))
  with check (not (topic_slug ~ '^2bach-sa[12]-' and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_insert on public.personal_training_plans
  as restrictive for insert to authenticated
  with check (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_update on public.personal_training_plans
  as restrictive for update to authenticated
  using (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())))
  with check (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_delete on public.personal_training_plans
  as restrictive for delete to authenticated
  using (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_insert on public.training_session_logs
  as restrictive for insert to authenticated
  with check (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_update on public.training_session_logs
  as restrictive for update to authenticated
  using (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())))
  with check (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_delete on public.training_session_logs
  as restrictive for delete to authenticated
  using (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_insert on public.physical_final_reflections
  as restrictive for insert to authenticated
  with check (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

create policy student_work_open_update on public.physical_final_reflections
  as restrictive for update to authenticated
  using (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())))
  with check (not (sa_code in ('SA1', 'SA2') and (select public.second_year_sa1_sa2_work_closed())));

update public.courses
set sa1_sa2_student_work_closed = true
where bachillerato_year = 2 and is_active;
