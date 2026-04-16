"use client";

import { useMemo, useState } from "react";

import { EvidenceCard } from "@/components/evidence-card";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";
import type { EvidenceWhyTag } from "@/lib/types";

const whyTags: EvidenceWhyTag[] = [
  "bottleneck",
  "new demand",
  "value chain shift",
  "overlooked detail",
  "tone change",
  "structure hint",
];

export function EvidenceWorkspace() {
  const { dashboard, addEvidenceItem } = useWorkspace();
  const data = dashboard;
  const [selectedDocumentId, setSelectedDocumentId] = useState(data.documents[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");
  const [note, setNote] = useState("");
  const [whyTag, setWhyTag] = useState<EvidenceWhyTag>("structure hint");

  const selectedDocument = useMemo(
    () => data.documents.find((document) => document.id === selectedDocumentId) ?? data.documents[0],
    [data.documents, selectedDocumentId],
  );

  const evidenceItems = data.evidenceItems.filter((item) => item.documentId === selectedDocument?.id);

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
        title="증거 워크스페이스"
        description="문서 전체 요약이 아니라, 중요한 snippet과 why-tag를 뽑아 topic / wave / question에 연결합니다."
      />

      <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
        <SectionCard title="문서 목록">
          <div className="space-y-3">
            {data.documents.map((document) => (
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
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title={selectedDocument?.title ?? "문서"}>
            <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
              <div className="rounded-[24px] border border-border bg-white p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  원문 / 메모
                </p>
                <Textarea
                  readOnly
                  value={selectedDocument?.rawText ?? ""}
                  className="mt-4 min-h-[360px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-dashed border-border bg-white/70 p-5">
                  <p className="text-sm font-medium text-foreground">차트 / 이미지 placeholder</p>
                  <div className="mt-4 flex h-40 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e5e7eb,#f3f4f6)] text-sm text-muted-foreground">
                    차트 캡처 또는 도표 자리
                  </div>
                </div>
                <div className="rounded-[24px] border border-border bg-white p-5">
                  <p className="text-sm font-medium text-foreground">빠른 연결 대상</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic.id}
                        className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
                      >
                        {topic.name}
                      </span>
                    ))}
                    {data.waves.slice(0, 2).map((wave) => (
                      <span
                        key={wave.id}
                        className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
                      >
                        {wave.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="추출된 evidence snippet">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-border bg-white p-5">
                <p className="text-sm font-medium text-foreground">새 evidence 추가</p>
                <div className="mt-4 space-y-3">
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="evidence 제목"
                  />
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
                    <Input
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="짧은 메모"
                    />
                  </div>
                  <Button onClick={handleAddEvidence}>evidence 저장</Button>
                </div>
              </div>
              {evidenceItems.map((item) => (
                <EvidenceCard key={item.id} item={item} />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
