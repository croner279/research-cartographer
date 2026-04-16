import { TagBadge } from "@/components/tag-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/components/workspace-provider";
import type { EvidenceItem } from "@/lib/types";

export function EvidenceCard({ item }: { item: EvidenceItem }) {
  const { deleteEvidence } = useWorkspace();

  return (
    <Card className="border-border bg-white">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <div className="flex items-center gap-2">
            <TagBadge value={item.whyTag} />
            <Button variant="secondary" size="sm" onClick={() => deleteEvidence(item.id)}>
              삭제
            </Button>
          </div>
        </div>
        <p className="text-sm leading-7 text-muted-foreground">{item.snippet}</p>
        {item.note ? <p className="text-xs text-muted-foreground">노트: {item.note}</p> : null}
      </CardContent>
    </Card>
  );
}
