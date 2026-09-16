export const FIRST_YEAR_CALENDAR_GROUPS = ["1ºA Bachillerato", "1ºB Bachillerato"] as const;

export function firstYearCalendarGroup(value: string | null | undefined) {
  if (value === "1ºA" || value === "1ºA Bachillerato") return FIRST_YEAR_CALENDAR_GROUPS[0];
  if (value === "1ºB" || value === "1ºB Bachillerato") return FIRST_YEAR_CALENDAR_GROUPS[1];
  return null;
}
