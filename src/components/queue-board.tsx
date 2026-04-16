import { DocumentCard } from "@/components/document-card";
import { queueStatusLabels } from "@/lib/sample-data";
import type { Document, DocumentStatus } from "@/lib/types";

const columns: DocumentStatus[] = [
  "inbox",
  "skimmed",
  "highlighted",
  "extracted",
  "linked",
  "archived",
];

export function QueueBoard({
  documents,
  onMoveStatus,
  onDelete,
}: {
  documents: Document[];
  onMoveStatus: (documentId: string, status: DocumentStatus) => void;
  onDelete: (documentId: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
      {columns.map((status) => {
        const items = documents.filter((document) => document.status === status);
        return (
          <section
            key={status}
            className="rounded-[28px] border border-border bg-panel p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">{queueStatusLabels[status]}</h2>
              <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="mt-4 space-y-3">
              {items.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onMoveStatus={onMoveStatus}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
