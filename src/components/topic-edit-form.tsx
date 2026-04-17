"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";
import type { EmergingTopic } from "@/lib/types";

export function TopicEditForm({ topic }: { topic: EmergingTopic }) {
  const { dashboard, updateTopic } = useWorkspace();
  const [name, setName] = useState(topic.name);
  const [oneLiner, setOneLiner] = useState(topic.oneLiner);
  const [whyNow, setWhyNow] = useState(topic.whyNow);
  const [whyItMatters, setWhyItMatters] = useState(topic.whyItMatters);
  const [parentWaveId, setParentWaveId] = useState(topic.parentWaveId);
  const [openQuestions, setOpenQuestions] = useState(topic.openQuestions.join("\n"));

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-sm font-medium text-foreground">Topic 편집</p>
      <div className="mt-3 space-y-3">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름" />
        <Input
          value={oneLiner}
          onChange={(event) => setOneLiner(event.target.value)}
          placeholder="한 줄 설명"
        />
        <Textarea
          value={whyNow}
          onChange={(event) => setWhyNow(event.target.value)}
          placeholder="왜 지금 보이는가"
          className="min-h-24"
        />
        <Textarea
          value={whyItMatters}
          onChange={(event) => setWhyItMatters(event.target.value)}
          placeholder="왜 중요한가"
          className="min-h-24"
        />
        <Textarea
          value={openQuestions}
          onChange={(event) => setOpenQuestions(event.target.value)}
          placeholder="열린 질문을 한 줄씩 입력"
          className="min-h-24"
        />
        <select
          value={parentWaveId}
          onChange={(event) => setParentWaveId(event.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none"
        >
          <option value="">상위 Wave 선택</option>
          {dashboard.waves.map((wave) => (
            <option key={wave.id} value={wave.id}>
              {wave.title}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() =>
            updateTopic(topic.id, {
              name,
              oneLiner,
              whyNow,
              whyItMatters,
              parentWaveId,
              openQuestions: openQuestions
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
        >
          Topic 저장
        </Button>
      </div>
    </div>
  );
}
