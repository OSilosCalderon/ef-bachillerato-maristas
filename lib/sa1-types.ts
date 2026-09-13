export type MeasurementDirection = "higher_better" | "lower_better";
export type AssessmentPeriod = "september" | "december";
export type EvolutionStatus = "improved" | "maintained" | "keep_working";
export type FitnessReference = "masculino" | "femenino";

export type PhysicalTest = {
  id: string;
  name: string;
  description: string;
  unit: string;
  direction: MeasurementDirection;
  instructions: string;
  active: boolean;
  benchmarkMale?: number;
  benchmarkFemale?: number;
  september?: number;
  december?: number;
};

export type TheoryContent = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  read: boolean;
  hasImage?: boolean;
  documents?: string[];
  links?: string[];
};

export type JournalEntry = {
  id: string;
  date: string;
  title: string;
  activity: string;
  feeling: string;
  learning: string;
  difficulty: number;
  effort: number;
  reflection: string;
};

export type QuestionType = "text" | "single_choice" | "multiple_choice" | "scale_1_5" | "scale_1_7" | "scale_1_10";

export type DemoQuestionnaire = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  questionCount: number;
  status: "available" | "completed" | "upcoming";
  opensAt: string;
  closesAt?: string;
};

export function physicalEvolution(test: PhysicalTest) {
  if (test.september == null || test.december == null) return null;
  const absolute = test.december - test.september;
  const percentage = test.september === 0 ? null : (absolute / Math.abs(test.september)) * 100;
  const epsilon = Math.max(Math.abs(test.september) * 0.01, 0.01);
  const directionalChange = test.direction === "higher_better" ? absolute : -absolute;
  const status: EvolutionStatus =
    Math.abs(directionalChange) <= epsilon ? "maintained" : directionalChange > 0 ? "improved" : "keep_working";
  return { absolute, percentage, status };
}

export function physicalBenchmark(test: PhysicalTest, reference: FitnessReference) {
  return reference === "masculino" ? test.benchmarkMale : test.benchmarkFemale;
}

export function physicalBenchmarkComparison(test: PhysicalTest, value: number | undefined, reference: FitnessReference) {
  const benchmark = physicalBenchmark(test, reference);
  if (value == null || !Number.isFinite(value) || value <= 0 || benchmark == null || benchmark <= 0) return null;

  const index = test.direction === "higher_better" ? (value / benchmark) * 100 : (benchmark / value) * 100;
  const delta = index - 100;
  const label = delta > 0.5 ? "Por encima de la referencia" : delta < -0.5 ? "Por debajo de la referencia" : "En torno a la referencia";

  return { benchmark, index, delta, label };
}

export const evolutionLabel: Record<EvolutionStatus, string> = {
  improved: "Has mejorado",
  maintained: "Te mantienes",
  keep_working: "Puedes seguir trabajando este aspecto",
};
