"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DashboardGrid } from "@/components/dashboard-grid";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { TopicIntakeForm } from "@/components/topic-intake-form";
import { useWorkspace } from "@/components/workspace-provider";

export function HomeView() {
  const { dashboard } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("mentions");

  const filteredDashboard = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const topics = [...dashboard.topics]
      .filter((topic) => {
        const matchesQuery =
          !normalizedQuery ||
          [topic.name, topic.oneLiner, topic.whyNow, topic.whyItMatters]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesStatus = status === "all" || topic.maturityStatus === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "documents") return b.linkedDocumentsCount - a.linkedDocumentsCount;
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
  }, [dashboard, query, status, sort]);

  return (
    <div className="space-y-8">
      <section className="flex items-end justify-between gap-6 rounded-[28px] border border-border bg-panel px-8 py-8 shadow-card">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            개인 리서치 구조 탐지 스튜디오
          </div>
          <div className="space-y-3">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground">
              많이 읽는 상태에서 벗어나, 새로운 산업 구조를 더 일찍 감지하고 맵으로 만들기.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              Research Cartographer는 unfamiliar but recurring 개념을 포착하고, 증거를
              묶고, 상위 wave로 연결해 주는 개인용 투자 리서치 OS입니다.
            </p>
          </div>
        </div>
        <div className="hidden min-w-72 rounded-[24px] border border-border bg-white p-5 lg:block">
          <p className="text-sm font-medium text-foreground">오늘의 리서치 포커스</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Optical Interconnect의 반복 등장 맥락 확인</li>
            <li>• Memory Recovery와 AI infra capex 연결 재검토</li>
            <li>• Synthetic Biology의 foundry layer를 별도 wave로 볼지 점검</li>
          </ul>
          <Link
            href="/evidence"
            className="mt-5 inline-flex rounded-full bg-foreground px-4 py-2 text-sm font-medium text-white"
          >
            증거 워크스페이스 열기
          </Link>
        </div>
      </section>

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="토픽, wave, 질문에서 키워드 검색"
        secondary={
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="all">모든 상태</option>
              <option value="unknown">unknown</option>
              <option value="interesting">interesting</option>
              <option value="emerging">emerging</option>
              <option value="promoted">promoted</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="mentions">언급순</option>
              <option value="documents">문서 연결순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        }
      />

      <DashboardGrid dashboard={filteredDashboard} />
      <TopicIntakeForm />
    </div>
  );
}
