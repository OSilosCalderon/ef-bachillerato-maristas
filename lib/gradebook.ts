export type AssessmentGradeItem = { id: string; course_id: string; sa_code: string; item_key: string; title: string; position: number };
export type PublishedAssessmentGrade = { id: string; student_id: string; item_id: string; score: number; comment: string; published_at: string };
export type GradebookStudent = { id: string; courseId: string; name: string; group: string };
export type GradebookData = {
  students: GradebookStudent[];
  items: AssessmentGradeItem[];
  grades: PublishedAssessmentGrade[];
  situations: { courseId: string; code: string; title: string }[];
  loadedAt: string;
};
export const formatGrade = (value: number) => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value);
export const formatPublication = (value: string) => new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", dateStyle: "short", timeStyle: "short" }).format(new Date(value));
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateGradePublication(input: { studentId: string; itemId: string; score: number; comment: string }) {
  if (!input || !uuid.test(input.studentId ?? "") || !uuid.test(input.itemId ?? "")) throw new Error("Selecciona un alumno y un instrumento válidos.");
  if (typeof input.score !== "number" || !Number.isFinite(input.score) || input.score < 0 || input.score > 10 || Math.abs(input.score * 10 - Math.round(input.score * 10)) > 1e-8) throw new Error("La nota debe estar entre 0 y 10 y puede tener una décima.");
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";
  if (comment.length > 500) throw new Error("El comentario no puede superar los 500 caracteres.");
  return { studentId: input.studentId, itemId: input.itemId, score: input.score, comment };
}

export function gradesForStudent(items: AssessmentGradeItem[], grades: PublishedAssessmentGrade[], studentId: string, courseId: string) {
  const ownGrades = new Map(grades.filter((grade) => grade.student_id === studentId).map((grade) => [grade.item_id, grade]));
  return items.filter((item) => item.course_id === courseId)
    .sort((a,b) => a.sa_code.localeCompare(b.sa_code) || a.position-b.position || a.title.localeCompare(b.title,"es"))
    .map((item) => ({ item, grade: ownGrades.get(item.id) ?? null }));
}
