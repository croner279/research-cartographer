import type { EvidenceWhyTag } from "@/lib/types";

export function TagBadge({ value }: { value: EvidenceWhyTag }) {
  return (
    <span className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground">
      {value}
    </span>
  );
}
