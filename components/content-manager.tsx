"use client";

import { useState } from "react";
import { Eye, EyeOff, FilePlus2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { centralContents, documentLibrary } from "@/lib/teacher-dashboard-data";

export function ContentManager() {
  const [contents, setContents] = useState(centralContents);
  const [message, setMessage] = useState("");

  function remove(id: string) {
    if (!window.confirm("¿Eliminar este contenido demo? Esta acción deberá confirmarse también en producción.")) return;
    setContents((items)=>items.filter((item)=>item.id!==id));
    setMessage("Contenido eliminado en modo demo.");
  }

  function toggle(id: string) {
    setContents((items)=>items.map((item)=>item.id===id?{...item,status:item.status==="Publicado"?"Borrador":"Publicado"}:item));
    setMessage("Estado de publicación actualizado.");
  }

  return <div className="space-y-6">
    {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
    <section className="card p-6">
      <div className="flex items-center gap-3"><Plus className="text-[#1e6b4f]"/><div><h2 className="text-lg font-extrabold">Crear contenido</h2><p className="text-sm text-slate-500">Interfaz común para SA1, SA2 y SA3.</p></div></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field id="content-title" label="Título"/>
        <Select id="content-sa" label="Situación"><option>SA1</option><option>SA2</option><option>SA3</option></Select>
        <Field id="content-category" label="Categoría"/>
        <Select id="content-type" label="Tipo"><option>Explicación</option><option>Documento</option><option>Infografía</option><option>Enlace</option><option>Vídeo enlazado</option><option>Ficha</option></Select>
        <label htmlFor="content-body" className="md:col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">Contenido enriquecido<textarea id="content-body" rows={7} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#1e6b4f] focus:outline-none"/></label>
        <Field id="content-link" label="Enlace" type="url"/>
        <label htmlFor="content-file" className="text-xs font-bold uppercase tracking-wide text-slate-500">Documento adjunto<input id="content-file" type="file" className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-2 text-sm"/></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2"><button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Guardar borrador</button><button className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Publicar contenido</button></div>
    </section>

    <section className="card overflow-hidden">
      <div className="border-b border-slate-200 p-6"><h2 className="font-extrabold">Contenidos del curso</h2></div>
      <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Título</th><th className="p-4">SA</th><th className="p-4">Categoría</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr></thead><tbody>{contents.map((item)=><tr key={item.id} className="border-t border-slate-100"><td className="p-4"><strong>{item.title}</strong><p className="text-xs text-slate-400">{item.type} · {item.updated}</p></td><td className="p-4">{item.sa}</td><td className="p-4">{item.category}</td><td className="p-4">{item.status}</td><td className="p-4"><div className="flex gap-1"><Action label="Editar" icon={Pencil}/><button onClick={()=>toggle(item.id)} aria-label={item.status==="Publicado"?"Despublicar":"Publicar"} className="rounded-lg p-2 hover:bg-slate-100">{item.status==="Publicado"?<EyeOff size={17}/>:<Eye size={17}/>}</button><button onClick={()=>remove(item.id)} aria-label="Eliminar" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17}/></button></div></td></tr>)}</tbody></table></div>
    </section>

    <DocumentLibrary/>
  </div>;
}

export function DocumentLibrary() {
  return <section className="card p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-extrabold">Biblioteca de documentos</h2><p className="mt-1 text-sm text-slate-500">Archivos privados servidos desde Supabase Storage.</p></div><button className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><Upload size={17}/>Subir documento</button></div><div className="mt-5 grid gap-3 md:grid-cols-3">{documentLibrary.map((doc)=><article key={doc.id} className="rounded-2xl border border-slate-200 p-4"><FilePlus2 className="text-[#1e6b4f]"/><p className="mt-4 font-bold">{doc.title}</p><p className="mt-1 text-xs text-slate-400">{doc.sa} · {doc.size}</p><p className="mt-3 text-xs text-slate-500">{doc.visibility}</p></article>)}</div></section>
}
function Action({ label, icon: Icon }: { label: string; icon: typeof Pencil }) { return <button aria-label={label} className="rounded-lg p-2 hover:bg-slate-100"><Icon size={17}/></button> }
function Field({ id, label, type="text" }: { id:string; label:string; type?:string }) { return <label htmlFor={id} className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<input id={id} type={type} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#1e6b4f] focus:outline-none"/></label> }
function Select({ id, label, children }: { id:string; label:string; children:React.ReactNode }) { return <label htmlFor={id} className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<select id={id} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-[#1e6b4f] focus:outline-none">{children}</select></label> }
