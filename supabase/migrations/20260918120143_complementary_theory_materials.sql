create table public.complementary_theory_materials (
  id uuid primary key default gen_random_uuid(),
  topic_slug text not null references public.theory_challenge_topics(slug),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  external_url text check (external_url ~* '^https?://[^[:space:]]+$'),
  storage_path text unique,
  file_name text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((external_url is not null and storage_path is null) or (external_url is null and storage_path is not null and file_name is not null))
);
create index complementary_theory_topic on public.complementary_theory_materials(topic_slug);
alter table public.complementary_theory_materials enable row level security;
revoke all on public.complementary_theory_materials from public, anon, authenticated;
grant select, insert, update on public.complementary_theory_materials to authenticated;
create policy complementary_teacher on public.complementary_theory_materials for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());
create policy complementary_student_read on public.complementary_theory_materials for select to authenticated
using (published and exists (
 select 1 from public.students s join public.courses c on c.id=s.course_id
 join public.theory_challenge_topics t on t.course_year=c.bachillerato_year
 join public.learning_situations ls on ls.course_id=c.id and ls.code=t.sa_code
 where s.id=public.current_student_id() and s.active and c.is_active and t.slug=topic_slug and ls.published
));
create trigger complementary_timestamp before insert or update on public.complementary_theory_materials
for each row execute function public.stamp_challenge_response();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('theory-complementary','theory-complementary',false,20971520,array[
 'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
 'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp'
]);
create policy complementary_files_read on storage.objects for select to authenticated using (
 bucket_id='theory-complementary' and (public.is_teacher() or exists (
 select 1 from public.complementary_theory_materials m where m.storage_path=objects.name and m.published
 ))
);
create policy complementary_files_upload on storage.objects for insert to authenticated with check (
 bucket_id='theory-complementary' and public.is_teacher() and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy complementary_files_cleanup on storage.objects for delete to authenticated using (
 bucket_id='theory-complementary' and public.is_teacher()
);

-- Keep Spanish titles and challenge prompts in UTF-8.
update public.theory_challenge_topics set title='Entrenar es adaptarse', prompt='Organiza tres sesiones semanales para uno de estos deportes y señala cuál es el estímulo principal, dónde colocarías recuperación y cuándo repetirías el trabajo intenso.' where slug='adaptacion-y-supercompensacion';
update public.theory_challenge_topics set title='Principios del entrenamiento', prompt='Elige un deporte y explica cómo aplicarías individualización, especificidad y progresión a una capacidad concreta.' where slug='principios-del-entrenamiento';
update public.theory_challenge_topics set title='Carga y capacidades físicas', prompt='Diseña dos sesiones para la misma capacidad cambiando solo una variable de carga. Explica qué efecto esperas del cambio.' where slug='carga-y-capacidades-fisicas';
update public.theory_challenge_topics set title='Fuerza y contracción muscular', prompt='Escoge un gesto deportivo y localiza una fase concéntrica, una excéntrica y una situación donde sea útil una acción isométrica.' where slug='fuerza-y-contraccion-muscular';
update public.theory_challenge_topics set title='Resistencia y métodos de trabajo', prompt='Convierte una sesión continua en una sesión intervalada manteniendo aproximadamente el mismo tiempo total de trabajo. Compara sensaciones y objetivo.' where slug='resistencia-y-metodos';
update public.theory_challenge_topics set title='Velocidad, movilidad y estabilidad', prompt='Crea un ejercicio de 10–15 segundos para mejorar velocidad y control en un deporte de raqueta o equipo. Explica por qué necesita pausa suficiente.' where slug='velocidad-movilidad-y-estabilidad';
update public.theory_challenge_topics set title='Planificación del entrenamiento', prompt='Construye un microciclo de 7 días con tres sesiones. Escribe el objetivo de cada día y justifica por qué están colocadas en ese orden.' where slug='planificacion-del-entrenamiento';
update public.theory_challenge_topics set title='Periodización y plan personal', prompt='Diseña cuatro semanas para una capacidad de tu deporte: indica qué cambia de una semana a otra y qué prueba usarías antes y después.' where slug='periodizacion-y-plan-personal';
update public.theory_challenge_topics set title='Flexibilidad y amplitud de movimiento', prompt='Elige una acción deportiva que requiera amplitud de movimiento. Identifica dos articulaciones implicadas y propone un ejercicio de movilidad y otro de control específico.' where slug='flexibilidad-y-amplitud-de-movimiento';
update public.theory_challenge_topics set title='¿Cuál es mi punto de partida?', prompt='Escoge tres datos de tu evaluación: identifica una fortaleza, una prioridad y un objetivo. Después escribe un indicador que te permita comprobar en diciembre si la estrategia ha funcionado.' where slug='2bach-sa1-punto-partida';
update public.theory_challenge_topics set title='Entrenar con cabeza', prompt='Diseña dos versiones de la misma tarea: una para priorizar velocidad y otra para priorizar resistencia. Explica qué variables de carga has cambiado.' where slug='2bach-sa2-condicion-fisica';
update public.theory_challenge_topics set title='Más que entrenar', prompt='Elige un hábito durante cuatro semanas. Describe situación inicial, cambio concreto, forma de seguimiento y qué reajuste harías si el plan no es sostenible.' where slug='2bach-sa3-habitos-saludables';
update public.theory_challenge_topics set title='Creamos un evento deportivo', prompt='Diseña en una sola página propósito, participantes, formato, recursos, cronograma, medidas de seguridad y criterio de evaluación para un evento escolar.' where slug='2bach-sa4-evento-deportivo';
update public.theory_challenge_topics set title='Extremadura se mueve', prompt='Crea una secuencia breve que comunique una idea vinculada a Extremadura sin utilizar texto durante la representación. Justifica qué recursos corporales y espaciales elegiste.' where slug='2bach-sa5-cultura-cuerpo-expresion';
update public.theory_challenge_topics set title='Muévete por tu entorno', prompt='Diseña una intervención pequeña para clase, centro, familia o barrio: necesidad, destinatarios, propuesta, recursos, acción y dos indicadores para evaluar el impacto.' where slug='2bach-sa6-comunidad-activa';
