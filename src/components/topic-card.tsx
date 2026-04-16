import Link from "next/link";

import { MetricPill } from "@/components/metric-pill";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/components/workspace-provider";
import type { EmergingTopic } from "@/lib/types";

export function TopicCard({ topic }: { topic: EmergingTopic }) {
  const { deleteTopic } = useWorkspace();

  return (
    <Card className="border-border bg-panel shadow-card">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <StatusBadge kind="topic" value={topic.maturityStatus} />
            <CardTitle className="text-xl">{topic.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/topics/${topic.slug}`}>이게 뭐지?</Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => deleteTopic(topic.id)}>
              삭제
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-muted-foreground">{topic.whyItMatters}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricPill label="최근 언급" value={`${topic.recentMentions}회`} />
          <MetricPill label="연결 문서" value={`${topic.linkedDocumentsCount}개`} />
        </div>
      </CardContent>
    </Card>
  );
}
