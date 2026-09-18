"use server";

import { loadTeacherActivity } from "@/lib/teacher-activity-server";

export async function refreshTeacherActivity(year: 1 | 2) {
  if (year !== 1 && year !== 2) throw new Error("Curso no válido.");
  // The loader checks the teacher role on every request and uses the user's RLS.
  return loadTeacherActivity(year);
}
