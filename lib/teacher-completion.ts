import { evaluationInstrumentKey, type ExpectedTeacherInstrument, type TeacherActivity, type TeacherActivityData, type TeacherSessionEvaluation } from "./teacher-activity";

export type CompletionState = "completed" | "in_progress" | "pending" | "untracked";
export type CompletionItem = {
  key: string; sa: string; category: TeacherActivity["category"]; title: string;
  state: CompletionState; records: TeacherActivity[]; requested: boolean;
  evaluation?: TeacherSessionEvaluation;
  sessionNumber?: number;
};
export function completionOf(row: TeacherActivity, rule?: ExpectedTeacherInstrument["completion"]): CompletionState {
  if (rule === "reflection") {
    const conclusions = typeof row.details.final_conclusions === "string" && row.details.final_conclusions.trim();
    const future = typeof row.details.future_work === "string" && row.details.future_work.trim();
    return conclusions && future ? "completed" : conclusions || future ? "in_progress" : "pending";
  }
  if (row.category === "physical" || row.category === "technical" || row.category === "quizzes") return row.score !== null ? "completed" : "in_progress";
  if (row.category === "theory") return row.details.completed === false ? "pending" : "completed";
  if (row.category === "challenges") return typeof row.details.answer === "string" && row.details.answer.trim() ? "completed" : "pending";
  if (row.category === "journals") return row.status === "draft" ? "in_progress" : "completed";
  if (row.category === "habits" && row.details.week_number !== undefined) return "completed";
  return ["completed", "submitted", "reviewed"].includes(row.status) || Boolean(row.details.submitted_at || row.details.completed_at) ? "completed" : "in_progress";
}
function matches(row: TeacherActivity, item: ExpectedTeacherInstrument) {
  if (row.sa !== item.sa || row.category !== item.category) return false;
  if (item.filters) return Object.entries(item.filters).every(([key, value]) => row.details[key] !== null && row.details[key] !== undefined && String(row.details[key]) === String(value));
  return item.matchAll || row.title === item.title;
}
export function studentCompletion(data: Pick<TeacherActivityData, "students" | "activities" | "expectedInstruments" | "sessionEvaluations">, studentId: string, sa = ""): CompletionItem[] {
  const student = data.students.find((row) => row.id === studentId);
  if (!student) return [];
  const records = data.activities.filter((row) => row.studentId === studentId && (!sa || row.sa === sa));
  const used = new Set<string>();
  const result: CompletionItem[] = (data.expectedInstruments ?? []).filter((item) => (!sa || item.sa === sa) && (!item.group || item.group === student.group)).map((item) => {
    const own = records.filter((row) => matches(row, item)).sort((a, b) => b.date.localeCompare(a.date));
    own.forEach((row) => used.add(row.id));
    const states = own.map((row) => completionOf(row, item.completion));
    const number = (item.sa === "SA2" || item.filters?._kind === "plan-session") && item.category === "journals" ? Number(item.filters?.session_number) : NaN;
    const evaluation = Number.isInteger(number) ? data.sessionEvaluations?.find((row) => row.studentId === studentId && row.number === number) : undefined;
    return { key: item.key ?? evaluationInstrumentKey(item), sa: item.sa, category: item.category, title: item.title, state: item.tracking === "unavailable" && !own.length ? "untracked" : states.includes("completed") ? "completed" : states.includes("in_progress") ? "in_progress" : "pending", records: own, requested: true, evaluation, sessionNumber: Number.isInteger(number) ? number : undefined };
  });
  // Keep every older or additional saved entry accessible without turning it into a new requirement.
  const additional = new Map<string, TeacherActivity[]>();
  for (const row of records) if (!used.has(row.id)) {
    const key = `${evaluationInstrumentKey(row)}:${row.details.period ?? ""}`;
    additional.set(key, [...(additional.get(key) ?? []), row]);
  }
  for (const [key, own] of additional) result.push({key: `extra:${key}`, sa: own[0].sa, category: own[0].category, title: own[0].title, state: own.some((row) => completionOf(row) === "completed") ? "completed" : "in_progress", records: own.sort((a, b) => b.date.localeCompare(a.date)), requested: false});
  return result;
}
export function completionTotals(items: CompletionItem[]) {
  const tracked = items.filter((item) => item.requested && item.state !== "untracked");
  const completed = tracked.filter((item) => item.state === "completed").length;
  const inProgress = tracked.filter((item) => item.state === "in_progress").length;
  return { total: tracked.length, completed, inProgress, pending: tracked.length - completed - inProgress, percent: tracked.length ? Math.round(completed / tracked.length * 100) : 0, untracked: items.filter((item) => item.state === "untracked").length };
}


