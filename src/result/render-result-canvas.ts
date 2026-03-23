import {
  formatScore,
  type ScoreEntry,
  type ScoreSummary,
} from "../questionnaire";
import {
  buildRadarPolygon,
  createRadarAxes,
  type RadarPoint,
  radarLevels,
  splitRadarLabel,
  toRadarPoint,
} from "./radar-geometry";
import type { ResultView } from "./types";
import { getResultViewModel } from "./view-model";

interface RenderResultCanvasOptions {
  dateLabel: string;
  result: ScoreSummary;
  view: ResultView;
}

const canvasWidth = 900;
const canvasHeight = 1600;
const canvasPadding = 40;
const cardRadius = 48;
const gridGap = 24;
const metricCardRadius = 32;
const metricFont = '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif';

const getMetricCardHeight = (view: ResultView): number =>
  view === "domains" ? 286 : 242;

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient,
  strokeStyle?: string
) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fillStyle;
  context.fill();

  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = 2;
    context.stroke();
  }
};

const drawTextLines = (
  context: CanvasRenderingContext2D,
  lines: readonly string[],
  x: number,
  y: number,
  lineHeight: number
) => {
  for (const [index, line] of lines.entries()) {
    context.fillText(line, x, y + index * lineHeight);
  }
};

const splitTextByWidth = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const lines: string[] = [];
  let currentLine = "";

  for (const character of text) {
    const nextLine = `${currentLine}${character}`;
    if (currentLine && context.measureText(nextLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = character;
      continue;
    }

    currentLine = nextLine;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const tracePolygon = (
  context: CanvasRenderingContext2D,
  points: readonly RadarPoint[]
) => {
  for (const [index, point] of points.entries()) {
    if (index === 0) {
      context.moveTo(point.x, point.y);
      continue;
    }

    context.lineTo(point.x, point.y);
  }

  context.closePath();
};

const getMaxLineWidth = (
  context: CanvasRenderingContext2D,
  lines: readonly string[]
): number => Math.max(...lines.map((line) => context.measureText(line).width));

const getRadarLabelLayout = (
  context: CanvasRenderingContext2D,
  lines: readonly string[],
  x: number,
  y: number,
  centerX: number,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) => {
  const maxLineWidth = getMaxLineWidth(context, lines);
  let textAlign: CanvasTextAlign = "center";
  let adjustedX = x;

  if (x < centerX - 24) {
    textAlign = "right";
    adjustedX = Math.max(minX + maxLineWidth, x);
  } else if (x > centerX + 24) {
    textAlign = "left";
    adjustedX = Math.min(maxX - maxLineWidth, x);
  } else {
    adjustedX = Math.min(
      maxX - maxLineWidth / 2,
      Math.max(minX + maxLineWidth / 2, x)
    );
  }

  return {
    textAlign,
    x: adjustedX,
    y: Math.min(maxY, Math.max(minY, y)),
  };
};

const drawRadarChart = (
  context: CanvasRenderingContext2D,
  entries: readonly ScoreEntry<string>[],
  panelX: number,
  panelY: number,
  panelWidth: number,
  panelHeight: number
) => {
  const centerX = panelX + panelWidth / 2;
  const centerY = panelY + panelHeight / 2 + 16;
  const radius = 200;
  const labelRadius = 270;
  const axes = createRadarAxes(entries, centerX, centerY, radius);

  for (const level of radarLevels) {
    const points = buildRadarPolygon(
      entries,
      centerX,
      centerY,
      () => (radius * level) / 5
    );

    context.beginPath();
    tracePolygon(context, points);
    context.fillStyle = level === 5 ? "#ecfeff" : "transparent";
    context.fill();
    context.strokeStyle = "#99f6e4";
    context.lineWidth = 2;
    context.stroke();
  }

  for (const axis of axes) {
    const labelPoint = toRadarPoint(
      centerX,
      centerY,
      axis.angleInDegrees,
      labelRadius
    );
    const labelLines = splitRadarLabel(axis.entry.label);
    const labelLayout = getRadarLabelLayout(
      context,
      labelLines,
      labelPoint.x,
      labelPoint.y,
      centerX,
      panelX + 40,
      panelX + panelWidth - 40,
      panelY + 40,
      panelY + panelHeight - 40
    );

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(axis.point.x, axis.point.y);
    context.strokeStyle = "#99f6e4";
    context.lineWidth = 2;
    context.stroke();

    context.textAlign = labelLayout.textAlign;
    context.fillStyle = "#0f172a";
    context.font = `600 28px ${metricFont}`;
    drawTextLines(context, labelLines, labelLayout.x, labelLayout.y, 34);
  }

  const dataPoints = buildRadarPolygon(
    entries,
    centerX,
    centerY,
    (entry) => (radius * entry.value) / 5
  );

  context.beginPath();
  tracePolygon(context, dataPoints);
  context.fillStyle = "rgb(13 148 136 / 0.22)";
  context.fill();
  context.strokeStyle = "#0f766e";
  context.lineWidth = 4;
  context.stroke();

  for (const point of dataPoints) {
    context.beginPath();
    context.arc(point.x, point.y, 8, 0, Math.PI * 2);
    context.fillStyle = "#0f766e";
    context.fill();
  }
};

const drawMetricGrid = (
  context: CanvasRenderingContext2D,
  entries: readonly ScoreEntry<string>[],
  originY: number,
  view: ResultView
) => {
  const contentWidth = canvasWidth - canvasPadding * 2;
  const gridColumns = 3;
  const cardWidth = (contentWidth - gridGap * (gridColumns - 1)) / gridColumns;
  const cardHeight = getMetricCardHeight(view);

  for (const [index, entry] of entries.entries()) {
    const column = index % gridColumns;
    const row = Math.floor(index / gridColumns);
    const x = canvasPadding + column * (cardWidth + gridGap);
    const y = originY + row * (cardHeight + gridGap);
    const labelLines = splitRadarLabel(entry.label);

    drawRoundedRect(
      context,
      x,
      y,
      cardWidth,
      cardHeight,
      metricCardRadius,
      "#ffffff",
      "#b5f0ea"
    );

    context.fillStyle = "#475569";
    context.textAlign = "left";
    context.font = `500 ${view === "facets" ? 24 : 28}px ${metricFont}`;
    drawTextLines(context, labelLines, x + 32, y + 48, 34);

    context.fillStyle = "#020617";
    context.font = `700 ${view === "facets" ? 64 : 80}px ${metricFont}`;
    context.fillText(formatScore(entry.value), x + 32, y + cardHeight - 40);
  }
};

export const renderResultCanvas = ({
  dateLabel,
  result,
  view,
}: RenderResultCanvasOptions): HTMLCanvasElement => {
  const viewModel = getResultViewModel(result, view);
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  const backgroundGradient = context.createLinearGradient(
    0,
    0,
    canvasWidth,
    canvas.height
  );
  backgroundGradient.addColorStop(0, "#ffffff");
  backgroundGradient.addColorStop(0.58, "#f0fdfa");
  backgroundGradient.addColorStop(1, "#ecfeff");

  drawRoundedRect(context, 0, 0, canvas.width, canvas.height, 0, "#f0fdfa");
  drawRoundedRect(
    context,
    canvasPadding / 2,
    canvasPadding / 2,
    canvas.width - canvasPadding,
    canvas.height - canvasPadding,
    cardRadius,
    backgroundGradient,
    "#b5f0ea"
  );

  context.fillStyle = "#0f766e";
  context.textAlign = "left";
  context.font = `700 18px ${metricFont}`;
  context.fillText("BIG FIVE INVENTORY-2", canvasPadding + 8, 64);

  context.fillStyle = "#020617";
  context.font = `700 64px ${metricFont}`;
  context.fillText(viewModel.title, canvasPadding + 4, 136);

  context.fillStyle = "#64748b";
  context.textAlign = "right";
  context.font = `500 20px ${metricFont}`;
  context.fillText(dateLabel, canvasWidth - canvasPadding - 8, 64);

  context.textAlign = "left";
  context.font = `500 20px ${metricFont}`;
  const descriptionLines = splitTextByWidth(
    context,
    viewModel.description,
    canvasWidth - canvasPadding * 2 - 160
  );
  drawTextLines(context, descriptionLines, canvasPadding + 8, 180, 32);

  if (viewModel.showRadar) {
    const chartPanelX = canvasPadding;
    const chartPanelY = 240;
    const chartPanelWidth = canvasWidth - canvasPadding * 2;
    const chartPanelHeight = 690;

    drawRoundedRect(
      context,
      chartPanelX,
      chartPanelY,
      chartPanelWidth,
      chartPanelHeight,
      34,
      "#ffffff",
      "#b5f0ea"
    );
    drawRadarChart(
      context,
      viewModel.radarEntries,
      chartPanelX,
      chartPanelY,
      chartPanelWidth,
      chartPanelHeight
    );
    drawMetricGrid(context, viewModel.entries, 954, view);
    return canvas;
  }

  drawMetricGrid(context, viewModel.entries, 240, view);
  return canvas;
};
