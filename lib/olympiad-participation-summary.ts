import { OLYMPIAD_CHOICES, type OlympiadStudentRow } from "./olympiad-lisboa";

export function summarizeOlympiadParticipation(students: OlympiadStudentRow[]) {
  const accepted = students.filter((student) => student.response?.participating === true);
  const declined = students.filter((student) => student.response?.participating === false);
  const pending = students.filter((student) => !student.response);
  const sports = [...new Set(OLYMPIAD_CHOICES.map((choice) => choice.sport))].map((sport) => {
    const choices = new Set<string>(OLYMPIAD_CHOICES.filter((choice) => choice.sport === sport).map((choice) => choice.id));
    const first = accepted.filter((student) => choices.has(student.response?.first_choice ?? ""));
    const second = accepted.filter((student) => choices.has(student.response?.second_choice ?? ""));
    return { sport, first, second, interested: new Set([...first, ...second].map((student) => student.id)).size };
  });
  return { accepted, declined, pending, sports };
}
