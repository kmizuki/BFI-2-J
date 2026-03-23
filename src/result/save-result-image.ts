import type { StoredResultRecord } from "../session-types";
import { formatStoredResultDate } from "./format-stored-result-date";
import { renderResultCanvas } from "./render-result-canvas";
import type { ResultView } from "./types";

interface SaveResultImageOptions {
  record: StoredResultRecord;
  view: ResultView;
}

const createResultFileName = (createdAt: string, view: ResultView): string => {
  const savedDate = createdAt.slice(0, 10);
  return `bfi-2-j-${view}-${savedDate}.png`;
};

const canvasToBlob = async (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create PNG blob"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });

const downloadBlob = (blob: Blob, filename: string) => {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(blobUrl);
};

export const saveResultImage = async ({
  record,
  view,
}: SaveResultImageOptions) => {
  const canvas = renderResultCanvas({
    dateLabel: formatStoredResultDate(record.createdAt),
    result: record.result,
    view,
  });
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, createResultFileName(record.createdAt, view));
};
