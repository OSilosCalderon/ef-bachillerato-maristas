"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, FileDown, ImageIcon, Link2 } from "lucide-react";
import { sa2TheoryContents as seed, sports } from "@/lib/sa2-demo-data";
import type { Sa2ContentCategory, Sa2TheoryContent } from "@/lib/sa2-types";

const labels: Record<Sa2ContentCategory, string> = {
  reglamento: "Reglamento",
  tecnica: "Técnica",
  tactica: "Táctica",
  principios_juego: "Principios de juego",
  seguridad: "Seguridad",
  otros: "Otros",
};

export function SportsTheoryLibrary() {
  const [contents, setContents] = useState(seed);
  const [category, setCategory] = useState<Sa2ContentCategory | "all">("all");
  const [sportId, setSportId] = useState("all");
  const visible = useMemo<Sa2TheoryContent[]>(() => contents.filter((content) =>
    (category === "all" || content.category === category) &&
    (sportId === "all" || content.scope === "sa2" || content.sportId === sportId)
  ), [contents, category, sportId]);

  const toggleRead = (id: string) => setContents((current) => current.map((content) => content.id === id ? { ...content, read: !content.read } : content));

  return (
    <div className="space-y-5">
      <section className="card grid gap-4 p-5 md:grid-cols-2">
        <Filter label="Categoría" value={category} onChange={(value) => setCategory(value as Sa2ContentCategory | "all")}>
          <option value="all">Todas</option>
          {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Filter>
        <Filter label="Deporte" value={sportId} onChange={setSportId}>
          <option value="all">Todos</option>
          {sports.filter((sport) => sport.active).map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
        </Filter>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((content) => {
          const sport = sports.find((item) => item.id === content.sportId);
          return (
            <article key={content.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{labels[content.category]}</span>
                  <span className="rounded-full bg-[#f3f8f5] px-3 py-1 text-xs font-bold text-[#164c3a]">{content.scope === "sa2" ? "Toda SA2" : sport?.name ?? content.topic}</span>
                </div>
                {content.read && <span className="flex items-center gap-1 text-xs font-semibold text-[#1e6b4f]"><CheckCircle2 size={15}/>Leído</span>}
              </div>
              <h2 className="mt-5 text-lg font-extrabold">{content.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{content.excerpt}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
                {content.hasImage && <span className="flex items-center gap-1"><ImageIcon size={14}/>Imagen</span>}
                {content.documents?.map((doc) => <span key={doc} className="flex items-center gap-1"><FileDown size={14}/>{doc}</span>)}
                {content.links?.map((link) => <span key={link} className="flex items-center gap-1"><Link2 size={14}/>{link}</span>)}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-3 py-2 text-sm font-bold text-white"><BookOpen size={16}/>Abrir</button>
                <button onClick={() => toggleRead(content.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">{content.read ? "Marcar no leído" : "Marcar como leído"}</button>
              </div>
              <p className="mt-3 text-xs text-slate-400">Publicado {content.publishedAt}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Filter({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">{children}</select></label>;
}
