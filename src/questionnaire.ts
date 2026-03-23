import rawItems from "../bfi_items.json" with { type: "json" };

export const domainDefinitions = [
  { id: "extraversion", label: "外向性" },
  { id: "agreeableness", label: "協調性" },
  { id: "conscientiousness", label: "勤勉性" },
  { id: "negativeEmotionality", label: "否定的情動性" },
  { id: "openness", label: "開放性" },
] as const;

export type DomainId = (typeof domainDefinitions)[number]["id"];

export const facetDefinitions = [
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

export type FacetId = (typeof facetDefinitions)[number]["id"];
export type Rating = 1 | 2 | 3 | 4 | 5;
export type ResponseMap = Partial<Record<number, Rating>>;

interface RawItem {
  domain: string;
  facet: string;
  number: number;
  reverse: boolean;
  text: string;
}

export interface Item {
  domainId: DomainId;
  facetId: FacetId;
  number: number;
  reverse: boolean;
  text: string;
}

export interface ScoreEntry<Id extends string> {
  id: Id;
  label: string;
  value: number;
}

export interface ScoreSummary {
  domains: ScoreEntry<DomainId>[];
  facets: ScoreEntry<FacetId>[];
}

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

const calculateAverage = (sum: number, count: number): number =>
  count === 0 ? 0 : sum / count;

const REVERSE_BASE = 6;

const reverseScore = (value: Rating): Rating =>
  (REVERSE_BASE - value) as Rating;

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

const createItemCounts = (items: readonly Item[]) => {
  const domainCounts = createZeroDomainMap();
  const facetCounts = createZeroFacetMap();

  for (const item of items) {
    domainCounts[item.domainId] += 1;
    facetCounts[item.facetId] += 1;
  }

  return { domainCounts, facetCounts };
};

const ratingLabels: Record<Rating, string> = {
  1: "全くあてはまらない",
  2: "あてはまらない",
  3: "どちらともいえない",
  4: "あてはまる",
  5: "とてもよくあてはまる",
};

export const ratingEntries: [Rating, string][] = [
  [1, ratingLabels[1]],
  [2, ratingLabels[2]],
  [3, ratingLabels[3]],
  [4, ratingLabels[4]],
  [5, ratingLabels[5]],
];

export const questionnaireItems = normalizeItems(rawItems as RawItem[]);
export const totalItems = questionnaireItems.length;

const { domainCounts, facetCounts } = createItemCounts(questionnaireItems);

export const calculateScoreSummary = (responses: ResponseMap): ScoreSummary => {
  const domainTotals = createZeroDomainMap();
  const facetTotals = createZeroFacetMap();

  for (const item of questionnaireItems) {
    const selected = responses[item.number];
    if (!selected) {
      continue;
    }

    const score = item.reverse ? reverseScore(selected) : selected;
    domainTotals[item.domainId] += score;
    facetTotals[item.facetId] += score;
  }

  return {
    domains: domainDefinitions.map((definition) => ({
      id: definition.id,
      label: definition.label,
      value: calculateAverage(
        domainTotals[definition.id],
        domainCounts[definition.id]
      ),
    })),
    facets: facetDefinitions.map((definition) => ({
      id: definition.id,
      label: definition.label,
      value: calculateAverage(
        facetTotals[definition.id],
        facetCounts[definition.id]
      ),
    })),
  };
};

export const formatScore = (value: number): string => value.toFixed(2);
