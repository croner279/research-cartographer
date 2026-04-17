import type { WaveStage } from "@/lib/types";

const styles: Record<WaveStage, string> = {
  early: "bg-sky-50 text-sky-700",
  accelerating: "bg-emerald-50 text-emerald-700",
  crowded: "bg-amber-50 text-amber-700",
  uncertain: "bg-slate-100 text-slate-700",
  restructuring: "bg-violet-50 text-violet-700",
};

const labels: Record<WaveStage, string> = {
  early: "초기",
  accelerating: "가속",
  crowded: "과열",
  uncertain: "불확실",
  restructuring: "재편",
};

export function StageBadge({ value }: { value: WaveStage }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[value]}`}>{labels[value]}</span>;
}
