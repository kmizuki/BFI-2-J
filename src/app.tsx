import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  calculateScoreSummary,
  formatScore,
  type Item,
  questionnaireItems,
  type Rating,
  type ResponseMap,
  ratingEntries,
  type ScoreEntry,
  type ScoreSummary,
  totalItems,
} from "./questionnaire";

type Stage = "intro" | "question" | "result";

const pageClassName =
  "flex min-h-dvh items-center justify-center bg-teal-50 px-2 py-2 text-slate-900 sm:px-4 sm:py-4 lg:px-8";
const cardBaseClassName =
  "flex w-full flex-col rounded-[26px] border border-teal-200 bg-white shadow-sm";
const introResultCardClassName = `${cardBaseClassName} max-w-[min(96vw,52rem)] gap-4 px-4 py-4 sm:px-5 sm:py-5`;
const questionCardClassName = `${cardBaseClassName} max-w-[min(96vw,46rem)] gap-3.5 px-3.5 py-4 sm:px-4 sm:py-4`;
const pageTitleClassName =
  "text-balance text-[2rem] font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-4 focus-visible:ring-teal-200/70 sm:text-[2.15rem]";
const primaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full bg-teal-600 px-5 py-2.5 text-[17px] font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-300";
const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-teal-200 bg-white px-5 py-2.5 text-[17px] font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300";
const sectionTitleClassName =
  "text-[16px] font-semibold tracking-wide text-teal-900";
const scoreLabelClassName = "text-[16px] text-slate-500";
const scoreValueClassName =
  "text-[2rem] font-semibold tracking-tight text-slate-950";
const questionColumnClassName = "mx-auto w-full max-w-[31rem]";
const autoAdvanceDelayMs = 350;

interface ScreenFrameProps {
  children: ReactNode;
  panelClassName: string;
}

const ScreenFrame = ({ children, panelClassName }: ScreenFrameProps) => (
  <main className={pageClassName}>
    <section className={panelClassName}>{children}</section>
  </main>
);

interface IntroScreenProps {
  onStart: () => void;
}

const IntroScreen = ({ onStart }: IntroScreenProps) => (
  <ScreenFrame panelClassName={introResultCardClassName}>
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-2.5">
        <h1 autoFocus className={pageTitleClassName} tabIndex={-1}>
          Big Five Inventory-2
        </h1>
      </div>
      <div className="rounded-3xl border border-teal-200 bg-teal-50 px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-[16px] text-slate-700 leading-7 sm:text-[18px] sm:leading-8">
          BFI-2-JはBFI-2の日本語版です。このツールは60問の質問でBig
          Fiveパーソナリティの5つの特性を測定します。5つの特性にはそれぞれ3つの下位概念が想定されています。
        </p>
      </div>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15px] text-slate-600 leading-6 sm:text-[17px] sm:leading-7">
        <li>最近の一時的な気分ではなく、ここ数年の傾向を思い浮かべて正直に回答してください。</li>
        <li>思い出しにくい質問は考え込まず、第一印象で選んでかまいません。</li>
      </ul>
      <div className="flex flex-col gap-3">
        <p className="text-[12px] text-slate-500 leading-5 sm:text-[13px] sm:leading-6">
          Yoshino, S., Shimotsukasa, T., Oshio, A., Hashimoto, Y., Ueno, Y.,
          Mieda, T., Migiwa, I., Sato, T., Kawamoto, S., Soto, C. J., & John, O.
          P. (2022). A validation of the Japanese adaptation of the Big Five
          Inventory-2 (BFI-2-J). <em>Frontiers in Psychology, 13</em>: 924351.
        </p>
        <div className="flex justify-end">
          <button
            className={primaryButtonClassName}
            onClick={onStart}
            type="button"
          >
            開始する
          </button>
        </div>
      </div>
    </div>
  </ScreenFrame>
);

interface ResultSectionProps {
  entries: readonly ScoreEntry<string>[];
  headingId: string;
  title: string;
}

const ResultSection = ({ entries, headingId, title }: ResultSectionProps) => (
  <section aria-labelledby={headingId} className="flex flex-col gap-2.5">
    <h2 className={sectionTitleClassName} id={headingId}>
      {title}
    </h2>
    <ul className="grid list-none grid-cols-3 gap-2">
      {entries.map((entry) => (
        <li
          className="rounded-3xl border border-teal-200 bg-teal-50 p-3"
          key={entry.id}
        >
          <div className={scoreLabelClassName}>{entry.label}</div>
          <div className={`mt-2 ${scoreValueClassName}`}>
            {formatScore(entry.value)}
          </div>
        </li>
      ))}
    </ul>
  </section>
);

interface ResultScreenProps {
  onRestart: () => void;
  result: ScoreSummary;
}

const ResultScreen = ({ onRestart, result }: ResultScreenProps) => (
  <ScreenFrame panelClassName={introResultCardClassName}>
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 autoFocus className={pageTitleClassName} tabIndex={-1}>
          結果
        </h1>
      </div>
      <p className="text-[15px] text-slate-600 leading-6 sm:text-[17px] sm:leading-7">
        各得点は1.00から5.00の平均値です。値が高いほど、その特性により強くあてはまる傾向を示します。
      </p>
      <ResultSection
        entries={result.domains}
        headingId="domains-heading"
        title="ドメイン得点"
      />
      <ResultSection
        entries={result.facets}
        headingId="facets-heading"
        title="ファセット得点"
      />
      <div className="flex justify-end pt-1">
        <button
          className={secondaryButtonClassName}
          onClick={onRestart}
          type="button"
        >
          もう一度はじめる
        </button>
      </div>
    </div>
  </ScreenFrame>
);

interface QuestionScreenProps {
  currentIndex: number;
  currentItem: Item;
  isAutoAdvancing: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (rating: Rating) => void;
  selectedRating?: Rating;
}

const QuestionScreen = ({
  currentIndex,
  currentItem,
  isAutoAdvancing,
  isLastQuestion,
  onNext,
  onPrevious,
  onSelect,
  selectedRating,
}: QuestionScreenProps) => {
  const progress = `${currentIndex + 1} / ${totalItems}`;
  const progressValue = ((currentIndex + 1) / totalItems) * 100;

  return (
    <ScreenFrame panelClassName={questionCardClassName}>
      <div className="flex flex-col gap-3.5">
        <header className={`${questionColumnClassName} flex flex-col gap-2.5`}>
          <div className="flex items-center justify-between gap-2.5">
            <div>
              <h1 autoFocus className={pageTitleClassName} tabIndex={-1}>
                質問
              </h1>
            </div>
            <p
              aria-live="polite"
              className="rounded-full border border-teal-200 bg-teal-100 px-3 py-1 font-medium text-[16px] text-teal-900"
              id="question-progress"
            >
              {progress}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="h-2 overflow-hidden rounded-full bg-teal-100"
          >
            <div
              className="h-full rounded-full bg-teal-700 transition-[width] duration-200"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </header>
        <div
          className={`${questionColumnClassName} rounded-[24px] border border-teal-200 bg-teal-50 p-3.5 sm:p-4`}
        >
          <h2
            className="text-balance text-center font-semibold text-[1.45rem] text-slate-900 leading-8 sm:text-[1.7rem] sm:leading-10"
            id="question-text"
          >
            {currentItem.text}
          </h2>
        </div>
        <fieldset
          aria-describedby="question-progress"
          className={`${questionColumnClassName} border-0 p-0`}
        >
          <legend className="sr-only">回答を選択してください</legend>
          <ul className="grid list-none gap-2">
            {ratingEntries.map(([value, label]) => {
              const optionId = `question-${currentItem.number}-rating-${value}`;
              return (
                <li key={value}>
                  <label className="block cursor-pointer" htmlFor={optionId}>
                    <input
                      checked={selectedRating === value}
                      className="peer sr-only"
                      disabled={isAutoAdvancing}
                      id={optionId}
                      name={`question-${currentItem.number}`}
                      onChange={() => onSelect(value)}
                      type="radio"
                      value={value}
                    />
                    <span className="flex items-center gap-3 rounded-[24px] border border-slate-300 bg-white p-3 text-left transition peer-checked:border-teal-600 peer-checked:bg-teal-50 peer-focus-visible:ring-4 peer-focus-visible:ring-teal-100 sm:gap-3.5 sm:p-4">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 font-semibold text-[16px] text-slate-700 peer-checked:border-teal-700 peer-checked:bg-teal-700 peer-checked:text-white"
                      >
                        {value}
                      </span>
                      <span className="text-[16px] text-slate-700 leading-6 sm:text-[18px] sm:leading-7">
                        {label}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <div
          className={`${questionColumnClassName} flex justify-center gap-2 pt-0.5`}
        >
          <button
            className={`${secondaryButtonClassName} w-36`}
            disabled={currentIndex === 0 || isAutoAdvancing}
            onClick={onPrevious}
            type="button"
          >
            もどる
          </button>
          <button
            className={`${primaryButtonClassName} w-36`}
            disabled={!selectedRating || isAutoAdvancing}
            onClick={onNext}
            type="button"
          >
            {isLastQuestion ? "結果を見る" : "次へ"}
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
};

const App = () => {
  const [stage, setStage] = useState<Stage>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(
    null,
  );

  const currentItem = questionnaireItems[currentIndex];
  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === totalItems;
  const isLastQuestion = currentIndex === totalItems - 1;
  const result =
    stage === "result" && allAnswered ? calculateScoreSummary(responses) : null;

  const clearAutoAdvanceTimeout = useCallback(() => {
    if (autoAdvanceTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(autoAdvanceTimeoutRef.current);
    autoAdvanceTimeoutRef.current = null;
  }, []);

  useEffect(() => clearAutoAdvanceTimeout, [clearAutoAdvanceTimeout]);

  const handleStart = () => {
    clearAutoAdvanceTimeout();
    setIsAutoAdvancing(false);
    setStage("question");
  };

  const handleSelect = (rating: Rating) => {
    if (!currentItem) {
      return;
    }

    setResponses((prev) => ({ ...prev, [currentItem.number]: rating }));
    clearAutoAdvanceTimeout();

    if (isLastQuestion) {
      setIsAutoAdvancing(false);
      return;
    }

    setIsAutoAdvancing(true);
    autoAdvanceTimeoutRef.current = window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsAutoAdvancing(false);
      autoAdvanceTimeoutRef.current = null;
    }, autoAdvanceDelayMs);
  };

  const handleNext = () => {
    if (!currentItem) {
      return;
    }

    if (!responses[currentItem.number]) {
      return;
    }

    clearAutoAdvanceTimeout();
    setIsAutoAdvancing(false);
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

    clearAutoAdvanceTimeout();
    setIsAutoAdvancing(false);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleRestart = () => {
    clearAutoAdvanceTimeout();
    setIsAutoAdvancing(false);
    setStage("intro");
    setCurrentIndex(0);
    setResponses({});
  };

  if (stage === "intro") {
    return <IntroScreen onStart={handleStart} />;
  }

  if (stage === "result" && result) {
    return <ResultScreen onRestart={handleRestart} result={result} />;
  }

  if (!currentItem) {
    return null;
  }

  const selectedRating = responses[currentItem.number];

  return (
    <QuestionScreen
      currentIndex={currentIndex}
      currentItem={currentItem}
      isAutoAdvancing={isAutoAdvancing}
      isLastQuestion={isLastQuestion}
      key={currentItem.number}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSelect={handleSelect}
      selectedRating={selectedRating}
    />
  );
};

export default App;
