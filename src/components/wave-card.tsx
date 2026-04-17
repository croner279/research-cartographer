import Link from "next/link";

import { StageBadge } from "@/components/stage-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Wave } from "@/lib/types";

export function WaveCard({ wave, expanded = false }: { wave: Wave; expanded?: boolean }) {
  return (
    <Card className="border-border bg-panel shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-xl">
              <Link href={`/waves/${wave.slug}`}>{wave.title}</Link>
            </CardTitle>
            <p className="text-sm leading-7 text-muted-foreground">{wave.thesis}</p>
          </div>
          <StageBadge value={wave.stage} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">핵심 병목</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {wave.keyBottlenecks.slice(0, expanded ? wave.keyBottlenecks.length : 2).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">가치 포착 레이어</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {wave.valueCaptureLayers.map((layer) => (
              <span
                key={layer}
                className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground"
              >
                {layer}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
