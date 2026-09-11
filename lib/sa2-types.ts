export type TechnicalDirection = "higher_better" | "lower_better";
export type TechnicalPeriod = "january" | "march";
export type Sa2ContentCategory =
  | "reglamento"
  | "tecnica"
  | "tactica"
  | "principios_juego"
  | "seguridad"
  | "otros";

export type Sport = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

export type TechnicalTest = {
  id: string;
  sportId: string;
  name: string;
  description: string;
  instructions: string;
  unit: string;
  direction: TechnicalDirection;
  valuationCriteria: string;
  active: boolean;
  january?: number;
  march?: number;
};

export type Sa2TheoryContent = {
  id: string;
  title: string;
  excerpt: string;
  category: Sa2ContentCategory;
  scope: "sa2" | "sport" | "topic";
  sportId?: string;
  topic?: string;
  publishedAt: string;
  read: boolean;
  hasImage?: boolean;
  documents?: string[];
  links?: string[];
};

export type SportsJournalEntry = {
  id: string;
  date: string;
  sportId: string;
  contentWorked: string;
  exercises: string;
  learning: string;
  difficulty: number;
  participation: number;
  performancePerception: number;
  needsImprovement: string;
  reflection: string;
};

export type ProceduralQuestionType = "multiple_choice" | "sport_scenario";

export type ProceduralQuestion = {
  id: string;
  prompt: string;
  type: ProceduralQuestionType;
  imageUrl?: string;
  scenario?: string;
  alternatives: string[];
  correctAlternative?: number;
  explanation?: string;
  score?: number;
};

export type ProceduralActivity = {
  id: string;
  title: string;
  description: string;
  sportId?: string;
  published: boolean;
  maxAttempts?: number;
  questionCount: number;
};

export type ProceduralAttempt = {
  id: string;
  activityId: string;
  attemptNumber: number;
  date: string;
  score?: number;
  maxScore?: number;
  status: "in_progress" | "submitted";
};

export type TechnicalEvolutionStatus = "improved" | "maintained" | "keep_working";

export function technicalEvolution(test: TechnicalTest) {
  if (test.january == null || test.march == null) return null;
  const absolute = test.march - test.january;
  const percentage = test.january === 0 ? null : (absolute / Math.abs(test.january)) * 100;
  const epsilon = Math.max(Math.abs(test.january) * 0.01, 0.01);
  const directionalChange = test.direction === "higher_better" ? absolute : -absolute;
  const status: TechnicalEvolutionStatus =
    Math.abs(directionalChange) <= epsilon
      ? "maintained"
      : directionalChange > 0
        ? "improved"
        : "keep_working";
  return { absolute, percentage, status };
}

export const technicalEvolutionLabel: Record<TechnicalEvolutionStatus, string> = {
  improved: "Has mejorado",
  maintained: "Te mantienes",
  keep_working: "Puedes seguir trabajando este aspecto",
};
