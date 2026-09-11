export type GameIntensity = "baja" | "media" | "alta";
export type Sa3ContentType = "documento" | "explicacion" | "infografia" | "enlace" | "video" | "ficha_juego";
export type AttitudeItemType = "scale_1_5" | "yes_no" | "text";
export type SessionStatus = "draft" | "submitted" | "reviewed";

export type AlternativeGame = {
  id: string;
  name: string;
  imageUrl?: string;
  description: string;
  objective: string;
  recommendedParticipants: string;
  space: string;
  materials: string[];
  rules: string[];
  variants: string[];
  approximateMinutes: number;
  intensity: GameIntensity;
  safetyRecommendations: string;
  categories: string[];
  active: boolean;
};

export type SessionGameBlock = {
  id: string;
  source: "library" | "own";
  gameId?: string;
  name: string;
  minutes: number;
  notes?: string;
};

export type DesignedSession = {
  id: string;
  title: string;
  objective: string;
  participants: number;
  materials: string;
  space: string;
  warmup: string;
  warmupMinutes: number;
  mainGames: SessionGameBlock[];
  cooldown: string;
  cooldownMinutes: number;
  observations: string;
  safetyMeasures: string;
  status: SessionStatus;
  updatedAt: string;
  submittedAt?: string;
  teacherFeedback?: string;
};

export type GameRating = {
  id: string;
  gameId: string;
  fun: number;
  participation: number;
  difficulty: number;
  intensity: number;
  cooperation: number;
  wouldPlayAgain: boolean;
  comment: string;
  improvementProposal: string;
  date: string;
};

export type Sa3TheoryContent = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: Sa3ContentType;
  publishedAt: string;
  read: boolean;
};

export type AttitudeItem = {
  id: string;
  label: string;
  type: AttitudeItemType;
  active: boolean;
  position: number;
};

export type AttitudeSubmission = {
  id: string;
  date: string;
  periodLabel: string;
  scoreIndex?: number;
};

export function designedSessionMinutes(session: Pick<DesignedSession, "warmupMinutes" | "mainGames" | "cooldownMinutes">) {
  return session.warmupMinutes + session.mainGames.reduce((sum, game) => sum + game.minutes, 0) + session.cooldownMinutes;
}
