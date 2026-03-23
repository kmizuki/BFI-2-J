import type { ScoreEntry, ScoreSummary } from "../questionnaire";
import type { ResultView } from "./types";

const resultDescription =
  "各得点は1.00から5.00の平均値です。値が高いほど、その特性により強くあてはまる傾向を示します。";

interface ResultViewModel {
  description: string;
  entries: readonly ScoreEntry<string>[];
  radarEntries: readonly ScoreEntry<string>[];
  showRadar: boolean;
  title: string;
}

export const getResultViewModel = (
  result: ScoreSummary,
  view: ResultView
): ResultViewModel => {
  const isFacetView = view === "facets";

  return {
    description: resultDescription,
    entries: isFacetView ? result.facets : result.domains,
    radarEntries: result.domains,
    showRadar: !isFacetView,
    title: isFacetView ? "ファセット得点" : "ドメイン得点",
  };
};
