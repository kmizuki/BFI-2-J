import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  calculateScoreSummary,
  questionnaireItems,
  type Rating,
  type ResponseMap,
  totalItems,
} from "../questionnaire";
import { saveResultImage } from "../result/save-result-image";
import type { ResultView } from "../result/types";
import type { DraftSession, Stage, StoredResultRecord } from "../session-types";
import {
  loadDraftSession,
  removeDraftSession,
  storeDraftSession,
} from "../storage/draft-session";
import { loadStoredResult, storeStoredResult } from "../storage/result-record";

const autoAdvanceDelayMs = 350;

interface QuestionnaireSessionState {
  activeResultRecord: StoredResultRecord | null;
  currentIndex: number;
  draftSession: DraftSession | null;
  exportMessage: string | null;
  isAutoAdvancing: boolean;
  isExporting: boolean;
  responses: ResponseMap;
  resultView: ResultView;
  stage: Stage;
  storedResult: StoredResultRecord | null;
}

type Action =
  | { type: "advanceQuestion" }
  | { type: "exportFinished"; message: string }
  | { type: "exportStart" }
  | { type: "openPreviousResult"; record: StoredResultRecord }
  | { type: "restart" }
  | { type: "resumeDraft"; draftSession: DraftSession }
  | {
      type: "selectRating";
      itemNumber: number;
      rating: Rating;
      shouldAutoAdvance: boolean;
    }
  | { type: "showResult"; record: StoredResultRecord }
  | { type: "start" }
  | { type: "switchResultView"; view: ResultView }
  | { type: "syncDraftSession"; draftSession: DraftSession | null }
  | { type: "viewPreviousQuestion" };

const createInitialState = (): QuestionnaireSessionState => ({
  activeResultRecord: null,
  currentIndex: 0,
  draftSession: loadDraftSession(),
  exportMessage: null,
  isAutoAdvancing: false,
  isExporting: false,
  responses: {},
  resultView: "domains",
  stage: "intro",
  storedResult: loadStoredResult(),
});

const resetUiState = (
  state: QuestionnaireSessionState
): QuestionnaireSessionState => ({
  ...state,
  exportMessage: null,
  isAutoAdvancing: false,
  isExporting: false,
  resultView: "domains",
});

const openQuestionStage = (
  state: QuestionnaireSessionState,
  currentIndex: number,
  responses: ResponseMap
): QuestionnaireSessionState => ({
  ...resetUiState(state),
  activeResultRecord: null,
  currentIndex,
  responses,
  stage: "question",
});

const openResultStage = (
  state: QuestionnaireSessionState,
  record: StoredResultRecord
): QuestionnaireSessionState => ({
  ...resetUiState(state),
  activeResultRecord: record,
  stage: "result",
});

const questionnaireSessionReducer = (
  state: QuestionnaireSessionState,
  action: Action
): QuestionnaireSessionState => {
  switch (action.type) {
    case "advanceQuestion":
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        isAutoAdvancing: false,
      };

    case "exportFinished":
      return {
        ...state,
        exportMessage: action.message,
        isExporting: false,
      };

    case "exportStart":
      return {
        ...state,
        exportMessage: null,
        isExporting: true,
      };

    case "openPreviousResult":
      return openResultStage(state, action.record);

    case "restart":
      return {
        ...resetUiState(state),
        activeResultRecord: null,
        currentIndex: 0,
        responses: {},
        stage: "intro",
      };

    case "resumeDraft":
      return openQuestionStage(
        state,
        action.draftSession.currentIndex,
        action.draftSession.responses
      );

    case "selectRating":
      return {
        ...state,
        isAutoAdvancing: action.shouldAutoAdvance,
        responses: {
          ...state.responses,
          [action.itemNumber]: action.rating,
        },
      };

    case "showResult":
      return openResultStage(
        {
          ...state,
          draftSession: null,
          storedResult: action.record,
        },
        action.record
      );

    case "start":
      return openQuestionStage(
        {
          ...state,
          draftSession: null,
        },
        0,
        {}
      );

    case "switchResultView":
      return {
        ...state,
        exportMessage: null,
        resultView: action.view,
      };

    case "syncDraftSession":
      return {
        ...state,
        draftSession: action.draftSession,
      };

    case "viewPreviousQuestion":
      if (state.currentIndex === 0) {
        return state;
      }

      return {
        ...state,
        currentIndex: state.currentIndex - 1,
        isAutoAdvancing: false,
      };

    default:
      return state;
  }
};

export const useQuestionnaireSession = () => {
  const [state, dispatch] = useReducer(
    questionnaireSessionReducer,
    undefined,
    createInitialState
  );
  const autoAdvanceTimeoutRef = useRef<ReturnType<
    typeof window.setTimeout
  > | null>(null);
  const currentItem = questionnaireItems[state.currentIndex];
  const answeredCount = Object.keys(state.responses).length;
  const allAnswered = answeredCount === totalItems;
  const isLastQuestion = state.currentIndex === totalItems - 1;
  const selectedRating = currentItem
    ? state.responses[currentItem.number]
    : undefined;

  const clearAutoAdvanceTimeout = useCallback(() => {
    if (autoAdvanceTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(autoAdvanceTimeoutRef.current);
    autoAdvanceTimeoutRef.current = null;
  }, []);

  useEffect(() => clearAutoAdvanceTimeout, [clearAutoAdvanceTimeout]);

  useEffect(() => {
    if (state.stage !== "question") {
      return;
    }

    if (answeredCount === 0 || answeredCount >= totalItems) {
      return;
    }

    const nextDraftSession = {
      currentIndex: state.currentIndex,
      responses: state.responses,
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: "syncDraftSession", draftSession: nextDraftSession });
    storeDraftSession(nextDraftSession);
  }, [answeredCount, state.currentIndex, state.responses, state.stage]);

  const handleStart = useCallback(() => {
    clearAutoAdvanceTimeout();
    removeDraftSession();
    dispatch({ type: "start" });
  }, [clearAutoAdvanceTimeout]);

  const handleResumeDraft = useCallback(() => {
    if (!state.draftSession) {
      handleStart();
      return;
    }

    clearAutoAdvanceTimeout();
    dispatch({ type: "resumeDraft", draftSession: state.draftSession });
  }, [clearAutoAdvanceTimeout, handleStart, state.draftSession]);

  const handleOpenPreviousResult = useCallback(() => {
    if (!state.storedResult) {
      return;
    }

    clearAutoAdvanceTimeout();
    dispatch({ type: "openPreviousResult", record: state.storedResult });
  }, [clearAutoAdvanceTimeout, state.storedResult]);

  const handleShowResult = useCallback(() => {
    if (!allAnswered) {
      return;
    }

    clearAutoAdvanceTimeout();
    const record = {
      createdAt: new Date().toISOString(),
      result: calculateScoreSummary(state.responses),
    };

    removeDraftSession();
    storeStoredResult(record);
    dispatch({ type: "showResult", record });
  }, [allAnswered, clearAutoAdvanceTimeout, state.responses]);

  const handleDownloadResult = useCallback(async () => {
    if (!state.activeResultRecord) {
      return;
    }

    dispatch({ type: "exportStart" });

    try {
      await saveResultImage({
        record: state.activeResultRecord,
        view: state.resultView,
      });
      dispatch({
        type: "exportFinished",
        message: "PNG画像を保存しました。",
      });
    } catch {
      dispatch({
        type: "exportFinished",
        message: "画像の出力に失敗しました。",
      });
    }
  }, [state.activeResultRecord, state.resultView]);

  const handleSwitchResultView = useCallback((view: ResultView) => {
    dispatch({ type: "switchResultView", view });
  }, []);

  const handleSelect = useCallback(
    (rating: Rating) => {
      if (!currentItem) {
        return;
      }

      clearAutoAdvanceTimeout();
      dispatch({
        type: "selectRating",
        itemNumber: currentItem.number,
        rating,
        shouldAutoAdvance: !isLastQuestion,
      });

      if (isLastQuestion) {
        return;
      }

      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        dispatch({ type: "advanceQuestion" });
        autoAdvanceTimeoutRef.current = null;
      }, autoAdvanceDelayMs);
    },
    [clearAutoAdvanceTimeout, currentItem, isLastQuestion]
  );

  const handleNext = useCallback(() => {
    if (!(currentItem && state.responses[currentItem.number])) {
      return;
    }

    clearAutoAdvanceTimeout();

    if (state.currentIndex + 1 >= totalItems) {
      handleShowResult();
      return;
    }

    dispatch({ type: "advanceQuestion" });
  }, [
    clearAutoAdvanceTimeout,
    currentItem,
    handleShowResult,
    state.currentIndex,
    state.responses,
  ]);

  const handlePrevious = useCallback(() => {
    clearAutoAdvanceTimeout();
    dispatch({ type: "viewPreviousQuestion" });
  }, [clearAutoAdvanceTimeout]);

  const handleRestart = useCallback(() => {
    clearAutoAdvanceTimeout();
    dispatch({ type: "restart" });
  }, [clearAutoAdvanceTimeout]);

  return {
    activeResultRecord: state.activeResultRecord,
    currentItem,
    currentIndex: state.currentIndex,
    draftSession: state.draftSession,
    exportMessage: state.exportMessage,
    handleDownloadResult,
    handleNext,
    handleOpenPreviousResult,
    handlePrevious,
    handleRestart,
    handleResumeDraft,
    handleSelect,
    handleStart,
    handleSwitchResultView,
    isAutoAdvancing: state.isAutoAdvancing,
    isExporting: state.isExporting,
    isLastQuestion,
    resultView: state.resultView,
    selectedRating,
    stage: state.stage,
    storedResult: state.storedResult,
  };
};
