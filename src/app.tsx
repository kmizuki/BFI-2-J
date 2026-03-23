import { useQuestionnaireSession } from "./hooks/use-questionnaire-session";
import IntroScreen from "./screens/intro-screen";
import QuestionScreen from "./screens/question-screen";
import ResultScreen from "./screens/result-screen";

const App = () => {
  const {
    activeResultRecord,
    currentItem,
    currentIndex,
    draftSession,
    exportMessage,
    handleDownloadResult,
    handleNext,
    handleOpenPreviousResult,
    handlePrevious,
    handleRestart,
    handleResumeDraft,
    handleSelect,
    handleStart,
    handleSwitchResultView,
    isAutoAdvancing,
    isExporting,
    isLastQuestion,
    resultView,
    selectedRating,
    stage,
    storedResult,
  } = useQuestionnaireSession();

  if (stage === "intro") {
    return (
      <IntroScreen
        draftSession={draftSession}
        onOpenPreviousResult={handleOpenPreviousResult}
        onResumeDraft={handleResumeDraft}
        onStart={handleStart}
        previousResult={storedResult}
      />
    );
  }

  if (stage === "result" && activeResultRecord) {
    return (
      <ResultScreen
        exportMessage={exportMessage}
        isExporting={isExporting}
        onDownload={handleDownloadResult}
        onRestart={handleRestart}
        onSwitchView={handleSwitchResultView}
        record={activeResultRecord}
        resultView={resultView}
      />
    );
  }

  if (!currentItem) {
    return null;
  }

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
