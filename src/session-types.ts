import type { ResponseMap, ScoreSummary } from "./questionnaire";

export type Stage = "intro" | "question" | "result";

export interface StoredResultRecord {
  createdAt: string;
  result: ScoreSummary;
}

export interface DraftSession {
  currentIndex: number;
  responses: ResponseMap;
  updatedAt: string;
}
