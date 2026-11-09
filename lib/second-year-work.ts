import { mean, type TeacherActivityData } from "./teacher-activity";
import { studentCompletion, type CompletionItem, type CompletionState } from "./teacher-completion";
import { sessionAssessmentSummary, type SessionAssessmentSummary } from "./teacher-assessment-summary";

type ProgressCount = { done: number; total: number };

export type SecondYearWorkSummary = {
  physical: { initial: ProgressCount; final: ProgressCount };
  questionnaires: { initial: ProgressCount; final: ProgressCount };
  readings: ProgressCount;
  quizzes: ProgressCount & { mean: number | null };
  sessions: SessionAssessmentSummary;
  plan: "pending" | "draft" | "active" | "completed";
  conclusions: CompletionState;
  finalReflection: CompletionState;
};

function countCompleted(items: CompletionItem[]): ProgressCount {
  return { done: items.filter((item) => item.state === "completed").length, total: items.length };
}

export function summarizeSecondYearWork(data: TeacherActivityData, studentId: string): SecondYearWorkSummary {
  const items = studentCompletion(data, studentId).filter((item) => item.requested && item.state !== "untracked");
  const phaseCounts = (category: "physical" | "questionnaires") => {
    const categoryItems = items.filter((item) => item.category === category);
    return {
      initial: countCompleted(categoryItems.filter((item) => item.phase === "initial")),
      final: countCompleted(categoryItems.filter((item) => item.phase === "final")),
    };
  };
  const quizzes = items.filter((item) => item.category === "quizzes");
  const marks = quizzes.flatMap((item) => {
    const scores = item.records.map((row) => row.score).filter((value): value is number =>
      value != null && Number.isFinite(value) && value >= 0 && value <= 100,
    );
    return scores.length ? [Math.max(...scores) / 10] : [];
  });
  const plan = items.find((item) => item.key === "SA1:plan")?.records[0];
  return {
    physical: phaseCounts("physical"),
    questionnaires: phaseCounts("questionnaires"),
    readings: countCompleted(items.filter((item) => item.category === "theory")),
    quizzes: { done: marks.length, total: quizzes.length, mean: mean(marks) },
    sessions: sessionAssessmentSummary(data, studentId, 2),
    plan: !plan ? "pending" : plan.status === "completed" || plan.status === "active" ? plan.status : "draft",
    conclusions: items.find((item) => item.key === "SA1:plan-reflection")?.state ?? "pending",
    finalReflection: items.find((item) => item.key === "SA2:final-physical-reflection")?.state ?? "pending",
  };
}
