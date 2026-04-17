import { TagBadge } from "@/components/tag-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { evidenceReviewLabels } from "@/lib/sample-data";
import type { EvidenceItem } from "@/lib/types";
import { useWorkspace } from "@/components/workspace-provider";

export function EvidenceCard({
  item,
  showReviewActions = false,
}: {
  item: EvidenceItem;
  showReviewActions?: boolean;
}) {
  const { deleteEvidence, approveEvidenceItem, updateEvidenceReviewStatus } = useWorkspace();

  return (
    <Card className="border-border bg-white">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <div className="flex flex-wrap gap-2">
              <TagBadge value={item.whyTag} />
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {evidenceReviewLabels[item.reviewStatus]}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                신뢰도 {item.confidence}
              </span>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => deleteEvidence(item.id)}>
            삭제
          </Button>
        </div>

        <p className="text-sm leading-7 text-muted-foreground">{item.snippet}</p>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.companyMentions.map((company) => (
            <span key={company} className="rounded-full border border-border px-3 py-1">
              기업 · {company}
            </span>
          ))}
          {item.candidateTopicNames.map((topic) => (
            <span key={topic} className="rounded-full border border-border px-3 py-1">
              topic · {topic}
            </span>
          ))}
          {item.parentWaveHint && item.parentWaveHint !== "미지정" ? (
            <span className="rounded-full border border-border px-3 py-1">
              wave hint · {item.parentWaveHint}
            </span>
          ) : null}
        </div>

        {item.note ? <p className="text-xs text-muted-foreground">메모: {item.note}</p> : null}

        {showReviewActions ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => approveEvidenceItem(item.id)}>
              승인
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateEvidenceReviewStatus(item.id, "rejected")}
            >
              제외
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateEvidenceReviewStatus(item.id, "pending")}
            >
              다시 보류
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
