"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, GraduationCap, LogIn, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginIdentifierToEmail } from "@/lib/auth/student-login";
import { CoursePoster } from "@/components/course-poster";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCourse = searchParams.get("curso") === "2" ? 2 : 1;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginIdentifierToEmail(identifier), password });
      if (authError || !data.user) throw authError ?? new Error("No se pudo iniciar sesión.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profileError || !profile) throw new Error("No se ha podido cargar el perfil de acceso.");

      if (profile.role === "teacher") {
        router.replace(`/profesor?curso=${selectedCourse}`);
        router.refresh();
        return;
      }

      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("course_id")
        .eq("profile_id", data.user.id)
        .eq("active", true)
        .single();
      if (studentError || !student?.course_id) {
        await supabase.auth.signOut();
        throw new Error("Tu cuenta de alumno todavía no tiene un curso de Bachillerato asignado. Consulta con el profesor.");
      }

      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("bachillerato_year")
        .eq("id", student.course_id)
        .single();
      if (courseError || !course) {
        await supabase.auth.signOut();
        throw new Error("No se ha podido comprobar el curso asignado a tu cuenta.");
      }

      const assignedYear = Number(course.bachillerato_year) === 2 ? 2 : 1;
      if (assignedYear !== selectedCourse) {
        await supabase.auth.signOut();
        throw new Error(`Esta cuenta pertenece a ${assignedYear}º de Bachillerato. Vuelve atrás y entra desde el acceso de ${assignedYear}º.`);
      }

      router.replace(data.user.user_metadata?.initial_password === true && data.user.user_metadata?.first_access_seen !== true ? "/auth/primer-acceso" : "/alumno");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-5xl">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft size={17}/>Cambiar de curso
        </Link>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <section className="card relative min-w-0 overflow-hidden p-7 sm:p-9">
            <div aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rotate-12 rounded-[2rem] border border-[#8b5e3c]/15 bg-[#ead7bd]/45" />
            <div className="relative">
              <div className="flex items-center gap-3 text-[#1e6b4f]"><ShieldCheck/><span className="text-xs font-extrabold uppercase tracking-[.18em]">Maristas Badajoz · Bachillerato</span></div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f2ed] text-[#1e6b4f]"><GraduationCap size={23}/></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">Acceso seleccionado</p>
                  <h1 className="text-3xl font-black tracking-tight">EF de {selectedCourse}º Bachillerato</h1>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">Acceso privado para alumnado y profesorado. El alumnado solo puede entrar en el curso al que está asignada su cuenta.</p>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5" aria-label="Seleccionar curso">
                {[1, 2].map((year) => (
                  <Link
                    key={year}
                    href={`/auth/login?curso=${year}`}
                    className={`rounded-xl px-3 py-2.5 text-center text-sm font-extrabold transition ${selectedCourse === year ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    {year}º Bachillerato
                  </Link>
                ))}
              </div>

              <form onSubmit={submit} className="mt-7 space-y-4">
                <label htmlFor="identifier" className="block text-xs font-bold uppercase tracking-wide text-slate-500">Usuario o correo electrónico
                  <input id="identifier" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="nombre.apellido" required value={identifier} onChange={(e)=>setIdentifier(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d9ccbc] bg-white p-3 text-sm outline-none focus:border-[#1e6b4f] focus:ring-2 focus:ring-[#1e6b4f]/15"/>
                </label>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-500">Contraseña
                  <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d9ccbc] bg-white p-3 text-sm outline-none focus:border-[#1e6b4f] focus:ring-2 focus:ring-[#1e6b4f]/15"/>
                </label>
                {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold leading-6 text-red-700">{error}</p>}
                <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                  <LogIn size={17}/>{loading ? "Accediendo…" : `Entrar en ${selectedCourse}º Bachillerato`}
                </button>
              </form>
            </div>
          </section>
          <div className="flex justify-center lg:justify-end">
            <CoursePoster compact />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm font-semibold text-slate-500">Preparando acceso a Bachillerato…</main>}>
      <LoginContent />
    </Suspense>
  );
}
