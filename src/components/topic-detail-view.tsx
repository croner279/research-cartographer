"use client";

import { notFound } from "next/navigation";

import { EvidenceCard } from "@/components/evidence-card";
import { MetricPill } from "@/components/metric-pill";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { TopicEditForm } from "@/components/topic-edit-form";
import { TopicEvidenceLinker } from "@/components/topic-evidence-linker";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace-provider";
import type { TopicMaturity } from "@/lib/types";

const topicStatuses: TopicMaturity[] = ["unknown", "interesting", "emerging", "promoted"];

export function TopicDetailView({ slug }: { slug: string }) {
  const { dashboard, setTopicStatus, promoteTopicToWave, detachTopicFromWave } = useWorkspace();
  const topic = dashboard.topics.find((item) => item.slug === slug);

  if (!topic) {
    notFound();
  }

  const relatedWave = dashboard.waves.find((wave) => wave.id === topic.parentWaveId);
  const evidenceItems = dashboard.evidenceItems.filter((item) => topic.evidenceIds.includes(item.id));
  const relatedCompanies = dashboard.companies.filter((company) => topic.companyIds.includes(company.id));
  const relatedQuestions = dashboard.questions.filter((question) =>
    topic.questionIds.includes(question.id),
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Topic Draft"
        title={topic.name}
        description="새로 발견된 구조의 초안 맵. 왜 보이기 시작했는지, 어디에 연결되는지, 무엇을 더 확인해야 하는지를 빠르게 정리합니다."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={topic.maturityStatus}
              onChange={(event) =>
                setTopicStatus(topic.id, event.target.value as TopicMaturity)
              }
              className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
            >
              {topicStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {topic.parentWaveId ? (
              <Button variant="secondary" onClick={() => detachTopicFromWave(topic.id)}>
                Wave 연결 해제
              </Button>
            ) : null}
            <Button onClick={() => promoteTopicToWave(topic.id)}>Wave로 승격</Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <StatusBadge kind="topic" value={topic.maturityStatus} />
                <h2 className="text-2xl font-semibold text-foreground">{topic.oneLiner}</h2>
                <p className="text-sm leading-7 text-muted-foreground">{topic.whyItMatters}</p>
              </div>
              <div className="grid gap-2">
                <MetricPill label="최근 언급" value={`${topic.recentMentions}회`} />
                <MetricPill label="연결 문서" value={`${topic.linkedDocumentsCount}개`} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="왜 지금 보이는가">
            <p className="text-sm leading-7 text-muted-foreground">{topic.whyNow}</p>
          </SectionCard>

          <TopicEditForm topic={topic} />

          <SectionCard title="관련 증거">
            <div className="space-y-4">
              <TopicEvidenceLinker topicId={topic.id} linkedEvidenceIds={topic.evidenceIds} />
              {evidenceItems.map((item) => (
                <EvidenceCard key={item.id} item={item} />
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="상위 Wave 후보">
            {relatedWave ? (
              <>
                <p className="text-sm font-medium text-foreground">{relatedWave.title}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{relatedWave.thesis}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                아직 연결된 wave가 없습니다. 구조가 더 선명해지면 승격하거나 다시 연결하세요.
              </p>
            )}
          </SectionCard>

          <SectionCard title="관련 기업">
            <div className="flex flex-wrap gap-2">
              {relatedCompanies.map((company) => (
                <span
                  key={company.id}
                  className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground"
                >
                  {company.name}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="열린 질문">
            <div className="space-y-3">
              {relatedQuestions.map((question) => (
                <div key={question.id} className="rounded-2xl border border-border bg-white p-4">
                  <p className="text-sm font-medium text-foreground">{question.title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {question.description}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
