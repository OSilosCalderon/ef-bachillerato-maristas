-- Extend teacher grading without modifying previous notes or student logs.
alter table public.training_session_grades add column absent boolean not null default false;

create or replace view public.training_session_grade_results with (security_invoker = true) as
select distinct on (student_id,session_number)
  student_id,session_number,teacher_score,teacher_comment,updated_at,absent
from (
  select student_id,session_number,teacher_score,teacher_comment,updated_at,absent,1 as source_priority
  from public.training_session_grades
  union all
  select e.student_id,l.session_number,e.teacher_score,e.teacher_comment,e.updated_at,false as absent,0 as source_priority
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
