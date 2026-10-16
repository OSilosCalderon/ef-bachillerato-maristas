insert into public.assessment_grade_items(course_id,sa_code,item_key,title,position)
select c.id,'SA2','final-questionnaire-completion','Realización de cuestionarios final',4
from public.courses c
where c.bachillerato_year=2 and c.is_active
  and exists (select 1 from public.learning_situations s where s.course_id=c.id and s.code='SA2')
on conflict do nothing;
