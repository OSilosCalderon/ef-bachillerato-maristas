-- Keep column permissions and RLS: only the answer and timestamp may be updated.
create function public.submit_psychological_questionnaire(p_questionnaire_id uuid, p_answers jsonb)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  student uuid := public.current_student_id();
  attempt public.questionnaire_attempts%rowtype;
  expected integer;
  valid integer;
  receipt jsonb;
begin
  if auth.uid() is null or student is null then
    raise exception 'Vuelve a iniciar sesión con tu cuenta de alumno.';
  end if;
  -- Serialize retries for this student/questionnaire, including an uncertain network response.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(student::text || p_questionnaire_id::text, 0));
  select * into attempt from public.questionnaire_attempts
  where student_id=student and questionnaire_id=p_questionnaire_id;
  if attempt.id is null or attempt.status <> 'submitted' then
    if not private.can_start_questionnaire(p_questionnaire_id) or not exists (
      select 1 from public.questionnaires where id=p_questionnaire_id and instrument_code in ('GOES','BPNES')
    ) then raise exception 'Este cuestionario no está abierto para tu curso.'; end if;
    if p_answers is null or jsonb_typeof(p_answers) <> 'object' then raise exception 'Las respuestas no son válidas.'; end if;
    select count(*) into expected from public.questionnaire_questions where questionnaire_id=p_questionnaire_id;
    select count(*) into valid from jsonb_each_text(p_answers) a
      join public.questionnaire_questions q on q.id::text=a.key and q.questionnaire_id=p_questionnaire_id
      join public.questionnaire_options o on o.question_id=q.id and o.id::text=a.value;
    if expected=0 or valid<>expected or (select count(*) from jsonb_object_keys(p_answers))<>expected then
      raise exception 'Responde todos los enunciados con una opción válida antes de entregar.';
    end if;
    if attempt.id is null then
      insert into public.questionnaire_attempts(questionnaire_id,student_id)
      values(p_questionnaire_id,student) returning * into attempt;
    end if;
    insert into public.questionnaire_responses(attempt_id,question_id,answer,updated_at)
    select attempt.id,q.id,jsonb_build_object('option_id',o.id,'value',o.value,'label',o.label),now()
    from jsonb_each_text(p_answers) a
    join public.questionnaire_questions q on q.id::text=a.key and q.questionnaire_id=p_questionnaire_id
    join public.questionnaire_options o on o.question_id=q.id and o.id::text=a.value
    on conflict(attempt_id,question_id) do update set answer=excluded.answer,updated_at=excluded.updated_at;
    update public.questionnaire_attempts set status='submitted',submitted_at=now()
      where id=attempt.id returning * into attempt;
    if attempt.id is null or attempt.status<>'submitted' then raise exception 'No se ha podido confirmar la entrega.'; end if;
  end if;
  select jsonb_build_object('attempt',jsonb_build_object('id',attempt.id,'questionnaire_id',attempt.questionnaire_id,'status',attempt.status,'submitted_at',attempt.submitted_at),
    'responses',(select jsonb_agg(jsonb_build_object('attempt_id',r.attempt_id,'question_id',r.question_id,'answer',r.answer)) from public.questionnaire_responses r where r.attempt_id=attempt.id)) into receipt;
  return receipt;
end;
$$;
revoke all on function public.submit_psychological_questionnaire(uuid,jsonb) from public,anon;
grant execute on function public.submit_psychological_questionnaire(uuid,jsonb) to authenticated;
