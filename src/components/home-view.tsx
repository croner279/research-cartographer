"use client";

import { useMemo, useState } from "react";

import { DashboardGrid } from "@/components/dashboard-grid";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { useWorkspace } from "@/components/workspace-provider";

export function HomeView() {
  const { dashboard } = useWorkspace();
  const [query, setQuery] = useState("");
  const [reviewStatus, setReviewStatus] = useState("all");
  const [sort, setSort] = useState("mentions");

  const filteredDashboard = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const topics = [...dashboard.topics]
      .filter((topic) => {
        const matchesQuery =
          !normalizedQuery ||
          [topic.name, topic.oneLiner, topic.whyNow, topic.whyItMatters, ...topic.openQuestions]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesReview = reviewStatus === "all" || topic.reviewStatus === reviewStatus;
        return matchesQuery && matchesReview;
      })
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "evidence") return b.evidenceIds.length - a.evidenceIds.length;
        return b.recentMentions - a.recentMentions;
      });

    const visibleTopicIds = new Set(topics.map((topic) => topic.id));
    const waves = dashboard.waves.filter((wave) => {
      const topicMatches = dashboard.topics.some(
        (topic) => topic.parentWaveId === wave.id && visibleTopicIds.has(topic.id),
      );
      const waveMatches =
        !normalizedQuery ||
        [wave.title, wave.thesis, wave.latestInterpretation].join(" ").toLowerCase().includes(normalizedQuery);
      return topicMatches || waveMatches;
    });

    const questions = dashboard.questions.filter((question) => {
      const text = [question.title, question.description].join(" ").toLowerCase();
      return !normalizedQuery || text.includes(normalizedQuery);
    });

    return {
      ...dashboard,
      topics,
      waves,
      questions,
    };
  }, [dashboard, query, reviewStatus, sort]);

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-border bg-panel px-8 py-8 shadow-card">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            개인 리서치 구조 맵
          </div>
          <p className="max-w-3xl text-lg font-semibold leading-8 text-foreground">
            반복되는 신호를 모으고 더 큰 Wave로 연결하는 개인 투자 리서치 워크스페이스
          </p>
        </div>
      </section>

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="topic, wave, 질문에서 키워드 검색"
        secondary={
          <div className="flex gap-2">
            <select
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="all">모든 topic 상태</option>
              <option value="draft">초안</option>
              <option value="active">활성</option>
              <option value="dismissed">보류</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="mentions">반복 언급순</option>
              <option value="evidence">evidence 많은 순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        }
      />

      <DashboardGrid dashboard={filteredDashboard} />
    </div>
  );
}
