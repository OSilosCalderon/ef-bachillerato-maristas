export type FirstYearPlanSession = { date: string; day: string; start: string; end: string };

export const FIRST_YEAR_PLAN_SESSIONS: Record<string, FirstYearPlanSession[]> = {
  "1ºA Bachillerato": [
    { date: "2026-10-26", day: "Lunes", start: "09:10", end: "10:05" },
    { date: "2026-10-29", day: "Jueves", start: "10:05", end: "11:00" },
    { date: "2026-11-05", day: "Jueves", start: "10:05", end: "11:00" },
    { date: "2026-11-09", day: "Lunes", start: "09:10", end: "10:05" },
    { date: "2026-11-12", day: "Jueves", start: "10:05", end: "11:00" },
    { date: "2026-11-16", day: "Lunes", start: "09:10", end: "10:05" },
    { date: "2026-11-19", day: "Jueves", start: "10:05", end: "11:00" },
    { date: "2026-11-23", day: "Lunes", start: "09:10", end: "10:05" },
  ],
  "1ºB Bachillerato": [
    { date: "2026-10-26", day: "Lunes", start: "12:25", end: "13:20" },
    { date: "2026-10-30", day: "Viernes", start: "11:30", end: "12:25" },
    { date: "2026-11-06", day: "Viernes", start: "11:30", end: "12:25" },
    { date: "2026-11-09", day: "Lunes", start: "12:25", end: "13:20" },
    { date: "2026-11-13", day: "Viernes", start: "11:30", end: "12:25" },
    { date: "2026-11-16", day: "Lunes", start: "12:25", end: "13:20" },
    { date: "2026-11-20", day: "Viernes", start: "11:30", end: "12:25" },
    { date: "2026-11-23", day: "Lunes", start: "12:25", end: "13:20" },
  ],
};

export const FIRST_YEAR_PLAN_WEEK: Record<string, Array<{ weekday: number; label: string; start: string; end: string }>> = {
  "1ºA Bachillerato": [{ weekday: 1, label: "Lunes", start: "09:10", end: "10:05" }, { weekday: 4, label: "Jueves", start: "10:05", end: "11:00" }],
  "1ºB Bachillerato": [{ weekday: 1, label: "Lunes", start: "12:25", end: "13:20" }, { weekday: 5, label: "Viernes", start: "11:30", end: "12:25" }],
};
