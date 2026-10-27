import { validateOlympiadAnswer, type OlympiadResponse } from "./olympiad-lisboa";

export async function submitOlympiadResponse(input: unknown): Promise<OlympiadResponse> {
  const answer = validateOlympiadAnswer(input);
  const response = await fetch("/api/olimpiada-lisboa", {
    method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answer),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.response) throw new Error(typeof result?.error === "string" ? result.error : "No se ha podido guardar. Actualiza la página e inténtalo de nuevo.");
  const saved = result.response as OlympiadResponse;
  if (!saved.student_id || !saved.updated_at || saved.participating !== answer.participating || saved.gender !== answer.gender || saved.first_choice !== answer.first_choice || saved.second_choice !== answer.second_choice) throw new Error("No se ha podido confirmar tu respuesta. Vuelve a intentarlo.");
  return saved;
}
