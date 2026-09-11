-- SA2 · Habilidades motrices específicas y deportes
-- Adds configurable sports, technical tests, sports journals and procedural decision activities.
-- Reuses SA1 generic questionnaires by assigning questionnaires.learning_situation_id to SA2.
-- No rankings are stored or exposed.

do $$ begin
  create type public.technical_assessment_period as enum ('january', 'march');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sa2_content_scope as enum ('sa2', 'sport', 'topic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.procedural_question_type as enum ('multiple_choice', 'sport_scenario');
exception when duplicate_object then null; end $$;

create table if not exists public.sports (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '',
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(learning_situation_id, name)
);

create table if not exists public.technical_tests (
  id uuid primary key default gen_random_uuid(),
  sport_id uuid not null references public.sports(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 140),
  description text not null default '',
  instructions text not null default '',
  unit text not null check (char_length(unit) between 1 and 40),
  direction public.measurement_direction not null,
  valuation_criteria text not null default '',
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(sport_id, name)
);

create table if not exists public.technical_test_results (
  id uuid primary key default gen_random_uuid(),
  technical_test_id uuid not null references public.technical_tests(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  period public.technical_assessment_period not null,
  value numeric not null,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(technical_test_id, student_id, period)
);

-- Theory remains in theoretical_contents. These fields add SA2-specific targeting without
-- duplicating the shared content system.
alter table public.theoretical_contents
  add column if not exists content_scope public.sa2_content_scope,
  add column if not exists sport_id uuid references public.sports(id) on delete set null,
  add column if not exists topic_label text;

alter table public.theoretical_contents
  drop constraint if exists theoretical_contents_sa2_scope_check;
alter table public.theoretical_contents
  add constraint theoretical_contents_sa2_scope_check check (
    content_scope is null
    or content_scope = 'sa2'
    or (content_scope = 'sport' and sport_id is not null)
    or (content_scope = 'topic' and topic_label is not null)
  );

create table if not exists public.sports_journals (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  sport_id uuid not null references public.sports(id) on delete restrict,
  session_date date not null,
  content_worked text not null default '',
  exercises_performed text not null default '',
  learning text not null default '',
  perceived_difficulty smallint not null check (perceived_difficulty between 1 and 5),
  participation smallint not null check (participation between 1 and 5),
  performance_perception smallint not null check (performance_perception between 1 and 5),
  needs_improvement text not null default '',
  reflection text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procedural_activities (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  sport_id uuid references public.sports(id) on delete set null,
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '',
  instructions text not null default '',
  published boolean not null default false,
  opens_at timestamptz,
  closes_at timestamptz,
  max_attempts smallint check (max_attempts is null or max_attempts > 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create table if not exists public.procedural_questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.procedural_activities(id) on delete cascade,
  question_type public.procedural_question_type not null,
  prompt text not null,
  scenario text,
  image_storage_path text,
  explanation text,
  position smallint not null check (position > 0),
  max_score numeric not null default 0 check (max_score >= 0),
  unique(activity_id, position)
);

create table if not exists public.procedural_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.procedural_questions(id) on delete cascade,
  label text not null,
  position smallint not null check (position > 0),
  unique(question_id, position)
);

-- Correct answers and scoring keys are isolated so students cannot inspect them.
create table if not exists public.procedural_answer_keys (
  question_id uuid primary key references public.procedural_questions(id) on delete cascade,
  correct_option_id uuid references public.procedural_options(id) on delete set null,
  score numeric not null default 0 check (score >= 0)
);

create table if not exists public.procedural_attempts (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.procedural_activities(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  attempt_number smallint not null check (attempt_number > 0),
  status text not null default 'in_progress' check (status in ('in_progress','submitted')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  total_score numeric,
  unique(activity_id, student_id, attempt_number),
  check ((status = 'submitted' and submitted_at is not null) or status = 'in_progress')
);

create table if not exists public.procedural_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.procedural_attempts(id) on delete cascade,
  question_id uuid not null references public.procedural_questions(id) on delete cascade,
  selected_option_id uuid references public.procedural_options(id) on delete set null,
  text_answer text,
  score numeric,
  answered_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create index if not exists idx_sports_sa on public.sports(learning_situation_id);
create index if not exists idx_technical_tests_sport on public.technical_tests(sport_id);
create index if not exists idx_technical_results_student on public.technical_test_results(student_id);
create index if not exists idx_sports_journals_student_date on public.sports_journals(student_id, session_date desc);
create index if not exists idx_procedural_activities_sa on public.procedural_activities(learning_situation_id);
create index if not exists idx_procedural_attempts_student on public.procedural_attempts(student_id);
create index if not exists idx_procedural_responses_attempt on public.procedural_responses(attempt_id);

alter table public.sports enable row level security;
alter table public.technical_tests enable row level security;
alter table public.technical_test_results enable row level security;
alter table public.sports_journals enable row level security;
alter table public.procedural_activities enable row level security;
alter table public.procedural_questions enable row level security;
alter table public.procedural_options enable row level security;
alter table public.procedural_answer_keys enable row level security;
alter table public.procedural_attempts enable row level security;
alter table public.procedural_responses enable row level security;

create policy "sports_read_active_or_teacher" on public.sports
for select to authenticated using (active = true or public.is_teacher());
create policy "sports_teacher_write" on public.sports
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "technical_tests_read_active_or_teacher" on public.technical_tests
for select to authenticated using (
  public.is_teacher()
  or (
    active = true
    and exists (select 1 from public.sports s where s.id = technical_tests.sport_id and s.active = true)
  )
);
create policy "technical_tests_teacher_write" on public.technical_tests
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "technical_results_select_own_or_teacher" on public.technical_test_results
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "technical_results_insert_own" on public.technical_test_results
for insert to authenticated with check (
  student_id = public.current_student_id()
  and exists (select 1 from public.technical_tests t where t.id = technical_test_id and t.active = true)
);
create policy "technical_results_update_own" on public.technical_test_results
for update to authenticated
using (student_id = public.current_student_id())
with check (student_id = public.current_student_id());

create policy "sports_journals_select_own_or_teacher" on public.sports_journals
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "sports_journals_insert_own" on public.sports_journals
for insert to authenticated with check (student_id = public.current_student_id());
create policy "sports_journals_update_own" on public.sports_journals
for update to authenticated
using (student_id = public.current_student_id())
with check (student_id = public.current_student_id());
create policy "sports_journals_delete_own" on public.sports_journals
for delete to authenticated using (student_id = public.current_student_id());

create policy "procedural_activities_read" on public.procedural_activities
for select to authenticated using (
  public.is_teacher()
  or (
    published = true
    and (opens_at is null or opens_at <= now())
    and (closes_at is null or closes_at >= now())
  )
);
create policy "procedural_activities_teacher_write" on public.procedural_activities
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "procedural_questions_read" on public.procedural_questions
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.procedural_activities a
    where a.id = procedural_questions.activity_id
      and a.published = true
      and (a.opens_at is null or a.opens_at <= now())
      and (a.closes_at is null or a.closes_at >= now())
  )
);
create policy "procedural_questions_teacher_write" on public.procedural_questions
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "procedural_options_read" on public.procedural_options
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1
    from public.procedural_questions pq
    join public.procedural_activities a on a.id = pq.activity_id
    where pq.id = procedural_options.question_id
      and a.published = true
      and (a.opens_at is null or a.opens_at <= now())
      and (a.closes_at is null or a.closes_at >= now())
  )
);
create policy "procedural_options_teacher_write" on public.procedural_options
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "procedural_answer_keys_teacher_only" on public.procedural_answer_keys
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "procedural_attempts_select_own_or_teacher" on public.procedural_attempts
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "procedural_attempts_insert_own" on public.procedural_attempts
for insert to authenticated with check (
  student_id = public.current_student_id()
  and exists (
    select 1 from public.procedural_activities a
    where a.id = activity_id
      and a.published = true
      and (a.opens_at is null or a.opens_at <= now())
      and (a.closes_at is null or a.closes_at >= now())
  )
);

-- Students may change status/submitted_at while the trusted server computes score fields.
revoke update on public.procedural_attempts from authenticated;
grant update (status, submitted_at) on public.procedural_attempts to authenticated;

create policy "procedural_attempts_update_own" on public.procedural_attempts
for update to authenticated
using (student_id = public.current_student_id())
with check (student_id = public.current_student_id());

create policy "procedural_responses_select_own_or_teacher" on public.procedural_responses
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.procedural_attempts a
    where a.id = procedural_responses.attempt_id
      and a.student_id = public.current_student_id()
  )
);
create policy "procedural_responses_insert_own" on public.procedural_responses
for insert to authenticated with check (
  exists (
    select 1 from public.procedural_attempts a
    where a.id = attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
  )
);
create policy "procedural_responses_update_own" on public.procedural_responses
for update to authenticated
using (
  exists (
    select 1 from public.procedural_attempts a
    where a.id = procedural_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
  )
)
with check (
  exists (
    select 1 from public.procedural_attempts a
    where a.id = procedural_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
  )
);

-- Prevent authenticated students from setting score fields directly.
revoke insert, update on public.procedural_responses from authenticated;
grant insert (attempt_id, question_id, selected_option_id, text_answer) on public.procedural_responses to authenticated;
grant update (selected_option_id, text_answer, answered_at) on public.procedural_responses to authenticated;

-- Storage: tactical images use the existing private course-documents bucket.
-- Path convention: procedural/<activity_uuid>/<filename>
create policy "procedural_storage_read" on storage.objects
for select to authenticated
using (
  bucket_id = 'course-documents'
  and (
    public.is_teacher()
    or exists (
      select 1
      from public.procedural_questions pq
      join public.procedural_activities a on a.id = pq.activity_id
      where pq.image_storage_path = name
        and a.published = true
        and (a.opens_at is null or a.opens_at <= now())
        and (a.closes_at is null or a.closes_at >= now())
    )
  )
);
