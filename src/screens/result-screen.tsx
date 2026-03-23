import { formatScore, type ScoreEntry } from "../questionnaire";
import { formatStoredResultDate } from "../result/format-stored-result-date";
import { RadarChartSvg } from "../result/radar-chart-svg";
import type { ResultView } from "../result/types";
import { getResultViewModel } from "../result/view-model";
import type { StoredResultRecord } from "../session-types";
import {
  downloadButtonClassName,
  pageTitleClassName,
  resultCardClassName,
  ScreenFrame,
  scoreLabelClassName,
  scoreValueClassName,
  secondaryButtonClassName,
} from "./screen-frame";

interface ResultScreenProps {
  exportMessage: string | null;
  isExporting: boolean;
  onDownload: () => void;
  onRestart: () => void;
  onSwitchView: (view: ResultView) => void;
  record: StoredResultRecord;
  resultView: ResultView;
}

interface ResultMetricCardProps {
  entry: ScoreEntry<string>;
  isFacetView: boolean;
}

const ResultMetricCard = ({ entry, isFacetView }: ResultMetricCardProps) => (
  <li
    className={`flex flex-col rounded-[24px] border border-teal-200 bg-white/85 ${
      isFacetView ? "min-h-26 p-2.5 sm:p-3" : "min-h-28 p-3"
    }`}
  >
    <div
      className={`min-h-11 text-slate-600 leading-5 ${
        isFacetView ? "text-[14px] sm:text-[15px]" : scoreLabelClassName
      }`}
    >
      {entry.label}
    </div>
    <div
      className={`mt-auto pt-2 font-semibold text-slate-950 tracking-tight ${
        isFacetView ? "text-[1.7rem] sm:text-[1.85rem]" : scoreValueClassName
      }`}
    >
      {formatScore(entry.value)}
    </div>
  </li>
);

const ResultScreen = ({
  exportMessage,
  isExporting,
  onDownload,
  onRestart,
  onSwitchView,
  record,
  resultView,
}: ResultScreenProps) => {
  const isFacetView = resultView === "facets";
  const viewModel = getResultViewModel(record.result, resultView);

  return (
    <ScreenFrame panelClassName={resultCardClassName}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 autoFocus className={pageTitleClassName} tabIndex={-1}>
              結果
            </h1>
            <p className="text-[14px] text-slate-500">
              保存日時: {formatStoredResultDate(record.createdAt)}
            </p>
          </div>
          <button
            className={`${secondaryButtonClassName} shrink-0 px-4 text-[15px]`}
            onClick={onRestart}
            type="button"
          >
            トップへ戻る
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 font-semibold text-[15px] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
              resultView === "domains"
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-teal-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
            }`}
            onClick={() => onSwitchView("domains")}
            type="button"
          >
            ドメイン得点
          </button>
          <button
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 font-semibold text-[15px] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 ${
              resultView === "facets"
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-teal-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
            }`}
            onClick={() => onSwitchView("facets")}
            type="button"
          >
            ファセット得点
          </button>
        </div>

        <button
          className={downloadButtonClassName}
          disabled={isExporting}
          onClick={onDownload}
          type="button"
        >
          {isExporting ? "出力中..." : "画像保存"}
        </button>

        <p className="text-[13px] text-slate-500 leading-5">
          {exportMessage ??
            "表示中のカードを PNG で保存します。ドメイン得点とファセット得点は別々に保存できます。"}
        </p>

        <div className="mx-auto w-full max-w-152">
          <div className="overflow-hidden rounded-[30px] border border-teal-200 bg-linear-to-br from-white via-teal-50 to-cyan-50 p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[11px] text-teal-700 uppercase tracking-[0.22em]">
                  Big Five Inventory-2
                </p>
                <h2 className="mt-1 font-semibold text-[1.35rem] text-slate-950 tracking-tight sm:text-[1.5rem]">
                  {viewModel.title}
                </h2>
              </div>
              <p className="shrink-0 text-right text-[11px] text-slate-500 leading-5 sm:text-[12px]">
                {formatStoredResultDate(record.createdAt)}
              </p>
            </div>

            <p className="mt-2 text-[12px] text-slate-600 leading-5 sm:text-[13px]">
              {viewModel.description}
            </p>

            {viewModel.showRadar ? (
              <RadarChartSvg entries={viewModel.radarEntries} />
            ) : null}

            <ul className="mt-4 grid list-none grid-cols-3 gap-2">
              {viewModel.entries.map((entry) => (
                <ResultMetricCard
                  entry={entry}
                  isFacetView={isFacetView}
                  key={entry.id}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
};

export default ResultScreen;
