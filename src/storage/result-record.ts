import type { StoredResultRecord } from "../session-types";
import {
  readLocalStorageValue,
  writeLocalStorageValue,
} from "./local-storage-json";
import { isStoredResultRecord } from "./storage-guards";

const resultStorageKey = "bfi-2-j-results";

export const loadStoredResult = (): StoredResultRecord | null => {
  const parsed = readLocalStorageValue(resultStorageKey);
  if (isStoredResultRecord(parsed)) {
    return parsed;
  }

  if (!Array.isArray(parsed)) {
    return null;
  }

  return parsed.find(isStoredResultRecord) ?? null;
};

export const storeStoredResult = (record: StoredResultRecord) =>
  writeLocalStorageValue(resultStorageKey, record);
