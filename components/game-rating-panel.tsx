"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { alternativeGames, gameRatings } from "@/lib/sa3-demo-data";

export function GameRatingPanel() {
  const [gameId,setGameId]=useState(alternativeGames[0]?.id??"");
  const [values,setValues]=useState({fun:4,participation:4,difficulty:3,intensity:3,cooperation:4,wouldPlayAgain:true,comment:"",improvementProposal:""});
  const [saved,setSaved]=useState(false);
  const patch=(key:keyof typeof values,value:(typeof values)[keyof typeof values])=>setValues(v=>({...v,[key]:value}));
  return <div className="grid gap-5 xl:grid-cols-[1fr_.7fr]">
    <section className="card p-6"><h2 className="text-lg font-extrabold">Valorar un juego practicado</h2><label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">Juego<select value={gameId} onChange={(e)=>setGameId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">{alternativeGames.map((g)=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      <div className="mt-5 space-y-4">{(["fun","participation","difficulty","intensity","cooperation"] as const).map((key)=><Scale key={key} label={{fun:"Diversión",participation:"Participación",difficulty:"Dificultad",intensity:"Intensidad",cooperation:"Cooperación"}[key]} value={values[key]} onChange={(v)=>patch(key,v)}/>)}</div>
      <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">¿Volverías a practicarlo?<select value={values.wouldPlayAgain?"si":"no"} onChange={(e)=>patch("wouldPlayAgain",e.target.value==="si")} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option value="si">Sí</option><option value="no">No</option></select></label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">Comentario<textarea rows={3} value={values.comment} onChange={(e)=>patch("comment",e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">Propuesta de mejora<textarea rows={3} value={values.improvementProposal} onChange={(e)=>patch("improvementProposal",e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
      <button onClick={()=>setSaved(true)} className="mt-5 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Guardar valoración</button>{saved&&<p className="mt-4 text-sm font-semibold text-[#1e6b4f]"><CheckCircle2 className="mr-2 inline" size={17}/>Valoración guardada en modo demo.</p>}
    </section>
    <aside className="card p-6"><h2 className="font-extrabold">Mis valoraciones</h2><div className="mt-4 divide-y divide-slate-100">{gameRatings.map((r)=><div key={r.id} className="py-4"><p className="font-bold">{alternativeGames.find((g)=>g.id===r.gameId)?.name}</p><p className="mt-1 text-xs text-slate-500">{r.date} · Diversión {r.fun}/5 · Cooperación {r.cooperation}/5</p></div>)}</div></aside>
  </div>;
}
function Scale({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}){return <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">{label} · {value}/5<input type="range" min="1" max="5" value={value} onChange={(e)=>onChange(Number(e.target.value))} className="mt-2 w-full"/></label>}
