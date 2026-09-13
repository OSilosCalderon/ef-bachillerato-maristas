import { createClient } from "@/lib/supabase/client";

export type TheoryContentType = "Explicación" | "Documento" | "Infografía" | "Enlace" | "Vídeo enlazado" | "Ficha";

export type TheoryMaterial = {
  id: string;
  learningSituationId: string;
  situationCode: string;
  title: string;
  body: string;
  category: string;
  type: TheoryContentType;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  externalUrl: string | null;
  attachmentPath: string | null;
  attachmentName: string | null;
  attachmentMime: string | null;
  read?: boolean;
};

export type SaveTheoryMaterialInput = {
  id?: string;
  situationCode: string;
  title: string;
  body: string;
  category: string;
  type: TheoryContentType;
  externalUrl: string;
  published: boolean;
  existingAttachmentPath?: string | null;
  existingAttachmentName?: string | null;
  existingAttachmentMime?: string | null;
};

const BUCKET = "sa1-materials";
const CONTENT_TYPES: TheoryContentType[] = ["Explicación", "Documento", "Infografía", "Enlace", "Vídeo enlazado", "Ficha"];

function contentType(value: unknown): TheoryContentType {
  if (value && typeof value === "object" && "type" in value) {
    const candidate = (value as { type?: unknown }).type;
    if (typeof candidate === "string" && CONTENT_TYPES.includes(candidate as TheoryContentType)) {
      return candidate as TheoryContentType;
    }
  }
  return "Explicación";
}

function toMaterial(row: Record<string, unknown>, situationCode: string, read?: boolean): TheoryMaterial {
  return {
    id: String(row.id),
    learningSituationId: String(row.learning_situation_id),
    situationCode,
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    category: String(row.category ?? "General"),
    type: contentType(row.body_json),
    published: Boolean(row.published),
    publishedAt: row.published_at ? String(row.published_at) : null,
    updatedAt: String(row.updated_at ?? row.created_at ?? ""),
    externalUrl: row.external_url ? String(row.external_url) : null,
    attachmentPath: row.attachment_path ? String(row.attachment_path) : null,
    attachmentName: row.attachment_name ? String(row.attachment_name) : null,
    attachmentMime: row.attachment_mime ? String(row.attachment_mime) : null,
    read,
  };
}

export async function loadPublishedSa1MaterialsForCurrentStudent() {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("No se ha podido identificar al alumno.");

  const [studentResult, saResult] = await Promise.all([
    supabase.from("students").select("id").eq("profile_id", auth.user.id).single(),
    supabase.from("learning_situations").select("id").eq("code", "SA1").single(),
  ]);

  if (studentResult.error || !studentResult.data) throw new Error("No se ha encontrado el perfil de alumno.");
  if (saResult.error || !saResult.data) throw new Error("No se ha encontrado SA1.");

  const studentId = studentResult.data.id as string;
  const sa1Id = saResult.data.id as string;

  const [contentResult, readsResult] = await Promise.all([
    supabase
      .from("theoretical_contents")
      .select("id,learning_situation_id,title,body,category,body_json,published,published_at,created_at,updated_at,external_url,attachment_path,attachment_name,attachment_mime")
      .eq("learning_situation_id", sa1Id)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase.from("theoretical_content_reads").select("content_id").eq("student_id", studentId),
  ]);

  if (contentResult.error) throw new Error("No se han podido cargar los contenidos teóricos.");
  if (readsResult.error) throw new Error("No se ha podido cargar tu progreso de lectura.");

  const readIds = new Set((readsResult.data ?? []).map((item) => String(item.content_id)));
  const materials = (contentResult.data ?? []).map((row) => toMaterial(row as Record<string, unknown>, "SA1", readIds.has(String(row.id))));

  return { studentId, materials };
}

export async function setTheoryMaterialRead(studentId: string, contentId: string, isRead: boolean) {
  const supabase = createClient();
  if (isRead) {
    const { error } = await supabase.from("theoretical_content_reads").insert({ student_id: studentId, content_id: contentId });
    if (error && error.code !== "23505") throw error;
    return;
  }

  const { error } = await supabase
    .from("theoretical_content_reads")
    .delete()
    .eq("student_id", studentId)
    .eq("content_id", contentId);
  if (error) throw error;
}

export async function loadTheoryMaterialsForTeacher() {
  const supabase = createClient();
  const [situationsResult, contentResult] = await Promise.all([
    supabase.from("learning_situations").select("id,code"),
    supabase
      .from("theoretical_contents")
      .select("id,learning_situation_id,title,body,category,body_json,published,published_at,created_at,updated_at,external_url,attachment_path,attachment_name,attachment_mime")
      .order("updated_at", { ascending: false }),
  ]);

  if (situationsResult.error) throw new Error("No se han podido cargar las situaciones de aprendizaje.");
  if (contentResult.error) throw new Error("No se han podido cargar los contenidos.");

  const codes = new Map((situationsResult.data ?? []).map((item) => [String(item.id), String(item.code)]));
  return (contentResult.data ?? []).map((row) =>
    toMaterial(row as Record<string, unknown>, codes.get(String(row.learning_situation_id)) ?? "SA1"),
  );
}

function safeFileName(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120) || "archivo";
}

async function situationIdForCode(code: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("learning_situations").select("id").eq("code", code).single();
  if (error || !data) throw new Error(`No se ha encontrado ${code}.`);
  return data.id as string;
}

export async function saveTheoryMaterial(input: SaveTheoryMaterialInput, file?: File | null) {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("No se ha podido identificar al profesor.");

  const learningSituationId = await situationIdForCode(input.situationCode);
  let uploadedPath: string | null = null;
  let attachmentPath = input.existingAttachmentPath ?? null;
  let attachmentName = input.existingAttachmentName ?? null;
  let attachmentMime = input.existingAttachmentMime ?? null;

  if (file) {
    uploadedPath = `${input.situationCode.toLowerCase()}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(uploadedPath, file, {
      upsert: false,
      contentType: file.type || undefined,
    });
    if (uploadError) throw new Error(`No se ha podido subir el documento: ${uploadError.message}`);
    attachmentPath = uploadedPath;
    attachmentName = file.name;
    attachmentMime = file.type || null;
  }

  const payload = {
    learning_situation_id: learningSituationId,
    title: input.title.trim(),
    body: input.body.trim(),
    category: input.category.trim() || "General",
    body_json: { type: input.type },
    published: input.published,
    published_at: input.published ? new Date().toISOString() : null,
    external_url: input.externalUrl.trim() || null,
    attachment_path: attachmentPath,
    attachment_name: attachmentName,
    attachment_mime: attachmentMime,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (input.id) {
    result = await supabase
      .from("theoretical_contents")
      .update(payload)
      .eq("id", input.id)
      .select("id,learning_situation_id,title,body,category,body_json,published,published_at,created_at,updated_at,external_url,attachment_path,attachment_name,attachment_mime")
      .single();
  } else {
    result = await supabase
      .from("theoretical_contents")
      .insert({ ...payload, created_by: auth.user.id })
      .select("id,learning_situation_id,title,body,category,body_json,published,published_at,created_at,updated_at,external_url,attachment_path,attachment_name,attachment_mime")
      .single();
  }

  if (result.error || !result.data) {
    if (uploadedPath) await supabase.storage.from(BUCKET).remove([uploadedPath]);
    throw new Error(result.error?.message ?? "No se ha podido guardar el contenido.");
  }

  if (uploadedPath && input.existingAttachmentPath && input.existingAttachmentPath !== uploadedPath) {
    await supabase.storage.from(BUCKET).remove([input.existingAttachmentPath]);
  }

  return toMaterial(result.data as Record<string, unknown>, input.situationCode);
}

export async function toggleTheoryMaterialPublished(material: TheoryMaterial) {
  const supabase = createClient();
  const published = !material.published;
  const { data, error } = await supabase
    .from("theoretical_contents")
    .update({ published, published_at: published ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", material.id)
    .select("id,learning_situation_id,title,body,category,body_json,published,published_at,created_at,updated_at,external_url,attachment_path,attachment_name,attachment_mime")
    .single();
  if (error || !data) throw new Error(error?.message ?? "No se ha podido cambiar el estado de publicación.");
  return toMaterial(data as Record<string, unknown>, material.situationCode);
}

export async function deleteTheoryMaterial(material: TheoryMaterial) {
  const supabase = createClient();
  const { error } = await supabase.from("theoretical_contents").delete().eq("id", material.id);
  if (error) throw error;
  if (material.attachmentPath) await supabase.storage.from(BUCKET).remove([material.attachmentPath]);
}

export async function createTheoryAttachmentUrl(path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 30);
  if (error || !data?.signedUrl) throw new Error("No se ha podido abrir el documento adjunto.");
  return data.signedUrl;
}
