"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";
import type { Question } from "@/lib/types";

export function QuestionEditForm({ question }: { question: Question }) {
  const { dashboard, updateQuestion } = useWorkspace();
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description);
  const [waveId, setWaveId] = useState(question.waveId);
  const [confidence, setConfidence] = useState(String(question.confidence));

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-sm font-medium text-foreground">질문 편집</p>
      <div className="mt-3 space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="질문 제목" />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="질문 설명"
          className="min-h-20"
        />
        <div className="grid gap-3 xl:grid-cols-[1fr_140px]">
          <select
            value={waveId}
            onChange={(e) => setWaveId(e.target.value)}
            className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none"
          >
            <option value="">연결 wave 미정</option>
            {dashboard.waves.map((wave) => (
              <option key={wave.id} value={wave.id}>
                {wave.title}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={0}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            placeholder="신뢰도"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            updateQuestion(question.id, {
              title,
              description,
              waveId,
              confidence: Number(confidence),
            })
          }
        >
          질문 저장
        </Button>
      </div>
    </div>
  );
}
