import type { AssessmentGradeItem, PublishedAssessmentGrade } from "./gradebook";
import type { TeacherActivity, TeacherActivityData } from "./teacher-activity";
import { isPlanSessionLog, teacherSessionScore } from "./teacher-session-grading";

export type SessionAssessmentSummary = {
  sa: string; total: number; mean: number | null; graded: number; absences: number;
  points: number; valuedSessions: number[];
};
export type TeacherBlockScore = { item: AssessmentGradeItem; grade: PublishedAssessmentGrade | null; worked: boolean };

export function sessionAssessmentSummary(data: Pick<TeacherActivityData, "activities" | "sessionEvaluations">, studentId: string, year: 1 | 2): SessionAssessmentSummary {
  const total = year === 1 ? 8 : 10;
  const logs = data.activities.filter((row) => row.studentId === studentId && isPlanSessionLog(row, year));
  const latestLogs = new Map<number, TeacherActivity>();
  for (const row of logs) {
    const number = Number(row.details.session_number);
    if (!latestLogs.has(number) || row.date > latestLogs.get(number)!.date) latestLogs.set(number, row);
  }
  const grades = new Map<number, { score: number | null; absent: boolean; date: string }>();
  for (const [number, row] of latestLogs) grades.set(number, {score:teacherSessionScore(row.details.teacher_score),absent:row.details.teacher_absent===true,date:String(row.details.teacher_evaluated_at ?? "")});
  for (const row of data.sessionEvaluations ?? []) {
    if (row.studentId !== studentId || !Number.isInteger(row.number) || row.number < 1 || row.number > total) continue;
    if (!grades.has(row.number) || row.updatedAt >= grades.get(row.number)!.date) grades.set(row.number, {score:teacherSessionScore(row.score),absent:row.absent===true,date:row.updatedAt});
  }
  const present = [...grades.values()].filter((row) => !row.absent && row.score !== null);
  const valuedSessions = [...latestLogs].filter(([,row]) => row.status === "completed" || row.status === "submitted").map(([number]) => number).sort((a,b) => a-b);
  return {sa:year===1?"SA1":"SA2",total,mean:present.length?present.reduce((sum,row) => sum+row.score!,0)/present.length:null,
    graded:present.length,absences:[...grades.values()].filter((row) => row.absent).length,points:valuedSessions.length,valuedSessions};
}

function workedOnBlock(row: TeacherActivity, item: AssessmentGradeItem, year: 1 | 2) {
  if (row.sa !== item.sa_code) return false;
  switch (item.item_key) {
    case "initial-assessment": return row.category === "physical" && row.details.period === "september";
    case "final-physical-tests": return row.category === "physical" && row.details.period === "december";
    case "initial-technical-tests": return row.category === "technical" && row.details.period === "january";
    case "final-technical-tests": return row.category === "technical" && row.details.period === "march";
    case "theory-self-assessment": case "theory-block": return ["theory","quizzes","challenges"].includes(row.category);
    case "personal-plan": return row.category === "plans";
    case "session-follow-up": return isPlanSessionLog(row,year) || (year===1 && row.category==="journals" && row.details._kind==="class-journal");
    case "sports-journal": return row.category === "journals";
    case "questionnaire-completion": return row.category === "questionnaires" && row.details.assessment_phase !== "final";
    case "final-questionnaire-completion": return row.category === "questionnaires" && row.details.assessment_phase === "final";
    case "procedural-decisions": return row.category === "procedural";
    case "session-design": return row.category === "projects";
    case "game-reflections": return row.category === "procedural" && row.details._kind === "game-rating";
    case "attitude-self-assessment": return row.category === "quizzes" && row.details._kind === "attitude";
    default: return false;
  }
}

export function studentBlockScores(data: Pick<TeacherActivityData, "students" | "activities" | "assessmentItems" | "assessmentGrades">, studentId: string, year: 1 | 2, sa = ""): TeacherBlockScore[] {
  const student = data.students.find((row) => row.id === studentId);
  if (!student) return [];
  const items = (data.assessmentItems ?? []).filter((item) => student.courseId && item.course_id===student.courseId && (!sa || item.sa_code===sa));
  const itemIds = new Set(items.map((item) => item.id));
  const grades = new Map<string, PublishedAssessmentGrade>();
  for (const grade of data.assessmentGrades ?? []) {
    if (grade.student_id !== studentId || !itemIds.has(grade.item_id) || teacherSessionScore(grade.score) === null) continue;
    if (!grades.has(grade.item_id) || grade.published_at > grades.get(grade.item_id)!.published_at) grades.set(grade.item_id, grade);
  }
  const own = data.activities.filter((row) => row.studentId === studentId);
  return items.slice().sort((a,b) => a.sa_code.localeCompare(b.sa_code) || a.position-b.position || a.title.localeCompare(b.title,"es"))
    .map((item) => ({item,grade:grades.get(item.id) ?? null,worked:grades.has(item.id) || own.some((row) => workedOnBlock(row,item,year))}));
}
