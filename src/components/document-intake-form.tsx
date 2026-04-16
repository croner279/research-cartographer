"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";

export function DocumentIntakeForm() {
  const { addDocument } = useWorkspace();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [documentType, setDocumentType] = useState("note");
  const [summaryLine, setSummaryLine] = useState("");
  const [rawText, setRawText] = useState("");
  const [publishedAt, setPublishedAt] = useState("");

  function handleSubmit() {
    if (!title.trim() || !summaryLine.trim() || !rawText.trim()) {
      return;
    }

    addDocument({
      title,
      source,
      documentType,
      summaryLine,
      rawText,
      publishedAt,
    });

    setTitle("");
    setSource("");
    setDocumentType("note");
    setSummaryLine("");
    setRawText("");
    setPublishedAt("");
  }

  return (
    <div className="rounded-[28px] border border-border bg-panel p-5 shadow-card">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">새 문서 추가</p>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF 자동 요약 대신, 우선 note / transcript / report를 직접 넣고 큐에서 구조화합니다.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="문서 제목" />
        <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="출처" />
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
        >
          <option value="note">note</option>
          <option value="report">report</option>
          <option value="deck">deck</option>
          <option value="memo">memo</option>
          <option value="transcript">transcript</option>
        </select>
        <Input
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          placeholder="발행일"
        />
      </div>

      <div className="mt-3 space-y-3">
        <Input
          value={summaryLine}
          onChange={(e) => setSummaryLine(e.target.value)}
          placeholder="한 줄 요약"
        />
        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="문서 내용 또는 메모 원문"
          className="min-h-40"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit}>큐에 추가</Button>
      </div>
    </div>
  );
}
