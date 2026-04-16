"use client";

import { MissedReviewCard } from "@/components/missed-review-card";
import { SectionHeader } from "@/components/section-header";
import { useWorkspace } from "@/components/workspace-provider";

export function MissedWinnersView() {
  const { dashboard } = useWorkspace();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Missed Winners Lab"
        title="놓친 승자 복기"
        description="비난이 아니라 학습용 워크벤치. 초기 단서, 놓친 이유, 다음 체크포인트를 정리합니다."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {dashboard.missedReviews.map((review) => (
          <MissedReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
