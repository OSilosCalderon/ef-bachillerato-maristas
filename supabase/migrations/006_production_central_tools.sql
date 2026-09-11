-- 006 · Production hardening and central teacher tools
-- Additive only: keeps SA1/SA2/SA3 specialized tables intact.

do $$ begin
  create type public.central_content_type as enum (
    'explanation','document','infographic','link','video','game_sheet','other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.activity_definition_type as enum (
    'physical_test','technical_test','psychological_questionnaire','theoretical_questionnaire',
    'procedural_test','decision_activity','self_assessment','rating','custom'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.content_library (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  category text not null default 'Otros',
  content_type public.central_content_type not null default 'explanation',
  body text not null default '',
  external_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (external_url is null or external_url ~ '^https?://')
);

create table if not exists public.content_attachments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_library(id) on delete cascade,
  title text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.content_library_reads (
  content_id uuid not null references public.content_library(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(content_id, student_id)
);

-- Schema-driven activity definitions. `config` contains non-sensitive presentation/configuration
-- fields. Psychological answers/results continue to live only in the private questionnaire tables.
create table if not exists public.activity_definitions (
  id uuid primary key default gen_random_uuid(),
  learning_situation_id uuid not null references public.learning_situations(id) on delete cascade,
  activity_type public.activity_definition_type not null,
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '',
  config jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  opens_at timestamptz,
  closes_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create index if not exists idx_content_library_sa_published on public.content_library(learning_situation_id, published);
create index if not exists idx_content_attachments_content on public.content_attachments(content_id);
create index if not exists idx_content_reads_student on public.content_library_reads(student_id);
create index if not exists idx_activity_definitions_sa_type on public.activity_definitions(learning_situation_id, activity_type);

alter table public.content_library enable row level security;
alter table public.content_attachments enable row level security;
alter table public.content_library_reads enable row level security;
alter table public.activity_definitions enable row level security;

create policy "content_library_read_published_or_teacher" on public.content_library
for select to authenticated
using (published = true or public.is_teacher());

create policy "content_library_teacher_write" on public.content_library
for all to authenticated
using (public.is_teacher())
with check (public.is_teacher());

create policy "content_attachments_read_published_or_teacher" on public.content_attachments
for select to authenticated
using (
  public.is_teacher()
  or exists (
    select 1 from public.content_library c
    where c.id = content_attachments.content_id and c.published = true
  )
);

create policy "content_attachments_teacher_write" on public.content_attachments
for all to authenticated
using (public.is_teacher())
with check (public.is_teacher());

create policy "content_reads_select_own_or_teacher" on public.content_library_reads
for select to authenticated
using (student_id = public.current_student_id() or public.is_teacher());

create policy "content_reads_insert_own" on public.content_library_reads
for insert to authenticated
with check (
  student_id = public.current_student_id()
  and exists (
    select 1 from public.content_library c
    where c.id = content_id and c.published = true
  )
);

create policy "content_reads_delete_own" on public.content_library_reads
for delete to authenticated
using (student_id = public.current_student_id());

create policy "activity_definitions_read" on public.activity_definitions
for select to authenticated
using (
  public.is_teacher()
  or (
    published = true
    and (opens_at is null or opens_at <= now())
    and (closes_at is null or closes_at >= now())
  )
);

create policy "activity_definitions_teacher_write" on public.activity_definitions
for all to authenticated
using (public.is_teacher())
with check (public.is_teacher());

-- Ensure the shared bucket exists and stays private.
insert into storage.buckets (id, name, public)
values ('course-documents', 'course-documents', false)
on conflict (id) do update set public = false;

-- New central content attachments are readable only when their metadata is published
-- or by a teacher. Existing SA-specific policies remain in force for their own paths.
create policy "central_content_storage_read" on storage.objects
for select to authenticated
using (
  bucket_id = 'course-documents'
  and (
    public.is_teacher()
    or exists (
      select 1
      from public.content_attachments a
      join public.content_library c on c.id = a.content_id
      where a.storage_path = storage.objects.name
        and c.published = true
    )
  )
);

-- Explicitly prevent anonymous access through these application tables.
revoke all on public.content_library from anon;
revoke all on public.content_attachments from anon;
revoke all on public.content_library_reads from anon;
revoke all on public.activity_definitions from anon;

-- Authenticated grants are still constrained by RLS.
grant select on public.content_library, public.content_attachments, public.activity_definitions to authenticated;
grant select, insert, delete on public.content_library_reads to authenticated;
grant insert, update, delete on public.content_library, public.content_attachments, public.activity_definitions to authenticated;
