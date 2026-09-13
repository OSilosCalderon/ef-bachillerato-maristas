"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CoursePoster } from "@/components/course-poster";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || !data.user) throw authError ?? new Error("No se pudo iniciar sesión.");

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      router.replace(profile?.role === "teacher" ? "/profesor" : "/alumno");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <section className="card relative min-w-0 overflow-hidden p-7 sm:p-9">
          <div aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rotate-12 rounded-[2rem] border border-[#8b5e3c]/15 bg-[#ead7bd]/45" />
          <div className="relative">
            <div className="flex items-center gap-3 text-[#1e6b4f]"><ShieldCheck/><span className="text-xs font-extrabold uppercase tracking-[.18em]">Maristas Badajoz</span></div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">EF de 1º Bachillerato</h1>
            <p className="mt-3 text-sm font-semibold text-[#8b5e3c]">Lema del curso 2026/2027</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Acceso privado para alumnado y profesorado.</p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-slate-500">Correo electrónico
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d9ccbc] bg-white p-3 text-sm outline-none focus:border-[#1e6b4f] focus:ring-2 focus:ring-[#1e6b4f]/15"/>
              </label>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-500">Contraseña
                <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d9ccbc] bg-white p-3 text-sm outline-none focus:border-[#1e6b4f] focus:ring-2 focus:ring-[#1e6b4f]/15"/>
              </label>
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                <LogIn size={17}/>{loading ? "Accediendo…" : "Entrar"}
              </button>
            </form>
          </div>
        </section>
        <div className="flex justify-center lg:justify-end">
          <CoursePoster compact />
        </div>
      </div>
    </main>
  );
}
