"use client";
import { useMemo,useState } from "react";
import { BookOpen, CheckCircle2, Search } from "lucide-react";
import { sa3TheoryContents as seed } from "@/lib/sa3-demo-data";

export function Sa3TheoryLibrary(){
 const [items,setItems]=useState(seed); const [query,setQuery]=useState(""); const [category,setCategory]=useState("Todas");
 const categories=["Todas",...Array.from(new Set(items.map(i=>i.category)))];
 const visible=useMemo(()=>items.filter(i=>(category==="Todas"||i.category===category)&&`${i.title} ${i.description}`.toLowerCase().includes(query.toLowerCase())),[items,query,category]);
 const toggle=(id:string)=>setItems(current=>current.map(i=>i.id===id?{...i,read:!i.read}:i));
 return <div className="space-y-5"><section className="card grid gap-4 p-5 md:grid-cols-[1fr_240px]"><label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar materiales" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm"/></label><select value={category} onChange={(e)=>setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">{categories.map(c=><option key={c}>{c}</option>)}</select></section><div className="grid gap-4 md:grid-cols-2">{visible.map(item=><article key={item.id} className="card p-6"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.category}</span>{item.read&&<span className="flex items-center gap-1 text-xs font-bold text-[#1e6b4f]"><CheckCircle2 size={15}/>Consultado</span>}</div><h2 className="mt-4 text-lg font-extrabold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p><p className="mt-4 text-xs uppercase tracking-wide text-slate-400">{item.type.replace("_"," ")} · {item.publishedAt}</p><div className="mt-5 flex gap-2"><button className="flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-3 py-2 text-sm font-bold text-white"><BookOpen size={16}/>Abrir</button><button onClick={()=>toggle(item.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">{item.read?"Marcar pendiente":"Marcar consultado"}</button></div></article>)}</div></div>
}
