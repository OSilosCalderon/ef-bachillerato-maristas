-- Mantiene el estado publicado existente de 1º y añade las situaciones ya accesibles de 2º.
alter table public.learning_situations drop constraint learning_situations_code_check;
alter table public.learning_situations add constraint learning_situations_code_check check (code in ('SA1','SA2','SA3','SA4','SA5','SA6'));
insert into public.learning_situations (course_id,code,title,position,published)
select c.id, v.code, v.title, v.position, true from public.courses c
cross join (values ('SA1','¿Cuál es mi punto de partida?',1),('SA2','Entrenar con cabeza',2),('SA3','Hábitos para una vida saludable',3),('SA4','Creamos un evento deportivo',4),('SA5','Extremadura se mueve',5),('SA6','Muévete por tu entorno',6)) as v(code,title,position)
where c.bachillerato_year=2 and c.is_active
on conflict (course_id,code) do nothing;
