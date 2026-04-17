"use client";

import { useMemo, useState } from "react";

import { DocumentCard } from "@/components/document-card";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { SectionHeader } from "@/components/section-header";
import { useWorkspace } from "@/components/workspace-provider";

export function ArchiveView() {
  const { dashboard, moveDocumentStatus, deleteDocument } = useWorkspace();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const archivedDocuments = useMemo(
    () => dashboard.documents.filter((document) => document.status === "archived"),
    [dashboard.documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = archivedDocuments.filter((document) =>
      [document.title, document.source, document.summaryLine, document.rawText]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery || ""),
    );

    return [...base].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.publishedAt.localeCompare(a.publishedAt);
    });
  }, [archivedDocuments, query, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Archive"
        title="보관 문서"
        description="처리를 마친 문서는 큐에서 빼고 여기서 따로 검색하고 관리합니다."
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="보관 문서 제목, 출처, 요약, 원문 검색"
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

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onMoveStatus={moveDocumentStatus}
            onDelete={deleteDocument}
          />
        ))}
      </div>
    </div>
  );
}
