"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DocumentIntakeForm } from "@/components/document-intake-form";
import { QueueBoard } from "@/components/queue-board";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace-provider";

export function QueueView() {
  const { dashboard, moveDocumentStatus, deleteDocument, runAnalysisForDocument } = useWorkspace();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const activeDocuments = useMemo(
    () => dashboard.documents.filter((document) => document.status !== "archived"),
    [dashboard.documents],
  );

  const archivedCount = dashboard.documents.filter((document) => document.status === "archived").length;
  const analyzableCount = activeDocuments.filter((document) => document.rawText.trim()).length;
  const pendingEvidenceCount = dashboard.evidenceItems.filter((item) => item.reviewStatus === "pending").length;

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = activeDocuments.filter((document) =>
      [document.title, document.source, document.summaryLine, document.rawText]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery || ""),
    );

    return [...base].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "analysis") return a.analysisState.localeCompare(b.analysisState);
      return b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [activeDocuments, query, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Research Queue"
        title="처리 중인 리서치 큐"
        description="문서를 넣고 분석 후보를 만든 뒤, 승인할 evidence만 남겨 다음 구조로 연결합니다."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              activeDocuments.forEach((document) => {
                if (document.rawText.trim()) {
                  runAnalysisForDocument(document.id);
                }
              });
            }}
          >
            전체 분석 실행
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[24px] border border-border bg-white px-5 py-4">
          <p className="text-sm font-medium text-foreground">분석 가능한 문서</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{analyzableCount}</p>
        </div>
        <div className="rounded-[24px] border border-border bg-white px-5 py-4">
          <p className="text-sm font-medium text-foreground">검토 대기 evidence</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{pendingEvidenceCount}</p>
        </div>
        <div className="flex items-center justify-between rounded-[24px] border border-border bg-white px-5 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">Archive 분리</p>
            <p className="mt-1 text-sm text-muted-foreground">보관 문서 {archivedCount}개는 Archive에서 관리합니다.</p>
          </div>
          <Link
            href="/archive"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
          >
            Archive 보기
          </Link>
        </div>
      </div>

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="문서 제목, 출처, 요약, 본문 검색"
        secondary={
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
          >
            <option value="newest">최신순</option>
            <option value="title">제목순</option>
            <option value="analysis">분석 상태순</option>
          </select>
        }
      />
      <DocumentIntakeForm />
      <QueueBoard
        documents={filteredDocuments}
        onMoveStatus={moveDocumentStatus}
        onDelete={deleteDocument}
        onAnalyze={runAnalysisForDocument}
      />
    </div>
  );
}
