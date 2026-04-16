"use client";

import { useMemo, useState } from "react";

import { DocumentIntakeForm } from "@/components/document-intake-form";
import { QueueBoard } from "@/components/queue-board";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { SectionHeader } from "@/components/section-header";
import { useWorkspace } from "@/components/workspace-provider";

export function QueueView() {
  const { dashboard, moveDocumentStatus, deleteDocument } = useWorkspace();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = dashboard.documents.filter((document) =>
      [document.title, document.source, document.summaryLine, document.rawText]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery || ""),
    );

    return [...base].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [dashboard.documents, query, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Research Queue"
        title="리서치 큐"
        description="업로드는 했지만 아직 읽지 않았거나, 읽었지만 구조에 연결하지 못한 문서를 상태별로 정리합니다."
      />
      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="문서 제목, 출처, 요약, 원문 검색"
        secondary={
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
          >
            <option value="newest">최신순</option>
            <option value="title">제목순</option>
          </select>
        }
      />
      <DocumentIntakeForm />
      <QueueBoard
        documents={filteredDocuments}
        onMoveStatus={moveDocumentStatus}
        onDelete={deleteDocument}
      />
    </div>
  );
}
