create table public.sa4_delegations (
  course_id uuid not null references public.courses(id),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  country text not null,
  members text[] not null check (cardinality(members) between 1 and 4),
  position integer not null,
  primary key (course_id, country_code)
);

alter table public.sa4_delegations enable row level security;
revoke all on public.sa4_delegations from public, anon, authenticated;
grant select on public.sa4_delegations to authenticated;

create policy sa4_delegations_read on public.sa4_delegations
for select to authenticated using (
  (select public.is_teacher()) or exists (
    select 1 from public.students student
    join public.learning_situations situation on situation.course_id = student.course_id
    where student.id = (select public.current_student_id())
      and student.course_id = sa4_delegations.course_id
      and situation.code = 'SA4'
      and situation.published
  )
);
