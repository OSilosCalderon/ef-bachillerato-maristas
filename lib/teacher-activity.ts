export const activityCategories = {
  plans: "Planes de trabajo", journals: "Diarios y seguimiento de sesiones", physical: "Pruebas físicas",
  questionnaires: "Cuestionarios", theory: "Lecturas", challenges: "Retos de aplicación", quizzes: "Autoevaluaciones teóricas",
  technical: "Pruebas técnicas", procedural: "Actividades prácticas", habits: "Hábitos saludables", projects: "Proyectos deportivos",
} as const;
export type ActivityCategory = keyof typeof activityCategories;
export type TeacherStudent = { id: string; name: string; group: string };
export type TeacherActivity = {
  id: string; studentId: string; category: ActivityCategory; sa: string; title: string; date: string;
  status: string; score: number | null; scoreLabel?: string; details: Record<string, unknown>;
};
export type PhysicalDefinition = { id: string; name: string; unit: string; direction: string };
export type TeacherActivityData = {
  students: TeacherStudent[]; activities: TeacherActivity[];
  situations: { id: string; code: string; title: string }[]; physicalTests: PhysicalDefinition[];
  courseName: string; loadedAt: string;
};
export const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
export function categorySummary(activities: TeacherActivity[], students: TeacherStudent[], category: ActivityCategory) {
  const ids = new Set(students.map((student) => student.id));
  const rows = activities.filter((row) => ids.has(row.studentId) && row.category === category);
  const participants = new Set(rows.map((row) => row.studentId)).size;
  return { count: rows.length, participants, coverage: students.length ? participants / students.length * 100 : 0, perStudent: students.length ? rows.length / students.length : 0 };
}
export function physicalComparison(activities: TeacherActivity[], studentId: string, test: PhysicalDefinition, groupIds: Set<string>) {
  const get = (period: string, ids: Set<string>) => activities.filter((row) => row.category === "physical" && row.details.physical_test_id === test.id && row.details.period === period && ids.has(row.studentId) && row.score !== null);
  const first = get("september", new Set([studentId]))[0]?.score ?? null;
  const last = get("december", new Set([studentId]))[0]?.score ?? null;
  const initialRows = get("september", groupIds); const finalRows = get("december", groupIds);
  const initialByStudent = new Map(initialRows.map((row) => [row.studentId, row.score!]));
  const paired = finalRows.filter((row) => initialByStudent.has(row.studentId));
  return { first, last, initialMean: mean(initialRows.map((row) => row.score!)), finalMean: mean(finalRows.map((row) => row.score!)), initialN: initialRows.length, finalN: finalRows.length,
    improvement: first !== null && last !== null && first !== 0 ? (last - first) / Math.abs(first) * 100 * (test.direction === "lower_better" ? -1 : 1) : null,
    pairedN: paired.length, pairedInitial: mean(paired.map((row) => initialByStudent.get(row.studentId)!)), pairedFinal: mean(paired.map((row) => row.score!)) };
}
