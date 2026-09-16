create or replace function private.validate_questionnaire_submission()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  required_count integer;
  answered_count integer;
begin
  if old.status = 'in_progress' and new.status = 'submitted' then
    select count(*) into required_count
    from public.questionnaire_questions
    where questionnaire_id = new.questionnaire_id and required = true;

    select count(*) into answered_count
    from public.questionnaire_responses r
    join public.questionnaire_questions q on q.id = r.question_id
    where r.attempt_id = new.id
      and q.questionnaire_id = new.questionnaire_id
      and q.required = true;

    if answered_count <> required_count then
      raise exception 'All required questionnaire items must be answered before submission';
    end if;
    if new.submitted_at is null then
      raise exception 'submitted_at is required when submitting a questionnaire';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists validate_questionnaire_submission on public.questionnaire_attempts;
create trigger validate_questionnaire_submission
before update of status, submitted_at on public.questionnaire_attempts
for each row execute function private.validate_questionnaire_submission();
