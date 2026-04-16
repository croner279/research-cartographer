"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";

export function QuestionIntakeForm() {
  const { addQuestion, dashboard } = useWorkspace();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [waveId, setWaveId] = useState("");
  const [confidence, setConfidence] = useState("50");

  function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      return;
    }

    addQuestion({
      title,
      description,
      waveId,
      confidence: Number(confidence),
    });

    setTitle("");
    setDescription("");
    setWaveId("");
    setConfidence("50");
  }

  return (
    <div className="rounded-[28px] border border-border bg-panel p-5 shadow-card">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">새 질문 추가</p>
        <p className="mt-1 text-sm text-muted-foreground">
          구조가 아직 선명하지 않을수록 질문을 먼저 고정해 두는 편이 좋습니다.
        </p>
      </div>

      <div className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="질문 제목" />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="질문 설명"
          className="min-h-24"
        />
        <div className="grid gap-3 xl:grid-cols-[1fr_180px]">
          <select
            value={waveId}
            onChange={(e) => setWaveId(e.target.value)}
            className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
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
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit}>질문 추가</Button>
      </div>
    </div>
  );
}
