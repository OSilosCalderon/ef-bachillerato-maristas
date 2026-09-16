"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, List, Loader2, Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { firstYearCalendarGroup } from "@/lib/class-groups";
import { TrainingPlanEditor, type TrainingPlanItem } from "@/components/training-plan-editor";

type ClassSession = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  class_group: string;
};

type Entry = {
  id: string;
  class_session_id: string | null;
  session_date: string;
  title: string;
  activities: string;
  training_plan: TrainingPlanItem[];
  feeling: string;
  learning: string;
  perceived_difficulty: number;
  perceived_effort: number;
  reflection: string;
  saved: boolean;
};

const fmtTime = (value: string) => value.slice(0, 5);
const fmtDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));

function normalizeTrainingPlan(value: unknown): TrainingPlanItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
      activity: typeof item.activity === "string" ? item.activity : "",
      series: Math.max(1, Number(item.series) || 1),
      repetitions: Math.max(1, Number(item.repetitions) || 1),
    }));
}

export function JournalPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [sa1Id, setSa1Id] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [mode, setMode] = useState<"list" | "timeline">("list");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("No se ha podido identificar al alumno.");

      const [profileResult, studentResult] = await Promise.all([
        supabase.from("profiles").select("class_group").eq("id", user.id).single(),
        supabase.from("students").select("id,course_id").eq("profile_id", user.id).single(),
      ]);

      if (profileResult.error) throw new Error("No se ha podido cargar el grupo del alumno.");
      if (studentResult.error || !studentResult.data) throw new Error("No se ha encontrado el perfil de alumno.");
      const sa1Result = await supabase.from("learning_situations").select("id").eq("code", "SA1").eq("course_id", studentResult.data.course_id).single();
      if (sa1Result.error || !sa1Result.data) throw new Error("No se ha encontrado la situación de aprendizaje SA1.");

      const currentGroup = firstYearCalendarGroup(profileResult.data?.class_group) ?? profileResult.data?.class_group ?? null;
      const currentStudentId = studentResult.data.id as string;
      const currentSa1Id = sa1Result.data.id as string;

      setGroup(currentGroup);
      setStudentId(currentStudentId);
      setSa1Id(currentSa1Id);

      let sessionQuery = supabase
        .from("class_sessions")
        .select("id,session_date,start_time,end_time,class_group")
        .eq("academic_year", "2026/2027")
        .eq("status", "scheduled")
        .order("session_date", { ascending: true });

      if (currentGroup) sessionQuery = sessionQuery.eq("class_group", currentGroup);

      const [sessionResult, journalResult] = await Promise.all([
        sessionQuery,
        supabase
          .from("session_journals")
          .select(
            "id,class_session_id,session_date,title,activities,training_plan,feeling,learning,perceived_difficulty,perceived_effort,reflection",
          )
          .eq("student_id", currentStudentId)
          .eq("learning_situation_id", currentSa1Id)
          .order("session_date", { ascending: false }),
      ]);

      if (sessionResult.error) throw new Error("No se ha podido cargar el calendario de clases.");
      if (journalResult.error) throw new Error("No se han podido cargar las entradas del diario.");

      setSessions((sessionResult.data ?? []) as ClassSession[]);
      setEntries(
        (journalResult.data ?? []).map((journal) => ({
          ...journal,
          training_plan: normalizeTrainingPlan(journal.training_plan),
          perceived_difficulty: journal.perceived_difficulty ?? 3,
          perceived_effort: journal.perceived_effort ?? 5,
          saved: true,
        })) as Entry[],
      );
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "No se ha podido cargar el diario.");
    } finally {
      setLoading(false);
    }
  }

  const usedSessionIds = useMemo(
    () => new Set(entries.map((entry) => entry.class_session_id).filter(Boolean)),
    [entries],
  );

  const availableSessions = useMemo(
    () => sessions.filter((session) => !usedSessionIds.has(session.id)),
    [sessions, usedSessionIds],
  );

  function add() {
    const session = sessions.find((item) => item.id === selectedSession);
    if (!session) return;

    const entry: Entry = {
      id: `new-${crypto.randomUUID()}`,
      class_session_id: session.id,
      session_date: session.session_date,
      title: "Sesión de Educación Física",
      activities: "",
      training_plan: [],
      feeling: "",
      learning: "",
      perceived_difficulty: 3,
      perceived_effort: 5,
      reflection: "",
      saved: false,
    };

    setEntries((current) => [entry, ...current]);
    setSelectedSession("");
    setMessage("");
    setIsError(false);
  }

  function update<K extends keyof Entry>(id: string, key: K, value: Entry[K]) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, [key]: value, saved: false } : entry)),
    );
    setMessage("");
    setIsError(false);
  }

  async function save(entry: Entry) {
    if (!studentId || !sa1Id || !entry.class_session_id) return;

    setSavingId(entry.id);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();
      const cleanTrainingPlan = entry.training_plan
        .filter((item) => item.activity.trim().length > 0)
        .map((item) => ({
          id: item.id,
          activity: item.activity.trim(),
          series: Math.max(1, Math.min(50, Number(item.series) || 1)),
          repetitions: Math.max(1, Math.min(1000, Number(item.repetitions) || 1)),
        }));

      const payload = {
        learning_situation_id: sa1Id,
        student_id: studentId,
        class_session_id: entry.class_session_id,
        session_date: entry.session_date,
        title: entry.title.trim() || "Sesión de Educación Física",
        activities: entry.activities.trim(),
        training_plan: cleanTrainingPlan,
        feeling: entry.feeling.trim(),
        learning: entry.learning.trim(),
        perceived_difficulty: entry.perceived_difficulty,
        perceived_effort: entry.perceived_effort,
        reflection: entry.reflection.trim(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("session_journals")
        .upsert(payload, { onConflict: "student_id,class_session_id" })
        .select("id")
        .single();

      if (error) throw error;

      setEntries((current) =>
        current.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                ...payload,
                id: data.id as string,
                training_plan: cleanTrainingPlan,
                saved: true,
              }
            : item,
        ),
      );
      setMessage("Entrada guardada correctamente. Puedes volver a editarla cuando lo necesites.");
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? `No se ha podido guardar la entrada: ${error.message}`
          : "No se ha podido guardar la entrada. Inténtalo de nuevo.",
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="card flex items-center gap-3 p-6 text-sm text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Cargando diario y calendario de clases…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Tu horario</p>
            <h2 className="mt-1 text-xl font-extrabold">{group ?? "Grupo pendiente de asignación"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cada entrada queda vinculada a una clase real de Educación Física del curso 2026/2027.
            </p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row lg:max-w-2xl">
            <select
              value={selectedSession}
              onChange={(event) => setSelectedSession(event.target.value)}
              disabled={!group || availableSessions.length === 0}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm disabled:bg-slate-50"
            >
              <option value="">
                {availableSessions.length === 0 ? "No hay sesiones pendientes de diario" : "Selecciona una sesión…"}
              </option>
              {availableSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {fmtDate(session.session_date)} · {fmtTime(session.start_time)}–{fmtTime(session.end_time)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={add}
              disabled={!selectedSession}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              <Plus size={17} /> Nueva entrada
            </button>
          </div>
        </div>

        {group?.includes("1ºA") && (
          <p className="mt-4 rounded-xl bg-[#e7f2ed] p-3 text-sm text-[#164c3a]">
            <strong>1ºA:</strong> lunes 09:10–10:05 y jueves 10:05–11:00.
          </p>
        )}
        {group?.includes("1ºB") && (
          <p className="mt-4 rounded-xl bg-[#e7f2ed] p-3 text-sm text-[#164c3a]">
            <strong>1ºB:</strong> lunes 12:25–13:20 y viernes 11:30–12:25.
          </p>
        )}

        {message && (
          <p
            className={`mt-4 rounded-xl p-3 text-sm ${
              isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </p>
        )}
      </section>

      <div className="flex w-fit rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setMode("list")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === "list" ? "bg-slate-100" : ""
          }`}
        >
          <List size={16} /> Lista
        </button>
        <button
          type="button"
          onClick={() => setMode("timeline")}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
            mode === "timeline" ? "bg-slate-100" : ""
          }`}
        >
          <CalendarDays size={16} /> Cronología
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="card p-8 text-center">
          <CalendarDays className="mx-auto text-[#1e6b4f]" />
          <h3 className="mt-3 font-extrabold">Aún no tienes entradas</h3>
          <p className="mt-1 text-sm text-slate-500">
            Selecciona una sesión de tu horario y completa tu reflexión y plan de trabajo.
          </p>
        </div>
      ) : (
        <div className={mode === "timeline" ? "space-y-5 border-l-2 border-slate-200 pl-5" : "space-y-4"}>
          {entries.map((entry) => {
            const session = sessions.find((item) => item.id === entry.class_session_id);
            const isSaving = savingId === entry.id;

            return (
              <article key={entry.id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">
                      <CalendarDays size={15} /> {fmtDate(entry.session_date)}
                    </p>
                    {session && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 size={14} /> {fmtTime(session.start_time)}–{fmtTime(session.end_time)}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      entry.saved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {entry.saved ? (
                      <>
                        <Check size={13} className="mr-1 inline" /> Guardado
                      </>
                    ) : (
                      "Cambios sin guardar"
                    )}
                  </span>
                </div>

                <label className="mt-4 block text-xs font-bold text-slate-500">
                  TÍTULO
                  <input
                    value={entry.title}
                    maxLength={160}
                    onChange={(event) => update(entry.id, "title", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  />
                </label>

                <section className="mt-4">
                  <p className="text-xs font-bold text-slate-500">QUÉ HEMOS REALIZADO</p>
                  <textarea
                    value={entry.activities}
                    onChange={(event) => update(entry.id, "activities", event.target.value)}
                    rows={2}
                    placeholder="Resumen general de la sesión, calentamiento, circuito, observaciones…"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                  />
                  <TrainingPlanEditor
                    plan={entry.training_plan}
                    onChange={(plan) => update(entry.id, "training_plan", plan)}
                  />
                </section>

                {(
                  [
                    ["feeling", "Cómo me he sentido"],
                    ["learning", "Qué he aprendido"],
                    ["reflection", "Reflexión personal"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="mt-4 block text-xs font-bold text-slate-500">
                    {label.toUpperCase()}
                    <textarea
                      value={entry[key]}
                      onChange={(event) => update(entry.id, key, event.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"
                    />
                  </label>
                ))}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-slate-500">
                    DIFICULTAD · {entry.perceived_difficulty}/5
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={entry.perceived_difficulty}
                      onChange={(event) => update(entry.id, "perceived_difficulty", Number(event.target.value))}
                      className="mt-2 w-full"
                    />
                  </label>
                  <label className="text-xs font-bold text-slate-500">
                    ESFUERZO · {entry.perceived_effort}/10
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={entry.perceived_effort}
                      onChange={(event) => update(entry.id, "perceived_effort", Number(event.target.value))}
                      className="mt-2 w-full"
                    />
                  </label>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void save(entry)}
                    disabled={entry.saved || isSaving}
                    className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSaving ? "Guardando…" : entry.id.startsWith("new-") ? "Guardar entrada" : "Guardar cambios"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
