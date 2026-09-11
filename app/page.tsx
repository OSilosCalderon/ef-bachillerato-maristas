import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import { learningSituations } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-14">
        <nav className="mb-14 flex items-center justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#1e6b4f]">Maristas Badajoz</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">Educación Física</div>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">Entorno educativo privado</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e7f2ed] px-3 py-2 text-xs font-bold text-[#1e6b4f]">
              <GraduationCap size={16}/> Curso 2026/27
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              EF de 1º Bachillerato
              <span className="mt-1 block text-[#1e6b4f]">Maristas Badajoz</span>
            </h1>
            <p className="mt-6 text-xl font-medium text-slate-600 sm:text-2xl">Aprende, practica, analiza y mejora</p>
            <Link href="/auth/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b4f]">
              Acceder a la aplicación <ArrowRight size={17}/>
            </Link>
          </div>
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-slate-950 p-3 text-white"><ShieldCheck size={24}/></span>
              <div>
                <h2 className="font-bold text-slate-900">Privacidad desde el diseño</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Autenticación por roles, acceso individual a datos del alumnado, Storage privado y políticas Row Level Security.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16" aria-labelledby="situaciones-title">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Situaciones de aprendizaje</p>
          <h2 id="situaciones-title" className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">Un curso organizado en tres bloques</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {learningSituations.map((sa)=>(
              <article key={sa.id} className="card flex flex-col p-6">
                <span className="w-fit rounded-full bg-[#e7f2ed] px-3 py-1 text-xs font-bold text-[#1e6b4f]">{sa.code}</span>
                <h3 className="mt-5 text-xl font-extrabold leading-tight">{sa.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{sa.description}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
