-- SA3 · Ocio activo y juegos alternativos
-- Compatible with SA1/SA2. Adds games, session design, ratings, SA3 material and attitude self-assessment.

do $$ begin
  create type public.sa3_session_status as enum ('draft', 'submitted', 'reviewed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.game_intensity as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sa3_material_type as enum ('document', 'explanation', 'infographic', 'link', 'video', 'game_sheet');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attitude_item_type as enum ('scale_1_5', 'yes_no', 'text');
exception when duplicate_object then null; end $$;

create table if not exists public.alternative_games (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 140),
  image_storage_path text,
  description text not null default '',
  objective text not null default '',
  recommended_participants text not null default '',
  space text not null default '',
  materials text[] not null default '{}',
  rules text[] not null default '{}',
  variants text[] not null default '{}',
  approximate_minutes smallint check (approximate_minutes is null or approximate_minutes > 0),
  intensity public.game_intensity,
  safety_recommendations text not null default '',
  active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(learning_situation_id, name)
);

create table if not exists public.alternative_game_categories (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_by uuid not null references public.profiles(id) on delete restrict,
  unique(learning_situation_id, name)
);

create table if not exists public.alternative_game_category_links (
  game_id uuid not null references public.alternative_games(id) on delete cascade,
  category_id uuid not null references public.alternative_game_categories(id) on delete cascade,
  primary key (game_id, category_id)
);

create table if not exists public.designed_sessions (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null default '',
  objective text not null default '',
  participants smallint check (participants is null or participants > 0),
  materials text not null default '',
  space text not null default '',
  warmup text not null default '',
  warmup_minutes smallint not null default 0 check (warmup_minutes >= 0),
  cooldown text not null default '',
  cooldown_minutes smallint not null default 0 check (cooldown_minutes >= 0),
  observations text not null default '',
  safety_measures text not null default '',
  status public.sa3_session_status not null default 'draft',
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'draft' and submitted_at is null)
    or (status in ('submitted','reviewed') and submitted_at is not null)
  )
);

create table if not exists public.designed_session_games (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.designed_sessions(id) on delete cascade,
  library_game_id uuid references public.alternative_games(id) on delete set null,
  custom_game_name text,
  minutes smallint not null check (minutes > 0),
  notes text not null default '',
  position smallint not null check (position > 0),
  check (
    (library_game_id is not null and custom_game_name is null)
    or (library_game_id is null and custom_game_name is not null and char_length(custom_game_name) > 0)
  ),
  unique(session_id, position)
);

-- Feedback is separate from student-owned session content. Teachers can write it; students can only read it.
create table if not exists public.designed_session_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.designed_sessions(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  feedback text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.alternative_games(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  fun smallint not null check (fun between 1 and 5),
  participation smallint not null check (participation between 1 and 5),
  difficulty smallint not null check (difficulty between 1 and 5),
  intensity smallint not null check (intensity between 1 and 5),
  cooperation smallint not null check (cooperation between 1 and 5),
  would_play_again boolean not null,
  comment text not null default '',
  improvement_proposal text not null default '',
  practiced_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sa3_materials (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '',
  body text not null default '',
  category text not null default 'Otros',
  material_type public.sa3_material_type not null,
  resource_url text,
  storage_path text,
  game_id uuid references public.alternative_games(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sa3_material_reads (
  material_id uuid not null references public.sa3_materials(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (material_id, student_id)
);

create table if not exists public.attitude_forms (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  title text not null,
  description text not null default '',
  active boolean not null default false,
  opens_at timestamptz,
  closes_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create table if not exists public.attitude_items (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.attitude_forms(id) on delete cascade,
  label text not null,
  item_type public.attitude_item_type not null,
  active boolean not null default true,
  position smallint not null check (position > 0),
  unique(form_id, position)
);

create table if not exists public.attitude_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.attitude_forms(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  reflection_overall text not null default '',
  reflection_improvement text not null default '',
  submitted_at timestamptz not null default now()
);

create table if not exists public.attitude_responses (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.attitude_submissions(id) on delete cascade,
  item_id uuid not null references public.attitude_items(id) on delete cascade,
  scale_value smallint check (scale_value between 1 and 5),
  yes_no_value boolean,
  text_value text,
  unique(submission_id, item_id),
  check (num_nonnulls(scale_value, yes_no_value, text_value) = 1)
);

create index if not exists idx_alt_games_sa3 on public.alternative_games(learning_situation_id);
create index if not exists idx_designed_sessions_student on public.designed_sessions(student_id, updated_at desc);
create index if not exists idx_session_games_session on public.designed_session_games(session_id);
create index if not exists idx_game_ratings_game on public.game_ratings(game_id);
create index if not exists idx_game_ratings_student on public.game_ratings(student_id);
create index if not exists idx_sa3_materials_sa on public.sa3_materials(learning_situation_id, published);
create index if not exists idx_attitude_submissions_student on public.attitude_submissions(student_id, submitted_at desc);

alter table public.alternative_games enable row level security;
alter table public.alternative_game_categories enable row level security;
alter table public.alternative_game_category_links enable row level security;
alter table public.designed_sessions enable row level security;
alter table public.designed_session_games enable row level security;
alter table public.designed_session_feedback enable row level security;
alter table public.game_ratings enable row level security;
alter table public.sa3_materials enable row level security;
alter table public.sa3_material_reads enable row level security;
alter table public.attitude_forms enable row level security;
alter table public.attitude_items enable row level security;
alter table public.attitude_submissions enable row level security;
alter table public.attitude_responses enable row level security;

-- Games and categories: students see active library records; teachers administer them.
create policy "alternative_games_read" on public.alternative_games
for select to authenticated using (active = true or public.is_teacher());
create policy "alternative_games_teacher_write" on public.alternative_games
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "alternative_game_categories_read" on public.alternative_game_categories
for select to authenticated using (true);
create policy "alternative_game_categories_teacher_write" on public.alternative_game_categories
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "alternative_game_category_links_read" on public.alternative_game_category_links
for select to authenticated using (true);
create policy "alternative_game_category_links_teacher_write" on public.alternative_game_category_links
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Sessions: students own/edit their drafts and submitted records; teachers read but do not update student content.
create policy "designed_sessions_read_own_or_teacher" on public.designed_sessions
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "designed_sessions_insert_own" on public.designed_sessions
for insert to authenticated with check (student_id = public.current_student_id());
create policy "designed_sessions_update_own" on public.designed_sessions
for update to authenticated
using (student_id = public.current_student_id() and status = 'draft')
with check (
  student_id = public.current_student_id()
  and status in ('draft', 'submitted')
);
create policy "designed_sessions_delete_own_draft" on public.designed_sessions
for delete to authenticated using (student_id = public.current_student_id() and status = 'draft');

create policy "designed_session_games_read" on public.designed_session_games
for select to authenticated using (
  exists (
    select 1 from public.designed_sessions s
    where s.id = designed_session_games.session_id
      and (s.student_id = public.current_student_id() or public.is_teacher())
  )
);
create policy "designed_session_games_insert_own" on public.designed_session_games
for insert to authenticated with check (
  exists (
    select 1 from public.designed_sessions s
    where s.id = session_id
      and s.student_id = public.current_student_id()
      and s.status = 'draft'
  )
);
create policy "designed_session_games_update_own" on public.designed_session_games
for update to authenticated
using (
  exists (
    select 1 from public.designed_sessions s
    where s.id = session_id
      and s.student_id = public.current_student_id()
      and s.status = 'draft'
  )
)
with check (
  exists (
    select 1 from public.designed_sessions s
    where s.id = session_id
      and s.student_id = public.current_student_id()
      and s.status = 'draft'
  )
);
create policy "designed_session_games_delete_own" on public.designed_session_games
for delete to authenticated using (
  exists (
    select 1 from public.designed_sessions s
    where s.id = session_id
      and s.student_id = public.current_student_id()
      and s.status = 'draft'
  )
);

create policy "session_feedback_read_owner_or_teacher" on public.designed_session_feedback
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.designed_sessions s
    where s.id = designed_session_feedback.session_id
      and s.student_id = public.current_student_id()
  )
);
create policy "session_feedback_teacher_write" on public.designed_session_feedback
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Ratings are individual/private. General teacher dashboards should aggregate without displaying student names.
create policy "game_ratings_read_own_or_teacher" on public.game_ratings
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "game_ratings_insert_own" on public.game_ratings
for insert to authenticated with check (student_id = public.current_student_id());
create policy "game_ratings_update_own" on public.game_ratings
for update to authenticated
using (student_id = public.current_student_id())
with check (student_id = public.current_student_id());
create policy "game_ratings_delete_own" on public.game_ratings
for delete to authenticated using (student_id = public.current_student_id());

-- SA3 materials are teacher-managed and only published materials are visible to students.
create policy "sa3_materials_read" on public.sa3_materials
for select to authenticated using (published = true or public.is_teacher());
create policy "sa3_materials_teacher_write" on public.sa3_materials
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "sa3_material_reads_read_own_or_teacher" on public.sa3_material_reads
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "sa3_material_reads_insert_own" on public.sa3_material_reads
for insert to authenticated with check (
  student_id = public.current_student_id()
  and exists (select 1 from public.sa3_materials m where m.id = material_id and m.published = true)
);
create policy "sa3_material_reads_delete_own" on public.sa3_material_reads
for delete to authenticated using (student_id = public.current_student_id());

-- Attitude forms/items are configurable by teachers.
create policy "attitude_forms_read" on public.attitude_forms
for select to authenticated using (
  public.is_teacher()
  or (
    active = true
    and (opens_at is null or opens_at <= now())
    and (closes_at is null or closes_at >= now())
  )
);
create policy "attitude_forms_teacher_write" on public.attitude_forms
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create policy "attitude_items_read" on public.attitude_items
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.attitude_forms f
    where f.id = attitude_items.form_id
      and f.active = true
      and (f.opens_at is null or f.opens_at <= now())
      and (f.closes_at is null or f.closes_at >= now())
  )
);
create policy "attitude_items_teacher_write" on public.attitude_items
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Self-assessments are private to the student and teachers. No student-to-student access.
create policy "attitude_submissions_read_own_or_teacher" on public.attitude_submissions
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());
create policy "attitude_submissions_insert_own" on public.attitude_submissions
for insert to authenticated with check (
  student_id = public.current_student_id()
  and exists (
    select 1 from public.attitude_forms f
    where f.id = form_id
      and f.active = true
      and (f.opens_at is null or f.opens_at <= now())
      and (f.closes_at is null or f.closes_at >= now())
  )
);

create policy "attitude_responses_read_own_or_teacher" on public.attitude_responses
for select to authenticated using (
  public.is_teacher()
  or exists (
    select 1 from public.attitude_submissions s
    where s.id = attitude_responses.submission_id
      and s.student_id = public.current_student_id()
  )
);
create policy "attitude_responses_insert_own" on public.attitude_responses
for insert to authenticated with check (
  exists (
    select 1
    from public.attitude_submissions s
    join public.attitude_items i on i.id = item_id
    where s.id = submission_id
      and s.student_id = public.current_student_id()
      and i.form_id = s.form_id
      and i.active = true
  )
);

-- Private Storage convention:
-- games/<game_uuid>/<filename>
-- sa3-materials/<material_uuid>/<filename>
create policy "sa3_storage_teacher_write" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'course-documents'
  and public.is_teacher()
  and (name like 'games/%' or name like 'sa3-materials/%')
);

create policy "sa3_storage_teacher_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'course-documents'
  and public.is_teacher()
  and (name like 'games/%' or name like 'sa3-materials/%')
)
with check (
  bucket_id = 'course-documents'
  and public.is_teacher()
  and (name like 'games/%' or name like 'sa3-materials/%')
);

create policy "sa3_storage_read_published_or_teacher" on storage.objects
for select to authenticated
using (
  bucket_id = 'course-documents'
  and (
    public.is_teacher()
    or exists (
      select 1 from public.alternative_games g
      where g.image_storage_path = name and g.active = true
    )
    or exists (
      select 1 from public.sa3_materials m
      where m.storage_path = name and m.published = true
    )
  )
);
