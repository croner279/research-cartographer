"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPageNumbers } from "@/lib/page-utils";
import { queueStatusLabels } from "@/lib/sample-data";
import type { Document, DocumentStatus } from "@/lib/types";
import { useWorkspace } from "@/components/workspace-provider";

const statusOrder: DocumentStatus[] = [
  "inbox",
  "skimmed",
  "highlighted",
  "extracted",
  "linked",
  "archived",
];

type DocumentCardDensity = "comfortable" | "compact";

function getExtractionLabel(document: Document) {
  if (document.extractionState === "extracting") return "PDF 추출 중";
  if (document.extractionState === "failed") return "추출 실패";
  if (document.extractionState === "completed") return `추출 완료 · ${document.pageCount}p`;
  return document.intakeMethod === "pdf" ? "추출 대기" : "텍스트 입력";
}

export function DocumentCard({
  document,
  onMoveStatus,
  onDelete,
  onAnalyze,
  density = "comfortable",
}: {
  document: Document;
  onMoveStatus: (documentId: string, status: DocumentStatus) => void;
  onDelete: (documentId: string) => void;
  onAnalyze: (documentId: string) => void;
  density?: DocumentCardDensity;
}) {
  const { dashboard, updateDocumentLinks } = useWorkspace();
  const linkedTopic = dashboard.topics.find((topic) => topic.id === document.topicId);
  const linkedWave = dashboard.waves.find((wave) => wave.id === document.waveId);
  const pendingEvidence = dashboard.evidenceItems.filter(
    (item) => item.documentId === document.id && item.reviewStatus === "pending",
  );
  const topicDraftCount = dashboard.topics.filter(
    (topic) =>
      topic.lastAnalysisRunId === document.lastAnalysisRunId && topic.reviewStatus === "draft",
  ).length;
  const compact = density === "compact";
  const pendingPages = [...new Set(pendingEvidence.flatMap((item) => item.sourcePages))];
  const canAnalyze = document.extractionState === "completed" && document.rawText.trim().length > 0;

  return (
    <Card className="border-border bg-white">
      <CardContent className={compact ? "space-y-2 p-3" : "space-y-3 p-4"}>
        <div className="space-y-1">
          <p className={`${compact ? "line-clamp-1 text-[13px]" : "line-clamp-2 text-sm"} font-medium text-foreground`}>
            {document.title}
          </p>
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="truncate">{document.source || "직접 입력"}</span>
            <span>{document.publishedAt}</span>
          </div>
        </div>

        <p className={`${compact ? "line-clamp-2 text-[12px] leading-5" : "line-clamp-3 text-sm leading-6"} text-muted-foreground`}>
          {document.summaryLine}
        </p>

        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full border border-border px-2 py-1">{getExtractionLabel(document)}</span>
          <span className="rounded-full border border-border px-2 py-1">
            분석 상태: {document.analysisState === "completed" ? "완료" : "미실행"}
          </span>
          {pendingEvidence.length ? (
            <span className="rounded-full border border-border px-2 py-1">
              검토 대기 evidence {pendingEvidence.length}
            </span>
          ) : null}
          {pendingPages.length ? (
            <span className="rounded-full border border-border px-2 py-1">
              {formatPageNumbers(pendingPages)}
            </span>
          ) : null}
          {topicDraftCount ? (
            <span className="rounded-full border border-border px-2 py-1">topic draft {topicDraftCount}</span>
          ) : null}
        </div>

        {document.extractionError ? (
          <p className="text-xs text-rose-600">{document.extractionError}</p>
        ) : null}

        {linkedWave || linkedTopic ? (
          <div className="flex flex-wrap gap-2">
            {linkedWave ? (
              <span className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground">
                Wave · {linkedWave.title}
              </span>
            ) : null}
            {linkedTopic ? (
              <span className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground">
                Topic · {linkedTopic.name}
              </span>
            ) : null}
          </div>
        ) : null}

        <select
          value={document.status}
          onChange={(event) => onMoveStatus(document.id, event.target.value as DocumentStatus)}
          className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none"
        >
          {statusOrder.map((status) => (
            <option key={status} value={status}>
              {queueStatusLabels[status]}
            </option>
          ))}
        </select>

        <div className="grid gap-2">
          <select
            value={document.waveId}
            onChange={(event) => updateDocumentLinks(document.id, { waveId: event.target.value })}
            className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none"
          >
            <option value="">관련 Wave 선택</option>
            {dashboard.waves.map((wave) => (
              <option key={wave.id} value={wave.id}>
                {wave.title}
              </option>
            ))}
          </select>
          <select
            value={document.topicId}
            onChange={(event) => updateDocumentLinks(document.id, { topicId: event.target.value })}
            className="h-9 w-full rounded-xl border border-border bg-white px-3 text-xs outline-none"
          >
            <option value="">관련 Topic 선택</option>
            {dashboard.topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
          <Button variant="secondary" size="sm" onClick={() => onAnalyze(document.id)} disabled={!canAnalyze}>
            분석 실행
          </Button>
          {!compact ? (
            <Button variant="secondary" size="sm" onClick={() => onDelete(document.id)}>
              문서 삭제
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
