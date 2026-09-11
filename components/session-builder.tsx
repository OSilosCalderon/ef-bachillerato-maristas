"use client";
import { useMemo, useState } from "react";
import { Eye, Plus, Save, Send, Trash2 } from "lucide-react";
import { alternativeGames } from "@/lib/sa3-demo-data";
import { designedSessionMinutes, type DesignedSession, type SessionGameBlock } from "@/lib/sa3-types";

const emptySession: DesignedSession = {
  id: "new", title: "", objective: "", participants: 20, materials: "", space: "", warmup: "", warmupMinutes: 8,
  mainGames: [], cooldown: "", cooldownMinutes: 5, observations: "", safetyMeasures: "", status: "draft", updatedAt: "Hoy",
};

export function SessionBuilder() {
  const [session, setSession] = useState(emptySession);
  const [selectedGame, setSelectedGame] = useState(alternativeGames[0]?.id ?? "");
  const [ownName, setOwnName] = useState("");
  const [preview, setPreview] = useState(false);
  const total = useMemo(() => designedSessionMinutes(session), [session]);

  const patch = <K extends keyof DesignedSession>(key: K, value: DesignedSession[K]) => setSession((s)=>({...s,[key]:value}));
  const addLibraryGame = () => {
    const game = alternativeGames.find((g)=>g.id===selectedGame); if(!game) return;
    const block: SessionGameBlock = { id: crypto.randomUUID(), source:"library", gameId:game.id, name:game.name, minutes:game.approximateMinutes };
    patch("mainGames",[...session.mainGames,block]);
  };
  const addOwnGame = () => {
    if(!ownName.trim()) return;
    patch("mainGames",[...session.mainGames,{id:crypto.randomUUID(),source:"own",name:ownName.trim(),minutes:10}]); setOwnName("");
  };
  const updateGame = (id:string, minutes:number) => patch("mainGames",session.mainGames.map((g)=>g.id===id?{...g,minutes}:g));
  const removeGame = (id:string) => patch("mainGames",session.mainGames.filter((g)=>g.id!==id));

  if(preview) return <SessionPreview session={session} total={total} onBack={()=>setPreview(false)}/>;

  return <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
    <section className="card p-6">
      <h2 className="text-lg font-extrabold">Constructor de sesión</h2><p className="mt-1 text-sm text-slate-500">Combina juegos de la biblioteca con propuestas propias.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2"><Text label="Título" value={session.title} onChange={(v)=>patch("title",v)}/><Num label="Participantes" value={session.participants} onChange={(v)=>patch("participants",v)}/><Area label="Objetivo" value={session.objective} onChange={(v)=>patch("objective",v)}/><Area label="Material necesario" value={session.materials} onChange={(v)=>patch("materials",v)}/><Text label="Espacio" value={session.space} onChange={(v)=>patch("space",v)}/></div>
      <Phase title="Calentamiento" text={session.warmup} minutes={session.warmupMinutes} onText={(v)=>patch("warmup",v)} onMinutes={(v)=>patch("warmupMinutes",v)}/>
      <div className="mt-6 rounded-2xl border border-slate-200 p-5"><h3 className="font-extrabold">Parte principal</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><select value={selectedGame} onChange={(e)=>setSelectedGame(e.target.value)} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{alternativeGames.map((g)=><option key={g.id} value={g.id}>{g.name}</option>)}</select><button onClick={addLibraryGame} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Añadir biblioteca</button></div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]"><input value={ownName} onChange={(e)=>setOwnName(e.target.value)} placeholder="Nombre de un juego propio" className="rounded-xl border border-slate-200 p-3 text-sm"/><button onClick={addOwnGame} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"><Plus size={16}/>Crear juego propio</button></div>
        <div className="mt-4 space-y-2">{session.mainGames.map((g)=><div key={g.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="min-w-48 flex-1"><p className="text-sm font-bold">{g.name}</p><p className="text-xs text-slate-400">{g.source==="library"?"Biblioteca":"Juego propio"}</p></div><label className="text-xs font-bold text-slate-500">MIN <input type="number" min="1" value={g.minutes} onChange={(e)=>updateGame(g.id,Number(e.target.value))} className="ml-2 w-20 rounded-lg border border-slate-200 p-2"/></label><button onClick={()=>removeGame(g.id)} aria-label="Eliminar juego" className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600"><Trash2 size={16}/></button></div>)}</div>
      </div>
      <Phase title="Vuelta a la calma" text={session.cooldown} minutes={session.cooldownMinutes} onText={(v)=>patch("cooldown",v)} onMinutes={(v)=>patch("cooldownMinutes",v)}/>
      <div className="mt-6 grid gap-4 md:grid-cols-2"><Area label="Observaciones" value={session.observations} onChange={(v)=>patch("observations",v)}/><Area label="Medidas de seguridad" value={session.safetyMeasures} onChange={(v)=>patch("safetyMeasures",v)}/></div>
    </section>
    <aside className="space-y-4">
      <div className="card sticky top-5 p-6"><p className="text-sm text-slate-500">Duración automática</p><p className="mt-2 text-5xl font-extrabold">{total}<span className="ml-2 text-base text-slate-400">min</span></p><p className="mt-2 text-xs text-slate-400">Calentamiento + juegos + vuelta a la calma.</p>
      <div className="mt-6 grid gap-2"><button onClick={()=>setPreview(true)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"><Eye size={17}/>Vista previa</button><button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"><Save size={17}/>Guardar borrador</button><button className="flex items-center justify-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white"><Send size={17}/>Entregar al profesor</button></div></div>
    </aside>
  </div>;
}

function SessionPreview({session,total,onBack}:{session:DesignedSession;total:number;onBack:()=>void}){return <section className="card p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#1e6b4f]">Vista previa</p><h2 className="mt-2 text-2xl font-extrabold">{session.title||"Sesión sin título"}</h2><p className="mt-2 text-sm text-slate-500">{session.objective||"Añade un objetivo a la sesión."}</p></div><div className="rounded-2xl bg-slate-950 px-5 py-4 text-white"><strong className="text-2xl">{total}</strong> min</div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><PreviewBlock title="Calentamiento" minutes={session.warmupMinutes} text={session.warmup}/><div className="rounded-2xl bg-[#f3f8f5] p-5"><p className="font-extrabold">Parte principal</p>{session.mainGames.map((g)=><p key={g.id} className="mt-3 text-sm">{g.name} · {g.minutes} min</p>)}</div><PreviewBlock title="Vuelta a la calma" minutes={session.cooldownMinutes} text={session.cooldown}/></div><div className="mt-6 grid gap-4 md:grid-cols-2"><PreviewBlock title="Material y espacio" text={`${session.materials} · ${session.space}`}/><PreviewBlock title="Seguridad" text={session.safetyMeasures}/></div><button onClick={onBack} className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Volver a editar</button></section>}
function PreviewBlock({title,minutes,text}:{title:string;minutes?:number;text:string}){return <div className="rounded-2xl bg-slate-50 p-5"><p className="font-extrabold">{title}{minutes!=null?` · ${minutes} min`:""}</p><p className="mt-2 text-sm leading-6 text-slate-500">{text||"Pendiente de completar"}</p></div>}
function Text({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<input value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>}
function Num({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}){return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<input type="number" min="1" value={value} onChange={(e)=>onChange(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>}
function Area({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<textarea rows={3} value={value} onChange={(e)=>onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>}
function Phase({title,text,minutes,onText,onMinutes}:{title:string;text:string;minutes:number;onText:(v:string)=>void;onMinutes:(v:number)=>void}){return <div className="mt-6 rounded-2xl border border-slate-200 p-5"><div className="grid gap-4 md:grid-cols-[1fr_130px]"><Area label={title} value={text} onChange={onText}/><Num label="Minutos" value={minutes} onChange={onMinutes}/></div></div>}
