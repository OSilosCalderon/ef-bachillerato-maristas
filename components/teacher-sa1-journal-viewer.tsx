"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Dumbbell, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TrainingPlanItem } from "@/components/training-plan-editor";

type StudentOption = {
  id: string;
  displayName: string;
  classGroup: string;
};

type JournalRow = {
  id: string;
  session_date: string;
  title: string;
  activities: string;
  training_plan: TrainingPlanItem[];
  feeling: string;
  learning: string;
  perceived_difficulty: number;
  perceived_effort: number;
  reflection: string;
};

function normalizePlan(value: unknown): TrainingPlanItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `row-${index}`,
      activity: typeof item.activity === "string" ? item.activity : "",
      series: Math.max(1, Number(item.series) || 1),
      repetitions: Math.max(1, Number(item.repetitions) || 1),
    }))
    .filter((item) => item.activity.length > 0);
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );

export function TeacherSa1JournalViewer() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [group, setGroup] = useState("1ºA Bachillerato");
  const [studentId, setStudentId] = useState("");
  const [sa1Id, setSa1Id] = useState("");
  const [journals, setJournals] = useState<JournalRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadStudents();
  }, []);

  async function loadStudents() {
    setLoadingStudents(true);
    setError("");
    try {
      const supabase = createClient();
      const [studentsResult, profilesResult, sa1Result] = await Promise.all([
        supabase.from("students").select("id,profile_id").eq("active", true),
        supabase.from("profiles").select("id,display_name,class_group").eq("role", "student"),
        supabase.from("learning_situations").select("id").eq("code", "SA1").single(),
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (sa1Result.error || !sa1Result.data) throw new Error("No se ha encontrado SA1.");

      const profiles = new Map(
        (profilesResult.data ?? []).map((profile) => [profile.id, profile] as const),
      );

      const options = (studentsResult.data ?? [])
        .map((student) => {
          const profile = profiles.get(student.profile_id);
          if (!profile?.class_group) return null;
          return {
            id: student.id as string,
            displayName: profile.display_name || "Alumno/a sin nombre",
            classGroup: profile.class_group,
          } satisfies StudentOption;
        })
        .filter((item): item is StudentOption => item !== null)
        .sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));

      setStudents(options);
      setSa1Id(sa1Result.data.id as string);

      const first = options.find((item) => item.classGroup === group);
      setStudentId(first?.id ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cargar el alumnado.");
    } finally {
      setLoadingStudents(false);
    }
  }

  const groupStudents = useMemo(
    () => students.filter((student) => student.classGroup === group),
    [students, group],
  );

  useEffect(() => {
    if (!studentId || !sa1Id) {
      setJournals([]);
      return;
    }
    void loadJournals(studentId, sa1Id);
  }, [studentId, sa1Id]);

  async function loadJournals(currentStudentId: string, currentSa1Id: string) {
    setLoadingJournals(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: journalError } = await supabase
        .from("session_journals")
        .select(
          "id,session_date,title,activities,training_plan,feeling,learning,perceived_difficulty,perceived_effort,reflection",
        )
        .eq("student_id", currentStudentId)
        .eq("learning_situation_id", currentSa1Id)
        .order("session_date", { ascending: false });

      if (journalError) throw journalError;

      setJournals(
        (data ?? []).map((row) => ({
          ...row,
          training_plan: normalizePlan(row.training_plan),
        })) as JournalRow[],
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se han podido cargar los diarios.");
    } finally {
      setLoadingJournals(false);
    }
  }

  function changeGroup(nextGroup: string) {
    setGroup(nextGroup);
    const first = students.find((student) => student.classGroup === nextGroup);
    setStudentId(first?.id ?? "");
  }

  if (loadingStudents) {
    return (
      <section className="card flex items-center gap-3 p-6 text-sm text-slate-500">
        <Loader2 size={18} className="animate-spin" /> Cargando diarios del alumnado…
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-extrabold">Diarios de sesiones y planificación del entrenamiento</h2>
          <p className="mt-1 text-sm text-slate-500">
            Vista de solo lectura. Puedes revisar cómo programa cada alumno sus actividades, series y repeticiones.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Grupo
            <select
              value={group}
              onChange={(event) => changeGroup(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"
            >
              <option value="1ºA Bachillerato">1ºA Bachillerato</option>
              <option value="1ºB Bachillerato">1ºB Bachillerato</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Alumno/a
            <select
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"
            >
              {groupStudents.length === 0 && <option value="">Sin alumnado asignado</option>}
              {groupStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>

      {loadingJournals ? (
        <section className="card flex items-center gap-3 p-6 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Cargando entradas…
        </section>
      ) : journals.length === 0 ? (
        <section className="card p-8 text-center">
          <CalendarDays className="mx-auto text-[#1e6b4f]" />
          <h3 className="mt-3 font-extrabold">No hay entradas registradas</h3>
          <p className="mt-1 text-sm text-slate-500">Este alumno todavía no ha guardado diarios de SA1.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {journals.map((journal) => (
            <article key={journal.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold">{journal.title}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">
                    {formatDate(journal.session_date)}
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-bold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Dificultad {journal.perceived_difficulty}/5</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Esfuerzo {journal.perceived_effort}/10</span>
                </div>
              </div>

              {journal.activities && (
                <div className="mt-4">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Qué hemos realizado</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{journal.activities}</p>
                </div>
              )}

              <section className="mt-4 rounded-2xl border border-[#d9e8e0] bg-[#f7fbf9] p-4">
                <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.14em] text-[#1e6b4f]">
                  <Dumbbell size={16} /> Plan de trabajo
                </p>
                {journal.training_plan.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No ha registrado actividades con series y repeticiones.</p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="pb-2 pr-4">Actividad</th>
                          <th className="pb-2 pr-4">Series</th>
                          <th className="pb-2">Repeticiones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {journal.training_plan.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 pr-4 font-semibold text-slate-700">{item.activity}</td>
                            <td className="py-2.5 pr-4 text-slate-600">{item.series}</td>
                            <td className="py-2.5 text-slate-600">{item.repetitions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <ReadBlock label="Cómo se ha sentido" value={journal.feeling} />
                <ReadBlock label="Qué ha aprendido" value={journal.learning} />
                <ReadBlock label="Reflexión personal" value={journal.reflection} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ReadBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{value || "Sin completar"}</p>
    </div>
  );
}
