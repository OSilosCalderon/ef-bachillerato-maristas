"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ExternalLink, FileDown, Loader2, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import {
  createTheoryAttachmentUrl,
  deleteTheoryMaterial,
  loadTheoryMaterialsForTeacher,
  saveTheoryMaterial,
  toggleTheoryMaterialPublished,
  type TheoryContentType,
  type TheoryMaterial,
} from "@/lib/theory-content-data";

type FormState = {
  id?: string;
  title: string;
  situationCode: string;
  category: string;
  type: TheoryContentType;
  body: string;
  externalUrl: string;
  existingAttachmentPath?: string | null;
  existingAttachmentName?: string | null;
  existingAttachmentMime?: string | null;
};

const emptyForm: FormState = {
  title: "",
  situationCode: "SA1",
  category: "",
  type: "Explicación",
  body: "",
  externalUrl: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export function ContentManager() {
  const [contents, setContents] = useState<TheoryMaterial[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      setContents(await loadTheoryMaterialsForTeacher());
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "No se han podido cargar los contenidos.");
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function resetForm() {
    setForm(emptyForm);
    setFile(null);
    setFileInputKey((value) => value + 1);
  }

  function edit(material: TheoryMaterial) {
    setForm({
      id: material.id,
      title: material.title,
      situationCode: material.situationCode,
      category: material.category,
      type: material.type,
      body: material.body,
      externalUrl: material.externalUrl ?? "",
      existingAttachmentPath: material.attachmentPath,
      existingAttachmentName: material.attachmentName,
      existingAttachmentMime: material.attachmentMime,
    });
    setFile(null);
    setFileInputKey((value) => value + 1);
    setMessage("Editando contenido. Guarda como borrador o publícalo para aplicar los cambios.");
    setIsError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function persist(published: boolean) {
    if (!form.title.trim()) {
      setIsError(true);
      setMessage("El título es obligatorio.");
      return;
    }

    setSaving(true);
    setMessage("");
    setIsError(false);
    try {
      const saved = await saveTheoryMaterial({ ...form, published }, file);
      setContents((items) => {
        const exists = items.some((item) => item.id === saved.id);
        const next = exists ? items.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...items];
        return next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      });
      setMessage(published ? "Contenido publicado correctamente." : "Borrador guardado correctamente.");
      resetForm();
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "No se ha podido guardar el contenido.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(material: TheoryMaterial) {
    setBusyId(material.id);
    setMessage("");
    setIsError(false);
    try {
      const saved = await toggleTheoryMaterialPublished(material);
      setContents((items) => items.map((item) => (item.id === material.id ? saved : item)));
      setMessage(saved.published ? "Contenido publicado." : "Contenido pasado a borrador.");
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "No se ha podido cambiar el estado.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(material: TheoryMaterial) {
    if (!window.confirm(`¿Eliminar “${material.title}”? Esta acción no se puede deshacer.`)) return;
    setBusyId(material.id);
    setMessage("");
    setIsError(false);
    try {
      await deleteTheoryMaterial(material);
      setContents((items) => items.filter((item) => item.id !== material.id));
      if (form.id === material.id) resetForm();
      setMessage("Contenido eliminado.");
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "No se ha podido eliminar el contenido.");
    } finally {
      setBusyId(null);
    }
  }

  async function openAttachment(material: TheoryMaterial) {
    if (!material.attachmentPath) return;
    setBusyId(material.id);
    try {
      const url = await createTheoryAttachmentUrl(material.attachmentPath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (cause) {
      setIsError(true);
      setMessage(cause instanceof Error ? cause.message : "No se ha podido abrir el documento.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {message && <div role="status" className={`rounded-xl border p-3 text-sm ${isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{message}</div>}

      <section className="card p-6">
        <div className="flex items-center gap-3"><Plus className="text-[#1e6b4f]"/><div><h2 className="text-lg font-extrabold">{form.id ? "Editar contenido" : "Crear contenido"}</h2><p className="text-sm text-slate-500">Publica explicaciones, enlaces y documentos. El alumnado solo verá los contenidos publicados.</p></div></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Título<input value={form.title} onChange={(e) => update("title", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#1e6b4f] focus:outline-none"/></label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Situación<select value={form.situationCode} onChange={(e) => update("situationCode", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option>SA1</option><option>SA2</option><option>SA3</option></select></label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Categoría<input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Entrenamiento, salud, práctica segura…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Tipo<select value={form.type} onChange={(e) => update("type", e.target.value as TheoryContentType)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option>Explicación</option><option>Documento</option><option>Infografía</option><option>Enlace</option><option>Vídeo enlazado</option><option>Ficha</option></select></label>
          <label className="md:col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">Contenido<textarea value={form.body} onChange={(e) => update("body", e.target.value)} rows={8} placeholder="Escribe aquí el contenido teórico, indicaciones o resumen…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#1e6b4f] focus:outline-none"/></label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Enlace externo<input type="url" value={form.externalUrl} onChange={(e) => update("externalUrl", e.target.value)} placeholder="https://…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Documento adjunto<input key={fileInputKey} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-2 text-sm"/><span className="mt-1 block normal-case font-normal text-slate-400">PDF, Word, PowerPoint o imagen · máximo 20 MB.</span>{form.existingAttachmentName && !file && <span className="mt-1 block normal-case font-semibold text-[#1e6b4f]">Adjunto actual: {form.existingAttachmentName}</span>}</label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => void persist(false)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Guardar borrador</button>
          <button type="button" disabled={saving} onClick={() => void persist(true)} className="flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>} Publicar contenido</button>
          {form.id && <button type="button" onClick={resetForm} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500">Cancelar edición</button>}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-6"><h2 className="font-extrabold">Contenidos del curso</h2><p className="mt-1 text-sm text-slate-500">Datos reales guardados en Supabase.</p></div>
        {loading ? (
          <div className="flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={18}/> Cargando contenidos…</div>
        ) : contents.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">Todavía no has creado contenidos.</div>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-[860px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Título</th><th className="p-4">SA</th><th className="p-4">Categoría</th><th className="p-4">Estado</th><th className="p-4">Material</th><th className="p-4">Acciones</th></tr></thead><tbody>{contents.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="p-4"><strong>{item.title}</strong><p className="text-xs text-slate-400">{item.type} · {formatDate(item.updatedAt)}</p></td><td className="p-4">{item.situationCode}</td><td className="p-4">{item.category}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.published ? "Publicado" : "Borrador"}</span></td><td className="p-4"><div className="flex gap-1">{item.attachmentPath && <button type="button" onClick={() => void openAttachment(item)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Abrir documento"><FileDown size={17}/></button>}{item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noreferrer" className="rounded-lg p-2 hover:bg-slate-100" aria-label="Abrir enlace"><ExternalLink size={17}/></a>}{!item.attachmentPath && !item.externalUrl && <span className="text-xs text-slate-400">Texto</span>}</div></td><td className="p-4"><div className="flex gap-1"><button type="button" onClick={() => edit(item)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Editar"><Pencil size={17}/></button><button type="button" disabled={busyId === item.id} onClick={() => void toggle(item)} aria-label={item.published ? "Despublicar" : "Publicar"} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40">{busyId === item.id ? <Loader2 className="animate-spin" size={17}/> : item.published ? <EyeOff size={17}/> : <Eye size={17}/>}</button><button type="button" disabled={busyId === item.id} onClick={() => void remove(item)} aria-label="Eliminar" className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 size={17}/></button></div></td></tr>)}</tbody></table></div>
        )}
      </section>
    </div>
  );
}
