import type { TheoryTopicProgress } from "@/lib/training-theory-data";

export const SECOND_YEAR_PASS_SCORE = 67;

export function secondYearMastery(slugs: string[], progress: Record<string, TheoryTopicProgress>) {
  const mastered = slugs.filter((slug) => progress[slug]?.completed && (progress[slug]?.quizScore ?? 0) >= SECOND_YEAR_PASS_SCORE).length;
  return slugs.length ? Math.round(mastered / slugs.length * 100) : 0;
}

export function secondYearQuizScore(correctAnswers: number, questionCount: number) {
  return questionCount ? Math.round(correctAnswers / questionCount * 100) : 0;
}
