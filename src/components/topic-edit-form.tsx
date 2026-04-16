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

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-sm font-medium text-foreground">topic 편집</p>
      <div className="mt-3 space-y-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
        <Input
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value)}
          placeholder="한 줄 설명"
        />
        <Textarea
          value={whyNow}
          onChange={(e) => setWhyNow(e.target.value)}
          placeholder="왜 지금 보이는가"
          className="min-h-20"
        />
        <Textarea
          value={whyItMatters}
          onChange={(e) => setWhyItMatters(e.target.value)}
          placeholder="왜 중요한가"
          className="min-h-20"
        />
        <select
          value={parentWaveId}
          onChange={(e) => setParentWaveId(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none"
        >
          <option value="">상위 wave 미정</option>
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
            })
          }
        >
          topic 저장
        </Button>
      </div>
    </div>
  );
}
