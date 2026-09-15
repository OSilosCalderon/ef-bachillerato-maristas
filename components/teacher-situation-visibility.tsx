"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Course = { id: string; name: string; bachillerato_year: number; academic_year: string };
type Situation = { id: string; course_id: string; code: string; title: string; published: boolean };
export function TeacherSituationVisibility({ initialYear = 1 }: { initialYear?: number }) {
  const [year, setYear] = useState(initialYear);
  const [courses, setCourses] = useState<Course[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      try {
        const [c, s] = await Promise.all([supabase.from("courses").select("id,name,bachillerato_year,academic_year").eq("is_active", true), supabase.from("learning_situations").select("id,course_id,code,title,published").order("position")]);
        if (c.error || s.error) throw new Error("No se han podido cargar los controles. Recarga para intentarlo de nuevo.");
        if (active) { setCourses(c.data ?? []); setSituations(s.data ?? []); }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "No se han podido cargar las situaciones."); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, []);
  async function toggle(situation: Situation) {
    setSaving(situation.id); setError(""); setMessage("");
    try {
      const { data, error } = await createClient().from("learning_situations").update({ published: !situation.published }).eq("id", situation.id).select("id,course_id,code,title,published").single();
      if (error || !data) throw new Error("No se ha guardado el cambio. Comprueba tu acceso docente y vuelve a intentarlo.");
      setSituations((current) => current.map((item) => item.id === data.id ? data : item));
      setMessage(`${data.code} ${data.published ? "activada" : "desactivada"}. El alumnado verá el cambio al abrir o actualizar sus páginas.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se ha guardado el cambio."); }
    finally { setSaving(null); }
  }
  return <section className="card space-y-5 p-5 sm:p-8"><div><h1 className="text-2xl font-black">Activar situaciones de aprendizaje</h1><p className="mt-2 text-sm leading-6 text-slate-600">Elige el curso y decide qué situaciones puede abrir el alumnado. Desactivarlas conserva las marcas, planes, lecturas y resultados ya registrados.</p></div>
    <div className="flex flex-wrap gap-3">{[1,2].map((value) => <button key={value} type="button" aria-pressed={year === value} onClick={() => { setYear(value); setMessage(""); }} className={`rounded-xl px-5 py-3 font-bold ${year === value ? "bg-[#1e6b4f] text-white" : "border border-slate-200"}`}>{value}º Bachillerato</button>)}</div>
    {loading && <p role="status">Cargando situaciones…</p>}{error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p>}
    {courses.filter((course) => course.bachillerato_year === year).map((course) => <div key={course.id} className="space-y-3"><h2 className="font-extrabold">{course.name} · {course.academic_year}</h2>{situations.filter((item) => item.course_id === course.id).map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-5"><div><h3 className="font-extrabold">{item.code} · {item.title}</h3><p className="mt-1 text-sm text-slate-500">{item.published ? "Visible para el alumnado" : "Oculta para el alumnado"}</p></div><button type="button" disabled={saving !== null} aria-label={`${item.published ? "Desactivar" : "Activar"} ${item.code} de ${year}º`} onClick={() => void toggle(item)} className={`rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50 ${item.published ? "border border-slate-300 text-slate-700" : "bg-[#1e6b4f] text-white"}`}>{saving === item.id ? "Guardando…" : item.published ? "Desactivar" : "Activar"}</button></article>)}</div>)}
    <p className="text-xs leading-5 text-slate-500">1º comparte la activación para los grupos A y B. La biblioteca común de entrenamiento permanece disponible como recurso de consulta. Los módulos específicos de 2º siguen la activación de su SA.</p>
    <Link href={`/profesor?curso=${year}`} className="inline-block text-sm font-bold text-[#1e6b4f] underline">Volver al panel de {year}º</Link>
  </section>;
}
