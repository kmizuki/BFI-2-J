import {
  type Item,
  type Rating,
  ratingEntries,
  totalItems,
} from "../questionnaire";
import {
  pageTitleClassName,
  primaryButtonClassName,
  questionCardClassName,
  questionColumnClassName,
  ScreenFrame,
  secondaryButtonClassName,
} from "./screen-frame";

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
            className="flex min-h-14 items-center justify-center text-balance text-center font-semibold text-[1.25rem] text-slate-900 leading-7 sm:min-h-16 sm:text-[1.45rem] sm:leading-8"
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

export default QuestionScreen;
