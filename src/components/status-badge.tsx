import { topicReviewLabels, topicStatusLabels } from "@/lib/sample-data";
import type { TopicMaturity, TopicReviewStatus } from "@/lib/types";

const maturityStyles: Record<TopicMaturity, string> = {
  unknown: "bg-slate-100 text-slate-700",
  interesting: "bg-amber-50 text-amber-700",
  emerging: "bg-sky-50 text-sky-700",
  promoted: "bg-emerald-50 text-emerald-700",
};

const reviewStyles: Record<TopicReviewStatus, string> = {
  draft: "bg-violet-50 text-violet-700",
  active: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-slate-100 text-slate-700",
};

export function StatusBadge({
  value,
  kind,
}: {
  value: TopicMaturity | TopicReviewStatus;
  kind: "topic" | "review";
}) {
  const className = kind === "topic" ? maturityStyles[value as TopicMaturity] : reviewStyles[value as TopicReviewStatus];
  const label = kind === "topic" ? topicStatusLabels[value as TopicMaturity] : topicReviewLabels[value as TopicReviewStatus];

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{label}</span>;
}
