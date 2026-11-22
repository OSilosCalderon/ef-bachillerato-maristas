-- Shared steps build on the existing delegation projects and preserve other sections.
create unique index sa4_one_sport_per_course on public.sa4_team_projects(course_id,lower(btrim(content->'sport'->>'sport')))
where btrim(coalesce(content->'sport'->>'sport',''))<>'';

create or replace function public.sa4_course_visible(target_course uuid) returns boolean
language sql stable security invoker set search_path='' as $$
  select exists(select 1 from public.courses c where c.id=target_course and c.is_active and c.bachillerato_year=2)
  and ((select public.is_teacher()) or exists(
    select 1 from public.students s join public.learning_situations l on l.course_id=s.course_id
    where s.id=(select public.current_student_id()) and s.course_id=target_course and s.active and l.code='SA4' and l.published
  ));
$$;

create function public.save_sa4_team_step(p_course uuid,p_country text,p_step text,p_data jsonb,p_revision integer)
returns table(country_code text,step text,data jsonb,revision integer,updated_at timestamptz)
language plpgsql security invoker set search_path='' as $$
declare saved public.sa4_team_projects; next_data jsonb;
begin
  if not public.sa4_course_visible(p_course) or not ((select public.is_teacher()) or exists(
    select 1 from public.sa4_delegation_members m where m.course_id=p_course and m.country_code=p_country and m.student_id=(select public.current_student_id())
  )) then raise exception 'SA4_FORBIDDEN'; end if;
  if p_step not in ('identity','sport','planning','competition','results','reflection') or p_revision < 0
    or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>500000 then raise exception 'SA4_INVALID'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_course::text,44));
  select * into saved from public.sa4_team_projects t where t.course_id=p_course and t.country_code=p_country for update;
  if saved.course_id is null then raise exception 'SA4_FORBIDDEN'; end if;
  if coalesce((saved.content->'_revisions'->>p_step)::integer,0)<>p_revision then raise exception 'SA4_CONFLICT'; end if;
  if p_step='competition' and coalesce(saved.content->'results'->'scores','{}'::jsonb)<>'{}'::jsonb then raise exception 'SA4_RESULTS_EXIST'; end if;
  next_data:=jsonb_set(saved.content,array[p_step],p_data);
  next_data:=jsonb_set(next_data,array['_revisions'],coalesce(next_data->'_revisions','{}'::jsonb)||jsonb_build_object(p_step,p_revision+1));
  update public.sa4_team_projects t set content=next_data where t.course_id=p_course and t.country_code=p_country returning t.* into saved;
  return query select p_country,p_step,saved.content->p_step,p_revision+1,saved.updated_at;
end;
$$;

create or replace function public.sa4_check_phase() returns trigger
language plpgsql security invoker set search_path='' as $$
declare required integer; ready integer;
begin
  if new.course_id<>old.course_id then raise exception 'SA4_PHASE'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.course_id::text,44));
  if new.phase=old.phase then return new; end if;
  if new.phase='voting' then
    select count(*) into required from public.sa4_delegations where course_id=new.course_id;
    select count(*) into ready from public.sa4_team_projects where course_id=new.course_id and content->'identity'->>'submitted'='true';
    if required<>8 or ready<>required then raise exception 'SA4_LOGOS_PENDING'; end if;
  elsif new.phase='submissions' then
    if exists(select 1 from public.sa4_logo_votes where course_id=new.course_id) then raise exception 'SA4_VOTES_EXIST'; end if;
  elsif new.phase<>'closed' or old.phase<>'voting' then raise exception 'SA4_PHASE'; end if;
  return new;
end;
$$;

create function public.set_sa4_voting_phase(p_course uuid,p_phase text) returns text
language plpgsql security invoker set search_path='' as $$
begin
  if not (select public.is_teacher()) or not public.sa4_course_visible(p_course) then raise exception 'SA4_FORBIDDEN'; end if;
  update public.sa4_event_settings set phase=p_phase where course_id=p_course;
  if not found then raise exception 'SA4_PHASE'; end if;
  return p_phase;
end;
$$;

create function public.vote_sa4_logo(p_course uuid,p_country text,p_candidate text) returns text
language plpgsql security invoker set search_path='' as $$
declare current_student uuid;
begin
  current_student:=(select public.current_student_id());
  if not public.sa4_course_visible(p_course) or (select public.is_teacher()) or not exists(
    select 1 from public.sa4_delegation_members m where m.course_id=p_course and m.country_code=p_country and m.student_id=current_student
  ) then raise exception 'SA4_FORBIDDEN'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_course::text,44));
  insert into public.sa4_logo_votes(course_id,student_id,country_code) values(p_course,current_student,p_candidate)
  on conflict(course_id,student_id) do update set country_code=excluded.country_code;
  return p_candidate;
end;
$$;
revoke all on function public.save_sa4_team_step(uuid,text,text,jsonb,integer),public.set_sa4_voting_phase(uuid,text),public.vote_sa4_logo(uuid,text,text) from public,anon;
grant execute on function public.save_sa4_team_step(uuid,text,text,jsonb,integer),public.set_sa4_voting_phase(uuid,text),public.vote_sa4_logo(uuid,text,text) to authenticated;
