-- Validated psychological questionnaires for SA1 in 1st and 2nd Bachillerato.
-- Student clients may read only their course definitions and their own answers.
-- Scoring keys, individual statistics and class aggregates remain teacher-only.

alter table public.questionnaires
  add column if not exists instrument_code text,
  add column if not exists assessment_phase text,
  add column if not exists source_reference text;

alter table public.questionnaires drop constraint if exists questionnaires_instrument_code_check;
alter table public.questionnaires add constraint questionnaires_instrument_code_check
  check (instrument_code is null or instrument_code in ('GOES', 'BPNES'));
alter table public.questionnaires drop constraint if exists questionnaires_assessment_phase_check;
alter table public.questionnaires add constraint questionnaires_assessment_phase_check
  check (assessment_phase is null or assessment_phase in ('initial', 'final'));

create unique index if not exists questionnaires_instrument_phase_unique
  on public.questionnaires (learning_situation_id, instrument_code, assessment_phase)
  where instrument_code is not null and assessment_phase is not null;

create table if not exists public.questionnaire_question_dimensions (
  question_id uuid primary key references public.questionnaire_questions(id) on delete cascade,
  dimension text not null,
  dimension_label text not null
);
alter table public.questionnaire_question_dimensions enable row level security;
create policy "question_dimensions_teacher_only" on public.questionnaire_question_dimensions
for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

create or replace function public.can_read_questionnaire_definition(target_questionnaire uuid)
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
          (q.published = true
            and (q.opens_at is null or q.opens_at <= now())
            and (q.closes_at is null or q.closes_at >= now()))
          or exists (
            select 1 from public.questionnaire_attempts a
            where a.questionnaire_id = q.id and a.student_id = s.id
          )
        )
    ), false
  );
$$;

create or replace function public.can_start_questionnaire(target_questionnaire uuid)
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

revoke all on function public.can_read_questionnaire_definition(uuid) from public;
revoke all on function public.can_start_questionnaire(uuid) from public;
grant execute on function public.can_read_questionnaire_definition(uuid) to authenticated;
grant execute on function public.can_start_questionnaire(uuid) to authenticated;

drop policy if exists "questionnaires_read" on public.questionnaires;
create policy "questionnaires_read" on public.questionnaires
for select to authenticated using (public.can_read_questionnaire_definition(id));

drop policy if exists "questions_read_available_or_teacher" on public.questionnaire_questions;
create policy "questions_read_available_or_teacher" on public.questionnaire_questions
for select to authenticated using (public.can_read_questionnaire_definition(questionnaire_id));

drop policy if exists "options_read_available_or_teacher" on public.questionnaire_options;
create policy "options_read_available_or_teacher" on public.questionnaire_options
for select to authenticated using (
  exists (
    select 1 from public.questionnaire_questions qq
    where qq.id = questionnaire_options.question_id
      and public.can_read_questionnaire_definition(qq.questionnaire_id)
  )
);

drop policy if exists "attempts_insert_own_open" on public.questionnaire_attempts;
create policy "attempts_insert_own_open" on public.questionnaire_attempts
for insert to authenticated with check (
  student_id = public.current_student_id()
  and status = 'in_progress'
  and submitted_at is null
  and public.can_start_questionnaire(questionnaire_id)
);

drop policy if exists "attempts_update_own" on public.questionnaire_attempts;
create policy "attempts_update_own" on public.questionnaire_attempts
for update to authenticated
using (
  student_id = public.current_student_id()
  and status = 'in_progress'
  and public.can_start_questionnaire(questionnaire_id)
)
with check (student_id = public.current_student_id());

drop policy if exists "responses_insert_own" on public.questionnaire_responses;
create policy "responses_insert_own" on public.questionnaire_responses
for insert to authenticated with check (
  exists (
    select 1 from public.questionnaire_attempts a
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
      and public.can_start_questionnaire(a.questionnaire_id)
      and exists (select 1 from public.questionnaire_questions qq where qq.id = questionnaire_responses.question_id and qq.questionnaire_id = a.questionnaire_id)
  )
);

drop policy if exists "responses_update_own" on public.questionnaire_responses;
create policy "responses_update_own" on public.questionnaire_responses
for update to authenticated
using (
  exists (
    select 1 from public.questionnaire_attempts a
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
      and public.can_start_questionnaire(a.questionnaire_id)
      and exists (select 1 from public.questionnaire_questions qq where qq.id = questionnaire_responses.question_id and qq.questionnaire_id = a.questionnaire_id)
  )
)
with check (
  exists (
    select 1 from public.questionnaire_attempts a
    where a.id = questionnaire_responses.attempt_id
      and a.student_id = public.current_student_id()
      and a.status = 'in_progress'
      and public.can_start_questionnaire(a.questionnaire_id)
      and exists (select 1 from public.questionnaire_questions qq where qq.id = questionnaire_responses.question_id and qq.questionnaire_id = a.questionnaire_id)
  )
);

with teacher as (
  select id from public.profiles where role = 'teacher' order by created_at limit 1
), targets as (
  select ls.id as learning_situation_id, c.bachillerato_year
  from public.learning_situations ls
  join public.courses c on c.id = ls.course_id
  where ls.code = 'SA1' and c.bachillerato_year in (1, 2)
), instruments(code, title, description, source_reference) as (
  values
    ('GOES', 'Orientaciones de meta en el ejercicio (GOES)', 'Explora cuándo sientes más éxito al realizar ejercicio.', 'Kilpatrick, Bartholomew y Riemer (2003); adaptación española: Moreno et al. (2007).'),
    ('BPNES', 'Necesidades psicológicas básicas (BPNES)', 'Explora cómo percibes autonomía, competencia y relación en Educación Física.', 'Vlachopoulos y Michailidou (2006); adaptación a Educación Física: Moreno et al. (2008).')
), phases(phase, phase_label, opens_at, closes_at) as (
  values
    ('initial', 'Evaluación inicial', '2026-09-14 00:00:00+02'::timestamptz, '2026-10-31 23:59:59+01'::timestamptz),
    ('final', 'Evaluación final', '2026-11-23 00:00:00+01'::timestamptz, '2026-12-22 23:59:59+01'::timestamptz)
)
insert into public.questionnaires (
  learning_situation_id, title, description, instructions, published,
  opens_at, closes_at, created_by, instrument_code, assessment_phase, source_reference
)
select t.learning_situation_id,
       i.title || ' · ' || p.phase_label,
       i.description,
       'Responde con sinceridad pensando en tus clases de Educación Física. No hay respuestas correctas o incorrectas. Selecciona una opción del 1 al 5 en cada enunciado.',
       true, p.opens_at, p.closes_at, teacher.id, i.code, p.phase, i.source_reference
from targets t cross join instruments i cross join phases p cross join teacher
on conflict (learning_situation_id, instrument_code, assessment_phase)
where instrument_code is not null and assessment_phase is not null
do update set
  title = excluded.title,
  description = excluded.description,
  instructions = excluded.instructions,
  published = excluded.published,
  opens_at = excluded.opens_at,
  closes_at = excluded.closes_at,
  source_reference = excluded.source_reference,
  updated_at = now();

with items(instrument_code, position, prompt, dimension, dimension_label) as (
  values
    ('GOES',1,'Aprendo cosas y eso me hace querer participar más','task','Orientación a la tarea'),
    ('GOES',2,'Puedo hacerlo mejor que mis amigos','ego','Orientación al ego'),
    ('GOES',3,'Otros no pueden hacerlo tan bien como yo','ego','Orientación al ego'),
    ('GOES',4,'Aprendo algo nuevo a base de practicarlo intensamente','task','Orientación a la tarea'),
    ('GOES',5,'Algo que aprendo me hace querer ir y participar más','task','Orientación a la tarea'),
    ('GOES',6,'Soy el mejor','ego','Orientación al ego'),
    ('GOES',7,'Una habilidad que aprendo me hace sentir realmente bien','task','Orientación a la tarea'),
    ('GOES',8,'Soy el único que puede realizarlo a una gran intensidad','ego','Orientación al ego'),
    ('GOES',9,'Estoy aprendiendo y divirtiéndome','task','Orientación a la tarea'),
    ('GOES',10,'Otros no lo realizan tan bien como yo','ego','Orientación al ego'),
    ('BPNES',1,'Los ejercicios que realizo se ajustan a mis intereses','autonomy','Autonomía'),
    ('BPNES',2,'Siento que he tenido una gran progresión con respecto al objetivo final que me he propuesto','competence','Competencia'),
    ('BPNES',3,'Me siento muy cómodo/a cuando hago ejercicio con los/as demás compañeros/as','relatedness','Relación con los demás'),
    ('BPNES',4,'La forma de realizar los ejercicios coincide perfectamente con la forma en que yo quiero hacerlos','autonomy','Autonomía'),
    ('BPNES',5,'Realizo los ejercicios eficazmente','competence','Competencia'),
    ('BPNES',6,'Me relaciono de forma muy amistosa con el resto de compañeros/as','relatedness','Relación con los demás'),
    ('BPNES',7,'La forma de realizar los ejercicios responde a mis deseos','autonomy','Autonomía'),
    ('BPNES',8,'El ejercicio es una actividad que hago muy bien','competence','Competencia'),
    ('BPNES',9,'Siento que me puedo comunicar abiertamente con mis compañeros/as','relatedness','Relación con los demás'),
    ('BPNES',10,'Tengo la oportunidad de elegir cómo realizar los ejercicios','autonomy','Autonomía'),
    ('BPNES',11,'Pienso que puedo cumplir con las exigencias de la clase','competence','Competencia'),
    ('BPNES',12,'Me siento muy cómodo/a con los/as compañeros/as','relatedness','Relación con los demás')
)
insert into public.questionnaire_questions (
  questionnaire_id, prompt, question_type, required, position, score_enabled, metadata
)
select q.id, i.prompt, 'scale_1_5'::public.question_type, true, i.position, true, '{}'::jsonb
from public.questionnaires q
join items i on i.instrument_code = q.instrument_code
where q.assessment_phase in ('initial','final')
on conflict (questionnaire_id, position) do update set
  prompt = excluded.prompt,
  question_type = excluded.question_type,
  required = excluded.required,
  score_enabled = excluded.score_enabled,
  metadata = excluded.metadata;

with items(instrument_code, position, dimension, dimension_label) as (
  values
    ('GOES',1,'task','Orientación a la tarea'), ('GOES',2,'ego','Orientación al ego'),
    ('GOES',3,'ego','Orientación al ego'), ('GOES',4,'task','Orientación a la tarea'),
    ('GOES',5,'task','Orientación a la tarea'), ('GOES',6,'ego','Orientación al ego'),
    ('GOES',7,'task','Orientación a la tarea'), ('GOES',8,'ego','Orientación al ego'),
    ('GOES',9,'task','Orientación a la tarea'), ('GOES',10,'ego','Orientación al ego'),
    ('BPNES',1,'autonomy','Autonomía'), ('BPNES',2,'competence','Competencia'),
    ('BPNES',3,'relatedness','Relación con los demás'), ('BPNES',4,'autonomy','Autonomía'),
    ('BPNES',5,'competence','Competencia'), ('BPNES',6,'relatedness','Relación con los demás'),
    ('BPNES',7,'autonomy','Autonomía'), ('BPNES',8,'competence','Competencia'),
    ('BPNES',9,'relatedness','Relación con los demás'), ('BPNES',10,'autonomy','Autonomía'),
    ('BPNES',11,'competence','Competencia'), ('BPNES',12,'relatedness','Relación con los demás')
)
insert into public.questionnaire_question_dimensions (question_id, dimension, dimension_label)
select qq.id, i.dimension, i.dimension_label
from public.questionnaire_questions qq
join public.questionnaires q on q.id = qq.questionnaire_id
join items i on i.instrument_code = q.instrument_code and i.position = qq.position
where q.assessment_phase in ('initial','final')
on conflict (question_id) do update set dimension = excluded.dimension, dimension_label = excluded.dimension_label;

insert into public.questionnaire_options (question_id, label, value, position)
select qq.id,
       case n
         when 1 then 'Totalmente en desacuerdo'
         when 2 then 'Algo en desacuerdo'
         when 3 then 'Neutro'
         when 4 then 'Algo de acuerdo'
         when 5 then 'Totalmente de acuerdo'
       end,
       n::text,
       n
from public.questionnaire_questions qq
join public.questionnaires q on q.id = qq.questionnaire_id
cross join generate_series(1,5) n
where q.instrument_code in ('GOES','BPNES') and q.assessment_phase in ('initial','final')
on conflict (question_id, position) do update set label = excluded.label, value = excluded.value;

insert into public.questionnaire_option_scores (option_id, score)
select qo.id, qo.position::numeric
from public.questionnaire_options qo
join public.questionnaire_questions qq on qq.id = qo.question_id
join public.questionnaires q on q.id = qq.questionnaire_id
where q.instrument_code in ('GOES','BPNES') and q.assessment_phase in ('initial','final')
on conflict (option_id) do update set score = excluded.score;

create index if not exists idx_questionnaires_instrument_phase
  on public.questionnaires (instrument_code, assessment_phase);

comment on column public.questionnaires.instrument_code is 'Validated instrument identifier. Scoring dimensions remain hidden from student clients.';
comment on column public.questionnaires.assessment_phase is 'Initial or final SA1 measurement period.';
