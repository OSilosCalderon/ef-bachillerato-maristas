import { SECOND_YEAR_PLAN_SESSIONS } from "./second-year-personal-plan-calendar";
import { FIRST_YEAR_PLAN_SESSIONS } from "./first-year-personal-plan-calendar";
import { firstYearCalendarGroup } from "./class-groups";
import type { TeacherActivity, TeacherSessionEvaluation } from "./teacher-activity";

export function planSessionsForYear(year: 1 | 2, group?: string) {
  return year === 2 ? SECOND_YEAR_PLAN_SESSIONS : FIRST_YEAR_PLAN_SESSIONS[firstYearCalendarGroup(group) ?? ""] ?? [];
}

export function isPlanSessionLog(row: TeacherActivity, year: 1 | 2 = 2) {
  const number = Number(row.details.session_number);
  return row.sa === (year === 1 ? "SA1" : "SA2") && row.category === "journals" &&
    (year === 2 || row.details._kind === "plan-session") &&
    typeof row.details.id === "string" && Number.isInteger(number) &&
    number >= 1 && number <= (year === 1 ? 8 : SECOND_YEAR_PLAN_SESSIONS.length);
}

export function teacherSessionSlots(activities: TeacherActivity[], studentId: string, evaluations: TeacherSessionEvaluation[] = [], year: 1 | 2 = 2, group?: string) {
  const records = activities.filter((row) => row.studentId === studentId && isPlanSessionLog(row, year))
    .sort((a, b) => b.date.localeCompare(a.date));
  return planSessionsForYear(year, group).map((planned, index) => ({
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

