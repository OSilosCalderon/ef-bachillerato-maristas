"use client";

import { useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function TheoryChallengeResponse({ topicSlug }: { topicSlug: string }) {
  const inputId = useId();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [savedAnswer, setSavedAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const client = createClient();
        const { data: auth, error: authError } = await client.auth.getUser();
        if (authError || !auth.user) throw new Error("Entra con tu cuenta de alumno para responder.");
        const { data: student, error: studentError } = await client.from("students").select("id").eq("profile_id", auth.user.id).eq("active", true).single();
        if (studentError || !student) throw new Error("No se ha podido cargar tu cuenta de alumno.");
        const { data, error: loadError } = await client.from("theory_challenge_responses").select("id,answer").eq("student_id", student.id).eq("topic_slug", topicSlug).maybeSingle();
        if (loadError) throw new Error("No se ha podido cargar tu respuesta. Vuelve a intentarlo.");
        if (active) {
          setStudentId(student.id);
          setResponseId(data?.id ?? null);
          setAnswer(data?.answer ?? "");
          setSavedAnswer(data?.answer ?? "");
          setMessage(data ? "Respuesta guardada. Puedes revisarla y actualizarla." : "");
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "No se ha podido cargar la respuesta.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [topicSlug, reload]);

  async function save() {
    if (!studentId || !answer.trim() || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    const text = answer.trim();
    try {
      const client = createClient();
      const query = responseId
        ? client.from("theory_challenge_responses").update({ answer: text }).eq("id", responseId).eq("student_id", studentId)
        : client.from("theory_challenge_responses").insert({ student_id: studentId, topic_slug: topicSlug, answer: text });
      const { data, error: saveError } = await query.select("id,answer").single();
      if (saveError || !data) throw new Error("No se ha podido guardar. Conserva tu texto y vuelve a intentarlo; comprueba que tu sesión y esta situación sigan activas.");
      setResponseId(data.id);
      setAnswer(data.answer);
      setSavedAnswer(data.answer);
      setMessage("Respuesta guardada. Tu profesor ya puede consultarla.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar la respuesta.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mt-5 space-y-3 border-t border-violet-200 pt-5">
    <label htmlFor={inputId} className="block text-sm font-bold text-violet-950">Tu respuesta al reto</label>
    <p id={`${inputId}-help`} className="text-xs leading-5 text-violet-900">Explica tu propuesta y justifica tus decisiones. Solo tú y el profesorado podéis leer tu respuesta. Guarda antes de cambiar de tema.</p>
    <textarea id={inputId} aria-describedby={`${inputId}-help`} rows={6} maxLength={10000} value={answer} disabled={loading || saving || !studentId} onChange={(event) => { setAnswer(event.target.value); setMessage(""); }} placeholder="Escribe aquí tu respuesta…" className="w-full rounded-xl border border-violet-300 bg-white p-3 text-sm leading-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"/>
    <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-violet-900">{answer.length}/10.000 caracteres{answer !== savedAnswer ? " · Cambios sin guardar" : ""}</span><button type="button" onClick={() => void save()} disabled={loading || saving || !studentId || !answer.trim() || answer === savedAnswer} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Cargando…" : saving ? "Guardando…" : responseId ? "Actualizar respuesta" : "Guardar respuesta"}</button></div>
    {message && <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p>}
    {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
    {!loading && !studentId && <button type="button" className="text-sm font-bold underline" onClick={() => setReload((value) => value + 1)}>Reintentar carga</button>}
  </div>;
}
