import type { ScoreEntry } from "../questionnaire";
import {
  buildRadarPolygon,
  createRadarAxes,
  pointsToSvg,
  radarLevels,
  splitRadarLabel,
  toRadarPoint,
} from "./radar-geometry";

interface RadarChartSvgProps {
  entries: readonly ScoreEntry<string>[];
}

const radarChartSize = 240;
const radarChartCenter = radarChartSize / 2;
const radarChartRadius = 68;
const radarLabelRadius = 90;
const radarLabelHorizontalInset = 42;
const radarLabelVerticalInset = 18;

const getRadarLabelPoint = (angleInDegrees: number) => {
  const point = toRadarPoint(
    radarChartCenter,
    radarChartCenter,
    angleInDegrees,
    radarLabelRadius
  );

  return {
    x: Math.min(
      radarChartSize - radarLabelHorizontalInset,
      Math.max(radarLabelHorizontalInset, point.x)
    ),
    y: Math.min(
      radarChartSize - radarLabelVerticalInset,
      Math.max(radarLabelVerticalInset, point.y)
    ),
  };
};

export const RadarChartSvg = ({ entries }: RadarChartSvgProps) => {
  const axes = createRadarAxes(
    entries,
    radarChartCenter,
    radarChartCenter,
    radarChartRadius
  );
  const gridPolygons = radarLevels.map((level) =>
    pointsToSvg(
      buildRadarPolygon(
        entries,
        radarChartCenter,
        radarChartCenter,
        () => (radarChartRadius * level) / 5
      )
    )
  );
  const dataPoints = buildRadarPolygon(
    entries,
    radarChartCenter,
    radarChartCenter,
    (entry) => (radarChartRadius * entry.value) / 5
  );
  const dataPolygon = pointsToSvg(dataPoints);

  return (
    <div className="mt-4 rounded-[28px] border border-teal-200/80 bg-white/70 px-3 py-3 sm:px-4">
      <div className="mx-auto max-w-72">
        <svg
          aria-label="5つのドメイン指標のレーダーチャート"
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${radarChartSize} ${radarChartSize}`}
        >
          {gridPolygons.map((points, index) => (
            <polygon
              fill={index === gridPolygons.length - 1 ? "#ecfeff" : "none"}
              key={radarLevels[index]}
              points={points}
              stroke="#99f6e4"
              strokeWidth="1"
            />
          ))}
          {axes.map((axis) => {
            const labelPoint = getRadarLabelPoint(axis.angleInDegrees);
            const labelLines = splitRadarLabel(axis.entry.label);
            let textAnchor: "end" | "middle" | "start" = "middle";

            if (labelPoint.x < radarChartCenter - 10) {
              textAnchor = "end";
            } else if (labelPoint.x > radarChartCenter + 10) {
              textAnchor = "start";
            }

            return (
              <g key={axis.entry.id}>
                <line
                  stroke="#99f6e4"
                  strokeWidth="1"
                  x1={radarChartCenter}
                  x2={axis.point.x}
                  y1={radarChartCenter}
                  y2={axis.point.y}
                />
                <text
                  fill="#0f172a"
                  fontSize="10"
                  textAnchor={textAnchor}
                  x={labelPoint.x}
                  y={labelPoint.y}
                >
                  {labelLines.map((line, lineIndex) => (
                    <tspan
                      dy={lineIndex === 0 ? "0" : "1.1em"}
                      key={`${axis.entry.id}-${line}`}
                      x={labelPoint.x}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          <polygon
            fill="rgb(13 148 136 / 0.22)"
            points={dataPolygon}
            stroke="#0f766e"
            strokeWidth="2"
          />
          {dataPoints.map((point, index) => (
            <circle
              cx={point.x}
              cy={point.y}
              fill="#0f766e"
              key={entries[index]?.id ?? index}
              r="3.5"
            />
          ))}
          <circle
            cx={radarChartCenter}
            cy={radarChartCenter}
            fill="#0f766e"
            r="2.5"
          />
        </svg>
      </div>
    </div>
  );
};
