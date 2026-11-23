-- Keep the previous single-choice votes as history. New ballots rank every logo.
create table public.sa4_logo_ballots (
  course_id uuid not null,
  student_id uuid not null,
  scores jsonb not null check (jsonb_typeof(scores) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (course_id, student_id),
  foreign key (course_id, student_id) references public.sa4_delegation_members(course_id, student_id)
);
alter table public.sa4_logo_ballots enable row level security;
revoke all on public.sa4_logo_ballots from public, anon, authenticated;
grant select, insert, update on public.sa4_logo_ballots to authenticated;

create policy sa4_ballots_read on public.sa4_logo_ballots for select to authenticated
using (public.sa4_course_visible(course_id));
create policy sa4_ballots_insert on public.sa4_logo_ballots for insert to authenticated
with check (student_id = (select public.current_student_id()) and public.sa4_course_visible(course_id)
  and exists(select 1 from public.sa4_event_settings s where s.course_id=sa4_logo_ballots.course_id and s.phase='voting'));
create policy sa4_ballots_update on public.sa4_logo_ballots for update to authenticated
using (student_id = (select public.current_student_id()) and public.sa4_course_visible(course_id))
with check (student_id = (select public.current_student_id()) and public.sa4_course_visible(course_id)
  and exists(select 1 from public.sa4_event_settings s where s.course_id=sa4_logo_ballots.course_id and s.phase='voting'));

create function public.sa4_check_ballot() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='UPDATE' and (new.course_id<>old.course_id or new.student_id<>old.student_id) then raise exception 'SA4_FORBIDDEN'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.course_id::text,44));
  if not exists(select 1 from public.sa4_event_settings where course_id=new.course_id and phase='voting') then raise exception 'SA4_VOTING_CLOSED'; end if;
  if jsonb_typeof(new.scores) is distinct from 'object' then raise exception 'SA4_RANKING_INVALID'; end if;
  if (select count(*) from jsonb_each(new.scores))<>8
    or (select count(*) from public.sa4_delegations where course_id=new.course_id)<>8
    or exists(select 1 from jsonb_each(new.scores) p where jsonb_typeof(p.value)<>'number' or (p.value#>>'{}')!~'^[1-8]$')
    or (select count(distinct value) from jsonb_each(new.scores))<>8
    or exists(select 1 from public.sa4_delegations d where d.course_id=new.course_id and not(new.scores ? d.country_code))
    or (select count(*) from public.sa4_team_projects where course_id=new.course_id and content->'identity'->>'submitted'='true')<>8
  then raise exception 'SA4_RANKING_INVALID'; end if;
  new.updated_at:=clock_timestamp();
  return new;
end;
$$;
revoke all on function public.sa4_check_ballot() from public,anon,authenticated;
create trigger sa4_ballot_validate before insert or update on public.sa4_logo_ballots for each row execute function public.sa4_check_ballot();

create function public.vote_sa4_logos(p_course uuid,p_country text,p_scores jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare current_student uuid;
begin
  current_student:=(select public.current_student_id());
  if not public.sa4_course_visible(p_course) or (select public.is_teacher()) or not exists(
    select 1 from public.sa4_delegation_members m where m.course_id=p_course and m.country_code=p_country and m.student_id=current_student
  ) then raise exception 'SA4_FORBIDDEN'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_course::text,44));
  insert into public.sa4_logo_ballots(course_id,student_id,scores) values(p_course,current_student,p_scores)
  on conflict(course_id,student_id) do update set scores=excluded.scores;
  return p_scores;
end;
$$;
revoke all on function public.vote_sa4_logos(uuid,text,jsonb) from public,anon;
grant execute on function public.vote_sa4_logos(uuid,text,jsonb) to authenticated;
-- The obsolete endpoint cannot bypass the complete-ballot rule.
revoke insert,update on public.sa4_logo_votes from authenticated;
revoke execute on function public.vote_sa4_logo(uuid,text,text) from public,anon,authenticated;

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
    if exists(select 1 from public.sa4_logo_ballots where course_id=new.course_id)
      or exists(select 1 from public.sa4_logo_votes where course_id=new.course_id) then raise exception 'SA4_VOTES_EXIST'; end if;
  elsif new.phase<>'closed' or old.phase<>'voting' then raise exception 'SA4_PHASE'; end if;
  return new;
end;
$$;
