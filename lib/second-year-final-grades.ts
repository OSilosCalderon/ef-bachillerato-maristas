import { assessmentGradeKey, type AssessmentGradeItem, type GradebookStudent, type PublishedAssessmentGrade } from "./gradebook";

type BlockInstrument = { situation: "SA1" | "SA2"; key: string; label: string; weight?: number };

export const secondYearFinalGradeBlocks: { title: string; description: string; instruments: BlockInstrument[] }[] = [
  {
    title: "Pruebas físicas",
    description: "Media del test inicial y el final",
    instruments: [
      { situation: "SA1", key: "initial-assessment", label: "Test inicial" },
      { situation: "SA2", key: "final-physical-tests", label: "Test final" },
    ],
  },
  {
    title: "Cuestionarios y teoría",
    description: "Cuestionarios de SA1 · Teoría y autoevaluación de SA1 y SA2",
    instruments: [
      { situation: "SA1", key: "questionnaire-completion", label: "Realización de cuestionarios de SA1" },
      { situation: "SA1", key: "theory-self-assessment", label: "Teoría y autoevaluación de SA1" },
      { situation: "SA2", key: "theory-self-assessment", label: "Teoría y autoevaluación de SA2" },
    ],
  },
  {
    title: "Plan personal",
    description: "50 % plan · 30 % seguimiento · 20 % reflexión",
    instruments: [
      { situation: "SA1", key: "personal-plan", label: "Plan personal", weight: 50 },
      { situation: "SA2", key: "session-follow-up", label: "Seguimiento del plan personal", weight: 30 },
      { situation: "SA2", key: "final-physical-reflection", label: "Reflexión del plan personal", weight: 20 },
    ],
  },
];

export function secondYearFinalGrades(
  students: GradebookStudent[],
  items: AssessmentGradeItem[],
  grades: ReadonlyMap<string, PublishedAssessmentGrade>,
) {
  const itemIds = new Map(items.map((item) => [`${item.course_id}:${item.sa_code}:${item.item_key}`, item.id]));
  return students.map((student) => ({
    student,
    blocks: secondYearFinalGradeBlocks.map((block) => {
      let published = 0;
      let weightedSum = 0;
      let totalWeight = 0;
      const marks = block.instruments.map(({ situation, key, label, weight }) => {
        const itemId = itemIds.get(`${student.courseId}:${situation}:${key}`);
        const rawScore = itemId ? grades.get(assessmentGradeKey(student.id, itemId))?.score : undefined;
        const score = rawScore !== undefined && Number.isFinite(rawScore) && rawScore >= 0 && rawScore <= 10 ? rawScore : null;
        if (score !== null) {
          published++;
          weightedSum += score * (weight ?? 1);
          totalWeight += weight ?? 1;
        }
        return { label, weight, score };
      });
      return { title: block.title, marks, published, score: published === marks.length ? weightedSum / totalWeight : null };
    }),
  }));
}
