import { totalItems } from "../questionnaire";
import { formatStoredResultDate } from "../result/format-stored-result-date";
import type { DraftSession, StoredResultRecord } from "../session-types";
import {
  introResultCardClassName,
  pageTitleClassName,
  primaryButtonClassName,
  ScreenFrame,
  secondaryButtonClassName,
} from "./screen-frame";

const compactInfoSectionClassName =
  "flex flex-col gap-2 rounded-2xl border border-teal-200 px-3 py-3 sm:px-4";
const compactInfoTitleClassName =
  "text-[15px] font-semibold tracking-wide text-teal-900";
const compactInfoMetaClassName = "text-[12px] text-slate-500";
const compactInfoBodyClassName =
  "text-[13px] text-slate-600 leading-5 sm:text-[14px]";
const compactButtonClassName = "px-4 py-2 text-[15px]";

interface IntroScreenProps {
  draftSession: DraftSession | null;
  onOpenPreviousResult: () => void;
  onResumeDraft: () => void;
  onStart: () => void;
  previousResult: StoredResultRecord | null;
}

const IntroScreen = ({
  draftSession,
  onOpenPreviousResult,
  onResumeDraft,
  onStart,
  previousResult,
}: IntroScreenProps) => {
  const answeredCount = draftSession
    ? Object.keys(draftSession.responses).length
    : 0;

  return (
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
          <li>
            最近の一時的な気分ではなく、ここ数年の傾向を思い浮かべて正直に回答してください。
          </li>
          <li>
            思い出しにくい質問は考え込まず、第一印象で選んでかまいません。
          </li>
        </ul>
        {draftSession ? (
          <section className={`${compactInfoSectionClassName} bg-teal-50`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={compactInfoTitleClassName}>中断中の回答</h2>
              <p className={compactInfoMetaClassName}>
                {answeredCount} / {totalItems}
              </p>
            </div>
            <p className={compactInfoBodyClassName}>
              {formatStoredResultDate(draftSession.updatedAt)}{" "}
              に保存された回答があります。
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className={`${secondaryButtonClassName} ${compactButtonClassName}`}
                onClick={onStart}
                type="button"
              >
                最初から開始
              </button>
              <button
                className={`${primaryButtonClassName} ${compactButtonClassName}`}
                onClick={onResumeDraft}
                type="button"
              >
                中断から再開
              </button>
            </div>
          </section>
        ) : null}
        <section className={`${compactInfoSectionClassName} bg-white`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={compactInfoTitleClassName}>以前の結果</h2>
            <p className={compactInfoMetaClassName}>
              {previousResult ? "保存済み" : "未保存"}
            </p>
          </div>
          {previousResult ? (
            <div className="flex justify-end">
              <button
                className={`${secondaryButtonClassName} ${compactButtonClassName}`}
                onClick={onOpenPreviousResult}
                type="button"
              >
                前回の結果を開く
              </button>
            </div>
          ) : (
            <p className="text-[13px] text-slate-500 leading-5 sm:text-[14px]">
              保存済みの結果はまだありません。
            </p>
          )}
        </section>
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-slate-500 leading-5 sm:text-[13px] sm:leading-6">
            Yoshino, S., Shimotsukasa, T., Oshio, A., Hashimoto, Y., Ueno, Y.,
            Mieda, T., Migiwa, I., Sato, T., Kawamoto, S., Soto, C. J., & John,
            O. P. (2022). A validation of the Japanese adaptation of the Big
            Five Inventory-2 (BFI-2-J). <em>Frontiers in Psychology, 13</em>:
            924351.
          </p>
          <div className="flex justify-end">
            <button
              className={primaryButtonClassName}
              onClick={onStart}
              type="button"
            >
              {draftSession ? "新しく開始する" : "開始する"}
            </button>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
};

export default IntroScreen;
