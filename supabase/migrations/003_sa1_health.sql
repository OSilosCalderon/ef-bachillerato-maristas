-- SA1 · Salud y calidad de vida
-- Flexible physical assessment, theory library, journals and generic questionnaires.
-- Privacy model: students can only access their own personal records; teachers can inspect
-- personal records but cannot edit student journals or questionnaire answers.

do $$ begin
  create type public.assessment_period as enum ('september', 'november');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.measurement_direction as enum ('higher_better', 'lower_better');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.question_type as enum (
    'text', 'single_choice', 'multiple_choice',
    'scale_1_5', 'scale_1_7', 'scale_1_10'
  );
exception when duplicate_object then null; end $$;

-- Extend the existing theory model without breaking current data.
alter table public.theoretical_contents
  add column if not exists category text,
  add column if not exists body_json jsonb,
  add column if not exists published_at timestamptz;

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.theoretical_contents(id) on delete cascade,
  asset_type text not null check (asset_type in ('image', 'document', 'link')),
  label text not null,
  storage_path text,
  external_url text,
  position smallint not null default 1 check (position > 0),
  created_at timestamptz not null default now(),
  check (
    (asset_type in ('image','document') and storage_path is not null and external_url is null)
    or (asset_type = 'link' and external_url is not null and storage_path is null)
  )
);

create table if not exists public.content_reads (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.theoretical_contents(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique(content_id, student_id)
);

create table if not exists public.physical_tests (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  unit text not null check (char_length(unit) between 1 and 40),
  direction public.measurement_direction not null,
  instructions text not null default '',
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.physical_test_results (
  id uuid primary key default gen_random_uuid(),
  physical_test_id uuid not null references public.physical_tests(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  period public.assessment_period not null,
  value numeric not null,
  recorded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(physical_test_id, student_id, period)
);

create table if not exists public.session_journals (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  session_date date not null,
  title text not null check (char_length(title) between 1 and 160),
  activities text not null default '',
  feeling text not null default '',
  learning text not null default '',
  perceived_difficulty smallint not null check (perceived_difficulty between 1 and 5),
  perceived_effort smallint not null check (perceived_effort between 1 and 10),
  reflection text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '',
  instructions text not null default '',
  published boolean not null default false,
  opens_at timestamptz,
  closes_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create table if not exists public.questionnaire_questions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.questionnaires(id) on delete cascade,
  prompt text not null,
  question_type public.question_type not null,
  required boolean not null default true,
  position smallint not null check (position > 0),
  score_enabled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  unique(questionnaire_id, position)
);

create table if not exists public.questionnaire_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questionnaire_questions(id) on delete cascade,
  label text not null,
  value text not null,
  position smallint not null check (position > 0),
  unique(question_id, position)
);

-- Scoring rules are intentionally separated from answer options so students cannot inspect
-- scoring keys before or while answering.
create table if not exists public.questionnaire_option_scores (
  option_id uuid primary key references public.questionnaire_options(id) on delete cascade,
  score numeric not null
);

create table if not exists public.questionnaire_attempts (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.questionnaires(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','submitted')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  total_score numeric,
  unique(questionnaire_id, student_id),
  check ((status = 'submitted' and submitted_at is not null) or status = 'in_progress')
);

create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.questionnaire_attempts(id) on delete cascade,
  question_id uuid not null references public.questionnaire_questions(id) on delete cascade,
  answer jsonb not null,
  score numeric,
  updated_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create index if not exists idx_physical_results_student on public.physical_test_results(student_id);
create index if not exists idx_journals_student_date on public.session_journals(student_id, session_date desc);
create index if not exists idx_attempts_student on public.questionnaire_attempts(student_id);
create index if not exists idx_responses_attempt on public.questionnaire_responses(attempt_id);
create index if not exists idx_content_reads_student on public.content_reads(student_id);

alter table public.content_assets enable row level security;
alter table public.content_reads enable row level security;
alter table public.physical_tests enable row level security;
alter table public.physical_test_results enable row level security;
alter table public.session_journals enable row level security;
alter table public.questionnaires enable row level security;
alter table public.questionnaire_questions enable row level security;
alter table public.questionnaire_options enable row level security;
alter table public.questionnaire_option_scores enable row level security;
alter table public.questionnaire_attempts enable row level security;
alter table public.questionnaire_responses enable row level security;

-- Published theory assets are visible to students; teachers manage them.
create policy "content_assets_read_published_or_teacher" on public.content_assets
for select to authenticated
using (
  public.is_teacher()
  or exists (
    select 1 from public.theoretical_contents c
    where c.id = content_assets.content_id and c.published = true
  )
);
create policy "content_assets_teacher_write" on public.content_assets
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Optional read receipts: student owns their receipt; teacher may inspect.
create policy "content_reads_select_own_or_teacher" on public.content_reads
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "content_reads_insert_own" on public.content_reads
for insert to authenticated with check (
  student_id = public.current_student_id()
  and exists (
    select 1 from public.theoretical_contents c
    where c.id = content_reads.content_id and c.published = true
  )
);
create policy "content_reads_delete_own" on public.content_reads
for delete to authenticated using (student_id = public.current_student_id());

-- Teachers define physical tests; authenticated students can see active tests.
create policy "physical_tests_read" on public.physical_tests
for select to authenticated using (active = true or public.is_teacher());
create policy "physical_tests_teacher_write" on public.physical_tests
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Physical results are private per student. Teachers can read for educational follow-up.
create policy "physical_results_select_own_or_teacher" on public.physical_test_results
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "physical_results_insert_own" on public.physical_test_results
for insert to authenticated with check (
  student_id = public.current_student_id()
  and exists (select 1 from public.physical_tests t where t.id = physical_test_id and t.active = true)
);
create policy "physical_results_update_own" on public.physical_test_results
for update to authenticated
using (student_id = public.current_student_id())
with check (student_id = public.current_student_id());

-- Journals: students create/edit/delete only their own. Teachers have read-only access.
create policy "journals_select_own_or_teacher" on public.session_journals
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "journals_insert_own" on public.session_journals
for insert to authenticated with check (student_id = public.current_student_id());
create policy "journals_update_own" on public.session_journals
for update to authenticated
using (student_id = public.current_student_id())
with check (student_id = public.current_student_id());
create policy "journals_delete_own" on public.session_journals
for delete to authenticated using (student_id = public.current_student_id());

-- Questionnaire definitions: teachers manage; students only see published/open definitions.
create policy "questionnaires_read" on public.questionnaires
for select to authenticated using (
  public.is_teacher()
  or (
    published = true
    and (opens_at is null or opens_at <= now())
    and (closes_at is null or closes_at >= now())
  )
);
create policy "questionnaires_teacher_write" on public.questionnaires
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "questions_read_available_or_teacher" on public.questionnaire_questions
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.questionnaires q
    where q.id = questionnaire_questions.questionnaire_id
      and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  )
);
create policy "questions_teacher_write" on public.questionnaire_questions
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "options_read_available_or_teacher" on public.questionnaire_options
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.questionnaire_questions qq
    join public.questionnaires q on q.id = qq.questionnaire_id
    where qq.id = questionnaire_options.question_id
      and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  )
);
create policy "options_teacher_write" on public.questionnaire_options
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Scoring keys are teacher-only. Students never receive option scoring rules.
create policy "option_scores_teacher_only" on public.questionnaire_option_scores
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Attempts/results are never shared between students.
create policy "attempts_select_own_or_teacher" on public.questionnaire_attempts
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "attempts_insert_own_open" on public.questionnaire_attempts
for insert to authenticated with check (
  student_id = public.current_student_id()
  and status = 'in_progress'
  and submitted_at is null
  and exists (
    select 1 from public.questionnaires q
    where q.id = questionnaire_id and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  )
);
create policy "attempts_update_own" on public.questionnaire_attempts
for update to authenticated
using (
  student_id = public.current_student_id()
  and status = 'in_progress'
  and exists (
    select 1 from public.questionnaires q
    where q.id = questionnaire_attempts.questionnaire_id
      and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  )
)
with check (student_id = public.current_student_id());

create policy "responses_select_own_or_teacher" on public.questionnaire_responses
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.questionnaire_attempts a
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
  )
);
create policy "responses_insert_own" on public.questionnaire_responses
for insert to authenticated with check (
  exists (
    select 1 from public.questionnaire_attempts a
    join public.questionnaires q on q.id = a.questionnaire_id
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
      and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  )
);
create policy "responses_update_own" on public.questionnaire_responses
for update to authenticated
using (
  exists (
    select 1 from public.questionnaire_attempts a
    join public.questionnaires q on q.id = a.questionnaire_id
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
      and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  )
)
with check (
  exists (
    select 1 from public.questionnaire_attempts a
    join public.questionnaires q on q.id = a.questionnaire_id
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
      and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  )
);

-- Scores should be calculated in a trusted server-side workflow. Authenticated student
-- clients may create answers, but cannot write authoritative score columns.
revoke insert, update on public.questionnaire_attempts from authenticated;
grant insert (questionnaire_id, student_id, started_at) on public.questionnaire_attempts to authenticated;
grant update (status, submitted_at) on public.questionnaire_attempts to authenticated;

revoke insert, update on public.questionnaire_responses from authenticated;
grant insert (attempt_id, question_id, answer, updated_at) on public.questionnaire_responses to authenticated;
grant update (answer, updated_at) on public.questionnaire_responses to authenticated;

-- Extend the private Storage policy so published theory assets can use the same private bucket.
drop policy if exists "course_documents_read_published_or_teacher" on storage.objects;
create policy "course_documents_read_published_or_teacher"
on storage.objects for select to authenticated
using (
  bucket_id = 'course-documents'
  and (
    public.is_teacher()
    or exists (
      select 1 from public.documents d
      where d.storage_path = storage.objects.name and d.published = true
    )
    or exists (
      select 1
      from public.content_assets a
      join public.theoretical_contents c on c.id = a.content_id
      where a.storage_path = storage.objects.name
        and a.asset_type in ('image','document')
        and c.published = true
    )
  )
);

-- Important: do not expose questionnaire results through public views or class-level endpoints.
-- Any future psychological instrument should get an additional dedicated migration and privacy review.
