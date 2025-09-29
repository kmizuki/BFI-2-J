import { useMemo, useState } from "react";
import rawItems from "../bfi_items.json" with { type: "json" };

const domainDefinitions = [
  { id: "extraversion", label: "外向性" },
  { id: "agreeableness", label: "協調性" },
  { id: "conscientiousness", label: "勤勉性" },
  { id: "negativeEmotionality", label: "否定的情動性" },
  { id: "openness", label: "開放性" },
] as const;

type DomainId = (typeof domainDefinitions)[number]["id"];

const facetDefinitions = [
  { id: "sociability", label: "社交性" },
  { id: "assertiveness", label: "自己主張性" },
  { id: "energyLevel", label: "活力" },
  { id: "compassion", label: "思いやり" },
  { id: "respectfulness", label: "敬意" },
  { id: "trust", label: "信用" },
  { id: "organization", label: "秩序" },
  { id: "productivity", label: "生産性" },
  { id: "responsibility", label: "責任感" },
  { id: "anxiety", label: "不安" },
  { id: "depression", label: "抑うつ" },
  { id: "emotionalVolatility", label: "情緒不安定性" },
  { id: "intellectualCuriosity", label: "知的好奇心" },
  { id: "aestheticSensitivity", label: "美的感性" },
  { id: "creativeImagination", label: "創造的想像力" },
] as const;

type FacetId = (typeof facetDefinitions)[number]["id"];

const buildIdByLabelMap = <Id extends string>(
  definitions: readonly { id: Id; label: string }[]
): Record<string, Id> => {
  const map: Record<string, Id> = {};
  for (const definition of definitions) {
    map[definition.label] = definition.id;
  }
  return map;
};

const buildZeroMap = <Id extends string>(
  definitions: readonly { id: Id }[]
): Record<Id, number> => {
  const map = {} as Record<Id, number>;
  for (const definition of definitions) {
    map[definition.id] = 0;
  }
  return map;
};

const domainIdByLabel = buildIdByLabelMap(domainDefinitions);
const facetIdByLabel = buildIdByLabelMap(facetDefinitions);

const createZeroDomainMap = () => buildZeroMap(domainDefinitions);
const createZeroFacetMap = () => buildZeroMap(facetDefinitions);

type Rating = 1 | 2 | 3 | 4 | 5;

type RawItem = {
  number: number;
  text: string;
  domain: string;
  facet: string;
  reverse: boolean;
};

type Item = {
  number: number;
  text: string;
  domainId: DomainId;
  facetId: FacetId;
  reverse: boolean;
};

const normalizeItems = (rawList: RawItem[]): Item[] => {
  const normalized: Item[] = [];
  for (const rawItem of rawList) {
    const domainId = domainIdByLabel[rawItem.domain];
    if (!domainId) {
      throw new Error(`Unknown domain label: ${rawItem.domain}`);
    }
    const facetId = facetIdByLabel[rawItem.facet];
    if (!facetId) {
      throw new Error(`Unknown facet label: ${rawItem.facet}`);
    }
    normalized.push({
      number: rawItem.number,
      text: rawItem.text,
      domainId,
      facetId,
      reverse: rawItem.reverse,
    });
  }
  return normalized;
};

const questionnaireItems = normalizeItems(rawItems as RawItem[]);
const totalItems = questionnaireItems.length;

type Totals = {
  domains: Record<DomainId, number>;
  facets: Record<FacetId, number>;
};

const createInitialTotals = (): Totals => ({
  domains: createZeroDomainMap(),
  facets: createZeroFacetMap(),
});

const calculateAverage = (sum: number, count: number): number =>
  count === 0 ? 0 : sum / count;

const formatScore = (value: number): string => value.toFixed(2);

const REVERSE_BASE = 6;

const reverseScore = (value: Rating): Rating =>
  (REVERSE_BASE - value) as Rating;

const createItemStats = (items: Item[]) => {
  const domainCountsAccumulator = createZeroDomainMap();
  const facetCountsAccumulator = createZeroFacetMap();
  for (const item of items) {
    domainCountsAccumulator[item.domainId] += 1;
    facetCountsAccumulator[item.facetId] += 1;
  }
  return {
    domainCounts: domainCountsAccumulator,
    facetCounts: facetCountsAccumulator,
  };
};

const { domainCounts, facetCounts } = createItemStats(questionnaireItems);

const ratingLabels: Record<Rating, string> = {
  1: "全くあてはまらない",
  2: "あてはまらない",
  3: "どちらともいえない",
  4: "あてはまる",
  5: "とてもよくあてはまる",
};

const RATING_MIN: Rating = 1;
const RATING_MAX: Rating = 5;

const ratingEntries: [Rating, string][] = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_, offset) => {
    const value = (RATING_MIN + offset) as Rating;
    return [value, ratingLabels[value]];
  }
);

type ScoreEntry<Id extends string> = {
  id: Id;
  label: string;
  value: number;
};

type ScoreSummary = {
  domains: ScoreEntry<DomainId>[];
  facets: ScoreEntry<FacetId>[];
};

type Stage = "intro" | "question" | "result";

const App = () => {
  const [stage, setStage] = useState<Stage>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Partial<Record<number, Rating>>>(
    {}
  );

  const currentItem = questionnaireItems[currentIndex];
  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === totalItems;

  const handleStart = () => {
    setStage("question");
  };

  const handleSelect = (rating: Rating) => {
    if (!currentItem) {
      return;
    }

    setResponses((prev) => ({ ...prev, [currentItem.number]: rating }));
  };

  const handleNext = () => {
    if (!currentItem) {
      return;
    }

    if (!responses[currentItem.number]) {
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= totalItems) {
      setStage("result");
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    const nextIndex = currentIndex - 1;

    if (nextIndex < 0) {
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const handleRestart = () => {
    setStage("intro");
    setCurrentIndex(0);
    setResponses({});
  };

  const result = useMemo<ScoreSummary | null>(() => {
    if (!allAnswered) {
      return null;
    }

    const totals = createInitialTotals();

    for (const item of questionnaireItems) {
      const selected = responses[item.number];
      if (!selected) {
        continue;
      }
      const score = item.reverse ? reverseScore(selected) : selected;
      totals.domains[item.domainId] += score;
      totals.facets[item.facetId] += score;
    }

    const domainScores: ScoreEntry<DomainId>[] = [];
    for (const definition of domainDefinitions) {
      const average = calculateAverage(
        totals.domains[definition.id],
        domainCounts[definition.id]
      );
      domainScores.push({
        id: definition.id,
        label: definition.label,
        value: average,
      });
    }

    const facetScores: ScoreEntry<FacetId>[] = [];
    for (const definition of facetDefinitions) {
      const average = calculateAverage(
        totals.facets[definition.id],
        facetCounts[definition.id]
      );
      facetScores.push({
        id: definition.id,
        label: definition.label,
        value: average,
      });
    }

    return {
      domains: domainScores,
      facets: facetScores,
    };
  }, [allAnswered, responses]);

  if (stage === "intro") {
    return (
      <main className="app">
        <section className="card">
          <h1 className="title">日本語版Big Five Inventory-2</h1>
          <p className="intro-message">
            これはBig
            Fiveパーソナリティの５つの特性を測定するための質問です。５つの特性（ドメイン）にはそれぞれ3つの下位概念（ファセット）が想定されています。出題は60問です。
          </p>
          <p className="instruction">
            正解・不正解はありません。最近の一時的な気分ではなく、ここ数年の一般的な傾向を思い浮かべて回答してください。思い出しにくい場面は考え込まず、第一印象で選んでかまいません。
          </p>
          <p className="citation">
            Yoshino, S., Shimotsukasa, T., Oshio, A., Hashimoto, Y., Ueno, Y.,
            Mieda, T., Migiwa, I., Sato, T., Kawamoto, S., Soto, C. J., & John,
            O. P. (2022). A validation of the Japanese adaptation of the Big
            Five Inventory-2 (BFI-2-J). <em>Frontiers in Psychology, 13</em>:
            924351.
          </p>
          <button
            className="primary-button"
            onClick={handleStart}
            type="button"
          >
            開始する
          </button>
        </section>
      </main>
    );
  }

  if (stage === "result" && result) {
    return (
      <main className="app">
        <section className="card">
          <h2 className="title">結果</h2>
          <section aria-labelledby="domains-heading" className="result-section">
            <h3 className="section-title" id="domains-heading">
              ドメイン得点
            </h3>
            <ul className="score-list">
              {result.domains.map((entry) => (
                <li className="score-item" key={entry.id}>
                  <div className="score-label">{entry.label}</div>
                  <div className="score-value">{formatScore(entry.value)}</div>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="facets-heading" className="result-section">
            <h3 className="section-title" id="facets-heading">
              ファセット得点
            </h3>
            <ul className="score-list">
              {result.facets.map((entry) => (
                <li className="score-item" key={entry.id}>
                  <div className="score-label">{entry.label}</div>
                  <div className="score-value">{formatScore(entry.value)}</div>
                </li>
              ))}
            </ul>
          </section>
          <div className="actions">
            <button
              className="secondary-button"
              onClick={handleRestart}
              type="button"
            >
              もう一度はじめる
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!currentItem) {
    return null;
  }

  const selectedRating = responses[currentItem.number];
  const progress = `${currentIndex + 1} / ${totalItems}`;

  return (
    <main className="app">
      <section className="card">
        <header className="question-header">
          <p aria-live="polite" className="progress">
            {progress}
          </p>
        </header>
        <div className="question-body">
          <p className="question-text">{currentItem.text}</p>
        </div>
        <fieldset aria-label="回答選択肢" className="scale">
          <legend className="sr-only">回答を選択してください</legend>
          <ul className="scale-options">
            {ratingEntries.map(([value, label]) => {
              const isSelected = selectedRating === value;
              return (
                <li key={value}>
                  <label className="option">
                    <input
                      checked={isSelected}
                      name="rating"
                      onChange={() => handleSelect(value)}
                      type="radio"
                      value={value}
                    />
                    <span className="option-content">
                      <span className="option-number">{value}</span>
                      <span className="option-label">{label}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <div className="actions">
          <button
            className="secondary-button"
            disabled={currentIndex === 0}
            onClick={handlePrevious}
            type="button"
          >
            もどる
          </button>
          <button
            className="primary-button"
            disabled={!selectedRating}
            onClick={handleNext}
            type="button"
          >
            次へ
          </button>
        </div>
      </section>
    </main>
  );
};

export default App;
