-- Keep existing evaluations untouched and store planned-session grades independently.
create table public.training_session_grades (
  student_id uuid not null references public.students(id) on delete cascade,
  session_number smallint not null check (session_number between 1 and 10),
  teacher_id uuid not null references public.profiles(id),
  teacher_score numeric(3,1) not null check (teacher_score between 0 and 10),
  teacher_comment text not null default '' check (char_length(teacher_comment) <= 500),
  updated_at timestamptz not null default now(),
  primary key (student_id, session_number)
);
create index training_session_grades_teacher_id_idx on public.training_session_grades(teacher_id);
alter table public.training_session_grades enable row level security;
revoke all on public.training_session_grades from public, anon;
grant select, insert, update on public.training_session_grades to authenticated;

create policy training_session_grades_select_own_or_teacher
on public.training_session_grades for select to authenticated
using (student_id = (select public.current_student_id()) or (select public.is_teacher()));
create policy training_session_grades_insert_teacher
on public.training_session_grades for insert to authenticated
with check (
  (select public.is_teacher()) and teacher_id = (select auth.uid())
  and exists (
    select 1 from public.students s join public.courses c on c.id = s.course_id
    where s.id = training_session_grades.student_id and s.active and c.is_active and c.bachillerato_year = 2
  )
);
create policy training_session_grades_update_teacher
on public.training_session_grades for update to authenticated
using ((select public.is_teacher()))
with check (
  (select public.is_teacher()) and teacher_id = (select auth.uid())
  and exists (
    select 1 from public.students s join public.courses c on c.id = s.course_id
    where s.id = training_session_grades.student_id and s.active and c.is_active and c.bachillerato_year = 2
  )
);

-- Copy grades so they survive any later deletion of the student's log.
insert into public.training_session_grades(student_id,session_number,teacher_id,teacher_score,teacher_comment,updated_at)
select e.student_id,l.session_number,e.teacher_id,e.teacher_score,e.teacher_comment,e.updated_at
from public.training_session_evaluations e
join public.training_session_logs l on l.id = e.session_log_id
join public.students s on s.id = e.student_id
join public.courses c on c.id = s.course_id
where l.student_id = e.student_id and l.course_id = s.course_id
  and l.sa_code = 'SA2' and l.session_number between 1 and 10 and c.bachillerato_year = 2;

-- Old browser tabs may still save to the previous table during deployment.
-- Read both sources, choosing the latest teacher assessment for each slot.
create view public.training_session_grade_results with (security_invoker = true) as
select distinct on (student_id,session_number)
  student_id,session_number,teacher_score,teacher_comment,updated_at
from (
  select student_id,session_number,teacher_score,teacher_comment,updated_at,1 as source_priority
  from public.training_session_grades
  union all
  select e.student_id,l.session_number,e.teacher_score,e.teacher_comment,e.updated_at,0 as source_priority
  from public.training_session_evaluations e
  join public.training_session_logs l on l.id = e.session_log_id
  join public.students s on s.id = e.student_id
  join public.courses c on c.id = s.course_id
  where l.student_id = e.student_id and l.course_id = s.course_id
    and l.sa_code = 'SA2' and l.session_number between 1 and 10 and c.bachillerato_year = 2
) grades
order by student_id,session_number,updated_at desc,source_priority desc;
revoke all on public.training_session_grade_results from public, anon;
grant select on public.training_session_grade_results to authenticated;
