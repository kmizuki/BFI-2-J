import { useState } from "react";
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

interface IntroScreenProps {
  onStart: () => void;
}

const IntroScreen = ({ onStart }: IntroScreenProps) => (
  <main className="app intro-page">
    <section className="card">
      <h1 autoFocus className="page-title title" tabIndex={-1}>
        Big Five Inventory-2
      </h1>
      <p className="intro-message">
        BFI-2-JはBFI-2の日本語版です。このツールは60問の質問でBig
        Fiveパーソナリティの５つの特性を測定します。５つの特性（ドメイン）にはそれぞれ3つの下位概念（ファセット）が想定されています。
      </p>
      <p className="instruction">
        最近の一時的な気分ではなく、ここ数年の傾向を思い浮かべて正直に回答してください。思い出しにくい質問は考え込まず、第一印象で選んでかまいません。
      </p>
      <p className="citation">
        Yoshino, S., Shimotsukasa, T., Oshio, A., Hashimoto, Y., Ueno, Y.,
        Mieda, T., Migiwa, I., Sato, T., Kawamoto, S., Soto, C. J., & John, O.
        P. (2022). A validation of the Japanese adaptation of the Big Five
        Inventory-2 (BFI-2-J). <em>Frontiers in Psychology, 13</em>: 924351.
      </p>
      <button className="primary-button" onClick={onStart} type="button">
        開始する
      </button>
    </section>
  </main>
);

interface ResultSectionProps {
  entries: readonly ScoreEntry<string>[];
  headingId: string;
  title: string;
}

const ResultSection = ({ entries, headingId, title }: ResultSectionProps) => (
  <section aria-labelledby={headingId} className="result-section">
    <h2 className="section-title" id={headingId}>
      {title}
    </h2>
    <ul className="score-list">
      {entries.map((entry) => (
        <li className="score-item" key={entry.id}>
          <div className="score-label">{entry.label}</div>
          <div className="score-value">{formatScore(entry.value)}</div>
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
  <main className="app">
    <section className="card">
      <h1 autoFocus className="page-title title" tabIndex={-1}>
        結果
      </h1>
      <p className="instruction">
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
      <div className="actions">
        <button className="secondary-button" onClick={onRestart} type="button">
          もう一度はじめる
        </button>
      </div>
    </section>
  </main>
);

interface QuestionScreenProps {
  currentIndex: number;
  currentItem: Item;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (rating: Rating) => void;
  selectedRating?: Rating;
}

const QuestionScreen = ({
  currentIndex,
  currentItem,
  onNext,
  onPrevious,
  onSelect,
  selectedRating,
}: QuestionScreenProps) => {
  const progress = `${currentIndex + 1} / ${totalItems}`;

  return (
    <main className="app">
      <section className="card">
        <header className="question-header">
          <h1 autoFocus className="page-title title" tabIndex={-1}>
            質問
          </h1>
          <p aria-live="polite" className="progress" id="question-progress">
            {progress}
          </p>
        </header>
        <div className="question-body">
          <h2 className="question-text" id="question-text">
            {currentItem.text}
          </h2>
        </div>
        <fieldset aria-describedby="question-progress" className="scale">
          <legend className="sr-only">回答を選択してください</legend>
          <ul className="scale-options">
            {ratingEntries.map(([value, label]) => {
              const optionId = `question-${currentItem.number}-rating-${value}`;
              return (
                <li key={value}>
                  <label className="option" htmlFor={optionId}>
                    <input
                      checked={selectedRating === value}
                      className="option-input"
                      id={optionId}
                      name={`question-${currentItem.number}`}
                      onChange={() => onSelect(value)}
                      type="radio"
                      value={value}
                    />
                    <span className="option-content">
                      <span aria-hidden="true" className="option-number">
                        {value}
                      </span>
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
            onClick={onPrevious}
            type="button"
          >
            もどる
          </button>
          <button
            className="primary-button"
            disabled={!selectedRating}
            onClick={onNext}
            type="button"
          >
            次へ
          </button>
        </div>
      </section>
    </main>
  );
};

const App = () => {
  const [stage, setStage] = useState<Stage>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});

  const currentItem = questionnaireItems[currentIndex];
  const answeredCount = Object.keys(responses).length;
  const allAnswered = answeredCount === totalItems;
  const result =
    stage === "result" && allAnswered ? calculateScoreSummary(responses) : null;

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

    setCurrentIndex((prev) => prev - 1);
  };

  const handleRestart = () => {
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
      key={currentItem.number}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSelect={handleSelect}
      selectedRating={selectedRating}
    />
  );
};

export default App;
