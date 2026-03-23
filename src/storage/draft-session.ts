import { totalItems } from "../questionnaire";
import type { DraftSession } from "../session-types";
import {
  readLocalStorageValue,
  removeLocalStorageValue,
  writeLocalStorageValue,
} from "./local-storage-json";
import { isDraftSession } from "./storage-guards";

const draftStorageKey = "bfi-2-j-draft";

export const loadDraftSession = (): DraftSession | null => {
  const parsed = readLocalStorageValue(draftStorageKey);
  if (!isDraftSession(parsed)) {
    return null;
  }

  const answeredCount = Object.keys(parsed.responses).length;
  if (answeredCount === 0 || answeredCount >= totalItems) {
    return null;
  }

  if (parsed.currentIndex < 0 || parsed.currentIndex >= totalItems) {
    return null;
  }

  return parsed;
};

export const storeDraftSession = (session: DraftSession) =>
  writeLocalStorageValue(draftStorageKey, session);

export const removeDraftSession = () =>
  removeLocalStorageValue(draftStorageKey);
