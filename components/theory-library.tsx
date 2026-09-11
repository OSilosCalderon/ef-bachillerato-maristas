"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, FileDown, Image as ImageIcon, Link2 } from "lucide-react";
import { theoryContents as seed } from "@/lib/sa1-demo-data";

export function TheoryLibrary() {
  const [contents, setContents] = useState(seed);
  const toggleRead = (id: string) => setContents((items) => items.map((item) => item.id === id ? { ...item, read: !item.read } : item));
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {contents.map((content) => (
        <article key={content.id} className="card p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{content.category}</span>
            {content.read && <span className="flex items-center gap-1 text-xs font-semibold text-[#1e6b4f]"><CheckCircle2 size={15}/> Leído</span>}
          </div>
          <h2 className="mt-5 text-lg font-extrabold">{content.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{content.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
            {content.hasImage && <span className="flex items-center gap-1"><ImageIcon size={14}/> Imagen</span>}
            {content.documents?.map((doc) => <span key={doc} className="flex items-center gap-1"><FileDown size={14}/>{doc}</span>)}
            {content.links?.map((link) => <span key={link} className="flex items-center gap-1"><Link2 size={14}/>{link}</span>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-3 py-2 text-sm font-bold text-white"><BookOpen size={16}/> Abrir</button>
            <button onClick={() => toggleRead(content.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">{content.read ? "Marcar no leído" : "Marcar como leído"}</button>
          </div>
          <p className="mt-3 text-xs text-slate-400">Publicado {content.publishedAt}</p>
        </article>
      ))}
    </div>
  );
}
