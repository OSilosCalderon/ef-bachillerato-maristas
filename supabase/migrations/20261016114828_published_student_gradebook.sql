create table public.assessment_grade_items (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id),
  sa_code text not null check (sa_code in ('SA1','SA2','SA3','SA4','SA5','SA6')),
  item_key text not null check (char_length(item_key) between 1 and 100),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  position integer not null default 50,
  created_by uuid references public.profiles(id),
  unique (course_id, sa_code, item_key)
);
create unique index assessment_grade_items_title_idx on public.assessment_grade_items(course_id,sa_code,lower(title));
create index assessment_grade_items_creator_idx on public.assessment_grade_items(created_by);

create table public.student_assessment_grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  item_id uuid not null references public.assessment_grade_items(id),
  teacher_id uuid not null references public.profiles(id),
  score numeric not null check (score >= 0 and score <= 10 and score = round(score,1)),
  comment text not null default '' check (char_length(comment) <= 500),
  published_at timestamptz not null default now(),
  unique (student_id,item_id)
);
create index student_assessment_grades_item_idx on public.student_assessment_grades(item_id);
create index student_assessment_grades_teacher_idx on public.student_assessment_grades(teacher_id);

alter table public.assessment_grade_items enable row level security;
alter table public.student_assessment_grades enable row level security;
revoke all on public.assessment_grade_items, public.student_assessment_grades from anon, public;
grant select,insert on public.assessment_grade_items to authenticated;
grant select,insert,update on public.student_assessment_grades to authenticated;

create policy assessment_items_read_course_or_teacher on public.assessment_grade_items
for select to authenticated using (
  (select public.is_teacher()) or course_id in (
    select course_id from public.students where id = (select public.current_student_id()) and active
  )
);
create policy assessment_items_insert_teacher on public.assessment_grade_items
for insert to authenticated with check (
  (select public.is_teacher()) and created_by = (select auth.uid())
  and exists (select 1 from public.learning_situations s join public.courses c on c.id=s.course_id
    where s.course_id=assessment_grade_items.course_id and s.code=assessment_grade_items.sa_code and c.is_active)
);

create policy assessment_grades_read_own_or_teacher on public.student_assessment_grades
for select to authenticated using (student_id = (select public.current_student_id()) or (select public.is_teacher()));
create policy assessment_grades_insert_teacher on public.student_assessment_grades
for insert to authenticated with check (
  (select public.is_teacher()) and teacher_id = (select auth.uid())
  and exists (select 1 from public.students s join public.assessment_grade_items i on i.course_id=s.course_id
    join public.courses c on c.id=s.course_id
    where s.id=student_assessment_grades.student_id and i.id=student_assessment_grades.item_id and s.active and c.is_active)
);
create policy assessment_grades_update_teacher on public.student_assessment_grades
for update to authenticated using ((select public.is_teacher())) with check (
  (select public.is_teacher()) and teacher_id = (select auth.uid())
  and exists (select 1 from public.students s join public.assessment_grade_items i on i.course_id=s.course_id
    join public.courses c on c.id=s.course_id
    where s.id=student_assessment_grades.student_id and i.id=student_assessment_grades.item_id and s.active and c.is_active)
);

insert into public.assessment_grade_items(course_id,sa_code,item_key,title,position)
select c.id, d.sa_code, d.item_key, d.title, d.position
from public.courses c cross join (values
  ('SA1','initial-assessment','Evaluación inicial',1),
  ('SA1','theory-self-assessment','Bloque teórico · Autoevaluación',2),
  ('SA1','personal-plan','Plan personal',3),
  ('SA1','questionnaire-completion','Realización de cuestionarios',4),
  ('SA2','final-physical-tests','Tests de evaluación final',1),
  ('SA2','session-follow-up','Seguimiento de las sesiones',2),
  ('SA2','theory-self-assessment','Bloque teórico · Autoevaluación',3)
) as d(sa_code,item_key,title,position)
where c.bachillerato_year=2 and c.is_active
on conflict (course_id,sa_code,item_key) do nothing;
