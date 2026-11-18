-- Instrumentos del cuaderno de SA3 para los cursos activos de 2.º con esa situación.
insert into public.assessment_grade_items (course_id, sa_code, item_key, title, position)
select c.id, 'SA3', item.item_key, item.title, item.position
from public.courses c
cross join (values
  ('theory-block', 'Bloque teórico', 1),
  ('self-assessment', 'Autoevaluación', 2),
  ('food-habit-plan', 'Creación del hábito de alimentación', 3),
  ('general-habit-plan', 'Creación de otro hábito', 4),
  ('habit-follow-up', 'Seguimiento de los hábitos', 5),
  ('habit-report', 'Informe breve de resultados', 6)
) as item(item_key, title, position)
where c.bachillerato_year = 2 and c.is_active
  and exists (
    select 1 from public.learning_situations s
    where s.course_id = c.id and s.code = 'SA3'
  )
on conflict do nothing;
