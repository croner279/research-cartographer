"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";

export function DocumentIntakeForm() {
  const { addDocument, dashboard } = useWorkspace();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [documentType, setDocumentType] = useState("report");
  const [summaryLine, setSummaryLine] = useState("");
  const [rawText, setRawText] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [topicId, setTopicId] = useState("");
  const [waveId, setWaveId] = useState("");
  const [fileName, setFileName] = useState("");

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
      topicId,
      waveId,
      fileName,
      intakeMethod: fileName ? "file_stub" : "paste",
    });

    setTitle("");
    setSource("");
    setDocumentType("report");
    setSummaryLine("");
    setRawText("");
    setPublishedAt("");
    setTopicId("");
    setWaveId("");
    setFileName("");
  }

  return (
    <div className="rounded-[28px] border border-border bg-panel p-5 shadow-card">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">새 문서 추가</p>
        <p className="mt-1 text-sm text-muted-foreground">
          v1은 붙여넣은 텍스트를 먼저 분석합니다. 파일 업로드는 메타데이터 자리만 준비해 두고, 실제
          파싱은 다음 단계로 분리했습니다.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="문서 제목" />
        <Input value={source} onChange={(event) => setSource(event.target.value)} placeholder="출처" />
        <select
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
        >
          <option value="report">report</option>
          <option value="deck">deck</option>
          <option value="memo">memo</option>
          <option value="transcript">transcript</option>
          <option value="note">note</option>
        </select>
        <Input type="date" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <select
          value={waveId}
          onChange={(event) => setWaveId(event.target.value)}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
        >
          <option value="">관련 Wave 선택</option>
          {dashboard.waves.map((wave) => (
            <option key={wave.id} value={wave.id}>
              {wave.title}
            </option>
          ))}
        </select>
        <select
          value={topicId}
          onChange={(event) => setTopicId(event.target.value)}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
        >
          <option value="">관련 Topic 선택</option>
          {dashboard.topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_280px]">
        <Input
          value={summaryLine}
          onChange={(event) => setSummaryLine(event.target.value)}
          placeholder="한 줄 요약"
        />
        <label className="flex h-11 items-center rounded-2xl border border-dashed border-border bg-white px-4 text-sm text-muted-foreground">
          <span className="truncate">{fileName || "파일 업로드 자리만 준비됨"}</span>
          <input
            type="file"
            accept=".pdf,.txt,.md"
            className="sr-only"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          />
        </label>
      </div>

      <div className="mt-3 space-y-3">
        <Textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="분석할 본문 텍스트를 붙여 넣으세요"
          className="min-h-48"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit}>큐에 추가</Button>
      </div>
    </div>
  );
}
