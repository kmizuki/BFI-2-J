import type { ScoreEntry } from "../questionnaire";

export interface RadarPoint {
  x: number;
  y: number;
}

export interface RadarAxis {
  angleInDegrees: number;
  entry: ScoreEntry<string>;
  point: RadarPoint;
}

export const radarLevels = [1, 2, 3, 4, 5] as const;

export const toRadarPoint = (
  centerX: number,
  centerY: number,
  angleInDegrees: number,
  radius: number
): RadarPoint => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + Math.cos(angleInRadians) * radius,
    y: centerY + Math.sin(angleInRadians) * radius,
  };
};

export const createRadarAxes = (
  entries: readonly ScoreEntry<string>[],
  centerX: number,
  centerY: number,
  radius: number
): RadarAxis[] =>
  entries.map((entry, index) => {
    const angleInDegrees = (360 / entries.length) * index;

    return {
      angleInDegrees,
      entry,
      point: toRadarPoint(centerX, centerY, angleInDegrees, radius),
    };
  });

export const buildRadarPolygon = (
  entries: readonly ScoreEntry<string>[],
  centerX: number,
  centerY: number,
  radiusByEntry: (entry: ScoreEntry<string>) => number
): RadarPoint[] =>
  entries.map((entry, index) => {
    const angleInDegrees = (360 / entries.length) * index;
    return toRadarPoint(centerX, centerY, angleInDegrees, radiusByEntry(entry));
  });

export const pointsToSvg = (points: readonly RadarPoint[]): string =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

export const splitRadarLabel = (label: string): string[] => {
  if (label.length <= 4) {
    return [label];
  }

  const midpoint = Math.ceil(label.length / 2);
  return [label.slice(0, midpoint), label.slice(midpoint)];
};
