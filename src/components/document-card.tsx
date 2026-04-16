import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queueStatusLabels } from "@/lib/sample-data";
import type { Document, DocumentStatus } from "@/lib/types";

const statusOrder: DocumentStatus[] = [
  "inbox",
  "skimmed",
  "highlighted",
  "extracted",
  "linked",
  "archived",
];

export function DocumentCard({
  document,
  onMoveStatus,
  onDelete,
}: {
  document: Document;
  onMoveStatus: (documentId: string, status: DocumentStatus) => void;
  onDelete: (documentId: string) => void;
}) {
  return (
    <Card className="border-border bg-white">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{document.title}</p>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">
            {queueStatusLabels[document.status]}
          </span>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{document.summaryLine}</p>
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
        <Button variant="secondary" size="sm" className="w-full" onClick={() => onDelete(document.id)}>
          문서 삭제
        </Button>
      </CardContent>
    </Card>
  );
}
