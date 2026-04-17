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
import { formatPageNumbers } from "@/lib/page-utils";
import { useWorkspace } from "@/components/workspace-provider";
import type { TopicMaturity, TopicReviewStatus } from "@/lib/types";

const topicStatuses: TopicMaturity[] = ["unknown", "interesting", "emerging", "promoted"];
const reviewStatuses: TopicReviewStatus[] = ["draft", "active", "dismissed"];

export function TopicDetailView({ slug }: { slug: string }) {
  const {
    dashboard,
    setTopicStatus,
    setTopicReviewStatus,
    promoteTopicToWave,
    detachTopicFromWave,
  } = useWorkspace();
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
  const relatedDocuments = dashboard.documents.filter(
    (document) =>
      document.topicId === topic.id ||
      topic.evidenceIds.some(
        (evidenceId) =>
          dashboard.evidenceItems.find((item) => item.id === evidenceId)?.documentId === document.id,
      ),
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Topic Draft"
        title={topic.name}
        description="반복 개념이 왜 중요한지, 어떤 evidence와 페이지에서 잡혔는지, 어떤 Wave로 이어질 수 있는지 검토합니다."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={topic.maturityStatus}
              onChange={(event) => setTopicStatus(topic.id, event.target.value as TopicMaturity)}
              className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
            >
              {topicStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={topic.reviewStatus}
              onChange={(event) => setTopicReviewStatus(topic.id, event.target.value as TopicReviewStatus)}
              className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
            >
              {reviewStatuses.map((status) => (
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
                <div className="flex flex-wrap gap-2">
                  <StatusBadge kind="topic" value={topic.maturityStatus} />
                  <StatusBadge kind="review" value={topic.reviewStatus} />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">{topic.oneLiner}</h2>
                <p className="text-sm leading-7 text-muted-foreground">{topic.whyItMatters}</p>
              </div>
              <div className="grid gap-2">
                <MetricPill label="반복 언급" value={`${topic.recentMentions}회`} />
                <MetricPill label="연결 문서" value={`${topic.linkedDocumentsCount}개`} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="왜 지금 보이는가">
            <p className="text-sm leading-7 text-muted-foreground">{topic.whyNow}</p>
          </SectionCard>

          <SectionCard title="열린 질문">
            <div className="space-y-2">
              {topic.openQuestions.length ? (
                topic.openQuestions.map((question) => (
                  <div
                    key={question}
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground"
                  >
                    {question}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">아직 열린 질문이 없습니다.</p>
              )}
            </div>
          </SectionCard>

          {topic.sourcePages.length ? (
            <SectionCard title="Source Pages">
              <p className="text-sm text-muted-foreground">{formatPageNumbers(topic.sourcePages)}</p>
            </SectionCard>
          ) : null}

          <TopicEditForm topic={topic} />

          <SectionCard title="관련 문서">
            <div className="space-y-3">
              {relatedDocuments.length ? (
                relatedDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{document.title}</p>
                      <span className="text-xs text-muted-foreground">{document.source}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{document.summaryLine}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">아직 이 topic에 연결된 문서가 없습니다.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="관련 evidence">
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
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>아직 연결된 Wave는 없습니다.</p>
                <p>엔진 힌트: {topic.parentWaveHint || "미지정"}</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="관련 기업">
            <div className="flex flex-wrap gap-2">
              {relatedCompanies.length ? (
                relatedCompanies.map((company) => (
                  <span
                    key={company.id}
                    className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground"
                  >
                    {company.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">아직 연결된 기업이 없습니다.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="연결된 질문">
            <div className="space-y-3">
              {relatedQuestions.length ? (
                relatedQuestions.map((question) => (
                  <div key={question.id} className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-sm font-medium text-foreground">{question.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{question.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">아직 연결된 질문이 없습니다.</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
