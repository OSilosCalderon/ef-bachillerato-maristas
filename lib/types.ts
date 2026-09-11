export type Role = "student" | "teacher";

export type LearningSituation = {
  id: string;
  code: "SA1" | "SA2" | "SA3";
  name: string;
  shortName: string;
  description: string;
  progress: number;
  href: string;
};

export type Activity = {
  id: string;
  title: string;
  situation: "SA1" | "SA2" | "SA3";
  date: string;
  status: "Completada" | "Pendiente" | "Revisada";
};

export type StudentSummary = {
  id: string;
  name: string;
  group: string;
  progress: number;
  pending: number;
  lastActivity: string;
};
