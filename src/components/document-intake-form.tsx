"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";

export function DocumentIntakeForm() {
  const { addDocument, ingestPdfDocument, dashboard } = useWorkspace();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [documentType, setDocumentType] = useState("report");
  const [summaryLine, setSummaryLine] = useState("");
  const [rawText, setRawText] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [topicId, setTopicId] = useState("");
  const [waveId, setWaveId] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit() {
    if (pdfFile) {
      setUploading(true);
      try {
        await ingestPdfDocument({
          file: pdfFile,
          title,
          source,
          summaryLine: summaryLine.trim() || "PDF 업로드 후 페이지별 텍스트를 추출한 문서",
          publishedAt,
          topicId,
          waveId,
        });
        setTitle("");
        setSource("");
        setSummaryLine("");
        setPublishedAt("");
        setTopicId("");
        setWaveId("");
        setPdfFile(null);
      } finally {
        setUploading(false);
      }
      return;
    }

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
    });

    setTitle("");
    setSource("");
    setDocumentType("report");
    setSummaryLine("");
    setRawText("");
    setPublishedAt("");
    setTopicId("");
    setWaveId("");
  }

  return (
    <div className="rounded-[28px] border border-border bg-panel p-5 shadow-card">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">새 문서 추가</p>
        <p className="mt-1 text-sm text-muted-foreground">
          텍스트를 직접 붙여 넣거나 PDF를 업로드할 수 있습니다. PDF는 페이지 단위로 추출되어 이후 evidence와
          topic draft에서 원문 페이지를 계속 따라갈 수 있습니다.
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

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_320px]">
        <Input
          value={summaryLine}
          onChange={(event) => setSummaryLine(event.target.value)}
          placeholder="한 줄 요약"
        />
        <label className="flex h-11 items-center rounded-2xl border border-dashed border-border bg-white px-4 text-sm text-muted-foreground">
          <span className="truncate">{pdfFile?.name || "PDF 업로드"}</span>
          <input
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="mt-3 space-y-3">
        <Textarea
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder="PDF가 없으면 분석할 본문 텍스트를 붙여 넣으세요"
          className="min-h-48"
          disabled={Boolean(pdfFile)}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={() => void handleSubmit()} disabled={uploading}>
          {uploading ? "PDF 추출 중..." : pdfFile ? "PDF 업로드" : "큐에 추가"}
        </Button>
      </div>
    </div>
  );
}
