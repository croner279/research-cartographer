"use client";

import { useState } from "react";

import { DocumentCard } from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { queueStatusLabels } from "@/lib/sample-data";
import type { Document, DocumentStatus } from "@/lib/types";

const columns: DocumentStatus[] = ["inbox", "skimmed", "highlighted", "extracted", "linked"];

const columnConfig: Record<DocumentStatus, { visibleCount: number; density: "comfortable" | "compact" }> = {
  inbox: { visibleCount: 4, density: "comfortable" },
  skimmed: { visibleCount: 4, density: "comfortable" },
  highlighted: { visibleCount: 5, density: "compact" },
  extracted: { visibleCount: 5, density: "compact" },
  linked: { visibleCount: 6, density: "compact" },
  archived: { visibleCount: 6, density: "compact" },
};

export function QueueBoard({
  documents,
  onMoveStatus,
  onDelete,
  onAnalyze,
}: {
  documents: Document[];
  onMoveStatus: (documentId: string, status: DocumentStatus) => void;
  onDelete: (documentId: string) => void;
  onAnalyze: (documentId: string) => void;
}) {
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({});

  function toggleColumn(status: DocumentStatus) {
    setExpandedColumns((current) => ({
      ...current,
      [status]: !current[status],
    }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-5">
      {columns.map((status) => {
        const items = documents.filter((document) => document.status === status);
        const expanded = expandedColumns[status] ?? false;
        const { visibleCount, density } = columnConfig[status];
        const visibleItems = expanded ? items : items.slice(0, visibleCount);
        const hiddenCount = Math.max(items.length - visibleCount, 0);

        return (
          <section key={status} className="rounded-[28px] border border-border bg-panel p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">{queueStatusLabels[status]}</h2>
              <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {visibleItems.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onMoveStatus={onMoveStatus}
                  onDelete={onDelete}
                  onAnalyze={onAnalyze}
                  density={density}
                />
              ))}
            </div>

            {hiddenCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full justify-center border border-dashed border-border bg-white/70 text-xs"
                onClick={() => toggleColumn(status)}
              >
                {expanded ? "접기" : `${hiddenCount}개 더 보기`}
              </Button>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
