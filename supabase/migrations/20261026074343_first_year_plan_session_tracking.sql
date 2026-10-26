-- Add SA1 follow-up for first year without altering existing diaries or second-year records.
create table public.first_year_plan_session_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  course_id uuid not null references public.courses(id),
  sa_code text not null default 'SA1' check (sa_code = 'SA1'),
  session_number smallint not null check (session_number between 1 and 8),
  week_number smallint not null check (week_number between 1 and 5),
  session_date date not null,
  objective text not null default '',
  activities text not null default '',
  duration_minutes smallint check (duration_minutes between 1 and 240),
  rpe smallint check (rpe between 1 and 10),
  completion_percent smallint not null default 100 check (completion_percent between 0 and 100),
  modifications text not null default '' check (length(modifications) <= 4000),
  reflection text not null default '' check (length(reflection) <= 4000),
  status text not null default 'completed' check (status in ('draft','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id,course_id,sa_code,session_number)
);
create index first_year_plan_logs_course_idx on public.first_year_plan_session_logs(course_id);

create function public.set_first_year_plan_session_date() returns trigger
language plpgsql set search_path = '' as $$
declare group_name text; planned date[];
begin
  select p.class_group into group_name from public.students s
    join public.profiles p on p.id=s.profile_id
    join public.courses c on c.id=s.course_id
    where s.id=new.student_id and s.course_id=new.course_id and s.active and c.is_active and c.bachillerato_year=1;
  if group_name in ('1ºA','1ºA Bachillerato') then
    planned:=array['2026-10-26','2026-10-29','2026-11-05','2026-11-09','2026-11-12','2026-11-16','2026-11-19','2026-11-23']::date[];
  elsif group_name in ('1ºB','1ºB Bachillerato') then
    planned:=array['2026-10-26','2026-10-30','2026-11-06','2026-11-09','2026-11-13','2026-11-16','2026-11-20','2026-11-23']::date[];
  else raise exception 'No se ha encontrado el calendario de 1ºA o 1ºB.';
  end if;
  if new.session_number not between 1 and 8 then raise exception 'Selecciona una de las ocho sesiones.'; end if;
  new.session_date:=planned[new.session_number];
  new.week_number:=1+(new.session_date-planned[1])/7;
  new.updated_at:=now();
  return new;
end $$;
create trigger first_year_plan_log_date before insert or update on public.first_year_plan_session_logs
for each row execute function public.set_first_year_plan_session_date();
revoke all on function public.set_first_year_plan_session_date() from public,anon,authenticated;

alter table public.first_year_plan_session_logs enable row level security;
revoke all on public.first_year_plan_session_logs from public,anon,authenticated;
grant select,insert,update on public.first_year_plan_session_logs to authenticated;
create policy first_year_plan_logs_read on public.first_year_plan_session_logs for select to authenticated
using (student_id=(select public.current_student_id()) or (select public.is_teacher()));
create policy first_year_plan_logs_insert on public.first_year_plan_session_logs for insert to authenticated
with check (student_id=(select public.current_student_id()) and (select public.current_user_role())='student'
and exists(select 1 from public.students s join public.courses c on c.id=s.course_id
where s.id=student_id and s.course_id=first_year_plan_session_logs.course_id and s.active and c.is_active and c.bachillerato_year=1));
create policy first_year_plan_logs_update on public.first_year_plan_session_logs for update to authenticated
using (student_id=(select public.current_student_id()) and (select public.current_user_role())='student')
with check (student_id=(select public.current_student_id()) and (select public.current_user_role())='student'
and exists(select 1 from public.students s join public.courses c on c.id=s.course_id
where s.id=student_id and s.course_id=first_year_plan_session_logs.course_id and s.active and c.is_active and c.bachillerato_year=1));

create table public.first_year_plan_session_grades (
  student_id uuid not null references public.students(id),
  session_number smallint not null check (session_number between 1 and 8),
  teacher_id uuid not null references public.profiles(id),
  teacher_score numeric(3,1) not null check (teacher_score between 0 and 10),
  teacher_comment text not null default '' check (length(teacher_comment)<=500),
  absent boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key(student_id,session_number)
);
create index first_year_plan_grades_teacher_idx on public.first_year_plan_session_grades(teacher_id);
alter table public.first_year_plan_session_grades enable row level security;
revoke all on public.first_year_plan_session_grades from public,anon,authenticated;
grant select,insert,update on public.first_year_plan_session_grades to authenticated;
create policy first_year_plan_grades_read on public.first_year_plan_session_grades for select to authenticated
using (student_id=(select public.current_student_id()) or (select public.is_teacher()));
create policy first_year_plan_grades_insert on public.first_year_plan_session_grades for insert to authenticated
with check ((select public.is_teacher()) and teacher_id=(select auth.uid())
and exists(select 1 from public.students s join public.courses c on c.id=s.course_id
where s.id=student_id and s.active and c.is_active and c.bachillerato_year=1));
create policy first_year_plan_grades_update on public.first_year_plan_session_grades for update to authenticated
using ((select public.is_teacher()))
with check ((select public.is_teacher()) and teacher_id=(select auth.uid())
and exists(select 1 from public.students s join public.courses c on c.id=s.course_id
where s.id=student_id and s.active and c.is_active and c.bachillerato_year=1));
