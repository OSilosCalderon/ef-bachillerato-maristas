insert into public.assessment_grade_items(course_id,sa_code,item_key,title,position)
select c.id,d.sa_code,d.item_key,d.title,d.position
from public.courses c
cross join (values
  ('SA1','initial-assessment','Evaluación inicial',1),
  ('SA1','theory-self-assessment','Bloque teórico · Autoevaluación',2),
  ('SA1','personal-plan','Plan personal',3),
  ('SA1','session-follow-up','Diario y seguimiento de sesiones',4),
  ('SA1','questionnaire-completion','Realización de cuestionarios inicial',5),
  ('SA1','final-physical-tests','Tests de evaluación final',6),
  ('SA1','final-questionnaire-completion','Realización de cuestionarios final',7),
  ('SA2','initial-technical-tests','Pruebas técnicas · Evaluación inicial',1),
  ('SA2','final-technical-tests','Pruebas técnicas · Evaluación final',2),
  ('SA2','theory-self-assessment','Bloque teórico · Autoevaluación',3),
  ('SA2','sports-journal','Diario deportivo y seguimiento',4),
  ('SA2','questionnaire-completion','Realización de cuestionarios',5),
  ('SA2','procedural-decisions','Conocimiento y toma de decisiones',6),
  ('SA3','session-design','Diseño y realización de la sesión',1),
  ('SA3','game-reflections','Valoración de juegos',2),
  ('SA3','theory-block','Bloque teórico',3),
  ('SA3','attitude-self-assessment','Autoevaluación de actitud',4)
) as d(sa_code,item_key,title,position)
where c.bachillerato_year=1 and c.is_active
  and exists (select 1 from public.learning_situations s where s.course_id=c.id and s.code=d.sa_code)
on conflict do nothing;
