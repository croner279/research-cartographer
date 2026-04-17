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
  const [openQuestions, setOpenQuestions] = useState("");
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
      openQuestions: openQuestions
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });

    setName("");
    setOneLiner("");
    setWhyNow("");
    setWhyItMatters("");
    setOpenQuestions("");
    setParentWaveId("");
  }

  return (
    <div className="rounded-[28px] border border-border bg-panel p-5 shadow-card">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">수동 Topic 추가</p>
        <p className="mt-1 text-sm text-muted-foreground">
          자동 draft가 부족할 때 직접 topic을 만들고 이후 evidence를 붙일 수 있습니다.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="topic 이름" />
        <Input
          value={oneLiner}
          onChange={(event) => setOneLiner(event.target.value)}
          placeholder="한 줄 설명"
        />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_280px]">
        <Textarea
          value={whyNow}
          onChange={(event) => setWhyNow(event.target.value)}
          placeholder="왜 지금 보이는가"
          className="min-h-24"
        />
        <select
          value={parentWaveId}
          onChange={(event) => setParentWaveId(event.target.value)}
          className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
        >
          <option value="">상위 Wave 선택</option>
          {dashboard.waves.map((wave) => (
            <option key={wave.id} value={wave.id}>
              {wave.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
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
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit}>Topic 추가</Button>
      </div>
    </div>
  );
}
