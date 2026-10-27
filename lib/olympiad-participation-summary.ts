import { OLYMPIAD_CHOICES, type OlympiadStudentRow } from "./olympiad-lisboa";

export type OlympiadGenderFilter = "" | "masculino" | "femenino" | "other";

export function filterOlympiadStudents(students: OlympiadStudentRow[], group: string, gender: OlympiadGenderFilter) {
  return students.filter((student) => (!group || student.group === group) && (!gender || (gender === "other"
    ? !["masculino", "femenino"].includes(student.response?.gender ?? "")
    : student.response?.gender === gender)));
}

export function summarizeOlympiadParticipation(students: OlympiadStudentRow[]) {
  const accepted = students.filter((student) => student.response?.participating === true);
  const declined = students.filter((student) => student.response?.participating === false);
  const pending = students.filter((student) => !student.response);
  const sports = [...new Set(OLYMPIAD_CHOICES.map((choice) => choice.sport))].map((sport) => {
    const choices = new Set<string>(OLYMPIAD_CHOICES.filter((choice) => choice.sport === sport).map((choice) => choice.id));
    const first = accepted.filter((student) => choices.has(student.response?.first_choice ?? ""));
    const second = accepted.filter((student) => choices.has(student.response?.second_choice ?? ""));
    const interested = [...new Map([...first, ...second].map((student) => [student.id, student])).values()];
    const masculino = interested.filter((student) => student.response?.gender === "masculino").length;
    const femenino = interested.filter((student) => student.response?.gender === "femenino").length;
    return { sport, first, second, interested: interested.length, genders: { masculino, femenino, other: interested.length - masculino - femenino } };
  });
  return { accepted, declined, pending, sports };
}
