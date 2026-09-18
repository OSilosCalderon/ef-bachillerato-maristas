create table public.theory_challenge_topics (
  slug text primary key,
  course_year smallint not null check (course_year in (1,2)),
  sa_code text not null check (sa_code ~ '^SA[1-6]$'),
  title text not null,
  prompt text not null
);
alter table public.theory_challenge_topics enable row level security;
grant select on public.theory_challenge_topics to authenticated;
create policy challenge_topics_read on public.theory_challenge_topics for select to authenticated using (true);
insert into public.theory_challenge_topics(slug,course_year,sa_code,title,prompt) values
('adaptacion-y-supercompensacion',1,'SA1','Entrenar es adaptarse','Organiza tres sesiones semanales para uno de estos deportes y seÃ±ala cuÃ¡l es el estÃ­mulo principal, dÃ³nde colocarÃ­as recuperaciÃ³n y cuÃ¡ndo repetirÃ­as el trabajo intenso.'),
('principios-del-entrenamiento',1,'SA1','Principios del entrenamiento','Elige un deporte y explica cÃ³mo aplicarÃ­as individualizaciÃ³n, especificidad y progresiÃ³n a una capacidad concreta.'),
('carga-y-capacidades-fisicas',1,'SA1','Carga y capacidades fÃ­sicas','DiseÃ±a dos sesiones para la misma capacidad cambiando solo una variable de carga. Explica quÃ© efecto esperas del cambio.'),
('fuerza-y-contraccion-muscular',1,'SA1','Fuerza y contracciÃ³n muscular','Escoge un gesto deportivo y localiza una fase concÃ©ntrica, una excÃ©ntrica y una situaciÃ³n donde sea Ãºtil una acciÃ³n isomÃ©trica.'),
('resistencia-y-metodos',1,'SA1','Resistencia y mÃ©todos de trabajo','Convierte una sesiÃ³n continua en una sesiÃ³n intervalada manteniendo aproximadamente el mismo tiempo total de trabajo. Compara sensaciones y objetivo.'),
('velocidad-movilidad-y-estabilidad',1,'SA1','Velocidad, movilidad y estabilidad','Crea un ejercicio de 10â€“15 segundos para mejorar velocidad y control en un deporte de raqueta o equipo. Explica por quÃ© necesita pausa suficiente.'),
('planificacion-del-entrenamiento',1,'SA1','PlanificaciÃ³n del entrenamiento','Construye un microciclo de 7 dÃ­as con tres sesiones. Escribe el objetivo de cada dÃ­a y justifica por quÃ© estÃ¡n colocadas en ese orden.'),
('periodizacion-y-plan-personal',1,'SA1','PeriodizaciÃ³n y plan personal','DiseÃ±a cuatro semanas para una capacidad de tu deporte: indica quÃ© cambia de una semana a otra y quÃ© prueba usarÃ­as antes y despuÃ©s.'),
('flexibilidad-y-amplitud-de-movimiento',1,'SA1','Flexibilidad y amplitud de movimiento','Elige una acciÃ³n deportiva que requiera amplitud de movimiento. Identifica dos articulaciones implicadas y propone un ejercicio de movilidad y otro de control especÃ­fico.'),
('2bach-sa1-punto-partida',2,'SA1','Â¿CuÃ¡l es mi punto de partida?','Escoge tres datos de tu evaluaciÃ³n: identifica una fortaleza, una prioridad y un objetivo. DespuÃ©s escribe un indicador que te permita comprobar en diciembre si la estrategia ha funcionado.'),
('2bach-sa2-condicion-fisica',2,'SA2','Entrenar con cabeza','DiseÃ±a dos versiones de la misma tarea: una para priorizar velocidad y otra para priorizar resistencia. Explica quÃ© variables de carga has cambiado.'),
('2bach-sa3-habitos-saludables',2,'SA3','MÃ¡s que entrenar','Elige un hÃ¡bito durante cuatro semanas. Describe situaciÃ³n inicial, cambio concreto, forma de seguimiento y quÃ© reajuste harÃ­as si el plan no es sostenible.'),
('2bach-sa4-evento-deportivo',2,'SA4','Creamos un evento deportivo','DiseÃ±a en una sola pÃ¡gina propÃ³sito, participantes, formato, recursos, cronograma, medidas de seguridad y criterio de evaluaciÃ³n para un evento escolar.'),
('2bach-sa5-cultura-cuerpo-expresion',2,'SA5','Extremadura se mueve','Crea una secuencia breve que comunique una idea vinculada a Extremadura sin utilizar texto durante la representaciÃ³n. Justifica quÃ© recursos corporales y espaciales elegiste.'),
('2bach-sa6-comunidad-activa',2,'SA6','MuÃ©vete por tu entorno','DiseÃ±a una intervenciÃ³n pequeÃ±a para clase, centro, familia o barrio: necesidad, destinatarios, propuesta, recursos, acciÃ³n y dos indicadores para evaluar el impacto.');

create table public.theory_challenge_responses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  topic_slug text not null references public.theory_challenge_topics(slug),
  answer text not null check (char_length(btrim(answer)) between 1 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id,topic_slug)
);
alter table public.theory_challenge_responses enable row level security;
grant select, insert on public.theory_challenge_responses to authenticated;
grant update(answer) on public.theory_challenge_responses to authenticated;

create policy challenge_responses_read on public.theory_challenge_responses
for select to authenticated using (student_id = public.current_student_id() or public.is_teacher());

create policy challenge_responses_insert on public.theory_challenge_responses
for insert to authenticated with check (
  student_id = public.current_student_id()
  and exists (
    select 1 from public.students s
    join public.courses c on c.id=s.course_id
    join public.theory_challenge_topics t on t.course_year=c.bachillerato_year
    join public.learning_situations ls on ls.course_id=c.id and ls.code=t.sa_code
    where s.id=student_id and s.active and c.is_active and t.slug=topic_slug and ls.published
  )
);
create policy challenge_responses_update on public.theory_challenge_responses
for update to authenticated using (student_id = public.current_student_id())
with check (
  student_id = public.current_student_id()
  and exists (
    select 1 from public.students s
    join public.courses c on c.id=s.course_id
    join public.theory_challenge_topics t on t.course_year=c.bachillerato_year
    join public.learning_situations ls on ls.course_id=c.id and ls.code=t.sa_code
    where s.id=student_id and s.active and c.is_active and t.slug=topic_slug and ls.published
  )
);

create function public.stamp_challenge_response() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  if TG_OP = 'INSERT' then new.created_at = now(); end if;
  return new;
end;
$$;
revoke all on function public.stamp_challenge_response() from public, anon, authenticated;
create trigger stamp_challenge_response before insert or update on public.theory_challenge_responses
for each row execute function public.stamp_challenge_response();
