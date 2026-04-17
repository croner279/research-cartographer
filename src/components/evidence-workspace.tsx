"use client";

import { useMemo, useState } from "react";

import { EvidenceCard } from "@/components/evidence-card";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";
import type { EvidenceReviewStatus, EvidenceWhyTag } from "@/lib/types";

const whyTags: EvidenceWhyTag[] = [
  "bottleneck",
  "new demand",
  "value chain shift",
  "overlooked detail",
  "tone change",
  "structure hint",
];

const reviewStatuses: Array<{ value: EvidenceReviewStatus; label: string }> = [
  { value: "pending", label: "검토 대기" },
  { value: "approved", label: "승인됨" },
  { value: "rejected", label: "제외됨" },
];

export function EvidenceWorkspace() {
  const { dashboard, addEvidenceItem } = useWorkspace();
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [reviewFilter, setReviewFilter] = useState<EvidenceReviewStatus>("pending");
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");
  const [note, setNote] = useState("");
  const [whyTag, setWhyTag] = useState<EvidenceWhyTag>("structure hint");

  const effectiveDocumentId = selectedDocumentId || dashboard.documents[0]?.id || "";
  const selectedDocument = useMemo(
    () => dashboard.documents.find((document) => document.id === effectiveDocumentId) ?? dashboard.documents[0],
    [dashboard.documents, effectiveDocumentId],
  );

  const evidenceItems = useMemo(
    () =>
      dashboard.evidenceItems.filter(
        (item) =>
          item.documentId === selectedDocument?.id &&
          item.reviewStatus === reviewFilter,
      ),
    [dashboard.evidenceItems, reviewFilter, selectedDocument?.id],
  );

  const relatedChunks = useMemo(
    () =>
      dashboard.documentChunks
        .filter((chunk) => chunk.documentId === selectedDocument?.id)
        .slice(0, 4),
    [dashboard.documentChunks, selectedDocument?.id],
  );

  const latestRun = useMemo(
    () =>
      dashboard.analysisRuns.find((run) => run.id === selectedDocument?.lastAnalysisRunId),
    [dashboard.analysisRuns, selectedDocument?.lastAnalysisRunId],
  );

  function handleAddEvidence() {
    if (!selectedDocument || !title.trim() || !snippet.trim()) {
      return;
    }

    addEvidenceItem({
      documentId: selectedDocument.id,
      title,
      snippet,
      note,
      whyTag,
    });
    setTitle("");
    setSnippet("");
    setNote("");
    setWhyTag("structure hint");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Evidence Workspace"
        title="추출 evidence 검토"
        description="엔진이 잡아낸 후보를 먼저 검토하고, 승인된 evidence만 topic과 wave 해석에 반영합니다."
      />

      <div className="grid gap-6 xl:grid-cols-[0.32fr_0.68fr]">
        <SectionCard title="문서 목록">
          <div className="space-y-3">
            {dashboard.documents.map((document) => {
              const pendingCount = dashboard.evidenceItems.filter(
                (item) => item.documentId === document.id && item.reviewStatus === "pending",
              ).length;

              return (
                <button
                  key={document.id}
                  onClick={() => setSelectedDocumentId(document.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left ${
                    document.id === selectedDocument?.id
                      ? "border-foreground bg-white"
                      : "border-border bg-white/60"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{document.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{document.summaryLine}</p>
                  <p className="mt-2 text-xs text-muted-foreground">검토 대기 evidence {pendingCount}</p>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title={selectedDocument?.title ?? "문서 선택"}>
            <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
              <div className="rounded-[24px] border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">원문</p>
                <Textarea
                  readOnly
                  value={selectedDocument?.rawText ?? ""}
                  className="mt-4 min-h-[320px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-border bg-white p-5">
                  <p className="text-sm font-medium text-foreground">최근 분석 런</p>
                  {latestRun ? (
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p>chunk {latestRun.chunkCount}</p>
                      <p>candidate evidence {latestRun.evidenceCandidateCount}</p>
                      <p>topic draft {latestRun.topicDraftCount}</p>
                      <p className="leading-6">{latestRun.notes}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">아직 분석을 실행하지 않았습니다.</p>
                  )}
                </div>

                <div className="rounded-[24px] border border-border bg-white p-5">
                  <p className="text-sm font-medium text-foreground">대표 chunk</p>
                  <div className="mt-3 space-y-3">
                    {relatedChunks.length ? (
                      relatedChunks.map((chunk) => (
                        <div key={chunk.id} className="rounded-2xl border border-border bg-panel px-4 py-3">
                          <p className="text-xs text-muted-foreground">chunk {chunk.order + 1}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{chunk.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">생성된 chunk가 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="검토 대기 evidence">
            <div className="mb-4 flex flex-wrap gap-2">
              {reviewStatuses.map((status) => (
                <Button
                  key={status.value}
                  variant={reviewFilter === status.value ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setReviewFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {evidenceItems.length ? (
                evidenceItems.map((item) => (
                  <EvidenceCard key={item.id} item={item} showReviewActions />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-6 text-sm text-muted-foreground">
                  해당 상태의 evidence가 없습니다.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="수동 evidence 추가">
            <div className="space-y-3">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="evidence 제목" />
              <Textarea
                value={snippet}
                onChange={(event) => setSnippet(event.target.value)}
                placeholder="핵심 snippet"
                className="min-h-24"
              />
              <div className="grid gap-3 xl:grid-cols-[0.45fr_1fr]">
                <select
                  value={whyTag}
                  onChange={(event) => setWhyTag(event.target.value as EvidenceWhyTag)}
                  className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
                >
                  {whyTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="메모" />
              </div>
              <Button onClick={handleAddEvidence}>evidence 추가</Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
