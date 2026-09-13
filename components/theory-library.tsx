"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink, FileDown, Loader2 } from "lucide-react";
import {
  createTheoryAttachmentUrl,
  loadPublishedSa1MaterialsForCurrentStudent,
  setTheoryMaterialRead,
  type TheoryMaterial,
} from "@/lib/theory-content-data";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export function TheoryLibrary() {
  const [contents, setContents] = useState<TheoryMaterial[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await loadPublishedSa1MaterialsForCurrentStudent();
      setStudentId(result.studentId);
      setContents(result.materials);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se han podido cargar los contenidos.");
    } finally {
      setLoading(false);
    }
  }

  async function setRead(material: TheoryMaterial, next: boolean) {
    if (!studentId) return;
    setBusyId(material.id);
    setError("");
    try {
      await setTheoryMaterialRead(studentId, material.id, next);
      setContents((items) => items.map((item) => (item.id === material.id ? { ...item, read: next } : item)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido actualizar la lectura.");
    } finally {
      setBusyId(null);
    }
  }

  async function openMaterial(material: TheoryMaterial) {
    setExpandedId((current) => (current === material.id ? null : material.id));
    if (!material.read) await setRead(material, true);
  }

  async function openAttachment(material: TheoryMaterial) {
    if (!material.attachmentPath) return;
    setBusyId(material.id);
    setError("");
    try {
      const url = await createTheoryAttachmentUrl(material.attachmentPath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido abrir el documento.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="card flex items-center gap-3 p-6 text-sm text-slate-500"><Loader2 className="animate-spin" size={18}/> Cargando materiales de SA1…</div>;
  }

  if (contents.length === 0 && !error) {
    return <div className="card p-8 text-center"><BookOpen className="mx-auto text-[#1e6b4f]"/><h2 className="mt-3 font-extrabold">Todavía no hay materiales publicados</h2><p className="mt-1 text-sm text-slate-500">Cuando el profesor publique contenido de SA1 aparecerá aquí.</p></div>;
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {contents.map((content) => {
          const expanded = expandedId === content.id;
          const excerpt = content.body.length > 180 ? `${content.body.slice(0, 180)}…` : content.body;
          return (
            <article key={content.id} className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{content.category || "General"}</span>
                {content.read && <span className="flex items-center gap-1 text-xs font-semibold text-[#1e6b4f]"><CheckCircle2 size={15}/> Leído</span>}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">{content.type}</p>
              <h2 className="mt-1 text-lg font-extrabold">{content.title}</h2>
              {content.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{expanded ? content.body : excerpt}</p>}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void openMaterial(content)}
                  disabled={busyId === content.id}
                  className="flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {busyId === content.id ? <Loader2 className="animate-spin" size={16}/> : <BookOpen size={16}/>} {expanded ? "Cerrar" : "Abrir"}
                </button>
                {content.attachmentPath && (
                  <button type="button" onClick={() => void openAttachment(content)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">
                    <FileDown size={16}/> {content.attachmentName || "Documento"}
                  </button>
                )}
                {content.externalUrl && (
                  <a href={content.externalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600">
                    <ExternalLink size={16}/> Enlace
                  </a>
                )}
              </div>

              <button
                type="button"
                disabled={busyId === content.id}
                onClick={() => void setRead(content, !content.read)}
                className="mt-3 text-xs font-bold text-slate-500 hover:text-[#1e6b4f] disabled:opacity-50"
              >
                {content.read ? "Marcar como no leído" : "Marcar como leído"}
              </button>
              <p className="mt-3 text-xs text-slate-400">Publicado {formatDate(content.publishedAt)}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
