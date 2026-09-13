"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, School } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Slot = { id:string; class_group:string; weekday:number; start_time:string; end_time:string };
type Session = { id:string; class_group:string; session_date:string; start_time:string; end_time:string; status:string };

const weekdayName: Record<number,string> = {1:"Lunes",2:"Martes",3:"Miércoles",4:"Jueves",5:"Viernes",6:"Sábado",7:"Domingo"};
const fmtTime=(v:string)=>v.slice(0,5);
const fmtDate=(v:string)=>new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"2-digit",month:"short"}).format(new Date(`${v}T12:00:00`));

export function ClassScheduleCard({ showAll=false }: { showAll?: boolean }) {
  const [slots,setSlots]=useState<Slot[]>([]);
  const [sessions,setSessions]=useState<Session[]>([]);
  const [group,setGroup]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    let currentGroup:string|null=null;
    if(!showAll){
      const {data:{user}}=await supabase.auth.getUser();
      if(user){
        const {data:profile}=await supabase.from("profiles").select("class_group").eq("id",user.id).single();
        currentGroup=profile?.class_group ?? null;
        setGroup(currentGroup);
      }
    }
    let slotQuery=supabase.from("class_schedules").select("id,class_group,weekday,start_time,end_time").eq("academic_year","2026/2027").eq("active",true).order("class_group").order("weekday");
    let sessionQuery=supabase.from("class_sessions").select("id,class_group,session_date,start_time,end_time,status").eq("academic_year","2026/2027").eq("status","scheduled").gte("session_date",new Date().toISOString().slice(0,10)).order("session_date").limit(showAll?8:4);
    if(!showAll && currentGroup && (currentGroup.includes("1ºA")||currentGroup.includes("1ºB"))){
      slotQuery=slotQuery.eq("class_group",currentGroup);
      sessionQuery=sessionQuery.eq("class_group",currentGroup);
    }
    const [{data:slotData},{data:sessionData}]=await Promise.all([slotQuery,sessionQuery]);
    setSlots(slotData ?? []); setSessions(sessionData ?? []); setLoading(false);
  })()},[showAll]);

  const grouped=useMemo(()=>{
    const map=new Map<string,Slot[]>();
    slots.forEach(s=>map.set(s.class_group,[...(map.get(s.class_group)??[]),s]));
    return [...map.entries()];
  },[slots]);

  return <section className="card p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Horario de Educación Física</p><h2 className="mt-1 text-xl font-extrabold">Curso 2026/2027</h2></div>
      <span className="rounded-xl bg-[#e7f2ed] p-2.5 text-[#1e6b4f]"><School size={20}/></span>
    </div>
    {loading?<p className="mt-4 text-sm text-slate-500">Cargando horario…</p>:<>
      {!showAll && group && !group.includes("1ºA") && !group.includes("1ºB") && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Tu grupo todavía no está asignado como 1ºA o 1ºB. Se muestran ambos horarios.</p>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {grouped.map(([name,items])=><article key={name} className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-extrabold text-slate-900">{name}</h3><div className="mt-3 space-y-2">{items.map(s=><div key={s.id} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-slate-600"><CalendarDays size={16} className="text-[#1e6b4f]"/>{weekdayName[s.weekday]}</span><strong className="flex items-center gap-1"><Clock3 size={15}/>{fmtTime(s.start_time)}–{fmtTime(s.end_time)}</strong></div>)}</div></article>)}
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Próximas clases lectivas</p><div className="mt-3 flex flex-wrap gap-2">{sessions.map(s=><span key={s.id} className="rounded-full bg-[#f4e8d7] px-3 py-1.5 text-xs font-semibold text-slate-700">{showAll?`${s.class_group} · `:""}{fmtDate(s.session_date)} · {fmtTime(s.start_time)}</span>)}</div></div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Calendario generado con los días lectivos oficiales de Extremadura 2026/2027. Las fiestas locales de Badajoz de 2027 y el Día del Centro se ajustarán cuando estén publicados o fijados por el centro.</p>
    </>}
  </section>;
}
