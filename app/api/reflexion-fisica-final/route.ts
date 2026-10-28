import { NextResponse } from "next/server";
import { saveFinalPhysicalReflection } from "@/lib/final-physical-reflection-server";
import { validateReflection } from "@/lib/final-physical-reflection";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || !request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "La solicitud no es válida." }, { status: 403 });
  let answer;
  try { answer = validateReflection(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Revisa tus respuestas." }, { status: 400 }); }
  try { return NextResponse.json({ response: await saveFinalPhysicalReflection(answer) }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) return NextResponse.json({ error: "Tu sesión ha caducado. Inicia sesión como alumno para guardar." }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se ha podido guardar tu reflexión." }, { status: 400 });
  }
}
