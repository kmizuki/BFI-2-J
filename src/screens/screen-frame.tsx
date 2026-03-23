import type { ReactNode } from "react";

const pageClassName =
  "flex min-h-dvh items-center justify-center bg-teal-50 px-2 py-2 text-slate-900 sm:px-4 sm:py-4 lg:px-8";
const cardBaseClassName =
  "flex w-full flex-col rounded-[26px] border border-teal-200 bg-white shadow-sm";

export const introResultCardClassName = `${cardBaseClassName} max-w-[min(96vw,52rem)] gap-4 px-4 py-4 sm:px-5 sm:py-5`;
export const resultCardClassName = `${cardBaseClassName} max-w-[min(96vw,44rem)] gap-3.5 px-3.5 py-4 sm:px-4 sm:py-4`;
export const questionCardClassName = `${cardBaseClassName} max-w-[min(96vw,46rem)] gap-3.5 px-3.5 py-4 sm:px-4 sm:py-4`;
export const pageTitleClassName =
  "text-balance text-[2rem] font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-4 focus-visible:ring-teal-200/70 sm:text-[2.15rem]";
export const primaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full bg-teal-600 px-5 py-2.5 text-[17px] font-semibold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-300";
export const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full border border-teal-200 bg-white px-5 py-2.5 text-[17px] font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300";
export const downloadButtonClassName =
  "inline-flex min-h-10 items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-[17px] font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-300";
export const sectionTitleClassName =
  "text-[16px] font-semibold tracking-wide text-teal-900";
export const scoreLabelClassName = "text-[16px] text-slate-500";
export const scoreValueClassName =
  "text-[2rem] font-semibold tracking-tight text-slate-950";
export const questionColumnClassName = "mx-auto w-full max-w-[31rem]";

interface ScreenFrameProps {
  children: ReactNode;
  panelClassName: string;
}

export const ScreenFrame = ({ children, panelClassName }: ScreenFrameProps) => (
  <main className={pageClassName}>
    <section className={panelClassName}>{children}</section>
  </main>
);
