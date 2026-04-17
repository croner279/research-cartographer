"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/components/workspace-provider";

export function TopicEvidenceLinker({
  topicId,
  linkedEvidenceIds,
}: {
  topicId: string;
  linkedEvidenceIds: string[];
}) {
  const { dashboard, attachEvidenceToTopic } = useWorkspace();
  const availableEvidence = useMemo(
    () =>
      dashboard.evidenceItems.filter(
        (item) => item.reviewStatus === "approved" && !linkedEvidenceIds.includes(item.id),
      ),
    [dashboard.evidenceItems, linkedEvidenceIds],
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState("");

  function handleAttach() {
    if (!selectedEvidenceId) return;
    attachEvidenceToTopic(topicId, selectedEvidenceId);
    setSelectedEvidenceId("");
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-sm font-medium text-foreground">승인된 evidence 연결</p>
      <div className="mt-3 flex gap-3">
        <select
          value={selectedEvidenceId}
          onChange={(event) => setSelectedEvidenceId(event.target.value)}
          className="h-10 flex-1 rounded-xl border border-border bg-white px-3 text-sm outline-none"
        >
          <option value="">연결할 evidence 선택</option>
          {availableEvidence.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={handleAttach} disabled={!selectedEvidenceId}>
          연결
        </Button>
      </div>
    </div>
  );
}
