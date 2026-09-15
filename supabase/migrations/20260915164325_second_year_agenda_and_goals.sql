-- Extiende el calendario existente sin modificar 1º.
alter table public.class_schedules drop constraint class_schedules_class_group_check;
alter table public.class_schedules add constraint class_schedules_class_group_check check (class_group in ('1ºA Bachillerato','1ºB Bachillerato','2º Bachillerato'));
alter table public.class_sessions drop constraint class_sessions_class_group_check;
alter table public.class_sessions add constraint class_sessions_class_group_check check (class_group in ('1ºA Bachillerato','1ºB Bachillerato','2º Bachillerato'));
alter table public.personal_training_plans add column if not exists secondary_objective text not null default '';
alter table public.personal_training_plans add column if not exists secondary_success_indicator text not null default '';

insert into public.class_schedules (academic_year,class_group,weekday,start_time,end_time,active)
values ('2026/2027','2º Bachillerato',1,'10:05','11:00',true),
('2026/2027','2º Bachillerato',2,'13:20','14:15',true),
('2026/2027','2º Bachillerato',3,'10:05','11:00',true),
('2026/2027','2º Bachillerato',4,'13:20','14:15',true)
on conflict (academic_year,class_group,weekday,start_time) do nothing;

-- DOE 116, 18/06/2026: resolución 15/06/2026. 2º: 11 septiembre–7 mayo.
-- Ajustes locales y del centro: el profesor cancela la sesión y añade el motivo.
insert into public.class_sessions (academic_year,class_group,session_date,start_time,end_time,status,note)
select '2026/2027','2º Bachillerato',d::date,
case when extract(isodow from d) in (1,3) then time '10:05' else time '13:20' end,
case when extract(isodow from d) in (1,3) then time '11:00' else time '14:15' end,
'scheduled',''
from generate_series(date '2026-09-11',date '2027-05-07',interval '1 day') as dates(d)
where extract(isodow from d) between 1 and 4
and d::date not in (date '2026-10-12',date '2026-11-02',date '2026-12-07',date '2026-12-08',date '2027-01-29',date '2027-02-08',date '2027-02-09')
and d::date not between date '2026-12-23' and date '2027-01-07'
and d::date not between date '2027-03-22' and date '2027-03-29'
on conflict (class_group,session_date,start_time) do nothing;
