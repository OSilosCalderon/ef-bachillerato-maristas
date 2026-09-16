"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SECOND_YEAR_AGENDA_GROUP, SECOND_YEAR_AGENDA_YEAR } from "@/lib/second-year-agenda-calendar";
import { FIRST_YEAR_CALENDAR_GROUPS, firstYearCalendarGroup } from "@/lib/class-groups";

type Session = { id: string; class_group: string; session_date: string; start_time: string; end_time: string; status: string; note: string | null };
const months = ["2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06"];
const dateLabel = (date: string) => new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));
const firstYearGroups: string[] = [...FIRST_YEAR_CALENDAR_GROUPS];
const scheduleLabels: Record<string, string> = {
  "1ºA Bachillerato": "Lunes 09:10–10:05 · jueves 10:05–11:00",
  "1ºB Bachillerato": "Lunes 12:25–13:20 · viernes 11:30–12:25",
  [SECOND_YEAR_AGENDA_GROUP]: "Lunes y miércoles 10:05–11:00 · martes y jueves 13:20–14:15",
};

export function SecondYearAgenda({ teacher = false, courseYear = 2 }: { teacher?: boolean; courseYear?: 1 | 2 }) {
  const [group, setGroup] = useState(courseYear === 1 ? firstYearGroups[0] : SECOND_YEAR_AGENDA_GROUP);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit" }).format(new Date());
    return months.includes(now) ? now : months[0];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      if (active) { setLoading(true); setError(""); }
      try {
        const supabase = createClient();
        let selectedGroup = group;
        if (!teacher && courseYear === 1) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) throw new Error("No se ha podido comprobar tu grupo.");
          const { data: profile, error: profileError } = await supabase.from("profiles").select("class_group").eq("id", user.id).single();
          const calendarGroup = firstYearCalendarGroup(profile?.class_group);
          if (profileError || !calendarGroup) throw new Error("Tu cuenta no tiene asignado un grupo de 1º. Consulta con el profesor.");
          selectedGroup = calendarGroup;
          if (active) setGroup(selectedGroup);
        }
        const { data, error } = await supabase.from("class_sessions").select("id,class_group,session_date,start_time,end_time,status,note")
          .eq("academic_year", SECOND_YEAR_AGENDA_YEAR).eq("class_group", selectedGroup).order("session_date").order("start_time");
        if (error) throw error;
        if (active) setSessions(data ?? []);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "No se ha podido cargar la agenda. Recarga para volver a intentarlo."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [courseYear, group, teacher]);
  const visible = sessions.filter((session) => session.session_date.startsWith(month));
  return <section className="card space-y-5 p-5 sm:p-8">
    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">{group}</p><h2 className="mt-1 text-2xl font-extrabold">Agenda de clases</h2><p className="mt-2 text-sm leading-6 text-slate-600">{scheduleLabels[group]}. Sesiones de 55 minutos.</p></div>
    {teacher && <label className="block text-sm font-bold">Grupo<select value={group} onChange={(event) => setGroup(event.target.value)} className="mt-2 block w-full rounded-xl border p-3 sm:w-auto">{[...firstYearGroups, SECOND_YEAR_AGENDA_GROUP].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>}
    {group === SECOND_YEAR_AGENDA_GROUP && <p className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">Distribución orientativa: lunes, fuerza y técnica; martes, resistencia moderada y movilidad; miércoles, velocidad y saltos con recuperación; jueves, práctica deportiva y revisión del plan. Reserva tiempo para calentamiento, organización y vuelta a la calma. La planificación del profesor en cada fecha tiene prioridad.</p>}
    <label className="block text-sm font-bold">Mes de la agenda<select value={month} onChange={(event) => setMonth(event.target.value)} className="mt-2 block w-full rounded-xl border p-3 sm:w-auto">{months.map((value) => <option key={value} value={value}>{new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(`${value}-01T12:00:00`))}</option>)}</select></label>
    {loading && <p role="status">Cargando agenda…</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
    {!loading && !error && <div className="grid gap-3 md:grid-cols-2">{visible.map((session) => <AgendaSession key={session.id} session={session} teacher={teacher} onSaved={(saved) => setSessions((current) => current.map((item) => item.id === saved.id ? saved : item))}/>)}{!visible.length && <p className="text-sm text-slate-500">No hay sesiones programadas en este mes.</p>}</div>}
    <p className="text-xs leading-5 text-slate-500">Calendario 2026/2027: excluye festivos autonómicos, Navidad, Carnaval y Semana Santa. {group === SECOND_YEAR_AGENDA_GROUP ? "2º termina las clases en mayo." : "1º mantiene sus sesiones hasta junio."} El profesor puede cancelar clases por ajustes locales o del centro. <a className="underline" href="https://doe.juntaex.es/otrosFormatos/html.php?anio=2026&doe=1160o&xml=2026061567" target="_blank" rel="noreferrer">Calendario oficial de Extremadura</a>.</p>
  </section>;
}

function AgendaSession({ session, teacher, onSaved }: { session: Session; teacher: boolean; onSaved: (session: Session) => void }) {
  const [draft, setDraft] = useState(session);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function save() {
    setMessage(""); setFailed(false);
    if (!draft.start_time || !draft.end_time || draft.end_time <= draft.start_time) { setFailed(true); setMessage("La hora de fin debe ser posterior al inicio."); return; }
    setSaving(true);
    try {
      const { data, error } = await createClient().from("class_sessions").update({ start_time: draft.start_time, end_time: draft.end_time, status: draft.status, note: draft.note?.trim() ?? "" })
        .eq("id", session.id).eq("class_group", session.class_group).select("id,class_group,session_date,start_time,end_time,status,note").single();
      if (error || !data) throw new Error("No se ha guardado. Comprueba tu sesión de profesor y vuelve a intentarlo.");
      onSaved(data); setDraft(data); setMessage("Clase y recordatorios guardados.");
    } catch (cause) { setFailed(true); setMessage(cause instanceof Error ? cause.message : "No se ha guardado la clase."); }
    finally { setSaving(false); }
  }
  return <article className={`min-w-0 rounded-2xl border p-4 ${session.status === "cancelled" ? "border-amber-200 bg-amber-50" : "border-slate-200"}`}>
    <h3 className="font-extrabold capitalize">{dateLabel(session.session_date)}</h3><p className="mt-1 text-sm text-slate-600">{session.start_time.slice(0,5)}–{session.end_time.slice(0,5)} · {session.status === "cancelled" ? "Cancelada" : session.status === "special" ? "Clase especial" : "Programada"}</p>
    {teacher ? <fieldset disabled={saving} className="mt-3 space-y-3"><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Inicio<input type="time" value={draft.start_time.slice(0,5)} onChange={(e) => setDraft({ ...draft, start_time: e.target.value ? e.target.value + ":00" : "" })} className="mt-1 w-full min-w-0 rounded-lg border p-2"/></label><label className="text-xs font-bold">Fin<input type="time" value={draft.end_time.slice(0,5)} onChange={(e) => setDraft({ ...draft, end_time: e.target.value ? e.target.value + ":00" : "" })} className="mt-1 w-full min-w-0 rounded-lg border p-2"/></label></div>
      <label className="block text-xs font-bold">Estado<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="mt-1 w-full rounded-lg border p-2"><option value="scheduled">Programada</option><option value="special">Clase especial</option><option value="cancelled">Cancelada</option></select></label>
      <label className="block text-xs font-bold">Plan de clase y recordatorios<textarea maxLength={4000} rows={4} value={draft.note ?? ""} placeholder="Objetivo, tareas, material que traer y próximos plazos…" onChange={(e) => setDraft({ ...draft, note: e.target.value })} className="mt-1 w-full rounded-lg border p-2 text-sm font-normal"/></label>
      <button type="button" onClick={() => void save()} className="rounded-lg bg-[#1e6b4f] px-4 py-2 text-sm font-bold text-white">{saving ? "Guardando…" : "Guardar clase"}</button>
    </fieldset> : <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{session.note || "El profesor todavía no ha añadido el plan o los recordatorios de esta clase."}</p>}
    {message && <p role={failed ? "alert" : "status"} className={`mt-2 text-sm ${failed ? "text-red-700" : "text-emerald-800"}`}>{message}</p>}
  </article>;
}
