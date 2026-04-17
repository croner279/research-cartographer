import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

import type { DocumentPage, PageAssetPlaceholder } from "@/lib/types";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type ExtractPdfInput = {
  documentId: string;
  file: File;
};

type ExtractPdfOutput = {
  pages: DocumentPage[];
  rawText: string;
  pageCount: number;
};

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeTextItems(items: Awaited<ReturnType<Awaited<ReturnType<typeof getDocument>>["getPage"]>["getTextContent"]>["items"]) {
  let currentLineY: number | null = null;
  const parts: string[] = [];

  for (const item of items) {
    if (!("str" in item)) continue;
    const [, , , , , y] = item.transform;
    const text = item.str.trim();
    if (!text) continue;

    if (currentLineY === null) {
      currentLineY = y;
      parts.push(text);
      continue;
    }

    const deltaY = Math.abs(y - currentLineY);
    if (deltaY > 6) {
      parts.push("\n");
      currentLineY = y;
    } else if (parts.length && !parts[parts.length - 1].endsWith("\n")) {
      parts.push(" ");
    }

    parts.push(text);
  }

  return parts
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildAssetPlaceholders(documentId: string, pageNumber: number): PageAssetPlaceholder[] {
  return [
    {
      id: createId("asset"),
      documentId,
      pageNumber,
      kind: "chart",
      label: `Page ${pageNumber} chart/image/table extraction placeholder`,
      status: "pending_extraction",
    },
  ];
}

export async function extractPdfDocument({ documentId, file }: ExtractPdfInput): Promise<ExtractPdfOutput> {
  const data = await file.arrayBuffer();
  const loadingTask = getDocument({
    data,
    disableWorker: true,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  const pages: DocumentPage[] = [];
  let cursor = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = normalizeTextItems(textContent.items);
    const charStart = cursor;
    const charEnd = charStart + text.length;

    pages.push({
      id: createId("page"),
      documentId,
      pageNumber,
      text,
      charStart,
      charEnd,
      assetPlaceholders: buildAssetPlaceholders(documentId, pageNumber),
    });

    cursor = charEnd + 2;
  }

  const rawText = pages.map((page) => `[Page ${page.pageNumber}]\n${page.text}`).join("\n\n");

  return {
    pages,
    rawText,
    pageCount: pages.length,
  };
}
