"use client";
import { useMemo, useState } from "react";
import { Clock3, Search, ShieldCheck, Users } from "lucide-react";
import { alternativeGames } from "@/lib/sa3-demo-data";

export function GameLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const categories = ["Todas", ...Array.from(new Set(alternativeGames.flatMap((g) => g.categories)))];
  const visible = useMemo(() => alternativeGames.filter((g) => g.active && (category === "Todas" || g.categories.includes(category)) && `${g.name} ${g.description} ${g.objective}`.toLowerCase().includes(query.toLowerCase())), [query, category]);

  return <div className="space-y-5">
    <section className="card grid gap-4 p-5 md:grid-cols-[1fr_240px]">
      <label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nombre, objetivo o descripción" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm"/></label>
      <select value={category} onChange={(e)=>setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">{categories.map((c)=><option key={c}>{c}</option>)}</select>
    </section>
    <div className="grid gap-4 lg:grid-cols-2">
      {visible.map((game)=><article key={game.id} className="card overflow-hidden">
        <div className="grid min-h-36 place-items-center bg-gradient-to-br from-[#edf6f2] to-slate-100 text-center text-sm font-semibold text-slate-400">Imagen del juego · preparada para Storage</div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">{game.categories.map((c)=><span key={c} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{c}</span>)}</div>
          <h2 className="mt-4 text-xl font-extrabold">{game.name}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{game.description}</p>
          <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3"><span className="flex items-center gap-1"><Users size={14}/>{game.recommendedParticipants}</span><span className="flex items-center gap-1"><Clock3 size={14}/>{game.approximateMinutes} min</span><span className="font-bold capitalize">Intensidad {game.intensity}</span></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><Info title="Objetivo" text={game.objective}/><Info title="Espacio" text={game.space}/><Info title="Materiales" text={game.materials.join(", ")}/><Info title="Variantes" text={game.variants.join(" · ")}/></div>
          <div className="mt-4 rounded-xl bg-[#f3f8f5] p-4 text-sm text-slate-600"><ShieldCheck className="mr-2 inline text-[#1e6b4f]" size={17}/><strong>Seguridad:</strong> {game.safetyRecommendations}</div>
        </div>
      </article>)}
    </div>
  </div>;
}
function Info({title,text}:{title:string;text:string}){return <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p><p className="mt-1 text-sm text-slate-600">{text}</p></div>}
