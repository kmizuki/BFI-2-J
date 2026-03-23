import type {
  Rating,
  ResponseMap,
  ScoreEntry,
  ScoreSummary,
} from "../questionnaire";
import type { DraftSession, StoredResultRecord } from "../session-types";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isScoreEntry = (value: unknown): value is ScoreEntry<string> =>
  isPlainObject(value) &&
  typeof value.id === "string" &&
  typeof value.label === "string" &&
  typeof value.value === "number";

const isScoreSummary = (value: unknown): value is ScoreSummary =>
  isPlainObject(value) &&
  Array.isArray(value.domains) &&
  value.domains.every(isScoreEntry) &&
  Array.isArray(value.facets) &&
  value.facets.every(isScoreEntry);

const isRating = (value: unknown): value is Rating =>
  value === 1 || value === 2 || value === 3 || value === 4 || value === 5;

const isResponseMap = (value: unknown): value is ResponseMap => {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([key, entryValue]) =>
      Number.isInteger(Number(key)) && Number(key) > 0 && isRating(entryValue)
  );
};

export const isDraftSession = (value: unknown): value is DraftSession =>
  isPlainObject(value) &&
  typeof value.currentIndex === "number" &&
  Number.isInteger(value.currentIndex) &&
  typeof value.updatedAt === "string" &&
  isResponseMap(value.responses);

export const isStoredResultRecord = (
  value: unknown
): value is StoredResultRecord =>
  isPlainObject(value) &&
  typeof value.createdAt === "string" &&
  isScoreSummary(value.result);
