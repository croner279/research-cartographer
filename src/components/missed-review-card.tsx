import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MissedReview } from "@/lib/types";

export function MissedReviewCard({ review }: { review: MissedReview }) {
  return (
    <Card className="border-border bg-panel">
      <CardHeader>
        <CardTitle>{review.themeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">달린 winner</p>
          <p className="mt-2 leading-7">{review.winnerNames.join(", ")}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">초기 단서</p>
          <p className="mt-2 leading-7">{review.earlyClues}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">놓친 이유</p>
          <p className="mt-2 leading-7">{review.whyMissed}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">다음에 볼 것</p>
          <p className="mt-2 leading-7">{review.watchNextTime}</p>
        </div>
      </CardContent>
    </Card>
  );
}
