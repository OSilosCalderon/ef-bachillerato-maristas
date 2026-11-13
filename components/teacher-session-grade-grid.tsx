"use client";

import { useMemo, type ComponentProps } from "react";
import { publishSessionScores } from "@/app/profesor/calificar-sesiones/actions";
import { GradeGrid, type GradeGridChange } from "@/components/grade-grid";
import { FIRST_YEAR_CALENDAR_GROUPS } from "@/lib/class-groups";
import type { TeacherActivity, TeacherSessionEvaluation, TeacherStudent } from "@/lib/teacher-activity";
import { planSessionsForYear, teacherSessionSlots, teacherSessionScore } from "@/lib/teacher-session-grading";

type Props = Pick<ComponentProps<typeof GradeGrid>, "drafts" | "setDrafts" | "saving" | "setSaving"> & {
  students: TeacherStudent[];
  logs: TeacherActivity[];
  evaluations: TeacherSessionEvaluation[];
  courseYear: 1 | 2;
  group: string;
  onPublished: (grades: TeacherSessionEvaluation[]) => void;
};

const formatDate = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" });

export function TeacherSessionGradeGrid({ students, logs, evaluations, courseYear, group, onPublished, ...editing }: Props) {
  const cells = useMemo(() => {
    const result = new Map<string, { score: number | null; absent: boolean; unregistered: boolean }>();
    for (const student of students) {
      for (const slot of teacherSessionSlots(logs, student.id, evaluations, courseYear, student.group)) {
        result.set(`${student.id}:${slot.number}`, {
          score: slot.evaluation?.score ?? teacherSessionScore(slot.record?.details.teacher_score),
          absent: slot.evaluation?.absent ?? (slot.record?.details.teacher_absent === true),
          unregistered: !slot.record,
        });
      }
    }
    return result;
  }, [students, logs, evaluations, courseYear]);
  const calendar = planSessionsForYear(courseYear, group || FIRST_YEAR_CALENDAR_GROUPS[0]);
  const alternative = courseYear === 1 && !group ? planSessionsForYear(1, FIRST_YEAR_CALENDAR_GROUPS[1]) : calendar;
  const columns = calendar.map((session, index) => ({
    id: String(index + 1),
    title: `Sesión ${index + 1}`,
    date: session.date === alternative[index]?.date ? formatDate.format(new Date(session.date + "T12:00:00Z")) : undefined,
  }));

  async function saveChanges(changes: GradeGridChange[]) {
    const result = await publishSessionScores(courseYear, changes.map(({ studentId, columnId, score }) => ({ studentId, number: Number(columnId), score })));
    if (result.grades.length) onPublished(result.grades);
    return {
      confirmed: result.grades.map(({ studentId, number }) => ({ studentId, columnId: String(number) })),
      error: result.error,
    };
  }

  return <GradeGrid {...editing} students={students} columns={columns} sessionColumns saveChanges={saveChanges}
    getCell={(studentId, number) => cells.get(`${studentId}:${number}`)}/>;
}
