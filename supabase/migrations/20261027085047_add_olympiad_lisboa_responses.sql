-- New event-only responses. No changes to assessments, grades or existing student records.
create table public.olympiad_lisboa_2027_responses (
  student_id uuid primary key references public.students(id),
  participating boolean not null,
  gender text check (gender in ('femenino','masculino','otra-identidad','no-indicado')),
  first_choice text check (first_choice in ('futbol-sala','baloncesto','voleibol','atletismo-longitud','atletismo-2000','atletismo-peso','tenis-mesa','badminton','natacion-libres','natacion-espalda','natacion-mariposa','gimnasia-suelo','gimnasia-minitrampolin')),
  second_choice text check (second_choice in ('futbol-sala','baloncesto','voleibol','atletismo-longitud','atletismo-2000','atletismo-peso','tenis-mesa','badminton','natacion-libres','natacion-espalda','natacion-mariposa','gimnasia-suelo','gimnasia-minitrampolin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint olympiad_answer_shape check (
    (not participating and gender is null and first_choice is null and second_choice is null)
    or (participating and gender is not null and first_choice is not null and second_choice is not null and first_choice <> second_choice)
  )
);
alter table public.olympiad_lisboa_2027_responses enable row level security;
revoke all on public.olympiad_lisboa_2027_responses from public,anon,authenticated;
grant select on public.olympiad_lisboa_2027_responses to authenticated;
grant insert (student_id,participating,gender,first_choice,second_choice), update (student_id,participating,gender,first_choice,second_choice) on public.olympiad_lisboa_2027_responses to authenticated;

create policy olympiad_lisboa_read on public.olympiad_lisboa_2027_responses for select to authenticated
using ((student_id = (select public.current_student_id()) or (select public.is_teacher()))
and exists (select 1 from public.students s join public.courses c on c.id=s.course_id
where s.id=student_id and s.active and c.is_active and c.bachillerato_year=1 and c.academic_year='2026-2027'));

create policy olympiad_lisboa_insert on public.olympiad_lisboa_2027_responses for insert to authenticated
with check (student_id = (select public.current_student_id()) and (select public.current_user_role())='student'
and exists (select 1 from public.students s join public.courses c on c.id=s.course_id
where s.id=student_id and s.active and c.is_active and c.bachillerato_year=1 and c.academic_year='2026-2027'));

create policy olympiad_lisboa_update on public.olympiad_lisboa_2027_responses for update to authenticated
using (student_id = (select public.current_student_id()) and (select public.current_user_role())='student')
with check (student_id = (select public.current_student_id()) and (select public.current_user_role())='student'
and exists (select 1 from public.students s join public.courses c on c.id=s.course_id
where s.id=student_id and s.active and c.is_active and c.bachillerato_year=1 and c.academic_year='2026-2027'));

create function public.stamp_olympiad_lisboa_response() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger olympiad_lisboa_response_stamp before insert or update on public.olympiad_lisboa_2027_responses
for each row execute function public.stamp_olympiad_lisboa_response();
revoke all on function public.stamp_olympiad_lisboa_response() from public,anon,authenticated;
