"use client";

import type { Dispatch, SetStateAction } from "react";
import { publishAssessmentScores } from "@/app/profesor/calificaciones/actions";
import { GradeGrid, type GradeGridChange, type GradeGridDrafts } from "@/components/grade-grid";
import {
  assessmentGradeKey, compareAssessmentItems, displayAssessmentItem, isRetiredDiaryItem,
  type AssessmentGradeItem, type GradebookStudent, type PublishedAssessmentGrade,
} from "@/lib/gradebook";

export type { GradeGridDrafts };

type Props = {
  students: GradebookStudent[];
  items: AssessmentGradeItem[];
  grades: ReadonlyMap<string, PublishedAssessmentGrade>;
  situation: string;
  drafts: GradeGridDrafts;
  setDrafts: Dispatch<SetStateAction<GradeGridDrafts>>;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  onPublished: (grades: PublishedAssessmentGrade[]) => void;
};

export function TeacherGradeGrid({ students, items, grades, situation, onPublished, ...editing }: Props) {
  const studentsById = new Map(students.map((student) => [student.id, student]));
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const courseIds = new Set(students.map((student) => student.courseId));
  const gradedItemIds = new Set([...grades.values()].filter((grade) => studentsById.has(grade.student_id)).map((grade) => grade.item_id));
  const columns = items.filter((item) =>
    courseIds.has(item.course_id) && (!situation || item.sa_code === situation) &&
    (!isRetiredDiaryItem(item) || gradedItemIds.has(item.id)))
    .sort(compareAssessmentItems)
    .map(displayAssessmentItem)
    .map((item) => ({ id: item.id, title: item.title, detail: item.sa_code }));

  async function saveChanges(changes: GradeGridChange[]) {
    const result = await publishAssessmentScores(changes.map(({ studentId, columnId, score }) => ({ studentId, itemId: columnId, score })));
    if (result.grades.length) onPublished(result.grades);
    return {
      confirmed: result.grades.map((grade) => ({ studentId: grade.student_id, columnId: grade.item_id })),
      error: result.error,
    };
  }

  return <GradeGrid {...editing} students={students} columns={columns} saveChanges={saveChanges}
    getCell={(studentId, itemId) => {
      const item = itemsById.get(itemId);
      if (!item || studentsById.get(studentId)?.courseId !== item.course_id) return undefined;
      const grade = grades.get(assessmentGradeKey(studentId, itemId));
      return isRetiredDiaryItem(item) && !grade ? undefined : { score: grade?.score ?? null };
    }}/>;
}
