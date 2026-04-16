"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/components/workspace-provider";

export function TopicIntakeForm() {
  const { addTopic, dashboard } = useWorkspace();
  const [name, setName] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [parentWaveId, setParentWaveId] = useState("");

  function handleSubmit() {
    if (!name.trim() || !oneLiner.trim() || !whyNow.trim() || !whyItMatters.trim()) {
      return;
    }

    addTopic({
      name,
      oneLiner,
      whyNow,
      whyItMatters,
      parentWaveId,
    });

    setName("");
    setOneLiner("");
    setWhyNow("");
    setWhyItMatters("");
    setParentWaveId("");
  }

  return (
    <div className="rounded-[28px] border border-border bg-panel p-5 shadow-card">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">새 Emerging Topic 추가</p>
        <p className="mt-1 text-sm text-muted-foreground">
          아직 구조가 불분명한 개념이라도 먼저 draft로 올려두고 나중에 증거를 붙입니다.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="토픽 이름" />
        <Input
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value)}
          placeholder="한 줄 설명"
        />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_280px]">
        <Textarea
          value={whyNow}
          onChange={(e) => setWhyNow(e.target.value)}
          placeholder="왜 지금 보이는가"
          className="min-h-24"
        />
        <select
          value={parentWaveId}
          onChange={(e) => setParentWaveId(e.target.value)}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
        >
          <option value="">상위 wave 미정</option>
          {dashboard.waves.map((wave) => (
            <option key={wave.id} value={wave.id}>
              {wave.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3">
        <Textarea
          value={whyItMatters}
          onChange={(e) => setWhyItMatters(e.target.value)}
          placeholder="왜 중요한가"
          className="min-h-24"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit}>Topic 추가</Button>
      </div>
    </div>
  );
}
