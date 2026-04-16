import type { TopicMaturity } from "@/lib/types";

const styles: Record<TopicMaturity, string> = {
  unknown: "bg-slate-100 text-slate-700",
  interesting: "bg-amber-50 text-amber-700",
  emerging: "bg-sky-50 text-sky-700",
  promoted: "bg-emerald-50 text-emerald-700",
};

export function StatusBadge({
  value,
  kind,
}: {
  value: TopicMaturity;
  kind: "topic";
}) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[value]}`}>
      {kind === "topic" ? value : value}
    </span>
  );
}
