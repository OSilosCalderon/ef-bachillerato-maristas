"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { planSessionsForYear } from "@/lib/teacher-session-grading";

type Slot = { number: number; date: string; completed: boolean; draft: boolean; score: number | null; absent: boolean };
export function FirstYearPlanProgress() {
  const [slots,setSlots] = useState<Slot[] | null>(null);
  const [error,setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const {data:auth,error:authError} = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Identificación pendiente.");
      const [studentResult,profileResult] = await Promise.all([
        supabase.from("students").select("id").eq("profile_id",auth.user.id).eq("active",true).single(),
        supabase.from("profiles").select("class_group").eq("id",auth.user.id).single(),
      ]);
      if (studentResult.error || !studentResult.data || profileResult.error) throw new Error("Perfil pendiente.");
      const sessions = planSessionsForYear(1,profileResult.data?.class_group);
      if (!sessions.length) throw new Error("Grupo pendiente.");
      const [logs,grades] = await Promise.all([
        supabase.from("first_year_plan_session_logs").select("session_number,status").eq("student_id",studentResult.data.id),
        supabase.from("first_year_plan_session_grades").select("session_number,teacher_score,absent").eq("student_id",studentResult.data.id),
      ]);
      if (logs.error || grades.error) throw new Error("No se pudo cargar el seguimiento.");
      if (active) setSlots(sessions.map((session,index) => {
        const log = logs.data?.find((row) => row.session_number === index+1);
        const grade = grades.data?.find((row) => row.session_number === index+1);
        return {number:index+1,date:session.date,completed:log?.status==="completed",draft:log?.status==="draft",score:grade ? Number(grade.teacher_score) : null,absent:grade?.absent===true};
      }));
    }
    void load().catch(() => { if (active) setError("No se ha podido actualizar el seguimiento del plan. Recarga la página o consulta con el profesor si tu grupo no está asignado."); });
    return () => {active=false;};
  },[]);
  const completed = slots?.filter((slot) => slot.completed).length ?? 0;
  const percent = Math.round(completed/8*100);
  return <section aria-label="Progreso de mis ocho sesiones" className="card p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#1e6b4f]">SA1 · Plan personal</p><h2 className="mt-1 text-xl font-extrabold">Mis ocho sesiones</h2></div><Link href="/alumno/sa1/seguimiento" className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Abrir seguimiento y calificaciones</Link></div>
    {error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : !slots ? <p role="status" className="mt-4 text-sm text-slate-500">Cargando tus sesiones…</p> : <>
      <p className="mt-4 text-sm"><strong>{completed}/8 sesiones registradas · {percent}%</strong></p>
      <div role="progressbar" aria-label="Sesiones registradas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{width:`${percent}%`}}/></div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{slots.map((slot) => <Link key={slot.number} href="/alumno/sa1/seguimiento" className={`rounded-xl border p-3 ${slot.completed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}><p className="text-sm font-bold">Sesión {slot.number}</p><p className="mt-1 text-xs text-slate-500">{slot.date.slice(8)}/{slot.date.slice(5,7)}</p><p className="mt-2 text-xs font-semibold">{slot.completed ? "Registrada" : slot.draft ? "En curso" : "Pendiente"}</p><p className="mt-1 text-xs text-[#164c3a]">{slot.score === null ? "Sin calificar" : `Nota: ${new Intl.NumberFormat("es-ES").format(slot.score)}/10`}</p>{slot.absent && <p className="mt-1 text-xs font-bold text-rose-700">AUSENCIA</p>}</Link>)}</div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Una nota o una ausencia no cuentan como seguimiento enviado. Abre el seguimiento para ver el comentario del profesor.</p>
    </>}
  </section>;
}
