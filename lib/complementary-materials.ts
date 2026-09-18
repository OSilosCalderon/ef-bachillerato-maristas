import { createClient } from "@/lib/supabase/client";

export type ComplementaryMaterial = { id: string; title: string; topic_slug: string; external_url: string | null; storage_path: string | null; file_name: string | null; published: boolean; href?: string };
const bucket = "theory-complementary";
export const complementaryFileTypes: Record<string, string> = {
  pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
};

export async function loadComplementaryMaterials(topicSlug: string, teacher = false) {
  const client = createClient();
  let query = client.from("complementary_theory_materials").select("id,title,topic_slug,external_url,storage_path,file_name,published").eq("topic_slug", topicSlug).order("created_at", { ascending: false });
  if (!teacher) query = query.eq("published", true);
  const { data, error } = await query;
  if (error) throw new Error("No se han podido cargar los materiales complementarios.");
  return Promise.all(((data ?? []) as ComplementaryMaterial[]).map(async (row) => {
    if (row.external_url) return { ...row, href: row.external_url };
    if (!row.storage_path) return row;
    const { data: link, error: linkError } = await client.storage.from(bucket).createSignedUrl(row.storage_path, 900, { download: row.file_name ?? true });
    if (linkError) throw new Error("No se ha podido preparar la descarga. Pulsa Actualizar materiales para reintentarlo.");
    return { ...row, href: link.signedUrl };
  }));
}

export async function saveComplementaryMaterial(topicSlug: string, title: string, url: string, file: File | null) {
  if (!title.trim() || title.trim().length > 200) throw new Error("Escribe un título de hasta 200 caracteres.");
  if (Boolean(url.trim()) === Boolean(file)) throw new Error("Añade un enlace o un documento.");
  let externalUrl: string | null = null;
  if (url.trim()) {
    try { const parsed = new URL(url.trim()); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(); externalUrl = parsed.href; }
    catch { throw new Error("El enlace debe comenzar por https:// o http://."); }
  }
  const client = createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Vuelve a entrar con tu cuenta de profesorado.");
  let storagePath: string | null = null;
  if (file) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!complementaryFileTypes[extension]) throw new Error("Utiliza PDF, Word, PowerPoint, Excel o una imagen JPG, PNG o WebP.");
    if (!file.size || file.size > 20 * 1024 * 1024) throw new Error("El documento debe ocupar entre 1 byte y 20 MB.");
    storagePath = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from(bucket).upload(storagePath, file, { contentType: complementaryFileTypes[extension], upsert: false });
    if (error) throw new Error("No se ha podido subir el documento. Comprueba tu sesión y vuelve a intentarlo.");
  }
  const { error } = await client.from("complementary_theory_materials").insert({ topic_slug: topicSlug, title: title.trim(), external_url: externalUrl, storage_path: storagePath, file_name: file?.name ?? null, published: true });
  if (error) {
    if (storagePath) await client.storage.from(bucket).remove([storagePath]);
    throw new Error("No se ha podido publicar el material. Vuelve a intentarlo.");
  }
}

export async function setComplementaryPublished(id: string, published: boolean) {
  const { data, error } = await createClient().from("complementary_theory_materials").update({ published }).eq("id", id).select("id").single();
  if (error || !data) throw new Error("No se ha podido cambiar la visibilidad del material.");
}
