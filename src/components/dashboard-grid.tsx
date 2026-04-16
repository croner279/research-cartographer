import Link from "next/link";

import { QuestionCard } from "@/components/question-card";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { TopicCard } from "@/components/topic-card";
import { WaveCard } from "@/components/wave-card";
import type { DashboardData } from "@/lib/types";

export function DashboardGrid({ dashboard }: { dashboard: DashboardData }) {
  const queueCounts = dashboard.queueColumns.map((column) => ({
    label: column.label,
    count: column.documents.length,
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Emerging Radar"
            title="새로 떠오르는 구조"
            description="익숙하지 않지만 반복해서 보이는 개념을 빠르게 포착합니다."
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {dashboard.topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            eyebrow="Active Waves"
            title="활성 Wave"
            description="각 wave가 어느 stage에 있는지, 어디서 value capture가 발생할지 관리합니다."
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
            큐 전체 보기
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
