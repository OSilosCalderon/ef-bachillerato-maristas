import { SECOND_YEAR_PLAN_SESSIONS } from "./second-year-personal-plan-calendar";
import type { TeacherActivity, TeacherSessionEvaluation } from "./teacher-activity";

export function isPlanSessionLog(row: TeacherActivity) {
  const number = Number(row.details.session_number);
  return row.sa === "SA2" && row.category === "journals" &&
    typeof row.details.id === "string" && Number.isInteger(number) &&
    number >= 1 && number <= SECOND_YEAR_PLAN_SESSIONS.length;
}

export function teacherSessionSlots(activities: TeacherActivity[], studentId: string, evaluations: TeacherSessionEvaluation[] = []) {
  const records = activities.filter((row) => row.studentId === studentId && isPlanSessionLog(row))
    .sort((a, b) => b.date.localeCompare(a.date));
  return SECOND_YEAR_PLAN_SESSIONS.map((planned, index) => ({
    number: index + 1,
    planned,
    evaluation: evaluations.find((row) => row.studentId === studentId && row.number === index + 1) ?? null,
    record: records.find((row) => Number(row.details.session_number) === index + 1) ?? null,
  }));
}

export function teacherSessionScore(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 10 ? number : null;
}

export function parseTeacherSessionScore(value: string): number | null {
  const text = value.trim();
  if (!/^\d{1,2}(?:[.,]\d)?$/.test(text)) return null;
  return teacherSessionScore(text.replace(",", "."));
}
