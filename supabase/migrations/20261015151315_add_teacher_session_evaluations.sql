create table public.training_session_evaluations (
  session_log_id uuid primary key references public.training_session_logs(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id),
  teacher_score numeric(3,1) not null check (teacher_score >= 0 and teacher_score <= 10 and teacher_score = trunc(teacher_score, 1)),
  teacher_comment text not null default '' check (char_length(teacher_comment) <= 500),
  updated_at timestamptz not null default now()
);

create index training_session_evaluations_student_id_idx on public.training_session_evaluations(student_id);

alter table public.training_session_evaluations enable row level security;
revoke all on public.training_session_evaluations from anon, public;
grant select, insert, update on public.training_session_evaluations to authenticated;

drop policy if exists training_session_evaluations_select_own_or_teacher on public.training_session_evaluations;
create policy training_session_evaluations_select_own_or_teacher
on public.training_session_evaluations for select
to authenticated
using (student_id = (select public.current_student_id()) or (select public.is_teacher()));

drop policy if exists training_session_evaluations_insert_teacher on public.training_session_evaluations;
create policy training_session_evaluations_insert_teacher
on public.training_session_evaluations for insert
to authenticated
with check (
  (select public.is_teacher())
  and teacher_id = (select auth.uid())
  and exists (
    select 1
    from public.training_session_logs as session_log
    join public.courses as course on course.id = session_log.course_id
    where session_log.id = session_log_id
      and session_log.student_id = training_session_evaluations.student_id
      and session_log.sa_code = 'SA2'
      and session_log.session_number between 1 and 10
      and course.bachillerato_year = 2
  )
);

drop policy if exists training_session_evaluations_update_teacher on public.training_session_evaluations;
create policy training_session_evaluations_update_teacher
on public.training_session_evaluations for update
to authenticated
using ((select public.is_teacher()))
with check (
  (select public.is_teacher())
  and teacher_id = (select auth.uid())
  and exists (
    select 1
    from public.training_session_logs as session_log
    join public.courses as course on course.id = session_log.course_id
    where session_log.id = session_log_id
      and session_log.student_id = training_session_evaluations.student_id
      and session_log.sa_code = 'SA2'
      and session_log.session_number between 1 and 10
      and course.bachillerato_year = 2
  )
);

