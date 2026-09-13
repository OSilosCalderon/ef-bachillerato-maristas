import Link from "next/link";
import { ArrowRight, GraduationCap, HeartPulse, ShieldCheck, Trophy, Compass } from "lucide-react";
import { learningSituations } from "@/lib/demo-data";
import { CoursePoster } from "@/components/course-poster";

const saIcons = [HeartPulse, Trophy, Compass];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-14">
        <nav className="mb-14 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[.2em] text-[#1e6b4f]">Maristas Badajoz</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">Educación Física</div>
          </div>
          <span className="rounded-full border border-[#d7c4ab] bg-white/85 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Entorno educativo privado</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e7f2ed] px-3 py-2 text-xs font-bold text-[#1e6b4f]">
              <GraduationCap size={16}/> Curso 2026/27
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              EF de 1º Bachillerato
              <span className="mt-1 block text-[#1e6b4f]">Maristas Badajoz</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold text-slate-600 sm:text-xl">El lema del curso nos invita a imaginar, crecer y construir juntos cada aprendizaje.</p>
            <p className="mt-4 text-xl font-medium text-slate-600 sm:text-2xl">Aprende, practica, analiza y mejora</p>
            <Link href="/auth/login" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b4f]">
              Acceder a la aplicación <ArrowRight size={17}/>
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CoursePoster />
          </div>
        </div>

        <section className="mt-16" aria-labelledby="situaciones-title">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Situaciones de aprendizaje</p>
          <h2 id="situaciones-title" className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">Un curso organizado en tres bloques</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {learningSituations.map((sa, index)=>{
              const Icon = saIcons[index] ?? GraduationCap;
              return (
                <article key={sa.id} className="card flex min-w-0 flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-fit rounded-full bg-[#e7f2ed] px-3 py-1 text-xs font-bold text-[#1e6b4f]">{sa.code}</span>
                    <span className="rounded-xl bg-[#f4e8d7] p-2 text-[#8b5e3c]" aria-hidden="true"><Icon size={19}/></span>
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold leading-tight">{sa.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{sa.description}</p>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
