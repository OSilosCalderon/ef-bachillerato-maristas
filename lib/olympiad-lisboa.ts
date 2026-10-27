export const OLYMPIAD_LOGO = "/olimpiada-lisboa/logo-lisboa-2027.png";
export const OLYMPIAD_RULES = "/olimpiada-lisboa/reglamento-2027.pdf";
export const OLYMPIAD_PROGRAM = "/olimpiada-lisboa/programa-2027.png";
export const OLYMPIAD_CHOICES = [
  { id: "futbol-sala", sport: "Fútbol sala", label: "Fútbol sala" },
  { id: "baloncesto", sport: "Baloncesto", label: "Baloncesto" },
  { id: "voleibol", sport: "Voleibol", label: "Voleibol" },
  { id: "atletismo-longitud", sport: "Atletismo", label: "Atletismo · Salto de longitud" },
  { id: "atletismo-2000", sport: "Atletismo", label: "Atletismo · 2.000 metros" },
  { id: "atletismo-peso", sport: "Atletismo", label: "Atletismo · Lanzamiento de peso" },
  { id: "tenis-mesa", sport: "Tenis de mesa", label: "Tenis de mesa" },
  { id: "badminton", sport: "Bádminton", label: "Bádminton" },
  { id: "natacion-libres", sport: "Natación", label: "Natación · 50 metros libres" },
  { id: "natacion-espalda", sport: "Natación", label: "Natación · 50 metros espalda" },
  { id: "natacion-mariposa", sport: "Natación", label: "Natación · 50 metros mariposa" },
  { id: "gimnasia-suelo", sport: "Gimnasia deportiva", label: "Gimnasia deportiva · Suelo" },
  { id: "gimnasia-minitrampolin", sport: "Gimnasia deportiva", label: "Gimnasia deportiva · Minitrampolín" },
] as const;
export const OLYMPIAD_GENDERS = [
  { id: "femenino", label: "Femenino" },
  { id: "masculino", label: "Masculino" },
  { id: "otra-identidad", label: "Otra identidad" },
  { id: "no-indicado", label: "Prefiero no indicarlo" },
] as const;
export type OlympiadChoice = typeof OLYMPIAD_CHOICES[number]["id"];
export type OlympiadGender = typeof OLYMPIAD_GENDERS[number]["id"];
export type OlympiadAnswer = { participating: boolean; gender: OlympiadGender | null; first_choice: OlympiadChoice | null; second_choice: OlympiadChoice | null };
export type OlympiadResponse = OlympiadAnswer & { student_id: string; updated_at: string };
export type OlympiadStudentRow = { id: string; name: string; group: string; response: OlympiadResponse | null };
export const olympiadChoiceLabel = (value: string | null) => OLYMPIAD_CHOICES.find((choice) => choice.id === value)?.label ?? "—";
export const olympiadGenderLabel = (value: string | null) => OLYMPIAD_GENDERS.find((gender) => gender.id === value)?.label ?? "—";

export function validateOlympiadAnswer(input: unknown): OlympiadAnswer {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Indica si deseas participar.");
  const value = input as Record<string, unknown>;
  if (typeof value.participating !== "boolean") throw new Error("Indica si deseas participar.");
  if (!value.participating) return { participating: false, gender: null, first_choice: null, second_choice: null };
  if (!OLYMPIAD_GENDERS.some((gender) => gender.id === value.gender)) throw new Error("Selecciona tu género.");
  if (!OLYMPIAD_CHOICES.some((choice) => choice.id === value.first_choice)) throw new Error("Selecciona tu primera opción.");
  if (!OLYMPIAD_CHOICES.some((choice) => choice.id === value.second_choice)) throw new Error("Selecciona tu segunda opción.");
  if (value.first_choice === value.second_choice) throw new Error("Elige dos opciones diferentes.");
  return { participating: true, gender: value.gender as OlympiadGender, first_choice: value.first_choice as OlympiadChoice, second_choice: value.second_choice as OlympiadChoice };
}

export const OLYMPIAD_PROGRAM_DAYS = [
  { day: "Jueves", date: "15 abril", iso: "2027-04-15", morning: ["09:00 · Ceremonia de apertura", "Actividades deportivas"], afternoon: ["Actividades deportivas", "Actividades socioculturales"], night: ["Noche cultural y de convivencia"] },
  { day: "Viernes", date: "16 abril", iso: "2027-04-16", morning: ["Buenos días", "Actividades deportivas", "Actividades socioculturales"], afternoon: ["Actividades deportivas", "Actividades socioculturales"], night: ["Noche cultural y de convivencia"] },
  { day: "Sábado", date: "17 abril", iso: "2027-04-17", morning: ["Buenos días", "Actividades deportivas · Finales"], afternoon: ["14:00 · Almuerzo de clausura"], night: [] },
] as const;
