"use client";

import { useEffect, useState, type FormEvent } from "react";
import { loadComplementaryMaterials, saveComplementaryMaterial, setComplementaryPublished, complementaryFileTypes, type ComplementaryMaterial } from "@/lib/complementary-materials";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";

const topics = [...trainingTheoryTopics, flexibilityTheoryTopic];

export function ComplementaryMaterials({ topicSlug, teacher = false }: { topicSlug: string; teacher?: boolean }) {
  const [materials, setMaterials] = useState<ComplementaryMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState("link");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loadComplementaryMaterials(topicSlug, teacher).then((items) => { if (active) setMaterials(items); }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "No se han podido cargar los materiales."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [topicSlug, teacher, revision]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await saveComplementaryMaterial(topicSlug, title, kind === "link" ? url : "", kind === "file" ? file : null);
      setTitle(""); setUrl(""); setFile(null); setFileKey((value) => value + 1);
      setMessage("Material publicado para el alumnado."); setRevision((value) => value + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se ha podido publicar."); }
    finally { setBusy(false); }
  }
  async function toggle(item: ComplementaryMaterial) {
    setBusy(true); setError(""); setMessage("");
    try { await setComplementaryPublished(item.id, !item.published); setRevision((value) => value + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se ha podido cambiar la visibilidad."); }
    finally { setBusy(false); }
  }
  return <section className="rounded-3xl border border-sky-200 bg-sky-50 p-6">
    <h3 className="text-lg font-extrabold text-sky-950">Enlaces y documentos complementarios</h3>
    <p className="mt-2 text-sm leading-6 text-sky-900">Material adicional para ampliar este tema. Su consulta es opcional y no se registra ni cuenta para el progreso o la evaluación.</p>
    {teacher && <form onSubmit={submit} className="mt-5 space-y-3">
      <label className="block text-sm font-bold">Título<input required maxLength={200} value={title} disabled={busy} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-xl border bg-white p-3"/></label>
      <label className="block text-sm font-bold">Tipo<select value={kind} disabled={busy} onChange={(event) => setKind(event.target.value)} className="mt-1 w-full rounded-xl border bg-white p-3"><option value="link">Enlace</option><option value="file">Documento o imagen</option></select></label>
      {kind === "link" ? <label className="block text-sm font-bold">Dirección del enlace<input required type="url" placeholder="https://…" value={url} disabled={busy} onChange={(event) => setUrl(event.target.value)} className="mt-1 w-full rounded-xl border bg-white p-3"/></label> : <label className="block text-sm font-bold">Documento · máximo 20 MB<input key={fileKey} required type="file" accept={Object.keys(complementaryFileTypes).map((extension) => `.${extension}`).join(",")} disabled={busy} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm"/><span className="mt-2 block text-xs font-normal">PDF, Word, PowerPoint, Excel, JPG, PNG o WebP.</span></label>}
      <button disabled={busy} className="rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Guardando…" : "Publicar material complementario"}</button>
    </form>}
    {loading ? <p role="status" className="mt-4 text-sm">Cargando materiales…</p> : <ul className="mt-4 space-y-3">{materials.map((item) => <li key={item.id} className="rounded-xl bg-white p-4"><a href={item.href} target="_blank" rel="noopener noreferrer" className="break-words font-bold text-[#1e6b4f] underline">{item.title}</a><p className="mt-1 break-words text-xs text-slate-500">{item.file_name ?? "Enlace externo"}{teacher ? item.published ? " · Visible" : " · Oculto" : ""}</p>{teacher && <button type="button" disabled={busy} onClick={() => void toggle(item)} className="mt-2 text-sm font-bold underline">{item.published ? "Ocultar al alumnado" : "Mostrar al alumnado"}</button>}</li>)}</ul>}
    {!loading && !error && !materials.length && <p className="mt-4 text-sm text-sky-900">Todavía no hay materiales complementarios publicados para este tema.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-emerald-800">{message}</p>}
    <button type="button" disabled={loading || busy} onClick={() => setRevision((value) => value + 1)} className="mt-4 text-xs font-bold text-sky-900 underline">Actualizar materiales</button>
  </section>;
}

export function ComplementaryMaterialsManager() {
  const [slug, setSlug] = useState(topics[0].slug);
  return <section className="mb-8 space-y-4"><h2 className="text-xl font-extrabold">Material complementario · Teoría de 1º Bachillerato</h2><label className="block text-sm font-bold">Tema<select value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3">{topics.map((topic) => <option key={topic.slug} value={topic.slug}>{topic.number}. {topic.title}</option>)}</select></label><ComplementaryMaterials key={slug} topicSlug={slug} teacher/></section>;
}
