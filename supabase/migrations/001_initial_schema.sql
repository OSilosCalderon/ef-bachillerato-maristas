-- EF de 1º Bachillerato · Maristas Badajoz
-- Initial privacy-first schema. Run in the Supabase SQL editor.

create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'teacher');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  academic_year text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  display_name text not null check (char_length(display_name) between 1 and 80),
  class_group text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.learning_situations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  code text not null check (code in ('SA1','SA2','SA3')),
  title text not null,
  description text,
  position smallint not null check (position > 0),
  published boolean not null default false,
  unique(course_id, code)
);

create table public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  completed_activities integer not null default 0 check (completed_activities >= 0),
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(student_id, learning_situation_id)
);

create table public.theoretical_contents (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  title text not null,
  body text not null default '',
  published boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid references public.learning_situations(id) on delete cascade,
  title text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  published boolean not null default false,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- Helper functions live in public but cannot be modified by authenticated users.
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'teacher', false);
$$;

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.students where profile_id = auth.uid() and active = true limit 1;
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.is_teacher() from public;
revoke all on function public.current_student_id() from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_teacher() to authenticated;
grant execute on function public.current_student_id() to authenticated;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.learning_situations enable row level security;
alter table public.student_progress enable row level security;
alter table public.theoretical_contents enable row level security;
alter table public.documents enable row level security;

-- Profiles: a student sees/updates only their own profile; teachers may read profiles.
create policy "profiles_select_own_or_teacher" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_teacher());

create policy "profiles_update_own" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Defense in depth: authenticated clients may only edit the non-sensitive display name.
-- Role/group changes must be performed through a trusted teacher/admin server workflow.
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- Courses: authenticated users can read active course metadata; only teachers modify.
create policy "courses_read_authenticated" on public.courses
for select to authenticated using (true);
create policy "courses_teacher_all" on public.courses
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Students: own student row or teacher.
create policy "students_select_own_or_teacher" on public.students
for select to authenticated
using (profile_id = auth.uid() or public.is_teacher());
create policy "students_teacher_write" on public.students
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Learning situations: students only see published; teachers see/manage all.
create policy "learning_situations_read" on public.learning_situations
for select to authenticated using (published or public.is_teacher());
create policy "learning_situations_teacher_write" on public.learning_situations
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Progress: strict per-student ownership; teachers can inspect/update for assessment workflows.
create policy "progress_select_own_or_teacher" on public.student_progress
for select to authenticated
using (student_id = public.current_student_id() or public.is_teacher());
create policy "progress_student_update_own" on public.student_progress
for update to authenticated
using (student_id = public.current_student_id())
with check (student_id = public.current_student_id());
create policy "progress_teacher_all" on public.student_progress
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Theory: students see only published; teachers manage.
create policy "contents_read" on public.theoretical_contents
for select to authenticated using (published or public.is_teacher());
create policy "contents_teacher_all" on public.theoretical_contents
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Document metadata: students only see published; teachers manage.
create policy "documents_read" on public.documents
for select to authenticated using (published or public.is_teacher());
create policy "documents_teacher_all" on public.documents
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Create a private Storage bucket manually named "course-documents".
-- Recommended object path: <learning_situation_id>/<uuid>-filename.ext
-- Storage policies can then restrict writes to teachers and reads to authenticated users
-- whose metadata row in public.documents is published. Do not use a public bucket.

-- Future modules should be added in separate migrations:
-- activities, submissions, journals, quizzes, quiz_attempts, assessments.
-- Psychological/self-assessment results should live in a dedicated private table
-- with explicit student-self + teacher-only policies; never in shared/public aggregates.
