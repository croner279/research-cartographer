"use client";

import { notFound } from "next/navigation";

import { EvidenceCard } from "@/components/evidence-card";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { StageBadge } from "@/components/stage-badge";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace-provider";
import type { WaveStage } from "@/lib/types";

const waveStages: WaveStage[] = [
  "early",
  "accelerating",
  "crowded",
  "uncertain",
  "restructuring",
];

export function WaveDetailView({ slug }: { slug: string }) {
  const { dashboard, detachTopicFromWave, updateWaveStage, deleteWave } = useWorkspace();
  const wave = dashboard.waves.find((item) => item.slug === slug);

  if (!wave) {
    notFound();
  }

  const relatedTopics = dashboard.topics.filter((topic) => topic.parentWaveId === wave.id);
  const relatedCompanies = dashboard.companies.filter((company) => wave.companyIds.includes(company.id));
  const relatedEvidence = dashboard.evidenceItems.filter((item) => wave.evidenceIds.includes(item.id));
  const relatedQuestions = dashboard.questions.filter((question) => question.waveId === wave.id);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Wave Detail"
        title={wave.title}
        description={wave.thesis}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={wave.stage}
              onChange={(event) => updateWaveStage(wave.id, event.target.value as WaveStage)}
              className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
            >
              {waveStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <StageBadge value={wave.stage} />
            <Button variant="secondary" onClick={() => deleteWave(wave.id)}>
              Wave 삭제
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SectionCard title="핵심 병목">
            <ul className="space-y-3 text-sm text-muted-foreground">
              {wave.keyBottlenecks.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="가치 포착 레이어">
            <div className="flex flex-wrap gap-2">
              {wave.valueCaptureLayers.map((layer) => (
                <span
                  key={layer}
                  className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground"
                >
                  {layer}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Evidence Board">
            <div className="space-y-4">
              {relatedEvidence.map((item) => (
                <EvidenceCard key={item.id} item={item} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="나의 최신 해석">
            <p className="text-sm leading-7 text-muted-foreground">{wave.latestInterpretation}</p>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="연결된 Emerging Topic">
            <div className="space-y-3">
              {relatedTopics.map((topic) => (
                <div key={topic.id} className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{topic.name}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {topic.oneLiner}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => detachTopicFromWave(topic.id)}
                    >
                      이 topic 제거
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="관련 기업">
            <div className="space-y-3">
              {relatedCompanies.map((company) => (
                <div key={company.id} className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{company.name}</p>
                    <span className="font-mono text-xs text-muted-foreground">{company.ticker}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {company.roleDescription}
                  </p>
                </div>
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
