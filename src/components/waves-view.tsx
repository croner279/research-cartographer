"use client";

import { useMemo, useState } from "react";

import { SearchFilterBar } from "@/components/search-filter-bar";
import { SectionHeader } from "@/components/section-header";
import { WaveCard } from "@/components/wave-card";
import { useWorkspace } from "@/components/workspace-provider";

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
        [wave.title, wave.thesis, wave.latestInterpretation, ...wave.keyBottlenecks, ...wave.valueCaptureLayers]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStage = stage === "all" || wave.stage === stage;
      return matchesQuery && matchesStage;
    });

    return [...base].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return a.stage.localeCompare(b.stage);
    });
  }, [dashboard.waves, query, stage, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Wave Board"
        title="활성 Wave"
        description="여러 섹터에 걸친 큰 흐름을 stage, bottleneck, value capture layer 중심으로 추적합니다."
      />
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
              <option value="early">early</option>
              <option value="accelerating">accelerating</option>
              <option value="crowded">crowded</option>
              <option value="uncertain">uncertain</option>
              <option value="restructuring">restructuring</option>
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm outline-none"
            >
              <option value="stage">stage순</option>
              <option value="title">제목순</option>
            </select>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {filteredWaves.map((wave) => (
          <WaveCard key={wave.id} wave={wave} expanded />
        ))}
      </div>
    </div>
  );
}
