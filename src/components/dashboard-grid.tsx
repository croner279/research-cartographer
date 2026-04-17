import Link from "next/link";

import { QuestionCard } from "@/components/question-card";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { TopicCard } from "@/components/topic-card";
import { WaveCard } from "@/components/wave-card";
import { queueStatusLabels } from "@/lib/sample-data";
import type { DashboardData } from "@/lib/types";

export function DashboardGrid({ dashboard }: { dashboard: DashboardData }) {
  const queueCounts = dashboard.queueColumns
    .map((column) => ({
      label: queueStatusLabels[column.label],
      count: column.documents.length,
    }))
    .filter((item) => item.label !== queueStatusLabels.archived);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Emerging Radar"
            title="새로 떠오르는 구조"
            description="반복적으로 보이기 시작한 개념만 먼저 올려 두고, 이후 evidence와 Wave로 연결합니다."
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {dashboard.topics.slice(0, 6).map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Active Waves"
            title="활성 Wave"
            description="지금 어떤 구조가 어느 단계에 있고, 병목과 가치 포착이 어디서 생기는지 빠르게 봅니다."
          />
          <div className="grid gap-4">
            {dashboard.waves.map((wave) => (
              <WaveCard key={wave.id} wave={wave} />
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <SectionCard title="리서치 큐">
          <div className="grid gap-3">
            {queueCounts.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-mono text-sm text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
          <Link
            href="/queue"
            className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
          >
            전체 큐 보기
          </Link>
        </SectionCard>

        <SectionCard title="열린 질문">
          <div className="space-y-4">
            {dashboard.questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
