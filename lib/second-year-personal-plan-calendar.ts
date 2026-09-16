export type PersonalPlanSession = { date: string; day: string; start: string; end: string };

export const SECOND_YEAR_PLAN_START = "2026-10-12";

// The plan period begins on 12 October. That date is a national holiday, so
// the first teaching session is Tuesday 13 October.
export const SECOND_YEAR_PLAN_SESSIONS: PersonalPlanSession[] = [
  { date: "2026-10-13", day: "Martes", start: "13:20", end: "14:15" },
  { date: "2026-10-14", day: "Miércoles", start: "10:05", end: "11:00" },
  { date: "2026-10-15", day: "Jueves", start: "13:20", end: "14:15" },
  { date: "2026-10-19", day: "Lunes", start: "10:05", end: "11:00" },
  { date: "2026-10-20", day: "Martes", start: "13:20", end: "14:15" },
  { date: "2026-10-21", day: "Miércoles", start: "10:05", end: "11:00" },
  { date: "2026-10-22", day: "Jueves", start: "13:20", end: "14:15" },
  { date: "2026-10-26", day: "Lunes", start: "10:05", end: "11:00" },
  { date: "2026-10-27", day: "Martes", start: "13:20", end: "14:15" },
  { date: "2026-10-28", day: "Miércoles", start: "10:05", end: "11:00" },
];
