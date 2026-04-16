"use client";

import { useMemo, useState } from "react";

import { QuestionIntakeForm } from "@/components/question-intake-form";
import { QuestionCard } from "@/components/question-card";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { SectionHeader } from "@/components/section-header";
import { useWorkspace } from "@/components/workspace-provider";

export function QuestionsView() {
  const { dashboard } = useWorkspace();
  const [query, setQuery] = useState("");
  const [waveId, setWaveId] = useState("all");
  const [sort, setSort] = useState("updated");

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const base = dashboard.questions.filter((question) => {
      const matchesQuery =
        !normalizedQuery ||
        [question.title, question.description, ...question.supportingEvidence, ...question.opposingEvidence]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesWave = waveId === "all" || question.waveId === waveId;
      return matchesQuery && matchesWave;
    });

    return [...base].sort((a, b) => {
      if (sort === "confidence") return b.confidence - a.confidence;
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }, [dashboard.questions, query, waveId, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Question Board"
        title="열린 질문"
        description="높은 수준의 research question을 evidence 기반으로 업데이트합니다."
      />
      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="질문, 설명, evidence 키워드 검색"
        secondary={
          <div className="flex gap-2">
            <select
              value={waveId}
              onChange={(event) => setWaveId(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="all">모든 wave</option>
              {dashboard.waves.map((wave) => (
                <option key={wave.id} value={wave.id}>
                  {wave.title}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="updated">최근 업데이트순</option>
              <option value="confidence">신뢰도순</option>
            </select>
          </div>
        }
      />
      <QuestionIntakeForm />
      <div className="grid gap-5 xl:grid-cols-2">
        {filteredQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} expanded />
        ))}
      </div>
    </div>
  );
}
