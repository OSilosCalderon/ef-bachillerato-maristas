"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock3, List, Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ClassSession={id:string;session_date:string;start_time:string;end_time:string;class_group:string};
type Entry={id:string;class_session_id:string|null;session_date:string;title:string;activities:string;feeling:string;learning:string;perceived_difficulty:number;perceived_effort:number;reflection:string;saved:boolean};

const fmtTime=(v:string)=>v.slice(0,5);
const fmtDate=(v:string)=>new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(`${v}T12:00:00`));

export function JournalPanel(){
  const [entries,setEntries]=useState<Entry[]>([]);
  const [sessions,setSessions]=useState<ClassSession[]>([]);
  const [studentId,setStudentId]=useState<string|null>(null);
  const [sa1Id,setSa1Id]=useState<string|null>(null);
  const [group,setGroup]=useState<string|null>(null);
  const [selectedSession,setSelectedSession]=useState("");
  const [mode,setMode]=useState<"list"|"timeline">("list");
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{void load()},[]);

  async function load(){
    setLoading(true); setMessage("");
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setMessage("No se ha podido identificar al alumno.");setLoading(false);return;}
    const [{data:profile},{data:student},{data:sa1}]=await Promise.all([
      supabase.from("profiles").select("class_group").eq("id",user.id).single(),
      supabase.from("students").select("id").eq("profile_id",user.id).single(),
      supabase.from("learning_situations").select("id").eq("code","SA1").single()
    ]);
    const g=profile?.class_group ?? null; setGroup(g); setStudentId(student?.id ?? null); setSa1Id(sa1?.id ?? null);
    if(!student?.id || !sa1?.id){setMessage("Falta completar la vinculación del alumno con el curso.");setLoading(false);return;}

    let sessionQuery=supabase.from("class_sessions").select("id,session_date,start_time,end_time,class_group").eq("academic_year","2026/2027").eq("status","scheduled").order("session_date");
    if(g && (g.includes("1ºA")||g.includes("1ºB"))) sessionQuery=sessionQuery.eq("class_group",g);
    const [{data:sessionData},{data:journalData}]=await Promise.all([
      sessionQuery,
      supabase.from("session_journals").select("id,class_session_id,session_date,title,activities,feeling,learning,perceived_difficulty,perceived_effort,reflection").eq("student_id",student.id).eq("learning_situation_id",sa1.id).order("session_date",{ascending:false})
    ]);
    setSessions(sessionData ?? []);
    setEntries((journalData ?? []).map(j=>({...j,perceived_difficulty:j.perceived_difficulty??3,perceived_effort:j.perceived_effort??5,saved:true})) as Entry[]);
    setLoading(false);
  }

  const usedSessionIds=useMemo(()=>new Set(entries.map(e=>e.class_session_id).filter(Boolean)),[entries]);
  const availableSessions=useMemo(()=>sessions.filter(s=>!usedSessionIds.has(s.id)),[sessions,usedSessionIds]);

  function add(){
    const session=sessions.find(s=>s.id===selectedSession); if(!session)return;
    const entry:Entry={id:`new-${crypto.randomUUID()}`,class_session_id:session.id,session_date:session.session_date,title:"Sesión de Educación Física",activities:"",feeling:"",learning:"",perceived_difficulty:3,perceived_effort:5,reflection:"",saved:false};
    setEntries(x=>[entry,...x]); setSelectedSession("");
  }
  function update(id:string,key:keyof Entry,value:string|number|boolean|null){setEntries(x=>x.map(e=>e.id===id?{...e,[key]:value,saved:false}:e));}

  async function save(entry:Entry){
    if(!studentId||!sa1Id)return;
    setMessage(""); const supabase=createClient();
    const payload={learning_situation_id:sa1Id,student_id:studentId,class_session_id:entry.class_session_id,session_date:entry.session_date,title:entry.title.trim()||"Sesión de Educación Física",activities:entry.activities,feeling:entry.feeling,learning:entry.learning,perceived_difficulty:entry.perceived_difficulty,perceived_effort:entry.perceived_effort,reflection:entry.reflection,updated_at:new Date().toISOString()};
    if(entry.id.startsWith("new-")){
      const {data,error}=await supabase.from("session_journals").insert(payload).select("id").single();
      if(error){setMessage(error.message);return;}
      setEntries(x=>x.map(e=>e.id===entry.id?{...e,id:data.id,saved:true}:e));
    }else{
      const {error}=await supabase.from("session_journals").update(payload).eq("id",entry.id);
      if(error){setMessage(error.message);return;}
      setEntries(x=>x.map(e=>e.id===entry.id?{...e,saved:true}:e));
    }
    setMessage("Entrada guardada correctamente.");
  }

  if(loading)return <div className="card p-6 text-sm text-slate-500">Cargando diario y calendario de clases…</div>;

  return <div className="space-y-5">
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Tu horario</p><h2 className="mt-1 text-xl font-extrabold">{group??"Grupo pendiente de asignación"}</h2><p className="mt-1 text-sm text-slate-500">El diario se vincula a una clase lectiva real del calendario 2026/2027.</p></div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row lg:max-w-2xl">
          <select value={selectedSession} onChange={e=>setSelectedSession(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm"><option value="">Selecciona una sesión…</option>{availableSessions.map(s=><option key={s.id} value={s.id}>{fmtDate(s.session_date)} · {fmtTime(s.start_time)}–{fmtTime(s.end_time)}</option>)}</select>
          <button onClick={add} disabled={!selectedSession} className="flex items-center justify-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"><Plus size={17}/>Nueva entrada</button>
        </div>
      </div>
      {group?.includes("1ºA")&&<p className="mt-4 rounded-xl bg-[#e7f2ed] p-3 text-sm text-[#164c3a]"><strong>1ºA:</strong> lunes 09:10–10:05 y jueves 10:05–11:00.</p>}
      {group?.includes("1ºB")&&<p className="mt-4 rounded-xl bg-[#e7f2ed] p-3 text-sm text-[#164c3a]"><strong>1ºB:</strong> lunes 12:25–13:20 y viernes 11:30–12:25.</p>}
      {message&&<p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{message}</p>}
    </section>

    <div className="flex rounded-xl border border-slate-200 bg-white p-1 w-fit"><button onClick={()=>setMode("list")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode==="list"?"bg-slate-100":""}`}><List size={16}/>Lista</button><button onClick={()=>setMode("timeline")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode==="timeline"?"bg-slate-100":""}`}><CalendarDays size={16}/>Cronología</button></div>

    {entries.length===0?<div className="card p-8 text-center"><CalendarDays className="mx-auto text-[#1e6b4f]"/><h3 className="mt-3 font-extrabold">Aún no tienes entradas</h3><p className="mt-1 text-sm text-slate-500">Selecciona una sesión de tu horario y completa tu reflexión.</p></div>:<div className={mode==="timeline"?"space-y-5 border-l-2 border-slate-200 pl-5":"space-y-4"}>{entries.map(e=>{
      const session=sessions.find(s=>s.id===e.class_session_id);
      return <article key={e.id} className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#1e6b4f]"><CalendarDays size={15}/>{fmtDate(e.session_date)}</p>{session&&<p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={14}/>{fmtTime(session.start_time)}–{fmtTime(session.end_time)}</p>}</div><span className={`rounded-full px-3 py-1 text-xs font-bold ${e.saved?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{e.saved?<><Check size={13} className="mr-1 inline"/>Guardado</>:"Cambios sin guardar"}</span></div>
        <label className="mt-4 block text-xs font-bold text-slate-500">TÍTULO<input value={e.title} onChange={x=>update(e.id,"title",x.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
        {([["activities","Qué hemos realizado"],["feeling","Cómo me he sentido"],["learning","Qué he aprendido"],["reflection","Reflexión personal"]] as const).map(([k,l])=><label key={k} className="mt-4 block text-xs font-bold text-slate-500">{l.toUpperCase()}<textarea value={e[k]} onChange={x=>update(e.id,k,x.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>)}
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-500">DIFICULTAD · {e.perceived_difficulty}/5<input type="range" min="1" max="5" value={e.perceived_difficulty} onChange={x=>update(e.id,"perceived_difficulty",+x.target.value)} className="mt-2 w-full"/></label><label className="text-xs font-bold text-slate-500">ESFUERZO · {e.perceived_effort}/10<input type="range" min="1" max="10" value={e.perceived_effort} onChange={x=>update(e.id,"perceived_effort",+x.target.value)} className="mt-2 w-full"/></label></div>
        <div className="mt-5 flex justify-end"><button onClick={()=>save(e)} disabled={e.saved} className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:bg-slate-300"><Save size={16}/>Guardar entrada</button></div>
      </article>})}</div>}
  </div>;
}
