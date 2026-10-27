import { NextResponse } from "next/server";
import { saveOlympiadAnswer } from "@/app/alumno/olimpiada-lisboa/actions";
import { validateOlympiadAnswer } from "@/lib/olympiad-lisboa";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || !request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "La solicitud no es válida." }, { status: 403 });
  let answer;
  try { answer = validateOlympiadAnswer(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Revisa tu respuesta." }, { status: 400 }); }
  try {
    const response = await saveOlympiadAnswer(answer);
    return NextResponse.json({ response }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) return NextResponse.json({ error: "Tu sesión ha caducado. Inicia sesión como alumno de 1º para guardar tu respuesta." }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se ha podido guardar tu respuesta." }, { status: 400 });
  }
}
