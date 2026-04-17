"use client";

import { useMemo, useState } from "react";

import { SearchFilterBar } from "@/components/search-filter-bar";
import { SectionHeader } from "@/components/section-header";
import { TopicCard } from "@/components/topic-card";
import { TopicIntakeForm } from "@/components/topic-intake-form";
import { useWorkspace } from "@/components/workspace-provider";

export function TopicsView() {
  const { dashboard } = useWorkspace();
  const [query, setQuery] = useState("");
  const [reviewStatus, setReviewStatus] = useState("all");
  const [sort, setSort] = useState("mentions");

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = dashboard.topics.filter((topic) => {
      const matchesQuery =
        !normalizedQuery ||
        [topic.name, topic.oneLiner, topic.whyNow, topic.whyItMatters, ...topic.openQuestions]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesReview = reviewStatus === "all" || topic.reviewStatus === reviewStatus;
      return matchesQuery && matchesReview;
    });

    return [...base].sort((a, b) => {
      if (sort === "recent") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "evidence") return b.evidenceIds.length - a.evidenceIds.length;
      return b.recentMentions - a.recentMentions;
    });
  }, [dashboard.topics, query, reviewStatus, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Topic Drafts"
        title="자동 생성 Topic Draft"
        description="반복적으로 등장한 개념만 초안으로 올리고, 사람이 검토한 뒤 활성 topic이나 Wave로 승격합니다."
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="topic 이름, 설명, 열린 질문 검색"
        secondary={
          <div className="flex gap-2">
            <select
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="all">모든 상태</option>
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
              <option value="recent">최근 생성순</option>
            </select>
          </div>
        }
      />

      <TopicIntakeForm />

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
