create table public.sa4_delegation_members (
  course_id uuid not null,
  country_code text not null,
  student_id uuid not null references public.students(id),
  primary key (course_id, student_id),
  foreign key (course_id, country_code) references public.sa4_delegations(course_id, country_code)
);
create index sa4_members_country_idx on public.sa4_delegation_members(course_id, country_code);
create index sa4_members_student_idx on public.sa4_delegation_members(student_id);

-- Resolve the existing, teacher-assigned names once; permissions use student IDs.
insert into public.sa4_delegation_members(course_id, country_code, student_id)
select d.course_id, d.country_code, s.id
from public.sa4_delegations d
cross join lateral unnest(d.members) member_name
join public.students s on s.course_id = d.course_id and s.active
join public.profiles p on p.id = s.profile_id
where lower(regexp_replace(translate(p.display_name, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'), '[^a-zA-Z0-9]', '', 'g'))
    = lower(regexp_replace(translate(member_name, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'), '[^a-zA-Z0-9]', '', 'g'));

create table public.sa4_event_settings (
  course_id uuid primary key references public.courses(id),
  phase text not null default 'submissions' check (phase in ('submissions','voting','closed'))
);
insert into public.sa4_event_settings(course_id) select distinct course_id from public.sa4_delegations;

create table public.sa4_team_projects (
  course_id uuid not null,
  country_code text not null,
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 1900000),
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id),
  primary key (course_id, country_code),
  foreign key (course_id, country_code) references public.sa4_delegations(course_id, country_code)
);
insert into public.sa4_team_projects(course_id, country_code) select course_id, country_code from public.sa4_delegations;
create index sa4_projects_editor_idx on public.sa4_team_projects(updated_by);

create table public.sa4_logo_votes (
  course_id uuid not null,
  student_id uuid not null,
  country_code text not null,
  updated_at timestamptz not null default now(),
  primary key (course_id, student_id),
  foreign key (course_id, student_id) references public.sa4_delegation_members(course_id, student_id),
  foreign key (course_id, country_code) references public.sa4_team_projects(course_id, country_code)
);
create index sa4_votes_candidate_idx on public.sa4_logo_votes(course_id, country_code);

create function public.sa4_course_visible(target_course uuid) returns boolean
language sql stable security invoker set search_path = '' as $$
  select (select public.is_teacher()) or exists (
    select 1 from public.students s
    join public.courses c on c.id = s.course_id
    join public.learning_situations ls on ls.course_id = s.course_id
    where s.id = (select public.current_student_id()) and s.course_id = target_course
      and s.active and c.bachillerato_year = 2 and ls.code = 'SA4' and ls.published
  );
$$;
revoke all on function public.sa4_course_visible(uuid) from public, anon;
grant execute on function public.sa4_course_visible(uuid) to authenticated;

alter table public.sa4_delegation_members enable row level security;
alter table public.sa4_event_settings enable row level security;
alter table public.sa4_team_projects enable row level security;
alter table public.sa4_logo_votes enable row level security;
revoke all on public.sa4_delegation_members, public.sa4_event_settings, public.sa4_team_projects, public.sa4_logo_votes from public, anon, authenticated;
grant select on public.sa4_delegation_members, public.sa4_event_settings, public.sa4_team_projects, public.sa4_logo_votes to authenticated;
grant update on public.sa4_event_settings, public.sa4_team_projects to authenticated;
grant insert, update on public.sa4_logo_votes to authenticated;

create policy sa4_members_read on public.sa4_delegation_members for select to authenticated
using ((select public.is_teacher()) or (student_id = (select public.current_student_id()) and public.sa4_course_visible(course_id)));
create policy sa4_settings_read on public.sa4_event_settings for select to authenticated using (public.sa4_course_visible(course_id));
create policy sa4_settings_teacher on public.sa4_event_settings for update to authenticated
using ((select public.is_teacher())) with check ((select public.is_teacher()));
create policy sa4_projects_read on public.sa4_team_projects for select to authenticated using (public.sa4_course_visible(course_id));
create policy sa4_projects_update on public.sa4_team_projects for update to authenticated
using ((select public.is_teacher()) or (public.sa4_course_visible(course_id) and exists (
  select 1 from public.sa4_delegation_members m where m.course_id = sa4_team_projects.course_id
    and m.country_code = sa4_team_projects.country_code and m.student_id = (select public.current_student_id())
))) with check ((select public.is_teacher()) or (public.sa4_course_visible(course_id) and exists (
  select 1 from public.sa4_delegation_members m where m.course_id = sa4_team_projects.course_id
    and m.country_code = sa4_team_projects.country_code and m.student_id = (select public.current_student_id())
)));
create policy sa4_votes_read on public.sa4_logo_votes for select to authenticated using (public.sa4_course_visible(course_id));
create policy sa4_votes_insert on public.sa4_logo_votes for insert to authenticated
with check (student_id = (select public.current_student_id()) and public.sa4_course_visible(course_id) and exists (
  select 1 from public.sa4_event_settings settings where settings.course_id = sa4_logo_votes.course_id and settings.phase = 'voting'
));
create policy sa4_votes_update on public.sa4_logo_votes for update to authenticated
using (student_id = (select public.current_student_id()) and public.sa4_course_visible(course_id))
with check (student_id = (select public.current_student_id()) and public.sa4_course_visible(course_id) and exists (
  select 1 from public.sa4_event_settings settings where settings.course_id = sa4_logo_votes.course_id and settings.phase = 'voting'
));

create function public.sa4_check_project() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare current_phase text; identity_data jsonb;
begin
  if new.course_id <> old.course_id or new.country_code <> old.country_code then
    raise exception 'No se puede cambiar la delegación del proyecto.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(new.course_id::text, 44));
  select phase into current_phase from public.sa4_event_settings where course_id = new.course_id;
  if current_phase is distinct from 'submissions' and (new.content->'identity') is distinct from (old.content->'identity') then
    raise exception 'El logo y su propuesta quedan fijados al abrir la votación.';
  end if;
  identity_data := new.content->'identity';
  if coalesce(identity_data->>'logo', '') <> '' and (
    length(identity_data->>'logo') > 1450000 or not (identity_data->>'logo' ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$')
  ) then raise exception 'El logo debe ser PNG, JPG o WebP, de hasta 1 MB.'; end if;
  if identity_data->>'submitted' = 'true' and (
    coalesce(trim(identity_data->>'name'), '') = '' or coalesce(trim(identity_data->>'slogan'), '') = ''
    or coalesce(trim(identity_data->>'meaning'), '') = '' or coalesce(identity_data->>'logo', '') = ''
  ) then raise exception 'Completa nombre, lema, imagen y explicación antes de entregar el logo.'; end if;
  new.revision := old.revision + 1;
  new.updated_at := clock_timestamp();
  new.updated_by := auth.uid();
  return new;
end;
$$;
revoke all on function public.sa4_check_project() from public, anon, authenticated;
create trigger sa4_project_validate before update on public.sa4_team_projects for each row execute function public.sa4_check_project();

create function public.sa4_check_phase() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.course_id <> old.course_id then raise exception 'No se puede cambiar el curso.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(new.course_id::text, 44));
  if new.phase = old.phase then return new; end if;
  if not ((old.phase = 'submissions' and new.phase = 'voting') or (old.phase = 'voting' and new.phase = 'closed')) then
    raise exception 'El concurso avanza de presentación a votación y después a resultados.';
  end if;
  if new.phase = 'voting' and (
    (select count(*) from public.sa4_team_projects where course_id = new.course_id) < 2
    or exists (select 1 from public.sa4_team_projects where course_id = new.course_id and coalesce(content->'identity'->>'submitted','false') <> 'true')
  ) then raise exception 'Todas las delegaciones deben entregar su logo antes de abrir la votación.'; end if;
  return new;
end;
$$;
revoke all on function public.sa4_check_phase() from public, anon, authenticated;
create trigger sa4_phase_validate before update on public.sa4_event_settings for each row execute function public.sa4_check_phase();

create function public.sa4_check_vote() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.course_id::text, 44));
  if tg_op = 'UPDATE' and (new.course_id <> old.course_id or new.student_id <> old.student_id) then
    raise exception 'No se puede cambiar el autor del voto.';
  end if;
  if not exists (select 1 from public.sa4_event_settings where course_id = new.course_id and phase = 'voting') then
    raise exception 'La votación no está abierta.';
  end if;
  if not exists (select 1 from public.sa4_team_projects where course_id = new.course_id and country_code = new.country_code and content->'identity'->>'submitted' = 'true') then
    raise exception 'La propuesta no está presentada al concurso.';
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.sa4_check_vote() from public, anon, authenticated;
create trigger sa4_vote_validate before insert or update on public.sa4_logo_votes for each row execute function public.sa4_check_vote();
