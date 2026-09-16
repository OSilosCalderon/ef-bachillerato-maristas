-- Keep SECURITY DEFINER policy helpers outside the exposed public API schema.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.can_read_questionnaire_definition(target_questionnaire uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_teacher()
    or exists (
      select 1
      from public.questionnaires q
      join public.learning_situations ls on ls.id = q.learning_situation_id
      join public.students s on s.course_id = ls.course_id
      where q.id = target_questionnaire
        and s.id = public.current_student_id()
        and s.active = true
        and ls.published = true
        and (
          (q.published = true and (q.opens_at is null or q.opens_at <= now()) and (q.closes_at is null or q.closes_at >= now()))
          or exists (select 1 from public.questionnaire_attempts a where a.questionnaire_id = q.id and a.student_id = s.id)
        )
    ), false
  );
$$;

create or replace function private.can_start_questionnaire(target_questionnaire uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(exists (
    select 1
    from public.questionnaires q
    join public.learning_situations ls on ls.id = q.learning_situation_id
    join public.students s on s.course_id = ls.course_id
    where q.id = target_questionnaire
      and s.id = public.current_student_id()
      and s.active = true
      and ls.published = true
      and q.published = true
      and (q.opens_at is null or q.opens_at <= now())
      and (q.closes_at is null or q.closes_at >= now())
  ), false);
$$;

revoke all on function private.can_read_questionnaire_definition(uuid) from public, anon;
revoke all on function private.can_start_questionnaire(uuid) from public, anon;
grant execute on function private.can_read_questionnaire_definition(uuid) to authenticated;
grant execute on function private.can_start_questionnaire(uuid) to authenticated;

drop policy if exists "questionnaires_read" on public.questionnaires;
create policy "questionnaires_read" on public.questionnaires
for select to authenticated using (private.can_read_questionnaire_definition(id));

drop policy if exists "questions_read_available_or_teacher" on public.questionnaire_questions;
create policy "questions_read_available_or_teacher" on public.questionnaire_questions
for select to authenticated using (private.can_read_questionnaire_definition(questionnaire_id));

drop policy if exists "options_read_available_or_teacher" on public.questionnaire_options;
create policy "options_read_available_or_teacher" on public.questionnaire_options
for select to authenticated using (
  exists (select 1 from public.questionnaire_questions qq where qq.id = questionnaire_options.question_id and private.can_read_questionnaire_definition(qq.questionnaire_id))
);

drop policy if exists "attempts_insert_own_open" on public.questionnaire_attempts;
create policy "attempts_insert_own_open" on public.questionnaire_attempts
for insert to authenticated with check (
  student_id = public.current_student_id() and status = 'in_progress' and submitted_at is null and private.can_start_questionnaire(questionnaire_id)
);

drop policy if exists "attempts_update_own" on public.questionnaire_attempts;
create policy "attempts_update_own" on public.questionnaire_attempts
for update to authenticated
using (student_id = public.current_student_id() and status = 'in_progress' and private.can_start_questionnaire(questionnaire_id))
with check (student_id = public.current_student_id());

drop policy if exists "responses_insert_own" on public.questionnaire_responses;
create policy "responses_insert_own" on public.questionnaire_responses
for insert to authenticated with check (
  exists (
    select 1 from public.questionnaire_attempts a
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
      and private.can_start_questionnaire(a.questionnaire_id)
      and exists (select 1 from public.questionnaire_questions qq where qq.id = questionnaire_responses.question_id and qq.questionnaire_id = a.questionnaire_id)
  )
);

drop policy if exists "responses_update_own" on public.questionnaire_responses;
create policy "responses_update_own" on public.questionnaire_responses
for update to authenticated
using (
  exists (
    select 1 from public.questionnaire_attempts a
    where a.id = questionnaire_responses.attempt_id and a.student_id = public.current_student_id() and a.status = 'in_progress'
      and private.can_start_questionnaire(a.questionnaire_id)
      and exists (select 1 from public.questionnaire_questions qq where qq.id = questionnaire_responses.question_id and qq.questionnaire_id = a.questionnaire_id)
  )
)
with check (
  exists (
    select 1 from public.questionnaire_attempts a
    where a.id = questionnaire_responses.attempt_id and a.student_id = public.current_student_id() and a.status = 'in_progress'
      and private.can_start_questionnaire(a.questionnaire_id)
      and exists (select 1 from public.questionnaire_questions qq where qq.id = questionnaire_responses.question_id and qq.questionnaire_id = a.questionnaire_id)
  )
);

revoke all on function public.can_read_questionnaire_definition(uuid) from public, anon, authenticated;
revoke all on function public.can_start_questionnaire(uuid) from public, anon, authenticated;
drop function public.can_read_questionnaire_definition(uuid);
drop function public.can_start_questionnaire(uuid);
