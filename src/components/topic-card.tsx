import Link from "next/link";

import { MetricPill } from "@/components/metric-pill";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPageNumbers } from "@/lib/page-utils";
import { useWorkspace } from "@/components/workspace-provider";
import type { EmergingTopic } from "@/lib/types";

export function TopicCard({ topic }: { topic: EmergingTopic }) {
  const { deleteTopic, promoteTopicToWave, setTopicReviewStatus } = useWorkspace();

  return (
    <Card className="border-border bg-panel shadow-card">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2">
              <StatusBadge kind="topic" value={topic.maturityStatus} />
              <StatusBadge kind="review" value={topic.reviewStatus} />
            </div>
            <CardTitle className="text-lg leading-snug">{topic.name}</CardTitle>
            <p className="text-sm leading-6 text-foreground">{topic.oneLiner}</p>
          </div>
          <div className="flex shrink-0 gap-2 self-start">
            <Button variant="secondary" size="sm" className="px-2.5 text-xs" asChild>
              <Link href={`/topics/${topic.slug}`}>보기</Link>
            </Button>
            <Button variant="secondary" size="sm" className="px-2.5 text-xs" onClick={() => deleteTopic(topic.id)}>
              삭제
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-border bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Why It Matters</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{topic.whyItMatters}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricPill label="반복 언급" value={`${topic.recentMentions}회`} />
          <MetricPill label="연결 evidence" value={`${topic.evidenceIds.length}개`} />
        </div>
        {topic.sourcePages.length ? (
          <p className="text-xs text-muted-foreground">source pages · {formatPageNumbers(topic.sourcePages)}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {topic.reviewStatus !== "active" ? (
            <Button variant="secondary" size="sm" onClick={() => setTopicReviewStatus(topic.id, "active")}>
              draft 승인
            </Button>
          ) : null}
          <Button size="sm" onClick={() => promoteTopicToWave(topic.id)}>
            Wave로 승격
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
