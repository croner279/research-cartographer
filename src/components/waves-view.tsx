"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SearchFilterBar } from "@/components/search-filter-bar";
import { SectionCard } from "@/components/section-card";
import { SectionHeader } from "@/components/section-header";
import { StageBadge } from "@/components/stage-badge";
import { useWorkspace } from "@/components/workspace-provider";
import type { Wave, WaveStage } from "@/lib/types";

const stageOrder: WaveStage[] = [
  "accelerating",
  "early",
  "crowded",
  "uncertain",
  "restructuring",
];

const spotlightStageOrder: WaveStage[] = ["accelerating", "early", "crowded", "uncertain", "restructuring"];

const stageDescriptions: Record<WaveStage, string> = {
  accelerating: "반복 언급과 해석이 동시에 강해지는 흐름",
  early: "초기 구조는 보이지만 아직 검증이 덜 된 흐름",
  crowded: "시장 해석이 몰리기 시작한 흐름",
  uncertain: "방향성은 있지만 확신이 낮은 흐름",
  restructuring: "기존 서사가 깨지고 재편되는 흐름",
};

const stageWeights: Record<WaveStage, number> = {
  accelerating: 5,
  early: 4,
  crowded: 3,
  uncertain: 2,
  restructuring: 2,
};

function getAutoPriorityScore(wave: Wave) {
  return (
    wave.evidenceIds.length * 4 +
    wave.keyBottlenecks.length * 2 +
    wave.valueCaptureLayers.length +
    wave.companyIds.length +
    stageWeights[wave.stage]
  );
}

function sortByPriority(a: Wave, b: Wave) {
  const manualA = a.priority ?? Number.POSITIVE_INFINITY;
  const manualB = b.priority ?? Number.POSITIVE_INFINITY;

  if (manualA !== manualB) {
    return manualA - manualB;
  }

  return getAutoPriorityScore(b) - getAutoPriorityScore(a);
}

function pickSpotlightWaves(waves: Wave[]) {
  const manual = [...waves]
    .filter((wave) => wave.priority !== undefined)
    .sort(sortByPriority)
    .slice(0, 3);

  const manualIds = new Set(manual.map((wave) => wave.id));
  const remaining = waves.filter((wave) => !manualIds.has(wave.id));
  const picked = [...manual];

  for (const stage of spotlightStageOrder) {
    if (picked.length >= 3) break;

    const candidate = [...remaining]
      .filter((wave) => wave.stage === stage && !picked.some((item) => item.id === wave.id))
      .sort((a, b) => getAutoPriorityScore(b) - getAutoPriorityScore(a))[0];

    if (candidate) {
      picked.push(candidate);
    }
  }

  if (picked.length < 3) {
    const fallback = [...remaining]
      .filter((wave) => !picked.some((item) => item.id === wave.id))
      .sort((a, b) => getAutoPriorityScore(b) - getAutoPriorityScore(a))
      .slice(0, 3 - picked.length);

    picked.push(...fallback);
  }

  return picked.slice(0, 3);
}

export function WavesView() {
  const { dashboard } = useWorkspace();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState("stage");

  const filteredWaves = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const base = dashboard.waves.filter((wave) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          wave.title,
          wave.thesis,
          wave.latestInterpretation,
          ...wave.keyBottlenecks,
          ...wave.valueCaptureLayers,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStage = stage === "all" || wave.stage === stage;
      return matchesQuery && matchesStage;
    });

    return [...base].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "priority") return sortByPriority(a, b);
      if (sort === "evidence") return b.evidenceIds.length - a.evidenceIds.length;
      return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
    });
  }, [dashboard.waves, query, stage, sort]);

  const groupedWaves = useMemo(
    () =>
      stageOrder.map((stageKey) => ({
        stage: stageKey,
        items: filteredWaves.filter((wave) => wave.stage === stageKey),
      })),
    [filteredWaves],
  );

  const spotlightWaves = useMemo(() => pickSpotlightWaves(filteredWaves), [filteredWaves]);

  const totalBottlenecks = filteredWaves.reduce((sum, wave) => sum + wave.keyBottlenecks.length, 0);
  const totalLayers = filteredWaves.reduce((sum, wave) => sum + wave.valueCaptureLayers.length, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Wave Board"
        title="Wave Overview"
        description="수동 우선순위가 있으면 먼저 반영하고, 없으면 stage를 섞어 상단 3개를 자동 선정합니다."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total Waves</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{filteredWaves.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">현재 추적 중인 큰 흐름 수</p>
        </div>
        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Bottlenecks</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{totalBottlenecks}</p>
          <p className="mt-2 text-sm text-muted-foreground">페이지 전체 병목 포인트 수</p>
        </div>
        <div className="rounded-[24px] border border-border bg-white p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Value Layers</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{totalLayers}</p>
          <p className="mt-2 text-sm text-muted-foreground">현재 관찰 중인 가치 포착 레이어 수</p>
        </div>
      </div>

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="wave, thesis, bottleneck, layer 검색"
        secondary={
          <div className="flex gap-2">
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="all">모든 stage</option>
              <option value="early">초기 포착</option>
              <option value="accelerating">가속 중</option>
              <option value="crowded">과열 구간</option>
              <option value="uncertain">불확실</option>
              <option value="restructuring">재편 중</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="stage">stage순</option>
              <option value="priority">우선순위순</option>
              <option value="evidence">evidence 많은 순</option>
              <option value="title">이름순</option>
            </select>
          </div>
        }
      />

      <SectionCard title="지금 먼저 볼 Wave">
        <div className="grid gap-4 xl:grid-cols-3">
          {spotlightWaves.map((wave, index) => (
            <Link
              key={wave.id}
              href={`/waves/${wave.slug}`}
              className="rounded-[24px] border border-border bg-white p-5 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Priority {wave.priority ?? index + 1}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{wave.title}</p>
                </div>
                <StageBadge value={wave.stage} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{wave.thesis}</p>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                {wave.latestInterpretation}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span>병목 {wave.keyBottlenecks.length}개</span>
                <span>레이어 {wave.valueCaptureLayers.length}개</span>
                <span>evidence {wave.evidenceIds.length}개</span>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          `priority`가 있는 wave는 먼저 고정하고, 남는 자리는 stage 혼합 규칙과 evidence 기반 점수로 채웁니다.
        </p>
      </SectionCard>

      <div className="space-y-5">
        {groupedWaves.map(({ stage, items }) => (
          <section key={stage} className="rounded-[28px] border border-border bg-panel p-5 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <StageBadge value={stage} />
                  <p className="text-sm font-medium text-foreground">{items.length}개 wave</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stageDescriptions[stage]}</p>
              </div>
            </div>

            {items.length ? (
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[980px] overflow-hidden rounded-[20px] border border-border bg-white">
                  <div className="grid grid-cols-[1.2fr_1.6fr_0.8fr_1fr_0.9fr] gap-4 border-b border-border px-5 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Wave</span>
                    <span>현재 해석</span>
                    <span>병목</span>
                    <span>Value Layer</span>
                    <span>Evidence</span>
                  </div>
                  {items.map((wave) => (
                    <Link
                      key={wave.id}
                      href={`/waves/${wave.slug}`}
                      className="grid grid-cols-[1.2fr_1.6fr_0.8fr_1fr_0.9fr] gap-4 border-b border-border px-5 py-4 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{wave.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{wave.thesis}</p>
                      </div>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {wave.latestInterpretation}
                      </p>
                      <div>
                        <p className="text-sm font-medium text-foreground">{wave.keyBottlenecks.length}개</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {wave.keyBottlenecks.slice(0, 2).join(", ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap content-start gap-2">
                        {wave.valueCaptureLayers.slice(0, 3).map((layer) => (
                          <span
                            key={layer}
                            className="rounded-full border border-border bg-slate-50 px-2 py-1 text-xs text-muted-foreground"
                          >
                            {layer}
                          </span>
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{wave.evidenceIds.length}개</p>
                        <p className="mt-1 text-sm text-muted-foreground">detail 보기</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">이 stage에는 현재 표시할 wave가 없습니다.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
